const express = require("express");
const router = express.Router();


// Profile route
router.get('/', function renderProfilePage(req, res, next) {
  res.send('Profile page');
});


module.exports = router;
