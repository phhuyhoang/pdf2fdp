/**
 * NOTE: Due to Browserify's unsupported, the code below only uses ES6 
 * promise.then instead of ES7 async-await
 */
const autoload = require('./helpers/autoload/prototype').init();

const MultiStepProgress = require('./components/register/MultiStepProgress.component');
const SuccessModal = require('./components/register/SuccessModal.component');
const ChainableFieldSet = require('./components/register/ChainableFieldSet.component');
const FormFieldInput = require('./components/register/micro-components/FormFieldInput.component');
const FormFieldCheckbox = require('./components/register/micro-components/FormFieldCheckbox.component');
const GoogleCaptcha = require('./components/register/micro-components/GoogleCaptcha.component');
const StyledButton = require('./components/register/micro-components/StyledButton.component');

const effect = require('./misc/effects');
const synchronizedFormData = {};


const eventListeners = {
  username: {
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
      return true;
    },
  },
  password: {
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

      const SPECIAL_CHARACTER_RE = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

      const lowerCaseExact = input.value.toString().match(/[a-z]/g) || [];
      const upperCaseExact = input.value.toString().match(/[A-Z]/g) || [];
      const numberExact = input.value.toString().match(/[0-9]/g) || [];
      const specialExact = input.value.toString().match(RegExp(SPECIAL_CHARACTER_RE, 'g')) || [];

      if (lowerCaseExact.length) {
        const enoughStrong = upperCaseExact.length && numberExact.length && specialExact.length;
        const enoughSecure = numberExact.length && upperCaseExact.length;

        if (enoughStrong && input.value.length > 13) {
          input.pass('Password strength: Very strong');
        }
        else if (enoughSecure && input.value.length >= 10 || input.value.length >= 20) {
          input.pass('Password strength: Strong');
        }
        else if (enoughSecure && input.value.length >= 8 || input.value.length >= 15) {
          input.pass('Password strength: Good');
        }
        else if (upperCaseExact.length && input.value.length >= 8 || input.value.length >= 12) {
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
  repeat_password: {
    normalValidate: function validatePasswordRepeat(input) {
      if (!input.value.length) {
        input.recover();
        return false;
      }
      if (input.value != synchronizedFormData['password']) {
        input.alert('Not match with password above');
        return false;
      }

      input.pass();
      return true;
    }
  },
  firstname: {
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
  lastname: {
    normalValidate: function validateLastName(input) {
      return eventListeners.firstname.normalValidate(input);
    }
  },
  email_address: {
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

      const [ localPartEmail, domainPartEmail ] = input.value.split('@');
      const splittedLocalPart = domainPartEmail.split('.') || [];

      if (localPartEmail.length > 64) {
        input.alert('Your local part email too long. Therefore, your email is not valid.')
        return false;
      }

      if (splittedLocalPart.some(part => part.length > 63)) {
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
  phone_number: {
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


const useFetchAPI = function useFetchAPI(endpoint, method, body, header = null) {
  const headers = header || {
    'Content-Type': 'application/json;charset=UTF-8',
  };
  return fetch(endpoint, { method, body, headers })
    .then(response => response.json());
};

/**
 * @param {String} event - Event name
 * @param {String} component - Component name
 */
const getEventListenerCallback = function getEventListenerCallback(event, component) {
  const assigneeListeners = eventListeners[component] || {};
  const listenerCallback = assigneeListeners[event] || assigneeListeners.normalValidate || (function (){});
  return listenerCallback;
}

/**
 * @param {ChainableFieldSet} fieldset
 */
const isThisFormFilledAll = function isThisFormFilledAll(fieldset) {
  return fieldset.attachedFields.every(function checkFillingStateOf(field) {
    const inputElement = field.$input;

    switch (true) {
      case inputElement.type == 'checkbox':
      case inputElement.type == 'radiobox':
        return inputElement.checked;
      default:
        return inputElement.value?.length > 0;
    }
  });
}

const isThisFormValidatedAll = function isThisFormValidatedAll(fieldset) {
  return fieldset.attachedFields.every(function checkValidatedStateOf(field) {
    const inputElement = field.$input;
    const descriptionElement = field.$description;

    const isPendingState = descriptionElement.classList.contains('pending');
    const isInvalidState = descriptionElement.classList.contains('invalid');
    const isNotFalsyState = !isPendingState && !isInvalidState;

    const snakeCaseFieldName = inputElement.getAttribute('name').replace(/\-/g, '_');
    const onSubmitCallback = getEventListenerCallback('onSubmit', snakeCaseFieldName);
    const isSubmittedAssumePassed = onSubmitCallback(inputElement);
    return isNotFalsyState && isSubmittedAssumePassed;
  })
}

const serverRequestAsync = {
  requestToValidateFormFields: function requestServerSideValidateForm(fieldset) {
    const normalizedFieldNames = fieldset.attachedFields.map(field => field.context.name.replace(/^\$/, '').replace(/\-/, '_'));
    const filledFieldSubset = synchronizedFormData.subset(...normalizedFieldNames);

    return useFetchAPI('register/validate', 'POST', JSON.stringify(filledFieldSubset));
  },

  requestToGetVerificationCodeByEmail: function requestToGetVerificationCodeByEmail() {
    return useFetchAPI('register/code', 'POST', JSON.stringify(synchronizedFormData));
  },

  requestToResendVerificationCode: function requestToResendVerificationCode() {
    return useFetchAPI('register/resend', 'POST', JSON.stringify(synchronizedFormData));
  },

  requestToSubmitRegisterForm: function requestToSubmitRegisterForm() {
    return useFetchAPI('register/submit', 'POST', JSON.stringify(synchronizedFormData))
  }
}

const utils = {
  convertSecondToMinute: function convertSecondToMinute(sec) {
    const minutes = parseInt(+sec / 60);
    const seconds = +sec - (minutes * 60);
    return minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
  }
}



document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  // Apply pulse click effect
  effect.ripple.applyEffect();

  const multi_step_section = document.querySelector('.multi-step-section');
  const register_form = document.querySelector('.register-form');

  const multi_step_progress = new MultiStepProgress()
    .addStep('Account Info')
    .addStep('Profile Info')
    .addStep('Submit');

  // Show multi step progress bar
  multi_step_section.append(multi_step_progress);

  const success_modal = new SuccessModal()
    .useDarkOverlay()
    .setButtonText('Sign In')
    .setParent(document.body);

  /**
   |--------------------------------------------------------------------
   | Forms initialization
   |-------------------------------------------------------------------- 
   */

  const account_info_fieldset = new ChainableFieldSet('Account Info').setParent(register_form);
  const profile_info_fieldset = new ChainableFieldSet('Profile Info').setParent(register_form);
  const verify_email_fieldset = new ChainableFieldSet('Verify Email Address').setParent(register_form);

  const fieldsets = [account_info_fieldset, profile_info_fieldset, verify_email_fieldset];

  account_info_fieldset.chainWith(
    profile_info_fieldset, 
    verify_email_fieldset
  );

  const username_input = new FormFieldInput(
      'text', 'username', 'fa-user-circle', 
      'Username', 
      'Only letters, numbers, - and _ can be used.')
    .maxlength(50);
  const password_input = new FormFieldInput(
      'password', 'password', 'fa-fingerprint',
      'Password',
      'A strong password must contain uppercase, lowercase, number, special character and at least 8 characters.')
    .maxlength(50);
  const repeat_password_input = new FormFieldInput(
      'password', 'repeat-password', 'fa-fingerprint',
      'Repeat Password',
      'Must match the password above.')
    .maxlength(50);

  account_info_fieldset.attach(username_input, password_input, repeat_password_input);

  const firstname_input = new FormFieldInput(
      'text', 'firstname', 'fa-tag',
      'First Name',
      'Must be a meaningful name.')
    .maxlength(30);
  const lastname_input = new FormFieldInput(
      'text', 'lastname', 'fa-tag',
      'Last Name',
      'Must be a meaningful name.')
    .maxlength(30);
  const email_address_input = new FormFieldInput(
      'email', 'email-address', 'fa-at',
      'Email Address',
      'Not used for marketing.')
    .maxlength(50);
  const phone_number_input = new FormFieldInput(
      'tel', 'phone-number', 'fa-mobile-alt',
      'Phone Number',
      'Not used for marketing.')
    .maxlength(15);

  profile_info_fieldset.attach(firstname_input, lastname_input, email_address_input, phone_number_input);

  const verification_code_input = new FormFieldInput(
      'text', 'verification-code', 'fa-key',
      'Verification Code',
      '6-digit code, sent via email. <a id="resend-verification-code" href="#">Missing code?</a>')
    .maxlength(6);
  const terms_policy_checkbox = new FormFieldCheckbox(
      'terms-policy', 'terms', 'fa-check',
      'I accept the <a href="/terms">Terms of Service</a> and the <a href="/privacy">Privacy Policy</a>'
    );
  const google_recaptcha = new GoogleCaptcha('google-recaptcha', '6LdV-iEeAAAAADMsIg3xd2OIUt2LoWqTmDrSYaiu');

  verify_email_fieldset
    .attach(verification_code_input)
    .attachExclusion(terms_policy_checkbox, google_recaptcha);

  /**
   |--------------------------------------------------------------------
   | Local settings & local variables
   |-------------------------------------------------------------------- 
   */

  let current = account_info_fieldset;

  // Submit button still has the same behavior as a form's next button, but:
  // - It points to null, like the last node of the Linked List. 
  //   Therefore, it will not run the form's generic next callback
  // - It is default attached to the last fieldset. This helps to maintain the 
  //   code in future more easier.
  const lastFieldSet = fieldsets[fieldsets.length - 1];
  const lastFieldSetNextButton = lastFieldSet.$bottom.$next_button;
  const submitButton = new StyledButton('submit-button', 'fa-check', 'Submit');
  lastFieldSet.replaceButton(lastFieldSetNextButton, submitButton);
  submitButton.disableButton();

  const termPolicyCheckbox = terms_policy_checkbox.$input;
  termPolicyCheckbox.addEventListener('change', () => 
    termPolicyCheckbox.checked
    ? submitButton.enableButton() 
    : submitButton.disableButton());

  // Enable/Disable the Submit button depends on Google Captcha verification status
  google_recaptcha.onExpiredCallback(() => submitButton.disableButton());
  google_recaptcha.onErrorCallback(() => submitButton.disableButton());
  google_recaptcha.onSuccessCallback(() => submitButton.enableButton());

  // Wrapper function for submitButton, prevent it from being enabled unless
  // termPolicyCheckbox and googleCaptcha are checked
  const enableSubmitButton = submitButton.enableButton;
  submitButton.enableButton = function enableButtonWithAdditionalCondition() {
    const enteredVerificationCode = isThisFormFilledAll(lastFieldSet);
    const agreedTermsAndPolicies = terms_policy_checkbox.$input.checked;
    const verifiedGoogleCaptcha = google_recaptcha.checked;

    if (enteredVerificationCode && agreedTermsAndPolicies && verifiedGoogleCaptcha) enableSubmitButton();
  }

  submitButton.addEventListener('click', function submitForm(event) {
    serverRequestAsync.requestToSubmitRegisterForm()
    .then(function responseAfterAll(response) {
      const inputElement = lastFieldSet.$body.$verification_code.$input;

      if (response.error) {
        inputElement.alert(response.error.message);
        return;
      }

      if (response.success) {
        inputElement.pass();
        success_modal.showModal();
      }
    })
  })

  success_modal.onModalDismiss(function closeModalAndReloadPage() {
    success_modal.hideModal();
    location.href = '/register';
  });

  success_modal.onButtonClick(function closeModalAndRedirectToLogin() {
    success_modal.hideModal();
    location.href = '/login';
  });

  // Enter keymapping for the Next button
  document.addEventListener('keyup', function pressEnterKeyToSwitchNext(event) {
    const isEnterKeyPressed = event.keyCode == 13;

    if (isEnterKeyPressed) {
      const nextButton = current?.$bottom?.$next_button;
      nextButton?.clickButton();
    }
  });

  // Resend verification code of the last fieldset
  const resendVerificationCodeLink = document.getElementById('resend-verification-code');
  const countdownIcon = document.createElement('i').setClass('fa fa-envelope');
  const countdownMessage = document.createTextNode('Resend code in ');
  const countdownElement = document.createElement('b');

  resendVerificationCodeLink.addEventListener('click', function requestResendVerificationCode() {
    const descriptionLabelElement = this.parentElement;
    const formFieldWrapperElement = descriptionLabelElement.parentElement;
    const localChildSitter = document.createElement('small');

    let   countdownValue = 60;
    countdownElement.innerText = utils.convertSecondToMinute(countdownValue);
    localChildSitter.copyChildNodesOf(descriptionLabelElement);

    descriptionLabelElement.removeAllChild();
    descriptionLabelElement.append(countdownIcon, countdownMessage, countdownElement);

    serverRequestAsync.requestToResendVerificationCode();

    // Fake state, to stop users restore the resend link when counting down
    const inputElement = formFieldWrapperElement.$input;
    const pendingStateOriginal = inputElement.pending;
    formFieldWrapperElement.$input.pending = (() => {});

    const countdownInterval = setInterval(function unresendableCountdown() {
      countdownElement.innerText = utils.convertSecondToMinute(--countdownValue);

      if (countdownValue <= 0) {
        descriptionLabelElement.copyChildNodesOf(localChildSitter);
        formFieldWrapperElement.$input.pending = pendingStateOriginal;
        clearTimeout(countdownInterval);
      }
    }, 1000);
  });

  /**
   |--------------------------------------------------------------------
   | Form component event listeners
   |-------------------------------------------------------------------- 
   */

  for (const fieldset of fieldsets) {

    const fieldsetBody = fieldset.$body;
    const previousButton = fieldset.$bottom.$prev_button;
    const nextButton = fieldset.$bottom.$next_button;

    const onNextFormSwitchingCallback = function onNextFormSwitchingCallback(formAction) {
      serverRequestAsync.requestToValidateFormFields(fieldset)
      .then(response => {
        // If the server doesn't return an error
        const isServerValidated = !response?.errors?.length;
        const isClientValidated = isThisFormValidatedAll(fieldset);
        const isBothClientServerValidated = isServerValidated && isClientValidated;

        const isPenultimateFieldset = fieldsets.indexOf(fieldset) == (fieldsets.length - 2);
        if (isPenultimateFieldset) serverRequestAsync.requestToGetVerificationCodeByEmail();
        if (isBothClientServerValidated) {
          current = fieldset.chainContext.next;
          multi_step_progress.nextStep();
          return formAction.nextFormSwitch();
        }

        // Otherwise
        response.errors.forEach(function showErrorResponse(errors) {
          const componentName = '$' + errors.param;
          const componentBelongToThisFieldset = fieldsetBody[componentName];

          if (componentBelongToThisFieldset) {
            const inputElement = fieldsetBody[componentName].$input;
            inputElement.alert(errors.msg);
          }
        })
      })
    };

    const onPreviousFormSwitchingCallback = function onPreviousFormSwitchingCallback(formAction) {
      const isLastFieldset = fieldsets.indexOf(fieldset) == (fieldsets.length - 1);

      if (isLastFieldset) {
        submitButton.disableButton();
        grecaptcha && grecaptcha.reset();
      }

      current = fieldset.chainContext.prev;
      formAction.prevFormSwitch();
      multi_step_progress.prevStep();
    }

    nextButton.disableButton();
    fieldset.onNextButtonClick(onNextFormSwitchingCallback);
    fieldset.onPrevButtonClick(onPreviousFormSwitchingCallback);

    for (const field of fieldset.attachedFields) {

      const inputElement = field.$input;
      const descriptionElement = field.$description;

      if (!inputElement) continue;

      const childSitter = document.createElement('small');
      const snakeCaseFieldName = inputElement.getAttribute('name').replace(/\-/g, '_');

      field.childSitter = childSitter;

      field.addEventListener('input', function onUserTyping(event) {
        if (inputElement.value !== synchronizedFormData[snakeCaseFieldName]) {
          synchronizedFormData[snakeCaseFieldName] = inputElement.value;
        }

        if (!childSitter.childNodes.length) {
          childSitter.copyChildNodesOf(descriptionElement);
        }

        clearTimeout(field.pendingStateDurationTimeout);
        inputElement.pending();

        /**
         * After 0.8 seconds, remove pending state and run the validation
         * callback
         */
        field.pendingStateDurationTimeout = setTimeout(function validateWhenUserStoppedTyping() {
          const onInputCallback = getEventListenerCallback('onInput', snakeCaseFieldName);
          onInputCallback.call(null, inputElement);
          descriptionElement.classList.remove('pending');
        }, 500);

        /**
         * After 0.3 seconds, if every field of current fieldset are not 
         * filled out, disable the submit button.
         */
        field.disableButtonTimeout = setTimeout(function handleButtonClickableState() {
          if (isThisFormFilledAll(fieldset))
            nextButton.enableButton();
          else
            nextButton.disableButton();
        }, 300);
      });

      field.addEventListener('focusout', function recoverStateOnFocusOut() {
        if (!childSitter.childNodes.length) {
          childSitter.copyChildNodesOf(descriptionElement);
        }

        // Remove pending state immediately on focusout.
        clearTimeout(field.pendingStateDurationTimeout);
        descriptionElement.classList.remove('pending');

        if (!inputElement.value) {
          inputElement.recover();
          return;
        }

        const onFocusOutCallback = getEventListenerCallback('onFocusOut', snakeCaseFieldName);
        onFocusOutCallback.call(null, inputElement);
      })
    }
  }
});
