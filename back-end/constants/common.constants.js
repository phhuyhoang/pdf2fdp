const datetools = require('date-fns');


module.exports.period = {
  ONE_DAY: datetools.hoursToMilliseconds(24),
  ONE_WEEK: datetools.hoursToMilliseconds(24) * 7,
  ONE_MONTH: datetools.hoursToMilliseconds(24) * 30,
  ONE_YEAR: datetools.hoursToMilliseconds(24) * 365,
}
