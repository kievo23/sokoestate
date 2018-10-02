var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");

var Category = require(__dirname + '/../models/Category');
var Property = require(__dirname + '/../models/Property');
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
router.get('/', function(req, res, next) {
  Property.find({})
  .populate('user_id')
  .then(function(data){
  	console.log(data);
    res.render('property/indexfront', {title: "Soko Estate Categories", properties: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

/* GET property backend. */
router.get('/list', function(req, res, next) {
  Property.find({})
  .populate('user_id')
  .then(function(data){
  	console.log(data);
    res.render('property/index', {title: "Soko Estate Categories", properties: data});
  })
  .catch(function(err){
     console.log(err);
  });
});



router.get('/add', role.auth, function(req, res, next){
  Category.find({})
  .then(function(data){
  	res.render('property/new', {title: "Find It Categories", categories: data});
  })
  .catch(function(err){
     console.log(err);
  });
});

router.get('/edit/:id', role.auth, function(req, res, next){
  var property = Property.findOne({
	  _id: req.params.id
	});
	var categories = Category.find({});

	Promise.all([property, categories]).then(values => {
	    console.log(JSON.stringify(values[0].gallery));
	    res.render('property/edit', {
	        title: "Edit "+values[0].name,
	        property: values[0],
          gallery: JSON.stringify(values[0].gallery),
	        categories: values[1]
	    });
	  });
});

router.get('/fetchcategory/:name', function(req, res, next){
	//console.log(req.params.name);
	Category.findById(req.params.name)
	.then(function(data){
		//console.log(data.subcategories);
	    res.json(data.subcategories);
	})
	.catch(function(err){
	     console.log(err);
	});
});

router.post('/add', role.auth, cpUpload, function(req, res, next){
  var i = new Property();
  //console.log(req.body);
	i.name = req.body.propertyname;
  i.slug = slug(req.body.propertyname);
	i.phone = req.body.propertyprice;
	i.type = req.body.type;
  i.category = req.body.category;
  i.surburb = req.body.surburb;
  i.price = req.body.propertyprice;
  i.description = req.body.description;
  i.amenities = req.body.amenities;
  i.size = req.body.size;
  i.email = req.body.email;
  i.category = req.body.category;
  i.subcategory = req.body.subcategory;
  i.user_id = res.locals.user.username;
	i.date = new Date();
  if(req.body.bedrooms){
    i.bedrooms = req.body.bedrooms;
  }
  if(req.body.baths){
    i.baths = req.body.baths;
  }
  if(req.body.size){
    i.size = req.body.size;
  }
  if(req.files['gallery'] != null){
    i.gallery = req.files['gallery'];
  }
  if (req.files['photo'] != null){
		i.photo = req.files['photo'][0].filename;
	}
  i.date = new Date();
	i.save(function(err){
		if(err){
      console.log(err);
      req.flash("error_msg", "Category Failed");
      res.redirect('/property/list');
    }else{
      if (req.files['photo'] != null){
  				Jimp.read("./public/uploads/property/"+i.photo).then(function (cover) {
  				    return cover.resize(200, 150)     // resize
  				         .quality(100)              // set greyscale
  				         .write("./public/uploads/thumbs/properties/"+i.photo); // save
  				}).catch(function (err) {
  				    console.error(err);
  				});
  			}
        if(i.gallery){
						i.gallery.forEach(function(gallery) {
						  	Jimp.read("./public/uploads/property/"+gallery.filename).then(function (cover) {
							    return cover.resize(200, 140)     // resize
							         .quality(100)                 // set JPEG quality
							         .greyscale()                 // set greyscale
							         .write("./public/uploads/thumbs/properties/gallery-"+gallery.filename); // save
							}).catch(function (err) {
							    console.error(err);
							});
						});
					}
      req.flash("success_msg", "Property Successfully Created");
  		res.redirect('/property/list');
    }
	});
});

router.post('/edit/:id', role.auth, cpUpload, function(req, res, next) {
	Property.findById(req.params.id)
	.then(function(i){
    //console.log(req.body);
  	i.name = req.body.propertyname;
    i.slug = slug(req.body.propertyname);
  	i.phone = req.body.propertyprice;
  	i.type = req.body.type;
    i.category = req.body.category;
    i.surburb = req.body.surburb;
    i.price = req.body.propertyprice;
    i.description = req.body.description;
    i.amenities = req.body.amenities;
    i.size = req.body.size;
    i.email = req.body.email;
    i.category = req.body.category;
    i.subcategory = req.body.subcategory;
    i.user_id = res.locals.user.username;
  	i.date = new Date();
    if(req.body.bedrooms){
      i.bedrooms = req.body.bedrooms;
    }
    if(req.body.baths){
      i.baths = req.body.baths;
    }
    if(req.body.size){
      i.size = req.body.size;
    }
    if(req.files['gallery'] != null){
      i.gallery = req.files['gallery'];
    }
    if (req.files['photo'] != null){
  		i.photo = req.files['photo'][0].filename;
  	}
    i.date = new Date();
  	i.save(function(err){
  		if(err){
        console.log(err);
        req.flash("error_msg", "Category Failed");
        res.redirect('/property/add');
      }else{
        if (req.files['photo'] != null){
    				Jimp.read("./public/uploads/property/"+i.photo).then(function (cover) {
    				    return cover.resize(200, 150)     // resize
    				         .quality(100)              // set greyscale
    				         .write("./public/uploads/thumbs/properties/"+i.photo); // save
    				}).catch(function (err) {
    				    console.error(err);
    				});
    			}
          if(i.gallery){
  						i.gallery.forEach(function(gallery) {
  						  	Jimp.read("./public/uploads/property/"+gallery.filename).then(function (cover) {
  							    return cover.resize(200, 140)     // resize
  							         .quality(100)                 // set JPEG quality
  							         .greyscale()                 // set greyscale
  							         .write("./public/uploads/thumbs/properties/gallery-"+gallery.filename); // save
  							}).catch(function (err) {
  							    console.error(err);
  							});
  						});
  					}
        req.flash("success_msg", "Property Successfully Created");
    		res.redirect('/property');
      }
  	});
  });
});

router.get('/delete/:id',role.auth, function(req, res, next){
		Property.findOneAndRemove({
		  _id: req.params.id
		})
		.then(function(data){
		    res.redirect('/admin');
		})
		.catch(function(err){
		     console.log(err);
		});
});



module.exports = router;
