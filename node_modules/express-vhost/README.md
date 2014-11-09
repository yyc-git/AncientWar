express-vhost
=============

Improves on express.js middleware for vhost by avoiding expensive regex chains.  This will perform better and scale more than connect vhost.

``` javascript

var evh = require('express-vhost'),
	express = require('express');

var appFactory = function(echo) {
	var app = express();
	app.get('/', function(req, res) {
		res.send(echo);
	});

	return app;
};

var server = express();
server.use(evh.vhost());
server.listen(port);

evh.register('test1-local', appFactory('test1'));
var app2 = appFactory('test2');
evh.register('test2-local', app2);
evh.register('*.test2-local', appFactory('test2'));

```