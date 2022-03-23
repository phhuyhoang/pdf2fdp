const DOM = require('../../../helpers/util/dom.util');

const template = `
<div class="countup-timer">
  <span></span>
</div>
`


/**
 * Create a text-based count up timer
 */
function CountUpTimer() {
  const { ancestor, descendant } = DOM.parse(template, 
  {
    members: {
      text: '.countup-timer > span',
    }
  });

  const root = ancestor;

  let interval = null;
  let units = Object.create(null);

  units.hours = 0;
  units.minutes = 0;
  units.seconds = 0;

  root.$text = descendant.text;


  root.resetTimer = function resetTimer() {
    units.hours = 0;
    units.minutes = 0;
    units.seconds = 0;
  }

  root.startTimer = function startTimer() {
    interval = setInterval(function startCountUp() {
      descendant.text.increaseOneSecond();
      descendant.text.renderTimer();
    }, 1000);
  }

  root.stopTimer = function stopTimer() {
    clearInterval(interval);
    interval = null;
  }

  descendant.text.renderTimer = function renderTimer() {
    const seconds = units.seconds.toString().padStart(2, '0');
    const minutes = units.minutes.toString().padStart(2, '0');
    const hours = units.hours.toString();
    descendant.text.textContent = `${hours}:${minutes}:${seconds}`;
  }

  descendant.text.increaseOneSecond = function increaseOneSecond() {
    units.seconds++;

    if (units.seconds >= 60) {
      units.minutes++;
      units.seconds -= 60;
    }

    if (units.minutes >= 60) {
      units.hours++;
      units.minutes -= 60;
    }
  }

  descendant.text.renderTimer();

  return root;
}


module.exports = CountUpTimer;
