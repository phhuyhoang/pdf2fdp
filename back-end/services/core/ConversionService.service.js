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
       * Current session
       * @type {Function}
       */
      privateScope.currentSession = null;

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
   * @param {Object[]} declaration
   *     @param {string} declaration.inputFilePath - Input file path
   *     @param {string} declaration.inputFileExtension - Input file extension
   *     @param {string} declaration.outputFolderPath - Output folder path
   *     @param {string} declaration.outputFileExtension - Output file extension
   *     @param {Object} declaration.configurator - Convert config
   *     @param {Object} declaration.hooks - Engine hooks (experiment)
   */
  convertAsync(declaration) {
    const self = ConversionService;
    const privateScope = secret.get(self);
    const hooks = declaration.hooks || Object.create(null);

    const builder = new ConvertSessionBuilder()
      .setMaxConcurrency(1)
      .setInput(declaration.inputFilePath, declaration.inputFileExtension)
      .setOutput(declaration.outputFolderPath, declaration.outputFileExtension)
      .applyConfig(declaration.configurator)
      .addHook(_.objectEntriesToFlattedArray(hooks));

    const proceedOnceSessionDone = async function proceedOnceSessionDone(fulfilled) {
      if (privateScope.queue.length) {
        const nextSession = privateScope.queue.shift();
        privateScope.currentSession = nextSession;
        privateScope.currentProcess = nextSession.call().then(proceedOnceSessionDone);
      }
      else {
        privateScope.currentSession = privateScope.currentProcess = null;
      }
      return fulfilled;
    }

    return new Promise(function holdupUntilSessionDone(resolve, reject) {
      const session = builder.finally(fulfilled => resolve(fulfilled)).build();

      // Push current session into queue if there is another convert 
      // process running
      if (privateScope.current instanceof Promise) {
        privateScope.queue.push(session);
      }
      // And vise versa, run and set it as current
      else {
        const currentProcess = session.call().then(proceedOnceSessionDone);
        privateScope.currentSession = session;
        privateScope.currentProcess = currentProcess;
      }
    });
  }
}


module.exports = ConversionService;
