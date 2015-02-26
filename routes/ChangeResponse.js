var http = require('http'),
    connect = require('connect'),
    httpProxy = require('http-proxy');

var proxymap = new Object();

var RoutingInfo = require("../models/RoutingInfo");

function configuration(portnumber, configid, targeturl, proxyurl, originalstring, stringtoreplace) { 

                this.portnumber = portnumber;
                this.configid   = configid;
                this.targeturl  = targeturl;
                this.proxyurl   = proxyurl;
                this.originalstring = originalstring;
                this.stringtoreplace = stringtoreplace;

}

//update a routing tabel entry with proxyurl  for a configuration
function updateRoutingInfowithUrl(configid, proxyport)
{
  var query = {'configid' : configid};
  var update = { $set : { 'proxyurl' : "localhost:"+proxyport, 'status' : true } }; 

  RoutingInfo.update(query, update, function(err, num){
    if(err)
      throw err;
    //console.log( (err === null) ? { msg: 'updated' } : { msg: err });

  });

}


exports.createChangeResponseProxy=function(req,res) {

  var portnumber = generatePortNumber();
  //create a configuration object
  var config = new configuration();
 // var app = connect();
 // var  proxy = 'http://localhost:9013'
	  
  config.portnumber = portnumber;
  config.configid = req.body.configid;
  console.log(config);


  RoutingInfo.findOne({"configid" : config.configid}, function(err, routingdb){
    if(err)
      res.send(err);

    //get configuration from db
    config.targeturl = routingdb.targeturl;
    config.originalstring = routingdb.originalresponse;
    config.stringtoreplace = routingdb.modifiedresponse; 

    console.log("Routing db: "  + routingdb);
    console.log("Got config: " + config.originalstring +  " " + config.stringtoreplace);

    res.json({msg : "Proxyserver running on " + "localhost:" + config.portnumber, port: "localhost" + config.portnumber });

    //create change response proxy using connect middleware
    buildProxyServer(config);
 
  });

}

//stop the server
exports.stopChangeResponseProxy = function(req, res){

  var server = proxymap[req.params.configid];
  if(server === undefined) {

    res.json({msg : "Server not running"});

  } else {
    server.close(); 
    delete proxymap[req.params.configid];
    res.json({msg : "Proxy Stopped"});
  
  }
  
  
  RoutingInfo.update({'configid' : req.params.configid}, { $set : {'status' : false, 'proxyurl' : null} }, function(err, data){
    if(err)
      throw err;
    console.log( (err === null) ? { msg: 'updated' + data } : { msg: err });
  });
}



function buildProxyServer(config)
{
  console.log("Building ProxyServer to alter response with: " + config);
  var app = connect();
  var proxy = httpProxy.createProxyServer({target: config.targeturl});
  
  app.use(
		  
		  function(req, res, next) {
			  if(req.method === 'GET'){
				  var _write = res.write;
				  res.write = function(data) {
					  
					  _write.call(res,data.toString().replace(config.originalstring, config.stringtoreplace));
				  }
				  proxy.web(req,res);
		         }
});
		  var port = generatePortNumber();
		  var connectserver = http.createServer(app).listen(config.portnumber);
		  proxymap[config.configid] = connectserver;
		  console.log(connectserver);
		  updateRoutingInfowithUrl(config.configid, config.portnumber);
		 }

/////////////////////////////////////  
  //var connectserver = connect.createServer( function (req, res, next) {
    
  //   var _write = res.write;

    //disable favicon
   // if(req.url === '/favicon.ico')
   // {
   //   console.log("favicon disabled");
   //   res.end();
   //   return;
   // }

   // res.write = function (data) {

     // console.log("data is: " + data);
     // _write.call(res, data.toString().replace(config.originalstring, config.stringtoreplace));

   // }
   // next();
 // },
 // function (req, res) {
  //  proxy.web(req, res);
 // }
  
//)
  //  connectserver.listen(config.portnumber);

   // proxymap[config.configid] = connectserver;
    
 //   console.log("Connectserver : " + connectserver);

    //poll the database at defined interval
   // var polldb = setInterval(function(){

     // RoutingInfo.findOne({"configid" : config.configid}, function(err, routingdb){
      //  if(err)
        //  res.send(err)

       // if(routingdb === null)
        //{
         // clearInterval(poll);
        //}
       // if(!Boolean(routingdb.status))  // check the status of proxy-server, if not running dnt get data
       // {
         // flag = false;
         // console.log("Stopping the db Polling");
          //clearInterval(polldb);
        //}
        //else
       // {
        //  config.targeturl = routingdb.targeturl;
         // config.originalstring = routingdb.originalresponse;
         // config.modifiedresponse = routingdb.modifiedresponse;
         // console.log("Polling the db " + config.targeturl);
       // }
      //});

    //}, 10000);


/*   var proxy = httpProxy.createProxyServer({ target: config.targeturl });

    updateRoutingInfowithUrl(config.configid, config.portnumber);

    process.on('uncaughtException', function (err) {
      
      //assign a new port if previous one is alreay in use and update routing table
      if(err.errno === "EADDRINUSE")
      {
        var port =  generatePortNumber();
        console.log(port);
        config.portnumber = port;
        connectserver.listen(port);
        updateRoutingInfowithUrl(config.configid, port);
      }
        console.log("Error occured");
        console.log(err);
      
    }); 


}

*/
//generate port numbers to run proxy server on demand
function generatePortNumber()
{
  var proxyport = Math.floor(Math.random() * 16383) + 49152;
  return proxyport;
}

