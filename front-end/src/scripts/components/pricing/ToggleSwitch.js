/**
 * Create a styled toggle switch
 */
function ToggleSwitch() {
  const style = {
    name: 'toggle-switch',
    number: 1
  };

  const SwitchDivision = document.createElement('div')
    .setClass('toggle-switch')

  const ButtonLeft = document.createElement('button')
    .setHTMLAttributes({
      type: 'button'
    })
    .setClass('toggle-switch__select')
    .setParent(SwitchDivision);

  const ButtonRight = ButtonLeft.cloneNode().setParent(SwitchDivision);

  ButtonLeft.disableButton = function disableButton() {
    ButtonLeft.setAttribute('disabled', '')
    ButtonRight.removeAttribute('disabled');
    return this;
  }

  ButtonLeft.enableButton = function enableButton() {
    ButtonLeft.removeAttribute('disabled');
    ButtonRight.setAttribute('disabled', '');
    return this;
  }

  ButtonRight.disableButton = ButtonLeft.enableButton.bind(ButtonRight);
  ButtonRight.enableButton = ButtonLeft.disableButton.bind(ButtonRight);

  ButtonLeft.addEventListener('click', function disableButtonRight(event) {
    event.preventDefault();
    this.disableButton();
  })

  ButtonRight.addEventListener('click', function disableButtonLeft(event) {
    event.preventDefault();
    this.disableButton();
  })

  SwitchDivision.$button_left = ButtonLeft;
  SwitchDivision.$button_right = ButtonRight;

  SwitchDivision.applyStyle(style.name, style.number);

  return SwitchDivision;
}


module.exports = ToggleSwitch;
