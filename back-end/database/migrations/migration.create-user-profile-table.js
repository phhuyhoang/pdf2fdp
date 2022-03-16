module.exports = {

  up: function createUserProfileTable(queryInterface, Sequelize) {
    return queryInterface.createTable('UserProfile', {
      profileID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userID: {
        type: Sequelize.INTEGER,
      },

      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          max: { args: 30, msg: "Length must be <= 30" },
          notEmpty: { msg: "This field must not be empty" },
          humanReadable: string => LangIdentifierUtil.isHumanLanguage(string),
        }
      },

      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false,
        validate: {
          max: { args: 30, msg: "Length must be <= 30" },
          notEmpty: { msg: "This field must not be empty" },
          humanReadable: string => LangIdentifierUtil.isHumanLanguage(string),
        }
      },

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
    });
  },

  down: function dropUserProfileTable(queryInterface, Sequelize) {
    return queryInterface.dropTable('UserProfile');
  }

}
