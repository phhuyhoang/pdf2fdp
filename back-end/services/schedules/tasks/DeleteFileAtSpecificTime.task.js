const datetools = require('date-fns');
const syslib = require('../../../helpers/SysLib.helper');
const ForwardPlanner = require('../unit/ForwardPlanner');


/**
 * Automatic delete file at a specific time 
 * (also accepts special filetype like folders, symlink, etc.)
 */
class DeleteFileAtSpecificTime extends ForwardPlanner {

  /**
   * @inheritdoc
   */
  mission(context) {
    if (datetools.isPast(context.datetime) || datetools.isEqual(new Date, context.datetime)) {
      console.log(`FILE_EXPIRED: ${context.target}`);
      return syslib.fs.safeRecursiveRemove(context.target);
    }
  }

  /**
   * @inheritdoc
   */
  futureDecision(context) {
    const data = {
      target: context.target,
      datetime: context.datetime,
      invokeCount: context.invokeCount,
    }

    this.jsonio.update(data);
    return true;
  }
}


module.exports = DeleteFileAtSpecificTime;
