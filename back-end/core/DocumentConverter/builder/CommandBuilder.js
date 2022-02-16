const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const _ = require('lodash')


const isTesting = function isTesting(tool) {
  try {
    const resolved = require.resolve(tool).toString();
    const acceptTestTools = ['ava', 'mocha', 'jest', 'tap'];
    if (acceptTestTools.some(test => RegExp(`/node_modules/${test}/.*\\.js`).test(resolved))) {
      return true;
    }
  }
  catch(err) {
    return false;
  }
}


/**
 * @class
 * @classdesc Build flexible command by specified settings.
 */
class CommandBuilder {
  constructor(opts = {}) {
    // Path of executor
    this.executor = '';

    // Key, value pairs are equivalent to command options 
    this.options = {};

    // Options aliases
    this.aliases = {};

    // Command parts arranged in order, mainly used for command build purposes
    this.arrange = ['$command', '$input', '$options', '$output'];

    this._ = opts;

    if (this._.testing && isTesting(this._.testing)) {
      Object.defineProperty(this, '_ignoreError', {
        configurable: false,
        value: true
      })
    }
  }

  rearrange(arrange) {
    const needed = ['$command', '$input', '$options', '$output'];

    if (!Array.isArray(arrange) && !needed.every(part => arrange.includes(part))) {
      throw new Error('A standard command needs to have all the parts including: command, input, option, output.');
    }

    this.arrange = arrange;
    return this;
  }

  /**
   * @param {string} input - Path to input file
   * @param {string} output - Path to output file
   * @param {Object} options
   * @return {Array}
   */
  build(input, output, options = {}) {
    const aliasesKeys = Object.keys(this.aliases);
    const optionsKeys = Object.keys(this.options);

    const self = this;
    const interpreted = [];
    const command = [];

    if (options.resolveTilde) {
      input = this._resolveTilde(input);
      output = this._resolveTilde(output);
    }

    const isDirectory = fs.existsSync(output) && fs.statSync(output).isDirectory();
    const isSpecifiedExtensionOutput = this.options && typeof this.options.outputExtension == 'string';

    this._isValidInputFile(input);

    if (isDirectory || (isSpecifiedExtensionOutput && options.addOutputExtension)) {
      const inputFileName = typeof options.customFileName == 'string'
        ? options.customFileName
        : path.parse(input).name;
      const outputExtension = this.options.outputExtension
        ? `.${this.options.outputExtension}` : '';
      
      output = options.addOutputExtension 
        ? path.join(output, `${inputFileName}${outputExtension}`)
        : path.join(output, inputFileName);
    }

    aliasesKeys.forEach(key => {
      const option = this.aliases[key];
      const value = this.options[key];

      // Only push if the value of that option is already set 
      if (value) {
        typeof value == 'boolean' ? interpreted.push(option) : interpreted.push([ option, value ]);
      }
    });

    this.arrange.forEach(part => {
      switch (part) {
        case '$command':
          command.push(self.executor);
          break;
        case '$input':
          command.push(input);
          break;
        case '$output':
          command.push(output);
          break;
        case '$options':
        case '$option':
          command.push(interpreted);
          break;
        default:
          command.push(part);
      }
    });

    const commandAsString = _.flattenDeep(command).join(' ').trim();
    return options.returnString ? commandAsString : command;
  }

  /**
   * Check whether the input file is valid
   * @protected
   */
  _isValidInputFile(input) {
    if (!this._ignoreError && !fs.existsSync(input))
      throw new Error(`No such file: ${input}`);
  }

  /**
   * Replace tilde with its own real path. Only on Linux.
   * @protected
   */
  _resolveTilde(str) {
    return str.startsWith('~') ? path.join(process.env.HOME, str.slice(1)) : str;
  }
}


module.exports = CommandBuilder;
