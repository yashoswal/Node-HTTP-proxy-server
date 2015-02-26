/*Mongodb model to store routing information for reverse proxy server*/

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//var simpleproxy = new Schema({configid: String, targeturl: String, proxyurl: String, latency: String});

var Routing = new Schema({configid : String, targeturl : String, proxyurl : String, latency: String, https: Boolean, status : Boolean, originalresponse: String, modifiedresponse: String});

module.exports = mongoose.model("RoutingInfo", Routing)