const util = require('../../util/helper');


/**
 * Show upload progress
 * @param {Number<Int>} Total number of 
 */
function TransferTracker(total = 0) {
  const DivElement = document.createElement('div').setClass('transfer-tracker');
  const PercentIndicator = document.createElement('span').setParent(DivElement);
  const PacketIndicator = document.createElement('span').setParent(DivElement);

  const tracker = {
    currentAsByte: 0,
    totalAsByte: total,
    current: util.humanFileSize(0),
    total: util.humanFileSize(total),
  }

  DivElement.renderContent = function renderContent() {
    const packet_text = `${tracker.current} / ${tracker.total}`;
    const percent_text = this.getPercentage() + '%';
    PacketIndicator.textContent = packet_text;
    PercentIndicator.textContent = percent_text;
  }

  DivElement.setCurrentAsByte = function setCurrentAsByte(byte) {
    if (Number.isInteger(byte)) {
      tracker.currentAsByte = byte;
      tracker.current = util.humanFileSize(byte);
      this.renderContent();
    }
    return this;
  }

  DivElement.setTotalAsByte = function setTotalAsByte(byte) {
    if (Number.isInteger(byte)) {
      tracker.totalAsByte = byte;
      tracker.total = util.humanFileSize(byte);
      this.renderContent();
    }
    return this;
  }

  DivElement.getPercentage = function getPercentage() {
    return (tracker.currentAsByte / tracker.totalAsByte * 100).toFixed(2);
  }

  DivElement.renderContent();

  DivElement.$percent = PercentIndicator;
  DivElement.$packet = PacketIndicator;

  DivElement.$percent.value = 0;
  DivElement.$packet.tracker = tracker;

  return DivElement;
}


module.exports = TransferTracker;
