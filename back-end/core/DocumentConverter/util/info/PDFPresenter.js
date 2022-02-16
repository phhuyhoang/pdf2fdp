const fs = require('fs');
const pdflib = require('pdf-lib');
const PDFInvalidDocumentError = require('./errors/PDFInvalidDocumentError');


class PDFPresenter {
  static async create(pdf) {
    if (this.isPresenter(pdf)) return pdf;
    PDFInvalidDocumentError.THROW_IF_NOT_A_PDF_DOCUMENT(pdf);

    if (Buffer.isBuffer(pdf)) {
      return await pdflib.PDFDocument.load(pdf);
    }
    else if (pdf instanceof fs.ReadStream) {
      const stream = pdf;
      return this.create(stream.path);
    }
    else if (typeof pdf == 'string') {
      const buf = fs.readFileSync(pdf);
      return this.create(buf);
    }
  }

  static isPresenter(pdf) {
    if (pdf instanceof pdflib.PDFDocument) {
      return true;
    }
  }
}


module.exports = PDFPresenter;
