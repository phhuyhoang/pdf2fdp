const fs = require('fs');
const _ = require('lodash');


/**
 * A custom error allows additional warnings and hints.
 */
class ConfiguratorError extends Error {
  constructor(message, ...stack) {
    super(message);
    this.name = this.constructor.name;    
    this.stack = stack.map(line => '?> ' + line).join('\n') + `\n${this.stack}`;
  }
}


/**
 * A read-only config object, to prevent outside interference or change 
 * after initialization.
 */
class ConvertConfigurator {
  static default = {
    dpi: 'original',
    height: 'original',
    width: 'original',
    pages: 'all'
  };

  static fromJSON(json) {
    if (['string', 'object'].every(type => typeof json !== type)) {
      throw new TypeError(`The given argument must be a JSON string or plain object.`);
    }
    const configurator = new ConvertConfigurator;
    json = typeof json == 'string' ? JSON.parse(json) : json;
    json = _.chain(this.default).toPlainObject().assign(json).value();
    _.entries(json).forEach(pairs => configurator.set(...pairs));
    return configurator;
  }

  static fromFile(file) {
    try {
      const json = fs.readFileSync(file).toString();
      const configurator = this.fromJSON(json);
      return configurator;
    }
    catch (e) {
      if (e.code == 'ENOENT' && e.errno == -2) {
        throw new ConfiguratorError('The given configurator file not found.');
      }
      else throw e;
    }
  }

  static getDefault() {
    return ConvertConfigurator.fromJSON(this.default);
  }

  set(key, value) {
    if (typeof key !== 'string')
      throw new TypeError('Configurator key must be a string.');

    try {
      Object.defineProperty(this, key, {
        enumerable: true,
        writable: false,
        value,
      });
    }
    catch (e) {
      throw new ConfiguratorError(
        'Do not interfere and modify the config from the outside after initialization.', 
        'You can only add.');
    }
  }
}


module.exports = ConvertConfigurator;
