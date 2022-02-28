const _ = require('lodash');
const ava = require('ava');
const crypto = require('crypto');
const init = require('./init');

init.useDefaultHooks();


const local = {
  models: Object.create(null),
  setup: {
    // Edit these values to change test procedure as you wish
    drop_all_table_on_start: false,
    drop_all_table_on_end: true,
  },
  methods: {
    dropAllTable: async function dropAllTable(callback) {
      callback = callback || (function () {});

      try {
        for await (const name of _.keys(local.models)) {
          const model = _.get(local.models, name);
          await model.queryInterface.dropTable(model.name);
          callback();
        }
        return true;
      }
      catch (error) {
        test.fail();
        test.log(error);
        return false;
      }
    }
  },
};


ava.serial('test case: check main database connection', async function testDatabaseConnect(test) {
  try {
    await test.context.shared.database.authenticate();
    await test.context.shared.database.query(`SHOW DATABASES LIKE 'pdf2fdp'`);
    test.pass('1. Connect successfully to main database.');
  }   
  catch (error) {
    test.fail('1. Connect failed to main database.');
    test.log(error);
  }
});


ava.serial('test case: check development database connection', async function testDevDatabaseConnect(test) {
  try {
    await test.context.shared.dev_database.authenticate();
    await test.context.shared.dev_database.query(`SHOW DATABASES LIKE 'pdf2fdp_test'`);
    test.pass('2. Connect successfully to development database.');
  }
  catch (error) {
    test.fail('2. Connect failed to development database.');
    test.log(error);
  }
})


ava.serial('test case: create table User', async function createUserTable(test) {
  try {
    const models = test.context.shared.models;
    const dev_database = test.context.shared.dev_database;

    if (local.setup.drop_all_table_on_start) {
      await local.methods.dropAllTable();
    }

    const User = models.User.init(dev_database);
    local.models.User = User;

    User.queryInterface.createTable(User.name, User.getAttributes());
    test.pass('3. Create table "User" successful.');
  }
  catch (error) {
    test.fail('3. Create table "User" failed.');
    test.log(error);
  }
});


ava.serial('test case: create table UserProfile', async function createUserProfileTable(test) {
  try {
    const models = test.context.shared.models;
    const dev_database = test.context.shared.dev_database;

    const UserProfile = models.UserProfile.init(dev_database);
    local.models.UserProfile = UserProfile;

    UserProfile.queryInterface.createTable(UserProfile.name, UserProfile.getAttributes());
    test.pass('4. Create table "UserProfile" successful.');
  }
  catch (error) { 
    test.fail('4. Create table "UserProfile" failed.');
    test.log(error);
  }
});


ava.serial('test case: create table UserActivity', async function createUserActivityTable(test) {
  try {
    const models = test.context.shared.models;
    const dev_database = test.context.shared.dev_database;

    const UserActivity = models.UserActivity.init(dev_database);
    local.models.UserActivity = UserActivity;

    UserActivity.queryInterface.createTable(UserActivity.name, UserActivity.getAttributes());
    test.pass('5. Create table "UserActivity" successful.');
  }
  catch (error) {
    test.fail('5. Create table "UserActivity" failed.');
    test.log(error);
  }
});


ava.serial('test case: create table AccessState', async function createAccessStateTable(test) {
  try {
    const models = test.context.shared.models;
    const dev_database = test.context.shared.dev_database;

    const AccessState = models.AccessState.init(dev_database);
    local.models.AccessState = AccessState;

    AccessState.queryInterface.createTable(AccessState.name, AccessState.getAttributes());
    test.pass('6. Create table "AccessState" successful.');
  }
  catch (error) {
    test.fail('6. Create table "AccessState" failed.');
    test.log(error);
  }
});


ava.serial('test case: insert a sample data', async function insertSampleData(test) {
  try {
    const data = require('./sample/data.json');

    const User = local.models.User;
    const UserProfile = local.models.UserProfile;

    for await (const row of data) {
      const insertIntoUser = await User.create({
        username: row.user.username,
        passwordHash: crypto.createHash('sha512')
          .update(row.user.password, 'binary')
          .digest('hex'),
      })
      const insertIntoProfile = await UserProfile.create({
        userID: insertIntoUser.userID,
        ...row.profile,
      })
    }
    test.pass('7. Insert sample data successfully.');
  }
  catch (error) {
    test.fail('7. Insert sample data failed.');
    test.log(error);
  }
})


ava.serial('test case: try to insert duplicated data into table User', async function insertDuplicatedDataUser(test) {
  try {
    const User = local.models.User;

    await User.queryInterface.bulkInsert(User.name, [
      {
        username: 'huyhoang',
        passwordHash: crypto.createHash('sha512').update('samplepassword', 'binary').digest('hex'),
      }
    ]);
    test.fail('8. Something went wrong. Why doesn\'t it prevent inserting a duplicated value?');
  }
  catch (error) {
    test.pass('8. Okay. It work.')
  }
})


ava.serial('test case: try to insert violated data into table User', async function insertViolatedDataUser(test) {
  try {
    const User = local.models.User;

    await User.queryInterface.bulkInsert(User.name, [
      {
        username: 123,
        passwordHash: {},
        registrationDate: this,
        profileChangedDate: [],
      }
    ]);
    test.fail('9. Something went wrong. Why doesn\'t catching type errors work?');
  }
  catch (error) {
    test.pass('9. Its still okay.')
  }
})


ava.serial('test case: find username using email address', async function findUsernameByEmail(test) {
  try {
    const User = local.models.User;
    const UserProfile = local.models.UserProfile;

    const emailAddress = 'kamehame@example.com';

    const profile = await UserProfile.findOne({
      where: { emailAddress }
    });

    const user = await User.findByPk(profile.dataValues.userID);

    test.is(user.dataValues.username, 'songoku');
  }
  catch (error) {
    test.fail('10. Not found, please check database schema.')
    test.log(error);
  }
});


ava.serial('test case: update a record and return result', async function updateRecordAndReturn(test) {
  try {
    const UserProfile = local.models.UserProfile;

    const profile = await UserProfile.findOne({
      where: {
        emailAddress: 'hoangdev@example.com'
      }
    });

    profile.phoneNumber = '09876541230';
    await profile.save();

    const updatedProfile = await UserProfile.findOne({
      where: {
        emailAddress: 'hoangdev@example.com',
        phoneNumber: '09876541230'
      }
    })

    test.is(updatedProfile.dataValues.phoneNumber, '09876541230');
  }
  catch (error) {
    test.fail('11. Update failed.')
    test.log(error)
  }
});


ava.serial('test case: delete a row of User table', async function deleteUser(test) {
  try {
    const User = local.models.User;
    const countUsersBefore = await User.count();

    const findTomHolland = async function () {
      const tomHolland = await User.findOne({
        where: {
          username: 'tom_holland'
        }
      });
      return tomHolland;
    };

    const tomHolland = await findTomHolland();
    await tomHolland.destroy();
    const countUsersAfter = await User.count();

    test.plan(2);
    test.is(countUsersAfter, countUsersBefore - 1);
    test.falsy(await findTomHolland());
  }
  catch (error) {
    test.fail('12. Delete failed.')
    test.log(error.syscall)
  }
})


ava.serial('test case: drop all table on end', async function dropAllTableOnEnd(test) {
  try {
    if (local.setup.drop_all_table_on_end) {
      test.plan(_.size(local.models));
      await local.methods.dropAllTable(test.pass);
    }
    else test.pass();
  } 
  catch (error) {
    test.fail();
    test.log(error);
  } 
});
