var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");

var Category = require(__dirname + '/../models/Category');
var Property = require(__dirname + '/../models/Property');
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

router.get('/add', function(req, res, next){
	res.render('property/new');
});

router.post('/add', cpUpload, function(req, res, next){
  var i = new Property();
	i.name = req.body.name;
  i.slug = slug(req.body.name);
	i.icon = req.body.icon;
	i.order = req.body.order;
  if (req.files['photo'] != null){
		i.photo = req.files['photo'][0].filename;
	}
	i.save(function(err){
		if(err){
      console.log(err);
      req.flash("error_msg", "Category Failed");
      res.render('property/add');
    }else{
      if (req.files['photo'] != null){
  				Jimp.read("./public/uploads/property/"+i.photo).then(function (cover) {
  				    return cover.resize(200, 150)     // resize
  				         .quality(100)              // set greyscale
  				         .write("./public/uploads/thumbs/properties/"+i.photo); // save
  				}).catch(function (err) {
  				    console.error(err);
  				});
  			}else{

  			}
      req.flash("success_msg", "Property Successfully Created");
  		res.redirect('/property');
    }
	});
});

module.exports = router;
