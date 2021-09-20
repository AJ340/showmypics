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
var publicFolder = "public";

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

async function getFolderID(uname) {
  try {
    console.log("In getFolderID.")
    var result =  await User.findOne({ username: uname }).exec();
    return result.folder;
  } catch (error) {
    console.log("Error caught in getFolderID.");
    return undefined;
  }
}

function getPicsFromFolder(folder) {
  var pics = [];
  fs.readdir(__dirname+"/"+publicFolder+folder, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach( function (file) {
      pics.push({ link:folder+"/"+file, filename:file });
    })
  });
  return pics;
}


// GET requests
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "/" + publicFolder +'/static/index.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, "/" + publicFolder + '/static/login.html'));
})

app.get('/register', function (req, res) {
  res.sendFile(path.join(__dirname, "/" + publicFolder + '/static/register.html'));
})

app.get('/addImages', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  // Use Handlebars to generate images page
  res.sendFile(path.join(__dirname, 'addImages.html'))
})

app.get('/imgs', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  var userImages = getPicsFromFolder("/"+req.session.folderID);
  res.render('userImages', { userImgs: userImages });
})

app.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/');
})

// POST requests
app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), async function (req, res) {
  req.session.folderID = await getFolderID(req.session.passport.user);
  res.redirect('/imgs');
})

app.post('/register', function (req, res) {
  let uname = req.body.username;
  let pass = req.body.password;
  let userFolder = keygen._();
  const uploadFolder = __dirname + "/" + publicFolder + "/" + userFolder;
  User.register({username: uname, folder: userFolder, active: false}, pass);
  if (!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder, { recursive: true });
  }
  res.redirect("/login");
})

app.post('/', function (req, res) {
  console.log("Got a POST request for the homepage");
  res.send('Hello POST');
})

app.post('/addImages', connectEnsureLogin.ensureLoggedIn(), function(req, res) {
  var userFolderID = req.session.folderID;
  const uploadFolder = __dirname + "/" + publicFolder + "/" + userFolderID;

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
    if (err) {
      console.log('Error parsing the files');
      return res.status(400).json({
        status: "Fail",
        message: "There was an error parsing the files",
        error: err
      });
    }
  });
 res.redirect("/imgs");
})

app.all('*', function (req, res) {
  res.redirect("/");
});

var server = app.listen(3000, function() {
  var host = server.address().address
  var port = server.address().port

  console.log(`Example app listening at http://${host}:${port}`);
});
