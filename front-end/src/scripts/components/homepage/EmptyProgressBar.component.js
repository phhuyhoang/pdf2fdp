const DOM = require('../../helpers/util/dom.util');


const template = `
<div class="progress-bar empty-bar">
    <span>No file selected</span>
</div>
`;


/**
 * Create an empty stated progress bar
 */
function EmptyProgressBar() {
  const { ancestor, descendant } = DOM.parse(template, 
  {
    members: {
      span: 'span',
    }
  });

  const root = ancestor;
  root.$span = descendant.span;
  
  return root;
}


module.exports = EmptyProgressBar;
