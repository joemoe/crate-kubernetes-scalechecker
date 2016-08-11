var Client = require('node-kubernetes-client');
var http = require('http');

var config = require('./config.json');

var client = new Client({
    host:  config.host,
    protocol: config.protocol,
    version: config.version,
    token: config.token
});

var update = function() {
	client.pods.get(function (err, pods) {
		var namespace = 0;
		for(var i = 0; i < pods[0].items.length; i++) {
			if(pods[0].items[i].metadata.namespace != "kube-system") namespace++;
		}
		setCrate(namespace);
	});
}

var setCrate = function(pods) {
	var req = http.request({
		host: config.crateHost,
		port: config.cratePort,
		path: config.crateRoute,
		method: "POST",
	}, function(response) {
		var str = "";
		response.on("data", function(chunk) {
			str += chunk;
		});
		response.on("end", function() {
			console.log("for pods", pods, str);
		})
	});
	//select settings['discovery']['zen']['minimum_master_nodes'] from sys.cluster limit 100;
	req.write('{"stmt":"SET GLOBAL PERSISTENT \\"discovery.zen.minimum_master_nodes\\"=' + (Math.ceil(pods/2+1)) + '"}');
	req.end();
}

setInterval(update, config.interval);