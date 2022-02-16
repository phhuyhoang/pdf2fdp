const fs = require('fs');
const path = require('path');
const ava = require('ava');
const axios = require('axios');
const pdflib = require('pdf-lib');
const child_process = require('child_process');
const detectSVG = require('detect-svg');
const init = require('./init');
const env = require('../config').env.parsed;

init.useDefaultHooks();

const testspace = `${env.ENTRY_MODULES}/DocumentConverter`;


const local = {
  builder: {
    PDFConv: require(`${testspace}/builder/converters/PDFConverterBuilder`),
    PDF2PPM: require(`${testspace}/builder/converters/PDF2PPM_Builder`),
    PDF2SVG: require(`${testspace}/builder/converters/PDF2SVG_Builder`),
    PDFTK: require(`${testspace}/builder/splitters/PDFTK_Builder`),
  },
  convert: {
    ConvertEngine: require(`${testspace}/ConvertEngine`),
    ConvertConfigurator: require(`${testspace}/ConvertConfigurator`),
  },
  util: {
    PDFInfo: require(`${testspace}/util/info`),
  },
  prepared: {
    node4prof: {
      url: 'http://books.goalkicker.com/NodeJSBook/NodeJSNotesForProfessionals.pdf',
      file: `${__dirname}/convert/node4prof/NodeJSNotesForProfessionals.pdf`,
      buffer: null,
      readStream: null,
      presenter: null,
      info: null,
      env: {
        root: `${__dirname}/convert/node4prof`,
        pdf: `${__dirname}/convert/node4prof/pdf`,
        svg: `${__dirname}/convert/node4prof/svg`,
        png: `${__dirname}/convert/node4prof/png`,
      }
    },
    cleancode: {
      url: 'https://raw.githubusercontent.com/ontiyonke/book-1/master/%5BPROGRAMMING%5D%5BClean%20Code%20by%20Robert%20C%20Martin%5D.pdf',
      file: `${__dirname}/convert/cleancode/CleanCode.pdf`,
      buffer: null,
      readStream: null,
      presenter: null,
      info: null,
      env: {
        root: `${__dirname}/convert/cleancode`,
        pdf: `${__dirname}/convert/cleancode/pdf`,
        svg: `${__dirname}/convert/cleancode/svg`,
        png: `${__dirname}/convert/cleancode/png`,
      }
    }
  },
  func: {
    downloadFile: async function downloadFile(url, dest) {
      const writeStream = fs.createWriteStream(dest);
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })
      response.data.pipe(writeStream);
      
      return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve());
        response.data.on('error', error => {
          test.fail('0. Download sample PDF file error. Check your internet connection.');
          reject(error)
        });
      })
    },
    isPNG: function isPNG(buffer) {
      if (!buffer || buffer.length < 8) {
        return false;
      }

      return buffer[0] === 0x89
        && buffer[1] === 0x50
        && buffer[2] === 0x4E
        && buffer[3] === 0x47
        && buffer[4] === 0x0D
        && buffer[5] === 0x0A
        && buffer[6] === 0x1A
        && buffer[7] === 0x0A;
    }
  }
};


ava.before('preparation: download sample pdf document if not exists', async function downloadSamplePDFDocument(test) {
  const dirs = Object.values(local.prepared.node4prof.env)
    .concat(Object.values(local.prepared.cleancode.env));
  dirs.forEach(dir => !fs.existsSync(dir) && fs.mkdirSync(dir));

  const downloadFile = local.func.downloadFile;

  const node4prof = {
    url: local.prepared.node4prof.url,
    dest: local.prepared.node4prof.file,
  }

  const cleancode = {
    url: local.prepared.cleancode.url,
    dest: local.prepared.cleancode.file,
  }

  /**
   * Use only one engine to ensure synchronization
   */
  const ConvertEngine = local.convert.ConvertEngine;
  local.convert.ConvertEngine = new ConvertEngine();

  test.plan(2);  

  if (!fs.existsSync(node4prof.dest)) {
    await downloadFile(node4prof.url, node4prof.dest);
    local.prepared.node4prof.buffer = fs.readFileSync(local.prepared.node4prof.file);
    local.prepared.node4prof.readStream = fs.createReadStream(local.prepared.node4prof.file);
  }
  else {
    test.is(true, true)
    local.prepared.node4prof.buffer = fs.readFileSync(local.prepared.node4prof.file);
    local.prepared.node4prof.readStream = fs.createReadStream(local.prepared.node4prof.file);
  }

  if (!fs.existsSync(cleancode.dest)) {
    await downloadFile(cleancode.url, cleancode.dest);
    local.prepared.cleancode.buffer = fs.readFileSync(local.prepared.cleancode.file);
    local.prepared.cleancode.readStream = fs.createReadStream(local.prepared.cleancode.file);
  }
  else {
    test.is(true, true)
    local.prepared.cleancode.buffer = fs.readFileSync(local.prepared.cleancode.file);
    local.prepared.cleancode.readStream = fs.createReadStream(local.prepared.cleancode.file);
  }
});


ava.serial('test case: check whether the conversion tools and dependencies installed or not', async function checkConvertDependenciesInstalled(test) {
  const missingTools = [];
  try {
    const conversionTools = ['pdfinfo', 'pdftoppm', 'pdf2svg', 'pdftk'];

    test.plan(conversionTools.length);

    for (const tool of conversionTools) {
      if (child_process.execSync(`command -v ${tool} | xargs`).toString().trim()) {
        test.pass();
        continue;
      }
      test.log(`This tool is not installed: ${tool}`);
      missingTools.push(tool);
    }
  }
  catch (error) {
    test.fail(`1. These tools are not installed: ${missingTools.join(', ')}`)
    test.log(error);
  }
});


ava.serial('test case: test command builder PDFConverterBuilder', async function testPDFConverterBuilder(test) {
  try {
    const PDFConverterBuilder = local.builder.PDFConv;

    const plans = [
      {
        expected: ['cp', '~/Downloads/sample.pdf', '~/Downloads/'].join(' '),
        actually: new PDFConverterBuilder({ testing: 'ava' })
          .setOutputExtension('pdf')
          .build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true })
      },
      {
        expected: ['~/Downloads/sample.pdf', '~/Downloads/'].join(' '),
        actually: new PDFConverterBuilder({ testing: 'ava' })
          .build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true })
      },
    ];

    test.plan(plans.length);

    for (const { expected, actually } of plans) {
      test.deepEqual(actually, expected);
    }
  }
  catch (error) {
    test.fail('2. PDFConverterBuilder ancestor builder does not return expected results.');
    test.log(error);
  }
})


ava.serial('test case: test command builder PDF2PPM', async function testSubmodPDF2PPM(test) {
  try {
    const PDF2PPM = local.builder.PDF2PPM;

    const plans = [
      {
        expected: ['pdftoppm', '-png', '-r', 300, '-scale-to-y', 1000, '~/Downloads/sample.pdf', '~/Downloads/'].join(' '),
        actually: new PDF2PPM({ testing: 'ava' })
          .setOutputExtension('png')
          .setDPI(300)
          .setHeight(1000)
          .build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true })
      },
      {
        expected: ['pdftoppm', '-jpg', '~/Downloads/sample.pdf', '~/Downloads/'].join(' '),
        actually: new PDF2PPM({ testing: 'ava' })
          .setOutputExtension('jpg')
          .build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true })
      }
    ];

    test.plan(plans.length);

    for (const { expected, actually } of plans) {
      test.deepEqual(actually, expected);
    }
  }
  catch (error) {
    test.fail('3. PDF2PPM builder does not return expected results.');
    test.log(error);
  }
})


ava.serial('test case: test command builder PDF2SVG', async function testSubmodPDF2SVG(test) {
  try {
    const PDF2SVG = local.builder.PDF2SVG;

    const plans = [
      {
        expected: ['pdf2svg', '~/Downloads/sample.pdf', '~/Downloads/sample.svg'].join(' '),
        actually: new PDF2SVG({ testing: 'ava' }).build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true })
      }
    ];

    test.plan(plans.length);

    for (const { expected, actually } of plans) {
      test.deepEqual(actually, expected);
    }
  }
  catch (error) {
    test.fail('4. PDF2SVG builder does not return expected results.')
    test.log(error);
  }
})


ava.serial('test case: test command builder PDFTK', async function testSubmodPDFTK(test) {
  try {
    const PDFTK = local.builder.PDFTK;

    const plans = [
      {
        expected: ['pdftk', '~/Downloads/sample.pdf', 'burst output', '~/Downloads/%d.pdf'].join(' '),
        actually: new PDFTK({ testing: 'ava' })
          .build('~/Downloads/sample.pdf', '~/Downloads/', { returnString: true }),
      },
      {
        expected: ['pdftk', '~/Downloads/sample.pdf', 'burst output', '~/Downloads/sample_%d.pdf'].join(' '),
        actually: new PDFTK({ testing: 'ava' })
          .build('~/Downloads/sample.pdf', '~/Downloads/sample', { returnString: true }),
      }
    ];

    test.plan(plans.length);

    for (const { expected, actually } of plans) {
      test.deepEqual(actually, expected);
    }
  }
  catch (error) {
    test.fail('5. PDF2TK builder does not return expected results.')
    test.log(error);
  }
})


ava.serial('test case: test return of the method PDFInfo.getPresenter()', async function testPDFPresenterReturn(test) {
  try {
    const file = local.prepared.node4prof.file;
    const buffer = local.prepared.node4prof.buffer;
    const readableStream = local.prepared.node4prof.readStream;
    
    const plans = [
      // Test if the given argument is a Buffer
      {
        expected: pdflib.PDFDocument,
        actually: await local.util.PDFInfo.getPresenter(buffer)
      },
      // Test if the given argument is a ReadableStream
      {
        expected: pdflib.PDFDocument,
        actually: await local.util.PDFInfo.getPresenter(readableStream)
      },
      // Test if the given argument is a Path
      {
        expected: pdflib.PDFDocument,
        actually: await local.util.PDFInfo.getPresenter(file)
      }
    ]

    test.plan(plans.length + 1)

    for (const { expected, actually } of plans) {
      test.notDeepEqual(actually, expected);
    } 

    local.prepared.node4prof.presenter = await local.util.PDFInfo.getPresenter(buffer);
    test.pass()
  }
  catch (error) {
    test.fail('6. An error occurred, re-check method PDFInfo.getPresenter()');
    test.log(error);
  }
})


ava.serial('test case: test method PDFInfo.isPDF()', async function testPDFInfoRecognize(test) {
  try {
    const file = local.prepared.node4prof.file;
    const buffer = local.prepared.node4prof.buffer;
    const readableStream = local.prepared.node4prof.readStream;
    const presenter = local.prepared.node4prof.presenter;


    const plans = [
      {
        expected: true,
        actually: local.util.PDFInfo.isPDF(presenter),
      },
      {
        expected: true,
        actually: local.util.PDFInfo.isPDF(buffer),
      },
      {
        expected: true,
        actually: local.util.PDFInfo.isPDF(readableStream),
      },
      {
        expected: true,
        actually: local.util.PDFInfo.isPDF(file),
      },
      {
        expected: false,
        actually: local.util.PDFInfo.isPDF(__filename),
      } 
    ];

    test.plan(plans.length)

    for (const { expected, actually } of plans) {
      test.is(actually, expected);
    }
  }
  catch (error) {
    test.fail('7. An error occurred, re-check method PDFInfo.isPDF()');
    test.log(error);
  }
});


ava.serial('test case: check pdf document information getter', async function getPDFDocumentInformation(test) {
  try {
    const file = local.prepared.node4prof.file;
    const presenter = local.prepared.node4prof.presenter;

    const info = await local.util.PDFInfo.getDocumentInfo(file);
    local.prepared.node4prof.info = info;

    const plans = [
      {
        expected: 'Node.js Notes for Professionals',
        actually: info.title,
        performTest: test.is,
      },
      {
        expected: 334,
        actually: info.pageCount,
        performTest: test.is,
      },
      {
        expected: new Date('Fri May  4 18:10:16 2018 +07'),
        actually: info.creationDate,
        performTest: test.deepEqual
      },
      {
        expected: { width: 595.28, height: 841.89 },
        actually: info.pageSize,
        performTest: test.deepEqual
      },
      {
        expected: await local.util.PDFInfo.getDocumentInfo(presenter),
        actually: info,
        performTest: test.notDeepEqual,
      }
    ];

    test.plan(plans.length);

    for (const { expected, actually, performTest } of plans) {
      performTest(actually, expected);
    }
  }
  catch (error) {
    test.fail('8. An error occurred while retrieving this document\'s information');
    test.log(error);
  }
});


ava.serial('test case: test convert CleanCode to SVG (using default configurator, with single worker)', async function convertDefault(test) {
  try {
    const engine = local.convert.ConvertEngine;

    const source = local.prepared.cleancode.file;
    const dest = local.prepared.cleancode.env.svg;

    const info = await local.util.PDFInfo.getDocumentInfo(source);
    local.prepared.cleancode.info = info;

    /**
     * Document settings, like DPI, page size, etc. For default settings, 
     * all parameter values are `original`.
     */
    const configurator = local.convert.ConvertConfigurator.getDefault();

    engine.setMaxConcurrency(1)
      .addFile(source, dest, {
        configurator,
        inputExtension: 'pdf',
        outputExtension: 'svg',
        // Default hooks
        hooks: {
          // Auto resolve bad naming of output file
          resolveBadNaming: true,
          // Clear cache after convert
          clearCache: true,
        }
      });

    test.plan(4);

    /**
     * `result` is return of a Promise.all (array), containing 
     * fulfilled values of engines.
     * Each element is an object consisting of fields:
     * - `pools` are a collection of fulfilled promises that return ThreadPools.
     *   By the nature of the engine, each pool consists of many LinkableCommands running in parallel. 
     *   Each LinkableCommand is a command followed by many other commands. 
     * - `hooks` are invoker functions (either user-defined or engine-provided) that can 
     *   be hooked at any point in the conversion progress to interfere with certain situations.
     */
    const result = await engine.convert();
    // For AVA, the timeout of each test case is 10 seconds, which will cause test case skip 
    // while converting midway.

    const convertedSVGs = fs.readdirSync(local.prepared.cleancode.env.svg);
    /**
     * A single conversion session will be limited to 10 processes (for free users). 
     * In case of 2 or more processes (paid users), it will extend the 
     * limit to 20 processes (or more in the future).
     */
    test.is(result[0].pools.length, 10); 
    /**
     * Total number of converted pages must be enough 462 pages
     */
    test.is(info.pageCount, 462);
    test.is(convertedSVGs.length, info.pageCount);

    /**
     * Check some of them are really SVG?
     */
    const SVGfile = path.resolve(local.prepared.cleancode.env.svg, convertedSVGs.pop())
    const SVGbuffer = fs.readFileSync(SVGfile);
    test.true(detectSVG(SVGbuffer));
  }
  catch (error) {
    test.fail('9. An error occurred while converting this document to SVG');
    test.log(error);
  }
})


ava.serial('test case: test convert NodeJS for Prof to PNG (using custom configurator, with single worker)', 
  async function convertCustom(test) {
  try {
    const engine = local.convert.ConvertEngine;

    const source = local.prepared.node4prof.file;
    const dest = local.prepared.node4prof.env.png;

    /**
     * Reuse previous test case
     */
    const info = local.prepared.node4prof.info;

    const configurator = local.convert.ConvertConfigurator.fromJSON({
      width: '50%',
      height: '50%'
    });

    engine.setMaxConcurrency(1)
      .addFile(source, dest, {
        configurator,
        inputExtension: 'pdf',
        outputExtension: 'png',
        hooks: {
          resolveBadNaming: true,
          clearCache: true,
        }
      });

    test.plan(4);

    const result = await engine.convert();
    const convertedPNG = fs.readdirSync(dest);

    test.is(result[0].pools.length, 10); 
    /**
     * Total number of converted pages must be enough 334 pages
     */
    test.is(info.pageCount, 334);
    test.is(convertedPNG.length, info.pageCount);

    /**
     * Check some of them are really PNG?
     */
    const PNGfile = path.resolve(dest, convertedPNG.find(file => file.toLowerCase().endsWith('.png')));
    const PNGbuffer = fs.readFileSync(PNGfile);
    test.true(local.func.isPNG(PNGbuffer));
  }
  catch (error) {
    test.fail('10. An error occurred while converting this document to PNG');
    test.log(error);
  }
});


ava.serial('test case: test convert both at the same time (multiple workers)', async function convertBoth(test) {
  try {
    const engine = local.convert.ConvertEngine;

    const node4prof = local.prepared.node4prof;
    const cleancode = local.prepared.cleancode;

    const configurator = local.convert.ConvertConfigurator.getDefault();

    engine.setMaxConcurrency(2)
      .addFile(node4prof.file, node4prof.env.svg, {
        configurator,
        inputExtension: 'pdf',
        outputExtension: 'svg',
        hooks: {
          resolveBadNaming: true,
          clearCache: true,
        }
      })
      .addFile(cleancode.file, cleancode.env.png, {
        configurator,
        inputExtension: 'pdf',
        outputExtension: 'png',
        hooks: {
          resolveBadNaming: true,
          clearCache: true,
        }
      });

    test.plan(2);

    await engine.convert();
    const node4profSVGdest = fs.readdirSync(node4prof.env.svg);
    const cleancodePNGdest = fs.readdirSync(cleancode.env.png);

    test.is(node4profSVGdest.length, node4prof.info.pageCount);
    test.is(cleancodePNGdest.length, cleancode.info.pageCount);
  }
  catch (error) {
    test.fail('11. An error occurred.');
    test.log(error);
  }
});
