var express = require('express');
var app = express();
var http = require('http');

app.use('/game/war', express.static(__dirname + '/../'));

//主服务器

//app.enable('trust proxy');
//
//
//app.use(evh.vhost());
//
////evh.register('page.com', page);
//evh.register('g.alicdn.com', app);


var httpServer = http.createServer(app);
//var httpsServer = https.createServer(credentials, app);

httpServer.listen(80, function () {
    console.log('Listening on port %d', 80);
});

//httpsServer.listen(443, function () {
//    console.log('Listening on port %d', 443);
//});
