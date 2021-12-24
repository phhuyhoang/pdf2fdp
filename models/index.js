'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config');
const env = config.env.parsed;

const sharable = Object.create(null)
sharable._env = config.env.parsed;

fs.readdirSync(env.ENTRY_MODELS)
  .filter(file => file.endsWith('.js') && file !== path.basename(__filename))
  .forEach(file => {
    const model = require(`${env.ENTRY_MODELS}/${file}`);
    sharable[model.name] = model;
  });

module.exports = sharable;
