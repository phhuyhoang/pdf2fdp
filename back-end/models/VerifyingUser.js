const Sequelize = require('sequelize');
const defaultDatabase = require('../configs').db;


class VerifyingUsers extends Sequelize.Model {

  static init(database, type) {
    const attributes = {
      /**
       * Auto increment ID. Start from zero
       */
      tempID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      /**
       * Verifying email
       */
      emailAddress: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          max: { args: 50, msg: "Length must be <= 50" },
          isEmail: { msg: "Not a valid email." },
          notEmpty: { msg: "This field must not be empty" }
        }
      },

      /**
       * Recent generated verification code
       */
      verificationCode: {
        type: Sequelize.CHAR(6),
        allowNull: false,
        validate: {
          isInt: { msg: "Must be an integer number" },
          notEmpty: { msg: "This field must not be empty" },
        }
      },

      /**
       * When the verification code will expire
       */
      expireAt: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true
        }
      },

      /**
       * When the verification code regenerated.
       * If this field changes, the resentCount field will increase
       * by 1 unit
       */
      lastResentDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true
        }
      },

      /**
       * Is this account passed the verification step?
       */
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      /**
       * How many times this account requested to resend the code? 
       */
      resentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    };

    const options = {
      sequelize: database || defaultDatabase,
      modelName: 'VerifyingUser',
      freezeTableName: true,
      timestamps: false,
      createAt: false,
      updateAt: false,
    }

    return super.init(attributes, options);
  }

  /**
   * This table is completely independent, without any relationship with other tables
   */

}


module.exports = VerifyingUsers;
