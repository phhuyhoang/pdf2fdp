class Determiner {

  static isFunction(object) {
    return typeof object === 'function';
  }

  static isPureFunction(object) {
    return this.isFunction(object) && !this.isClass(object);
  }

  static isClass(object) {
    return this.isFunction(object) && /^class[\s]*.*\{/.test(object.toString())
  }

}


module.exports = Determiner;
