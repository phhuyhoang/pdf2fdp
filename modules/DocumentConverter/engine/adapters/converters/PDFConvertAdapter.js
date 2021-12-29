const LinkableCommand = require('../../LinkableCommand');
const PDFInfo = require('../../../util/info');

const _private = new WeakMap()


class PDFConvertAdapter {
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
    _private.get(this).info = null;
    _private.get(this).options = {};
    _private.get(this).adapt = {};
    _private.get(this).fromPage = null;
    _private.get(this).toPage = null;

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

    _private.get(this).adapt.dpi = function(builder, info, dpi) {
      if (typeof builder.setDPI == 'function' && dpi != 'original') {
        builder.setDPI(dpi);
      }
    }

    _private.get(this).adapt.width = function(builder, info, width) {
      const pageWidth = info.pageSize.width / 0.47967767929089444; // A4 to px
      
      if (width.toString().endsWith('%')) {
        const rate = parseFloat(width.slice(0, -1));
        width = parseInt(pageWidth * (rate / 100))
      }

      if (typeof builder.setHorizontalScale == 'function' && width != 'original') {
        const scale = width / pageWidth;
        builder.setHorizontalScale(scale.toFixed(2));
      }
      else if (typeof builder.setWidth == 'function' && width != 'original') {
        builder.setWidth(parseInt(width))
      }
    }

    _private.get(this).adapt.height = function(builder, info, height) {
      const pageHeight = info.pageSize.height / 0.47967767929089444; // A4 to px

      if (height.toString().endsWith('%')) {
        const rate = parseFloat(height.slice(0, -1));
        height = parseInt(pageHeight * (rate / 100))
      }

      if (typeof builder.setVerticalScale == 'function' && height != 'original') {
        const scale = height / pageHeight;
        builder.setVerticalScale(scale.toFixed(2));
      }
      else if (typeof builder.setHeight == 'function' && height != 'original') {
        builder.setHeight(parseInt(height))
      }
    }

    _private.get(this).adapt.fromPage = function(builder, info, page) {
      if (typeof page == 'number' && typeof builder.convertFromPage == 'function') {
        builder.convertFromPage(page)
      }
      if (typeof page == 'number' && typeof builder.setSpecifiedPage == 'function') {
        builder.setSpecifiedPage(page)
      }
    }

    _private.get(this).adapt.toPage = function(builder, info, page) {
      if (typeof page == 'number' && typeof builder.convertToPage == 'function') {
        builder.convertToPage(page)
      }
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

  setInfo(info) {
    _private.get(this).info = info;
    return this;
  }

  fromPage(page) {
    _private.get(this).fromPage = page;
    return this;
  }

  toPage(page) {
    _private.get(this).toPage = page;
    return this;
  }

  async getExecutable(build_options = {}) {
    const Builder = _private.get(this).builder;
    const configurator = _private.get(this).configurator;
    const options = _private.get(this).options;
    const input = _private.get(this).source;
    const output = _private.get(this).dest;
    const builder = new Builder(options)
      .setInputExtension(options.inputExtension)
      .setOutputExtension(options.outputExtension);

    if (!_private.get(this).info) {
      _private.get(this).info = await PDFInfo.getDocumentInfo(this.source);
    }
    
    const info = _private.get(this).info;

    // use configurator to config builder here
    Object.keys(configurator).forEach(key => {
      if (key == 'dpi')
        _private.get(this).adapt.dpi(builder, info, configurator.dpi);
      if (key == 'width')
        _private.get(this).adapt.width(builder, info, configurator.width);
      if (key == 'height')
        _private.get(this).adapt.height(builder, info, configurator.height);
    });

    if (_private.get(this).fromPage)
      _private.get(this).adapt.fromPage(builder, info, _private.get(this).fromPage);
    if (_private.get(this).toPage)
      _private.get(this).adapt.toPage(builder, info, _private.get(this).toPage);

    const command = builder.build(input, output, { returnString: true, addOutputExtension: true, ...build_options });
    return new LinkableCommand(command);
  }
}


module.exports = PDFConvertAdapter;
