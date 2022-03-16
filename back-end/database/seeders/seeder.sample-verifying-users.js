const _ = require('lodash');
const datetools = require('date-fns');
const loader = require('../data');


module.exports = {
  up: async function insertSampleTemporaryUsersData(queryInterface, Sequelize) {
    const data = await loader.getSampleData();
    const curr = new Date();

    const temporaryUsers = data.map(row => {
      const random = +Math.random().toString(10).slice(2, 6);
      const concretePast = datetools.addHours(curr, -random.toFixed())
      const afterConcretePast = datetools.addMinutes(concretePast, _.random(5));

      const temporaryUser = {
        emailAddress: row.emailAddress,
        verificationCode: Math.random().toString(10).substr(2, 6),
        lastResentDateTime: concretePast,
        expireAt: afterConcretePast,
        isVerified: true,
        resentCount: _.random(20).toFixed(),
      }

      return temporaryUser;
    });

    return queryInterface.bulkInsert('VerifyingUser', temporaryUsers);
  },

  down: function deleteSampleTemporaryUsersData(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('VerifyingUser', null, {});
  }
}
