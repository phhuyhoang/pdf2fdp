/**
 * Create a hidden file input
 * @class
 */
function FileInput(name) {
  return document.createElement('input')
    .setHTMLAttributes({
      name,
      type: 'file'
    })
    .setCSSStyle({
      display: 'none'
    });
}


module.exports = FileInput;
