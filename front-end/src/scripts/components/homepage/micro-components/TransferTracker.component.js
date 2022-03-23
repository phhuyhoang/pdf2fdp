const DOM = require('../../../helpers/util/dom.util');
const sizelib = require('../../../helpers/util/size.util');

const template = `
<div class="transfer-tracker">
    <span class="percent-indicator"></span>
    <span class="packet-indicator"></span>
</div>
`;


/**
 * Show upload progress
 * @param {Number<Int>} Total number of 
 */
function TransferTracker(total = 0) {
  const { ancestor, descendant } = DOM.parse(template, 
    {
      members: {
        percent: '.transfer-tracker > .percent-indicator',
        packet: '.transfer-tracker > .packet-indicator',
      }
    }
  );

  const root = ancestor;

  const tracker = {
    current: sizelib.humanFileSize(0),
    currentAsByte: 0,
    total: sizelib.humanFileSize(total),
    totalAsByte: total,
  }

  root.$percent = descendant.percent;
  root.$packet = descendant.packet;

  descendant.percent.value = 0;
  descendant.packet.tracker = tracker;


  root.renderContent = function renderContent() {
    const packet_text = `${tracker.current} / ${tracker.total}`;
    const percent_text = root.getPercentage() + '%';

    descendant.packet.textContent = packet_text;
    descendant.percent.textContent = percent_text;
    return this;
  }

  root.setCurrentAsByte = function setCurrentAsByte(byte) {
    if (Number.isInteger(byte)) {
      tracker.currentAsByte = byte;
      tracker.current = sizelib.humanFileSize(byte);
      this.renderContent();
    }
    return this;
  }

  root.setTotalAsByte = function setTotalAsByte(byte) {
    if (Number.isInteger(byte)) {
      tracker.totalAsByte = byte;
      tracker.total = sizelib.humanFileSize(byte);
      this.renderContent();
    }
    return this;
  }

  root.getPercentage = function getPercentage() {
    return (tracker.currentAsByte / tracker.totalAsByte * 100).toFixed(2);
  }

  root.renderContent();
  return root;
}


module.exports = TransferTracker;
