const child_process = require('child_process');

/**
 * Synchronously create a simple compression command
 */
class CompressionBuilder {
  constructor() {
    this.glob = './*';
  }

  setWorkingDirectory(source) {
    this.source = source;
    return this;
  }

  setOutputFile(dest){
    this.dest = dest;
    return this;
  }

  setFilterGlob(glob) {
    this.glob = glob;
    return this;
  }

  run() {
    if (!this.source || !this.dest) {
      throw new CompressionError('Working directory or destination have not been declared.');
    }

    const chdir_cmd = `cd ${this.source}`;
    const zip_cmd = `zip "${this.dest}" ${this.glob || default_include}`;
    const full_cmd = [ chdir_cmd, zip_cmd ].join(` ; `);

    return child_process.exec(full_cmd);
  }
}

class CompressionError extends Error {}


module.exports = CompressionBuilder;
