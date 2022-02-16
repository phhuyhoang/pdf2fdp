const fs = require('fs');
const _ = require('lodash');
const CommandBuilder = require('../CommandBuilder');


/**
 * Build a complete command for a file converter
 * @class
 * @inheritdoc
 */
class PDFConverterBuilder extends CommandBuilder {
  static inputSupported = 'pdf';
  static outputSupported = ['pdf'];

  constructor(opts = {}) {
    super(opts);

    this.inputSupported = this.constructor.inputSupported;
    this.outputSupported = this.constructor.outputSupported;

    this.options = {
      inputExtension: 'pdf',
      outputExtension: null,
    }
  }

  /**
   * Set file extension input
   * @param {string} ext
   */
  setInputExtension(ext) {
    this.options.inputExtension = ext;
    return this;
  }

  /**
   * Set file extension output
   * @param {string} ext
   */
  setOutputExtension(ext) {
    this.options.outputExtension = ext;
    return this;
  }

  /**
   * @inheritdoc
   */
  build(input, output, options = {}) {
    const backup = [...this.arrange];
    const excludedExtensionOptions = _.omit(this.options, [ 'inputExtension', 'outputExtension' ]);
    
    if (this.options.inputExtension == this.options.outputExtension 
      && Object.values(excludedExtensionOptions).every(value => !value)) {
      this.arrange = ['cp', '$input', '$output'];
    }
    const completeCommand = super.build(input, output, options);
    this.arrange = backup;
    return completeCommand;
  }

  /**
   * @inheritdoc
   */
  _isValidInputFile(input) {
    super._isValidInputFile(input);
    if (!this._ignoreError && !fs.statSync(input).isFile()) throw new Error('The given input path must be a file');
  }
}


module.exports = PDFConverterBuilder;
