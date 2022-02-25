const _ = require('lodash');


module.exports = _.assign(Object.create(null), _);


/**
 * @example
 * { a: 1, b: 2, c: 3 } --> [ 'a', 1, 'b', 2, 'c', 3 ]
 */
module.exports.objectEntriesToFlattedArray = function objectEntriesToFlattedArray(object) {
  return _.chain(object).entries().flatten().value();
}
