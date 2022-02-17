module.exports = {
  env: require('./env'),
  db: require('./database'),
  benefits: {
    free: require('../constants/benefits/free.json'),
    paid: require('../constants/benefits/paid.json'),
  }
}
