var mongoose = require("mongoose");
mongoose.connect("mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb");
var HashMap = require('hashmap').HashMap;

var http = require('http'),
httpProxy = require('http-proxy');

var proxy = httpProxy.createServer();
var serverObject=new Object();
var cache_map=new HashMap();
var counter=0;
var cache_target;

//require the colletions
var CacheConfig = require("../models/cacheconfig");


function ServerDetails(portnumber, configid, targeturl, proxyurl, https, latency) {	

						    this.portnumber = portnumber;
						    this.configid   = configid;
						    this.targeturl  = targeturl;
						 //   this.https	   	= https;	
						    this.latency    = latency;
}



exports.startcaching=function(req,res){
    
    
    var config = new ServerDetails();
    var port=generatePortNumber()
    config.configid=req.body.configid
    CacheConfig.findOne({"configid" : config.configid}, function(err, cachcedb){
		if(err)
			res.send(err);

		//get configuration from db
		config.targeturl = cachedb.targeturl;
		config.latency 	 = cachedb.latency;
		//config.https 	 = routingdb.https;

		console.log(config);

		res.json({msg : "CacheServer running on " + "localhost:" + config.portnumber, port: "localhost" + config.portnumber });

		createCacheServer(config);
	});

    
}

exports.stopcaching=function(req,res){
     var config = new ServerDetails();
     config.configid=req.body.configid
     CacheConfig.findOne({"configid" : config.configid}, function(err, cachcedb){
		if(err)
			res.send(err);

		//get configuration from db
		config.targeturl = cachedb.targeturl;
		config.latency 	 = cachedb.latency;
		//config.https 	 = routingdb.https;

		console.log(config);

		res.json({msg : "Stopping CacheServer " + "localhost:" + config.portnumber, port: "localhost" + config.portnumber });

		if(serverObject[config.configid]==undefined){
			console.log("Server not running");
		}
		else{
			serverObject[config.configid].close();
		}

	});
}

function createCacheServer(config){

serverObject[config.configid]= http.createServer(function (req, res) {
  //
  // On each request, get the first location from the list...
  //
  
 var cache_response=null; 
 var flag=0;
 var proxy_url=config.targeturl
 var target = { target: proxy_url };
  
  //
  // ...then proxy to the server whose 'turn' it is...
  //
  
  
  ////cache implementation////
    cache_response= cache_map.get((target.target+req.url));
    console.log(cache_response);
    if(cache_response!=null){
      console.log("I have cached")
       res.end(cache_response);
   }         
    
    else{
    console.log('balancing request to: ', target);
    proxy.web(req, res, target);

    res.oldWrite=res.write;
    res.write = function(data) {
        /* add logic for your data here */
        my_response=data.toString('UTF8');
       console.log(my_response);
       cache_map.set((target.target+req.url),my_response);
       res.oldWrite(data);
   }      
    
  } 
  /*if(flag===1){

         client.get("u2", function (err, reply) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(reply);
         res.end();
    });
  }else{*/
 
  
  
 
 

  console.log(target.target+req.url)
                            


  //
  // ...and then the server you just used becomes the last item in the list.
  //
  
  
  //res.end("just once")
})

server.listen(config.port);
}



function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 18369) + 50289;
	return proxyport;
}