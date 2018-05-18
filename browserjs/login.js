"use strict"

// Clicking function for BACK button
$('#signup-back').click(function () {
	location.href = "./index.html";
});

// Clicking function for SignUp button
$('#signup-submit').click(function () {
	
});

// Clicking function for LogIn button
$('#login-submit').click(function () {
	
});

function signup(){
	var username = $("#signup-un").val();
	var psw = $("#signup-psw").val();
	
	var user = {'username': username, 'password': psw};
	
	$.ajax({
		type: 'POST',
		url: '',
		data: user,
		success: function(res){
			window.location = "/index.html";
			localStorage.setItem("username", username);
		},
		error: function(err){
			alert("Error, please try again.");
		}
	})
}



