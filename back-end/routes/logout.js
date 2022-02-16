const express = require("express");
const router = express.Router();


// Profile route
router.get('/', function logoutUser(req, res, next) {
  res.send('Logout');
});


module.exports = router;
