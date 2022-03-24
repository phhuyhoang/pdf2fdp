const DOM = require('../../../helpers/util/dom.util');

const template = `
<div>
    <button type="button" class="{{name}}">
        <i aria-hidden="true" class="{{icon}}"></i>
    </button>
</div>
`


/**
 * Create a styled button
 * @param {string} name - Class name
 * @param {string} icon - Font-awesome icon
 * @param {string} text - Inner text
 * @see views/styles/components/Button.scss
 */
function StyledButton(name, icon, text) {
  const style = {
    name: 'styled-button',
    number: 1,
  };

  const { ancestor, descendant } = DOM.parse(template, 
    {
      members: {
        button: `button.${name}`,
        icon: `button > i`,
      },

      context: {
        name,
        text,
        icon: icon ? `fa ${icon}` : 'fa fa-plus',
      }
    }
  );

  const root = ancestor;
  const button_text = document.createTextNode(text).setParent(descendant.button)

  let disabled = false;

  root.$button = descendant.button;
  root.$icon = descendant.icon;
  

  /**
   * @param {String} icon
   */
  root.changeIcon = function changeIcon(icon) {
    descendant.icon.setClass(`fa ${icon}`);
    return this;
  }

  root.changeText = function changeText(text) {
    button_text.data = text;
    return this;
  }

  root.disableButton = function disableButton() {
    disabled = true;
    descendant.button.setAttribute('disabled', 'true');
    return this;
  }

  root.enableButton = function enableButton() {
    disabled = false;
    descendant.button.removeAttribute('disabled');
    return this;
  }

  root.clickButton = function clickButton() {
    return descendant.button.click();
  }

  root.isDisabled = function isDisabled() {
    return disabled;
  }

  root.hideIcon = function hideIcon() {
    descendant.icon.style.setProperty('display', 'none');
    return this;
  }

  root.asSimplestButton = function asSimplestButton() {
    descendant.button.removeChild(button_text);
    return this;
  }

  descendant.button.applyStyle(style.name, style.number);
  return root;
}


module.exports = StyledButton;
