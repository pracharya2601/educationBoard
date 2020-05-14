// var bcrypt = require('bcryptjs');
// var mysql = require('mysql');

// var connection = mysql.createConnection({
//    host     : 'localhost',
//    user     : 'root',
//    password : 'password',
//    database : 'test'
// });

// connection.connect();
var connection = require('../database/connection');

exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var users={
         "username": req.body.username,
         "password": req.body.password,
         "first_name": req.body.first_name,
         "last_name": req.body.last_name,
         "auth_level": req.body.auth_level,
      }
      connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
         if (error) {
            console.log("error ocurred",error);
            res.send({
               "code":400,
               "failed":"error ocurred"
            })
         }else{
            message = "Succesfully! Your account has been created. Go to login page.";
            res.render('signup.ejs',{message: message});
         }
      });
   } else {
      res.render('signup');
   }
}
 
//-----------------------------------------------login page call------------------------------------------------------
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.username;
      var pass= post.password;
     
      var sql="SELECT id, first_name, last_name, username, auth_level FROM `users` WHERE `username`='"+name+"' and password = '"+pass+"'";                           
      connection.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            req.session.auth_level = results[0].auth_level;
            console.log(results[0].id);
            console.log(results[0].auth_level);
            if(results[0].auth_level === 2) {
               res.redirect('/home/profile');
            } else {
               res.redirect('/home/dashboard');
            }
         }
         else{
            message = 'Wrong Credentials.';
            res.render('login.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('login.ejs',{message: message});
   }
           
};
        
//------------------------------------logout functionality----------------------------------------------
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/login");
   })
};
//--------------------------------render user details after login--------------------------------
exports.profile = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }

   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   connection.query(sql, function(err, result){  
      res.render('profile.ejs',{data:result});
   });
};

exports.dashboard = function(req, res, next){     
   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/login");
      return;
   }        
   var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";          
   connection.query(sql, function(err, result){  
      res.render('dashboard.ejs',{data:result});
   });
};

// //---------------------------------edit users details after login----------------------------------
// exports.editprofile=function(req,res){
//    var userId = req.session.userId;
//    if(userId == null){
//       res.redirect("/login");
//       return;
//    }

//    var sql="SELECT * FROM `users` WHERE `id`='"+userId+"'";
//    connection.query(sql, function(err, results){
//       res.render('edit_profile.ejs',{data:results});
//    });
// };
