/**
 * Create a text-based count up timer
 */
function CountUpTimer() {
  const CountUpDivElement = document.createElement('div');
  const CountUpTextNode = document.createTextNode('').setParent(CountUpDivElement);
  let interval = null;

  CountUpDivElement.setClass('countup-timer');

  const units = Object.create(null);
    units.hours = 0;
    units.minutes = 0;
    units.seconds = 0;

  CountUpTextNode.renderTimer = function renderTimer() {
    const seconds = units.seconds.toString().padStart(2, '0');
    const minutes = units.minutes.toString().padStart(2, '0');
    const hours = units.hours.toString();
    CountUpTextNode.textContent = `${hours}:${minutes}:${seconds}`;
  }

  CountUpTextNode.increaseOneSecond = function increaseOneSecond() {
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

  CountUpDivElement.resetTimer = function resetTimer() {
    units.hours = 0;
    units.minutes = 0;
    units.seconds = 0;
  }

  CountUpDivElement.startTimer = function startTimer() {
    interval = setInterval(function countUp() {
      CountUpTextNode.increaseOneSecond();
      CountUpTextNode.renderTimer();
    }, 1000)
  }

  CountUpDivElement.stopTimer = function stopTimer() {
    clearInterval(interval);
    interval = null;
  }

  CountUpDivElement.$text = CountUpTextNode;

  CountUpTextNode.renderTimer();

  return CountUpDivElement;
}


module.exports = CountUpTimer;
