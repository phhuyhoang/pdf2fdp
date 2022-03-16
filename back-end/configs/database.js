/*
 |----------------------------------------------------------------------
 | DATABASE CONNECTOR
 |----------------------------------------------------------------------
 | To facilitate parallel development and operation, I recommend that you 
 | should use two separate databases. 
 */

const fs = require('fs');
const Sequelize = require('sequelize');
const env = require('./env');

var connector;

const config = {
  development: {
    host: env.parsed.DATABASE_HOST_TEST,
    dbname: env.parsed.DATABASE_NAME_TEST,
    dialect: env.parsed.DATABASE_DIALECT_TEST,
    username: env.parsed.DATABASE_USER_TEST,
    password: env.parsed.DATABASE_PWD_TEST,
    timezone: env.parsed.DATABASE_TIMEZONE_TEST,
    benchmark: true,
  },
  application: {
    host: env.parsed.DATABASE_HOST,
    dbname: env.parsed.DATABASE_NAME,
    dialect: env.parsed.DATABASE_DIALECT,
    username: env.parsed.DATABASE_USER,
    password: env.parsed.DATABASE_PWD,
    timezone: env.parsed.DATABASE_TIMEZONE,
    benchmark: true,
  }
}

if (config.development.dbname == config.application.dbname) {
  throw new Error('The development and product database should not be the same!')
}

if (env.parsed.APPLICATION_ENV == 'development') {
  const database = config.development;
  connector = new Sequelize(database.dbname, database.username, database.password, config.development);

  connector.useDevelop = async () => connector;
}
else {
  const database = config.application;
  connector = new Sequelize(database.dbname, database.username, database.password, config.development);
  process.env.APPLICATION_ENV = env.parsed.APPLICATION_ENV;

  // Use `pdf2fdp_test` be default. Define or replace it whatever you want in your .env file
  connector.useDevelop = async function useDevelopmentDatabase() {
    if (!config.development.dbname) {
      throw new Error('The development database is not provided yet.')
    }
    return new Sequelize(config.development.dbname, config.development.username, config.development.password, config.development);
  }
}


module.exports = connector;
