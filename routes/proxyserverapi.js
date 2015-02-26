/* Code to create and manage simple reverse proxy server with options for latency and HTTP -> HTTPS proxy*/


var httpProxy = require('http-proxy'),
 	http = require('http'),
 	https = require('https'),
 	async = require('async'),
 	SHA256 = require("crypto-js/sha256");


var map = new Object();

//require collection (model) to connect to
var RoutingInfo = require("../models/RoutingInfo");
var ProxyConfig = require("../models/ProxyConfigModel");

//define a configuration structure to hold proxy server configuration

function configuration(portnumber, configid, targeturl, proxyurl, https, latency) {	

						    this.portnumber = portnumber;
						    this.configid   = configid;
						    this.targeturl  = targeturl;
						    this.proxyurl   = proxyurl;
						    this.https	   	= https;	
						    this.latency    = latency;
}


//create simpleproxy server on POST request
exports.createReverseProxyServer = function(req, res){
	
	var portnumber = generatePortNumber();
	//create a configuration object
	var config = new configuration();
	config.portnumber = portnumber;
	config.configid = req.body.configid;

 	RoutingInfo.findOne({"configid" : config.configid}, function(err, routingdb){
		if(err)
			res.send(err);

		//get configuration from db
		config.targeturl = routingdb.targeturl;
		config.latency 	 = routingdb.latency;
		config.https 	 = routingdb.https;

		res.json({msg : "Proxyserver running on " + "localhost:" + config.portnumber, port: "localhost" + config.portnumber });

		buildProxyServer(config);
	});

}

//update a routing tabel entry with proxyurl  for a configuration
function updateRoutingInfowithUrl(configid, proxyport)
{
	var query = {'configid' : configid};
	var update = { $set : { 'proxyurl' : "localhost:"+proxyport, 'status' : true } }; 

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'updated' } : { msg: err });

	});

}


//stop the server
exports.stopReverseProxyServer = function(req, res){

	var server = map[req.params.configid];
	if(server === undefined) {
		res.json({msg : "Server not running"});

	} else {
		server.close();	
		delete map[req.params.configid];
		res.json({msg : "Proxy Stopped"});

	}
	

	RoutingInfo.update({'configid' : req.params.configid}, { $set : {'status' : false, 'proxyurl' : null} }, function(err, data){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'updated' + data } : { msg: err });
	});
}

/*=========================== /routinginfo handlers (temp) for backend testing only ==============================*/

//temporary function to insert routing info in routing table
//use this as long as front end is not ready
exports.addRoutingInfo = function(req, res){

	var routingdb = new RoutingInfo;
	routingdb.configid = req.body.configid;
	routingdb.targeturl = req.body.targeturl;
	routingdb.proxyurl = req.body.proxyurl;
	routingdb.latency = req.body.latency;
	routingdb.https = req.body.https;
	routingdb.status = false;

	routingdb.save(function(err){
		if(err) 
			res.send(err);

		res.json({ message : "routing info added"});	

	})
}

exports.updateRoutingInfo = function(req, res){

	var query  = { "configid" : req.params.configid };
	var update = { $set : { "targeturl" : req.body.targeturl } };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			res.send(err);
		res.send( (err === null) ? { msg: req.body } : { msg: err });

	});
}

/*==========================  Build a proxy server with options for latency and https proxy ========================*/

var proxy = httpProxy.createProxy();

function buildProxyServer(config)
{

		var config = config;
		var flag = true;
	

		reverseproxyserver = http.createServer(function (req, res) {

		var start = (new Date()).getMilliseconds();

		//generate unique req id
		var requestid = SHA256(start.toString() + JSON.stringify(req.headers));

		//disable favicon
		if(req.url === '/favicon.ico')
		{
			res.end();
			return;
		}

		//disable browser cache for proxy server requests
  		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
   		res.setHeader("Pragma", "no-cache");
   		res.setHeader("Expires", 0);

		//set the configuration for proxy

		var options = {

					target : config.targeturl,
					latency : config.latency,
					agent: "",
					headers: ""
		}

		if(Boolean(config.https))
		{
			options.agent = https.globalAgent;
			options.headers = { host: ((config.targeturl).split("www."))[1] };
		}


		if(config.latency > 0)
		{
			setTimeout(function()
			{
				proxy.web(req, res, options);
			}, config.latency);
		}
		else
		{
			proxy.web(req, res, options);	
		}

			//listen for proxyRes event on proxy
		proxy.on('proxyRes', function (proxyRes, req, res) {

  			res.setHeader("X-HTTP-Processing-Time", (new Date()).getMilliseconds() - start);
  			res.setHeader("X-HTTP-request-id", requestid);  			
			//res.end("Raw response from target: \n" + JSON.stringify(proxyRes.headers, true, 2) + "\n" + JSON.stringify(res.headers, true, 2));
		});

		//listen for error event on proxy
		proxy.on('error', function (err, req, res) {
  				res.writeHead(500, { 'Content-Type': 'text/plain'
  			});

  			res.end('Something went wrong. And we are reporting a custom error message.');
		});


	
	});

	process.on('uncaughtException', function (err) {
    	
    	//assign a new port if previous one is alreay in use and update routing table
    	if(err.errno === "EADDRINUSE")
    	{
    		var port =  generatePortNumber();
    		config.portnumber = port;
    		reverseproxyserver.listen(port);
    		updateRoutingInfowithUrl(config.configid, port);
   	 	}
   	 		console.log("Error occured");
    		console.log(err);
    	
	}); 

	reverseproxyserver.listen(config.portnumber);
	
	//add proxyurl in routing table
	updateRoutingInfowithUrl(config.configid, config.portnumber);

	console.log("Reverse : " + reverseproxyserver);
	//store server instance in map to keep track of servers launched
	map[config.configid] = reverseproxyserver;

		//poll the database at defined interval
		var poll = setInterval(function(){

			RoutingInfo.findOne({"configid" : config.configid}, function(err, routingdb){
				if(err)
					res.send(err)

				if(routingdb === null)
				{
					clearInterval(poll);
				}
				if(!Boolean(routingdb.status))	// check the status of proxy-server, if not running dnt get data
				{
					flag = false;
					clearInterval(poll);
				}
				else
				{
					config.targeturl = routingdb.targeturl;
					config.latency = routingdb.latency;
				}
			});

		}, 10000);


}//buildProxyServer



//generate port numbers to run proxy server on demand
function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 16383) + 49152;
	return proxyport;
}
