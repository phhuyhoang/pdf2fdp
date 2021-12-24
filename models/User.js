const Sequelize = require('sequelize');
const defaultDatabase = require('../config').db;


class User extends Sequelize.Model {
  
  static init(database, type) {
    const attributes = {
      /**
       * Auto increment ID. Start from zero.
       */
      userID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      /**
       * Username must follow these rules:
       * - Must not be longer than 50 characters
       * - Accept only letters, numbers and signs "-", "_"
       * - Must not start with a number and signs "-", "_"
       * - Must not end with signs "-", "_"
       * - Unique
       */
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

      /**
       * Password must enforce these rules:
       * - At least one uppercase letter
       * - At least one lowercase letter
       * - At least one digit
       * - At least one special character
       * - Minimum eight length
       * - Must not be longer than 50 characters
       * - Must be encrypted before sent to Model (SHA-512, binary)
       */
      passwordHash: {
        type: Sequelize.STRING.BINARY,
        allowNull: false,
        validate: {
          isSha512: value => /^[0-9a-f]{128}$/i.exec(value)
        }
      },

      /**
       * Registration date, also createdAt
       */
      registrationDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      },

      /**
       * The last day the user edited their profile. 
       * Default is the successful registration date.
       */
      profileChangedDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      },

      /**
       * The last logged in datetime.
       */
      lastAccessDatetime: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },

      /**
       * After successful registration, the client will start to use with a 
       * free account.
       */
      isPaid: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      /**
       * Null is allowed if `isPaid` is false.
       * Otherwise, this field will store expiration date of premium account.
       */
      expirationDatetime: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }
      },

      /**
       * By default, the user's account will not be banned
       */
      isBanned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      /**
       * This system does not support limitation banned date.
       * So, users will be permanently banned by default.
       * (Or until released/unbanned by administrator)
       */
      bannedDate: {
        type: Sequelize.DATE,
        allowNull: true,
        validate: {
          isDate: true
        }  
      },

      /**
       * Login status. If the user is offline, this value will be false
       * by default
       */
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    };

    const options = {
      sequelize: database || defaultDatabase,
      modelName: 'User',
      freezeTableName: true,
      timestamps: false,
      createAt: false,
      updateAt: false,
    };

    return super.init(attributes, options);
  }

  static associations(models) {
    this.hasOne(models.UserProfile, { foreignKey: "userID" });
    this.hasMany(models.UserActivity, { foreignKey: "userID" });
    this.hasOne(models.AccessState, { foreignKey: "userID" })
  }

}
module.exports = User
