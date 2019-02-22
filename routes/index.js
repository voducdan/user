var express = require('express');
var router = express.Router();
var ObjectID = require('mongodb').ObjectID;
var contact = require('../model/contact.js');
var checkLogin = require('../middleware/checklogin.js')
var multer  = require('multer');
var bcrypt = require('bcrypt-nodejs');
var session = require('express-session');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
})

var upload = multer({ storage: storage });
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/xem',checkLogin.checkLogin,function(req,res,next){
  console.log(req.session);
  contact.find(function(err,data){
    res.render('xem',{users:data, email : req.session.email, password:req.session.password});
  }); 
});
router.get('/them',function(req,res,next){
  res.render('them');
});
router.post('/them',function(req,res,next){
  var user = {
    _id:new ObjectID(),
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone
  };
  var newUser = new contact(user);
  newUser.save(err=>{
    if(err) console.log(err);
  });
  res.redirect('/xem');
});

router.get('/xoa/:userId',function(req,res,next){
  var userId = ObjectID(req.params.userId);
  contact.find({_id:userId}).remove(function(){
    res.redirect('/xem');
  });
});
router.get('/sua/:userId',function(req,res,next){
  var userId = ObjectID(req.params.userId);
  var user = contact.find({_id:userId},function(err,user){
    if(err) {
      console.log(err);
    }
    else {
      res.render('sua',{user:user});
    }
  });
});
router.post('/sua/:userId',function(req,res,next){
  var userId = ObjectID(req.params.userId);
  var editedUser = {
    _id:userId,
    name:req.body.name,
    email:req.body.email,
    phone:req.body.phone
  };
  contact.findOneAndUpdate({_id:userId}, editedUser, function(err){
    if(err){
      console.log(err);
    }
    res.redirect('/xem');
  }) // executes
});
router.post('/avatar/:userId', upload.single('avatar'), function (req, res, next) {
  var userId = ObjectID(req.params.userId);
  var filePath = req.file.path.split('\\').slice(1).join('/');
  contact.findOneAndUpdate({_id:userId}, {$set:{image:filePath}}, function(err,user){
    res.redirect('/xem');
  }); // executes
});
router.get('/dangky',function(req,res,next){
  res.render('dangki');
});
router.post('/dangky',function(req,res,next){
  bcrypt.hash(req.body.password, null, null, function(err, hash) {
    var user = {
      name:req.body.name,
      email:req.body.email,
      password:hash
    };
    var newUser = new contact(user);
    newUser.save(err=>{
      if(err) console.log(err);
    });
  });
  res.redirect('/dangnhap');
});
router.get('/dangnhap',function(req,res,next){
  res.render('dangnhap',{err:undefined});
});
router.post('/dangnhap',function(req,res,next){
  contact.find({email:req.body.email},function(err,user){
    if(err){
      console.log(err);
    }
    else {
      if(user[0]){
        bcrypt.compare(req.body.password, user[0].password, function(err, result) {
          if(result===true) {
            if(!req.session.password && !req.session.email){
              req.session.password = user[0].password;
              req.session.email = user[0].email;
            }
            res.redirect('xem');
          }
          else res.render('dangnhap',{err:'Sai mật khẩu'})
        });
      }
      else res.render('dangnhap',{err:'Không tìm thấy tài khoản'})
    }
    
  });
});
router.get('/dangxuat',function(req,res,next){
  req.session.destroy(function(err){
    if(err) console.log(err);
  });
  res.redirect('/dangnhap');
});

module.exports = router;
