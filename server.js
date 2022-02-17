const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');

const config = require('./back-end/configs/');
const env = config.env;
const HandlebarHelpers = require('handlebars-helpers')({
  handlebars: hbs
})

const ExpressHelper = require('./back-end/helpers/server/express');

const port = process.env.PORT || 8080;
const server = express();

// --------------------------------------------------------------------
//  Configuration
// --------------------------------------------------------------------
server.locals.hbs = hbs

// Public
server.use(express.static('./front-end/public'));
// Views
server.engine('hbs', hbs.__express);
server.set('views', env.parsed.ENTRY_VIEWS);
server.set('view engine', 'hbs');


ExpressHelper.autoloadViews(server, env.parsed.ENTRY_VIEWS, [ 'partials' ])
// Routes
ExpressHelper.autoloadRoutes(server, config.env.parsed.ENTRY_ROUTES);
// Middlewares
server.use(bodyParser.urlencoded({ extended: true }));


const listener = server.listen(port, function onStartListen() {
  console.log("Listening on port %d", listener.address().port);
});

module.exports = server;
