/* Express app (routes only) to create and manage simple reverse proxy server with options for latency and HTTP -> HTTPS proxy and load balancer*/

var arguments = process.argv.splice(2);

 var express = require('express'),
  	 app = express(),
     bodyParser = require('body-parser'),
     proxyapi = require('./routes/proxyserverapi'),
     forwardproxyapi = require('./routes/forwardproxybackendapi'),
     loadbalancerapi = require('./routes/loadbalancerapi'),
     ChangeResponse = require("./routes/ChangeResponse"),
 	 gzip = require('./routes/gzip'),
 	HTTP = require('./routes/httpTohttpsProxyBackendapi'),
 	websockproxy = require('./routes/Websocketproxyapi');
 
//get mongodb connection instance
var mongoconn = require("./routes/mongoconnectionbuilder");
mongoconn.createMongoConnection();


var router = express.Router();

//configure app to use bodyparser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//configure app for cross-origin requests
app.all('*', function(req, res, next){

	if (!req.get('Origin')) return next();
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
	if ('OPTIONS' == req.method) return res.sendStatus(200);
	next();
});


app.use('/proxyserver', router);

//app middleware
router.use(function(req, res, next){
	next();
});

app.listen(8006);

//route to create a simpleproxy server as per requested configurations
router.route("/reverseproxy")

	.post(proxyapi.createReverseProxyServer);

router.route("/reverseproxy/:configid")
	
	.delete(proxyapi.stopReverseProxyServer);


//route to create a simpleproxy server as per requested configurations
router.route("/forwardproxy")

	.post(forwardproxyapi.createForwardProxyServer);

router.route("/forwardproxy/:configid")
	
	.delete(forwardproxyapi.stopForwardProxyServer)
	
//temporary function to insert routing info in routing table
router.route("/routinginfo")
	
	.post(proxyapi.addRoutingInfo);

router.route("/routinginfo/:configid")
	
	.put(proxyapi.updateRoutingInfo);

router.route("/gzip")

	.post(gzip.insertInDb);

//routes for loadbalacer api here
router.route("/loadbalancer")

	.post(loadbalancerapi.createLoadBalancer);

router.route("/loadbalancer/:configid")
	
	.delete(loadbalancerapi.stopLoadBalancer);

//route to remove an instance from load balancer
router.route('/loadbalancer/:configid/appinstance')
	.delete(loadbalancerapi.removeFromloadBalancer);

router.route("/ChangeResponse")
.post(ChangeResponse.createChangeResponseProxy);

router.route("/ChangeResponse/:configid")
.delete(ChangeResponse.stopChangeResponseProxy);


//routes for HttpToHttps api here
router.route("/httpsProxy")

	.post(HTTP.createHttpsProxyServer);

	//.get(HTTP.forwardRequestSecure);

router.route("/httpsProxy/:configid")

	.delete(HTTP.stopForwardProxyServer);


router.route('/websocketproxy')
	
	.post(websockproxy.createWebSocketProxy);