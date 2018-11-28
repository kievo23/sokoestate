var express = require('express');
var router = express.Router();

var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");
var slug = require('slug');

var Users = require(__dirname + '/../models/User');
var role = require(__dirname + '/../config/Role');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/users/')
  },
  filename: function (req, file, cb) {
    var fileName = Date.now() + slug(file.originalname) +'.'+ mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 30 }])



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

router.post('/editprofile', cpUpload, function(req, res){
  Users.findById(res.locals.user._id)
  .then(function(b){
    b.names = req.body.names;
    b.phone = req.body.phone;
    b.instagram = req.body.instagram;
    b.twitter = req.body.twitter;
    b.phones  = req.body.phones;
    b.facebook = req.body.facebook;
    b.organization = req.body.organization;
    if (req.files['photo'] != null){
  		b.photouser = req.files['photo'][0].filename;
  	}
    b.save(function(err){
      if(err){
        res.redirect('/editprofile');
      }else{
        if (req.files['photo'] != null){
  				Jimp.read("./public/uploads/users/"+b.photouser).then(function (cover) {
				    return cover.resize(150, 100)     // resize
			         .quality(100)              // set greyscale
			         .write("./public/uploads/thumbs/users/"+b.photouser); // save
  				}).catch(function (err) {
  				    console.error(err);
  				});
  			}
        req.flash('success_msg','Profile Updated');
        res.redirect('/users/profile');
      }
    });
  });
});

module.exports = router;
