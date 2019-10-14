var express = require('express');
var app = express();
var path = require('path');
// var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

var session = require('express-session');
app.use(session({ secret: 'educationBoard', cookie: { maxAge: 1*1000*60*60*24*365 }}));

app.use(cookieParser());

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'educ_db'
});

connection.connect();

app.get('/education/users', function (req, res) {
    connection.query('SELECT * FROM users', function (error, results, fields) {
        if (error) console.log(error)
        else res.json(results);
    });
});


app.post('/signup', function(req, res){
    console.log(req.body);
	bcrypt.genSalt(10, function(err, salt) {
	    // res.send(salt);
	    bcrypt.hash(req.body.password, salt, function(err, p_hash) { 

	    	// res.send(p_hash);

	    	connection.query('INSERT INTO users (username, password_hash, auth_level) VALUES (?,?,?)', [req.body.username, p_hash, req.body.auth_level],function (error, results, fields) {
	    	  
	    	  var what_user_sees = "";
	    	  if (error){
	    	  	what_user_sees = 'you need to use a unique username';
	    	  	// res.send(error)
	    	  }else{
	    	  	what_user_sees = 'you have signed up - please go login at the login route';
	    	  }

	    	  res.send(what_user_sees);
	    	  
	    	});
	    });
	});
});


app.post('/login', function(req, res){

	connection.query('SELECT * FROM users WHERE username = ?', [req.body.username],function (error, results, fields) {

	  if (error) throw error;

	  // res.json(results);
	  
	  if (results.length == 0){
	  	res.send('try again');
	  }else {
	  	bcrypt.compare(req.body.password, results[0].password_hash, function(err, result) {
	  	    
	  	    if (result == true){

	  	      req.session.user_id = results[0].id;
	  	      req.session.username = results[0].username;

	  	      res.send('you are logged in');

	  	    }else{
	  	      res.redirect('/');
	  	    }
	  	});
	  }
	});
});


app.get('/parent', function(req, res){
    console.log(req.session);

    res.send('this is parent page');
});


app.get('/teacher', function(req, res){
    res.send('this is teaacher page');
});

app.get('/logout', function(req, res){
	req.session.destroy(function(err){
		res.send('you are logged out');
	})
});

app.listen(3000, function () {
    console.log('listening on 3000');
});