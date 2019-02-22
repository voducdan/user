var mongoose = require('mongoose');

var contact = new mongoose.Schema({ name: 'string', email: 'string',password:"string",phone:'string',image:'string' },{collection:'contact'});
module.exports = mongoose.model('contact', contact);