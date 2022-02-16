const fs = require('fs');
const path = require('path');
const datetools = require('date-fns');
const scheduler = require('node-schedule');

const self = module.exports;
const dest = path.resolve(__dirname, './history.json');
const today = {
  startAt: datetools.startOfToday(),
  tomorrow: datetools.startOfTomorrow(),
  tasks: [],
}


const deleteExpiredFile = function deleteExpiredFile(file) {
  const stat = fs.statSync(file.dir);

  if (stat.isDirectory()) fs.rmdirSync(file.dir, { recursive: true });
  if (stat.isFile()) fs.unlinkSync(file.dir);
}


const addSchedule = function addSchedule(file, options = {}) {
  const delete_file_task = scheduler.scheduleJob(datetools.parseISO(file.expireAt), function autoDeleteAtExpired(timestamp) {
    if (fs.existsSync(file.dir)) {
      console.log(`FILE_EXPIRED: ${file.dir} (${timestamp})`);
      deleteExpiredFile(file);
    }
  });

  today.tasks.push(delete_file_task);
}


/**
 * @param {string} directory
 * @param {Date} createAt
 * @param {Number} expireAfter
 */
module.exports.add = function add(directory, createAt, expireAfter, options = {}) {
  let timestamp;
  const history = self.read() || [];
  
  if (createAt instanceof Date) {
    timestamp = createAt;
  }
  else if (Number.isInteger(createAt)) {
    timestamp = new Date(createAt);
  }
  else return;

  const record = {
    dir: directory,
    createAt: timestamp,
    expireAt: new Date(timestamp.valueOf() + expireAfter)
  };

  if (datetools.isSameDay(record.expireAt, today.startAt)) {
    addSchedule(record, options);
  }
  
  history.push(record);
  console.log(`SET_PERIOD: ${directory} (delete at ${datetools.format(record.expireAt, 'yyyy-MM-dd HH:mm:ss')})`)

  fs.writeFileSync(dest, JSON.stringify(history, null, 2));
}


module.exports.read = function read() {
  if (!fs.existsSync(dest)) {
    fs.writeFileSync(dest, JSON.stringify([]));
    return [];    
  }
  else {
    const history = fs.readFileSync(dest);
    return JSON.parse(history);
  }
}


module.exports.resetHistory = function resetHistory() {
  fs.writeFileSync(dest, JSON.stringify([]));
}


module.exports.period = {};
module.exports.period.ONE_DAY = 1000 * 60 * 60 * 24;
module.exports.period.SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;


// File deletion schedule for the rest of today
// ( in case of system crash and restart )
const timestamp_now = new Date();

self.read()
.map(file => {
  if (file.dir && datetools.isPast(datetools.parseISO(file.expireAt)))
    deleteExpiredFile(file);
  return file;
})
.filter(file => datetools.isFuture(timestamp_now) && datetools.isSameDay(timestamp_now, datetools.parseISO(file.expireAt)))
.forEach(addSchedule);


/**
 * File deletion schedule for tomorrow
 * @param {Date} tomorrow
 */
scheduler.scheduleJob(datetools.startOfTomorrow(), function scheduleForTomorrow(date) {
  const history = self.read() || [];
  const planning_files = history.filter(file => datetools.isSameDay(file.expireAt, date));

  // Cancel failed tasks
  today.tasks.forEach(task => {
    task.cancel();
  });

  today.startAt = date;
  today.tomorrow = datetools.addDays(date, 1);
  today.tasks.length = 0; // Release allocated memory

  // Schedule for automatic file deletion at specified time
  for (const file of planning_files) {
    addSchedule(file);
  }

  // Delete expired records
  const expire_omitted = history.filter((file = {}) => !datetools.isPast(datetools.parseISO(file.expireAt)));

  if (expire_omitted.length < history.length) {
    fs.writeFileSync(dest, expire_omitted);
  }

  // Auto schedule for next day, if system keep running
  // ( auto-recursive )
  scheduler.scheduleJob(today.tomorrow, scheduleForTomorrow);
});
