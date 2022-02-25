const syslib = require('../../helpers/SysLib.helper');
const CompressionBuilder = require('./CompressionBuilder');


/**
 * Zip archive compressor using `zip` command interface.
 * @param {string} source - Input folder
 * @param {string} dest - Output compressed file
 * @param {Object[]} options
 *     @param {string} options.customFileName - Compressed filename (default: parent folder name)
 *     @param {string} options.filterGlob - Wildcard pattern to filter files will be compressed
 *     @param {boolean} options.showLog - Verbose mode
 */
class CompressionService {

  constructor(source, dest, options = {}) {
    const shortTermPath = syslib.path.resolve(source, '.cache');
    const shortTermFolder = syslib.path.resolveThenCreateFolder(shortTermPath);

    const originalFileName = options.customFileName || syslib.path.parse(dest).name;

    const zipFileName = originalFileName + '.zip';
    const zipFilePath = syslib.path.resolve(dest, zipFileName);

    const inputFolderPath = shortTermFolder;
    const outputFilePath = zipFilePath;

    const builder = new CompressionBuilder()
      .setWorkingDirectory(shortTermPath)
      .setOutputFile(zipFilePath);

    if (options.filterGlob) {
      builder.setFilterGlob(options.filterGlob);
    }

    this.cache = inputFolderPath;
    this.filename = zipFileName;
    this.filepath = outputFilePath;
    this.builder = builder;
    this.glob = builder.glob; 
    this.verbose = options.showLog || false;
  }


  compressAsync() {
    const self = this;
    return new Promise(function onCompress(resolve, reject) {
      const compressingProcess = self.builder.run(); // ChildProcess

      compressingProcess
        .on('spawn', function onProcessSpawn() {
          if (self.verbose) {
            console.log('\n', `Starting compress... ${self.filename}`);
            compressingProcess.stdout.pipe(process.stdout);
          }
        })
        .on('error', function onProcessError(error) {
          syslib.fs.safeRecursiveRemove(self.cache);
          reject(error);
        })
        .on('exit', function onProcessDone() {
          syslib.fs.safeRecursiveRemove(self.cache);
          resolve(self.filepath);
        });
    });

  }

}


module.exports = CompressionService;
