const _private = new WeakMap();


class ThreadPool {
  constructor() {
    /**
     * Init a private context
     */
    const property = {}
    const self = this;
    _private.set(this, property);

    /**
     * @type {Number<Int>}
     * @private
     */
    _private.get(this).limit = Infinity;

    /**
     * @type {Function[]}
     * @private
     */
    _private.get(this).threads = [];

    /**
     * @type {?ThreadPool}
     * @private
     */
    _private.get(this).next = null;

    /**
     * @type {?Function}
     * @private
     * @callback {ThreadPool~doAfter}
     * @param {?Array} fulfilled - Return values of Promise.all
     */
    _private.get(this).after = null;

    /**
     * @type {Number<Int>}
     * @public
     * @readonly
     */
    Object.defineProperty(this, 'size', {
      enumerable: true,
      get: function getPoolSize() {
        return _private.get(self).threads.length;
      }
    }) 
  }

  /**
   * 
   * @return {boolean}
   */
  isFull() {
    const length = _private.get(this).threads.length
    const limit = _private.get(this).limit;
    return length >= limit;
  }

  /**
   * Specify the size limit for Pool
   * @param {Number<Int>} size
   */
  setPoolSize(size) {
    if (Number.isInteger(size) && size > 0) {
      _private.get(this).limit = size;
    }
    return this;
  }

  /**
   * Invoker is considered as a function with no arguments, 
   * used to wake up another function and return its result.
   * @example
   * ```javascript
   * ThreadPool.addInvoker(function threadExample() {
   *   return (async function() {
   *     return 'Hello world';
   *   });
   * })
   * ```
   * @param {Function} invoker
   */
  addInvoker(invoker) {
    if (typeof invoker !== 'function')
      throw new Error('Invoker must be a function');
    if (this.isFull())
      throw new Error('This pool has reached the maximum size')

    _private.get(this).threads.push(invoker);
    return this;
  }

  /**
   * Take an invoker out of the pool
   * @param {Number|Function} invoker - Index of that invoker, or itself
   * @return {?Function} - The removed invoker 
   */
  takeoutInvoker(invoker) {
    const threads = _private.get(self).threads;

    if (Number.isInteger(invoker)) {
      const index = invoker;
      if (threads[index]) {
        return threads.splice(index, 1);
      }
    }
    else if (threads.includes(invoker)) {
      const index = threads.findIndex(invoker);
      return threads.splice(index, 1);
    }
  }

  /**
   * Do something after the current pool thread ended.
   * @param {ThreadPool~doAfter} callback - A callback takes an argument is the fulfilled
   * value of this promise pool.
   */
  setAfter(callback) {
    if (typeof callback == 'function') {
      _private.get(this).after = async function (fulfilled) {
        return callback(fulfilled);
      };
    }

    return this;
  }

  /**
   * Set next pool.
   * @param {ThreadPool} pool
   */
  setNext(pool) {
    if (pool instanceof ThreadPool) {
      _private.get(this).next = pool;
    }

    return this
  }

  /**
   * Asynchronously execute processes.
   * @return {Promise}
   */
  run() {
    const self = this;
    const threads = _private.get(self).threads;

    return new Promise((resolve, reject) => {
      Promise.all(threads.map(invoke => invoke()))
        .then(fulfilled => {
          let result = fulfilled;

          if (typeof _private.get(self).after == 'function')
            _private.get(self).after(result).then(res => {
              if (_private.get(self).next instanceof ThreadPool)
                resolve(_private.get(self).next.run())
              else
                resolve(res);
            });
          else {
            if (_private.get(self).next instanceof ThreadPool)
              resolve(_private.get(self).next.run())
            else
              resolve(result);
          }
        })
        .catch(error => {
          reject(error);
        });

    })
  }
}

module.exports = ThreadPool;
