const Sequelize = require('sequelize');
const defaultDatabase = require('../configs').db;


class UserActivity extends Sequelize.Model {

  static init(database, type) {
    const attributes = {
      /**
       * Auto increment ID. Start from zero.
       */
      activityID: {
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
       * A single word that presents action the user do.
       */
      action: {
        type: Sequelize.ENUM('register', 'login', 'logout', 'upload'),
        allowNull: false,
        validate: {
          isLowercase: true,
          isIn: [[ 'register', 'login', 'logout', 'upload' ]]
        }
      },

      /**
       * Timestamp
       */
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      }
    };

    const options = {
      sequelize: database || defaultDatabase,
      modelName: 'UserActivity',
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


module.exports = UserActivity;
