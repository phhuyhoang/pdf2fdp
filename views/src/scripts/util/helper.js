module.exports.createRequest = function createRequest(method, url, data) {
  const self = {};
  
  self.XHR = new XMLHttpRequest();

  self.send = function sendRequest() {
    return new Promise(function (resolve, reject) {
      self.XHR.open(method, url);

      self.XHR.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(self.XHR.response);
        }
        else {
          reject({
            status: this.status,
            statusText: self.XHR.statusText,
          });
        }
      };

      self.XHR.onerror = function () {
        reject({
          status: this.status,
          statusText: self.XHR.statusText,
        });
      };

      self.XHR.send(data);
    })
  }

  self.addEventListener = function addEventListener(event, listener) {
    self.XHR.addEventListener(event, listener);
  }

  return self;
}


/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
module.exports.humanFileSize = function humanFileSize(bytes, si=true, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + units[u];
}


/**
 * Quickly create a HTML Element
 * @return {HTMLElement}
 */
module.exports.constructElement = function constructElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (Array.isArray(options.class))
    element.classList.add(...options.class)
  else if (typeof options.class == 'string')
    element.classList.add(...options.class.split(' '))

  if (typeof options.id == 'string')
    element.setAttribute('id', options.id)
  if (typeof options.attrs == 'object')
    Object.keys(options.attrs).forEach(attr => element.setAttribute(attr, options.attrs[attr]));
  if (typeof options.innerText == 'string')
    element.innerText = options.innerText;
  if (options.parent instanceof Element)
    options.parent.append(element);
  
  return element;
}
