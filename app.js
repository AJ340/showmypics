var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', function (req, res) {
  console.log("Got a POST request for the homepage");
  res.send('Hello POST');
})

app.get('/addImages', function(req, res) {
  // Use Handlebars to generate images page
  res.sendFile(path.join(__dirname, 'addImages.html'))
})

app.get('/imgs', function(req, res) {
  // Use Handlebars to generate images page
  res.send("Load User images here.")
})


var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
});
