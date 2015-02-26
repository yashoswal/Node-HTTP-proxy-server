

//require the colletions
var ProxyConfig = require("../models/ProxyConfigModel");
var RoutingInfo = require("../models/RoutingInfoForward");
var LoadBalInfo = require("../models/LoadBalModel");



//Simpleprxy POST function
//adds simpleproxy configuration data to database
exports.addProxyConfiguration = function(req, res){
		
		ProxyConfig.findOne({"ClientId" : "1"}, function(err, proxydb){
			if(err)
				res.send(err);

			var count = 0;		
			
			if(proxydb.Forwardproxy != undefined)
			{	
				console.log("In forward proxy array")
				proxydb.Forwardproxy.forEach(function(item){
				count++;
				})
			}

			count++;
			console.log("count" + count)

			proxydb.Forwardproxy.push({configid: count, targeturl: req.body.targeturl, forwardurl: req.body.forwardurl, proxyurl : '', latency: req.body.latency, https: req.body.https, original: req.body.stringtomatch, replacement: req.body.stringtoreplace});

			proxydb.save(function(err, data){
				if(err) 
					res.send(err);

				//add info to roouting table as well
				insertForwardproxyRoutingInfo(count, req.body.targeturl, req.body.forwardurl, req.body.latency, req.body.https, req.body.stringtomatch, req.body.stringtoreplace);
			
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

	var update = { $pull : { Forwardproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

	var proxyurl = req.body.proxyurl;

	var query = {"ClientId" : "1"};

	var update = { $push : { Forwardproxy : { configid: req.params.configid, targeturl : req.body.targeturl, forwardurl : req.body.forwardurl, proxyurl: req.body.proxyurl, latency : req.body.latency, https : req.body.https, status: false }}};

		ProxyConfig.findOneAndUpdate(query, update, function(err, data){

				res.send( (err === null) ? { msg: '' } : { msg: err });

		})
	})

	//update routing table as well
	updateForwardproxyRoutingInfo(req.params.configid,  req.body.targeturl, req.body.forwardurl, req.body.latency, req.body.https);

}//updateProxyConfiguration


exports.deleteProxyConfiguration = function(req, res){

	var query = {"ClientId" : "1"};
	
	var update = { $pull : { Forwardproxy : {configid: req.params.configid}}};

	ProxyConfig.findOneAndUpdate(query, update, function(err, data){

			res.send( (err === null) ? { msg: '' } : { msg: err });
	})

	//
	deleteForwardproxyRoutingInfo(req.params.configid);

}//deleteProxyConfiguration


//delete proxy configuration from Routing table
function deleteForwardproxyRoutingInfo(configid){

	RoutingInfo.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}

//add configration to routing table on POST
function insertForwardproxyRoutingInfo(count, targeturl, forwardurl, latency, https, originalres, modifiedres)
{
	var routingdb = new RoutingInfo;
	routingdb.configid = count;
	routingdb.targeturl = targeturl;
	routingdb.forwardurl = forwardurl;
	routingdb.latency = latency;
	routingdb.https = https;
	routingdb.status = false;
	routingdb.originalresponse = originalres;
	routingdb.modifiedresponse = modifiedres;


		routingdb.save(function(err){
	
			if(err)
				throw err;
	
			console.log("routing info added : " + routingdb);
		});
}

//update configuration in routing table
function updateForwardproxyRoutingInfo(configid, targeturl, forwardurl, latency, https){

	var query  = { "configid" : configid };

	var update = { $set : { "targeturl" : targeturl, "forwardurl" : forwardurl, "latency" : latency, "https" : https } };

	RoutingInfo.update(query, update, function(err, num){
		if(err)
			throw err;
		console.log( (err === null) ? { msg: 'configuration updated' } : { msg: err });

	});
}