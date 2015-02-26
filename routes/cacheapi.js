var mongoose = require("mongoose");
mongoose.connect("mongodb://cmpe273team26:cmpe273team26@ds047800.mongolab.com:47800/proxydb");

//require the colletions
var CacheConfig = require("../models/cacheconfig");



//add default client 
exports.addproxyconfig = function(req, res){


           var cachedb= new CacheConfig();
           var count = 0;		
			
		   if(cachedb!= undefined)
			{
				cachedb.forEach(function(item){
					count++;
				})
			}

			count++;
             cachedb.condigid=count;
             cachedb.targeturl=req.body.targeturl
             cachedb.latency=req.body.latency


				cachedb.save(function(err, data){
				if(err) 
					res.send(err);

				//add info to roouting table as well
				
			
			  	res.send( (err === null) ? { msg: '' } : { msg: err });
			});			
	
}

///// make changes /////
  exports.updateproxyconfig=function(req,res){
    configid = req.params.configid
    query={"configid":configid}
    update={configid: req.params.configid, targeturl : req.body.targeturl, proxyurl: req.body.proxyurl, latency : req.body.latency}
    CacheConfig.findOneAndUpdate(query, update, function(err, data){

				res.send( (err === null) ? { msg: '' } : { msg: err });

		})
  }


  exports.deleteproxyconfig=function(req,res){
    
    configid = req.params.configid

    CacheConfig.remove({'configid' : configid}, function(err, data){
		if(err)
			throw err;

		console.log((err === null) ? { msg: 'Deleted' + data } : { msg: err });	
	})
  }

