/*Code (route handlers) to create and manage loadbalancer */

var httpProxy = require('http-proxy'),
 	http = require('http'),
 	https = require('https');

//require collection (model) to connect to
var LoadbalanceConfig = require("../models/LoadBalModel"); 

//map to store server instances
var loadMap = new Object();

//configuration object for load balancer
function configuration(portnumber, configid, targeturls, proxyurl)
{
	this.portnumber = portnumber;
	this.targets = targeturls; 
	this.proxyurl = proxyurl;
}


exports.createLoadBalancer = function(req, res){

	//configuration object for load balancer
	var loadconfig = new configuration();

	var portnumber = generatePortNumber();

	loadconfig.portnumber = portnumber;
	loadconfig.configid = req.body.configid;

	LoadbalanceConfig.findOne({configid : req.body.configid}, function(err, loadbaldb){
		if(err)
			res.send(err);

		loadconfig.targets = loadbaldb.targeturl;

		console.log(loadconfig);

		res.json({msg : "Loadbalancer running on " + "localhost:" + loadconfig.portnumber, port: "localhost:" + loadconfig.portnumber });

		buildLoadBalancer(loadconfig);	
	})

}//createLoadBalancer


//update load balancer routing table with proxy url

function updateLoadBalRouting(configid, proxyport){

	var query = {'configid' : configid};
	var update ={ $set : { 'proxyurl': "localhost:" + proxyport, 'status':true } };

	LoadbalanceConfig.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'updated' } : { msg: err });
	});
}

//stop load balancer

exports.stopLoadBalancer = function(req, res){

	var server = loadMap[req.params.configid];

	if(server === undefined)
	{
		res.json({msg : "Loadbalancer not running"});

	}
	else
	{
		server.close();
		res.json({msg : "Loadbalancer stopped"});

	}

	LoadbalanceConfig.update({'configid' : req.params.configid}, { $set : { 'status' : false, 'proxyurl': null } }, function(err, data){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'updated' + data } : { msg: err });
	});
}


exports.removeFromloadBalancer = function(req, res){
	
	console.log("Config id " + req.params.configid + " Instance to remove " + req.body.instanceurl);

	var query = { "configid" : req.params.configid };

	var update = { $pull : { "targeturl" : req.body.instanceurl } };

	LoadbalanceConfig.findOneAndUpdate(query, update, function(err, data){

		res.send( (err === null) ? { msg: '' } : { msg: err });

	});
}

/*========================== Create load balancer ===================================*/

var proxy = httpProxy.createProxy();

function buildLoadBalancer(loadconfig){

	var loadconfig = loadconfig;

	loadbalancedserver = http.createServer(function(req, res){

	//disable favicon
		if(req.url === '/favicon.ico')
		{
			console.log("favicon disabled");
			res.end();
			return;
		}

		//disable browser cache for proxy server requests
  		res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
   		res.setHeader("Pragma", "no-cache");
   		res.setHeader("Expires", 0);
   	
   		var targeturl = {target : loadconfig.targets.shift()};

   		proxy.web(req, res, targeturl);

   		loadconfig.targets.push(targeturl.target);

   	});

   	loadbalancedserver.listen(loadconfig.portnumber);

	process.on('uncaughtException', function(err){
			if(err.errno === 'EADDRINUSE')
			{
				console.log("Port already in use");

			}
			console.log(err);

		});

	loadMap[loadconfig.configid] = loadbalancedserver;

	updateLoadBalRouting(loadconfig.configid, loadconfig.portnumber);

	//poll routing table for new configurations
	setInterval(function(){
   		
   			LoadbalanceConfig.findOne({configid : loadconfig.configid}, function(err, loadbaldb){
   				if(err)
					res.send(err)

				if(routingdb === null)
				{
					clearInterval(poll);
				}
				if(!Boolean(loadbaldb.status))
				{
					console.log("Attempting polling stop");
					clearInterval();
				}
				else
				{
					loadconfig.targets = loadbaldb.targeturl;
				}
   			});

   		}, 10000);

}//buildLoadBalancer


//generate port numbers to run proxy server on demand
function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 16383) + 49152;
	return proxyport;
}
