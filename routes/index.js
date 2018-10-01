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
  var obj = {};
  if(req.query.hasOwnProperty('type')){
    if(req.query.type.length > 0){
      obj.type = req.query.type;
    }
  }
  if(req.query.hasOwnProperty('category')){
    if(req.query.category.length > 0){
      obj.category = req.query.category;
    }
  }
  if(req.query.hasOwnProperty('subcategory')){
    if(req.query.subcategory.length > 0){
      obj.subcategory = req.query.subcategory;
    }
  }
  if(req.query.hasOwnProperty('minprice')){
    if(req.query.minprice.length > 0){
      obj.price = { $lt: req.query.minprice };
    }
  }
  if(req.query.hasOwnProperty('size')){
    if(req.query.size.length > 0){
      obj.size = req.query.size;
    }
  }
  if(req.query.hasOwnProperty('bedrooms')){
    if(req.query.bedrooms.length > 0){
      obj.bedrooms = req.query.bedrooms;
    }
  }
  if(req.query.hasOwnProperty('bathrooms')){
    if(req.query.bathrooms.length > 0){
      obj.bathrooms = req.query.bathrooms;
    }
  }
  console.log(obj);
  Property.find(obj).then(function(d){
    res.render('property/indexfront', { title: 'Soko Estate: Register',properties: d });
  })

});

router.get('/property/:slug',function(req, res){
  var categories = Category.find({});
  var property = Property.findOne({
    slug: req.params.slug
  });
  Promise.all([categories,property]).then(values => {
    console.log(values[1]);
    res.render('property/detail',{property: values[1], title: values[1].name, categories: values[0]});
  });
});

module.exports = router;
