const path = require('path');
const DeleteFileAtSpecificTime = require('./tasks/DeleteFileAtSpecificTime.task')


/**
 * @private
 */
const ForwardPlanner = {
  deleteFileAtSpecificTime: new DeleteFileAtSpecificTime(path.resolve(__dirname, './store/DeleteFileAtSpecificTime.json')),
}


class ScheduleServiceProvider {
  
  deleteFileAtSpecificTime(target) {
    return ForwardPlanner.deleteFileAtSpecificTime.getTask(target)
  }
}


module.exports = new ScheduleServiceProvider;
