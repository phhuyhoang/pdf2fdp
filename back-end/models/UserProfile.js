const Sequelize = require('sequelize');
const config = require('../configs')
const defaultDatabase = config.db;

const LangUtil = require('../helpers/util/LangIdentifier');


class UserProfile extends Sequelize.Model {

  static init(database, type) {
    const attributes = {
      /**
       * Auto increment ID. Start from zero.
       */
      profileID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      /**
       * Auto increment ID. Start from zero. Foreign key.
       */
      userID: {
        type: Sequelize.INTEGER,
      },

      /**
       * User's first name. Accept many difference languages.
       * Excluding special characters as a common standard.
       */
      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          max: { args: 30, msg: "Length must be <= 30" },
          notEmpty: { msg: "This field must not be empty" },
          humanReadable: string => LangUtil.isHumanLanguage(string),
        }
      },

      /**
       * User's last name. Accept many difference languages.
       * Excluding special characters as a common standard, too.
       */
      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          max: { args: 30, msg: "Length must be <= 30" },
          notEmpty: { msg: "This field must not be empty" },
          humanReadable: string => LangUtil.isHumanLanguage(string),
        }
      },

      /**
       * User's email.
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
       * User's phone number. 
       * Must be start with zero, area code or country code.
       */
      phoneNumber: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "This field must not be empty" },
          isPhoneNumber: function isPhoneNumber(value) {
            return /^(?:^\+[0-9]|^0[0-9])[0-9]{1,15}/.test(value);
          }
        }
      }
    };

    const options = {
      sequelize: database || defaultDatabase,
      modelName: 'UserProfile',
      charset: 'utf8',
      collate: 'utf8mb4_unicode_ci',
      freezeTableName: true,
      timestamps: false,
      createAt: false,
      updateAt: false,
    };

    return super.init(attributes, options);
  }

  static associations(models) {
    this.belongsTo(models.User, { sourceKey: "userID", targetKey: "userID", foreignKeyConstraint: true });
  }

}


module.exports = UserProfile;
