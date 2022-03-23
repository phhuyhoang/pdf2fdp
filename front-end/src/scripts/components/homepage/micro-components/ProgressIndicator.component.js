const DOM = require('../../../helpers/util/dom.util');


const template = `
<div class="progress-indicator__total">
    <div class="progress-indicator__current">
    </div>
</div>
`


/**
 * Progress indicator
 */
function ProgressIndicator() {
  const { ancestor, descendant } = DOM.parse(template, 
    {
      members: {
        current: '.progress-indicator__total > .progress-indicator__current'
      }
    }
  );

  const root = ancestor;

  const colors = {
    red: '#b53836',
    blue: '#328da8',
    gray: '#d6d6d6',
  }

  let isUnpredicted = false;


  root.setColor = function setColor(color) {
    if (colors[color])
      descendant.current.style.setProperty('background-color', colors[color]);
    else
      descendant.current.style.setProperty('background-color', colors.red);

    return this;
  }

  root.setPercentage = function setPercentage(percent) {
    if (!isUnpredicted) {
      descendant.current.style.setProperty('width', `${percent}%`);
      root.setAttribute('title', `${percent}%`)
    }

    return this;
  }

  root.switchToUnpredicted = function switchToUnpredicted() {
    descendant.current.style.setProperty('width', '20%');
    descendant.current.classList.add('endless-run');
    
    isUnpredicted = true;
    root.setColor('blue');
    return this;
  }

  root.reset = function resetIndicator() {
    descendant.current.classList.remove('endless-run');

    isUnpredicted = false;
    root.setColor('red');
    root.setPercentage(0);
    return this;
  }

  root.setColor('red');
  root.setPercentage(0)

  return root;
}


module.exports = ProgressIndicator;
