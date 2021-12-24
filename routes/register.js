const express = require("express");
const router = express.Router();


// Register route
router.get('/', function renderRegisterPage(req, res, next) {
  res.send('Register');
});


module.exports = router;
