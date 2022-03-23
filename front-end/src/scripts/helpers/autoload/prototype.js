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

  HTMLElement.prototype.copyEventListeners = function copyEventListeners(target) {
    /**
     * https://cdn.jsdelivr.net/npm/geteventlisteners@1.1.0/src/getEventListeners.min.js
     */
    if (typeof target.getEventListeners == 'function') {
      const events = target.getEventListeners() || Object.create(null);
      const names = Object.keys(events);

      for (const name of names) {
        const eventListenerList = events[name] || [];
        eventListenerList.forEach(event => this.addEventListener(event.type, event.listener, event.useCapture));
      }

      return true;
    }

    return false;
  }

  HTMLElement.prototype.deepClone = function deepCloneElement() {
    const clone = this.cloneNode(true);
    
    if (typeof clone.copyEventListeners == 'function') {
      clone.copyEventListeners(this);
    }

    return clone;
  }

  HTMLElement.prototype.copyChildNodesOf = function copyChildNodesOf(target) {
    const children = Array.from(target.childNodes);
    const clones = children.map(child => this.deepClone.call(child));

    this.innerHTML = '';
    clones.forEach(node => this.append(node));
    return clones;
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
