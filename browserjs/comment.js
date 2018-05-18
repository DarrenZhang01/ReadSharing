"use strict"
// This script file is for loading the comments


// helper function for reducing the redundant code.
function appendComment(content) {
    var $outer = $('<li id="comment-listing" class="comment-content"></li>');
    var $inner = $('<div><p id="comment" class="comment-text"></p></div>');

    // edit and delete style
    var $edit = $('<div><a style="float: right; font-size: 15px; " id="EDIT">[EDIT]</a><a style="float: right; font-size: 15px; " id="DELETE">[DELETE]</a></div>');

    $inner.text(content.toString());
    $outer.append($inner);
    $outer.append($edit);
    $("#comment-parent").append($outer);
}

// Loading Sample Comments
function commentLoading () {
    console.log(document.cookie);
//    for (var i = 0; i < 10; i++) {
      var input = "This is a sample comment. We are giving samples using jQuery, not hardcoding!!!";
      appendComment(input);
//    }
    var temp = $('#comment').html();
    console.log(temp);
//    editDelComment();
//    console.log(document.cookie);
//    for (var i = 0; i < 10; i++) {
//      var input = "This is a sample comment. ";
//      appendComment(input);
//    }
//    editDelComment();

}

// $(document).ready(commentLoading);


/* full cookie of the form ("username":aaa; "editComment": edit1; "delComment": del1; "isbn": 12345;) */
/* Set a new attribute in cookie, with atrribute name cname
   that has the value cvalue, and this cookie will expire in exdays */
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/* Get the value of attribute cname in cookie */
function getCookie(cname) {
    // name is the attribute we search
    var name = cname + "=";
    // seperate cookie into list of atrribute=value pairs
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    // loop through each pair
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        // delete the leading empty space
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        // if attribute name is what we search, return the paired value
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}



/* -------- Interacting with user and the server --------- */

/* The "GET" http request!
*
* When the search button is clicked, the following will be done:
*
* 1. Send the ajax request with the ISBN to the server
* 2. The server gets the ISBN and send ajax request to the open library api
*    to get the cover and description of a particular book
* 3. If it is validated that this is a valid ISBN by step2, the server will
*    get the necessary information and ask for comments of this book from
*    the database
* 4. The server sends back the information of the book and the Comments
* 5. The client side (here) will get the information and then use these
*    information to operate the DOM tree in order to update the view
*
* !!!Note: Step 1 and Step 5 will be done here in the following click function
*/
$('#search1').click (function () {

	/* Get the user input from the search area */
	var isbn = $('#input-title1').val();
	/* Validate at the browser side to determine whether the input is empty */
	if (isbn == null || isbn == '') {
		alert("invalid input!");
		return;
	}

    // Store searched isbn in cookie
    setCookie("isbn", isbn, 100);

	let url_ = "http://www.darrenzhang.com:8080/assignment-3-superstar/ISBN/comment/";
    let request = isbn + "-L.jpg";
	let cover_url = "https://covers.openlibrary.org/b/isbn/" + request;
	$('#cover1').attr("src", cover_url);

    $('#comment-listing').remove();
});



/* the "POST" http request!
*
* When the comment "submit" button is clicked, the following will be done:
*
* 1. To validate at the browser end that the input title and content is both
*    not empty
* 2. Send the ajax request to the server of the newly added title and content
* 3. The server gets the information and add them into the database under
*    this particular book and send back the successful status
* 4. The browser end (here) is notified and then append into the DOM tree
*    and tell the user at the same time
*
* !!!Note: Step 1 and Step 4 will be done here in the following click function
*/
$('#comment-button').click(function () {
    var input = $('#input-content').val();
    if (input == null || input == '') {
        alert("invalid input!");
        return;
    }
    appendComment(input);
    $('#input-content').val(null);
});


// TODO: Judge which DOM node is gonna be revised, i.e. the ID
/* the 'PUT' http request:
*
* When the edit button is clicked, the following will be done:
*
* 1. Copy the title and content of the comment that is gonna be revised into
*    the text area
* 2. Listen to the update event. When the update button is clicked, validate
*    the user input from the text area.
* 3. If the input is not empty, send the ajax request with the title, content
*    and id to the server and let the server update the database. And then the
*    server will send back the status info.
* 4. The client side (here) will get the status info. If successful, the DOM
*    node will be updated and the text area will be cleared. And the user Will
*    be notified.
*
* !!!Note: Step 1, 2, 3, 4 will be done here in the following click function
*/

function editDelComment(){
    $('#comment-parent li').each(function(){
        $(this).find("a").each(function(){
            $(this).on( 'click', function () {
                var id  = $(this).attr("id");
//                alert(id);
                // TODO: more appropriate way to determine edit and delete
                if(id[0] == "E"){
                    setCookie("editComment", id, 100);
                    console.log(document.cookie);

                    var commentid = '#comment';
                    var temp = $(commentid).val();
                    console.log(temp);

//                    $('#input-content').val() = $(commentid).val();
                    updateComment();
                } else if(id[0] == "D"){
                    setCookie("delComment", id, 100);
                    console.log(document.cookie);
                    deleteComment();
                }
            });
        });
    });
}


//$('#edit1').click(function () {
function updateComment(){
	/* Copy the title and content of that comment into the text area for
	   editing */
    // TODO: error here
//	$('#input-content').val()= $('#edit1').parentNode.children[0].val();
	// TODO: CHANGE THE SUBMIT BUTTON INTO THE UPDATE BUTTON
    $('#update1').show();
    $('#comment-button').hide();
}

$('#update1').click(function () {
	/* Get the current title and content */
	let content = $('#input-content').val();
	/* Validate if the updated title and content is legal */
	if (content == null || content == "") {
		alert("invalid input");
		return;
	}
	let url_ = "http://www.darrenzhang.com:8080/assignment-3-superstar/EDIT/comment/";
	// use cookie to get isbn
	// use cookie to get id of clicked edit
	let buttonid = getCookie("editComment");
    // TODO: change clicked edit's id to comment's id
    let id;
	let data_ = {
		"content": content,
		"id": id
	};
	/* Send an update ajax to the server */
	$.ajax({
		url: url_,
		type: 'PUT',
		data: data_,
		crossDomain: true,
		success: function () {
			// TODO: JUDGE which node to be revised
			/* Update the DOM node */
			$('#edit2').parentNode.children[0].val() = content;
			/* Clear the text area */
			$('#input-content').val() = null;
			/* Notify the user! */
			alert("The update has been saved!")
		}
	});
});

// TODO: Judge which DOM node is gonna be deleted, i.e. the ID
/* The DELETE http request
 *
 * When the delete button is clicked, the following will be done:
 *
 * 1. Send the ajax request to the server with the isbn and id
 * 2. The server accepts the request and delete the according comments
 * 3. The server send back the status
 * 4. The client side accepts the status. If successful, delete the DOM
 *    node and notify the user.
 */
function deleteComment(){
	/* Get the current isbn from the user */
	let isbn = getCookie("isbn");
	let buttonid = getCookie("delComment");
    // TODO: change clicked delete's id into comment's id
    let id;
	/* Send delete request to the server */
	$.ajax({
		url: "http://www.darrenzhang.com:8080/assignment-3-superstar/DELETE/comment/",
		type: 'DELETE',
		data: {
			'isbn': isbn,
			'id': id
		},
		crossDomain: true,
		success: function () {
			/* Delete this node in the DOM tree */
			$('delete1').parentNode.remove();
			/* Notify the user */
			alert("Deleting is successful!");
		},
		error: function (err) {
			alert(err + "Something wrong happens, please delete again!")
		}
	});
}
