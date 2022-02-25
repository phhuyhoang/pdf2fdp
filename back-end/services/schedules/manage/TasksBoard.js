const scheduler = require('node-schedule');
const secret = new WeakMap();


class TasksBoard {
  constructor() {
    const self = TasksBoard;
    let privateScope = secret.get(self);

    if (privateScope && privateScope.instance instanceof TasksBoard) {
      const singleton = privateScope.instance;
      return singleton;
    }
    else {
      secret.set(self, {});
      privateScope = secret.get(self);

      /**
       * Tasks will be executed today
       */
      privateScope.pendingToday = [];

      privateScope.forEachTask = function forEachTask(callback) {
        for (const task of this.pendingToday) {
          callback(task);
        }
      }

      privateScope.instance = this;
    }
  }


  schedule(rule, callback) {
    const self = TasksBoard;
    const privateScope = secret.get(self);
    const task = scheduler.scheduleJob(rule, callback);
    
    privateScope.pendingToday.push(task);
    return task;
  }


  invokeAll() {
    const self = TasksBoard;
    const privateScope = secret.get(self);

    privateScope.forEachTask(task => task.invokeAll());
    return this;
  }


  reset() {
    const self = TasksBoard;
    const privateScope = secret.get(self);

    privateScope.forEachTask(task => task.cancel());
    privateScope.pendingToday.length = 0;
    return this;
  }
}


module.exports = new TasksBoard;
