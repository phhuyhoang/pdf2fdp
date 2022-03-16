const fs = require('fs');
const path = require('path');
const glob = require('glob');
const determiner = require('./Determiner.helper');


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

  /**
   * @param {Express} server
   * @param {string} root
   * @param {string[]} folders
   */
  static autoloadViews(server, root, folders) {
    for (const folder of folders) {
      const handlebarFiles = glob.sync(`${root}/${folder}/**/*.hbs`);
      for (const handlebarFile of handlebarFiles) {
        const partialName = path.parse(handlebarFile).name;
        // console.log(1)
        server.locals.hbs.registerPartial(partialName, fs.readFileSync(handlebarFile, 'utf-8'));
      }
    }
  }


  static autoloadMiddlewares(server, folders) {

    const middlewares = fs.existsSync(folders)
      ? require(folders)
      : glob.sync(
          path.resolve(folders, '**/*.middleware.js'), { absolute: true }
        )
        .map(file => require(file));

    for (const middleware of middlewares) {

      if (determiner.isClass(middleware) && determiner.isFunction(middleware.handle)) {
        server.use(middleware.handle);
      }
      else if (determiner.isPureFunction(middleware)) {
        server.use(middleware);
      }

    }
  }
}

module.exports = ExpressHelper;
