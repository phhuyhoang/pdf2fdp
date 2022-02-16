const express = require("express");
const router = express.Router();


// Admin route
router.get('/', function renderAdminRoute(req, res, next) {
  res.send('Admin page');
});


module.exports = router;
