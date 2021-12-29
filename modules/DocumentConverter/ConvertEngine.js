const ProcessWorker = require('./engine/ProcessWorker');
const ConvertConfigurator = require('./ConvertConfigurator');

const submodules = {
  split: [
    require('./builder/splitters/PDFTK_Builder'),
  ],
  convert: [
    require('./builder/converters/PDF2PPM_Builder'),
    require('./builder/converters/PDF2SVG_Builder'),
  ],
};


class ConvertError extends Error {
  constructor(message, ...stack) {
    super(message);
    this.name = this.constructor.name;    
    this.stack = stack.map(line => '?> ' + line).join('\n') + `\n${this.stack}`;
  }
}


/**
 * @classdesc Multi-threaded support document converter engine.
 */
class ConvertEngine {
  constructor() {
    this.running = false;
    this.stopped = false;
    
    /**
     * Default config. Use for all worker if specified.
     * @type {ConvertConfigurator|null}
     * @protected
     */
    this._defaultConfig = null;

    /**
     * Default options apply for each convert session.
     * @type {Object}
     * @protected
     */
    this._defaultOptions = {
      split: true,
      convert: true,
      inputExtension: 'pdf',
      outputExtension: 'svg',
      hooks: {
        clearCache: true,
        resolveBadNaming: true
      }
    }

    /**
     * Number of concurrently workers. Default is 1.
     * @type {Number<Int>}
     * @protected
     */
    this._maxConcurrency = 1;

    /**
     * Number of parallel threads limit. Default is 20.
     * @type {Number<Int>}
     * @protected
     */
    this._maxThread = 20;

    /**
     * Number of threads in safe for the system. Default is 10.
     * @type {Number<Int>}
     * @protected
     */
    this._maxThreadSafe = 10;

    /**
     * The array contains many ProcessWorkers. Each worker may have numerous 
     * pools (each pool runs many smaller processes asynchronously). 
     * The next pool will start after the previous pool ends. Workers 
     * run asyncronously, too. Admin can adjust the pool limit from outside.
     * @type {ProcessWorker}
     * @protected
     */
    this._workers = [];
  }

  /**
   * Install an alternative configurator for the engine 
   * @param {ConvertConfigurator} config
   */
  setDefaultConfigurator(config) {
    if (config instanceof ConvertConfigurator) {
      this._config = config;
    }
    return this;
  }

  /**
   * For stability, the number of concurrency should not exceed 5. 
   * @param {Number<Int>} con
   */
  setMaxConcurrency(con) {
    if (typeof con !== 'number') return this;
    if (con > 5) 
      console.warn('For stability, the number of concurrency should not exceed 5.');
    this._maxConcurrency = con;
    return this;
  }

  /**
   * Add a file into list. Each file added will be handled by a 
   * corresponding Worker. 
   * @param {string} source - Source file
   * @param {string} dest - Destination folder
   * @param {ConvertConfigurator} options 
   */
  addFile(source, dest, options = {}) {
    if (this._workers.length >= this._maxConcurrency) {
      console.error('Reach limit of concurrently');
      return;
    }

    const _default = { ...this._defaultOptions };
    const _options = Object.keys(_default).reduce(function overwriteOptions(result, key) {
      if (typeof _default[key] == 'object') {
        const _old = _default[key];
        const _new = options[key] || {};
        result[key] = { ..._old, ..._new };
        return result;
      }
      else if (options[key] !== undefined) {
        result[key] = options[key];
      }
      return result
    }, _default);

    const inputExtension = _options.inputExtension || 'pdf';
    const outputExtension = _options.outputExtension || 'pdf';

    const splitter = submodules.split.find(mod => mod.inputSupported == inputExtension);
    const converter = submodules.convert.find(mod =>
      mod.inputSupported == inputExtension &&
      mod.outputSupported.includes(outputExtension));

    const configurator = options.configurator || this._defaultConfig || ConvertConfigurator.getDefault();
    const worker = new ProcessWorker(configurator)
      .setEngine(this)
      .setConverter(converter)
      .setInput(source)
      .setOutput(dest)
      .setOptions(_options)

    /**
     * Temporarily disallow phase skipping. The system will be overloaded 
     * if too many threads access the same file. The current better 
     * workaround is split the file and cache it.
     */
    // if (_options.split)
    //   worker.setSplitter(splitter);
    // if (_options.convert)
    //   worker.setConverter(converter);
    
    worker.setSplitter(splitter);
    worker.setConverter(converter);
    
    this._workers.push(worker);
    return this;
  }

  convert() {
    const self = this;
    this.running = true;
    this.stopped = false;
    return new Promise((resolve, reject) => {
      Promise.all(this._workers.map(worker => worker.convert()))
        .then(response => {
          const resultAll = response.map(workerResponse => {
            const result = {};
            
            result.pools = workerResponse.pools;
            result.hooks = Array.isArray(workerResponse.hooks.custom)
              ? workerResponse.hooks.custom.map(invoke => invoke())
              : [];

            if (Array.isArray(workerResponse.hooks.builtin)) {
              workerResponse.hooks.builtin.forEach(invoke => invoke());
            }

            self._workers = [];
            self.running = false;
            self.stopped = true;
            return result;
          });

          resolve(resultAll);
        })
        .catch(reason => {
          self.running = false;
          self.stopped = true;
          reject(reason);
        });
    })
  }
}


module.exports = ConvertEngine;
