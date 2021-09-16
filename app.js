var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var { v4: uuidv4 } = require('uuid');
var passport = require('passport');
var connectEnsureLogin = require('connect-ensure-login');
var formidable = require('formidable');
const keygen = require('keygenerator')

const User = require('./user.js');
var publicFolder = "/public";

var app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({ 
  genid: function (req) {
    return uuidv4();
  },
  secret: 'XHu=<y)N3G@gR9{9exx#i9GlJ7ij,k',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(publicFolder));

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'hbs');


// Functions
const isFileValid = (filename) => {
  const type = filename.split('.').pop();
  const validTypes = ['jpg','jpeg','bmp','gif','png']
  if (validTypes.indexOf(type) === -1) {
    return false;
  }
  return true;
}

function getFolderID(uname) {
  return User.findOne({ username: uname }, function (err, doc) {
    if (err) {
      return null;
    }
    else{
      return doc;
    }
  });
}


// GET requests
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/index.html'));
  //res.send(req.sessionID);
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/login.html'));
})

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname, '/static/register.html'));
})

app.get('/addImages', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  // Use Handlebars to generate images page
  res.sendFile(path.join(__dirname, 'addImages.html'))
})

app.get('/imgs', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  // Use Handlebars to generate images page
  // res.send("Load User images here.")
  // res.send(req.session.passport.user);
  var userImages = ['cat1.jpg'];
  //app.use()
  res.render('userImages', { userImgs: userImages });
})

app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/login');
})

// POST requests
app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), function (req, res) {
  //Insert login code here
  res.redirect('/imgs');
  // req.session.username = req.body.username;
  // res.send (`Hello ${req.session.username}. Your session ID is
  // ${req.sessionID} and your session expires in 
  // ${req.session.cookie.maxAge} milliseconds.`)
  //res.redirect('/users/' + req.user.username);
})

app.post('/register', function (req, res) {
  let uname = req.body.username;
  let pass = req.body.password;
  let userFolder = keygen._();
  const uploadFolder = publicFolder + "/" + userFolder;
  if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder, { recursive: true });
  }
  User.register({username: uname, folder: userFolder, active: false}, pass);
})

app.post('/', function (req, res) {
  console.log("Got a POST request for the homepage");
  res.send('Hello POST');
})

app.post('/addImages', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  //console.log(req.session.passport.user);
  var userFolderID = getFolderID("aj");//req.session.passport.user);
  const uploadFolder = __dirname + publicFolder + "/" + getFolderID(req.session.passport.user);
  //console.log(userFolderID);
  //console.log(uploadFolder);


  // Parse file using formidable
  const form = formidable.IncomingForm();
  form.multiples = true;
  form.maxFileSize = 50 * 1024 * 1024; // 5MB
  form.uploadDir = uploadFolder;
  form.on('fileBegin', async (field, file) => {
    file.path = form.uploadDir + "/" + file.name;
  });

  form.onPart = function (part) {
    if (isFileValid(part.filename))
      this.handlePart(part);
    else
      console.log('Incorrect file type.');
  }

  form.parse (req, async (err, fields, files) => {
    //console.log(fields);
    //console.log(files);
    if (err) {
      console.log('Error parsing the files');
      return res.status(400).json({
        status: "Fail",
        message: "There was an error parsing the files",
        error: err
      });
    }



  });



  //console.log(form);
  res.end("End of addImages post");

})

var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port

  console.log(`Example app listening at http://${host}:${port}`);
});
