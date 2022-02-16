const child_process = require('child_process');
const PDFThrowable = require('./PDFThrowable');


class PDFCommandError extends PDFThrowable {
  static THROW_IF_COMMAND_NOT_EXIST(command) {
    if (!child_process.execSync(`command -v ${command} | xargs`).toString().trim())
      throw new this(`Not a command: ${command}`);
  }
}


module.exports = PDFCommandError;
