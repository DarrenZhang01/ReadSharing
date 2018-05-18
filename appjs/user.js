const express = require('express');
const router = express.Router();
//const app = express();

// mongo client


// grabe user model
var User_info = require("./db_setup.js");

router.post('/signup', function(req, res){
    // check valid input
    if(req.body.username && req.body.password){
        // find user with username in db
        User_info.findOne({username: req.body.username}, function(err, user){
            if(!user){ // username not exist in db
                var newUser = new User_info({username: req.body.username, password: req.body.password});
                console.log("newuser ready to insert: ", newUser);
                // save signup user into db
                newUser.save(function(err){
                    if(!err){
                        res.status(200).send("Username: " + req.body.username + "successfully created.");
                    } else{
                        res.status(500).send("Error. Please try again.");
                    }
                });
            } else{ // username already exist
                console.log("username already exist");
                res.status(400).send("Username: " + req.body.username + " already exist.");
            }
        });
    } else{
        res.status(400).send("Username and password can't be empty.");
    }
});

router.post('/login', function(req, res){
    // check valid input
    if(req.body.username && req.body.password){
        // get user with such username
        User_info.findOne({username: req.body.username}, function(err, finduser){
            if(!finduser){ // no such user exist
                res.status(400).send("User with username: " + req.body.username + " not found.");
            } else{ // such user exist
                // validate password
                if(finduser.password == req.body.password){
                    res.status(200).send("Valid user.");
                }
                else{
                    res.status(400).send("Wrong password.");
                }
            }
        });
    } else{
        res.status(400).send("Username and password can't be empty.");
    }
});
