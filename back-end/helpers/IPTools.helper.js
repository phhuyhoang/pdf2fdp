const _ = require('lodash');
const axios = require('axios').default;
const datetools = require('date-fns');

var requestPerMinute = 0;
var previousMinute = datetools.startOfMinute(Date.now());


module.exports.cache = Object.create(null);


module.exports.getIPAddress = function getIPAddress(request) {
  const ipAddress = request.ip
    || request?.header?.['x-forwarded-for']
    || request?.socket?.remoteAdress
    || null;

  const isLocalHost = ipAddress == '::1';

  return isLocalHost ? 'localhost' : ipAddress;
}


module.exports.lookupLocationInfo = function lookupLocationInfo(ipAddress) {

  if (ipAddress in exports.cache) return exports.cache[ipAddress];
  
  // Request limiter of API
  if (requestPerMinute > 45) return;

  // Release cache memory
  if (_.keys(exports.cache).length >= 100) exports.cache = Object.create(null);


  return new Promise(function requestLocationInfo(resolve, reject) {
    const fakeResponse = {};
    const timeLimit = 
      setTimeout(() => resolve(fakeResponse), datetools.secondsToMilliseconds(15));
     
    axios
      .get(`http://ip-api.com/json/${ipAddress}`)
      .then(response => {
        if (response.data.status == 'fail') {
          resolve(fakeResponse);
          return;
        }
        
        clearTimeout(timeLimit);
        exports.cache[ipAddress] = response.data;
        resolve(response.data);
        return response.data;
      })
      .catch(() => resolve(fakeResponse));

    const currentMinute = datetools.startOfMinute(Date.now());

    if (currentMinute.valueOf() != previousMinute.valueOf()) {
      previousMinute = currentMinute;
      requestPerMinute = 0;
    }

    requestPerMinute++;
  });

}
