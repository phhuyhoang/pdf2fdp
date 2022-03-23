const DOM = require('../../helpers/util/dom.util');
const CountUpTimer = require('./micro-components/CountUpTimer.component');
const ProgressIndicator = require('./micro-components/ProgressIndicator.component');
const DropdownSelect = require('./micro-components/DropdownSelect.component');
const StyledButton = require('./micro-components/StyledButton.component');
const TransferTracker = require('./micro-components/TransferTracker.component');

const STATUS_ENUM = [ 'ready', 'uploading', 'converting', 'done' ];

const template = `
<div class="progress-bar">
  <div class="head">
      {{filename}}
  </div>
  <div class="body">
      
  </div>
  <div class="tail">
      
  </div>
</div>
`;


const createSpanTextFromContent = function createSpanTextFromContent(content) {
  const SpanNode = document.createElement('span');
  SpanNode.textContent = content;
  return SpanNode;
}


const resetCountupTimer = function resetCountupTimer(timer) {
  timer.resetTimer();
  timer.stopTimer();
  return timer;
}


/**
 * Create and manage convert progress
 * @param {string} filename - Filename
 * @param {number} code - Phase code
 */
function ProgressBar(filename, code = 0) {
  const style = {
    name: 'progress-bar',
    number: 1,
  };

  const { ancestor, descendant } = DOM.parse(template, 
  {
    members: {
      head: '.progress-bar > .head',
      body: '.progress-bar > .body',
      tail: '.progress-bar > .tail',
    },

    context: {
      filename: filename || 'NO_NAME',
    },
  });

  const root = ancestor;

  let phase_code  = code;

  // Micro components
  const prefix_text = document.createElement('span');
  const indicator = new ProgressIndicator();
  const countup_timer = new CountUpTimer();
  const transfer_tracker = new TransferTracker();
  const dropdown_select = new DropdownSelect();

  const option_button = 
        new StyledButton('option-button', 'fa-wrench', '')
            .setClass('option-button')
            .asSimplestButton();

  const download_button = 
        new StyledButton('download-button', 'fa-download', 'Download')
            .setClass('download-button');

  const link_download = document.createElement('a');
  const remove_button = document.createElement('i').setClass('fa fa-times').setParent(descendant.tail);

  root.$head = descendant.head;
  root.$body = descendant.body;
  root.$tail = descendant.tail;

  root.$body.$prefix_text = prefix_text;
  root.$body.$indicator = indicator;
  root.$body.$countup_timer = countup_timer;
  root.$body.$dropdown_select = dropdown_select;
  root.$body.$option_button = option_button;
  root.$body.$download_button = download_button;

  root.$tail.$remove_button = remove_button;

  const file_icon = document.createElement('i').setClass('fa fa-file');
  const uploading_icon = document.createElement('i').setClass('fa fa-cloud-upload-alt');
  const rolling_cog_icon = document.createElement('i').setClass('fa fa-cog');
  const mark_done_icon = document.createElement('i').setClass('fa fa-check');
  const error_icon = document.createElement('i').setClass('fa fa-times');


  const updateState = function updateState() {
    descendant.body.removeAllChilds();

    switch (STATUS_ENUM[phase_code]) {

      case 'ready':
        createSpanTextFromContent('CONVERT TO:').setParent(descendant.body);
        descendant.body.append(dropdown_select);
        createSpanTextFromContent('OPTIONS:').setParent(descendant.body);
        descendant.body.append(option_button);
        descendant.head.append(file_icon);
        return;

      case 'uploading':
        createSpanTextFromContent('UPLOADING').setParent(descendant.body);
        descendant.body.append(indicator);
        descendant.body.append(transfer_tracker);
        descendant.head.refresh();
        descendant.head.append(uploading_icon);
        return;

      case 'converting':
        createSpanTextFromContent('CONVERTING').setParent(descendant.body);
        descendant.head.refresh();
        descendant.head.append(rolling_cog_icon);
        descendant.body.append(indicator);
        descendant.body.append(countup_timer);

        resetCountupTimer(countup_timer);
        indicator.setColor('blue');
        indicator.switchToUnpredicted();
        countup_timer.startTimer();
        return;

      case 'done':
        resetCountupTimer(countup_timer);
        descendant.head.refresh();
        descendant.head.append(mark_done_icon);
        descendant.body.append(download_button);
        return;

      default: return;
    }
  }

  root.setFileName = function setFileName(filename) {
    if (typeof filename == 'string') {
      descendant.head.textContent = filename;
    }
    return this;
  }

  root.nextPhase = function nextPhase() {
    phase_code++;
    updateState();
    return STATUS_ENUM[phase_code];
  }

  root.resetPhase = function resetPhase() {
    phase_code = 0;
    updateState();
    return STATUS_ENUM[phase_code];
  }

  root.setSelectionList = function setSelectionList(selects = []) {
    dropdown_select.setSelectionList(selects);
    return this;
  }

  root.setPercentage = function setPercentage(percent) {
    indicator.setPercentage(percent);
    return this;
  }

  root.reportProgress = function reportProgress(current, total) {
    if (total) transfer_tracker.setTotalAsByte(total);
    if (current) transfer_tracker.setCurrentAsByte(current);
    const percent = transfer_tracker.getPercentage();

    this.setPercentage(percent);
    return this;
  }

  root.setDownloadUrl = function setDownloadUrl(url) {
    if (!link_download.hasAttribute('href')) {
      download_button.onclick = function clickDownload(event) {
        event.preventDefault();
        link_download.click();
      }
    }

    link_download.setAttribute('href', url);
  }

  root.showAlert = function showAlert(error, code, message) {
    const ERROR = error || 'ERROR';
    const CODE = code || '';
    const MESSAGE = message || 'An uncaught error occurred.';

    const errorAlert = 
      createSpanTextFromContent(`${ERROR} ${CODE}`)
      .setClass('error-alert');

    errorAlert.setAttribute('title', MESSAGE);
    resetCountupTimer(countup_timer);

    descendant.body.removeAllChilds().append(errorAlert);
    descendant.head.refresh();
    descendant.head.append(error_icon);
    return this;
  }

  descendant.body.removeAllChilds = function removeAllChilds() {
    const el = this;

    while (el.firstChild)
      el.removeChild(el.firstChild);

    return this;
  }

  descendant.head.refresh = function refresh() {
    descendant.body.removeAllChilds.call(this);
    root.setFileName(filename);
    return this;
  }

  root.applyStyle(style.name, style.number);
  root.setFileName(filename);

  root.append(descendant.head, descendant.body, descendant.tail)
  updateState();

  return root;
}


module.exports = ProgressBar;
