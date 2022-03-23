const Sequelize = require('sequelize');
const crypto = require('crypto');
const models = require('../../models');


/**
 * Create a new user (this thing synonymous with the user's registered 
 * account has been approved).
 * 
 * @param {Object} account
 *    @param {String} account.username
 *    @param {String} account.password
 *    @param {Date} account.registrationDate
 *    @param {Date} account.profileChangedDate
 *    @param {Date} account.lastAccessDatetime
 *    @param {Boolean} account.isPaid
 *    @param {Date|null} account.expirationDatetime
 *    @param {Boolean} account.isBanned
 *    @param {Date|null} account.bannedDate
 *    @param {Boolean} account.isActive
 * @return {Promise<Sequelize.Model>}
 */
module.exports.createUserAccount = async function createUserAccount(account) {
  const {
    User
  } = await models;

  try {
    const clause = Object.create(null);

    if (account.registrationDate) clause.registrationDate = account.registrationDate;
    if (account.profileChangedDate) clause.profileChangedDate = account.profileChangedDate;
    if (account.lastAccessDatetime) clause.lastAccessDatetime = account.lastAccessDatetime;
    if (account.isPaid) clause.isPaid = account.isPaid;
    if (account.expirationDatetime) clause.expirationDatetime = account.expirationDatetime;
    if (account.isBanned) clause.isBanned = account.isBanned;
    if (account.bannedDate) clause.bannedDate = account.bannedDate;
    if (account.isActive) clause.isActive = account.isActive;

    const result = await User.findOrCreate(
      {
        where: {
          username: account.username,
          passwordHash: crypto.createHash('sha512')
            .update(account.password, 'binary')
            .digest('hex'),
          ...clause,
        }
      }
    );

    return result;
  }
  catch (error) {
    throw error;
  }
}


/**
 * Check whether the mentioned user is exist
 * @param {String} username
 * @return {Promise<Boolean>}
 */
module.exports.isUsernameExist = async function isUsernameExist(username) {
  const {
    User
  } = await models;

  try {
    const result = await User.count({
      where: {
        username
      }
    });

    return result > 0;
  }
  catch (error) {
    throw error;
  }
}



