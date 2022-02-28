const fs = require('fs');
const path = require('path');


module.exports = {
  fs,
  path,
}


module.exports.fs.safeRecursiveRemove = function safeRecursiveRemove(...sysfiles) {
  for (const sysfile of sysfiles) {
    if (this.existsSync(sysfile)) {
      const stat = this.statSync(sysfile)

      if (stat.isDirectory()) {
        this.rmdirSync(sysfile, { recursive: true });
        console.log(`RM_DIR: ${sysfile}`);
      }
      else if (stat.isFile()) {
        this.unlinkSync(sysfile);
        console.log(`RM_FILE: ${sysfile}`);
      }
    }
  }
  return this;
}


module.exports.path.resolveThenCreateFolder = function resolveThenCreateFolder(...segments) {
  const absoluted_path = this.resolve(...segments);

  if (!fs.existsSync(absoluted_path))
    fs.mkdirSync(absoluted_path);

  return absoluted_path;
}


module.exports.path.resolveThenWriteFile = function resolveThenWriteFile(...segments) {
  const data = segments.pop();
  const file = this.resolve(...segments);

  fs.writeFileSync(file, data);
  return file;
}
