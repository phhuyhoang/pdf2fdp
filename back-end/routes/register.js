const express = require("express");
const router = express.Router();

const RegisterController = require('../controllers/auth/Register.controller');


// Register route
router.get('/', (req, res, next) => res.render('register'));


// Validate form part-by-part
router.post('/validate', RegisterController.validateForm);


// Request a verification code
router.post('/code', RegisterController.sendCodeToEmail);


// Request resend verification code
router.post('/resend', RegisterController.resendVerificationCode);


// Submit register form, verification code then save to database
router.post('/submit', RegisterController.createAccount);


module.exports = router;
