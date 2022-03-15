const c_rule = require('../constants/rule.constants');


class VerificationCode {

  static DEFAULT_LENGTH = 6;


  static generate(request, length) {
    const codeLength = length 
      || c_rule.VERIFICATION_CODE_DEFAULT_LENGTH 
      || this.DEFAULT_LENGTH;

    const randomCode = Math.random().toString(10).substr(2, codeLength);
    request.locals.verificationCode = randomCode;
    return randomCode;
  }


  static fromRequest(request) {
    const generatedCode = request?.locals?.verificationCode;

    return generatedCode || this.generate(request);
  }

}


module.exports = VerificationCode;
