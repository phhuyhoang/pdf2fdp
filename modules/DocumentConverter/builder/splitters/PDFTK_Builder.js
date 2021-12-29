const fs = require('fs');
const path = require('path');
const PDFSplitterBuilder = require('./PDFSplitterBuilder');


/**
 * Split PDF file to separate file, page by page
 * @class
 * @inheritdoc
 */
class PDFTK_Builder extends PDFSplitterBuilder {
  constructor(opts = {}) {
    super(opts);
    this.executor = 'pdftk';
    this.arrange = ['$command', '$input', 'burst', 'output', '$output'];
  }

  /**
   * @inheritdoc
   */
  build(input, output, options = {}) {
    const parsed = path.parse(output);

    // PDFTK will throw a java.io.FileNotFoundException if you do not 
    // specify output filepattern.
    // Therefore, I will make the default one for you.
    if (!parsed.name.includes('%d')) {
      const _output = this._resolveTilde(output);
      const outputIsDirectory = fs.existsSync(_output) && fs.statSync(_output).isDirectory();

      if (outputIsDirectory) {
        output = path.join(output, `%d.${this.options.outputExtension}`);
      }
      else {
        output = path.join(parsed.dir, `${parsed.name}_%d.${parsed.ext || this.options.outputExtension}`);
      }
    }

    return super.build(input, output, options);
  }
}


module.exports = PDFTK_Builder;
