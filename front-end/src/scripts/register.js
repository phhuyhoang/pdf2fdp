/**
 * NOTE: Due to Browserify's unsupported, the code below only uses ES6 
 * promise.then instead of ES7 async-await
 */
const autoload = require('./helpers/autoload/prototype').init();

const effect = require('./misc/effects');
const serverSideValidateFormData = {};

const globalContext = {
  verificationCodeSent: false,
};

const MultiStepProgress = require('./components/register/MultiStepProgress');
const SuccessModal = require('./components/register/SuccessModal.component');
const StyledButton = require('./components/register/micro-components/StyledButton');

const SPECIAL_CHARACTER_RE = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;


var eventListeners = {
  $username: {
    normalValidate: function validateUsername(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value.length > 50) {
        input.alert('Username too long (maximum 50 characters long)');
        return false;
      }
      if (/^[0-9_\-]/.test(input.value)) {
        input.alert('Must not start with a number or signs "-", "_"');
        return false;
      }
      if (/[_\-]$/.test(input.value)) {
        input.alert('Must not end with signs "-", "_"');
        return false;
      }
      if (!/^[A-z0-9_\-]+$/.test(input.value)) {
        input.alert('Contains invalid characters');
        return false;
      }

      return true;
    },
    onSubmit: function validateUsernameOnSubmit(input) {
      if (!input.value.length) {
        input.alert('Must not be empty');
        return false;
      }
      // TODO: Gửi form lên server để kiểm tra
      return true;
    },
  },
  $password: {
    normalValidate: function validatePassword(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value.length < 8) {
        input.alert('Password too short. At least 8 characters.')
        return false;
      }
      if (input.value.length > 50) {
        input.alert('Password too long (maximum 50 characters long)');
        return false;
      }

      const lower_match = input.value.toString().match(/[a-z]/g) || [];
      const upper_match = input.value.toString().match(/[A-Z]/g) || [];
      const number_match = input.value.toString().match(/[0-9]/g) || [];
      const special_match = input.value.toString().match(RegExp(SPECIAL_CHARACTER_RE, 'g')) || [];

      if (lower_match.length) {
        const enough_strong = upper_match.length && number_match.length && special_match.length;
        const enough_secure = number_match.length && upper_match.length;

        if (enough_strong && input.value.length > 13) {
          input.pass('Password strength: Very strong');
        }
        else if (enough_secure && input.value.length >= 10 || input.value.length >= 20) {
          input.pass('Password strength: Strong');
        }
        else if (enough_secure && input.value.length >= 8 || input.value.length >= 15) {
          input.pass('Password strength: Good');
        }
        else if (upper_match.length && input.value.length >= 8 || input.value.length >= 12) {
          input.warning('Password strength: Normal');
        }
        else if (input.value.length >= 10) {
          input.warning('Password strength: Weak');
        }
        else {
          input.risky('Password strength: Very Weak');
        }

        return true;
      }
    }
  },
  $repeat_password: {
    normalValidate: function validatePasswordRepeat(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value != serverSideValidateFormData['password']) {
        input.alert('Not match with password above');
        return false;
      }

      input.pass();
      return true;
    }
  },
  $firstname: {
    normalValidate: function validateFirstName(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value.length > 30) {
        input.alert('Name too long (maximum 30 characters long)');
        return false;
      }
      input.pass();
      return true;
    }
  },
  $lastname: {
    normalValidate: function validateLastName(input) {
      return eventListeners.$firstname.normalValidate(input);
    }
  },
  $email_address: {
    normalValidate: function validateEmail(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value.length > 50) {
        input.alert('Email too long. (maximum 50 characters long)')
        return false;
      }

      const re = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;

      if (!re.test(input.value)) {
        input.alert('Not a valid email.');
        return false;
      }

      const [ local_part, domain_part ] = input.value.split('@');
      const splitted_domain_part = domain_part.split('.') || [];

      if (local_part.length > 64) {
        input.alert('Your local part email too long. Therefore, your email is not valid.')
        return false;
      }

      if (splitted_domain_part.some(part => part.length > 63)) {
        input.alert('Your domain part email too long. Therefore, your email is not valid.');
        return false;
      }

      input.pass();
      return true;
    },
    onSubmit: function validateEmailOnSubmit(input) {
      if (!input.value.length) {
        input.alert('Must not be empty');
        return false;
      }
      return true;
    }
  },
  $phone_number: {
    normalValidate: function validatePhoneNumber(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value.length > 15) {
        input.alert('Phone number is too long. (maximum 15 digits)')
        return false;
      }
      if (!/^(?:^\+[0-9]|^0[0-9])[0-9]{7,15}/.test(input.value)) {
        input.alert('Not valid phone number');
        return false;
      }
      input.pass();
      return true;
    },
  },
}


const convertSecondToMinute = function convertSecondToMinute(sec) {
  const minutes = parseInt(+sec / 60);
  const seconds = +sec - (minutes * 60);
  return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
}


const getEventListenerCallback = function getEventListenerCallback(eventName, componentName) {
  const listeners = eventListeners['$' + componentName] || {};
  const onEventCallback = listeners[eventName] || listeners.normalValidate || (function (){});
  return onEventCallback;
}


/**`
 * @param {Array} fields
 */
const isAllFieldFilledOut = function isAllFieldFilledOut(fields) {
  return Array.from(fields).every(field => {
    switch (true) {
      case field.$input.type == 'checkbox':
      case field.$input.type == 'radio':
        return field.$input.checked;
      default:
        return field.$input?.value?.length > 0;
    }
  });
}


const isAllFieldValidated = function isAllFieldValidated(fields) {
  return Array.from(fields)
    .every(field => {
      // Check current field state
      const isPendingState = field.$description.classList.contains('pending');
      const isInvalidState = field.$description.classList.contains('invalid');
      const isNotFalsyState = !isPendingState && !isInvalidState;

      // On submit validate
      const snakeCaseFieldName = field.$input.getAttribute('name').replace(/\-/, '_');
      const onSubmitCallback = getEventListenerCallback('onSubmit', snakeCaseFieldName);
      const isSubmittedAssumePassed = onSubmitCallback(field.$input);
      return isNotFalsyState && isSubmittedAssumePassed;
    })
}


const useFetchAPI = function useFetchAPI(endpoint, method, body, header = null) {
  const headers = header || {
    'Content-Type': 'application/json;charset=UTF-8',
  };

  return fetch(endpoint, { method, body, headers })
    .then(response => response.json());;
}


const normalizeDollarSignFieldset = function normalizeDollarSignFieldset(fieldset) {
  const formBody = fieldset.$body || {};
  const fieldWithoutDollarSign = Object.keys(formBody).map(key => key.replace(/^\$/, ''));
  return fieldWithoutDollarSign;
}


const requestServerSideValidate = function requestServerSideValidate(fieldset) {
  const filledFieldSubset = serverSideValidateFormData.subset(...normalizeDollarSignFieldset(fieldset));

  return useFetchAPI('register/validate', 'POST', JSON.stringify(filledFieldSubset))
}


const requestServerSendVerificationCode = function requestServerSendVerificationCode() {
  const wholeFormData = serverSideValidateFormData;

  return useFetchAPI('register/code', 'POST', JSON.stringify(wholeFormData));
}


const submitRegister = function submitRegister() {
  const wholeFormData = serverSideValidateFormData;

  return useFetchAPI('register/submit', 'POST', JSON.stringify(wholeFormData))
}


const requestResendVerificationCode = function requestResendVerificationCode(event) {
  const descriptionElement = this.parentElement;
  const formFieldElement = descriptionElement.parentElement;
  const childSitter = document.createElement('small');
  const originalCodeResenderLink = descriptionElement.innerHTML;
  const wholeFormData = serverSideValidateFormData;

  let   countdownValue = 10;
  const countdownIcon = document.createElement('i').setClass('fa fa-envelope');
  const countdownText = document.createTextNode('Resend code in ');
  const countdownElement = document.createElement('b');
  countdownElement.innerText = convertSecondToMinute(countdownValue);
  childSitter.copyChildNodesOf(descriptionElement);

  descriptionElement.innerHTML = '';
  descriptionElement.appendChild(countdownIcon);
  descriptionElement.appendChild(countdownText);
  descriptionElement.appendChild(countdownElement);

  useFetchAPI('register/resend', 'POST', JSON.stringify(wholeFormData));

  // Fake state, to stop users restore the resend link when counting down
  const disablingPendingState = formFieldElement?.$input.pending;
  if (disablingPendingState) formFieldElement.$input.pending = () => {};

  const interval = setInterval(function resendTimerCountdown() {
    countdownElement.innerText = convertSecondToMinute(--countdownValue);

    if (countdownValue <= 0) {
      descriptionElement.innerHTML = originalCodeResenderLink;
      clearInterval(interval);
      descriptionElement.copyChildNodesOf(childSitter);
      if (disablingPendingState) formFieldElement.$input.pending = disablingPendingState;
    }
  }, 1000);
}



document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  // Apply pulse click effect
  effect.ripple.applyEffect();

  const multi_step_section = document.querySelector('.multi-step-section');
  const register_form = document.querySelector('.register-form');
  const fieldsets = register_form.querySelectorAll('fieldset');
  const local_context = Object.create(null);

  const multi_step_progress = new MultiStepProgress()
    .addStep('Account Info')
    .addStep('Profile Info')
    .addStep('Submit');

  const success_modal = new SuccessModal()
    .useDarkOverlay()
    .setButtonText('Sign In')
    .setParent(document.body);

  let current = fieldsets[0];

  fieldsets.forEach(function prepareFieldset(fieldset) {
    const fields = fieldset.querySelectorAll('.form-field');

    fieldset.$colorStripe = fieldset.querySelector('.color-stripe');
    fieldset.$title = fieldset.querySelector('.form__title');
    fieldset.$title.$legend = fieldset.querySelector('legend');
    fieldset.$body = fieldset.querySelector('.form__body');

    for (const field of fields) {
      field.$input = field.querySelector('input') || document.createElement('input');
      field.$icon = field.querySelector('i') || document.createElement('i');
      field.$placeholder = field.querySelector('label') || document.createElement('label');
      field.$description = field.querySelector('small') || document.createElement('small');

      const snakeCaseFieldName = field.$input.getAttribute('name').split('-').join('_');
      fieldset.$body['$' + snakeCaseFieldName] = field;

      const valid_icon = document.createElement('i').setClass('fa fa-check');
      const warning_icon = document.createElement('i').setClass('fa fa-exclamation');
      const invalid_icon = document.createElement('i').setClass('fa fa-times')

      const childSitter = document.createElement('small');

      field.$input.alert = function alert(text = '') {
        field.$description.innerHTML = '';
        field.$description.append(invalid_icon);
        field.$description.append(text);
        field.$description.setClass('invalid');
      }

      field.$input.risky = function risky(text = '') {
        field.$input.alert(text);
      }

      field.$input.warning = function warning(text = '') {
        field.$description.innerHTML = '';
        field.$description.append(warning_icon);
        field.$description.append(text);
        field.$description.setClass('warning');
      }

      field.$input.pass = function pass(text = '') {
        field.$description.innerHTML = '';
        field.$description.append(valid_icon);
        field.$description.append(text);
        field.$description.setClass('valid');
      }

      field.$input.recover = function recover() {
        field.$description.copyChildNodesOf(childSitter);
        field.$description.classList.value = '';
      }

      field.$input.pending = function pending() {
        field.$input.recover();

        if (!field.$description.classList.contains('pending')) {
          field.$description.setClass('pending');
        }
      }


      field.addEventListener('input', function onUserTyping(event) {
        if (field.$input.value !== serverSideValidateFormData[snakeCaseFieldName]) {
          serverSideValidateFormData[snakeCaseFieldName] = field.$input.value;
        }

        if (!childSitter.childNodes.length) {
          childSitter.copyChildNodesOf(field.$description);
        }
        
        clearTimeout(field._timer);
        field.$input.pending();
        
        /**
         * After 0.8 seconds, remove validate pending state and run 
         * the callback.
         */
        field._timer = setTimeout(function validateWhenUserStopTyping() {
          const onInputCallback = getEventListenerCallback('onInput', snakeCaseFieldName);
          onInputCallback(field.$input);
          field.$description.classList.remove('pending');
        }, 800);

        /**
         * After 0.3 seconds, if every field of current fieldset are not 
         * filled out, disable the submit button.
         */
        field._pending = setTimeout(function handleButtonClickableState() {
          if (isAllFieldFilledOut(fields)) {
            fieldset.$bottom.$next.enableButton();
          }
          else {
            fieldset.$bottom.$next.disableButton();
          }
        }, 300);
      });


      field.addEventListener('focusout', function onFocusOut(event) {
        if (!childSitter.childNodes.length) {
          childSitter.copyChildNodesOf(field.$description);
        }

        // Remove pending state immediately on focusout.
        clearTimeout(field._timer);
        field.$description.classList.remove('pending');

        if (!field.$input.value) {
          field.$input.recover();
        }
        else {
          const onFocusOutCallback = getEventListenerCallback('onFocusOut', snakeCaseFieldName);
          onFocusOutCallback(field.$input);
        }
      });
    }

    fieldset.$bottom = document.createElement('div').setClass('form__bottom row').setParent(fieldset);

    fieldset.$bottom.$prev = new StyledButton('prev-button', 'fa-arrow-left', 'Prev')
    fieldset.$bottom.$next = new StyledButton('next-button', 'fa-arrow-right', 'Next')

    fieldset.$bottom.$prev.style.setProperty('display', 'none');
    fieldset.$bottom.$next.style.setProperty('display', 'none');

    fieldset.$bottom.$prev.addEventListener('click', function() { fieldset.prev() });
    fieldset.$bottom.$next.addEventListener('click', function() { 
      const nextButtonCanClick = !fieldset.$bottom.$next.isDisabled();
      nextButtonCanClick && fieldset.$bottom.$next.click()
    });

    fieldset.$bottom.$next.disableButton();

    fieldset.$chain = Object.create(null);
    fieldset.$animation = Object.create(null);

    fieldset.update = function update() {
      if (this.$chain.$prev && !this.$bottom.$prev.parent) {
        this.$bottom.prepend(this.$bottom.$prev)
      }
      if (this.$chain.$next && !this.$bottom.$next.parent) {
        this.$bottom.append(this.$bottom.$next)
      }
    }

    fieldset.chain = function chainFieldSet(nextfs) {
      this.$chain.$next = nextfs;
      nextfs.$chain.$prev = this;

      this.update();
      nextfs.update();

      this.$bottom.$next.style.setProperty('display', 'block');
      nextfs.$bottom.$prev.style.setProperty('display', 'block');
      return this.$chain.$next;
    }

    fieldset.next = function nextFieldset() {
      if (this.$chain.$next && this.style.display !== 'none') {
        this.$animation.disappear();
        this.$chain.$next.$animation.next();

        multi_step_progress.nextStep();
        current = this.$chain.$next;
      }
    }

    fieldset.prev = function prevFieldset() {
      if (this.$chain.$prev && this.style.display !== 'none') {
        this.$animation.disappear();
        this.$chain.$prev.$animation.prev();

        multi_step_progress.prevStep();
        local_context.disableSubmit();
        current = this.$chain.$prev;
      }
    }

    fieldset.$animation.disappear = function triggerAnimationDisappear() {
      this.style.setProperty('visibility', 'hidden')
      this.style.setProperty('animation', 'disappear 1.25s linear');
      this.style.setProperty('display', 'none');  
    }
    .bind(fieldset)

    fieldset.$animation.next = function triggerAnimationSwipeLeft() {
      this.style.setProperty('visibility', 'visible')
      this.style.setProperty('animation', 'fadeInLeft 1.5s cubic-bezier(0.19, 1, 0.22, 1)');
      this.style.setProperty('display', 'block')
    }
    .bind(fieldset)

    fieldset.$animation.prev = function triggerAnimationSwipeRight() {
      this.style.setProperty('visibility', 'visible')
      this.style.setProperty('animation', 'fadeInRight 1.5s cubic-bezier(0.19, 1, 0.22, 1)');
      this.style.setProperty('display', 'block')
    }
    .bind(fieldset)

    fieldset.$bottom.$next.click = function nextButtonClick() {
      requestServerSideValidate(fieldset)
      .then(response => {
        const isBothClientServerValidated = !response.errors.length && isAllFieldValidated(fields);
        const isPenultimateFieldset = fieldset == fieldsets[fieldsets.length - 2];
        
        if (isPenultimateFieldset) requestServerSendVerificationCode(fieldset);
        if (isBothClientServerValidated) return fieldset.next();

        response.errors.forEach(function showErrorsResponse(error) {
          const componentName = '$' + error.param;
          const isVisibleField = fieldset.$body[componentName];
          isVisibleField && fieldset.$body[componentName].$input.alert(error.msg);
        })
      })
    }
  });

  // Go to the next form part if the user pressing enter key
  document.addEventListener('keyup', function activeNextFormOnEnterKeyPressed(event) {
    const isEnterKeyPressed = event.keyCode == 13;

    if (isEnterKeyPressed) {
      const nextButtonCanClick = current.$bottom && !current.$bottom.$next.isDisabled();

      if (isEnterKeyPressed && nextButtonCanClick) {
        current.$bottom.$next.click();
      }
    }
  });

  // Show multi step progress bar
  multi_step_section.append(multi_step_progress); 

  // Chaining the fieldsets together, you can go to the next fieldset only when 
  // previous fieldset passes the validation
  const last_fieldset = fieldsets[0].chain(fieldsets[1]).chain(fieldsets[2]);
  const fields = last_fieldset.querySelectorAll('.form-field');
  
  // Submit button still has the same behavior as a form's next button, but:
  // - It points to null, like the last node of the Linked List. 
  //   Therefore, it will not run the form's generic next callback
  // - It is default attached to the last fieldset. This helps to maintain the 
  //   code in future, when add more field is needed, just edit a single line.
  const submit_button = new StyledButton('submit-button', 'fa-check', 'Submit');
  last_fieldset.$bottom.append(submit_button);
  last_fieldset.$bottom.$next = submit_button;
  submit_button.disableButton();

  // Only enableButton() when GCaptcha is verified.
  local_context.disableSubmit = function resetCaptchaAndDisableSubmitButton() {
    submit_button.disableButton();
    return grecaptcha.reset();
  }

  // Disable the submit button on captcha expired
  globalContext.disableSubmit = function disableSubmitOnCaptchaExpired() {
    submit_button.disableButton();
  }

  // Install Google reCaptcha
  window.addEventListener('load', function setCaptchaOnRenderOptions() {
    if (!grecaptcha) return;

    grecaptcha.render(document.querySelector('.google-recaptcha'), {
      sitekey: '6LdV-iEeAAAAADMsIg3xd2OIUt2LoWqTmDrSYaiu',
      theme: 'light',
      'expired-callback': globalContext.disableSubmit,
      'error-callback': globalContext.disableSubmit,
      callback() {
        return isAllFieldFilledOut(fields) && submit_button.enableButton();
      }
    })
  });

  // Apply a custom event for resend code link (of the last fieldset)
  const resendVerificationCodeAnchor = document.getElementById('resend-verification-code');
  resendVerificationCodeAnchor.addEventListener('click', requestResendVerificationCode);

  // Submit the entire form to server, including verification_code for
  // checking. If successful, accept the registration then save it into
  // the database.
  submit_button.addEventListener('click', function submitForm(event) {
    submitRegister()
      .then(response => {
      const hasError = response.error;
      const input = last_fieldset.$body.$verification_code.$input;

      if (hasError) {
        input.alert(response.error.message);
        return;
      }

      const isSuccessful = response.success;

      if (isSuccessful) {
        input.pass();
        success_modal.showModal();
      }
    })
  });
  
  success_modal.onModalDismiss(function closeModalAndReloadPage() {
    success_modal.hideModal();
    location.href = '/register';
  });

  success_modal.onButtonClick(function closeModalAndRedirectToLogin() {
    success_modal.hideModal();
    location.href = '/login';
  })
});
