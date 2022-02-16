const child_process = require('child_process');
const _private = new WeakMap();


/**
 * A chainable command executor (Doubly Linked List)
 */
class LinkableCommand {
  /**
   * @param {string} command
   * @param {Object} options
   */
  constructor(command, options = {}) {
    /**
     * Init a private context
     */
    const property = {}
    _private.set(this, property);

    /**
     * @type {string}
     */
    this.command = command || '';

    /**
     * @type {boolean}
     */
    this.verbose = options.verbose || false;

    /**
     * Number of command in sequence
     * @type {Number<Int>}
     */
    this.length = 1;

    /**
     * Index of command in sequence
     * @type {Number<Int>}
     */
    this.index = 0;

    /**
     * The next command will be run automatically after the current command 
     * finished.
     * @type {?LinkableCommand}
     * @private
     */
    _private.get(this).next = null;

    /**
     * Point to the previous command. Mainly used for backtracking linked list.
     * @type {?LinkableCommand}
     * @private
     */
    _private.get(this).prev = null;

    /**
     * Update all elements of the linked list when a new command is appended.
     * @private
     */
    _private.get(this).update = (function update() {
      let length = this.getLast().index + 1;

      this.fromFirst(current => {
        current.length = length;
      })
    }).bind(this);
  }

  /**
   * Get next command
   * @return {?LinkableCommand}
   */
  getNext() {
    return _private.get(this).next;
  }

  /**
   * Get prev command
   * @return {?LinkableCommand}
   */
  getPrev() {
    return _private.get(this).prev;
  }

  /**
   * Append a command to the sequence
   * @param {string|LinkableCommand}
   * @return {?LinkableCommand} - The next command
   */
  setNext(command) {
    if (command instanceof LinkableCommand) {
      const executor = command;
      _private.get(this).next = executor;
      _private.get(executor).prev = this;
      this.length++

      executor.index = this.index + 1;
      _private.get(this).update();
      return executor;
    }
    else if (typeof command == 'string') {
      const executor = new LinkableCommand(command)
      _private.get(this).next = executor;
      _private.get(executor).prev = this;
      this.length++;

      executor.index = this.index + 1;
      _private.get(this).update();
      return executor;
    }
  }

  /**
   * Get the first command, regardless of anywhere in the sequence
   * @return {!LinkableCommand}
   */
  getFirst() {
    let current = this;
    let prev = current.getPrev();

    while (prev) {
      current = prev;
      prev = prev.getPrev();
    }
    return current;
  }

  /**
   * Get the last command, regardless of anywhere in the sequence
   * @return {!LinkableCommand}
   */
  getLast() {
    let current = this;
    let next = current.getNext();

    while (next) {
      current = next;
      next = next.getNext()
    }
    return current;
  }

  /**
   * Loop through all commands of the linked list, starting from the 
   * first one.
   * @param {Function} callback
   */
  fromFirst(callback) {
    let current = this.getFirst();
    let next = current.getNext();
    while (next) {
      callback(current);
      current = next;
      next = next.getNext();
    }
    callback(current);
  }

  /**
   * Enable verbose for all commands in chain.
   * Verbose of the next command will obey the negative of the first 
   * command. 
   */
  toggleVerbose() {
    const verbose = !this.getFirst().verbose;
    this.fromFirst(current => {
      current.verbose = verbose;
    })
    return this;
  }

  /**
   * Get the n-th command in sequence.
   * @return {?LinkableCommand}
   */
  commandAt(n) {
    if (n > this.length - 1) return;

    let current = this.getFirst();
    let index = current.index;

    while (index < n) {
      current = current.getNext();
      index = current.index
    }
    return current;
  }

  /**
   * Check whether a command belongs to the current linked list
   * @param {LinkableCommand}
   * @return {boolean}
   */
  inSequence(command) {
    let isExecutor = command instanceof LinkableCommand;
    let isInSequence = false;

    if (!isExecutor) return false;

    this.fromFirst(current => {
      if (current == command) {
        isInSequence = true;
      }
    });
    return isInSequence;
  }

  /**
   * Get an array of all the commands in the linked list. 
   * Note: They will continue to keep reference to each other. 
   * @param {Function} callback - Map function
   * @return {Array}
   */
  toArray(callback) {
    const array = [];
    this.fromFirst(current => {
      if (typeof callback == 'function')
        array.push(callback(current));
      else
        array.push(current);
    })
    return array;
  }

  /**
   * Run the command from this one onwards, not included the preceding commands 
   */
  run(options = {}) {
    const self = this;
    const stdout = options.stdout || process.stdout;
    const ignoreError = options.ignoreError || false;

    if (self.command) {
      return new Promise(function (resolve, reject) {
        const proc = child_process.spawn(self.command, { shell: true })
          .on('spawn', () => {
            if (self.verbose) {
              console.log(`Spawning process: '${self.command}'`);    
              proc.stdout.pipe(stdout);
            }
            if (typeof options.onSpawn == 'function') {
              options.onSpawn(self, proc.stdout);
            }
          })
          .on('error', error => {
            if (typeof options.onError == 'function') {
              options.onError(self, error, proc.stderr);
            }
            else if (!ignoreError) reject(error);
          })
          .on('exit', (code, signal) => {
            if (typeof options.onExit == 'function') {
              options.onExit(self, proc.stdout);
            }
            if (self.verbose) {
              console.log(`Closing process: '${self.command}'`)
            }
            if (self.getNext() instanceof LinkableCommand) {
              resolve(self.getNext().run(options));
            }
            else {
              resolve({
                process: proc,
                command: self.getFirst()
              });
            }
          });
      });
    }
    else
      return Promise.resolve();
  }
}


module.exports = LinkableCommand;
