
//connect to database
var mongoose = require("mongoose");
mongoose.connect("mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb");

//require the colletions
var ProxyConfig = require("../models/ProxyConfigModel");
var RoutingInfo = require("../models/RoutingInfo");
var LoadBalInfo = require("../models/LoadBalModel");


//add default client 
exports.addDefaultClient = function(req, res){

	var proxydb = new ProxyConfig;
	proxydb.ClientId = req.body.clientid;

	proxydb.save(function(err){
		if(err) 
			res.send(err);

		res.json({ message : "Default client added"});	

	})
}


//Simpleprxy POST function
//adds simpleproxy configuration data to database
exports.addProxyConfiguration = function(req, res){
		
		ProxyConfig.findOne({"ClientId" : "1"}, function(err, proxydb){
			if(err)
				res.send(err);

			var count1 = " ";		
			
			if(proxydb.Simpleproxy != undefined)
			{	
				count1='0'
				proxydb.Simpleproxy.forEach(function(item){
				count1=item.configid;
				//if(item===null)
					//{count1='0'}
				})
			}
			count=parseInt(count1);
			count++;

			proxydb.Simpleproxy.push({configid: count, targeturl: req.body.targeturl, proxyurl : '', latency: req.body.latency, https: req.body.https, original: req.body.stringtomatch, replacement: req.body.stringtoreplace});

			proxydb.save(function(err, data){
				if(err) 
					res.send(err);

				//add info to roouting table as well
				insertSimpleproxyRoutingInfo(count, req.body.targeturl, req.body.latency, req.body.https, req.body.stringtomatch, req.body.stringtoreplace);
			
			  	res.send( (err === null) ? { msg: '' } : { msg: err });
			});				

			
		});
}//addProxyConfiguration


//Simpleproxy GET
//retrieve all proxy configurations for simpleproxy
exports.getProxyConfiguration = function(req, res){
		//retrieve configuration from routing table
		RoutingInfo.find({}, function(err, docs){
			if(err)
				throw err;
			res.json(docs);
		});
}


//Simpleproxy UPDATE
//update simpleproxy configuration
exports.updateProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};

	var update = { $pull : { Simpleproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

	var proxyurl = req.body.proxyurl;

	var query = {"ClientId" : "1"};

	var update = { $push : { Simpleproxy : { configid: req.params.configid, targeturl : req.body.targeturl, proxyurl: req.body.proxyurl, latency : req.body.latency, https : req.body.https, status: false, originalresponse: req.body.originalstring, modifiedresponse: req.body.replacementstring }}};

		ProxyConfig.findOneAndUpdate(query, update, function(err, data){

				res.send( (err === null) ? { msg: '' } : { msg: err });

		})
	})

	//update routing table as well
	updateSimpleproxyRoutingInfo(req.params.configid,  req.body.targeturl, req.body.latency, req.body.https, req.body.originalstring, req.body.replacementstring);

}//updateProxyConfiguration


exports.deleteProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};
	
	var update = { $pull : { Simpleproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			res.send( (err === null) ? { msg: '' } : { msg: err });
	})

	//
	deleteSimpleproxyRoutingInfo(req.params.configid);

}//deleteProxyConfiguration


//delete proxy configuration from Routing table
function deleteSimpleproxyRoutingInfo(configid){

	RoutingInfo.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}

//add configration to routing table on POST
function insertSimpleproxyRoutingInfo(count, targeturl, latency, https, originalres, modifiedres)
{
	var routingdb = new RoutingInfo;
	routingdb.configid = count;
	routingdb.targeturl = targeturl;
	routingdb.latency = latency;
	routingdb.https = https;
	routingdb.status = false;
	routingdb.originalresponse = originalres;
	routingdb.modifiedresponse = modifiedres;


		routingdb.save(function(err){
	
			if(err)
				throw err;
	
		});
}

//update configuration in routing table
function updateSimpleproxyRoutingInfo(configid, targeturl, latency, https, originalstring, replacementstring){

	var query  = { "configid" : configid };

	var update = { $set : { "targeturl" : targeturl, "latency" : latency, "https" : https, "originalresponse" : originalstring, "modifiedresponse" : replacementstring} };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'configuration updated' } : { msg: err });

	});
}

exports.addLoadBalancerConfiguration = function(req, res){

	ProxyConfig.findOne({"ClientId": "1"}, function(err, proxydb){
			if(err)
				res.send(err);
	
			var count = 0;		
			
			if(proxydb.Loadbalance != undefined)
			{
				proxydb.Loadbalance.forEach(function(item){
					count++;
				})
			}	
			
			var targets = req.body.config;
				
				proxydb.Loadbalance.push({configid: "L-"+count, targeturl: targets, proxyurl : ''});

				proxydb.save(function(err, data){
					if(err) 
						res.send(err);
			  		res.send( (err === null) ? { msg: '' } : { msg: err });
				});

					insertLoadBalRoutingInfo("L-"+count, targets);
		});

}


//insert load balncer configurations into routing table
function insertLoadBalRoutingInfo(configid, targetinstances)
{
	var loadbalroutingdb = new LoadBalInfo;
	loadbalroutingdb.configid =  configid;
	loadbalroutingdb.targeturl = targetinstances;
	loadbalroutingdb.proxyurl = "";
	loadbalroutingdb.status = false;

	loadbalroutingdb.save(function(err){
		if(err)
			throw err;
	});

}


exports.getLoadBalancerConfig = function(req, res){
	
		//retrieve configuration from routing table
		LoadBalInfo.find({}, function(err, docs){
			if(err)
				throw err;
			res.json(docs);
		});
}


exports.deleteLoadBalancerConfiguration = function(req, res){

	var query = {"ClientId" : "1"};
	
	var update = { $pull : { Loadbalance : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			res.send( (err === null) ? { msg: '' } : { msg: err });
	})

	deleteLoadBalanceRoutingInfo(req.params.configid);
}

//also remove configuration from routing table
function deleteLoadBalanceRoutingInfo(configid){

	LoadBalInfo.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}

exports.removeInstanceFromLoadBalancer = function(req, res){

	var query = {"ClientId" : "1", "Loadbalance.configid" :  req.params.configid };

	var update = { $pull : { "Loadbalance.$.targeturl" : req.body.instanceurl } };

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			removeInstancefromLBRouting(req.params.configid, req.body.instanceurl);
			res.send( (err === null) ? { msg: '' } : { msg: err });
	});

	
}

function removeInstancefromLBRouting(configid, instanceurl)
{
	//also remove it from routing table
	var query = { "configid" : configid };

	var update = { $pull : { "targeturl" : instanceurl } };

	LoadBalInfo.findOneAndUpdate(query, update, function(err, data){


	});

}

exports.addInstanceinLoadBalancer = function(req, res){

 	var query = {"ClientId" : "1", "Loadbalance.configid" :  req.params.configid };

	var update = { $push : { "Loadbalance.$.targeturl" : req.body.instanceurl } };

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			addInstanceinLoadBalancer( req.params.configid, req.body.instanceurl);
			res.send( (err === null) ? { msg: '' } : { msg: err });
	});
}


function addInstanceinLoadBalancer(configid, instanceurl){
	//also add it from routing table
	var query = { "configid" : configid };

	var update = { $push : { "targeturl" : instanceurl } };

	LoadBalInfo.findOneAndUpdate(query, update, function(err, data){

			
	});
}