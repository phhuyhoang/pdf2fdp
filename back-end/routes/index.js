const express = require('express');
const router = express.Router();

const UserController = require('../controllers/User.controller');


/**
 * Render homepage
 */
router.get('/', (req, res, next) => res.render('index'));

/**
 * Convert endpoint
 */
router.post('/convert', UserController.doSingleFileConvert)


module.exports = router;
