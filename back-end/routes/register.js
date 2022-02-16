const express = require("express");
const router = express.Router();
const RegistrationValidator = require('../controllers/register/RegistrationValidator');


const pending = [
  'abc'
];


// Register route
router.get('/', (req, res, next) => res.render('register'));


// Check registered info
router.post('/check', express.json(), async (req, res, next) => {
  // console.log('Got request: ')
  // console.log(req.body);
  // res.json(req.body);
  const body = req.body;
  console.log(await RegistrationValidator.validateUser(body.username));
})

// Cái này sau này sẽ không lưu ở đây, mà sẽ được lưu ở route /email/verify
router.get('/verify/:token', (req, res, next) => {
  const token = req.params.token;
  if (pending.includes(token)) {
    res.send('Verified');
  }
  else {
    res.send('Your verification link has expired or not exists')
  }
})


module.exports = router;
