const util = require('../util/helper');


/**
 * Create an invincile input[type="file"]
 * @class
 */
function FileInput(name) {
  const Input = util.constructElement('input')
    .setHTMLAttributes({
      name,
      type: 'file'
    })
    .setCSSStyle({
      display: 'none'
    });

  return Input;
}


module.exports = FileInput;
