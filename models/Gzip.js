var mongoose = require("mongoose");
//var Int =require("Int")
var Schema = mongoose.Schema;

var gzip = new Schema({configid:Number, targeturl:String, proxyurl: String});

module.exports = mongoose.model("Gzip", gzip)