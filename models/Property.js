const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
var sys = require(__dirname + '/../config/System');

var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const propertySchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }},
		slug: {
			type: String,
			unique: true
		},
		category: { type: Schema.Types.ObjectId, ref: 'Category' },
		subcategory: String,
    type: String,
    phone: String,
		phonetwo: String,
		phones: Array,
		email: String,
		city: String,
    photo: String,
    gallery: Array,
		county: String,
		bedrooms: Number,
		bathrooms: Number,
		ownership: String,
		price: String,
		enquiry: Boolean,
		serviced: Boolean,
		furnished: Boolean,
		baths: String,
		size: Number,
		units: String,
		tagline: String,
    surburb : String,
    map: {
			lati: String,
			long: String,
			zoom: String
		},
    description: String,
    amenities: Array,
		approved: Boolean,
		date: Date,
		youtube: String,
		featured: Boolean,
		date: Date,
		user_id:  { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Property', propertySchema);
