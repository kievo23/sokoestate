var express = require('express');
var router = express.Router();

var slug = require('slug');
var multer  = require('multer');
var mime = require('mime');
var moment = require('moment');
var Jimp = require("jimp");
var Category = require(__dirname + '/../models/Category');
var Property = require(__dirname + '/../models/Property');
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
router.get('/', function(req, res, next) {
  var categories = Category.find({}).sort({"order": 1});

  var featured = Property.find({featured: 1}).populate('user_id').populate('category');
  var amenities = Amenity.find({});
  var sort = {};
  if(req.query.hasOwnProperty('price')){
      sort.price = parseInt(req.query.price);
  }
  if(req.query.hasOwnProperty('date')){
      sort.date = parseInt(req.query.date);
  }
  console.log(sort);
  var properties = Property.find({approved : true}).sort(sort)
  .populate('user_id')
  .populate('category');
  Promise.all([properties, categories, featured, amenities]).then(values => {
    res.render('property/indexfront', {
      title: "Soko Estate: Properties",
      properties: values[0],
      categories: values[1],
      featured: values[2],
      amenities: values[3]
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
  //if(parseInt(res.locals.user.wallet) >= 1500 ){
    var amenities = Amenity.find({});
    var categories = Category.find({});
    Promise.all([categories, amenities]).then(values => {
  	    console.log(JSON.stringify(values[0].gallery));
  	    res.render('property/new', {
  	        title: "Add new property",
  	        categories: values[0],
            amenities: values[1]
  	    });
  	  });
    /*
  }else{
    req.flash("error_msg", "Kindly load 1500 or more to your wallet to post a property");
    res.redirect('/loadwallet');
  }*/
});

router.get('/edit/:id', role.auth, function(req, res, next){
  var property = Property.findOne({
	  _id: req.params.id
	}).populate('category');
	var categories = Category.find({});
  var amenities = Amenity.find({});

	Promise.all([property, categories, amenities]).then(values => {
	    //console.log(JSON.stringify(values[0].gallery));
      var amenities = Amenity.find({
        //  '_id': { $in: values[0].amenities}
      }).then(function(d){
        console.log(d);
  	    res.render('property/edit', {
  	        title: "Edit "+values[0].name,
  	        property: values[0],
            gallery: JSON.stringify(values[0].gallery),
  	        categories: values[1],
            //currentamenities: d,
            currentamenities: [],
            amenities: values[2]
  	    });
      });
	  });
});

router.get('/compare/add/:id', function(req, res, next){
  function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
  }
  if(req.session.compare){
    req.session.compare.push(req.params.id);
    req.session.compare = req.session.compare.filter( onlyUnique );
  }else{
    let compare = [];
    compare.push(req.params.id);
    req.session.compare = compare;
  }
  console.log(req.session.compare);
  res.json(req.session.compare.length);
});

router.get('/compare/clear', function(req, res, next){
  delete req.session.compare;
  res.redirect('/');
});

router.get('/compare/', function(req, res, next){
  Property.find({
    '_id': { $in: req.session.compare}
  }).then(function(d){
    console.log(d);
    res.render('property/compare',{properties: d,title: "Compare Properties" });
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
  i.phonetwo = req.body.phonetwo;
  i.phones = req.body.phones;
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
  i.youtube = req.body.youtube;
  i.city = req.body.city;
  i.ownership = req.body.ownership;
  i.subcategory = req.body.subcategory;
  i.approved = true;
  i.user_id = res.locals.user._id;
  i.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
	i.date = new Date();
  if(req.body.furnished){
    i.furnished = req.body.furnished;
  }
  if(req.body.serviced){
    i.serviced = req.body.serviced;
  }
  if(req.body.enquiry){
    i.enquiry = req.body.enquiry;
  }
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
    i.phonetwo = req.body.phonetwo;
    i.phones = req.body.phones;
  	i.type = req.body.type;
    i.category = req.body.category;
    i.surburb = req.body.surburb;
    i.county = req.body.county;
    i.price = req.body.propertyprice;
    i.description = req.body.description;
    i.amenities = req.body.amenities;
    i.size = req.body.size;
    i.email = req.body.email;
    i.city = req.body.city;
    i.category = req.body.category;
    i.subcategory = req.body.subcategory;
    i.ownership = req.body.ownership;
    i.tagline = req.body.tagline;
    i.units = req.body.units;
    i.youtube = req.body.youtube;
    i.street = req.body.street;
    i.youtube = req.body.youtube.replace("watch?v=", "embed/");
    i.map = {lati: req.body.lati, long: req.body.long, zoom: req.body.zoom };
  	i.date = new Date();
    if(req.body.enquiry){
      i.enquiry = req.body.enquiry;
    }
    if(req.body.furnished){
      i.furnished = req.body.furnished;
    }
    if(req.body.serviced){
      i.serviced = req.body.serviced;
    }
    //if(req.body.bedrooms){
      i.bedrooms = req.body.bedrooms;
    //}
    //if(req.body.baths){
      i.bathrooms = req.body.baths;
    //}
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

router.get('/approved/:id',role.admin, function(req, res, next){
	Property.findById(req.params.id)
	.then(function(b){
		if(b.approved == 1){
			b.approved = 0;
		}else{
			b.approved = 1;
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
