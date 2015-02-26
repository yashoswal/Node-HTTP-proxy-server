var socket;

$(document).ready(function(){

	$('#btnDemo').on('click', startWebSocketProxy);

	$('#txtMessage').keypress(function(e){
      socket.emit('client_data', {'letter': String.fromCharCode(e.charCode)});
    });
});

function startWebSocketProxy(event)
{
	event.preventDefault();

	$.ajax({

			type : 'POST',
			data : '',
			url : 'http://localhost:8006/proxyserver/websocketproxy',
			dataType : 'JSON'

	}).done(function(response){

		listenToWebsocketProxy();
	});
}

function listenToWebsocketProxy()
{
	  
	  socket = io.connect("ws://localhost:8009");
      
      socket.send('I am the third party client');
        
     socket.on('message', function(data){
      
        var socketStatus = document.getElementById('status');
         socketStatus.innerHTML = data;
  	});

    socket.on('connect_error', function(ex) {
        console.log("handled error");
        console.log(ex);
        
		var socketStatus = document.getElementById('status');       
		socketStatus.innerHTML = ex;
        socket.close();
    });

    socket.on('response', function(data){

    	console.log("Hello");
        var echoed = document.getElementById('txtEcho');
        echoed.value += data.letter;
    });  
}