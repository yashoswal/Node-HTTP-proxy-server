/**
 * New node file
 */
var http = require('http');
var fs = require('fs');
var index = fs.readFileSync('myebook.htm');
//var index = fs.readFileSync('Fundamentals of Database Systems, 6th Edition-1.pdf')
var express = require('express')
var app = express()
var connect = require('connect')

var compression = require('compression')
app.use(compression())
app.get('/',function(req,res){
	res.end(index)
})
app.listen(9618)

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(index);
}).listen(9617);
