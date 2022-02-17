'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../configs/');
const env = config.env.parsed;

const sharable = Object.create(null)
sharable._env = config.env.parsed;



fs.readdirSync(env.ENTRY_MODELS)
  .filter(file => file.endsWith('.js') && file !== path.basename(__filename))
  .forEach(async file => {
    const model = require(`${env.ENTRY_MODELS}/${file}`);
    const db = await config.db.useDevelop();
    sharable[model.name] = model.init(db);
  });

module.exports = sharable;
