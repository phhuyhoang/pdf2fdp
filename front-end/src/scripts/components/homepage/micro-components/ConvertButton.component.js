const DOM = require('../../../helpers/util/dom.util');

const template = `
<div class="convert-button">
    <button type="button" class="{{name}}">
        <div class="cog-group">
            <i class="fa fa-cog"></i>
            <i class="fa fa-cog"></i>
            <i class="fa fa-cog"></i>
        </div>
        <span>{{text}}</span>
    </button>
</div>
`


function enableThreeDotsLooping(element, interval) {
  let count = 3;
  const dot = '.';
  const originalText = element.textContent;

  return setInterval(function changeDots() {
    element.textContent = originalText + dot.repeat(count);

    if (++count > 3)
      count = 1; 
  }, 
  interval);
}



/**
 * Create a convert button with cogs animation effect
 * @param {String} className
 * @param {String} buttonText
 */
function ConvertButton(className, buttonText) {
  const style = {
    name: 'styled-button',
    number: 1,
  };

  const { ancestor, descendant } = DOM.parse(template, 
  {
    members: {
      button: `button.${className}`,
      cogs: '.cog-group',
      text: `button.${className} > span`,
    },

    context: {
      name: className,
      text: buttonText,
    }
  });

  const root = ancestor;

  const context = Object.create(null);

  root.$button = descendant.button;
  root.$cogs = descendant.cogs;
  root.$text = descendant.text;


  root.changeText = function changeText(text) {
    descendant.text.textContent = text;
    return this;
  }

  root.start = function startConvertState(text) {
    this.disableButton();

    context.textContent = descendant.text.textContent;
    context.interval = enableThreeDotsLooping(descendant.text, 1000);

    descendant.text.textContent = text;
    descendant.button.setAttribute('disabled', 'true');
    return this;
  }

  root.end = function stopConvertState() {
    this.enableButton();
    clearInterval(context.interval);

    descendant.button.removeAttribute('disabled');
    descendant.text.textContent = context.textContent;
    return this;
  }

  root.disableButton = function disableButton() {
    descendant.button.setAttribute('disabled', 'true');
    return this;
  }

  root.enableButton = function enableButton() {
    descendant.button.removeAttribute('disabled');
    return this;
  }

  descendant.button.applyStyle(style.name, style.number);
  descendant.text.textContent = buttonText;

  return root;
}


module.exports = ConvertButton;
