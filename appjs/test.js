"use strict"

var express = require("express");
var app = new express();
var mongoose = require('mongoose');
const database = mongoose.connect('mongodb://localhost/readsharing');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;


var userSchema = new Schema({
	userName: {
        type: String,
        unique: true,
        required: true,
    },
	password: {
        type: String,
        required: true,
    }
});

var User = mongoose.model('User', userSchema);

//
// var commentSchema = new Schema({
// 	commentId: new ObjectId(),
// 	content: {
// 		type: String,
// 		required: true
// 	},
// 	creator: {
// 		type: String,
// 		required: true
// 	},
// 	createdAt: {
// 		type: Date,
// 		default: Date.now
// 	}
// });
//
// var Comment = mongoose.model('Comment', commentSchema);


var articleSchema = new Schema({
	// articleId: new ObjectId(),
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	creator: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});


var Article = mongoose.model('Article', articleSchema);


var bookSchema = new Schema({
	ISBN: {
		type: String,
        unique: true,
        required: true
    },
	// comments: {
	// 	type: [ObjectId],
	// 	default: []
	// },
	// articles: {
	// 	type: [ObjectId],
	// 	default: []
	// }
});

var Book = mongoose.model('Book', bookSchema);



function addUser(name, pwd) {

	User.create({userName: name, password: pwd}, doneCallBack);

	function doneCallBack(err, newUser) {
		if (err) {
			return [1, 'Adding User Failed'];
		} else {
			console.log('New User Added:', newUser.userName);
			return [0, 'New User Added: ' + newUser.userName];
		}
	}
}


function checkUserValidation(name, pwd) {

	User.findOne({userName: name, password: pwd}, 'userName',

		function (err, usr) {
			if (err) {
				console.log('Validation Failed For:', usr.userName);
				return [1, 'Validation Failed For: ' + usr.userName];
			} else {
				console.log('Validation Succeeded For:', usr.userName);
				return [0, 'Validation Succeeded For: ' + usr.userName];
			}
	})
}
