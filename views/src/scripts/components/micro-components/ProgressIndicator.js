/**
 * Progress indicator
 */
function ProgressIndicator() {
  const TotalIndicator = document.createElement('div').setClass('progress-indicator__total');
  const CurrentIndicator = document.createElement('div')
    .setClass('progress-indicator__current')
    .setParent(TotalIndicator);
  let isUnpredicted = false;

  const colors = {
    red: '#b53836',
    blue: '#328da8',
    gray: '#d6d6d6',
  }

  TotalIndicator.setColor = function setColor(color) {
    if (colors[color]) {
      CurrentIndicator.style.setProperty('background-color', colors[color]);
    }
    else {
      CurrentIndicator.style.setProperty('background-color', colors.red);
    }
    return this;
  }

  TotalIndicator.setPercentage = function setPercentage(percent) {
    if (!isUnpredicted) {
      CurrentIndicator.style.setProperty('width', `${percent}%`);
      TotalIndicator.setAttribute('title', `${percent}%`)
    }
    return this;
  }

  TotalIndicator.switchToUnpredicted = function switchToUnpredicted() {
    this.setColor('blue');
    CurrentIndicator.style.setProperty('width', '20%');
    CurrentIndicator.classList.add('endless-run');
    isUnpredicted = true;
    return this;
  }

  TotalIndicator.reset = function reset() {
    CurrentIndicator.classList.remove('endless-run');
    this.setColor('red');
    this.setPercentage(0);
    isUnpredicted = false;
    return this;
  }

  TotalIndicator.setColor('red');
  TotalIndicator.setPercentage(0)

  return TotalIndicator;
}


module.exports = ProgressIndicator;
