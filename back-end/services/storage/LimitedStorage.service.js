const mime = require('mime');
const crypto = require('crypto');
const multer = require('multer');

const c_rule = require('../../constants/rule.constants')
const c_static = require('../../constants/static.constants');
const syslib = require('../../helpers/SysLib.helper');



module.exports = function LimitedStorage() {
  const storage = multer.diskStorage({
    // Create a hash string based on timestamp and original filename.
    // Use to unique-ization folder name that storing uploaded file from user.
    destination: function encryptFolderBaseOnDate(request, file, confirm) {
      const stringRequestHeaders = JSON.stringify(request.headers || {})
      const uniqueHashString = crypto.createHash('sha1')
        .update(
          new Date().toString().concat(stringRequestHeaders, file.originalname), 'binary')
        .digest('hex');

      const explicitDestination = syslib.path.resolveThenCreateFolder(c_static.PUBLIC_UPLOAD_DESTINATION, uniqueHashString);

      confirm(null, explicitDestination);
    },

    // Because the parent folder name is already unique, the uploaded file inside will have a common name.
    filename: function addMimeExtension(request, file, confirm) {
      const mimetype = file.mimetype;
      const extension = mime.getExtension(mimetype);

      const temporaryFilename = `file.${extension}`
      confirm(null, temporaryFilename);
    },

    // Just be against invalid files sent to the server
    fileFilter: function acceptPDFDocumentOnly(request, file, confirm) {
      const isValidPDFMimeType = ['application/pdf', 'application/x-pdf'].includes(file.mimetype);

      if (isValidPDFMimeType) {
        confirm(null, true); // Accept case
      }
      else {
        confirm(null, false); // Reject case
      }
    },

    limits: {
      fileSize: c_rule.LIMITED_FILE_SIZE_FOR_UNPAID
    },
  })

  return multer({ storage });
}
