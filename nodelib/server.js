var express = require('express');
var fs = require('fs');
var app = express();

app.get('*', function (req, res){ 
	var filePath = './htdocs';
	var contentType = '';

	var params = req.url.split('/');

	if (params[1] === 'index.html') {
		params[1] === ''
	}

	console.log(params[1]);

	// check for css, js, and images so we can send the right content type
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

	console.log(filePath);
	console.log(contentType);
	
	fs.readFile(filePath, function (error, content) {
        if (error) {
            res.writeHead(500);
            res.end('Big ol\' error!');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

app.listen(8888);
console.log('Listening on 8888');