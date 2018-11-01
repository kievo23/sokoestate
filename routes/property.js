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
  var categories = Category.find({});
  var properties = Property.find({})
  .populate('user_id')
  .populate('category');
  var featured = Property.find({featured: 1}).populate('user_id').populate('category');
  Promise.all([properties, categories, featured]).then(values => {
    res.render('property/indexfront', {
      title: "Soko Estate: Properties",
      properties: values[0],
      categories: values[1],
      featured: values[2]
    });
  });
});

/* GET property backend. */
router.get('/list', role.auth, function(req, res, next) {
  var categories = Category.find({});
  if(req.user.role == 1){
    var properties = Property.find({})
    .populate('user_id')
    .populate('category');
  }else{
    var properties = Property.find({user_id : req.user._id})
    .populate('user_id')
    .populate('category');
  }
  Promise.all([properties, categories]).then(values => {
    res.render('property/index', {title: "Soko Estate: Properties", properties: values[0], categories: values[1]});
  });
});



router.get('/add', role.auth, function(req, res, next){
  if(parseInt(res.locals.user.wallet) >= 1500 ){
    Category.find({})
    .then(function(data){
    	res.render('property/new', {title: "Find It Categories", categories: data});
    })
    .catch(function(err){
       console.log(err);
    });
  }else{
    req.flash("error_msg", "Kindly load 1500 or more to your wallet to post a property");
    res.redirect('/loadwallet');
  }
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
	i.phone = req.body.phone;
	i.type = req.body.type;
  i.category = req.body.category;
  i.surburb = req.body.surburb;
  i.price = req.body.propertyprice;
  i.description = req.body.description;
  i.amenities = req.body.amenities;
  i.size = req.body.size;
  i.email = req.body.email;
  i.county = req.body.county;
  i.youtube = req.body.youtube.replace("watch?v=", "embed/");
  i.category = req.body.category;
  i.tagline = req.body.tagline;
  i.street = req.body.street;
  i.units = req.body.units;
  i.agent = req.body.ownership;
  i.subcategory = req.body.subcategory;
  i.user_id = res.locals.user._id;
  i.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
	i.date = new Date();
  if(req.body.bedrooms){
    i.bedrooms = req.body.bedrooms;
  }
  if(req.body.bathrooms){
    i.bathrooms = req.body.bathrooms;
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
    //console.log(i);
  	i.name = req.body.propertyname;
    i.slug = slug(req.body.propertyname);
  	i.phone = req.body.phone;
  	i.type = req.body.type;
    i.category = req.body.category;
    i.surburb = req.body.surburb;
    i.county = req.body.county;
    i.price = req.body.propertyprice;
    i.description = req.body.description;
    i.amenities = req.body.amenities;
    i.size = req.body.size;
    i.email = req.body.email;
    i.category = req.body.category;
    i.subcategory = req.body.subcategory;
    i.agent = req.body.ownership;
    i.tagline = req.body.tagline;
    i.units = req.body.units;
    i.street = req.body.street;
    i.youtube = req.body.youtube.replace("watch?v=", "embed/");
    i.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
  	i.date = new Date();
    if(req.body.bedrooms){
      i.bedrooms = req.body.bedrooms;
    }
    if(req.body.bathrooms){
      i.bathrooms = req.body.bathrooms;
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
    		res.redirect('/property');
      }
  	});
  });
});

router.get('/featured/:id',role.admin, function(req, res, next){
	Property.findById(req.params.id)
	.then(function(b){
		if(b.featured == 1){
			b.featured = 0;
		}else{
			b.featured = 1;
		}
		b.save(function(err){
			if(err)
				res.redirect('/property/list');
			res.redirect('/property/list');
		});
	})
	.catch(function(err){
	     console.log(err);
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
