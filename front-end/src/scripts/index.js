const autoload = require('./helpers/autoload/prototype').init();
const ajax = require('./helpers/util/ajax.util');
const size = require('./helpers/util/size.util');

const effects = require('./misc/effects');

const FileInput = require('./components/homepage/FileInput.component');
const EmptyProgressBar = require('./components/homepage/EmptyProgressBar.component');
const ProgressBar = require('./components/homepage/ProgressBar.component');
const ConvertButton = require('./components/homepage/micro-components/ConvertButton.component');

/**
 * Global variables
 */
const upload_limit = 3;
const outputExtensionSupport = [ 'PNG', 'SVG', 'JPEG', 'TIFF' ];

/**
 * Shared context
 */
const context = {
  state: Object.create(null),
  rule: Object.create(null),
  shared: Object.create(null),
};


/**
 * Functions
 */
const isValidPDFFormat = function isValidPDFFormat(file) {
  if (file.type == 'application/pdf' && file.name.endsWith('.pdf')) {
    return true;
  }
  alert('Not a valid PDF format.');
}

const preventUploadExceed = function preventUploadExceed(button) {
  button.setAttribute('disabled', '');
  button.setAttribute('title', 'Buy the premium plan to convert more files');
  return true;
}


const unlockSelectFileButton = function unlockSelectFileButton(button) {
  button.removeAttribute('disabled');
  button.removeAttribute('title');
  return true;
}


const getPresetFormData = function getPresetFormData(form) {
  const fields = Array.from(form.elements);
  const data = Object.create(null);

  for (const field of fields) {
    const key = field.name;
    const value = field.value || field.placeholder;
    data[key] = value;
  }

  return data;
}


/**
 * @param {HTMLElement} element
 * @param {Number<Int>} duration
 * @param {Number<Int>|String} iteration
 */
const triggerBarInsertAnimation = function triggerBarInsertAnimation(element, {
    duration, 
    timingFunc, 
    iteration,
    delay,
  } = {}) {
  const _duration = duration || '0.5s';
  const _timingFunc = timingFunc || 'linear';
  const _iteration = iteration || 1;
  const _delay = delay || '0s';

  element.style.setProperty('animation', `slide_in_from_left ${_duration} ${_timingFunc}`);
  element.style.setProperty('animation-iteration-count', _iteration);
  element.style.setProperty('animation-delay', _delay);
}


const triggerBarDetachAnimation = function triggerBarDetachAnimation(element, {
    duration, 
    timingFunc, 
    iteration,
    delay,
  } = {}) {
  const _duration = duration || '0.5s';
  const _timingFunc = timingFunc || 'linear';
  const _iteration = iteration || 1;
  const _delay = delay || '0s';

  const durationAsNumber = parseFloat(duration.match(/[0-9\.]+/g).pop()) || 0.5;

  element.style.setProperty('animation', `slide_out_to_right ${_duration} ${_timingFunc}`);
  element.style.setProperty('animation-iteration-count', _iteration);
  element.style.setProperty('animation-delay', _delay);

  return new Promise(resolve => {
    setTimeout(function triggerAfterAnimated() {
      resolve(true);
    }, durationAsNumber * 1000);
  });
}



document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  // Apply pulse click effect
  effects.ripple.applyEffect();

  const select_file_button = document.querySelector('.top-section__upload button');
  const convert_section = document.querySelector('.convert-section');
  const preset_form = document.querySelector('.preset-board form');

  const file_chooser = new FileInput('pdf');
  const empty_progress_bar = new EmptyProgressBar();
  const convert_button = new ConvertButton('convert-button').changeText('Convert');

  context.state.dialog_openning = false;
  context.rule.disallow_preset = true;
  context.shared.files = [];
  context.shared.list = [];
  context.shared.form = new FormData();
  convert_section.append(empty_progress_bar);


  // Open a file dialog when clicking `Select File` button.
  select_file_button.addEventListener('click', function selectFileFromDevice(event) {
    event.preventDefault();

    if (!context.state.dialog_openning) {
      context.state.dialog_openning = true;
      file_chooser.click();
    }
    else {
      context.state.dialog_openning = false;
      this.click();
    }
  });


  // Handle progress bar when a new file is added 
  file_chooser.addEventListener('input', function handleSelectedFile(event) {
    event.preventDefault();

    if (context.state.dialog_openning) {
      // Take one file at a time, refuse the rest
      const files = Array.from(file_chooser.files);
      const current_file = files.pop(); 
      file_chooser.value = null;

      // Reject and alert if the selected file is not a PDF
      if (!isValidPDFFormat(current_file)) return;

      // Indicates file dialog is closed
      context.state.dialog_openning = false;

      const current_progress_bar = new ProgressBar(current_file.name)
        .setSelectionList(outputExtensionSupport);
      context.shared.files.push(current_file);
      context.shared.list.push(current_progress_bar);
      triggerBarInsertAnimation(current_progress_bar, {
        duration: '0.3s',
        timingFunc: 'ease-out'
      });

      if (context.rule.disallow_preset) {
        const option_button = current_progress_bar.$body.$option_button;
        option_button.disableButton();
        option_button.title = 'Buy the premium plan to use this feature';
      }

      // Remove default empty_progress_bar when a new progress_bar is added
      if (context.shared.list.length >= 1 && empty_progress_bar.parentElement == convert_section)
        convert_section.removeChild(empty_progress_bar)

      // Disallow click the `Select File` button when the limit is reached
      if (context.shared.list.length >= upload_limit)
        preventUploadExceed(select_file_button);

      // Insert current_progress_bar into convert_section
      if (convert_section.lastChild == convert_button) {
        convert_section.insertBefore(current_progress_bar, convert_button);
      }
      else {
        convert_section.append(current_progress_bar, convert_button);
      }

      // Remove progress_bar from list when clicking X button
      const remove_progress_bar_button = current_progress_bar.$tail.$remove_button;
      remove_progress_bar_button.addEventListener('click', function removeCurrentProgressBar(event) {
        event.preventDefault();
        const index_pb = context.shared.list.findIndex(pb => current_progress_bar == pb);
        const index_file = context.shared.files.findIndex(file => current_file == file);

        if (index_pb >= 0) context.shared.list.splice(index_pb, 1);
        if (index_file >= 0) context.shared.files.splice(index_file, 1);

        if (context.shared.list.length < upload_limit && select_file_button.hasAttribute('disabled'))
          unlockSelectFileButton(select_file_button);
        
        if (!context.shared.list.length && convert_button.parentElement == convert_section) {
          convert_section.removeChild(convert_button);
          convert_button.enableButton();
        }

        triggerBarDetachAnimation(current_progress_bar, {
          duration: '0.3s',
          timingFunc: 'ease-in',
        })
        .then(() => {
          current_progress_bar.parentElement.removeChild(current_progress_bar)

          if (!context.shared.list.length && !empty_progress_bar.parentElement) {
            convert_section.append(empty_progress_bar);
          }
        });
      });
    }
  });

  convert_button.addEventListener('click', function sendRequestConvert(event) {
    event.preventDefault();
    const form = context.shared.form;
    const request_sent = [];
    let request_passed = 0;
    convert_button.start('Converting');

    for (let i = 0; i < context.shared.files.length; i++) {
      const current_file = context.shared.files[i];
      const current_progress_bar = context.shared.list[i];
      current_progress_bar.resetPhase();

      current_progress_bar.nextPhase(); // Switch to upload phase

      const form_data = getPresetFormData(preset_form);

      form.set('file', current_file);
      form.set('options', JSON.stringify(form_data));
      form.set('outputExtension', current_progress_bar.$body.$dropdown_select.value.toString());

      const xhr = ajax.createRequest('post', 'convert', form);

      xhr.XHR.upload.onprogress = function reportUploadProgress(event) {
        if (event.lengthComputable) {
          const current = event.loaded;
          const total = event.total;

          if (current >= total) {
            current_progress_bar.nextPhase(); // Switch to convert phase
            return;
          }

          current_progress_bar.reportProgress(current, total);
        }
      }

      const request = xhr.send();

      request_sent.push(request);
      form.delete('file');
      form.delete('options');
      form.delete('outputExtension');

      request
        .then(function handleResponse(response) {
          const json = JSON.parse(response);

          if (json.error && json.error.message) {
            const err = new Error(json.error.message);
            err._name = json.error.name || err.name;
            err._code = json.error.code;
            throw err;
          }

          current_progress_bar.nextPhase(); // Switch to the last
          current_progress_bar.setDownloadUrl(json.downloadLink);
          request_passed++;

          current_progress_bar
            .$body
            .$download_button
            .setAttribute('title', `${json.fileName} (${size.humanFileSize(json.fileSize)})`);

          if (request_passed >= request_sent.length) {
            convert_button.end();
            request_passed = 0;
          }

          return response;
        })
        .catch(function handleUploadError(error) {
          request_passed++;
          current_progress_bar.showAlert(error._name, error._code, error.message);

          if (request_passed >= request_sent.length) {
            convert_button.end();
            request_passed = 0;
          }
        })
    }
  })
})
