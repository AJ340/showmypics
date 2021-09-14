const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/users', {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

const Schema = mongoose.Schema;

const UserDetail = new Schema({
	username: String,
	password: String
});

UserDetail.plugin(passportLocalMongoose);

const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

module.exports = UserDetails;

 // UserDetails.register({username: 'superman', active: false}, 'kryptonite');
 // UserDetails.register({username: 'batman', active: false}, 'money');