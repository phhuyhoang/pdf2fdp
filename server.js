const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');

const config = require('./config');
const ExpressHelper = require('./helpers/server/express');

const server = express();


// --------------------------------------------------------------------
//  Configuration
// --------------------------------------------------------------------
server.use(express.static('public'));

ExpressHelper.autoloadRoutes(server, config.env.parsed.ENTRY_ROUTES);



const listener = server.listen(8080, function onStartListen() {
  console.log("Listening on port %d", listener.address().port);
});

module.exports = server;
