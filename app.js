var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({extended:false}));


// GET requests
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/login.html'));
})

app.get('/addImages', function(req, res) {
  // Use Handlebars to generate images page
  res.sendFile(path.join(__dirname, 'addImages.html'))
})

app.get('/imgs', function(req, res) {
  // Use Handlebars to generate images page
  res.send("Load User images here.")
})


// POST requests
app.post('/login', function (req, res) {
  //Insert login code here
  let username = req.body.username;
  let password = req.body.password;
  res.send(`Username: ${username} Password: ${password}`);
  //res.redirect('/users/' + req.user.username);
})

app.post('/', function (req, res) {
  console.log("Got a POST request for the homepage");
  res.send('Hello POST');
})



var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port

  console.log(`Example app listening at http://${host}:${port}`);
});
