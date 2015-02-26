var express    = require('express');    // call express
var app        = express();         // define our app using express
var bodyParser = require('body-parser');
var redis = require("redis");
var HashMap = require('hashmap').HashMap;

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 8022;
var flag=1;
var http = require('http'),
httpProxy = require('http-proxy');
//client = redis.createClient();

  //client.on("error", function (err) {
    //    console.log("Error " + err);
   // });

//var uobs= {email:"shreedhar22@gmail.com",name:"shreedhar"}
//client.hmset("u2", "email:shreedhar22@gmail.com","name:shreedhar");
//client.set('u2',JSON.stringify(uobs),redis.print)
//
// A simple round-robin load balancing strategy.
// 
// First, list the servers you want to use in your rotation.
//



/*var Client = require('node-rest-client').Client;
var client = new Client();

        client.get("http://localhost:8021", function(data, response){
            // parsed response body as js object
            console.log(data);
            // raw response
            //console.log(response);
        });*/

var addresses = [
    "http://localhost:9005",
  "http://54.183.253.67:8080",
   "http://localhost:9004"
];

var router = express.Router();       
  router.route('/configure')

  // create a bear (accessed at POST http://localhost:8080/api/bears)
  .post(function(req, res) {
  
      
      addresses.push(req.body.url)
      console.log("I m here")
    /*var pc = new PC();    // create a new instance of the PC model
    pc.url= req.body.url;  // set the bears name (comes from the request)
                
    // save the bear and check for errors
    pc.save(function(err) {
      if (err)
        res.send(err);

      res.json(pc);
    });*/
})

app.use('/API', router);

var proxy = httpProxy.createServer();
var cache_array=[];
var cache_map=new HashMap();
var counter=0;
var cache_target;
 


http.createServer(function (req, res) {
  //
  // On each request, get the first location from the list...
  //
  
 var cache_response=null; 
 var flag=0;
 var target = { target: addresses.shift() };
  
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
  addresses.push(target.target);
  
  //res.end("just once")
}).listen(8021);

//Start the Server
app.listen(port);
console.log('Starting proxy app ' + port);