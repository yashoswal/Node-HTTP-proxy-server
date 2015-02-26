var  http = require('http'),
	io = require('socket.io');

var server = http.createServer(function(req, res){
	
	res.write("Request successfully proxied to targetserver 8014");
	res.end();
});

server.listen(8014);

var io = io.listen(server);

io.sockets.on("connection", function(socket){
	
	console.log("Connected..");

	socket.send("Connected to target ws://localhost:8014");
	
	socket.on("message", function(msg){
		console.log("Message successfully proxied to target: " + msg);
	});

	    //recieve client data
  	socket.on('client_data', function(data){

			process.stdout.write(data.letter);
		socket.emit('response', {'letter' : data.letter});
  	});

  	socket.on('close_connection', function(closecall){
  			socket.send("Connection closed");
  	});

}); 

