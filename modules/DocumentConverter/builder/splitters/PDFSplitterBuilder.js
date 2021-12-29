const CommandBuilder = require('../CommandBuilder');


/**
 * Build a complete command for a file splitter
 * @class
 * @inheritdoc
 */
class PDFSplitterBuilder extends CommandBuilder {
  static inputSupported = 'pdf';
  static outputSupported = ['pdf'];

  constructor(opts = {}) {
    super(opts);

    this.inputSupported = this.constructor.inputSupported;
    this.outputSupported = this.constructor.outputSupported;

    Object.defineProperties(this.options, {
      inputExtension: {
        enumerable: true,
        writable: false, 
        value: 'pdf'
      },
      outputExtension: {
        enumerable: true,
        writable: false,
        value: 'pdf'
      }
    });
  }

  /**
   * @inheritdoc
   */
  build(input, output, options = {}) {
    return super.build(input, output, options);
  }
}


module.exports = PDFSplitterBuilder;
