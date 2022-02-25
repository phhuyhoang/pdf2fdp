// Use in case the client sent a request with invalid output
exports.DEFAULT_OUTPUT_EXTENSIONS = 'png';

// Output formats the service support convert to 
exports.ACCEPT_EXTENSIONS = [ 'png', 'svg', 'jpeg', 'tiff' ];

// Limited file size for guest and unpaid user.
exports.LIMITED_FILE_SIZE_FOR_UNPAID = 1024 * 1024 * 50;
