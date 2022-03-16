module.exports = {

  up: function createVerifyingUserTable(queryInterface, Sequelize) {
    return queryInterface.createTable('VerifyingUser', {
      tempID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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

      verificationCode: {
        type: Sequelize.CHAR(6),
        allowNull: false,
        validate: {
          isInt: { msg: "Must be an integer number" },
          notEmpty: { msg: "This field must not be empty" },
        }
      },

      expireAt: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true
        }
      },

      lastResentDateTime: {
        type: Sequelize.DATE,
        allowNull: false,
        validate: {
          isDate: true
        }
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      resentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    })
  },

  down: function dropVerifyingUserTable(queryInterface, Sequelize) {
    return queryInterface.dropTable('VerifyingUser');
  }

}
