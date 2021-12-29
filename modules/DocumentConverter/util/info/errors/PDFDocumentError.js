const fs = require('fs');
const PDFThrowable = require('./PDFThrowable');


class PDFDocumentError extends PDFThrowable {
  /**
   * @param {string} file
   */
  static THROW_IF_FILE_NOT_FOUND(file) {
    const exists = file && fs.existsSync(file);
    if (!exists) throw new this(`File not found: ${file}`);
  }

  /**
   * @param {string} file
   */
  static THROW_IF_NOT_A_FILE(file) {
    this.THROW_IF_FILE_NOT_FOUND(file);

    if (!fs.statSync(file).isFile())
      throw new this(`Not a file: ${file}`)
  }
}


module.exports = PDFDocumentError;
