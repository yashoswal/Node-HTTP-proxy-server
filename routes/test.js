/**
 * New node file
 */
var ejs = require("ejs");

function getOnPage(req, res) {
	res.render('NewFile',{});
}

exports.getOnPage = getOnPage;

function getSimpleProxyPage(req, res) {
	res.render('simpleProxy',{});
}

exports.getSimpleProxyPage = getSimpleProxyPage;

function getLoadBalancerPage(req, res) {
	res.render('LoadBalancer',{});
}

exports.getLoadBalancerPage = getLoadBalancerPage;

function getHttpToHttpsPage(req, res){
	res.render('HttpToHttps',{});
}

exports.getHttpToHttpsPage = getHttpToHttpsPage;


exports.getChangeResponsePage = function(req, res){
	res.render('ChangeResponse', {});
}


exports.getGzip = function(req,res){
	res.render('gzip',{});
}

exports.getWebsocketproxypage = function(req, res){

	res.render('Websocketproxy', {});

}
