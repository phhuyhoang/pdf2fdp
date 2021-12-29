const LinkableCommand = require('../../LinkableCommand');

const _private = new WeakMap();


class PDFSplitAdapter {
  constructor(configurator) {
    /**
     * Init a private context
     */
    const property = {}
    const self = this;
    _private.set(this, property);

    _private.get(this).configurator = configurator;
    _private.get(this).builder = null;
    _private.get(this).source = null;
    _private.get(this).dest = null;
    _private.get(this).options = {};

    /**
     * Define readonly property
     * @private
     */
    _private.get(this).setReadOnly = (owner, property) => {
      Object.defineProperty(self, property, {
        enumerable: true,
        get: () => owner[property]
      })
    }

    _private.get(this).setReadOnly(_private.get(this), 'configurator');
    _private.get(this).setReadOnly(_private.get(this), 'builder');
    _private.get(this).setReadOnly(_private.get(this), 'source');
    _private.get(this).setReadOnly(_private.get(this), 'dest');
    _private.get(this).setReadOnly(_private.get(this), 'options');
  }

  setBuilder(builder) {
    _private.get(this).builder = builder;
    return this;
  }

  setInput(source) {
    _private.get(this).source = source;
    return this;
  }

  setOutput(dest) {
    _private.get(this).dest = dest;
    return this;
  }

  setOptions(options) {
    _private.get(this).options = options;
    return this;
  }

  getExecutable() {
    const Builder = _private.get(this).builder;
    const configurator = _private.get(this).configurator;
    const options = _private.get(this).options;
    const input = _private.get(this).source;
    const output = _private.get(this).dest;
    const builder = new Builder(options);

    // use configurator to config builder here 

    const command = builder.build(input, output, { returnString: true });
    return new LinkableCommand(command);
  }
}


module.exports = PDFSplitAdapter;
