module.exports = {

  up: function createUserTable(queryInterface, Sequelize) {
    return queryInterface.createTable('User', {
      userID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          is: { args: /^[A-z](?!.*[\-_]{2})(?!.*[\-_]$)[A-z0-9\-_]{0,49}$/, msg: "Invalid username format" },
          max: { args: 50, msg: "Length must be <= 50" },
          notEmpty: { msg: "This field must not be empty" }
        }
      },

      passwordHash: {
        type: Sequelize.STRING.BINARY,
        allowNull: false,
        validate: {
          isSha512: value => /^[0-9a-f]{128}$/i.exec(value)
        }
      },

      registrationDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      },

      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      profileChangedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      },

      lastAccessDatetime: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },

      isPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      expirationDatetime: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },

      isBanned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      bannedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }  
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    })
  },

  down: function dropUserTable(queryInterface, Sequelize) {
    return queryInterface.dropTable('User');
  }

}
