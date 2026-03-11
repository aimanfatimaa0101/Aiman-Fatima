var express = require('express');
var router = express.Router();

/* GET signup page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Signup Page' });
});

/* POST signup form */
router.post('/signup', function(req, res) {

  const { name, email, password } = req.body;

  res.send(`User Registered: ${name} - ${email}`);
});

module.exports = router;