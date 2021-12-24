const express = require("express");
const router = express.Router();


// Pricing route
router.get('/', function renderPricingPage(req, res, next) {
  res.send('Pricing');
});


module.exports = router;
