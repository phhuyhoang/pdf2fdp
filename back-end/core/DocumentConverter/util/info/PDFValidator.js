const fs = require('fs');
const path = require('path');
const pdflib = require('pdf-lib');
const PDFDocumentError = require('./errors/PDFDocumentError');


class PDFValidator {
  static isPDF(pdf) {
    if (pdf instanceof pdflib.PDFDocument) {
      return true;
    }
    if (Buffer.isBuffer(pdf)) {
      const buf = pdf;
      return buf.lastIndexOf('%PDF-') === 0 && buf.lastIndexOf('%%EOF') > -1;
    }
    else if (pdf instanceof fs.ReadStream) {
      const stream = pdf;
      return this.isPDF(stream.path);
    }
    else if (typeof pdf === 'string') {
      const file = path.resolve(pdf);
      PDFDocumentError.THROW_IF_NOT_A_FILE(file);

      const buf = Buffer.alloc(5);
      const descriptor = fs.openSync(file, 'r');
      const bytesLength = fs.readSync(descriptor, buf, { length: 5 });
      const trbuf = bytesLength < 5 ? buf.slice(0, bytesLength) : buf;
      fs.closeSync(descriptor)
      return trbuf.lastIndexOf('%PDF-') === 0;
    }
    return false;
  }
}


module.exports = PDFValidator;
