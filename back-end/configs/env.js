/*
 |----------------------------------------------------------------------
 | DEVELOPMENT ENVIRONMENT
 |----------------------------------------------------------------------
 | Load external and declare internal environment variables
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');


const internal_env = {
  ENTRY_ROOT: path.resolve(__dirname, '..', '..'),
  ENTRY_CONFIG: path.resolve(__dirname, '..', 'configs'),
  ENTRY_MODELS: path.resolve(__dirname, '..', 'models'),
  ENTRY_CORE: path.resolve(__dirname, '..', 'modules'),
  ENTRY_CONTROLLERS: path.resolve(__dirname, '..', 'controllers'),
  ENTRY_DATABASE: path.resolve(__dirname, '..', 'database'),
  ENTRY_HELPERS: path.resolve(__dirname, '..', 'helpers'),
  ENTRY_ROUTES: path.resolve(__dirname, '..', 'routes'),
  ENTRY_VIEWS: path.resolve(__dirname, '..', 'views'),
  ENTRY_MIDDLEWARES: path.resolve(__dirname, '..', 'middlewares'),
  ENTRY_PUBLIC: path.resolve(__dirname, '../../front-end', 'public')
};

const project_env = internal_env.ENTRY_ROOT + '/.env';

const env = fs.existsSync(project_env)
    ? dotenv.config({ path: project_env })
    : { parsed: {} }

Object.assign(env.parsed, internal_env);
Object.assign(process.env, internal_env);

module.exports = env;
