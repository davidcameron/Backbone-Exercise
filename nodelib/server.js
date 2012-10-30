// Server
var app = require('express')()
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var fs = require('fs');
var util = require('util');
var twitter = require('twitter');

var query = "poop";

server.listen(8888);

// Twitter

var twit = new twitter({
    consumer_key: 'KYHmJw6AyXlThdK0zXKJWw',
    consumer_secret: 'wJ8CzqXey7j799PP50CsOUm31MYwldLzdUh7pzpwqg',
    access_token_key: '53682349-jHZqmPp1LbsxDNbapqSuPcha0lqStE01382Ln4BVF',
    access_token_secret: 'M37NgppN2o8uVX3y1lBvQezNqD6FwvO8P4HH7Dde4o'
});


io.sockets.on('connection', function (socket) {

	// Preload with initial tweets
	twit.search(query, function (data) {
    	socket.emit('tweets', data.results);
	});	

	// Then use the streaming API so we don't run into API limits
	twit.stream('statuses/filter', {track: query}, function (stream) {
	    stream.on('data', function (data) {
	    	// Normalaize Streaming API to Search API
	    	if(data.user) {
	    		data.profile_image_url = data.user.profile_image_url;
	    		data.from_user = data.user.screen_name;
	    	}
	        socket.emit("tweets", data);
	    });
	});
	
});



app.get('*', function (req, res) {
	var filePath = './htdocs';
	var contentType = '';

	var params = req.url.split('/');
	switch (params[1]) {

		case '':
			filePath += '/index.html';
			contentType = "text/html";
			break;

		case 'css':
			filePath += req.url;
			contentType = "text/css";
			break;

		case 'js':
			filePath += req.url;
			contentType = "application/javascript";
			break;

		case 'favicon.ico':
			filePath += req.url;
			contentType = "image/x-icon";
			break;
	}

	fs.readFile(filePath, function (error, content) {
        if (error) {
            res.writeHead(501);
            res.end('Big ol\' error!');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

  	//res.sendfile('./htdocs/index.html');
});