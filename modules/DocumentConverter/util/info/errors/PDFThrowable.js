class PDFThrowable extends Error {
  constructor(message, ...stack) {
    super(message);
    this.name = this.constructor.name;    
    this.stack = stack.map(line => '?> ' + line).join('\n') + `\n${this.stack}`;
  }
};

module.exports = PDFThrowable;
