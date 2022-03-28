const DOM = require('../../../helpers/util/dom.util');


const template = `
<div class="col-md-10 offset-md-1">
    <div class="{{name}}"></div>
</div>
`


function GoogleCaptcha(name, sitekey, theme = 'light') {

  const { ancestor } = DOM.parse(template,
    {
      context: {
        name,
      }
    }
  );

  const root = ancestor;

  root.checked = false;

  const listeners = {
    onSuccess: () => {},
    onExpired: () => {},
    onErrors: () => {},
  }

  const inTimeListener = {
    onExpired: callback => {
      root.checked = false;
      listeners.onExpired(callback)
    },

    onErrors: callback => {
      root.checked = false;
      listeners.onErrors(callback)
    },
    
    onSuccess: callback => {
      root.checked = true;
      listeners.onSuccess(callback)
    },
  }

  // Install Google reCaptcha
  window.addEventListener('load', function setCaptchaOnRenderOptions() {
    if (!grecaptcha) return;

    grecaptcha.render(document.querySelector(`.${name}`), {
      sitekey,
      theme,
      callback: inTimeListener.onSuccess,
      'expired-callback': inTimeListener.onExpired,
      'error-callback': inTimeListener.onErrors,
    })
  })


  root.onSuccessCallback = function onSuccessCallback(callback) {
    listeners.onSuccess = callback;
    return this;
  }

  root.onExpiredCallback = function onExpiredCallback(callback) {
    listeners.onExpired = callback;
    return this;
  }

  root.onErrorCallback = function onErrorCallback(callback) {
    listeners.onErrors = callback;
    return this;
  }

  return root;
}


module.exports = GoogleCaptcha;
