const PDFConverterBuilder = require('./PDFConverterBuilder');


/**
 * Convert PDF to images (vector to bitmap)
 * @class 
 * @inheritdoc
 */
class PDF2PPM_Builder extends PDFConverterBuilder {
  static outputSupported = ['png', 'jpeg', 'tiff'];

  constructor(opts = {}) {
    super(opts);
    this.executor = 'pdftoppm';
    
    this.options = {
      ...this.options,
      dpi: null,
      scaleToX: null,
      scaleToY: null,
      fromPage: null,
      toPage: null,
    }

    this.aliases = {
      dpi: '-r',
      scaleToX: '-scale-to-x',
      scaleToY: '-scale-to-y',
      fromPage: '-f',
      toPage: '-l'
    }

    this.outputSupported = this.constructor.outputSupported;
    this.arrange = ['$command', '$_extension', '$options', '$input', '$output'];
  }

  /**
   * Specifies the X and Y resolution, in DPI.
   * @param {Number<Int>} dpi
   */
  setDPI(dpi) {
    this.options.dpi = dpi;
    return this;
  }

  /**
   * Scales each page horizontally to fit in scale-to-x pixels.
   * @param {Number<Float>} scale
   */
  setWidth(scale) {
    this.options.scaleToX = scale;
    return this;
  }

  /**
   * Scales each page vertically to fit in scale-to-y pixels.
   * @param {Number<Float>} scale
   */
  setHeight(scale) {
    this.options.scaleToY = scale;
    return this;
  }

  /**
   * Convert from page
   * @param {Number<Int>} page
   */
  convertFromPage(page) {
    this.options.fromPage = page;
    return this;
  }

  /**
   * Convert to page
   * @param {Number<Int>} page
   */
  convertToPage(page) {
    this.options.toPage = page;
    return this;
  }

  /**
   * @inheritdoc
   */
  build(input, output, options = {}) {
    const outputExtension = this.options.outputExtension;
    const backup = [...this.arrange];
    if (!this._ignoreError && !this.options.outputExtension) {
      throw new Error('Output extension has not been specify');
    }
    if (!this._ignoreError && !this.outputSupported.includes(outputExtension)) {
      throw new Error('This extension is not supported');
    }

    const extReplacement = `-${outputExtension}`;
    const replaceIndex = this.arrange.findIndex(part => part == '$_extension');
    this.arrange[replaceIndex] = extReplacement;
    
    const completeCommand = super.build(input, output, options);
    this.arrange = backup;
    return completeCommand;
  }
}


module.exports = PDF2PPM_Builder;
