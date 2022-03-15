class MakeRequestObjectAccessible {

  static handle(request, response, next) {

    response.locals._request = request;
    response.locals._response = response;
    next();
    
  }

}


module.exports = MakeRequestObjectAccessible
