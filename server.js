const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./back-end/configs/');
const ExpressHelpers = require('./back-end/helpers/Express.helper');
const HandlebarHelpers = require('handlebars-helpers')({ handlebars: hbs });


const port = process.env.PORT || 8080;
const server = express();


// --------------------------------------------------------------------
//  Configuration
// --------------------------------------------------------------------
server.locals.hbs = hbs


// --------------------------- Public ---------------------------
server.use(express.static('./front-end/public'));


// --------------------------- Views ---------------------------

server.engine('hbs', hbs.__express);
server.set('views', config.env.parsed.ENTRY_VIEWS);
server.set('view engine', 'hbs');
ExpressHelpers.autoloadViews(server, config.env.parsed.ENTRY_VIEWS, [ 'partials' ])


// --------------------------- Middlewares ---------------------------
server.use(bodyParser.urlencoded({ extended: true }));
ExpressHelpers.autoloadMiddlewares(server, config.env.parsed.ENTRY_MIDDLEWARES);


// --------------------------- Routes ---------------------------
ExpressHelpers.autoloadRoutes(server, config.env.parsed.ENTRY_ROUTES);



const listener = server.listen(port, function onStartListen() {
  console.log("Listening on port %d", listener.address().port);
});

module.exports = server;
