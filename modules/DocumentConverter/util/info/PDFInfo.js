const PDFValidator = require('./PDFValidator');
const PDFPresenter = require('./PDFPresenter');
const PDFDocumentInfo = require('./PDFDocumentInfo');


class PDFInfo {
  /**
   * @param {Buffer|PDFDocument|string} pdf - PDF Buffer, PDFDocument or path
   * @return {pdflib.PDFDocument}
   */
  static async getPresenter(pdf) {
    return PDFPresenter.create(pdf);
  }

  /**
   * @param {Buffer|string} pdf - PDF Buffer or path
   * @return {boolean}
   */ 
  static isPDF(pdf) {
    return PDFValidator.isPDF(pdf);
  }

  /**
   * @param {Buffer|PDFDocument|string} pdf - PDF Buffer, PDFDocument or path
   * @return {Object}
   */
  static async getDocumentInfo(pdf) {
    const presenter = await this.getPresenter(pdf);

    let PDFInfoGetter = new PDFDocumentInfo();

    if (typeof pdf == 'string' && this.isPDF(pdf)) {
      PDFInfoGetter = PDFInfoGetter.provideOriginalFile(pdf);
    }

    return PDFInfoGetter.setPresenter(presenter).getInfo();
  }
}


module.exports = PDFInfo;
