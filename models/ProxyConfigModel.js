var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var simpleproxy = new Schema({configid: String, targeturl: String, proxyurl: String, latency: String, https:Boolean, status: Boolean, original: String, replacement: String});

var forwardproxy = new Schema({configid: String, targeturl: String, forwardurl: String, proxyurl: String, latency: String, https:Boolean, status: Boolean, original: String, replacement: String});

var httpsproxy = new Schema({configid: String, targeturl: String, proxyurl: String, latency: String, https:Boolean, status: Boolean });

var loadbalance = new Schema({configid: String, targeturl: [], proxyurl: String, latency: String})

var ProxyConfig = new Schema({ClientId: String , Simpleproxy: [simpleproxy], HttpsProxy: [httpsproxy], Forwardproxy: [forwardproxy], Loadbalance: [loadbalance]});

var gzip = new Schema({targrtyrl:[],proxyurl: String});

module.exports = mongoose.model("ProxyDB", ProxyConfig)