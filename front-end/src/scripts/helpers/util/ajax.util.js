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
