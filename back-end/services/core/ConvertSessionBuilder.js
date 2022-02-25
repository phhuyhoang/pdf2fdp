const CoreConvertModule = require('../../core/DocumentConverter');
const ConvertConfigurator = CoreConvertModule.ConvertConfigurator;
const ConvertEngine = new CoreConvertModule.ConvertEngine();


class ConvertSessionBuilder {

  constructor() {
    this.hooks = {
      resolveBadNaming: true,
      clearCache: true,
    }

    this.configurator = ConvertConfigurator.getDefault();
    this.maxConcurrency = 1;
    this.builtSession = null;
    this.callbackOnFinal = fulfilled => fulfilled;
  }


  setMaxConcurrency(number) {
    if (typeof number == 'number') {
      this.maxConcurrency = number;
    }
    return this;
  }


  setInput(path, extension) {
    this.inputFilePath = path;
    this.inputFileExtension = extension;
    return this;
  }


  setOutput(path, extension) {
    this.outputFolderPath = path;
    this.outputFileExtension = extension;
    return this;
  }


  applyConfig(configurator) {
    if (typeof configurator == 'object') {
      this.configurator = ConvertConfigurator.fromJSON(configurator)
    }
    return this;
  }


  addHook(name, callback) {
    if (typeof name == 'string' && typeof callback == 'function')
      this.hooks[name] = callback;

    return this;
  }


  /**
   * Add a callback to run once this session ends
   * @param {Function} callback
   */
  finally(callback) {
    if (typeof callback == 'function') {
      this.callbackOnFinal = callback
    }
    return this;
  }


  /**
   * Build an invokable function that can start a convert session later
   * @return {Function}
   */
  build() {
    const self = this;

    /**
     * @return {Promise}
     */
    const session = function ConvertSession() {
      // Returns the previous spawned instance, preventing excessively spawn
      if (self.builtSession instanceof Promise) return self.builtSession;

      const convertAsync = ConvertEngine.setMaxConcurrency(self.maxConcurrency)
        .addFile(self.inputFilePath, self.outputFolderPath, {
          configurator: self.configurator,
          inputExtension: self.inputFileExtension,
          outputExtension: self.outputFileExtension,
          hooks: self.hooks,
        })
        .convert()
        .then(self.callbackOnFinal);

      self.builtSession = convertAsync;
      return convertAsync;
    };

    return session;
  }

}


module.exports = ConvertSessionBuilder;
