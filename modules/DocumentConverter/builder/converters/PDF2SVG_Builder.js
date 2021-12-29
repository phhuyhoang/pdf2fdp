const PDFConverterBuilder = require('./PDFConverterBuilder');


/**
 * Convert PDF to SVG (vector to vector)
 * @class
 * @inheritdoc
 */
class PDF2SVG_Builder extends PDFConverterBuilder {
  static outputSupported = ['svg'];

  constructor(opts = {}) {
    super(opts);
    this.executor = 'pdf2svg';
    this.outputSupported = this.constructor.outputSupported;
    this.options = {
      ...this.options,
      outputExtension: 'svg',
      page: null
    }
    this.arrange = ['$command', '$options', '$input', '$output', '$_page'];
  }

  /**
   * @inheritdoc
   */
  setOutputExtension(ext) {
    return this;
  }

  /**
   * @inheritdoc
   */
  setSpecifiedPage(page) {
    this.options.page = page;
    return this;
  }

  /**
   * @inheritdoc
   */
  build(input, output, options = {}) {
    const outputExtension = this.options.outputExtension;

    if (!this._ignoreError && !this.outputSupported.includes(outputExtension)) {
      throw new Error('This extension is not supported');
    }

    if (Number.isInteger(this.options.page)) {
      const specifiedPage = this.arrange.findIndex(part => part == '$_page');
      this.arrange[specifiedPage] = this.options.page.toString();
    }
    else {
      this.arrange = this.arrange.filter(part => part != '$_page');
    }

    const completedCommand = super.build(input, output, { addOutputExtension: true, ...options });
    return completedCommand;
  }
}


module.exports = PDF2SVG_Builder;
