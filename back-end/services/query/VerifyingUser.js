const Sequelize = require('sequelize');
const datetools = require('date-fns');
const models = require('../../models');
const c_rule = require('../../constants/rule.constants');


/**
 * Insert the current user into the verification pending list
 * @param {String} emailAddress
 * @param {String} verificationCode
 * @param {Date} expireAt
 * @param {Date} lastResentDateTime
 * @return {Promise<Sequelize.Model>}
 */
module.exports.createTemporaryUser = async function createTemporaryUser(
  emailAddress,
  verificationCode,
  expireAt,
  lastResentDateTime,
) 
{
  const { 
    VerifyingUser 
  } = await models;

  try {
    const result = await VerifyingUser.findOrCreate({
      where: {
        emailAddress,
        verificationCode,
        expireAt,
        lastResentDateTime: lastResentDateTime || new Date,
      }
    });

    return result;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Find and show information about whether this user is currently
 * pending verification or not
 * @param {String} emailAddress
 * @param {Object} options
 * @return {Promise<Sequelize.Model>}
 */
module.exports.findTemporaryUser = async function findTemporaryUser(
  emailAddress,
  options = {}
)
{
  const {
    VerifyingUser
  } = await models;

  try {
    let result;

    if (options.tempID)
      result = await VerifyingUser.findByPk(options.tempID);
    else
      result = await VerifyingUser.findOne({
        where: {
          emailAddress,
          ...options,
        }
      });

    return result;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Check whether the current user has been verified before
 * @param {String} emailAddress
 * @param {Object} options
 * @return {Promise<Boolean>}
 */
module.exports.isVerifiedAccount = async function isVerifiedAccount(
  emailAddress,
  options = {}
) 
{
  try {
    const email = emailAddress || options.emailAddress;
    const result = await exports.findTemporaryUser(email, options);

    if (result && result.isVerified)
      return result.isVerified;

    return false;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Make a query indicating that the user requested to resend the verification
 * code
 * @param {String} emailAddress
 * @param {String} verificationCode
 * @param {Date} expireAt
 * @return {Promise<Boolean>}
 */
module.exports.resendVerificationCode = async function resendVerificationCode(
  emailAddress,
  verificationCode,
  expireAt
)
{
  try {
    const {
      VerifyingUser
    } = await models;

    const result = await VerifyingUser.update(
      {
        verificationCode,
        expireAt,
        lastResentDateTime: new Date(),
        resentCount: Sequelize.literal('resentCount + 1'), // Increasing resentCount by one without select
      },
      {
        where: {
          emailAddress,
          lastResentDateTime: {
            // To prevent user spamming resend verification code
            [Sequelize.Op.lte]: datetools.addSeconds(new Date(), -c_rule.VERIFICATION_CODE_REFRESH_INTERVAL),
          }
        },
        limit: 1
      }
    )

    const anyUpdate = !!result.shift();

    return anyUpdate;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Mark this user as verified account
 * @param {String} emailAddress
 * @param {Object} options
 * @return {Promise<Boolean>}
 */
module.exports.markAsVerified = async function markAsVerified(
  emailAddress,
  options = {}
) 
{
  try {
    const {
      VerifyingUser
    } = await models;

    const email = emailAddress || options.emailAddress;

    if (!email) return false;
    
    const result = await VerifyingUser.update(
      {
        isVerified: true  
      },
      {
        where: {
          emailAddress: emailAddress || options.emailAddress,
          ...options,
          isVerified: false,
        }
      }
    );

    const anyUpdate = !!result.shift();

    return anyUpdate;
  }
  catch (error) {
    throw error;
  }
}
