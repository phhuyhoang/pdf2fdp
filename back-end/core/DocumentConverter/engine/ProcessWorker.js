const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const LinkableCommand = require('./LinkableCommand');
const PDFSplitter = require('./adapters/splitters/PDFSplitAdapter');
const PDFConverter = require('./adapters/converters/PDFConvertAdapter');
const ThreadPool = require('./ThreadPool');
const PDFInfo = require('../util/info');
const _private = new WeakMap();


class ProcessWorker {
  constructor(config) {
    /**
     * Init a private context
     */
    const property = {}
    const self = this;
    _private.set(this, property);

    /**
     * Cache folder
     * @private
     */
    _private.get(this)._cache = path.resolve(__dirname, '..', '.cache');

    /**
     * Task queue
     * @type {ThreadPool[]}
     * @private
     */
    _private.get(this).tasks = [];

    /**
     * Convert configurator
     * @type {ConvertConfigurator}
     * @private
     */
    _private.get(this).configurator = config;

    /**
     * Create random pid
     * @private
     */
    _private.get(this).createRandomPID = () => Date.now().toString() + Math.random().toString(10).slice(2, 4);

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

    this.source = null;
    this.dest = null;
    this.done = false;

    _private.get(this).setReadOnly(_private.get(this), '_cache');
    _private.get(this).setReadOnly(_private.get(this), 'configurator');
    _private.get(this).setReadOnly(_private.get(this), 'converter');
    _private.get(this).setReadOnly(_private.get(this), 'splitter');
    _private.get(this).setReadOnly(_private.get(this), 'options');

    Object.defineProperty(this, 'taskCount', {
      enumerable: true,
      get: function getTaskCount() {
        return _private.get(self).tasks.length;
      }
    })

    this._id = _private.get(this).createRandomPID();
    while (fs.existsSync(path.resolve(_private.get(this)._cache, this._id))) {
      this._id = _private.get(this).createRandomPID();
    }

    if (!fs.existsSync(_private.get(this)._cache)) {
      fs.mkdirSync(_private.get(this)._cache);
    }
  }

  /**
   * @param {ConvertEngine} engine
   */
  setEngine(engine) {
    const context = _private.get(this);
    context.engine = engine;
    return this;
  }

  /**
   * @param {SplitterBuilder} splitter
   */
  setSplitter(splitter) {
    const context = _private.get(this);
    context.splitter = splitter;
    return this;
  }

  /**
   * @param {ConverterBuilder} builder
   */
  setConverter(converter) {
    const context = _private.get(this);
    context.converter = converter;
    return this;
  }

  /**
   * The temporary directory contains intermediate conversion files.
   * @param {string} dir
   */
  setTempFolder(dir) {
    const context = _private.get(this);
    context._cache = dir;
    return this;
  }

  /**
   * @param {Object} options
   */
  setOptions(options) {
    const context = _private.get(this);
    context.options = options;
    return this;
  }

  /**
   * @param {string} input
   * @param {string} output
   */
  setExtensions(input, output) {
    if (input) this.inputExtension = input;
    if (output) this.outputExtension = output;
    return this;
  }

  /**
   * @param {string} source
   */
  setInput(source) {
    this.source = source;
    return this;
  }

  /**
   * @param {string} dest
   */
  setOutput(dest) {
    this.dest = dest;
    return this;
  }

  /**
   * @return {Promise) 
   */
  async convert() {
    // Deadline coming
    const self = this;
    const _cache = this._cache;
    const tasks = _private.get(this).tasks;
    const engine = _private.get(this).engine;
    const configurator = _private.get(this).configurator
    const temporaryFolder = path.resolve(_cache, this._id);
    const inputExtension = this.options.inputExtension;
    const outputExtension = this.options.outputExtension;

    if (!fs.existsSync(temporaryFolder)) fs.mkdirSync(temporaryFolder); 

    const splitPool = new ThreadPool();
    const convertPool = new ThreadPool();

    if (_private.get(this).splitter) tasks.push(splitPool);
    if (_private.get(this).converter) tasks.push(convertPool);

    if (_private.get(this).splitter) {
      const targetFolder = tasks.length > 1 ? path.resolve(temporaryFolder, 'pdf') : this.dest;
      if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);

      const splitter = new PDFSplitter(configurator)
        .setBuilder(this.splitter)
        .setInput(this.source)
        .setOutput(targetFolder)
        .setOptions({ inputExtension, outputExtension: inputExtension }) // PDF -> PDF
        .getExecutable();

      splitPool
        .setPoolSize(1)
        .addInvoker(function invokeSplitter() {
          return splitter.run({
            ignoreError: true,
            onSpawn: function beforeProcessStart(self, stdout) {
              console.log(`Starting process "PDFSplitter"`);
              console.log(`Extracting PDF into "${targetFolder}"`);
              stdout.pipe(process.stdout);
            },
            onExit: function  beforeProcessDone(self, stdout) {
              console.log(`Closing process "PDFSplitter"`);
            }
          });
        });
    }

    if (_private.get(this).converter) {
      const targetFolder = this.dest;
      const splitBeforeConvert = splitPool.size > 0 && _private.get(this).splitter;
      if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);

      if (splitBeforeConvert) {
        splitPool.setAfter(async function () {
          const prevFolder = path.resolve(temporaryFolder, 'pdf');
          const splittedFiles = fs.readdirSync(prevFolder)
            .map(file => path.resolve(prevFolder, file))
            .filter(file => file.endsWith(`.${inputExtension}`));
          const commands = [];
          const converter = new PDFConverter(configurator)
              .setBuilder(self.converter)
              .setOptions({ inputExtension, outputExtension });

          for await (const file of splittedFiles) {
            converter
              .setInput(file)
              .setOutput(targetFolder)
              
            const _converter = await converter.getExecutable()

            commands.push(_converter);
          }
          
          const number_of_workers = engine._workers.length;
          const thread_limiter = number_of_workers < 2 
            ? engine._maxThreadSafe 
            : Math.floor(engine._maxThreadSafe / number_of_workers);
          const chunks = _.chunk(commands, thread_limiter);
          
          const heads = chunks.shift().map((head, index) => {
            let current = head;
          
            for (const chunk of chunks) {
              const command = chunk[index];
              
              if (command instanceof LinkableCommand) {
                current.setNext(command);
                current = command;
              }
            }

            return head;
          });

          convertPool.setPoolSize(thread_limiter)

          let count = 0;
          // let threads_count = 0;
          const start = new Date;
          for (const head of heads) {
            convertPool.addInvoker(function invokeConverter() {
              return head.run({
                ignoreError: true,
                onSpawn: function beforeProcessStart(self, stdout) {
                  // threads_count++; console.log(threads_count);
                  count++;
                  console.log(`Spawning process ${count}: "${self.command}"`);
                  stdout.pipe(process.stdout);
                },
                onExit: function  beforeProcessDone(self, stdout) {
                  // threads_count--; console.log(threads_count);
                  const now = new Date;
                  const cost = (now - start) / 1000;
                  console.log(`Closing process ${count}: "${self.command}" -> ${cost.toFixed(2).toString()}s`)
                  if (count == commands.length) {
                    const end = new Date;
                    const costend = (end - start) / 1000;
                    console.log(`Total convert time: ${costend.toFixed(2).toString()}s`);
                  }
                }
              })
            })
          }

          splitPool.setNext(convertPool);
        });
      }
      else {
        // TODO: Fix bug convert without split
        const source = this.source;
        const dest = this.dest;
        const commands = [];

        const info = await PDFInfo.getDocumentInfo(source);
        const pages = Array.isArray(info.pageIndices) ? info.pageIndices : [];
        const converter = new PDFConverter(configurator)
          .setBuilder(self.converter)
          .setInfo(info)
          .setOptions({ inputExtension, outputExtension })

        for await (const page of pages) {
          converter
            .setInput(source)
            .setOutput(dest)
            .fromPage(page)
            .toPage(page)

          const _converter = await converter.getExecutable({ customFileName: page.toString() });

          commands.push(_converter);
        }

        const number_of_workers = engine._workers.length;
        const thread_limiter = number_of_workers < 2 
          ? engine._maxThreadSafe 
          : Math.floor(engine._maxThreadSafe / number_of_workers);
        const chunks = _.chunk(commands, thread_limiter);
        
        const heads = chunks.shift().map((head, index) => {
          let current = head;
        
          for (const chunk of chunks) {
            const command = chunk[index];
            
            if (command instanceof LinkableCommand) {
              current.setNext(command);
              current = command;
            }
          }

          return head;
        });

        convertPool.setPoolSize(thread_limiter)

        let count = 0;
        // let threads_count = 0;
        const start = new Date;
        for (const head of heads) {
          convertPool.addInvoker(function invokeConverter() {
            return head.run({
              ignoreError: true,
              onSpawn: function beforeProcessStart(self, stdout) {
                // threads_count++; console.log(threads_count);
                count++;
                console.log(`Spawning process ${count}: "${self.command}"`);
                stdout.pipe(process.stdout);
              },
              onExit: function  beforeProcessDone(self, stdout) {
                // threads_count--; console.log(threads_count);
                const now = new Date;
                const cost = (now - start) / 1000;
                console.log(`Closing process ${count}: "${self.command}" -> ${cost.toFixed(2).toString()}s`)
                if (count == commands.length) {
                  const end = new Date;
                  const costend = (end - start) / 1000;
                  console.log(`Total convert time: ${costend.toFixed(2).toString()}s`);
                }
              }
            })
          })
        }
      }
    }

    return Promise.resolve(tasks[0].run())
      .then(fulfilled => {
        const responseData = {
          pools: fulfilled,
          hooks: {
            custom: [],
            builtin: [],
          },
        }

        const hooks = require('./hooks/AfterSession');
        const options = {
          cache: path.resolve(_private.get(self)._cache, this._id),
          input: self.source,
          output: self.dest,
        };

        Object.keys(self.options.hooks).forEach(name => {
          const hook = self.options.hooks[name];
          if (typeof hook == 'function') {
            const callHook = hook;
            const invoker = function invokeCustomHook() {
              return callHook(options)
            };
            responseData.hooks.custom.push(invoker)
          }
        })

        Object.keys(hooks).forEach(fname => {
          const func = hooks[fname]
          const name = func.name;
          if (self.options.hooks && self.options.hooks[name]) {
            const callHook = func;
            const invoker = function invokeBuiltinHook() {
              return callHook(options)
            };
            responseData.hooks.builtin.push(invoker);
          }
        })

        self.done = true;
        return responseData;
      })
  }
}


module.exports = ProcessWorker;
