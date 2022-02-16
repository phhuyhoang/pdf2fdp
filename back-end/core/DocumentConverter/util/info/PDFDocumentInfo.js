const PDFPresenter = require('./PDFPresenter');
const PopplerExtractor = require('./extractor/Poppler_PDFInfoExtractor');


/**
 * @param {string} field
 * @param {Array} extractors
 */
const getFieldValue = function getFieldValue(field, extractors) {
  const getField = 'get' + field.charAt(0).toUpperCase() + field.slice(1);
  const isField = 'is' + field.charAt(0).toUpperCase() + field.slice(1);

  for (const extractor of extractors) {
    const isFieldGetter = typeof extractor[getField] == 'function';

    try {
      let value = isFieldGetter ? extractor[getField]() : extractor[isField]();
      return value;
    }
    catch {
      continue;
    }
  }
}


class PDFDocumentInfo {
  constructor() {
    this.havingPoppler = false;
    this.extractors = [];
  }

  provideOriginalFile(file) {
    const poppler = new PopplerExtractor(file);
    this.extractors.push(poppler);
    return this;
  }

  setPresenter(presenter) {
    if (PDFPresenter.isPresenter(presenter)) {
      this.extractors.push(presenter);
    }
    return this;
  }

  getMetadataFieldNames() {
    return [
      'title', 'author', 'creator', 'subject', 'producer', 'keywords',
      'pageCount', 'pageIndices', 'creationDate', 'modificationDate',
      'PDFVersion', 'compressed', 'encrypted', 'pageSize', 'fileSize'
    ];
  }

  getInfo() {
    const fields = this.getMetadataFieldNames();
    const info = Object.create(null);

    for (const field of fields) {
      info[field] = getFieldValue(field, this.extractors);
    }

    return info;
  }
}


module.exports = PDFDocumentInfo;
