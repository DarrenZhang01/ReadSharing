"use strict"
// The main function that acts as the listener which will revise \
// the DOM body when needed

function loadPage () {

	$('#welcome-view').show();
	$('#comment-view').hide();
	$('#article-view').hide();

}

// When the ReadSharing button is clicked.
$('#button1').click(function () {
	$('#welcome-view').show();
	$('#comment-view').hide();
	$('#article-view').hide();
});

// When the commenting button is clicked.
$('#button2').click(function () {
	$('#welcome-view').hide();
	$('#comment-view').show();
	$('#article-view').hide();
});

// When the 'articles' button is clicked.
$('#button3').click(function () {
	$('#welcome-view').hide();
	$('#comment-view').hide();
	$('#article-view').show();
});

// 'LogIn button': To be Implemented in A3 when there is server and databse
$('#button4').click(function () {
	location.href = "./login.html";
});

// 'SignIn button': To be Implemented in A3 when there is server and databse
$('#button5').click(function () {
	location.href = "./signup.html";
});

$('#button6').click(function () {
    var curruser = getCookie("username");
    console.log(curruser);
    if(curruser != ""){
        document.cookie = "username="+curruser+"; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("after delete", document.cookie);
    }
    window.location.href = "./index.html";
});

$(document).ready(function(){
    loadPage();
    console.log("cookie when load the page:", document.cookie);

    var currcookie = checkCookie();
    if(currcookie != 0){
        console.log("have a cookie");
        $('#button5').hide();
        $('#button4').hide();
        $('#button6').show();
    }
    else{
        console.log("cookie is None");
        $('#button5').show();
        $('#button4').show();
        $('#button6').hide();
    }
});


// cookies
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function checkCookie() {
    var username = getCookie("username");
    if (username != "") {
        console.log("Welcome again " + username);
    } else {
        return 0;
    }
    return 1;
}
