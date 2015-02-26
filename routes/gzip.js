var httpProxy = require('http-proxy'),
 	http = require('http'),
 	connect = require('connect'),
 	GzipModel = require("../models/Gzip"),
 	compression = require('compression'),
 	app = connect();
	connectgzip = require('connect-gzip')

//function to creategzip	
/*function creategzip(req,res){
	
	//console.log("In creategzip")
	var url =req.body.targeturl
	//console.log("In creategzip url "+url)
	var port = generatePortNumber()
	//console.log("In creategzip port "+port)
	
	var proxy = httpProxy.createProxy({				
			  target: url
				});
	app.use(connectgzip.gzip())
	app.use(function(req,res){
		//if(req.method === 'GET'){
		//connectgzip.gzip()
		//proxy.web(req, res)//,{				
			  //target: url
			//});
		//}		
				//console.log("in compression")
				proxy.web(req, res)				
	});
	
		process.on('uncaughtException', function (err) {
    	
    	//assign a new port if previous one is already in use and update routing table
    	if(err.errno === "EADDRINUSE")
    	{
    		var port =  generatePortNumber();
    		console.log(port);
    		gzipserver = http.createServer(app).listen(port)
   	 	}
		});
		gzipserver = http.createServer(app).listen(port)
			//var proxy = httpProxy.createProxyServer({				
			//	  target: url
			//	});
		console.log("target url: " + url)
				return port;
}*/
	function creategzip(req,res){
	//var url = gzipModel.findOne
	console.log("In creategzip")
	var url =req.body.targeturl
	console.log("In creategzip url "+url)
	var port = generatePortNumber()
	console.log("In creategzip port "+port)
	gzipserver=connect.createServer(
			  //connect.compress({
			    //threshold: 1
			  //}),			
			compression(),
			  function (req, res) {
				console.log("in compression")
			    proxy.web(req, res);
			  }
			  
			);//.listen(port);	
		process.on('uncaughtException', function (err) {
    	
    	//assign a new port if previous one is already in use and update routing table
    	if(err.errno === "EADDRINUSE")
    	{
    		var port =  generatePortNumber();
    		console.log(port);
    		//proxy = httpProxy.createProxyServer({
				//  target: url
				//});
    		gzipserver.listen(port);
    		//portnumber = port;
    		//reverseproxyserver.listen(port);
    		//updateRoutingInfowithUrl(config.configid, port);
   	 	}
		});
			gzipserver.listen(port);	
			var proxy = httpProxy.createProxyServer({
				  target: url
				});
			
				//res.json({msg:"gzip running on: " + port});
				//console.log("In creategzip proxy "+proxy)
				//res.end();
				return port;
}

//function to insert in db	
exports.insertInDb=function(req, res){
	
	var gzipModel = new GzipModel;
	var port =0

	console.log("targetUrl: " + req.body.targeturl)	
	GzipModel.find({},function(err, gzipdb){		
		
		var count1 = " ";	
		count1='0'
			//console.log("gzipdb "+gzipdb)
		if(gzipdb!= null)
		{				
			gzipdb.forEach(function(item){
			count1=item.configid;
			})
		}
		count=parseInt(count1);
		count++;
		//console.log("count" + count)
		port = creategzip(req,res)
		//console.log("In createindb "+port)
		gzipModel.configid = count;
		gzipModel.proxyurl = 'http://localhost:'+port
		gzipModel.targeturl = req.body.targeturl
				
		gzipModel.save(function(err){
			if(err)
				throw err;
			//console.log("gzip added : " + gzipModel);
		});		
});

	res.end();
}

//function to generate port number for proxy	
function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 16383) + 49152;
	return proxyport;
}

function getGzip(req, res){
	GzipModel.find({}, function(err, docs){
		if(err)
			throw err;
		res.json(docs);
	});
}

exports.getGzip = getGzip;

exports.deleteGzip = function(req, res){
	var query = {};
	
	var update = { $pull  : {configid: req.params.configid}};

	deleteGzipInfo(req.params.configid);

}//deleteProxyConfiguration


//delete proxy configuration from Routing table
function deleteGzipInfo(configid){

	GzipModel.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
}
