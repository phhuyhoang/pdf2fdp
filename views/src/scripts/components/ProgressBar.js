const CountUpTimer = require('./micro-components/CountUpTimer');
const ProgressIndicator = require('./micro-components/ProgressIndicator');
const DropdownSelect = require('./micro-components/DropdownSelect');
const StyledButton = require('./micro-components/StyledButton');
const TransferTracker = require('./micro-components/TransferTracker');


const createSpanTextFromContent = function createSpanTextFromContent(content) {
  const SpanNode = document.createElement('span');
  SpanNode.textContent = content;
  return SpanNode;
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
  const status_enum = [ 'ready', 'uploading', 'converting', 'done' ];
  let phase_code = code;

  const DivElement = document.createElement('div');
  const HeadDivElement = document.createElement('div').setClass('head');
  const BodyDivElement = document.createElement('div').setClass('body');
  const TailDivElement = document.createElement('div').setClass('tail');

  // Micro components
  const prefix_text = document.createElement('span');
  const indicator = new ProgressIndicator();
  const transfer_tracker = new TransferTracker();
  const countup_timer = new CountUpTimer();
  const dropdown_select = new DropdownSelect();
  const option_button = new StyledButton('option-button', 'fa-wrench', '')
    .setClass('option-button')
    .asSimplestButton();
  const download_button = new StyledButton('download-button', 'fa-download', 'Download')
    .setClass('download-button');
  const link_download = document.createElement('a');

  const file_icon = document.createElement('i').setClass('fa fa-file');
  const uploading_icon = document.createElement('i').setClass('fa fa-cloud-upload-alt');
  const rolling_cog_icon = document.createElement('i').setClass('fa fa-cog');
  const mark_done_icon = document.createElement('i').setClass('fa fa-check');
  const error_icon = document.createElement('i').setClass('fa fa-times');

  DivElement.$head = HeadDivElement;
  DivElement.$body = BodyDivElement;
  DivElement.$tail = TailDivElement;

  BodyDivElement.$prefix_text = prefix_text;
  BodyDivElement.$indicator = indicator;
  BodyDivElement.$countup_timer = countup_timer;
  BodyDivElement.$dropdown_select = dropdown_select;
  BodyDivElement.$option_button = option_button;
  BodyDivElement.$download_button = download_button;

  TailDivElement.$remove_button = document.createElement('i').setClass('fa fa-times').setParent(TailDivElement);

  const updateState = function updateState() {
    BodyDivElement.removeAllChilds();

    switch (status_enum[phase_code]) {
      case 'ready':
        createSpanTextFromContent('CONVERT TO:').setParent(BodyDivElement);
        BodyDivElement.append(dropdown_select);
        createSpanTextFromContent('OPTIONS:').setParent(BodyDivElement);
        BodyDivElement.append(option_button);
        HeadDivElement.append(file_icon);
        return this;
      case 'uploading':
        createSpanTextFromContent('UPLOADING').setParent(BodyDivElement);
        BodyDivElement.append(indicator);
        BodyDivElement.append(transfer_tracker);
        HeadDivElement.refresh();
        HeadDivElement.append(uploading_icon);
        return this;
      case 'converting':
        createSpanTextFromContent('CONVERTING').setParent(BodyDivElement);
        indicator.setColor('blue');
        indicator.switchToUnpredicted();
        countup_timer.resetTimer();
        countup_timer.startTimer();
        HeadDivElement.refresh();
        HeadDivElement.append(rolling_cog_icon);
        BodyDivElement.append(indicator);
        BodyDivElement.append(countup_timer);
        return this;
      case 'done':
        HeadDivElement.refresh();
        HeadDivElement.append(mark_done_icon);
        BodyDivElement.append(download_button);
        return this;
      default:
        return this;
    }
  }

  DivElement.setFileName = function setFileName(filename) {
    if (typeof filename == 'string') {
      HeadDivElement.textContent = filename;
    }
    return this;
  }

  DivElement.nextPhase = function nextPhase() {
    phase_code++;
    updateState();
    return status_enum[phase_code];
  }

  DivElement.resetPhase = function resetPhase() {
    phase_code = 0;
    updateState();
    return status_enum[phase_code];
  }

  DivElement.setSelectionList = function setSelectionList(selects = []) {
    dropdown_select.setSelectionList(selects);
    return this;
  }

  DivElement.setPercentage = function setPercentage(percent) {
    indicator.setPercentage(percent);
    return this;
  }

  DivElement.reportProgress = function reportProgress(current, total) {
    if (total) transfer_tracker.setTotalAsByte(total);
    if (current) transfer_tracker.setCurrentAsByte(current);
    const percent = transfer_tracker.getPercentage();
    this.setPercentage(percent);
    return this;
  }

  DivElement.setDownloadUrl = function setDownloadUrl(url) {
    if (!link_download.hasAttribute('href')) {
      download_button.addEventListener('click', function clickDownload(event) {
        event.preventDefault();
        link_download.click();
      });
    }
    link_download.setAttribute('href', url);
  }

  DivElement.showAlert = function showAlert(error, code, message) {
    _error = error || 'ERROR';
    _code = code || '';
    _message = message || 'An uncaught error occurred.';

    const error_alert = createSpanTextFromContent(`${_error} ${_code}`)
      .setClass('error-alert');
    error_alert.setAttribute('title', _message);
    BodyDivElement.removeAllChilds().append(error_alert);
    HeadDivElement.refresh();
    HeadDivElement.append(error_icon);
    return this;
  }

  BodyDivElement.removeAllChilds = function removeAllChilds() {
    BodyDivElement.innerHTML = '';
    return this;
  }

  HeadDivElement.refresh = function refresh() {
    HeadDivElement.innerHTML = '';
    DivElement.setFileName(filename);
    return this;
  }

  DivElement.applyStyle(style.name, style.number);
  DivElement.setFileName(filename);

  DivElement.append(HeadDivElement, BodyDivElement, TailDivElement)
  updateState();

  return DivElement;
}


module.exports = ProgressBar;
