const express = require("express");
const router = express.Router();


// Login route
router.get('/', function renderLoginPage(req, res, next) {
  res.send('Hello world!');
});


module.exports = router;
