"use strict"

/*
 * This nodeJS file is for listening events from the client browser
 * and act as the bridge for transforming resources between the clients
 * and the third-party API
 */

let express = require("express");
let app = new express();

let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost/readsharing";

// define user collections
let userCollection = "superstar-user";
let bookCollection = "superstar-book";
let commentCollection = "superstar-comment";
let articleCollection = "superstar-article";

app.listen(8080);


/* Access Allow Control Origin (CORS) Set Up */
app.use(function (req, res, next) {

	res.setHeader('Access-Control-Allow-Origin', 'http://www.darrenzhang.com');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Headers',
		"Origin, X-Requested-With, Content-Type, Accept");

	next();
});


/* --------- Database operation Interface --------- */

/* --------- CRUD interfaces for User --------- */
// a function add {username: name, password: pwd} into userCollection
// if success return 0
function addUser(name, pwd) {
    return new Promise((resolve, reject) =>{
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              console.log(err);
              reject(err);
            }
            var dbase = db.db("readsharing");
            // insert user with name and pwd into userCollection
            dbase.collection(userCollection).insertOne({username: name, password: pwd}, function(err, res){
                if(err){
                  reject(err);
                }
                // on success return 0
                var jsonRes = JSON.parse(res);
                if(jsonRes.ok == 1){
                    resolve(0);
                }
                else{
                    reject(res);
                }
                // close the database
                db.close();
                return
            });
        });
    });
}

// a function search for {username: name} in userCollection
// if success return the result
function findUser(name, pwd) {
    return new Promise((resolve, reject) =>{
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // find user with username:name in collection
            dbase.collection(userCollection).find({username: name}).toArray(function(err, results){
                resolve(results);
                // close the database
                db.close();
                return
            });
        });
    });
}

// a function for perform the signup operation
// check if user such user already exist and add new user
// will return 0 is successfully sign up, 1 if not
function processSignup(username, password){
    return new Promise((resolve, reject) => {
        //check if username is in use
        findUser(username)
        .then(result => {
            if (result.length > 0) { // already in use, can't sign up
                resolve(1);
            } else if (result.length == 0) { // not in use
                // add to database
                addUser(username, password)
                .then(addres => {
                    if(addres == 0){
                        resolve(0);
                    }
                    else{
                        resolve(1);
                    }
                })
                .catch(err => {
                    reject(err);
                })
            }
        })
        .catch(err =>{
            reject(err);
        })
    });
}

// a function check if user with username:name has password pwd
// will return 0 if user and pwd is verified, 1 if not
function checkUser(name, pwd){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // find instance in userCollection with username:name and password:pwd
            dbase.collection(userCollection)
                .find({username: name, password: pwd}).toArray(function(err, findUser){
                // if such user is find, the password is valid
                if(findUser.length >= 1){
                    db.close();
                    resolve(0);
                }
                // otherwise, the password is wrong
                else{
                    db.close();
                    resolve(1);
                }
            })
        });
    });
}

/* --------- CRUD interface for Book --------- */
// return isbn if successfully insert into bookCollection, 1 if not
// will not process isbn already in database
function processISBN(isbn){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // check if isbn already in bookCollection
            checkISBN(isbn)
            .then(checkres =>{
                // if not in, add it to bookCollection
                if(checkres == 0){
                    dbase.collection(bookCollection).insertOne({ISBN: isbn}, function(err, res){
                    if(err){
                      reject(err);
                    }
                    var jsonRes = JSON.parse(res);
                    if(jsonRes.ok == 1){
                        resolve(isbn);
                    }
                    else{
                        reject(res);
                    }
                    db.close();
                    return
                    });
                }
                // if already exist, we do not add it again
                else{
                    db.close();
                    resolve(1);
                }
            })
        });
    });
}

// a function check if isbn already exist in bookCollection
// return 1 if already in database, 0 if not
function checkISBN(isbn){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              console.log(err);
              reject(err);
            }
            var dbase = db.db("readsharing");
            // find instance with ISBN:isbn to determine if such instance exist
            dbase.collection(bookCollection)
                .find({ISBN: isbn}).toArray(function(err, results) {
                if(err){
                  reject(err);
                }
                // found more than 1 instance match, already exist
                if(results.length >= 1){
                    db.close();
                    resolve(1);
                }
                else{
                    db.close();
                    resolve(0);
                }
            });
        });
    });
}

/* --------- CRUD interfaces for Comment --------- */
// return a list of comment id's of this isbn
function getCommentsId(isbn) {
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // find instance with ISBN:isbn
            dbase.collection(bookCollection).findOne({ISBN: isbn}, function(err, book){
                if(err){
                    db.close();
                    reject(err);
                }
				resolve(book.comments);
                db.close();
            });
        });
    });
}

// input a comment id string, return it's comment content
function getCommentContent(cID){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // convert string id into database object id
            var id = require('mongodb').ObjectID(cID);
            // find instance with such id
            dbase.collection(commentCollection).findOne({_id: id}, function(err, res){
                if(err){
                    db.close();
                    reject(err);
                }
				resolve(res.content);
                db.close();
            });
        });
    });
}

// a function add a new comment into commentCollection
// return 0 if successfully add the comment
function addComment(isbn, uName, cContent) {
    return new Promise((resolve, reject) =>{
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // insert such comment into commentCollection
            dbase.collection(commentCollection)
                .insertOne({content: cContent, creator: uName}, function(err, res){
                if(err){
                    db.close();
                    reject(err);
                }
                // add this comment's id into this book's comment list
                addCommentBook(isbn, res.insertedId)
                .then(addres =>{
                    resolve(0);
                })
                db.close();
                return
            });
        });
    });
}

// a function that add strCId into book isbn's comment list
function addCommentBook(isbn, strCId){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // convert string id into database id
            var id = require('mongodb').ObjectID(strCId);
            // update this instance's comments list
            dbase.collection(bookCollection).update({ISBN: isbn}, {$push: {comments: id}});
            db.close();
            resolve(0);
        });
    });
}

// a function that update comment of strCId with new content newContent
// return 0 if successfully update the content
function updateComment(strCId, newContent) {
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // convert string id into database id
            var id = require('mongodb').ObjectID(strCId);
            // find such instance and update its content
            dbase.collection(commentCollection)
                .update({_id: id}, {content: newContent}, function(err, res){
                if(err){
                    db.close();
                    reject(err);
                }
                else{
                    db.close();
                    resolve(0);
                }
            });
        });
    });
}

// a function that delete comment of strCId, and removed from its book's comments list
// return 0 if successfully delete the comment and the info related to isbn
function deleteComment(isbn, strCId) {
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // convert string id into database id
            var id = require('mongodb').ObjectID(strCId);
            // remove instance with this id
            dbase.collection(commentCollection)
                .remove({_id: id}, function(err, res){
                if(err){
                    db.close();
                    reject(err);
                }
                // if successfully delete in commentCollection
                // delete this id in it's book's comments list
                var jsonRes = JSON.parse(res);
                if(jsonRes.ok == 1){
                    delCommentBook(isbn, strCId)
                    .then( delres =>{
                        if(delres == 0){
                            resolve(0);
                        }
                        else{
                            resolve(1);
                        }
                    })
                }
                else{
                    reject(res);
                }
                db.close();
                return
            });
        });
    });
}

// a function that delete strCId in book isbn's comments list
// on success return 0
function delCommentBook(isbn, strCId){
    return new Promise((resolve, reject) => {
        // connect to database
        MongoClient.connect(url, function(err,db){
            if(err){
              reject(err);
            }
            var dbase = db.db("readsharing");
            // convert string id into database id
            var id = require('mongodb').ObjectID(strCId);
            // update the isbn's comments list without id
            dbase.collection(bookCollection).update({ISBN: isbn}, {$pull: {comments: id}});
            db.close();
            resolve(0);
        });
    });
}


function test(name, pwd){
    processSignup(name, pwd)
    .then(res =>{
        console.log(res, " success");
    })
    .catch(err => {
        console.log("error!");
    })
}
test("abcde", "12345");

/* ------------------------------------------------------------ */
/* --------------- server part of the project ----------------- */
/* ------------------------------------------------------------ */

/* SignUp request from the client browser */
app.post('/assignment-3-superstar/signup/', function (req, res, next) {
    // seperate pass in data req
    var username = (JSON.parse(req.body)).username;
    var password = (JSON.parse(req.body)).password;
	console.log(username);
	console.log(password);

    // if input is valid, signup
    if(username && password){
        processSignup(username, password)
        .then(result =>{
            if(result == 0){
                console.log("successfully sign up");
                res.send(200);
            }
            else{
                console.log("User already exist");
                res.send(400);
            }
        })
        .catch(err =>{
            console.log("Error");
            res.send(500);
        })
    }
    // invalid input
    else{
        console.log("Input can't be empty");
        res.send(404);
    }
});

/* Login request from the client browser */
app.post('/assignment-3-superstar/login/', function (req, res, next) {
    // seperate pass in data req
    var username = req.body.username;
    var password = req.body.password;

    // if input is valid, check if password valid
    if(username && password){
        checkUser(username, password)
        .then(result =>{
            if(result == 0){
                console.log("successfully log in");
                res.send(200);
            }
            else{
                console.log("wrong password or username");
                res.send(400);
            }
        })
        .catch(err =>{
            console.log("Error");
            res.send(500);
        })
    }
    // invalid input
    else{
        console.log("Input can't be empty");
        res.send(500);
    }
});

/* Get the ISBN search comment request from the client browser */
/* for router '/ISBN/comment/*':
 * It is related to !!!('#search1').click!!! function in comment.js
 * 1. The server part (here) will get the isbn (string) of the book throught req
 * 2. The server will use the isbn to send ajax request to the open library api
 * 3. If it is a valid isbn and successfully get information from the api,
 *    (author, title, cover, description), the server (here) will call the
 *    function of database to acquire the according comments of the book
 * 4. The server will send back a json object containing the above information
 *    to the client side (browser)                                           */
app.get('/ISBN/comment/', function (req, res, next) {
	/* Extract the information in request */
	var isbn = req.data;
	let request = isbn + "-L.jpg";
	let cover_url = "https://covers.openlibrary.org/b/isbn/" + request;
	let info_url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + isbn +
	"&jscmd=details&format=json";
	let title, photo, description, author;
	let success = true;
	// The comments will be an array
	let comments = [];

	/* Send Ajax request to the open library API */
	// ajax request to get the cover
	$.ajax({
		type: 'GET',
		crossDomain: true,
		url: cover_url,
		success: function (data) {
			photo = data;
		},
		error: function () {
			success = false;
		}
	});
	// ajax request to get the author and description
	$.ajax({
		type: 'GET',
		crossDomain: true,
		url: info_url,
		success: function (data) {
			description = data["ISBN:" + isbn]["details"]["description"];
			author = data["ISBN:" + isbn]["details"]["authors"][0]["name"];
		},
		error: function () {
			success = false;
		}
	});

    processISBN(isbn)
        .then(result =>{
            if(result != 0){
                comments = result;
            }
            else{
                success = false;
            }
        })
        .catch(err =>{
            success = false;
        })

	/* Make the response and send the necessary information back to the
	   browser */
	if (success == true) {
		res.send({
			"photo": photo,
			"description": description,
			"author": author,
			"comments": comments
		});
	} else {
		res.send(500);
	}
});
/* Get the ISBN search article request from the client browser */
app.get('/ISBN/article/', function (req, res, next) {

	/* Extract the information in request */
	var isbn = req.path;
	let request = isbn + "-M.jpg";
	let cover_url = "https://covers.openlibrary.org/b/isbn/" + request;
	let info_url = "https://openlibrary.org/api/books?bibkeys=ISBN:" + isbn +
	"&jscmd=details&format=json";
	let photo;
	let description;
	let title;
	let success = true;
	let articles;

	/* Send Ajax request to the open library API */
	// ajax request to get the cover
	$.ajax({
		type: 'GET',
		crossDomain: true,
		url: cover_url,
		success: function (data) {
			photo = data;
		},
		error: function () {
			success = false;
		}
	});
	// ajax request to get the author and description
	$.ajax({
		type: 'GET',
		crossDomain: true,
		url: info_url,
		success: function (data) {
			description = data["ISBN:" + isbn]["details"]["description"];
			author = data["ISBN:" + isbn]["details"]["authors"][0]["name"];
		},
		error: function () {
			success = false;
		}
	});

    processISBN(isbn)
        .then(result =>{
            if(result != 0){
                articles = result;
            }
            else{
                success = false;
            }
        })
        .catch(err =>{
            success = false;
        })

	/* Make the response and send the necessary information back to the client */
	if (success == true) {
		res.send({
			"photo": photo,
			"description": description,
			"author": author,
			"articles": articles
		});
	} else {
		res.send(500);
	}
});

/* Get the Edit-Comment request from the client browser */
app.put('/EDIT/comment/', function (req, res, next) {

	let id = req.body.id;
	let new_content = req.body.content;

    updateComment(id, new_content)
    .then(result => {
        if(result == 0){
            res.send(200);
        }
        else{
            res.send(400);
        }
    })
    .catch(err =>{
        res.send(500);
    })
});
/* Get the Delete-Comment/ request from the client browser */
app.delete('/DELETE/comment/', function (req, res, next) {
	let id = req.body.id;
    let isbn = req.body.isbn;

    deleteComment(isbn, id)
    .then(result => {
        if(result == 0){
            res.send(200);
        }
        else{
            res.send(400);
        }
    })
    .catch(err =>{
        res.send(500);
    })
});
/* Get the Create-Comment request from the client browser*/
app.post('/CREATE/comment/', function (req, res, next) {
	let isbn = req.body.isbn;
    let userN = req.body.username;
	let content = req.body.content;

    addComment(isbn, userN, content)
    .then(result =>{
        if(result == 0){
            res.send(200);
        }
        else{
            res.send(400);
        }
    })
	.catch(err=>{
        res.send(500);
    })
});
