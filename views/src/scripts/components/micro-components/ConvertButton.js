function enableDotLooper(element, interval) {
  const text = element.textContent;
  const dot = '.';
  let repeater = 3;

  return setInterval(() => {
    element.textContent = text + dot.repeat(repeater);

    if (++repeater > 3) repeater = 1
  }, interval)
}



/**
 * Create a convert button with cogs animation effect
 * @param {string} name - Class name
 * @param {string} innerText - Inner text
 */
function ConvertButton(name, innerText) {
  const style = {
    name: 'styled-button',
    number: 1,
  };
  const context = {};

  const ButtonDivision = document.createElement('div')
    .setClass('convert-button');

  const Button = document.createElement('button')
    .setHTMLAttributes({
      type: 'button'
    })
    .setClass(name)
    .setParent(ButtonDivision);

  const CogsDivElement = document.createElement('div')
    .setClass('cog-group')
    .setParent(Button);
  CogsDivElement.innerHTML = '<i class="fa fa-cog"></i>'.repeat(3).trim(); // Create three cogs

  const ButtonText = document.createElement('span')
    .setParent(Button);

  ButtonDivision.changeText = function changeText(text) {
    ButtonText.textContent = text;
    return this;
  }

  ButtonDivision.start = function start(text) {
    this.disableButton();
    context.textContent = ButtonText.textContent;
    ButtonText.textContent = text;
    context.interval = enableDotLooper(ButtonText, 1000);
    Button.setAttribute('disabled', 'true');
    return this;
  }

  ButtonDivision.end = function end() {
    this.enableButton();
    clearInterval(context.interval);
    Button.removeAttribute('disabled');
    ButtonText.textContent = context.textContent;
    return this;
  }

  ButtonDivision.disableButton = function disableButton() {
    Button.setAttribute('disabled', 'true');
    return this;
  }

  ButtonDivision.enableButton = function enableButton() {
    Button.removeAttribute('disabled');
    return this;
  }

  ButtonDivision.$button = Button;
  ButtonDivision.$cogs_div = CogsDivElement;
  ButtonDivision.$text = ButtonText;

  Button.applyStyle(style.name, style.number);
  ButtonText.textContent = innerText;

  return ButtonDivision;
}


module.exports = ConvertButton;
