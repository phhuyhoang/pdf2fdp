const datetools = require('date-fns');
const scheduler = require('node-schedule');
const safeStringify = require('json-stringify-safe');
const TasksBoard = require('../manage/TasksBoard');
const secret = new WeakMap();


class Task {
  constructor(owner, target, callback) {
    secret.set(this, {});
    const privateScope = secret.get(this);
    const self = this;

    privateScope.owner = owner;
    privateScope.target = target;
    privateScope.datetime = datetools.addDays(new Date, 1);
    privateScope.invokeCount = 0;
    privateScope.isActivated = false;
    privateScope.invokable = function invokableWithSharedScope() {
      callback(privateScope);
      privateScope.invokeCount++;
    };
    privateScope.destroy = function destroyTask() {
      secret.delete(self);  // Unallocate reference
      privateScope.taskRef && privateScope.taskRef.cancel();
    };
    privateScope.taskRef = scheduler.scheduleJob(privateScope.datetime, () => {});

    privateScope.taskRef.cancel();

    // Delegating decision about the current task to its owner before the system 
    // shutting down.
    process.on('exit', function backupTodoLater() {
      const isActivatedButNotInvoked = privateScope.isActivated && privateScope.invokeCount < 1;

      if (isActivatedButNotInvoked) {
        console.warn(`WARNING: The system is shutting down. Delegating task with following info:
          JOB: ${ privateScope.owner.constructor.name.toString() }, 
          TARGET: ${ safeStringify(privateScope.target) }, 
          DATETIME: ${ datetools.formatISO9075(privateScope.datetime) }
        `);

        privateScope.owner.futureDecision(privateScope);
      }
    });
  }


  when(date) {
    const privateScope = secret.get(this);
    privateScope.datetime = datetools.isValid(date) ? date : datetools.parseISO(date);
    return this;
  }


  after(miliseconds) {
    if (Number.isInteger(miliseconds)) {
      const dateInMiliseconds = new Date().valueOf() + miliseconds;
      const specificDate = new Date(dateInMiliseconds);
      this.when(specificDate);
    } 
    return this;
  }


  invoke() {
    const privateScope = secret.get(this);
    privateScope.invokable.call();
    privateScope.invokeCount++;
    return this;
  }


  getInvokedTimes() {
    const privateScope = secret.get(this);
    return privateScope.invokeCount;
  }


  enforce() {
    const privateScope = secret.get(this);
    const now = new Date();
    const isPast = datetools.isPast(privateScope.datetime) || datetools.isEqual(now, privateScope.datetime);
    const isToday = datetools.isSameDay(now, privateScope.datetime) && datetools.isFuture(privateScope.datetime);
    const isFuture = datetools.isFuture(privateScope.datetime);

    if (isPast) {
      this.invoke();
      return;
    }

    // This flag is used to let the system know that this task hasn't been invoked.
    // This is important in case crash/reboot system, it will back up in time.
    privateScope.isActivated = true;
    
    if (isToday) {
      const specifiedTimeToday = privateScope.datetime;
      const delegatedMission = privateScope.invokable;

      privateScope.taskRef = TasksBoard.schedule(specifiedTimeToday, delegatedMission);
      return;
    }
    
    if (isFuture) {
      privateScope.owner.futureDecision(privateScope);
      return;
    }
  }


  destroy() {
    const privateScope = secret.get(this);
    privateScope.destroy();
  }
}


module.exports = Task;
