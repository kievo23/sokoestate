const mongoose = require('mongoose');
mongoose.plugin(schema => { schema.options.usePushEach = true });
var sys = require(__dirname + '/../config/System');
var db = mongoose.connect(sys.finditdb_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');
const Schema = mongoose.Schema;

const bizSchema = new Schema({
		name: { type: String,required: true, index: { unique: true, sparse: true }, es_indexed:true, es_boost:4.0},
		description: { type: String, es_indexed:true, es_boost:1.0 },
		city: String,
		map: {
			lati: String,
			long: String,
			zoom: String
		},
		website: String,
		phone: String,
		email: String,
		keywords: { type: String, es_indexed:true,es_boost:3.0 },
		slug: {
			type: String,
			unique: true
		},
		photo: String,
		catalog: Array,
		profile: String,
		category: String,
		subcategory: { type: String},
		extras: Array,
		features: { type: Array, es_indexed:true, es_boost:2.0 },
		street: String,
		building: String,
		youtube: String,
		deliverylink: String,
		bookinglink: String,
		facebook: String,
		twitter: String,
		instagram: String,
		linkedin: String,
		units: String,
		gallery: Array,
		reviews: [{
			rate: String,
			msg: String,
			user_id: String
		}],
		startdate: String,
		hoursopen: String,
		hoursclose: String,
		hours: {
			sunday: [ { _id:false, opens: String, closes: String } ],
			monday: [ { _id:false, opens: String, closes: String } ],
			tuesday: [ { _id:false, opens: String, closes: String } ],
			wednesday: [ { _id:false, opens: String, closes: String } ],
			thursday: [ { _id:false, opens: String, closes: String } ],
			friday: [ { _id:false, opens: String, closes: String } ],
			saturday: [ { _id:false, opens: String, closes: String } ]
		},
		starteventdate: Date,
		endeventdate: Date,
		paid: Boolean,
		fakepaid: Boolean,
		amountpaid: String,
		packagepaid: String,
		datepaid: Date,
		date: Date,
		approved: Boolean,
		agentphone: String,
		pending: Boolean,
		youtube: String,
		coupons: [{ type: Schema.Types.ObjectId, ref: 'Coupon' }],
		branch: Boolean,
		bizparent: { type: Schema.Types.ObjectId, ref: 'Business' },
		user_id: String
});

bizSchema.index(
	{ name: 'text',features: 'text',subcategory: 'text', keywords: 'text' }
);

const Promise = require("bluebird");
const Business = mongoose.model('Business', bizSchema);
//Business.search = Promise.promisify(Business.search, { context: Business });
module.exports = Business;
