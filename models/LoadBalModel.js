/*Mongodb model to store routing information (configuration) for load balancer*/

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LoadBalModel = new Schema({configid: String, targeturl : [], proxyurl : String, status: Boolean});

module.exports = mongoose.model("LoadBalModel", LoadBalModel);