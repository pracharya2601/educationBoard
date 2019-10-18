var express = require('express');
var app = express();
var path = require('path');
var page = [];
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser');

// for reset password

// var async = require('async');
// var nodemailer = require('nodemailer');
// var crypto = require('crypto');

//...........................................

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.set('view engine', 'ejs');
//  link to css file for ejs
app.use('/assets', express.static('assets'));


var session = require('express-session');
app.use(session({ secret: 'educationBoard', cookie: { maxAge: 1 * 1000 * 60 * 60 * 24 * 365 } }));

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

app.get('/classes', function (req, res) {
	connection.query('SELECT * FROM classes', function (error, results, fields) {
		if (error) console.log(error)
		else res.json(results);
	});
});

app.get('/comments', function (req, res) {
	connection.query('SELECT * FROM comments', function (error, results, fields) {
		if (error) console.log(error)
		else res.json(results);
	});
});



app.post('/signup', function (req, res) {
	console.log(req.body);
	bcrypt.genSalt(10, function (err, salt) {
		// res.send(salt);
		bcrypt.hash(req.body.password, salt, function (err, p_hash) {

			// res.send(p_hash);

			connection.query('INSERT INTO users (userfullname, username, password_hash, auth_level) VALUES (?,?,?,?)', [req.body.userfullname, req.body.username, p_hash, req.body.auth_level],function (error, results, fields) {

				var what_user_sees = "";
				if (error) {
					what_user_sees = 'you need to use a unique username';
					// res.send(error)
				} else {
					res.redirect('/');
				}

				res.send(what_user_sees);

			});
		});
	});
});


app.post('/login', function (req, res) {

	connection.query('SELECT * FROM users WHERE username = ?', [req.body.username], function (error, results, fields) {

		if (error) throw error;

		// res.json(results);

		if (results.length == 0) {
			res.send('try again');
		} else {
			bcrypt.compare(req.body.password, results[0].password_hash, function (err, result) {

				if (result == true) {

					req.session.user_id = results[0].id;
					req.session.username = results[0].username;
					req.session.auth_level = results[0].auth_level;
					page = [results[0].id, results[0].username];

					res.redirect('/portal');

				} else {
					res.redirect('/');
				}
			});
		}
	});
});

app.get('/validation', function (req, res) {
	var user_info = {
		user_id: req.session.user_id,
		user_name: req.session.username
	}

	res.json(user_info);
});


app.get('/classList', function (req, res) {
	connection.query('SELECT users.username, classes.c_name from users left join class_belong on users.id=class_belong.user_id  left join classes on class_belong.class_id=classes.id  where username =?', [req.session.username], function (error, class_results, fields) {
		res.json(class_results)
	})
});


app.get('/portal', function (req, res) {
	connection.query('SELECT * FROM classes LEFT JOIN class_belong ON classes.id = class_belong.class_id', function (error, class_results, fields) {
		//i think the not null of c_name is making a false value 1, Math appear when its supposed to be null
		connection.query('SELECT * FROM users LEFT JOIN comments ON users.id = comments.user_id', function (error, user_results, fields) {
			connection.query('SELECT users.username, classes.c_name from users left join class_belong on users.id=class_belong.user_id  left join classes on class_belong.class_id=classes.id  where username =?', [req.session.username], function (error, classList, fields) {
				if (error) throw error;

				res.render('teacherRender', { data: req.session, class_results, user_results, classList });

			});
		});
	});
});

app.get('/logout', function (req, res) {
	req.session.destroy(function (err) {
		res.redirect('/login.html');
	})
});

//..................................................

// app.get('/forgot', function (req, res){
// 	res.render('forgot');
// });

// app.post('/forgot', function(req, res, next) {
// 	async.waterfall([
// 		function(done) {
// 			crypto.ransdomBytes(10, function (err, buf){
// 				var token = buf.toString('hex');
// 				done(err, token);
// 			});
// 		},
// 		function(token, done) {
// 			User.findOne({email: req.body.email}, function(err, user){
// 				if(!user){
// 					req.flash('error', 'No account with that email address exists');
// 					return res.redirect('/forgot');
// 				}
// 				user.resetPasswordToken = token;
// 				user.resetPasswordExpires = Date.now() + 3600000; //one hour
// 				user.save (function(err) {
// 					done(err, token, user);
// 				});
// 			});
// 		},
// 		function(token, user, done){
// 			var smtpTransport = nodemailer.createTransport({
// 				service: 'Gmail',
// 				auth: {
// 					user: 'educationboard1001@gmail.com',
// 					pass: educationboard12345
// 				}
// 			});
// 			var mailOption = {
// 				to: user.email,
// 				from: 'educatioboard1001@gmail.com',
// 				subject: 'educatinBoard password reset',
// 				text: 'You are receiving this  because you have requested to reset your password' +
// 					'Please click the following link, or paste this to your brouser' +
// 					'http://' + req.headers.host + '/reset/' + token + '\n\n'+
// 					'If you didnt request this please ignore it'
// 			};
// 			smtpTransport.sendMail(mailOption, function(err){
// 				console.log('mail sent');
// 				req.flash('success', 'A email has been sent to ' + user.email + ' with further instruction.');
// 				done(err, 'done');
// 			});

// 		}
// 	],
// 	function(err){
// 		if(err) return next(err);
// 		res.redirect('/forgot');
// 	});
// });

//..................................................

app.post('/insertClass', function (req, res) {

	if (req.body.c_name.length > 1) {

		connection.query('SELECT * FROM classes WHERE c_name = ?', [req.body.c_name], function (error, results, fields) {

			if (error) throw error;

			if (results.length == 1) {
				res.redirect('/portal'); //Class already exists
			} else {
				connection.query('INSERT INTO classes (c_name) VALUES (?)', [req.body.c_name], function (error, results, fields) {
					if (error) res.send(error);
					res.redirect('/portal');
				})
			}

		});
	}
});

app.post('/msgBoard', function (req, res) {
	if (req.body.clist) {
		req.session.clist = req.body.clist;
	}
	connection.query('Select users.username, classes.c_name, comments.comment from comments left join users on comments.user_id=users.id left join classes on comments.class_id=classes.id where c_name=?', [req.session.clist], function (error, classMessages, fields) {
		connection.query('SELECT * FROM classes LEFT JOIN class_belong ON classes.id = class_belong.class_id', function (error, class_results, fields) {
			connection.query('SELECT * FROM users LEFT JOIN comments ON users.id = comments.user_id', function (error, user_results, fields) {
				connection.query('SELECT users.username, classes.c_name from users left join class_belong on users.id=class_belong.user_id  left join classes on class_belong.class_id=classes.id  where username =?', [req.session.username], function (error, classList, fields) {
					if (error) throw error;

					res.render('messageRender', { data: req.session, class_results, user_results, classList, classMessages });
				});
			});
		});
	});
});


app.post('/roster', function (req, res) {


	connection.query('Select classes.c_name, users.username from classes left join class_belong on classes.id=class_belong.class_id left join users on class_belong.user_id=users.id where c_name=?', [req.body.attendance], function (error, class_roster, fields) {
		connection.query('SELECT * FROM classes LEFT JOIN class_belong ON classes.id = class_belong.class_id', function (error, class_results, fields) {

			connection.query('SELECT * FROM users LEFT JOIN comments ON users.id = comments.user_id', function (error, user_results, fields) {
				connection.query('SELECT users.username, classes.c_name from users left join class_belong on users.id=class_belong.user_id  left join classes on class_belong.class_id=classes.id  where username =?', [req.session.username], function (error, classList, fields) {
					if (error) throw error;

					res.render('cheatRender', { data: req.session, class_results, user_results, classList, class_roster });

				});
			});
		});
	});
});


app.get('/checkClass', function (req, res) {
	connection.query('SELECT c_name FROM classes', function (error, results, fields) {
		if (error) console.log(error)
		else res.render('info', {
			data: results,
		});
	});
});

app.post('/messagePost', function (req, res) {

	connection.query('select users.id from users where username=?', [req.session.username], function (error, uid, fields) {
		connection.query('select classes.id from classes where c_name=?', [req.session.clist], function (error, cid, fields) {
			connection.query('INSERT INTO comments (comment, user_id, class_id) VALUES (?, ?, ?)', [req.body.comment, uid[0].id, cid[0].id], function (error, results, fields) {

				if (error) res.send(error);

				res.redirect('/portal'); //ideally should go to msgBoard but wasnt working

			});
		});
	});
});



app.post('/getNameClassId', function (req, res) {
	connection.query('SELECT * FROM classes LEFT JOIN class_belong ON classes.id = class_belong.class_id WHERE c_name = ?', [req.body.c_name], function (error, class_results, fields) {
		connection.query('SELECT * FROM users WHERE username = ?', [req.body.student_class], function (error, user_results, fields) {

			connection.query('INSERT INTO class_belong (user_id, class_id) VALUES (?, ?)', [user_results[0].id, class_results[0].id], function (error, results, fields) {
				if (error) res.send(error);
				res.redirect('/portal');
			})
		});
	});
});



app.listen(3000, function () {
	console.log('listening on 3000');
});