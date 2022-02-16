const fs = require('fs');
const path = require('path');


module.exports = [];


/**
 * Callback hook for resolve bad naming after every session
 * @param {Object} context - Shared context
 */
module.exports.push(function resolveBadNaming(context) {
  const output_folder = context.output;
  if (!fs.existsSync(output_folder)) return;

  const output_files = fs.readdirSync(output_folder);
  const bad_naming = [
    {
      regex: /^[0-9]+\.[A-z]{1,5}\-[0-9]+\.[A-z]/, // e.g: 22.png-1.png
      solution: name => name.split('-').shift().trim()
    },
    { 
      regex: /^\-[0-9]+\.[A-z]{1,5}$/, 
      solution: name => name.trim().slice(1)      // e.g: -22.png
    }
  ]

  output_files.forEach(file => {
    const bad_case = bad_naming.find(_case => _case.regex.test(file));

    if (bad_case) {
      const better_named_file = bad_case.solution(file);
      const oldpath = path.resolve(output_folder, file);
      const newpath = path.resolve(output_folder, better_named_file);
      fs.renameSync(oldpath, newpath);
      console.log(`Resolve bad naming "${file}" to "${better_named_file}" at folder: ${output_folder}`)
    }
  });
})


/**
 * Delete cached folder after every session
 * @param {Object} context - Shared context
 */
module.exports.push(function clearCache(context) {
  const cached_folder = context.cache;

  if (fs.existsSync(cached_folder)) {
    fs.rmdirSync(cached_folder, { recursive: true });
    console.log(`Cache removed: ${cached_folder}`);
  }
})
