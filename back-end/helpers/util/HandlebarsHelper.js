const helpers = [];


module.exports.loadAllHelpers = function loadAllHelpers(hbs) {
  for (const helper of helpers) {
    hbs.registerHelper(helper.name, helper);
  }
}
