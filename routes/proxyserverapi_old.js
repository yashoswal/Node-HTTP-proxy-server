var httpProxy = require('http-proxy'),
 	http = require('http');

var async = require('async');

var RoutingInfo = require("../models/RoutingInfo");
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


//define a configuration structure to hold proxy server configuration

var configuration = {	
						    portnumber : "",
						    configid   : "",
						    targeturl  : "",
						    proxyurl   : "",
						    latency    : 0
};


//create simpleproxy server on POST
exports.createSimpleProxyServer = function(req, res){
	
	var portnumber = generatePortNumber();

	configuration.portnumber = portnumber;

	//var configid = req.body.configid;

	configuration.configid = req.body.configid;

	console.log(configuration);

 	RoutingInfo.findOne({"configid" : configuration.configid}, function(err, routingdb){
		if(err)
			res.send(err)

		//var target = routingdb.targeturl;
		//var latency = routingdb.latency;

		configuration.targeturl = routingdb.targeturl;
		configuration.latency = routingdb.latency;

		console.log(configuration);

		res.json({msg : "Proxyserver running on " + "localhost:" + configuration.portnumber, port: "localhost" + configuration.portnumber });

		buildProxyServer(configuration);
	});

}


/*=========================== /routinginfo handlers (temp) ==============================*/

//temporary function to insert routing info in routing table
//use this as long as front end is not ready
exports.addRoutingInfo = function(req, res){

	var routingdb = new RoutingInfo;
	routingdb.targeturl = req.body.targeturl;
	routingdb.proxyurl = req.body.proxyurl;
	routingdb.configid = req.body.configid;

	routingdb.save(function(err){
		if(err) 
			res.send(err);

		res.json({ message : "Default client added"});	
		console.log(routingdb);

	})
}

exports.updateRoutingInfo = function(req, res){

	var query  = { "configid" : req.params.configid };
	var update = { $set : { "targeturl" : req.body.targeturl } };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			res.send(err);
		res.send( (err === null) ? { msg: '' } : { msg: err });

	});
}


/*=============================================================*/


/*==========================  Build a proxy server ========================*/

var proxy = httpProxy.createProxy();

function buildProxyServer(configuration)
{
			console.log("configuration  " + configuration);

		var configuration = configuration;

		simpleproxyserver = http.createServer(function (req, res) {

		//disable favicon
		if(req.url === '/favicon.ico')
		{
			console.log("favicon disabled");
			res.end();
			return;
		}


		//poll the database at defined interval
		setInterval(function(){

			console.log("Polling the db with configid" + configuration.configid);

			RoutingInfo.findOne({"configid" : configuration.configid}, function(err, routingdb){
				if(err)
					res.send(err)

				configuration.targeturl = routingdb.targeturl;
				configuration.latency = routingdb.latency;

				console.log("Polling the db " + configuration.targeturl);


			});

		}, 10000);


		console.log("URL : " + req.url);
	
		//set the target for proxy
		target = {target : configuration.targeturl} 

		console.log("target: " +target);

		if(configuration.latency > 0)
		{
			setTimeout(function()
			{
				console.log('forwarding request with latency: ', target.target + "latency: " + configuration.latency);
				proxy.web(req, res, target);
			}, latency);
		}
		else
		{
    	 	console.log('forwarding request to: ', target.target);
			proxy.web(req, res, target);	
		}

	});

	process.on('uncaughtException', function (err) {
    	console.log(err);
	}); 

	simpleproxyserver.listen(configuration.portnumber);

}//buildProxyServer

/*==========================================================================*/

function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 16383) + 49152;
	return proxyport;
}
