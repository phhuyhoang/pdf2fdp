const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const c_rule = require('../constants/rule.constants');
const c_static = require('../constants/static.constants');
const c_common = require('../constants/common.constants')
const syslib = require('../helpers/SysLib.helper');
const LimitedStorage = require('../services/storage/LimitedStorage.service');
const ConversionService = require('../services/core/ConversionService.service');
const CompressionService = require('../services/core/CompressionService.service');
const ScheduleServiceProvider = require('../services/schedules/ScheduleServiceProvider.service');
const PDFInfo = require('../core/DocumentConverter').PDFInfo;


class UserController {

  static async doSingleFileConvert(request, response, next) {
    const storage = new LimitedStorage();

    storage.any('pdf').call(null, request, response, async function requestUploadHandler(error) {
      error instanceof multer.MulterError 
        ? console.log('An error occurred from Multer during current upload session')
        : console.log('An uncaught error occurred during current upload session');

      const file = _.clone(request.files).pop();
      const hashcode = path.basename(file.destination);
      const originalname = path.parse(file.originalname).name;

      const source = file.path;
      const dest = path.resolve(c_static.PUBLIC_DOWNLOAD_DESTINATION, hashcode);

      if (!PDFInfo.isPDF(source))
        response.sendErrorAsJSON(Error, 500, 'Not a valid PDF document')
                // Delete user's uploaded file and its temporary folder
                .then(() => syslib.fs.safeRecursiveRemove(source));      
      
      // If the uploaded file is validated, create a destination folder to store 
      // the output file.
      syslib.path.resolveThenCreateFolder(dest);

      // Convert options submitted directly from client. It will be sent directly to ConvertEngine.
      // ConvertEngine will use the default config if this value is falsy.
      const convertOptions = typeof request.body.options === 'object' ? JSON.parse(request.body.options) : null;

      // Default format is PNG
      const outputExtension = 
        c_rule.ACCEPT_EXTENSIONS.includes(request.body.outputExtension) 
        ? request.body.outputExtension 
        : c_rule.DEFAULT_OUTPUT_EXTENSIONS;
      
      const converter = new ConversionService();
      const compressor = new CompressionService(file.destination, dest, {
        customFileName: originalname,
        filterGlob: `./\*.${outputExtension}`,
        showLog: true,
      });

      const proceedConvertSession = await converter.convertAsync({
        inputFilePath: source,
        inputFileExtension: 'pdf',
        outputFolderPath: compressor.cache,
        outputFileExtension: outputExtension,
        configurator: convertOptions,
      });

      // Send converted file to client
      const proceedCompressImagesToZipArchive = await compressor.compressAsync();
      const zipFilePath = proceedCompressImagesToZipArchive;

      const relativeDownloadLink = '/' + path.relative(c_static.PUBLIC_FOLDER, zipFilePath)
      const actualFileSize = fs.existsSync(zipFilePath) ? fs.statSync(zipFilePath).size : 0;
      
      ScheduleServiceProvider
        .deleteFileAtSpecificTime(dest)
        .after(c_common.period.ONE_DAY)
        .enforce();

      response.send({
        fileName: compressor.filename,
        fileSize: actualFileSize,
        downloadLink: relativeDownloadLink,
      });

      // Delete user's uploaded file after all, just keep zipped output file.
      syslib.fs.safeRecursiveRemove(file.destination);
    });

  }  

}

module.exports = UserController;
