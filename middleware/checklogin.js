module.exports.checkLogin = function(req,res,next){
    if(req.session.email&&req.session.password){
        next();
    }
    else {
        res.redirect('/dangnhap');
    }
}