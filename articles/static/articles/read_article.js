function comments_url(id){
    return '/comments/' + id + '/';
}

var comments_active_page = 1;
    
function loadComments(article_id, page){

    url = "/comments/" + article_id + '/?page=' + page;

    // Update the loader button
    document.getElementById("comments_loader_text").innerHTML = 'Loading comments...';

    $.get(url, function(data, status){
        
        // Process data
        if (data!=null && data.comments != null && data.comments.length > 0){

            number_of_comments = data.comments.length;
            //document.getElementById("number_of_comments").innerHTML = '&nbsp;(' + number_of_comments + ')';
            
            var html = '';
            data.comments.forEach(comment => {
                html += `
                <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1 well">
                    <span class="glyphicon glyphicon-user comment-glyph"></span>
                    <a href="/profile/@${ comment.author }/">${ comment.author }</a>
                    <p class="comment-content">${ comment.content }</p>
                    <span class="pull-right"><span class="glyphicon glyphicon-calendar"></span> ${ comment.date.split('T')[0] } , ${ comment.date.split('T')[1].split('.')[0] }</span>
                </div>
                `;
            });
            // Render the comments
            document.getElementById("comments_container").innerHTML += html;
            
            // Hide the loader button
            //document.getElementById("comments_loader").style.display = 'none';
            document.getElementById("comments_loader_text").innerHTML = 'Load more comments';
        }
        else {
            document.getElementById("comments_loader_text").classList = '';
            if (comments_active_page == 2) document.getElementById("comments_loader_text").innerHTML = 'There are no comments';
            else document.getElementById("comments_loader_text").innerHTML = 'There are no more comments';
            document.getElementById("comments_loader").style.cursor = 'auto';
        }
    });
}



var comment_aux = true;
var comment_times = 2;

function blinkComment(){
    element = document.getElementById("comments_container").firstElementChild;
    if (comment_times>0){
    if (comment_aux==true){
        element.style.border = '2px solid green';
        element.style.backgroundColor = 'lightgreen';
        comment_aux = false;
        setTimeout(blinkComment, 600);
    }
    else{
        element.style.border = '1px solid #e3e3e3';
        element.style.backgroundColor = '#f5f5f5';
        comment_aux = true;
        setTimeout(blinkComment, 100);
    }
    comment_times--;
    }
    else{
    //document.getElementById('different_passwords_error').style.display='none';
    comment_times = 2;
    }
}


$("#comment_form").submit(function(e) {

    e.preventDefault();    
    var formData = new FormData(this);

    $.ajax({
            url: comments_url(article_id),
            type: 'POST',
            data: $("#comment_form").serialize(),
            success: function (data) {

                if (data.success){
                    //new_element = document.createElement()
                    //document.getElementById("comments_container").insertBefore(new_element, document.getElementById("comments_container").firstElementChild)

                    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                    var profile_image = document.cookie.replace(/(?:(?:^|.*;\s*)profile_image\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                    if (profile_image != 'None') profile_image = profile_image.substring(1, profile_image.length-1);

                    new_html = `
                        <div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1 well">
                            ${profile_image != 'None' ? '<img src="' + profile_image + '" class="comment-profile-image">' : '<span class="glyphicon glyphicon-user comment-glyph"></span>'}
                            <a href="/profile/@${ cookieValue }/">${ cookieValue }</a>
                            <p class="comment-content">${ data.comment }</p>
                            <span class="pull-right"><span class="glyphicon glyphicon-calendar"></span> ${ data.date.split('T')[0] } , ${ data.date.split('T')[1].split('.')[0] }</span>
                        </div>
                    `;  
                    old_html = document.getElementById("comments_container").innerHTML;
                    document.getElementById("comments_container").innerHTML = new_html + old_html;

                    document.getElementById("comment_area").value = '';
                    blinkComment();
                }

            }
        });
    
});



if (is_read_article_template == true){
    
    var html = '';
    var element = document.getElementById('comment_form_content');
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    var profile_image = document.cookie.replace(/(?:(?:^|.*;\s*)profile_image\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (profile_image != 'None') profile_image = profile_image.substring(1, profile_image.length-1);

    // If the user is (supposedly) logged in
    if (cookieValue) {
        html = `
        ${profile_image != 'None' ? '<img src="' + profile_image + '" class="comment-profile-image">' : '<span class="glyphicon glyphicon-user comment-glyph"></span>'}
        <a href="/profile/@${ cookieValue }/">${ cookieValue }</a>
        <textarea id="comment_area" name="comment" rows="3" class="form-control"></textarea>
        <br>
        <div class="text-center">
            <input type="submit" class="btn btn-success" value="Submit comment"/>
        </div>
        `;
    }
    else {
        html = `
            <h4 class="text-center darkgreen">Please <a href="/login/">log in</a> before commenting</h4>
        `;
    }    
    element.innerHTML = html;




    $.get("/csrf/", function( data ) {
        $("form").append(data);
    });
}