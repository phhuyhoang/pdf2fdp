const DOM = require('../../helpers/util/dom.util');
const StyledButton = require('./micro-components/StyledButton.component');


const template = `
<fieldset>
    <div class="color-stripe"></div>
    <div class="form__title row">
        <legend>{{formTitle}}</legend>
    </div>
    <div class="form__body row">
        
    </div>
    <div class="form__bottom row">

    </div>
</fieldset>
`;


function ChainableFieldSet(title) {
  const { ancestor, descendant } = DOM.parse(template,
    {
      members: {
        colorStripe: 'fieldset > .color-stripe',
        title: 'fieldset > .form__title',
        legend: 'fieldset > .form__title > legend',
        body: 'fieldset > .form__body',
        bottom: 'fieldset > .form__bottom',
      },

      context: {
        formTitle: title,
      },
    }
  );

  const root = ancestor;

  let prevButton = new StyledButton('prev-button', 'fa-arrow-left', 'Prev');
  let nextButton = new StyledButton('next-button', 'fa-arrow-right', 'Next');

  const chainContext = Object.create(null);
  const performAnimation = Object.create(null);
  const customEvents = Object.create(null);
  const formAction = Object.create(null);
  const attachedFields = [];

  root.$colorStripe = descendant.colorStripe;
  root.$title = descendant.title;
  root.$legend = descendant.legend;
  root.$body = descendant.body;
  root.$bottom = descendant.bottom;

  root.$bottom.$prev_button = prevButton;
  root.$bottom.$next_button = nextButton;

  root.chainContext = chainContext;
  root.performAnimation = performAnimation;
  root.attachedFields = attachedFields;

  prevButton.style.setProperty('display', 'none');
  nextButton.style.setProperty('display', 'none');

  prevButton.$button.addEventListener('click', () => customEvents.prev ? customEvents.prev(formAction) : formAction.prevFormSwitch());
  nextButton.$button.addEventListener('click', () => {
    console.log(customEvents.next ? customEvents.next : formAction.nextFormSwitch)
    customEvents.next ? customEvents.next(formAction) : formAction.nextFormSwitch()
  });


  const attachToBody = function attachToBody(component) {
    const componentName = component.getAttribute('name') || component.$input.getAttribute('name');
    if (!componentName) return;

    const replacedComponentName = componentName.toString().replace(/\-/g, '_');
    const dollarSignPrefixedName = `\$${replacedComponentName}`;
    descendant.body[dollarSignPrefixedName] = component;
  }

  const updateButtonOnChain = function updateButtonOnChain() {
    if (chainContext.prev && prevButton.parentElement !== descendant.bottom) {
      descendant.bottom.prepend(prevButton);
      prevButton.style.setProperty('display', 'block');
    }
    if (chainContext.next && nextButton.parentElement !== descendant.bottom) {
      descendant.bottom.append(nextButton);
      nextButton.style.setProperty('display', 'block');
    }
  }

  root.attach = function attachComponents(...components) {
    for (const component of components) {
      const componentAsChild = descendant.body.appendChild(component);
      attachedFields.push(componentAsChild);
      attachToBody(componentAsChild);
    }
    return root;
  }

  root.attachExclusion = function attachExclusionComponents(...components) {
    for (const component of components) {
      descendant.body.appendChild(component);
    }
    return root;
  }

  root.isVisibility = function isVisibility() {
    return root.offsetParent !== null;
  }

  root.chainWith = function chainWithFieldsets(...fieldsets) {
    if (!fieldsets.length) return;

    const currentFieldset = root;
    const nextFieldset = fieldsets.shift();

    currentFieldset.setNext(nextFieldset);
    nextFieldset.setPrev(currentFieldset);

    // Chain with remainder fieldsets
    nextFieldset.chainWith(...fieldsets);

    return root;
  }

  root.setPrev = function setAsPreviousFieldset(fieldset) {
    chainContext.prev = fieldset;
    updateButtonOnChain();
    return this;
  }

  root.setNext = function setAsNextFieldset(fieldset) {
    chainContext.next = fieldset;
    updateButtonOnChain();
    return this;
  }

  root.replaceButton = function replaceButton(whichButton, replacerButton) {
    if (whichButton == prevButton) {
      prevButton.removeEventListener('click', root.prevFormSwitch);
      prevButton = replacerButton;

      root.$bottom.$prev_button = prevButton;
      descendant.bottom.prepend(replacerButton)
    }
    if (whichButton == nextButton) {
      nextButton.removeEventListener('click', root.nextFormSwitch);
      nextButton = replacerButton;

      root.$bottom.$next_button = nextButton;
      descendant.bottom.append(replacerButton);
    }
  }

  root.onNextButtonClick = function onNextButtonClick(listener) {
    customEvents.next = listener;
  }

  root.onPrevButtonClick = function onPrevButtonClick(listener) {
    customEvents.prev = listener;
  }

  formAction.prevFormSwitch = function switchToPreviousForm() {
    if (chainContext.prev && root.isVisibility()) {
      performAnimation.disappear();
      chainContext.prev.performAnimation.prev();
    }
    return root;
  }

  formAction.nextFormSwitch = function switchToTheNextForm() {
    if (chainContext.next && root.isVisibility()) {
      performAnimation.disappear();
      chainContext.next.performAnimation.next();
    }
    return root;
  }

  performAnimation.disappear = function disappearAnimation() {
    ancestor.style.setProperty('visibility', 'hidden');
    ancestor.style.setProperty('animation', 'disappear 1.25s linear');
    ancestor.style.setProperty('display', 'none');
  }

  performAnimation.next = function triggerAnimationSwipeLeft() {
    ancestor.style.setProperty('visibility', 'visible')
    ancestor.style.setProperty('animation', 'fadeInLeft 1.5s cubic-bezier(0.19, 1, 0.22, 1)');
    ancestor.style.setProperty('display', 'block')
  }

  performAnimation.prev = function triggerAnimationSwipeRight() {
    ancestor.style.setProperty('visibility', 'visible')
    ancestor.style.setProperty('animation', 'fadeInRight 1.5s cubic-bezier(0.19, 1, 0.22, 1)');
    ancestor.style.setProperty('display', 'block')
  }

  return root;
}


module.exports = ChainableFieldSet;
