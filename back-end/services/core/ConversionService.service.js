const _ = require('../../helpers/ExtraLodash.helper');
const ConvertSessionBuilder = require('./ConvertSessionBuilder');
const secret = new WeakMap();


/**
 * A simple convert service implementation using the singleton pattern.
 * This class is implemented to solve the problem of processing files
 * by queuing rules. When many requests send files to the same server,
 * which can cause server crash if processing them simultaneously.
 */
class ConversionService {

  constructor() {
    const self = ConversionService;
    let privateScope = secret.get(self);

    // Return the previously created instance
    if (privateScope && privateScope.instance instanceof ConversionService) {
      const singleton = privateScope.instance;
      return singleton;
    }
    else {
      // Implement a private context
      secret.set(self, {});
      privateScope = secret.get(self);

      /**
       * Current convert process
       * @type {Promise}
       */
      privateScope.currentProcess = null;

      /**
       * Implement sequential processing
       * @type {Function[]}
       */
      privateScope.queue = [];

      /**
       * Singleton instance
       * @type {ConversionService}
       */
      privateScope.instance = this;
    }
  }

  /**
   * Push convert request into the queue.
   * @param {Object} declaration
   *     @param {string} declaration.inputFilePath - Input file path
   *     @param {string} declaration.inputFileExtension - Input file extension
   *     @param {string} declaration.outputFolderPath - Output folder path
   *     @param {string} declaration.outputFileExtension - Output file extension
   *     @param {Object} declaration.configurator - Convert config
   *     @param {Object} declaration.hooks - Engine hooks (experiment)
   *     @param {Function} declaration.onFinishCallback
   */
  convertAsync(declaration = {}) {
    const self = ConversionService;
    const privateScope = secret.get(self);
    const hooks = declaration.hooks || Object.create(null);

    const currentSession = new ConvertSessionBuilder()
      .setMaxConcurrency(1)
      .setInput(declaration.inputFilePath, declaration.inputFileExtension)
      .setOutput(declaration.outputFolderPath, declaration.outputFileExtension)
      .applyConfig(declaration.configurator)
      .addHook(_.objectEntriesToFlattedArray(hooks));


    return new Promise(function holdupUntilSessionDone(resolve, reject) {

      const promiseHandleCurrentConvertRequest = async function promiseHandleCurrentConvertRequest() {
        privateScope.currentProcess = 
          currentSession.build()
            .call()
            .then(resolve)
            .then(declaration.onFinishCallback);

        const currentResult = await privateScope.currentProcess;

        if (privateScope.queue.length) {
          const promiseHandleNextConvertRequest = privateScope.queue.shift();
          return await promiseHandleNextConvertRequest.call();
        }
        else {
          privateScope.currentProcess = null;
          return currentResult;
        }
      }

      // Push current session into the queue if an another convert process is running
      // (from second request onwards, if previous request wasn't completed)
      if (privateScope.currentProcess instanceof Promise) {
        const promiseCallback = promiseHandleCurrentConvertRequest;
        privateScope.queue.push(promiseCallback)
      }
      // And vise versa, run it immediately (first request in queue)
      else {
        promiseHandleCurrentConvertRequest();
      }
      
    });
  }
}


module.exports = ConversionService;
