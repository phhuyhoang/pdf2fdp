const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const ava = require('ava');
const chalk = require('chalk');
const datetools = require('date-fns');
const syslib = require('../helpers/SysLib.helper');
const init = require('./init');

init.useDefaultHooks();


const local = {
  provider: require('../services/schedules/ScheduleServiceProvider.service'),
  prepared: {
    directory: path.resolve(__dirname, 'sample/schedule_test'),
    file: path.resolve(__dirname, 'sample/schedule_test/foo.json')
  },
  period: {
    TEN_SECONDS: datetools.secondsToMilliseconds(10),
  },
  func: {
    checkFileExistsAfter: function checkFileExistsAfter(miliseconds) {
      return new Promise (resolve => {
        setTimeout(() => 
          resolve(fs.existsSync(local.prepared.file)), 
          miliseconds);
      });
    },
    countDownEverySecond: function countDownEverySecond(miliseconds) {
      let limiterAsSecond = datetools.millisecondsToSeconds(miliseconds);
      let oneSecond = datetools.secondsToMilliseconds(1);
      let remainder = Math.floor(limiterAsSecond);

      const interval = setInterval(() => console.log(`COUNTDOWN: ${--remainder}`), oneSecond);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        clearTimeout(timeout);
      }, miliseconds)
    }
  }
}


ava.before('preparation: create temporary file', function createTemporaryFile(test) {
  syslib.path.resolveThenCreateFolder(local.prepared.directory);
  syslib.path.resolveThenWriteFile(local.prepared.file, JSON.stringify({ foo: 'bar' }));

  test.pass()
});


ava.serial('test case: automatically delete file after 10 seconds', async function automaticallyDeleteFile(test) {
  const ScheduleProvider = local.provider;
  
  const notice = chalk.greenBright(`This file will be deleted after TEN_SECOND: ${local.prepared.file}`);
  console.log(notice);

  ScheduleProvider
    .deleteFileAtSpecificTime(local.prepared.file)
    .after(local.period.TEN_SECONDS)
    .enforce();

  local.func.countDownEverySecond(local.period.TEN_SECONDS);
  const stillExist = await local.func.checkFileExistsAfter(local.period.TEN_SECONDS);

  test.falsy(stillExist);
})


ava.serial('test case: automatically delete folder after next 10 seconds', async function automaticallyDeleteFolder(test) {
  const ScheduleProvider = local.provider;

  const notice = chalk.greenBright(`This folder will be deleted after TEN_SECOND: ${local.prepared.directory}`);
  console.log(notice);

  ScheduleProvider
    .deleteFileAtSpecificTime(local.prepared.directory)
    .after(local.period.TEN_SECONDS)
    .enforce();

  local.func.countDownEverySecond(local.period.TEN_SECONDS)
  const stillExist = await local.func.checkFileExistsAfter(local.period.TEN_SECONDS);

  test.falsy(stillExist);
})


ava.after('after: clear temporary files', function clearTemporaryFile(test) {
  syslib.fs.safeRecursiveRemove(local.prepared.directory);

  // History will automatically update at 0:00 of the next day.
  test.pass()
});
