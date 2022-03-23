const fs = require('fs');
const path = require('path');
const ExpressValidator = require('express-validator');
const LangIdentifier = require('../../helpers/LangIdentifier.helper');
const User = require('../query/User');
const UserProfile = require('../query/UserProfile');

const registerResponseMessages = require('../../constants/validation/register.constants');

const disallowedUsernames = fs.readFileSync(
    path.resolve(__dirname, '../../constants/csv/disallowed_username.csv')
  )
  .toString()
  .split(/,\n/)
  .filter(username => username);


/**
 * Server side validate for registration feature
 */
class RegisterValidate {

  static async username(request, key = 'username') {
    const messages = registerResponseMessages.username;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ max: 50 })
        .withMessage(messages.LENGTH_TOO_LONG).bail()
      .not().matches(/^[0-9_\-]/)
        .withMessage(messages.START_WITH_DASH_OR_UNDERSCORE).bail()
      .not().matches(/[_\-]$/)
        .withMessage(messages.END_WITH_DASH_OR_UNDERSCORE).bail()
      .matches(/^[A-z0-9_\-]+$/)
        .withMessage(messages.CONTAINS_INVALID_CHARACTERS).bail()
      .custom(async function isDisallowedUsername(username) {
        const isDisallowed = disallowedUsernames.includes(username.toLowerCase());
        return isDisallowed ? Promise.reject(messages.DISALLOWED_USERNAME) : Promise.resolve(username);
      })
      .custom(async function isUsernameExist(username) {
        const isExists = await User.isUsernameExist(username);
        return isExists ? Promise.reject(messages.IS_EXISTS) : Promise.resolve(username);
      })
        .withMessage(messages.IS_EXISTS)
      .run(request);
  }


  static async password(request, key = 'password') {
    const messages = registerResponseMessages.password;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ min: 8 })
        .withMessage(messages.LENGTH_TOO_SHORT).bail()
      .isLength({ max: 50 })
        .withMessage(messages.LENGTH_TOO_LONG)
      .run(request);
  }


  static async repeatedPassword(request, key = 'repeat_password', keyOfPassword = 'password') {
    const messages = registerResponseMessages.repeatPassword;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .custom(function compareTypedPassword(repeatedPassword) {
        return repeatedPassword === request.body[keyOfPassword]
          ? Promise.resolve(repeatedPassword)
          : Promise.reject(messages.NOT_MATCHED_WITH_PASSWORD_ABOVE);
      })
        .withMessage(messages.NOT_MATCHED_WITH_PASSWORD_ABOVE)
      .run(request);
  }


  static async firstName(request, key = 'firstname') {
    const messages = registerResponseMessages.firstName;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ max: 30 })
        .withMessage(messages.LENGTH_TOO_LONG).bail()
      .custom(function isHumanLanguage(firstName) {
        return LangIdentifier.isHumanLanguage(firstName)
          ? Promise.resolve(firstName)
          : Promise.reject(messages.IS_MEANINGLESS_NAME);
      })
        .withMessage(messages.IS_MEANINGLESS_NAME)
      .run(request);
  }


  static async lastName(request, key = 'lastname') {
    const messages = registerResponseMessages.lastName;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ max: 30 })
        .withMessage(messages.LENGTH_TOO_LONG).bail()
      .custom(function isHumanLanguage(lastName) {
        return LangIdentifier.isHumanLanguage(lastName)
          ? Promise.resolve(lastName)
          : Promise.reject(messages.IS_MEANINGLESS_NAME);
      })
        .withMessage(messages.IS_MEANINGLESS_NAME)
      .run(request);
  }

  static async emailAddress(request, key = 'email_address') {
    const messages = registerResponseMessages.emailAddress;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ max: 50 })
        .withMessage(messages.LENGTH_TOO_LONG).bail()
      .isEmail()
        .withMessage(messages.INVALID_EMAIL_PATTERN).bail()
      .custom(function checkEmailLocalPartLength(email) {
        return email.split('@').shift().length <= 64
          ? Promise.resolve(email)
          : Promise.reject(messages.INVALID_LOCAL_PART);
      })
        .withMessage(messages.INVALID_LOCAL_PART).bail()
      .custom(function checkEmailDomainPartLength(email) {
        const domain = email.split('@').pop().split('.');
        return domain.every(part => part.length <= 63)
          ? Promise.resolve(email)
          : Promise.reject(messages.INVALID_DOMAIN_PART);
      })
        .withMessage(messages.INVALID_DOMAIN_PART).bail()
      .custom(async function isEmailAlreadyExist(email) {
        const isExists = await UserProfile.isEmailAddressExist(email);
        return isExists ? Promise.reject(messages.IS_EXISTS) : Promise.resolve(email);
      })
        .withMessage(messages.IS_EXISTS)
      .run(request);
  }

  static async phoneNumber(request, key = 'phone_number') {
    const messages = registerResponseMessages.phoneNumber;

    return await ExpressValidator.body(key)
      .notEmpty()
        .withMessage(messages.IS_EMPTY).bail()
      .isLength({ max: 15 })
        .withMessage(messages.LENGTH_TOO_LONG).bail()
      .isMobilePhone('vi-VN')
        .withMessage(messages.INVALID_PHONE_NUMBER_PATTERN)
      .run(request);
  }

}


module.exports = RegisterValidate;
