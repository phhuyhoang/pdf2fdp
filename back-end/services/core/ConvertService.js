const fs = require('fs');
const path = require('path');
const ConvertModule = require('../../core/DocumentConverter/');

const ConvertEngine = new ConvertModule.ConvertEngine;
const ConvertConfigurator = ConvertModule.ConvertConfigurator;
const _private = new WeakMap();


/**
 * Singleton convert controller.
 */
class ConvertController {
  constructor() {
    if (typeof ConvertController.instance == 'object') {
      return ConvertController.instance;
    }

    if (!_private.has(this)) {
      /**
       * Init a private context
       */
      const property = {};
      _private.set(this, property);

      /**
       * Current processing
       * @type {Promise}
       */
      _private.get(this).current = null;

      /**
       * Use in case the previous session has not finished.
       * @type {Function}
       */
      _private.get(this).queue = [];
    }

    ConvertController.instance = this;
  }

  static getInstance() {
    return new ConvertController;
  }

  /**
   * @param {string} input - Input file
   * @param {string} output - Output folder
   * @param {Object} options
   */
  convert(input, output, options = {}) {
    const self = this;
    const configurator = options.options 
      ? ConvertConfigurator.fromJSON(options.options)
      : ConvertConfigurator.getDefault();
    const outputExtension = options.outputExtension;

    const cacheFolder = path.resolve(output, '.cache');

    if (!fs.existsSync(cacheFolder)) {
      fs.mkdirSync(cacheFolder);
    }

    /**
     * This action will be performed immediately once the current convert 
     * session ends.
     * @type {Function}
     */
    const callback = options.callback || (() => {});
    const errorCallback = options.errorCallback || (() => {});


    const convertSession = function convertSession() {
      const queue = _private.get(self).queue;

      return new Promise((resolve, reject) => {
        ConvertEngine.setMaxConcurrency(1)
          .addFile(input, cacheFolder, {
            configurator,
            inputExtension: 'pdf',
            outputExtension,
            hooks: {
              resolveBadNaming: true,
              clearCache: true,
            }
          })
          .convert()
          .then(fulfilled => {
            // If the callback from the route passed returns a promise, 
            // this chain will wait for that promise.
            const response = callback(fulfilled);
            return response;
          })
          .then(response => {
            if (queue.length) {
              const nextSession = queue.shift();
              _private.get(self).current = nextSession.call();
            }
            else {
              _private.get(self).current = null;
            }
            return response;
          })
          .catch(error => {
            if (queue.length) {
              const nextSession = queue.shift();
              _private.get(self).current = nextSession.call();
            }
            else {
              _private.get(self).current = null;
            }

            errorCallback(error);
            return 1;
          })
      });
    }

    if (_private.get(this).current instanceof Promise) {
      _private.get(self).queue.push(convertSession);
    }
    else {
      _private.get(self).current = convertSession.call();
    }
  }
}


module.exports = ConvertController;
