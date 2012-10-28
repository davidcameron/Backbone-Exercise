var express = require('express');
var fs = require('fs');
var app = express();

app.get("*", function (req, res){ 

	if (req.url === "/") {
		filePath = "./htdocs/index.html";
	} else {
		var filePath = "./htdocs" + req.url;	
	}
	
	console.log(filePath);
	
	fs.readFile(filePath, function(error, content) {
        if (error) {
            res.writeHead(500);
            res.end("Big ol' error!");
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        }
    });
});

app.listen(8888);
console.log("Listening on 8888");