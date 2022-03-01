module.exports.init = function () {
  /**
   * @param {Object} style - CSS Properties
   */
  HTMLElement.prototype.setCSSStyle = function setCSSStyle(style) {
    for (const property in style) {
      const value = style[property];
      
      if (style[property] !== this.style[property]) {
        this.style.setProperty(property, value);
      }
    }

    return this;
  }

  /**
   * @param {Object} attributes - HTML properties
   */
  HTMLElement.prototype.setHTMLAttributes = function setHTMLAttributes(attributes) {
    for (const attribute in attributes) {
      const value = attributes[attribute];
      
      this.setAttribute(attribute, value);
    }

    return this;
  }

  /**
   * @param {HTMLElement} element
   */
  HTMLElement.prototype.setParent = function setParent(element) {
    if (element instanceof HTMLElement) {
      element.append(this);
    }
    return this;
  }

  /**
   * @param {String|Array} classList
   */
  HTMLElement.prototype.setClass = function setClass(classList) {
    const _classList = Array.isArray(classList) ? classList : classList.toString().split(/\s+/);

    this.className = '';
    for (const classname of _classList) {
      this.classList.add(classname);
    }

    return this;
  }

  /**
   * @param {string} name
   * @param {number} style
   */
  HTMLElement.prototype.applyStyle = function applyStyle(name, style) {
    return this.setClass(`${name} style-${style}`);
  }


  Text.prototype.setParent = HTMLElement.prototype.setParent;


  Object.prototype.subset = function getObjectSubset(...keys) {
    const subset = {};
    for (const key of keys) {
      if (key in this) {
        subset[key] = this[key];
      }
    }
    return subset;
  }
}
