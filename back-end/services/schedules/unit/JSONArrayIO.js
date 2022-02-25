const fs = require('fs');


class JSONArrayIO {
  
  constructor(file) {
    if (fs.existsSync(file)) {
      this.file = file;

      if (!JSONArrayIO.isJSONArrayFile(this.file)) {
        this.write([]);
      }
    }
    else {
      throw new Error('File not found error.')
    }
  }


  read() {
    const buffer = fs.readFileSync(this.file);
    const content = JSON.parse(buffer);
    return Array.isArray(content) ? content : [];
  }

  
  write(array) {
    if (Array.isArray(array)) {
      fs.writeFileSync(this.file, JSON.stringify(array, null, 2));
      return true;
    }
    throw new Error('Not an array.');
  }


  update(element) {
    const content = this.read();
    content.push(element);
    this.write(content);
    return true;
  }

  static isJSONArrayFile(file) {
    let buffer = fs.readFileSync(file).toString();

    try {
      const content = JSON.parse(buffer);
      return Array.isArray(content);
    }
    catch(e) {
      return false;
    }
  }

}


module.exports = JSONArrayIO;
