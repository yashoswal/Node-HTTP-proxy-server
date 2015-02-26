/**
 * New node file
 */

//connect to database
//var mongoose = require("mongoose");
//mongoose.connect("mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb");

//require the colletions
var ProxyConfig = require("../models/ProxyConfigModel");
var RoutingInfo = require("../models/RoutingInfoHttps");
var LoadBalInfo = require("../models/LoadBalModel");


var http = require('http'),
	https = require('https'),
	util = require('util'),
	path = require('path'),
	//colors = require('colors'),
	httpproxy = require('http-proxy'),
	connect = require('connect');


//Simpleprxy POST function
//adds simpleproxy configuration data to database
exports.addProxyConfiguration = function(req, res){
		
		ProxyConfig.findOne({"ClientId" : "1"}, function(err, proxydb){
			if(err)
				res.send(err);

			var count1 = " ";		
			
			if(proxydb.HttpsProxy != undefined)
			{	
				count1='0'
				//console.log("In simple proxy array")
				proxydb.HttpsProxy.forEach(function(item){
				count1=item.configid;
				//console.log("string count" + count1)
				//console.log("Item" + item)
				//if(item===null)
					//{count1='0'}
				})
			}
			count=parseInt(count1);
			count++;
			console.log("count" + count)

			proxydb.HttpsProxy.push({configid: count, targeturl: req.body.targeturl, proxyurl : '', latency: req.body.latency, https: req.body.https, original: req.body.stringtomatch, replacement: req.body.stringtoreplace});

			proxydb.save(function(err, data){
				if(err) 
					res.send(err);

				//add info to roouting table as well
				insertHttpsproxyRoutingInfo(count, req.body.targeturl, req.body.latency, req.body.https, req.body.stringtomatch, req.body.stringtoreplace);
			
			  	res.send( (err === null) ? { msg: '' } : { msg: err });
			});				

			
		});
}//addProxyConfiguration

exports.forwardRequestSecure = function(req, res){
	var url = req.body.url;
	res = httpproxy.createProxyServer({
		target : 'https://www.linkedin.com',
		agent : https.globalAgent,
		headers : {
			host : 'www.linkedin.com'
		}
	}).listen(8451);
	//res.json({msg:"Started secure proxy server"});
	//res.end();
}

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

	var update = { $pull : { HttpsProxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

	var proxyurl = req.body.proxyurl;

	var query = {"ClientId" : "1"};

	var update = { $push : { HttpsProxy : { configid: req.params.configid, targeturl : req.body.targeturl, proxyurl: req.body.proxyurl, latency : req.body.latency, https : req.body.https, status: false }}};

		ProxyConfig.findOneAndUpdate(query, update, function(err, data){

				res.send( (err === null) ? { msg: '' } : { msg: err });

		})
	})

	//update routing table as well
	updateHttpsproxyRoutingInfo(req.params.configid,  req.body.targeturl, req.body.proxyurl, req.body.latency, req.body.https, false);

}//updateProxyConfiguration


exports.deleteProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};
	
	var update = { $pull : { HttpsProxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			res.send( (err === null) ? { msg: '' } : { msg: err });
	})

	//
	deleteHttpsproxyRoutingInfo(req.params.configid);

}//deleteProxyConfiguration


//delete proxy configuration from Routing table
function deleteHttpsproxyRoutingInfo(configid){

	RoutingInfo.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}

function insertHttpsproxyRoutingInfo(count, targeturl, latency, https, originalres, modifiedres)
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
	
			console.log("Https routing info added : " + routingdb);
		});
}

//update configuration in routing table
function updateHttpsproxyRoutingInfo(configid, targeturl, proxyurl, latency, https, status){

	var query  = { "configid" : configid };

	var update = { $set : { "targeturl" : targeturl, "proxyurl" : proxyurl, "latency" : latency, "https" : https, "status" : status } };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'configuration updated' } : { msg: err });

	});
}

//
//Create a HTTP Proxy server with a HTTPS target
//
/*httpproxy.createProxyServer({
	target : 'https://www.linkedin.com',
	agent : https.globalAgent,
	headers : {
		host : 'www.linkedin.com'
	}
}).listen(8011);
*/
//util.puts('http proxy server'.blue + ' started '.green.bold + 'on port '.blue + '8011'.yellow);
	