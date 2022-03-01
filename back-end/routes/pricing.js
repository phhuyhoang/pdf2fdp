const express = require("express");
const router = express.Router();


const data = Object.create(null);

data.card = require('../constants/data/views/pricing-cards.constants.json');
data.icon = require('../constants/data/views/pricing-card-fa.constants.json');
data.alias = require('../constants/data/views/pricing-card-li.constants.json');
data.expl = require('../constants/data/views/pricing-cards-expl.constants.json');


// Pricing route
router.get('/', (req, res, next) => res.render('pricing', data));


module.exports = router;
