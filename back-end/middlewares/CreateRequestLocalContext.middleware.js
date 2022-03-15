class CreateRequestLocalContext {

  static handle(request, response, next) {

    request.locals = Object.create(null);
    request.local = request.locals;
    next();

  }

}


module.exports = CreateRequestLocalContext;
