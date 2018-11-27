const mongoose = require('mongoose');

var sys = require(__dirname + '/../config/System');
var db = mongoose.connect(sys.db_uri, {useMongoClient: true });
mongoose.Promise =require('bluebird');

const Schema = mongoose.Schema;

const userSchema = new Schema({
		username: { type: String,required: true, index: { unique: true, sparse: true }},
		names: String,
		googleId: String,
		isfacebooklogin: {type:Boolean},
    facebookid: {type:String},
    googleid: {type:String},
		photouser: String,
		organization: String,
		phone: String,
		phones: Array,
		password: String,
		role: String,
		email: String,
		website: String,
		postal: String,
		companyName: String,
		twitter: String,
		facebook: String,
		instagram: String,
		shippingaddress: {
			phone: String,
			email: String,
			building: String,
			area: String
		},
		favorites: Array,
		resetcode: String,
		wallet: String
});

module.exports = mongoose.model('User', userSchema);
