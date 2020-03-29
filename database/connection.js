// var bcrypt = require('bcryptjs');
require('dotenv').config();
var mysql = require('mysql');

var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : process.env.PASS_DB,
   database : 'educ_db'
});

connection.connect();

module.exports = connection;