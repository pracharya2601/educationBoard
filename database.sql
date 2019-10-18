DROP DATABASE IF EXISTS educ_db;

CREATE DATABASE IF NOT EXISTS educ_db;

USE educ_db;

CREATE TABLE users ( 
	id INT NOT NULL AUTO_INCREMENT,
	userfullname VARCHAR(255) NOT NULL,
	username VARCHAR(255) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	auth_level INT NOT NULL,
	PRIMARY KEY (id)
);

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

