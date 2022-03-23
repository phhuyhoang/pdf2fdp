const _ = require('lodash');


class ResponseObjectExtender {

  static plugs = {
    /**
     * Helps to send a pseudo error to client. It provides a flexible way to 
     * show a custom error message from server.
     * 
     */
    sendErrorAsJSON: function sendErrorAsJSON(error, code, message) {
      const errorPacket = {
        error: {
          name: error.name,
          message: message || error.message,
          code,
        }
      };

      return Promise.resolve(errorPacket).then(() => this.json(errorPacket));
    }
  }
  
  static handle(request, response, next) {

    const self = ResponseObjectExtender;

    if (!_.chain(response).has(_.keys(self.plugs)).value()) {
      _.assign(response, self.plugs);
    }

    next();

  }

}


module.exports = ResponseObjectExtender;
