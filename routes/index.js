var express = require('express');
var router = express.Router();
var Property = require(__dirname + '/../models/Property');
var Category = require(__dirname + '/../models/Category');
var User = require(__dirname + '/../models/User');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  Category.find({})
  .then(function(data){
  	//console.log(data);
    res.render('index', {title: "Soko Estate", categories: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/terms_conditions', function(req, res, next) {
  res.render('site/terms', { title: 'Soko Estate: Terms and Conditions' });
});

router.get('/login', function(req, res, next) {
  res.render('site/login', { title: 'Soko Estate: Login' });
});

router.get('/register', function(req, res, next) {
  res.render('site/register', { title: 'Soko Estate: Register' });
});

router.get('/facebook',function(req,res){
    res.render('socials/facebook', {title: "Find It: Complete Facebook Sign Up"});
});

router.post('/facebook', function(req, res){
  User.findById(req.user._id)
  .then(function(d){
    d.email = req.body.email;
    d.phone = req.body.phone;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        req.flash('success_msg','SignUp completed Successfully');
        res.redirect('/');
      }
    });
  });
});

router.get('/google',function(req,res){
    res.render('socials/google', {title: "Find It: Complete Google Sign Up"});
});

router.post('/google', function(req, res){
  User.findById(req.user._id)
  .then(function(d){
    d.phone = req.body.phone;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        req.flash('success_msg','SignUp completed Successfully');
        res.redirect('/');
      }
    });
  });
});


router.get('/search', function(req, res, next) {
  Property.find({
    type: req.query.type,
    category: req.query.category
  }).then(function(d){
    console.log(d);
    res.render('property/indexfront', { title: 'Soko Estate: Register',properties: d });
  })

});

module.exports = router;
