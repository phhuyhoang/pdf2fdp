const Sequelize = require('sequelize');
const models = require('../../models');


/**
 * Create a new user profile (this action usually should do when the user
 * create a new account)
 * 
 * @param {Object} profile
 *    @param {Number} userID
 *    @param {String} firstName
 *    @param {String} lastName
 *    @param {String} emailAddress
 *    @param {String} phoneNumber
 * @return {Promise<Sequelize.Model>}
 */
module.exports.createUserProfile = async function createUserProfile(profile) {
  const {
    UserProfile
  } = await models;

  try {

    const result = await UserProfile.findOrCreate(
      {
        where: {
          userID: profile.userID,
          firstName: profile.firstName,
          lastName: profile.lastName,
          emailAddress: profile.emailAddress,
          phoneNumber: profile.phoneNumber,
        },
      }
    );

    return result;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Check whether this email is exist or not
 * @param {String} emailAddress
 * @return {Promise<Boolean>}
 */
module.exports.isEmailAddressExist = async function isEmailAddressExist(emailAddress) {
  const { 
    UserProfile 
  } = await models;

  try {
    const result = await UserProfile.count({
      where: {
        emailAddress
      }
    })

    return result > 0;
  }
  catch (error) {
    throw error;
  }
}
