var httpProxy = require('http-proxy'),
		  http = require('http'),
		  io = require('socket.io');


exports.createWebSocketProxy = function(req, res){	

	//var portnumber = generatePortNumber();

	buildProxywithSocket();

	res.json({'msg' : "Websocket proxy runnning on port http://localhost:8009"});
}

var proxy = httpProxy.createProxy();

function buildProxywithSocket(){

var proxy = new httpProxy.createProxyServer({ target: "http://localhost:8014" });

	var websockproxyserver = http.createServer(function(req, res){

		//proxy normal http requests
		proxy.web(req, res);	

	});

	//upgrade to websocket protocol on upgrade request
	websockproxyserver.on('upgrade', function(req, socket, head){
		proxy.ws(req, socket, head);
	});

	websockproxyserver.listen(8009);

		process.on("uncaughtexception", function(err){

			if(err.errno === "EADDRINUSE"){

				console.log("Address in use");
			}

			console.log("Error occured");
			console.log("\n" + err);
		})


}

//generate port numbers to run proxy server on demand
function generatePortNumber()
{
	var proxyport = Math.floor(Math.random() * 16383) + 49152;
	return proxyport;
}
