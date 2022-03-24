const DOM = require('../../../helpers/util/dom.util');


const template = `
<div class="form-field col-md-10 offset-md-1">
    <input type="{{type}}" name="{{name}}">
    <div class="form-field__label">
        <i class="fa {{icon}}"></i>
        <label for="{{name}}">{{placeholder}}</label>
    </div>
    <small>
        {{description}}
    </small>
</div>
`


function FormFieldInput(type, name, icon, placeholder, description) {

  const { ancestor, descendant } = DOM.parse(template,
    {
      members: {
        input: '.form-field > input',
        icon: '.form-field > .form-field__label > i',
        placeholder: '.form-field > .form-field__label > label',
        description: '.form-field > small',
      },

      context: {
        type, name, icon, placeholder, description
      }
    }
  );

  const root = ancestor;

  const statusIcon = {
    valid: document.createElement('i').setClass('fa fa-check'),
    warning: document.createElement('i').setClass('fa fa-exclamation'),
    invalid: document.createElement('i').setClass('fa fa-times'),
  }

  root.$input = descendant.input;
  root.$icon = descendant.icon;
  root.$placeholder = descendant.placeholder;
  root.$description = descendant.description;

  root.childSitter = document.createElement('small');

  descendant.input.setAttribute('placeholder', ' ');


  root.maxlength = function setMaxLength(length) {
    descendant.input.setAttribute('maxlength', length);
    return this;
  }

  descendant.input.alert = function alertState(message = '') {
    descendant.description.removeAllChild();
    descendant.description.append(statusIcon.invalid);
    descendant.description.append(message);
    descendant.description.setClass('invalid');
  }

  descendant.input.risky = function riskyState(message = '') {
    descendant.input.alert(message);
  }

  descendant.input.warning = function warningState(message = '') {
    descendant.description.removeAllChild();
    descendant.description.append(statusIcon.warning);
    descendant.description.append(message);
    descendant.description.setClass('warning');
  }

  descendant.input.pass = function passedState(message = '') {
    descendant.description.removeAllChild()
    descendant.description.append(statusIcon.valid);
    descendant.description.append(message);
    descendant.description.setClass('valid');
  }

  descendant.input.recover = function recoverToOriginal() {
    descendant.description.copyChildNodesOf(root.childSitter);
    descendant.description.classList.value = '';
  }

  descendant.input.pending = function pendingState() {
    descendant.input.recover();
    !descendant.description.classList.contains('pending')
      && descendant.description.setClass('pending');
  }

  return root;

}


module.exports = FormFieldInput;
