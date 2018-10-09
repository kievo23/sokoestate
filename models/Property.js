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
		email: String,
    photo: String,
    gallery: Array,
		county: String,
		bedrooms: Number,
		bathrooms: Number,
		ownership: String,
		price: String,
		baths: String,
		size: Number,
		tagline: String,
    surburb : String,
    map: {
			lati: String,
			long: String,
			zoom: String
		},
    description: String,
    amenities: Array,
		approved: String,
		date: Date,
		youtube: String,
		featured: Boolean,
		user_id:  { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Property', propertySchema);
