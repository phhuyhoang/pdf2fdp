const fs = require('fs');
const path = require('path');
const ava = require('ava')
const config = require('../config');
const models = require('../models');


// initializtion: shared context
async function onStart(test) {
  /**
   * Shared stuff from init, contains libraries and preconfig.
   * Always run first.
   */
  const shared = Object.create(null);
  
  shared.database = config.db;
  shared.dev_database = await config.db.useDevelop();
  shared.env = config.env.parsed;
  shared.enverr = config.env.error;
  shared.models = models;
  shared.passedCount = 0;

  test.context.shared = shared;

  /**
   * Shared stuff from other test scripts.
   */
  fs.readdirSync(__dirname).forEach(file => {
    const name = path.parse(file).name;
    const hooks = path.parse(__filename).name;
    
    if (name === hooks) {
      return;
    }

    if (name !== 'shared') {
      test.context[name] = Object.create(null);
      return;
    }

    throw new Error(`Context named "${name}" already in used.`);
  })
};


// finally: close all database connection
async function onEnd(test) {
  test.context.shared.database.close();
  test.context.shared.dev_database.close();
};


// Increase passed count after each test case passed
async function afterEach(test) {
  test.context.shared.passedCount++;
}


module.exports.useDefaultHooks = function useDefaultHooks() {
  ava.before('initializtion: shared context', onStart);
  ava.after('finally: close all database connection', onEnd);
  ava.afterEach('after each: increase passed count', afterEach);
}
