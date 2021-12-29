const child_process = require('child_process');
const PDFDocumentError = require('../errors/PDFDocumentError');
const PDFCommandError = require('../errors/PDFCommandError');


function extractInfo(property) {
  const matchedLine = this.find(line => line.startsWith(`${property}:`));
  if (matchedLine)
    return matchedLine.split(`${property}:`).pop().trim();
}

const TypeConvertion = {
  toDate: value => new Date(value),
  toNumber: value => Number(value),
  toBoolean: value => ['true', 'yes'].includes(value.toString().toLowerCase()) ? true
    : ['false', 'no'].includes(value.toString().toLowerCase()) ? false
    : value.toString(),
}


/**
 * @hideconstructor
 */
module.exports = function Poppler_PDFInfoExtractor(file) {
  PDFDocumentError.THROW_IF_NOT_A_FILE(file);
  PDFCommandError.THROW_IF_COMMAND_NOT_EXIST('pdfinfo');

  const info = child_process.execSync(`pdfinfo "${file}"`).toString();
  const infoAsArray = info.split('\n');
  const getFieldValue = extractInfo.bind(infoAsArray);

  class Poppler_PDFInfo {
    constructor() {
      this.path = file;
      this.info = info;
    }

    getTitle = () => getFieldValue('Title')
    getAuthor = () => getFieldValue('Author')
    getCreator = () => getFieldValue('Creator')
    getSubject = () => getFieldValue('Subject')
    getProducer = () => getFieldValue('Producer')
    getKeywords = () => getFieldValue('Keywords')
    getCreationDate = () => TypeConvertion.toDate(getFieldValue('CreationDate'))
    getModificationDate = () => TypeConvertion.toDate(getFieldValue('ModDate'))
    getPageCount = () => TypeConvertion.toNumber(getFieldValue('Pages'))
    getPDFVersion = () => TypeConvertion.toNumber(getFieldValue('PDF version'))
    isCompressed = () => TypeConvertion.toBoolean(getFieldValue('Optimized'))
    isEncrypted = () => TypeConvertion.toBoolean(getFieldValue('Encrypted'))

    getPageSize = function getPageWidth() {
      const str = getFieldValue('Page size');
      const re = /^([0-9\.]+)\s+x\s+([0-9\.]+)/;
      const match = str.match(re);
      let width, height, size = {};

      if (match && match.length >= 3) {
        [ width, height ] = match.slice(1, 3);
        size = { 
          width: TypeConvertion.toNumber(width), 
          height: TypeConvertion.toNumber(height) 
        };
      }
      return size; 
    }

    getFileSize = () => TypeConvertion.toNumber(getFieldValue('File size').split(/\s+/).shift())
  }

  return new Poppler_PDFInfo;
}
