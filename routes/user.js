var express = require('express');
var router = express.Router();

var Users = require(__dirname + '/../models/User');
var role = require(__dirname + '/../config/Role');

/* GET users listing. */
router.get('/', role.admin, function(req, res, next) {
  Users.find({})
  .then(function(data){
    res.render('users/index', {title: "Soko Estate Users", users: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/makeadmin/:id', role.admin, function(req, res){
	Users.findById(req.params.id)
	.then(function(data){
	  	console.log(data);
	  	if(data.role == "1"){
	  		data.role = "0";
	  	}else{
	  		data.role = "1";
	  	}
	  	data.save(function(err){
	  		if(err){
	  			req.flash('error',err);
	  			res.redirect('/users');
	  		}else{
	  			res.redirect('/users');
	  		}
	  	});
	})
	.catch(function(err){
	    console.log(err);
	});
});

module.exports = router;
