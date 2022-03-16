module.exports = {

  up: function createAccessStateTable(queryInterface, Sequelize) {
    return queryInterface.createTable('AccessState', {
      accessID: {
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

      badPasswordCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: true
        }
      },

      accessTimeStamp: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
        validate: {
          isDate: true,
        }
      },

      isLoginSuccessful: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      token: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    })
  },

  down: function dropAccessStateTable(queryInterface, Sequelize) {
    return queryInterface.dropTable('AccessState');
  }

}
