var evh = require('../index'),
	express = require('express'),
	tap = require('tap'),
	test = tap.test,
	http = require('http'),
	port = 3000;

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

var app2 = appFactory('test2');
evh.register('test1-local', appFactory('test1'));
evh.register('test2-local', app2);
evh.register('*.test2-local', app2);

// NOTE: Before running this test insure that you have setup local hosts file to point these domains to 127.0.0.1
test("Test 1", function(t) {
	var body = '';

	http.get("http://test1-local:" + port, function(res) {

	  t.equal(res.statusCode, 200, "Should get 200 response");

	  res.on('data', function(chunk) {
		  body += chunk;
		})

		.on('end', function() {

			t.equal(body, 'test1', 'Should return test1');
			t.end();
		})

		.on('error', function(err) {
			t.notOk(err, "Request should not return error");
			console.log(err);
		});
	});

});


test("Test 2", function(t) {
	var body = '';

	http.get("http://test2-local:" + port, function(res) {

	  t.equal(res.statusCode, 200, "Should get 200 response");

	  res.on('data', function(chunk) {
		  body += chunk;
	  })

	  .on('end', function() {

		t.equal(body, 'test2', 'Should return test2');
		t.end();
	  })

	  .on('error', function(err) {
		t.notOk(err, "Request should not return error");
		console.log(err);
	  });
	});

});


test("Test 3", function(t) {
	var body = '';

	http.get("http://www.test2-local:" + port, function(res) {

	  t.equal(res.statusCode, 200, "Should get 200 response");

	  res.on('data', function(chunk) {
		  body += chunk;
	  })

	  .on('end', function() {

		t.equal(body, 'test2', 'Should return test2');
		t.end();
	  })

	  .on('error', function(err) {
		t.notOk(err, "Request should not return error");
		console.log(err);
	  });
	});

});