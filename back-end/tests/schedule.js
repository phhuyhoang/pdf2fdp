const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const ava = require('ava');
const init = require('./init');

init.useDefaultHooks();

const TestingFolder = '../services/schedules/'


const local = {
  scheduler: {
    FileExpiration: require(`${TestingFolder}/FileExpiration`),
  },
  prepared: {
    directory: path.resolve(__dirname, 'sample/schedule_test'),
    file: path.resolve(__dirname, 'sample/schedule_test/foo.json')
  }
}


ava.before('preparation: create temporary file', function createTemporaryFile(test) {
  if (!fs.existsSync(local.prepared.directory)) {
    fs.mkdirSync(local.prepared.directory);
  }
  if (!fs.existsSync(local.prepared.file)) {
    fs.writeFileSync(local.prepared.file, JSON.stringify({
      foo: 'bar'
    }));
  }

  test.pass()
});


ava.serial('test case: automatically delete file after 10 seconds', async function automaticallyDeleteFile(test) {
  const file_expiration = local.scheduler.FileExpiration;
  file_expiration.period.TEN_SECONDS = 1000 * 10;

  file_expiration.add(local.prepared.file, new Date, file_expiration.period.TEN_SECONDS);

  const checkAfter10Seconds = function checkAfter10Seconds() {
    return new Promise(resolve => {
      setTimeout(function () {
        resolve(fs.existsSync(local.prepared.file));
      }, file_expiration.period.TEN_SECONDS);
    })
  }

  const stillExist = await checkAfter10Seconds();

  test.falsy(stillExist);
})


ava.serial('test case: automatically delete folder after next 10 seconds', async function automaticallyDeleteFolder(test) {
  const file_expiration = local.scheduler.FileExpiration;
  file_expiration.add(local.prepared.directory, new Date, file_expiration.period.TEN_SECONDS);

  const checkAfter10Seconds = function checkAfter10Seconds() {
    return new Promise(resolve => {
      setTimeout(function () {
        resolve(fs.existsSync(local.prepared.directory));
      }, file_expiration.period.TEN_SECONDS);
    })
  }

  const stillExist = await checkAfter10Seconds();

  test.falsy(stillExist);
})


ava.after('after: clear temporary files', function clearTemporaryFile(test) {
  if (fs.existsSync(local.prepared.directory)) {
    fs.rmdirSync(local.prepared.directory, { recursive: true });
  }

  local.scheduler.FileExpiration.resetHistory();
  test.pass()
});
