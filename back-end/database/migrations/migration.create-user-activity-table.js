module.exports = {

  up: function createUserActivityTable(queryInterface, Sequelize) {
    return queryInterface.createTable('UserActivity', {
      activityID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userID: {
        type: Sequelize.INTEGER,
      },

      ipAddress: {
        type: Sequelize.STRING.BINARY,
        allowNull: false,
        validate: {
          isIP: true,
        }
      },

      action: {
        type: Sequelize.ENUM('register', 'login', 'logout', 'upload'),
        allowNull: false,
        validate: {
          isLowercase: true,
          isIn: [[ 'register', 'login', 'logout', 'upload' ]]
        }
      },

      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true
        }
      }
    });
  },

  down: function dropUserActivityTable(queryInterface, Sequelize) {
    return queryInterface.dropTable('UserActivity');
  }

}
