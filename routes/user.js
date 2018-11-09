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

router.get('/delete/:id',role.admin, function(req, res, next){
		Users.findOneAndRemove({
		  _id: req.params.id
		})
		.then(function(data){
		    res.redirect('/users');
		})
		.catch(function(err){
		     console.log(err);
		});
});


router.get('/changepassword', role.auth, function(req, res){
	res.render('users/changepassword');
});

router.post('/changepassword', role.auth, function(req, res){
	Users.findById(res.locals.user.id)
	.then(function(data){
  		console.log(data);
  		if(!bcrypt.compareSync(req.body.oldpassword, data.password)){
  			console.log("wrong password");
  			req.flash("error_msg","Wrong Current Password");
  			res.render("user/changepassword");
  		}else {
  			if(req.body.newpassword == req.body.confirmpassword){
  				var salt = bcrypt.genSaltSync(10);
      			var hash = bcrypt.hashSync(req.body.newpassword, salt);
      			data.password = hash;
      			console.log("new password match");
      			data.save(function(err){
      				if(err){
      					console.log("saving error");
      					req.flash("error_msg","Error Occured");
  						res.render("user/changepassword");
      				}else{
      					console.log("new password saved");
      					req.flash("success_msg","Password Successfully Changed");
  						res.redirect("/");
      				}

      			});
  			}else{
  				console.log("new password dont match");
  				req.flash("error_msg","Password Mismatch");
  				res.render("user/changepassword");
  			}
  		}
	})
	.catch(function(err){
	    console.log(err);
	});
});

router.get('/profile', function(req, res){
  res.render('users/profile', {title: "Profile"});
});

router.get('/editprofile', function(req, res){
  res.render('users/editprofile', {title: "Profile"});
});

router.post('/editprofile', function(req, res){
  User.findById(res.locals.user._id)
  .then(function(b){
    b.names = req.body.names;
    b.phone = req.body.phone;
    b.save(function(err){
      if(err){
        res.redirect('/editprofile');
      }else{
        req.flash('success_msg','Profile Updated');
        res.redirect('/dashboard');
      }
    });
  });
});

module.exports = router;
