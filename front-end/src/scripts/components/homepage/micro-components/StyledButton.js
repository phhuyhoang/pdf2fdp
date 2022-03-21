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

  let disabled = false;

  const ButtonDivision = document.createElement('div');

  const Button = document.createElement('button')
    .setHTMLAttributes({
      type: 'button'
    })
    .setClass(name)
    .setParent(ButtonDivision);

  const ButtonIcon = document.createElement('i')
    .setHTMLAttributes({
      'aria-hidden': 'true'
    })
    .setClass(icon ? `fa ${icon}` : 'fa fa-plus')
    .setParent(Button);

  const ButtonText = document.createTextNode(text)
    .setParent(Button);


  /**
   * @param {string} icon
   */
  ButtonDivision.changeIcon = function changeIcon(icon) {
    ButtonIcon.setClass(`fa ${icon}`);
    return this;
  }

  ButtonDivision.changeText = function changeText(text) {
    ButtonText.data = text;
    return this;
  }

  ButtonDivision.disableButton = function disableButton() {
    disabled = true;
    Button.setAttribute('disabled', 'true');
    return this;
  }

  ButtonDivision.enableButton = function enableButton() {
    disabled = false;
    Button.removeAttribute('disabled');
    return this;
  }

  ButtonDivision.isDisabled = function isDisabled() {
    return disabled;
  }

  ButtonDivision.asSimplestButton = function asSimplestButton() {
    Button.removeChild(ButtonText);
    return this;
  }

  ButtonDivision.$button = Button;
  ButtonDivision.$icon = ButtonIcon;
  ButtonDivision.$text = ButtonText;

  Button.applyStyle(style.name, style.number);

  return ButtonDivision;
}


module.exports = StyledButton;
