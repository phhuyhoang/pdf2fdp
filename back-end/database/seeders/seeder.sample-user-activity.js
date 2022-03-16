const _ = require('lodash');
const datetools = require('date-fns');
const loader = require('../data');

const pickRandom = array => array[_.random(array.length - 1)]


module.exports = {
  up: async function insertSampleActivitiesData(queryInterface, Sequelize) {
    const data = await loader.getSampleData();
    const action = [ 'register', 'login', 'logout', 'upload' ];
    const curr = new Date();

    const activities = data.map(row => {
      const random = +Math.random().toString(10).slice(2, 6);

      const activity = {
        userID: row.id,
        ipAddress: row.ipAddress,
        action: pickRandom(action),
        timestamp: datetools.addMinutes(curr, -random.toFixed())
      }

      return activity;
    })

    return queryInterface.bulkInsert('UserActivity', activities);
  },

  down: function deleteSampleActivitiesData(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserActivity', null, {});
  }
}
