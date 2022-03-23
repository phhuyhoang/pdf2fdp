const DOM = require('../../helpers/util/dom.util');

const template = `
<div class="toggle-switch">
    <button type="button" class="toggle-switch__select"></button>
    <button type="button" class="toggle-switch__select"></button>
</div>
`


/**
 * Create a styled toggle switch
 */
function ToggleSwitch() {
  const style = {
    name: 'toggle-switch',
    number: 1
  };

  const { ancestor, descendant } = DOM.parse(template, 
    {
      members: {
        buttonLeft: `.toggle-switch > button:first-of-type`,
        buttonRight: `.toggle-switch > button:last-of-type`,
      }
    }
  );

  const root = ancestor;

  root.$button_left = descendant.buttonLeft;
  root.$button_right = descendant.buttonRight;


  descendant.buttonLeft.disableButton = function disableButton() {
    descendant.buttonLeft.setAttribute('disabled', '')
    descendant.buttonRight.removeAttribute('disabled');
    return this;
  }

  descendant.buttonLeft.enableButton = function enableButton() {
    descendant.buttonLeft.removeAttribute('disabled');
    descendant.buttonRight.setAttribute('disabled', '');
    return this;
  }

  descendant.buttonRight.disableButton = descendant.buttonLeft.enableButton.bind(descendant.buttonRight);
  descendant.buttonRight.enableButton = descendant.buttonLeft.disableButton.bind(descendant.buttonRight);

  descendant.buttonLeft.addEventListener('click', function disableButtonRight(event) {
    event.preventDefault();
    this.disableButton();
  })

  descendant.buttonRight.addEventListener('click', function disableButtonLeft(event) {
    event.preventDefault();
    this.disableButton();
  })


  root.applyStyle(style.name, style.number);

  return root;
}


module.exports = ToggleSwitch;
