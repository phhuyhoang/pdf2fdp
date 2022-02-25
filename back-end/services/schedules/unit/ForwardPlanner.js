const path = require('path');
const datetools = require('date-fns');
const schedule = require('node-schedule')
const Task = require('./Task');
const JSONArrayIO = require('./JSONArrayIO');


/**
 * @abstract
 */
class ForwardPlanner {

  constructor(json) {
    this.path = path.resolve(json);
    this.jsonio = new JSONArrayIO(this.path);

    // Runs at system startup 
    this.updateTodayPlans();

    // Automatically update at 0:00 of the next day if the system keeps running 
    schedule.scheduleJob(datetools.startOfTomorrow(), this.updateTodayPlans);
  }

  /**
   * This function will be emitted when due
   * @param {Object} context - Task's private scope
   */
  mission(context) {}

  /**
   * This function will be emitted in case the task is not due today
   * @param {Object} context - Task's private scope
   */
  futureDecision(context) {}

  /**
   * Provide interactiveable and configurable task entity
   * @param {*} target
   */
  getTask(target) {
    return new Task(this, target, this.mission.bind(this))
  }

  /**
   * Run overdue tasks and schedule tasks have due today onto the dashboard
   */
  updateTodayPlans() {
    if (this.jsonio) {
      const self = this;
      const beforeUpdate = this.jsonio.read();
      const afterUpdate = [];

      beforeUpdate.forEach(record => {
        const now = new Date();
        const fromRecord = datetools.parseJSON(record.datetime);
        const overDue = datetools.isPast(fromRecord) || datetools.isEqual(now, fromRecord);
        const dueToday = datetools.isSameDay(now, fromRecord) && datetools.isFuture(fromRecord);
  
        if (overDue) {
          new Task(self, record.target, self.mission)
            .after(datetools.secondsToMilliseconds(10))
            .enforce();
          return;
        }

        if (dueToday) {
          new Task(self, record.target, self.mission)
            .when(record.datetime)
            .enforce();
        }

        afterUpdate.push(record);
      });

      if (beforeUpdate.length !== afterUpdate.length) {
        this.jsonio.write(afterUpdate)
      }
    }
  }
}

module.exports = ForwardPlanner;
