/**
 * @see views/src/styles/effects/ripple.scss
 */
const ripple = {
  applyEffect: function applyEffect(callback) {
    ripple.installEffect(document, callback);
  },

  installEffect: function installEffect(target, callback) {
    target.onclick = function applyCursorRippleEffect(e) {
      const ripple = target.createElement('div');

      ripple.className = 'ripple';
      target.body.appendChild(ripple);

      ripple.style.setProperty('left', `${e.clientX}px`);
      ripple.style.setProperty('top', `${e.clientY}px`);

      ripple.style.animation = 'ripple-effect .4s linear';
      ripple.onanimationend = () => target.body.removeChild(ripple);

      if (typeof callback == 'function') {
        callback(ripple, e);
      }
    }
  }
}


module.exports = { ripple };
