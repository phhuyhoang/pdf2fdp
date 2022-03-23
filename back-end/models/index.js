'use strict';

const fs = require('fs');
const path = require('path');

const configured = require('../configs/');
var models;


module.exports = (async function initModels() {

  if (models) return models;
  
  const database = process.env.APPLICATION_ENV == 'development'
    ? await configured.db.useDevelop()
    : configured.db;

  models = {};
  models.User = require('./User').init(database);
  models.UserProfile = require('./UserProfile').init(database);
  models.UserActivity = require('./UserActivity').init(database);
  models.AccessState = require('./AccessState').init(database);
  models.VerifyingUser = require('./VerifyingUser').init(database);

  return models;
  
})();
