const fs = require('fs');
const path = require('path');
const mime = require('mime');
const child_process = require('child_process');
const express = require('express');
const multer = require('multer');
const story = require('storyboard');
const lodash = require('lodash');
const crypto = require('crypto');

const env = require('../configs/').env.parsed;
const router = express.Router();

const _ = lodash;
const storyboard = story.mainStory;

const ConvertController = require('../services/core/ConvertService').getInstance();
const FileExpirationScheduler = require('../services/schedules/FileExpiration/');
const PDFInfo = require('../core/DocumentConverter').PDFInfo;

const acceptExtensions = [ 'png', 'svg', 'jpeg', 'tiff' ];


const createLimitedStorage = function createLimitedStorage(folder, filename = null) {
  return multer.diskStorage({
    destination: function (req, file, callback) {
      if (typeof folder == 'function') {
        const cb = folder;
        const cbfolder = cb(file);
        callback(null, cbfolder);
      }
      else
        callback(null, folder)
    },
    filename: function (req, file, callback) {
      if (typeof filename == 'function') {
        const cb = filename;
        const cbfilename = cb(file);
        callback(null, cbfilename)
      }
      else {
        callback(null, filename || file.originalname);
      }
    },
    limits: {
      fileSize: 1024 * 1024 * 50
    },
    fileFilter: function acceptPDFDocumentOnly(req, file, callback) {
      if (['application/pdf', 'application/x-pdf'].includes(file.mimetype)) {
        callback(null, true);
      }
      else {
        callback(null, false);
      }
    }
  });
}

const createPremiumStorage = function createPremiumStorage(folder, filename = null) {
  return multer.diskStorage({
    destination: function (req, file, callback) {
      if (typeof folder == 'function') {
        const cb = folder;
        const cbfolder = cb(file);
        callback(null, cbfolder);
      }
      else
        callback(null, folder)
    },
    filename: function (req, file, callback) {
      if (typeof filename == 'function') {
        const cb = filename;
        const cbfilename = cb(file);
        callback(null, cbfilename)
      }
      else {
        callback(null, filename || file.originalname);
      }
    },
    fileFilter: function acceptPDFDocumentOnly(req, file, callback) {
      if (['application/pdf', 'application/x-pdf'].includes(file.mimetype)) {
        callback(null, true);
      }
      else {
        callback(null, false);
      }
    }
  });
}


const responseErrorToClient = function responseErrorToClient(error, code, message) {
  const err = new error(message);

  return {
    error: {
      name: err.name,
      code: code,
      message: err.message,
    }
  }
}


// Homepage
router.get('/', (req, res, next) => res.render('index'));

// Convert endpoint. Deployed on the homepage only. 
router.post('/convert', function handleSingleFileUpload(req, res, next) {
  const date = Date.now();
  const upload = '../../front-end/public/upload'
  const download = '../../front-end/public/download/'

  const storage = createLimitedStorage(function setStorageFolder(file) {
    const hash = crypto.createHash('sha1')
      .update(date.toString().concat(file.originalname), 'binary')
      .digest('hex');
    const dest = path.resolve(upload, hash);

    if (!fs.existsSync(dest))
      fs.mkdirSync(dest);

    return dest;
  }, function changeFileName(file) {
    const mimetype = file.mimetype;
    const extension = mime.getExtension(mimetype);
    return `file.${extension}`;
  });

  const freemium = multer({ storage });

  freemium.any('pdf').call(null, req, res, function(err) {
    if (err instanceof multer.MulterError) {
      storyboard.error('An error occurred from Multer', { attach: err });
    }
    else if (err) {
      storyboard.error('An uncaught error occurred', { attach: err });
    }

    const file = _.clone(req.files).pop();
    const hash = path.basename(file.destination);

    const _in = file.path;
    const _out = path.resolve(download, hash);

    if (!PDFInfo.isPDF(_in)) {
      res.json(responseErrorToClient(Error, 500, 'Not a valid PDF file.'));
      fs.rmdirSync(path.dirname(_in), { recursive: true });
      return;
    }

    const originalname = file.originalname;
    const mimetype = file.mimetype;
    // const size = req.files.size;
    
    console.log(`Getting file: "${originalname}"`)

    if (!fs.existsSync(_out)) {
      fs.mkdirSync(_out);
    }
    
    const options = typeof req.body.options == 'object' 
      ? JSON.parse(req.body.options) 
      : null;

    const outputExtension = acceptExtensions.includes(req.body.outputExtension) 
      ? req.body.outputExtension 
      : 'png';

    const callback = function sendConvertedFileToClient(fulfilled) {
      const cacheFolder = path.resolve(_out, '.cache'); // ${env.ENTRY_ROOT}/public/download/${hash}/.cache

      if (!fs.existsSync(cacheFolder)) {
        res.json(responseErrorToClient(Error, 500, 'Convert failed'));
        fs.rmdirSync(path.dirname(_in), { recursive: true });
        return;
      }
      else {
        const name = `${path.parse(originalname).name}.zip`;
        const zipfile = path.resolve(_out, name);
        process.chdir(cacheFolder);
        // process.stdout.write(process.cwd());
        console.log(`CHDIR: ${cacheFolder}.`);

        return new Promise(resolve => {
          const proc = child_process.spawn(`zip "${zipfile}" ./\*.${outputExtension}`, { shell: true })
            .on('spawn', function () {
              console.log(`\nZipping file ${zipfile}`);
              proc.stdout.pipe(process.stdout);
            })
            .on('error', function (error) {
              fs.rmdirSync(cacheFolder, { recursive: true });
              fs.rmdirSync(path.dirname(_in), { recursive: true });
              console.log(`RMDIR: ${cacheFolder}`);
              console.log(`RMDIR: ${path.dirname(_in)}`);
              console.error(error);
            })
            .on('exit', function() {
              fs.rmdirSync(cacheFolder, { recursive: true });
              fs.rmdirSync(path.dirname(_in), { recursive: true });
              console.log(`RMDIR: ${cacheFolder}`);
              console.log(`RMDIR: ${path.dirname(_in)}`);
              const public = path.resolve(__dirname, '..', 'public');
              const link = '/' + path.relative(public, zipfile);
              const filesize = fs.existsSync(zipfile) ? fs.statSync(zipfile).size : 0;
              const response = JSON.stringify({ link, name, filesize })

              // Automatically delete converted files after 1 day
              FileExpirationScheduler.add(_out, new Date, FileExpirationScheduler.period.ONE_DAY);
              res.send(response);
              resolve(fulfilled);
            });
        })
      }
    }

    ConvertController.convert(_in, _out, {
      callback,
      options,
      outputExtension,
    })
  })
})


module.exports = router;
