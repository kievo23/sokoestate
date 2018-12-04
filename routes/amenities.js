var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");

var Category = require(__dirname + '/../models/Category');
var Amenity = require(__dirname + '/../models/Amenities');
var role = require(__dirname + '/../config/Role');
//var Subcategory = require(__dirname + '/../models/Subcategory');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    var fileName = Date.now() + slug(file.originalname) +'.'+ mime.extension(file.mimetype);
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage });
var cpUpload = upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'catalog', maxCount: 5 }, { name: 'gallery', maxCount: 30 }])


/* GET home page. */
router.get('/', role.admin, function(req, res, next) {
  Amenity.find({})
  .then(function(data){
  	console.log(data);
    res.render('amenities/index', {title: "Soko Estate Amenities", amenities: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/edit/:id', role.admin, function(req, res, next){
	var amenity = Amenity.findOne({
	  _id: req.params.id
	});
	Promise.all([amenity]).then(values => {
	    res.render('amenities/editamenity', {
	        title: "Edit "+values[0].name,
	        amenity: values[0],
          categoryjson: JSON.stringify(values[0]),
	    });
	  });
});

router.get('/showhome/:id', function(req, res, next){
	Category.findById(req.params.id)
	.then(function(b){
		if(b.approved == "true"){
			b.approved = "false";
		}else{
			b.approved = "true";
		}

		b.save(function(err){
			if(err)
				res.redirect('/amenities');
			res.redirect('/amenities');
		});
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.post('/update/:id', role.admin, cpUpload, function(req, res, next){
	var category = Amenity.findOne({
	  _id: req.params.id
	}).then(function(data){
		data.name = req.body.name;
    data.slug = slug(req.body.name);
		data.icon = req.body.icon;
    if (req.files['photo'] != null){
  		data.photo = req.files['photo'][0].filename;
  	}
		data.save(function(err){
			if(err){
        req.flash("error", err);
				res.redirect('/amenities');
      }
      if (req.files['photo'] != null){
  				Jimp.read("./public/uploads/amenities/"+data.photo).then(function (cover) {
  				    return cover.resize(200, 150)     // resize
  				         .quality(100)              // set greyscale
  				         .write("./public/uploads/thumbs/amenities/"+data.photo); // save
  				}).catch(function (err) {
  				    console.error(err);
  				});
  			}else{

  			}
        req.flash("success_msg", "Amenity Successfully Edited");
			res.redirect('/amenities');
		});
	});

});


router.get('/add', role.admin, function(req, res, next){
	res.render('amenities/addamenity');
});

router.get('/delete/:id', role.admin, function(req, res, next){
	Amenity.deleteOne({
		_id: req.params.id
	})
	  .then(function(data){
	    res.redirect('/amenities');
	  })
	  .catch(function(err){
	     console.log(err);
	  });
});

router.post('/add', role.admin, cpUpload, function(req, res, next){
  var i = new Amenity();
	i.name = req.body.name;
  i.icon = req.body.icon;
  i.slug = slug(req.body.name);
  if (req.files['photo'] != null){
		i.photo = req.files['photo'][0].filename;
	}
	i.save(function(err){
		if(err){
      console.log(err);
      req.flash("error_msg", "Amenity Failed");
      res.render('amenities/addamenity');
    }else{
      if (req.files['photo'] != null){
  				Jimp.read("./public/uploads/amenities/"+i.photo).then(function (cover) {
  				    return cover.resize(200, 150)     // resize
  				         .quality(100)              // set greyscale
  				         .write("./public/uploads/thumbs/amenities/"+i.photo); // save
  				}).catch(function (err) {
  				    console.error(err);
  				});
  			}else{

  			}
      req.flash("success_msg", "Amenity Successfully Created");
  		res.redirect('/amenities');
    }
	});
});

module.exports = router;
