const _ = require('lodash');
const jwt = require('jsonwebtoken');
const datetools = require('date-fns');
const random = require('pick-some');
const loader = require('../data');

const pickRandom = array => array[_.random(array.length - 1)]


module.exports = {
  up: async function insertSampleAccessStatesData(queryInterface, Sequelize) {
    const data = await loader.getSampleData();
    const curr = new Date();

    const accessStates = random.pickSomeUnique(30, data)
    .map(row => {
      const random = +Math.random().toString(10).slice(2, 6);

      const state = {
        userID: row.id,
        ipAddress: row.ipAddress,
        badPasswordCount: _.random(0, 5),
        accessTimeStamp: datetools.addMinutes(curr, -random.toFixed()),
        isLoginSuccessful: pickRandom([true, false]),
        token: jwt.sign(
          {
            username: row.username,
            id: row.id, 
          },
          'pdf2fdp',
        )
      };

      return state;
    });

    return queryInterface.bulkInsert('AccessState', accessStates);
  },

  down: function deleteSampleAccessStatesData(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('AccessState', null, {});
  }
}
