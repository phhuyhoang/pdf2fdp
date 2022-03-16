const crypto = require('crypto');
const datetools = require('date-fns');
const loader = require('../data');


module.exports = {
  up: async function insertSampleUsersData(queryInterface, Sequelize) {
    const curr = new Date();

    const data = await loader.getSampleData();
    const users = data.map(row => {
      const random = +Math.random().toString(10).slice(2, 6);

      const user = {
        userID: row.id,
        username: row.username,
        passwordHash: crypto.createHash('sha512')
          .update(row.password, 'binary')
          .digest('hex'),
        registrationDate: datetools.addHours(curr, -random.toFixed()),
        profileChangedDate: datetools.addHours(curr, -random.toFixed()),
      }

      return user;
    })

    return queryInterface.bulkInsert('User', users);
  },

  down: function deleteSampleUsersData(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('User', null, {});
  }
}
