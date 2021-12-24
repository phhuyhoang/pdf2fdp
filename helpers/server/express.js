const fs = require('fs');
const path = require('path');


/**
 * Help server.js look more concise and readable
 */
class ExpressHelper {

  /**
   * Load all routes from the given directory. 
   * In case the route name is `index`, automatically load to root (`/`).
   * @param {Express} server - The Express application server
   * @param {string} directory - A folder contains routers
   */
  static autoloadRoutes(server, directory) {
    for (const file of fs.readdirSync(directory)) {
      const route = {
        name: path.parse(file).name,
        file: path.resolve(`${directory}/${file}`)
      }
      
      route.name == 'index' 
        ? server.use('/', require(route.file))
        : server.use(`/${route.name}`, require(route.file))
    }
  }
}

module.exports = ExpressHelper;
