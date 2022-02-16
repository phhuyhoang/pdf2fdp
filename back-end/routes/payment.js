const express = require("express");
const router = express.Router();


// Payment route
router.get('/', function renderProfilePage(req, res, next) {
  res.send('Payment');
});


module.exports = router;
