var express = require('express');
var router = express.Router();

var request = require('request');
var crypto = require("crypto");
var Property = require(__dirname + '/../models/Property');
var Category = require(__dirname + '/../models/Category');
var User = require(__dirname + '/../models/User');
var role = require(__dirname + '/../config/Role');

/* GET home page. */
router.get('/',role.auth, function(req, res, next) {
  if(req.user.role == 1){
    var properties = Property.count({});
  }else{
    var properties = Property.count({user_id : req.user._id});
  }

  Promise.all([properties]).then(values => {
    console.log(values[0]);
    res.render('admin/index', { title: 'Soko Estate: Admin',propertycount: values[0] });
	});
});

module.exports = router;
