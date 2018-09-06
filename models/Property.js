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
		category: String,
    type: String,
    phone: String,
    photo: String,
    gallery: Array,
    surburb : String,
    map: {
			lati: String,
			long: String,
			zoom: String
		},
    description: String,
    amenities: Array,
		approved: String,
});

module.exports = mongoose.model('Property', propertySchema);
