const express = require("express");
const rateLimit = require("express-rate-limit");
const datetools = require("date-fns");
const router = express.Router();

const RegisterController = require('../controllers/auth/Register.controller');


const ResendCodeRequestLimiter = rateLimit(
  {
    windowMs: datetools.minutesToMilliseconds(1),
    max: 2,
  }
);


const VerificationCodeRequestLimiter = rateLimit(
  {
    windowMs: datetools.secondsToMilliseconds(1),
    max: 1,  
  }
);


const RegisterSubmitRequestLimiter = rateLimit(
  {
    windowMs: datetools.secondsToMilliseconds(1),
    max: 1, 
  }
);


// Register page
router.get('/', (req, res, next) => res.render('register'));


// Register success congratulations page
router.get('/success', (req, res, next) => res.render('register-success'));


// Validate form part-by-part
router.post('/validate', RegisterController.validateForm);


// Request a verification code
router.post('/code', VerificationCodeRequestLimiter, RegisterController.sendCodeToEmail);


// Request resend verification code
router.post('/resend', ResendCodeRequestLimiter, RegisterController.resendVerificationCode);


// Submit register form, check verification code then save to database
router.post('/submit', RegisterSubmitRequestLimiter, RegisterController.createAccount);


module.exports = router;
