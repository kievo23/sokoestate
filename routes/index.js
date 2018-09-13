var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('site/login', { title: 'Soko Estate: Login' });
});

router.get('/register', function(req, res, next) {
  res.render('site/register', { title: 'Soko Estate: Register' });
});

module.exports = router;
