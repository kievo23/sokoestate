var express = require('express');
var router = express.Router();

var request = require('request');
var crypto = require("crypto");
var Property = require(__dirname + '/../models/Property');
var Category = require(__dirname + '/../models/Category');
var User = require(__dirname + '/../models/User');
const mongoose = require('mongoose');
var sys = require(__dirname + '/../config/System');
var db = mongoose.connect(sys.db_uri, {useMongoClient: true });

/* GET home page. */
router.get('/', function(req, res, next) {
  var categories = Category.find({}).sort({"order": 1});
  var properties = Property.find({approved: true}).populate('user_id').populate('category');
  var featured = Property.find({featured: true}).populate('user_id').populate('category');
  var recents = Property.find({approved: true}).populate('user_id').populate('category').sort({"_id": -1}).limit(8);
  Promise.all([properties, categories, featured, recents]).then(values => {
    //console.log(values[1]);
	  res.render('index', {title: "Soko Estate Kenya | Properties in kenya",
    categories: values[1],
    properties: values[0],
    featured: values[2],
    recents: values[3],
    description: "Find properties for sale and for rent in Kenya"
  });
	});
});

router.get('/terms-of-service', function(req, res, next) {
  res.render('site/terms', { title: 'Soko Estate: Terms and Conditions' });
});

router.get('/privacy-policy', function(req, res, next) {
  res.render('site/policy', { title: 'Soko Estate: Terms and Conditions' });
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
    d.instagram = req.body.instagram;
    d.twitter = req.body.twitter;
    d.facebook = req.body.facebook;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        if(req.body.company != ""){
          Business.create({
              email: req.body.email,
              slug: slug(req.body.company),
              phone: req.body.phone,
              name: req.body.company,
              role: 0,
          }, function (err, biz) {
            if(err) throw err
          });
        }

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
    d.instagram = req.body.instagram;
    d.twitter = req.body.twitter;
    d.facebook = req.body.facebook;
    d.save(function(err){
      if(err){
        req.flash('error','Some Error Occured, Kindly try again');
        res.redirect(ssn.returnUrl);
      }else{
        if(req.body.company != ""){
          Business.create({
              email: d.email,
              slug: slug(req.body.company),
              phone: req.body.phone,
              name: req.body.company,
              role: 0,
          }, function (err, biz) {
            if(err) throw err
          });
        }
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
  var categories = Category.find({}).sort({"order": 1});
  var properties = Property.find(obj).populate('user_id').populate('category');
  Promise.all([categories,properties]).then(values => {
    res.render('property/indexfront', { title: 'Soko Estate: Search',properties: values[1],categories: values[0] });
  });
});

router.get('/property/:slug',function(req, res){
  var categories = Category.find({}).sort({"order": 1});
  var property = Property.findOne({
    slug: req.params.slug
  })
  .populate('user_id')
  .populate('category');

  Promise.all([categories,property]).then(values => {
    //console.log(values[1].category);
    Property.find({
        $query: {
          category: values[1].category.id
        }
      })
      .limit(5).then(function(d){
        console.log(values[1]);
        res.render('property/detail',{
          property: values[1],
          title: values[1].name+ " property for "+values[1].type+" in kenya",
          categories: values[0],
          similars: d,
          description: values[1].description
        });
      });
  });
});

router.get('/favorites', function(req, res){
  var categories = Category.find({}).sort({"order": 1});
  var objects = {};
  var ids = res.locals.user.favorites;
  //res.locals.user.favorites.forEach(o => objects[o._id] = o);
  //var dupArray = ids.map(id => objects[id]);
  var properties = Property.find({_id: {$in: ids}});
  Promise.all([properties,categories]).then(values => {
    console.log(values[0]);
	  res.render('property/indexfront', {title: "Soko Estate", properties: values[0], categories: values[1]});
	});
});

router.get('/favorite/:id', function(req, res, next){
	User.findById(res.locals.user._id)
	.then(function(b){
    var message = "";
		if(b.favorites.includes(req.params.id)){
      //b.favorites.splice(req.params.id);
      b.favorites.splice(b.favorites.indexOf(req.params.id), 1)
      //console.log("exists");
      message = "Property removed from favorites";
    }else{
      b.favorites.push(req.params.id);
      //console.log("does not exist");
      message = "Property added from favorites";
    }
    console.log(b);
		b.save(function(err){
			if(err)
				res.json(message);
			res.json(message);
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.get('/loadwallet', function(req, res){
  res.render('wallet/input', {title: "Sokoestate: Load Wallet"});
});

router.post('/loadwallet', function(req, res){
  ssn = req.session;
  ssn.hashkey = "852sokompare963001";
  ssn.vendor_id = "sokompare";
  ssn.email = req.body.email;
  var amount = req.body.amount;
  var fields = {
    "live":"1",
    "oid": new Date().getTime(),
    "inv": "invoiceid"+new Date().getTime(),
    "ttl": amount,
    "tel": req.body.phone,
    "eml": req.body.email,
    "vid": ssn.vendor_id,
    "curr": "KES",
    "p1": "",
    "p2": "",
    "p3": "",
    "p4": "",
    "lbk": 'https://'+req.get('host')+'/cancel',
    "cbk": 'https://'+req.get('host')+'/receive',
    "cst": "1",
    "crl": "0"
  };
  var datastring =  fields['live']+fields['oid']+fields['inv']+
    fields['ttl']+fields['tel']+fields['eml']+fields['vid']+fields['curr']+fields['p1']+fields['p2']
    +fields['p3']+fields['p4']+fields['cbk']+fields['cst']+fields['crl'];
  var hash = crypto.createHmac('sha1',ssn.hashkey).update(datastring).digest('hex');
  res.render('wallet/ipay', {title: "Load Wallet",hash: hash, inputs: fields, datastring: datastring});
});

router.get('/receive', function(req, res){
  var val = "sokompare";
  var val1 = req.query.id;
  var val2 = req.query.ivm;
  var val3 = req.query.qwh;
  var val4 = req.query.afd;
  var val5 = req.query.poi;
  var val6 = req.query.uyt;
  var val7 = req.query.ifd;
  var bizId = req.query.p1;
  var array = req.query.p2;
  var status = req.query.status;
  var amount = req.query.mc;

  var ipnurl = "https://www.ipayafrica.com/ipn/?vendor="+val+"&id="+val1+"&ivm="+val2+"&qwh="+val3+"&afd="+val4+"&poi="+val5+"&uyt="+val6+"&ifd="+val7;
  //console.log(ipnurl);
  User.findById(res.locals.user._id)
  .then(function(b){
    if(b.wallet){
      b.wallet = parseInt(b.wallet) +  parseInt(amount);
    }else{
      b.wallet = amount;
    }

    //if(amount == "2320"){

    request(ipnurl, function (error, response, body) {
      //console.log(body); // Print the HTML for the Google homepage.
      //res.send("Status > " + status + ", Body > " +body);
      //res.end();
      if(body == status){
        b.save(function(err){
          if(err){
            req.flash('error_msg', 'Error Occured When Updating Account');
            res.redirect('/admin');
          }else{
            req.flash('success_msg', 'Transaction Made Successfully');
            res.redirect('/admin');
          }
        });
      }else{
        req.flash('error', 'Transaction Already Authenticated!');
        res.redirect('/');
      }
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

module.exports = router;
