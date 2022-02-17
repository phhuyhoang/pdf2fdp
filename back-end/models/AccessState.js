const Sequelize = require('sequelize');
const defaultDatabase = require('../configs/').db;


class AccessState extends Sequelize.Model {

  static init(database, type) {
    const attributes = {
      /**
       * Auto increment ID. Start from zero.
       */
      accessID: {
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
       * The user's device IP address. Accepts both IPv4 and IPv6.
       */
      ipAddress: {
        type: Sequelize.STRING.BINARY,
        allowNull: false,
        validate: {
          isIP: true,
        }
      },

      /**
       * Number of consecutive incorrect password attempts.
       */
      badPasswordCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true
        }
      },

      /**
       * Timestamp when user perform access.
       * Unlike the timestamp field in UserActivity table, this value will
       * log even if user clicks login with wrong password.
       */
      accessTimeStamp: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true,
        }
      },

      /**
       * Whether the user login successfully or not (since the 
       * first badPasswordCount). If this field is TRUE, that means
       * this user is logged in.
       */
      isLoginSuccessful: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      /**
       * Token used for authentication and compared with the token 
       * storing on client-side.
       * TODO: Choose token format and then define validation 
       */
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    };

    const options = {
      sequelize: database || defaultDatabase,
      modelName: 'AccessState',
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


module.exports = AccessState

