DROP DATABASE IF EXISTS educ_db;
CREATE DATABASE IF NOT EXISTS educ_db;

USE educ_db;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `auth_level` int(5) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

CREATE TABLE classes (
	id INT NOT NULL AUTO_INCREMENT,
	c_name VARCHAR(255) UNIQUE NOT NULL,
	PRIMARY KEY (id)
);	
	
CREATE TABLE class_belong (	
	user_id INTEGER,
	class_id INTEGER,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (class_id) REFERENCES classes(id)
	
);

CREATE TABLE comments (
	id INT NOT NULL AUTO_INCREMENT,
	comment VARCHAR(400) NOT NULL,
	user_id INTEGER,
	class_id INTEGER,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (class_id) REFERENCES classes(id),
	PRIMARY KEY (id)
);


