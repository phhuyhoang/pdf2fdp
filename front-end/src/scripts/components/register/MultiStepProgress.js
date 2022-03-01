/**
 * Create a multi-step progress bar, suitable for multi-step registration
 */
function MultiStepProgress() {
  const style = {
    name: 'multi-steps',
    number: 1,
  }

  let curr_step = 1;
  let child_count = 0;
  let childs = [];

  const ULElement = document.createElement('ul');

  ULElement.addStep = function addStep(text) {
    const child = document.createElement('li').setParent(ULElement);
    const span = document.createElement('span').setParent(child);

    if (!child_count) child.setClass('current');

    span.textContent = text;
    child_count++;
    childs.push(child);

    return this;
  }

  ULElement.setStep = function setStep(step) {
    curr_step = step;

    const current_element = childs.find(el => el.classList.contains('current'));

    if (current_element) {
      current_element.classList.remove('current');
    }

    if (step <= childs.length) {
      childs[step - 1].classList.add('current');
    }

    return curr_step;
  }

  ULElement.nextStep = function nextStep() {
    if (curr_step <= childs.length) 
      this.setStep(++curr_step);

    return curr_step;
  }

  ULElement.prevStep = function prevStep() {
    if (curr_step > 0) {
      this.setStep(--curr_step);
    }

    return curr_step;
  }

  ULElement.applyStyle(style.name, style.number);

  return ULElement;
}


module.exports = MultiStepProgress;
