const express = require("express");
const router = express.Router();


// Homepage
router.get('/', function renderHomepage(req, res, next) {
  res.send('Homepage');
});


module.exports = router;
