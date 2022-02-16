module.exports = {
  env: require('./env'),
  db: require('./database'),
  benefits: {
    free: require('./benefits/free.json'),
    paid: require('./benefits/paid.json'),
  }
}
