const PDFThrowable = require('./PDFThrowable');
const PDFValidator = require('../PDFValidator');


class PDFInvalidDocumentError extends PDFThrowable {
  static THROW_IF_NOT_A_PDF_DOCUMENT(file) {
    if (!PDFValidator.isPDF(file))
      throw new this(`Not a PDF document: ${file}`);
  }
}


module.exports = PDFInvalidDocumentError;
