const DOM = require('../../helpers/util/dom.util');

const template = `
<ul class="multi-step">
</ul>
`;


/**
 * Create a multi-step progress bar, suitable for multi-step registration
 */
function MultiStepProgress() {
  const style = {
    name: 'multi-steps',
    number: 1,
  }

  const { ancestor, descendant } = DOM.parse(template);

  const root = ancestor;

  let currentStep = 1;
  let stepCount = 0;
  let stepList = [];

  /**
   * @param {String} stepName
   */
  root.addStep = function addStep(stepName) {
    const { ancestor: step } = DOM.parse(`
      <li class="step current">
        <span class="step-name">${stepName}</span>
      </li>
    `);

    step.setParent(root);
    stepCount++;
    stepList.push(step);

    return this;
  }

  /**
   * @param {Number}
   */
  root.setStep = function setStep(step) {
    currentStep = step;

    const stepWithCurrentClass = stepList.find(element => element.classList.contains('current'));

    if (stepWithCurrentClass) {
      stepWithCurrentClass.classList.remove('current');
    }

    if (step < stepList.length) {
      stepList[step - 1].classList.add('current');
    }

    return currentStep;
  }

  root.nextStep = function nextStep() {
    if (currentStep <= stepList.length)
      root.setStep(++currentStep);

    return currentStep;
  }

  root.prevStep = function prevStep() {
    if (currentStep > 0)
      root.setStep(--currentStep);

    return currentStep;
  }

  root.applyStyle(style.name, style.number);

  return root;
}


module.exports = MultiStepProgress;
