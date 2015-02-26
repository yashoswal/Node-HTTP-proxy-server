var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CacheSchema   = new Schema({
	configid:String,
	targeturl:String,
	latency:String,
	status:Boolean
});

module.exports = mongoose.model('CacheDB', CacheSchema);