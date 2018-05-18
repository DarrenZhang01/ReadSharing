"use strict"

$('#signup-back').click(function () {
    window.location.href = "http://www.darrenzhang.com/assignment-3-superstar/index.html";
//    window.location.href = "./index.html";
});

$('#signup-submit').click(signup);
$('#login-submit').click(login);

function signup(){
    var username = $("#signup-un").val();
    var password = $("#signup-psw").val();
    alert("username: " + username);
    alert("password: " + password);

    var user = JSON.stringify("{'username': username, 'password': password}");

    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://www.darrenzhang.com:8080/assignment-3-superstar/signup/',
//        url: '/signup',
        data: user,
        success: function(res){
            setCookie("username", username, 100);
//            window.location.href = "http://www.darrenzhang.com/assignment-3-superstar/index.html";
            window.location.href = "./index.html";
        },
        error: function(err){
            alert("Error, please try again.");
        }
    })
}

function login(){
    var username = $("#login-un").val();
    var password = $("#login-psw").val();

    var user = {"username": username, "password": password};

    $.ajax({
        type: 'POST',
        url: 'http://www.darrenzhang.com:8080/assignment-3-superstar/login/',
//        url: '/login',
        data: user,
        success: function(res){
            setCookie("username", username, 100);
            window.location.href = "http://www.darrenzhang.com/assignment-3-superstar/index.html";
//            window.location.href = "./index.html";
        },
        error: function(err){
            alert("Error, please try again.");
        }
    })
}


function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
