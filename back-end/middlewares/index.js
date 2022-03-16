const CreateRequestLocalContext = require('./CreateRequestLocalContext.middleware');
const MakeRequestObjectAccessible = require('./MakeRequestObjectAccessible.middleware');
const ResponseObjectExtender = require('./ResponseObjectExtender.middleware');


module.exports = [
  CreateRequestLocalContext,
  MakeRequestObjectAccessible,
  ResponseObjectExtender,
]
