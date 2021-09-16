const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
//const keygen = require('keygenerator')

mongoose.connect('mongodb://localhost/users', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

const Schema = mongoose.Schema;

const UserDetail = new Schema({
	username: {
		type: String,
		unique: true
	},
	password: String,
	folder: String
});

UserDetail.plugin(passportLocalMongoose);

const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

module.exports = UserDetails;

// UserDetails.register({username: 'superman', folder: keygen._(), active: false}, 'kryptonite');
// UserDetails.register({username: 'batman', folder: keygen._(), active: false}, 'money');