const _ = require('lodash');
const datetools = require('date-fns');
const ExpressValidator = require('express-validator');
const MailService = require('../../services/mail/MailService.service');
const RegisterValidate = require('../../services/validate/RegisterValidate.service');
const IPTools = require('../../helpers/IPTools.helper');
const VerificationCode = require('../../helpers/VerificationCode.helper');

const User = require('../../services/query/User');
const UserProfile = require('../../services/query/UserProfile');
const VerifyingUser = require('../../services/query/VerifyingUser');


class RegisterController {
  
  /**
   * Validate form part-by-part
   */
  static async validateForm(request, response, next) {
    request.body.hasOwnProperty('username') && await RegisterValidate.username(request, 'username');
    request.body.hasOwnProperty('password') && await RegisterValidate.password(request, 'password');
    request.body.hasOwnProperty('repeat_password') && await RegisterValidate.repeatedPassword(request, 'repeat_password', 'password');
    request.body.hasOwnProperty('firstname') && await RegisterValidate.firstName(request, 'firstname');
    request.body.hasOwnProperty('lastname') && await RegisterValidate.lastName(request, 'lastname');
    request.body.hasOwnProperty('email_address') && await RegisterValidate.emailAddress(request, 'email_address');
    request.body.hasOwnProperty('phone_number') && await RegisterValidate.phoneNumber(request, 'phone_number');

    const result = ExpressValidator.validationResult(request);
    response.json({ errors: result.array() });
  }


  /**
   * Send verification code to the mentioned email in registration form
   */
  static async sendCodeToEmail(request, response, next) {
    const userEmail =  request.body.email_address;
    const clientInfo = request.locals.clientInfo 
                     = _.assign(Object.create(null), request.useragent);
    const clientIPAddress = IPTools.getIPAddress(request);

    const locationInfo = await IPTools.lookupLocationInfo(clientIPAddress) || {};
    clientInfo.city = locationInfo.city;
    clientInfo.country = locationInfo.country;
    clientInfo.region = locationInfo.regionName;
    clientInfo.ipAddress = clientIPAddress;

    const verificationCode = VerificationCode.fromRequest(request);
    
    const verifyingAccount = await VerifyingUser.findTemporaryUser(userEmail);
    const fiveMinutesFromNowOn = datetools.addMinutes(new Date(), 5)
    const lastResentDateTime = new Date();

    if (verifyingAccount) return;

    await VerifyingUser.createTemporaryUser(
      userEmail, 
      verificationCode,
      fiveMinutesFromNowOn,
      lastResentDateTime,
    );

    await MailService.sendVerificationCode(request, response, userEmail);
  }


  /**
   * Request resend verification code
   */
  static async resendVerificationCode(request, response, next) {
    const userEmail =  request.body.email_address;
    const clientInfo = request.locals.clientInfo 
                     = _.assign(Object.create(null), request.useragent);
    const clientIPAddress = IPTools.getIPAddress(request);

    const isVerifiedAccount = await VerifyingUser.isVerifiedAccount(userEmail);

    if (isVerifiedAccount) return;

    const locationInfo = await IPTools.lookupLocationInfo(clientIPAddress) || {};
    clientInfo.city = locationInfo.city;
    clientInfo.country = locationInfo.country;
    clientInfo.region = locationInfo.regionName;
    clientInfo.ipAddress = clientIPAddress;

    const verificationCode = VerificationCode.fromRequest(request);

    const fiveMinutesFromNowOn = datetools.addMinutes(new Date(), 5);

    await VerifyingUser.resendVerificationCode(userEmail, verificationCode, fiveMinutesFromNowOn) &&
    await MailService.sendVerificationCode(request, response, userEmail);
  }


  /**
   * Accept account and store account info into database
   */
  static async createAccount(request, response, next) {
    const userEmail =  request.body.email_address;
    const verifyingAccount = await VerifyingUser.findTemporaryUser(userEmail);

    const isIncompletedForm = 
      !request.body.username ||
      !request.body.password ||
      !request.body.repeat_password ||
      !request.body.firstname ||
      !request.body.lastname ||
      !request.body.email_address ||
      !request.body.phone_number ||
      !request.body.verification_code;

    switch (true) {
      case isIncompletedForm:
        const IncompletedFormDetected = new Error('Incomplete form detected!');
        response.sendErrorAsJSON(IncompletedFormDetected, 400);
        return;

      case !verifyingAccount:
        const VerifyingUserNotFound = new Error('The email address not found in our database.');
        response.sendErrorAsJSON(VerifyingUserNotFound, 404);
        return;

      case verifyingAccount.dataValues.isVerified:
        const AccountAlreadyVerified = new Error('Account already verified.');
        response.sendErrorAsJSON(AccountAlreadyVerified, 409);
        return;

      case datetools.isPast(verifyingAccount.dataValues.expireAt):
        const VerificationCodeHasExpired = new Error('Verification code has expired.');
        response.sendErrorAsJSON(VerificationCodeHasExpired, 410);
        return;

      case verifyingAccount.dataValues.verificationCode != request.body.verification_code:
        const VerificationCodeDoesNotMatch = new Error('Invalid verification code.');
        response.sendErrorAsJSON(VerificationCodeDoesNotMatch, 401);
        return;
    }

    const createdUser = await User.createUserAccount(
      {
        username: request.body.username,
        password: request.body.password,
      }
    );

    const createdProfile = await UserProfile.createUserProfile(
      {
        userID: createdUser?.dataValues?.userID || createdUser[0].dataValues.userID,
        firstName: request.body.firstname,
        lastName: request.body.lastname,
        emailAddress: request.body.email_address,
        phoneNumber: request.body.phone_number,        
      }
    )

    await VerifyingUser.markAsVerified(userEmail);

    const RegisterSuccess = {
      success: true
    }

    response.json(RegisterSuccess);
  }

}


module.exports = RegisterController;
