var express = require('express');
var router = express.Router();
var Property = require(__dirname + '/../models/Property');
var Category = require(__dirname + '/../models/Category');

/* GET home page. */
router.get('/', function(req, res, next) {
  Category.find({})
  .then(function(data){
  	//console.log(data);
    res.render('index', {title: "Soko Estate", categories: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/login', function(req, res, next) {
  res.render('site/login', { title: 'Soko Estate: Login' });
});

router.get('/register', function(req, res, next) {
  res.render('site/register', { title: 'Soko Estate: Register' });
});

router.get('/search', function(req, res, next) {
  Property.find({
    type: req.query.type,
    category: req.query.category
  }).then(function(d){

  })
  res.render('property/indexfront', { title: 'Soko Estate: Register' });
});

module.exports = router;
