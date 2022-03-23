const DOM = require('../../helpers/util/dom.util');
const StyledButton = require('./micro-components/StyledButton');


const template = `
<div class="success-modal">
    
    <div class="success-modal__wrapper">
        
        <div class="success-modal__header">
            <div class="circle-box">
                <svg width="95" height="95">
                    <circle 
                        r="45" 
                        cx="50%" 
                        cy="50%" 
                        stroke="#FFFFFF"
                        stroke-width="5" 
                        fill-opacity="0"
                    />
                    <path d="M 237 511 L 253 527 L 290 490 "        
                        fill="#FFFFFF"  
                        stroke-width="5" 
                        stroke="#FFFFFF"
                        transform="matrix(1 0 0 1 -217 -460)" stroke-opacity="1" opacity="1" fill-opacity="0">
                    </path>
                </svg>
            </div>
            <button class="modal-dismiss" aria-hidden="true">
                <i class="fa fa-times"></i>
            </button>
        </div>
        
        <div class="success-modal__body">
            <h4>{{title}}</h4>
            <p>{{content}}</p>
        </div>

    </div>

</div>
`;


function SuccessModal() {
  const style = {
    name: 'success-modal',
    number: 1,
  };

  const { ancestor, descendant } = DOM.parse(template, 
  {
    members: {
      header: '.success-modal__header',
      body: '.success-modal__body',
      title: '.success-modal__body h4',
      content: '.success-modal__body p',
      dismissButton: '.success-modal__header .modal-dismiss',
      svgElementCircle: '.circle-box svg circle',
      svgElementTick: '.circle-box svg path',
    },

    context: {
      title: 'Congratulations!',
      content: 'Your account has been created successfully.'
    }
  });

  let root = document.createElement('div').setClass('overlay');

  const button = new StyledButton('modal-btn').hideIcon().setParent(descendant.body);

  const svgCircleAnimation = getComputedStyle(descendant.svgElementCircle).animation;
  const svgTickAnimation = getComputedStyle(descendant.svgElementTick).animation;

  root.$modal = ancestor;
  root.$body = descendant.body;
  root.$body.$title = descendant.title;
  root.$body.$content = descendant.content;
  root.$body.$button = button;
  root.$header = descendant.header;
  root.$header.$dismiss_button = descendant.dismissButton;

  root.onModalDismiss = function onModalDismiss(listener) {
    descendant.dismissButton.addEventListener('click', listener);
    return this;
  }

  root.onButtonClick = function onButtonClick(listener) {
    button.addEventListener('click', listener);
    return this;
  }

  root.setTitle = function setTitle(title) {
    descendant.title.innerText = title;
    return this;
  }

  root.setContent = function setContent(content) {
    descendant.content.innerText = content;
    return this;
  }

  root.setButtonText = function setButtonText(text) {
    button.changeText(text);
    return this;
  }

  root.useDarkOverlay = function useDarkOverlay() {
    root.style.setProperty('background-color', 'rgba(0, 0, 0, 0.6)');
    return this;
  }

  root.showModal = function showModal() {
    root.style.setProperty('display', 'flex');
    ancestor.style.setProperty('display', 'block');
    descendant.svgElementCircle.style.setProperty('animation', svgCircleAnimation);
    descendant.svgElementTick.style.setProperty('animation', svgTickAnimation);
    return this;
  }

  root.hideModal = function hideModal() {
    root.style.setProperty('display', 'none');
    ancestor.style.setProperty('display', 'none');
    descendant.svgElementCircle.style.setProperty('animation', 'none');
    descendant.svgElementTick.style.setProperty('animation', 'none');
    return this;
  }

  ancestor.applyStyle(style.name, style.number);
  ancestor.setParent(root);

  return root;
}


module.exports = SuccessModal;
