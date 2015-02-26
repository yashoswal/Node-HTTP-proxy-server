
//mongodb connection provider

exports.createMongoConnection = function()
{

var mongoose = require("mongoose");
var dbURI = "mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb";
mongoose.connect(dbURI);

// CONNECTION EVENTS
	// When successfully connected
	mongoose.connection.on('connected', function () {
	  console.log('Mongoose default connection open to ' + dbURI);
	});
	 
	// If the connection throws an error
	mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
	});
	 
	// When the connection is disconnected
	mongoose.connection.on('disconnected', function () {
	  console.log('Mongoose default connection disconnected');
	});

}