const loader = require('../data');


module.exports = {
  up: async function insertSampleProfilesData(queryInterface, Sequelize) {
    const data = await loader.getSampleData();
    const profiles = data.map(row => {
      const profile = {
        userID: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        emailAddress: row.emailAddress,
        phoneNumber: row.phoneNumber,
      }

      return profile;
    })

    return queryInterface.bulkInsert('UserProfile', profiles);
  },

  down: function deleteSampleProfilesData(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('UserProfile', null, {});
  }
}
