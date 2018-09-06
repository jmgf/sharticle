




/*****************/
/***  GENERAL  ***/
/*****************/

if (typeof is_base_public_template !== 'undefined' && is_base_public_template == true){

    var html = '';
    var element = document.getElementById('user-info');
    var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    var profile_image = document.cookie.replace(/(?:(?:^|.*;\s*)profile_image\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (profile_image != 'None') profile_image = profile_image.substring(1, profile_image.length-1);

    // If the user is (supposedly) logged in
    if (cookieValue) {
        html = `
            <li class="dropdown">
                <a class="dropdown-toggle" data-toggle="dropdown"  href="/login/">
                    ${profile_image != 'None' ? '<img src="' + profile_image + '" class="navbar-profile-image">' : '<span class="glyphicon glyphicon-user"></span>'}
                    &nbsp; ${ cookieValue } <span class="caret"></span>
                </a>
                <ul class="dropdown-menu">
                    <li><a href="/profile/@${ cookieValue }/"><span class="glyphicon glyphicon-eye-open"></span>&nbsp;&nbsp;My profile</a></li>
                    <li><a href="/profile/edit/"><span class="glyphicon glyphicon-pencil"></span>&nbsp;&nbsp;Edit profile</a></li>
                    <li role="separator" class="divider"></li>
                    <li><a href="/articles/drafts/"><span class="glyphicon glyphicon-file"></span>&nbsp;&nbsp;My drafts</a></li>
                    <li><a href="/articles/published/"><span class="glyphicon glyphicon-list"></span>&nbsp;&nbsp;My publications</a></li>
                    <li role="separator" class="divider"></li>
                    <li><a href="/logout/"><span class="glyphicon glyphicon-log-out"></span>&nbsp;&nbsp;Logout</a></li>
                </ul>
            </li>
        `;
    }
    else {
        html = `
            <li><a id="login-btn" class="btn btn-success navbar-btn" href="/login/">Log in</a></li>
            <li><a class="text-center" href="/register/"><span class="glyphicon glyphicon-edit" ></span> &nbsp;Register </a></li>
        `;
    }

    element.innerHTML = html;

}










/************************/
/***  AUTHENTICATION  ***/
/************************/

var register_aux = true;
var register_times = 6;

function blinkRegister(){
    element = document.getElementById("different_passwords_error");
    if (register_times>0){
    if (register_aux==true){
        element.style.color='#f5f5f5';
        register_aux = false;
        setTimeout(blinkRegister, 100);
    }
    else{
        element.style.color='#a94442';
        register_aux = true;
        setTimeout(blinkRegister, 400);
    }
    register_times--;
    }
    else{
    //document.getElementById('different_passwords_error').style.display='none';
    register_times = 6;
    }
}



if (typeof is_register_template !== 'undefined'){

    // -------------------------------------------------------------
    // Alterar as chamadas ao DOM pela sintaxe do jQuery...
    // ... ou, alternativamente, não utilizar jQuery.
    // -------------------------------------------------------------
    $(document).ready(function(){
        var $form = $('form');
        $form.submit(function(){

            // -------------------------------------------------------------
            // Adicionalmente, substituir as referências aos identificadores
            // dos elementos HTML por referências a campos extraídos da
            // variável "form" (de acordo com o atributo "name")
            // -------------------------------------------------------------
            if (document.getElementById('password1').value!=document.getElementById('password2').value){
            document.getElementById('different_passwords_error').style.display='block';
            blinkRegister();
            document.getElementById('password2').value='';
            document.getElementById('password2').focus();
            return false;
            }
        });
    });

}











/*****************/
/***  PROFILE  ***/
/*****************/


function checkChanges(){
    if (document.getElementById('resume_content').value != resume) 
        document.getElementById('save_profile_button').disabled = false;
    else
        document.getElementById('save_profile_button').disabled = true;
}



if (typeof is_edit_profile_template !== 'undefined'){
    /*
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });
    */
}












/**********************/
/***  OWN ARTICLES  ***/
/**********************/

function read_article_url(id){
    return '/articles/' + id + '/';
}

function edit_article_url(id){
    return '/articles/edit/' + id + '/';
}

function publish_article_url(id){
    return '/articles/publish/' + id + '/';
}

function delete_article_url(id){
    return '/articles/delete/' + id + '/';
}

function json_draft_articles_url(){
    return '/articles/drafts/json/';
}

function json_published_articles_url(){
    return '/articles/published/json/';
}

var own_articles_already_loaded = false;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function publishArticle(id){
    // Contact server with POST method
    $.post(publish_article_url(id), {'csrfmiddlewaretoken' :  getCookie('csrftoken')}, function(data, status){
        //article_box = document.getElementById("article_box_" + id);
        //document.getElementById("draft_articles_content").appendChild(article_box);
        //article_box.parentElement.removeChild(article_box);
        
        // Increment number of published articles
        var number_of_published_badge = document.getElementById("number_of_published");
        number_of_published_badge.innerHTML = parseInt(number_of_published_badge.innerHTML) + 1;
        
        // Decrement number of draft articles
        var number_of_drafts_badge = document.getElementById("number_of_drafts");
        number_of_drafts_badge.innerHTML = parseInt(number_of_drafts_badge.innerHTML) - 1;
        
        //document.getElementById(draft ? "draft_articles_content" : "published_articles_content").removeChild(article_box);
        //alert(data.success);
    });
}

function deleteArticle(id, draft){
    // Attach a submit handler to the form
    //$.post(delete_article_url(id), {'csrfmiddlewaretoken' :  $("[name=csrfmiddlewaretoken]").val()}, function(data, status){
    $.post(delete_article_url(id), {'csrfmiddlewaretoken' :  getCookie('csrftoken')}, function(data, status){
        article_box = document.getElementById("article_box_" + id);
        article_box.parentElement.removeChild(article_box);

        var number_of_articles_badge = document.getElementById(draft ? "number_of_drafts" : "number_of_published");
        number_of_articles_badge.innerHTML = parseInt(number_of_articles_badge.innerHTML) - 1;
        //document.getElementById(draft ? "draft_articles_content" : "published_articles_content").removeChild(article_box);
        //alert(data.success);
    });
}

function loadArticles(element, drafts = false, published = false){
    // In case the action is legit (and not a random click)
    if (element.parentElement.className!='active'){
        // Set the window location
        if (drafts) history.pushState(null, 'published_articles', '/articles/published/');
        else history.pushState(null, 'draft_articles', '/articles/drafts/');
        
        if (!own_articles_already_loaded){
            // Load the articles
            if (drafts) url = json_published_articles_url();
            else url = json_draft_articles_url();
            $.get(url, function(data, status){
                own_articles_already_loaded = true;
                // Hide the loader circle
                if (drafts) document.getElementById("published_articles_loader").style.display = 'none';
                else document.getElementById("draft_articles_loader").style.display = 'none';
                // Process data
                if (data!=null){
                    var user = data.author;
                    var html = '';
                    data.articles.forEach(article => {
                        if (user.profileImagePath) user_image_html = '<img src="' + user.profileImagePath + '" class="pull-left" height="68"></img>';
                        else user_image_html = '<span class="glyphicon glyphicon-user pull-left"></span>';
                        var article_image_url = (article.image_path != "" ? ('/static/articles/' + article.image_path) : "https://www.freeiconspng.com/uploads/no-image-icon-6.png")
                        html += `
                            <div class="col-md-6" id="article_box_${ article.id }">
                                <div class="article-box">
                                    <div class="row">
                                        <div class="col-sm-6">
                                            <div class="article-box-image" style="background-image: url('${article_image_url}');">
                                                <div class="article-box-controls-container">
                                                    <p class="article-box-controls">
                                                        <span class="glyphicon glyphicon-trash delete-action-icon" title="Delete" data-toggle="modal" data-target="#delete_article_modal_${ article.id }"></span>
                                                        ${published ? '<span class="glyphicon glyphicon-share publish-action-icon" title="Publish" onclick="publishArticle(' + article.id + ');"></span>' : ''}
                                                        ${published ? '<a href="' + edit_article_url(article.id) + '"><span class="glyphicon glyphicon-pencil edit-action-icon" title="Edit"></span></a>' 
                                                        : '<a href="' + read_article_url(article.id) + '"><span class="glyphicon glyphicon-eye-open edit-action-icon" title="Read"></span></a>'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-sm-6" ${published ? 'onclick="window.location.href = \'' + edit_article_url(article.id) + '\'\"' : ''}>
                                            <div class="article-box-content">
                                                <div class="article-box-title">
                                                    <h3>${ article.title }</h3>
                                                    <p class="ellipsed">${ article.description }</p>
                                                </div>
                                                <div class="article-author">
                                                    ${user_image_html}
                                                    <h4><a href="/profile/@${ article.author }/">${ article.author }</a></h4>
                                                    <!--<p>${ user.resume }</p>-->
                                                    <p>
                                                        <span class="glyphicon glyphicon-calendar"></span>&nbsp;
                                                        ${ article.last_modified_date.split('T')[0] }</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="delete_article_modal_${ article.id }" class="modal fade" role="dialog">
                                <div class="modal-dialog">
                                    <form class="deleteForm" method="POST" action="/articles/delete/${ article.id }">
                                        ${ csrftok }
                                        <!-- Modal content-->
                                        <div class="modal-content">
                                        <div class="modal-header">
                                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                                            <h3 class="modal-title text-danger"><span class="glyphicon glyphicon-trash"></span> &nbsp;Delete draft</h3>
                                        </div>
                                        <div class="modal-body">
                                            <h4>Do you really wish to delete the selected article?</h4>
                                            <h4 class="text-danger"><span class="glyphicon glyphicon-warning-sign"></span> &nbsp;The draft <span class="label label-danger">${ article.title }</span> will be permanently deleted!</h4>
                                        </div>
                                        <div class="modal-footer">
                                            <button class="btn btn-danger" data-dismiss="modal" onclick="deleteArticle(${ article.id }, draft=${drafts ? 'false' : 'true'})">Delete</a>
                                            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                                        </div>
                                        </div>
                                    </form>                                                
                                </div>
                            </div>
                        `;
                    });
                    if (drafts) document.getElementById("published_articles_content").innerHTML = html;
                    else document.getElementById("draft_articles_content").innerHTML = html;
                }
            });
        }
    }
}










/**********************/
/***  EDIT ARTICLE  ***/
/**********************/

function getTags() {
    var select = document.getElementById('select1'); 
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i=0, iLen=options.length; i<iLen; i++) {
        opt = options[i];

        if (opt.selected) {
        result.push(opt.value || opt.text);
        }
    }

    var custom_tags = document.getElementById("selected_tags");
    var children = custom_tags.children;
    for (var i=0; i<children.length; i++) {
        result.push(children[i].innerHTML);
    }

    document.getElementById('tags').value = result;
    alert(result);
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function save_article_url(id){
    return '/articles/save/' + id + '/';
}

/*function addBold(){
    alert(window.getSelection().toString());
    document.execCommand('bold');
}*/

function saveArticle(id){
    var content = '';
    var texties = document.getElementById("columns").getElementsByTagName("*");
    var i;
    for (i = 0; i < texties.length; i++){
        //content += '<p class="column" draggable="true">' + texties[i].value + '</p>';
        //new_content = texties[i].value.replace(/\n/g, '<br/>');
        if(texties[i].innerHTML!=''){
            var tagName = texties[i].tagName;
            content += '<' + tagName + ' contenteditable="true" draggable="true">' + texties[i].innerHTML + '</' + tagName + '>';
        }
    }
    content = document.getElementById("columns").innerHTML;
    //alert(content);
    $.post(save_article_url(id), {'csrfmiddlewaretoken' :  getCookie('csrftoken'), 'content' : content}, function(data, status){
        if (data.success == true)
            alert('Article saved!');
        else alert('Some error has occurred!');
    });
}

var edit_article_dragSrcEl = null;
var edit_article_counter = 0;

function addElement(srcElement){
    var new_element;
    if (srcElement == null){
        new_element = document.createElement("p");
        new_element.contentEditable = "true"; 
        document.getElementById("columns").appendChild(new_element);
        window.scrollTo(0, document.body.scrollHeight);
    }
    else {
        if (srcElement.tagName == 'P' || srcElement.tagName == 'H2' || srcElement.tagName == 'UL' ){
            new_element = document.createElement("p");
        }
        else {
            new_element = document.createElement("li");         
        }   
        new_element.contentEditable = "true";  
        srcElement.parentNode.insertBefore(new_element, srcElement.nextSibling);        
    } 
    new_element.focus();
}



function addList(srcElement){
    var new_element = document.createElement("ul");
    var new_list_element = document.createElement("li");
    //new_element.contentEditable = "true";
    new_list_element.contentEditable = "true";

    if (srcElement == null) {
        document.getElementById("columns").appendChild(new_element);
        new_element.appendChild(new_list_element);
        window.scrollTo(0, document.body.scrollHeight);
    }   
    else {
        srcElement.parentNode.insertBefore(new_element, srcElement.nextSibling); 
        new_element.appendChild(new_list_element);
    }    
    
    new_list_element.focus();
}



function addTitle(srcElement){
    var new_element = document.createElement("h2");
    new_element.contentEditable = "true";
    //new_element.value = "Newly created paragraph " + edit_article_counter++;
    // new_element.style.width = "100%";
    //new_element.style.resize = "vertical";
    new_element.style.minHeight = "3rem";

    if (srcElement == null) {
        document.getElementById("columns").appendChild(new_element);
        window.scrollTo(0, document.body.scrollHeight);
    }   
    else srcElement.parentNode.insertBefore(new_element, srcElement.nextSibling);     
    
    new_element.focus();
}



function addImage(imageSrc){
    var new_image = document.createElement("img");
    var IMAGE_PREFIX = '/static/articles/';
    new_image.src = IMAGE_PREFIX + imageSrc;
    new_image.contentEditable = 'true';

    var new_image_caption = document.createElement("p");
    new_image_caption.contentEditable = 'true';
    new_image_caption.innerHTML = 'Image caption';
    new_image_caption.className = 'image-caption';

    document.getElementById("columns").appendChild(new_image);
    document.getElementById("columns").appendChild(new_image_caption);

    window.scrollTo(0, document.body.scrollHeight);   
    new_image_caption.focus();
}

var edit_article_map = {};

if (typeof is_edit_article_template !== 'undefined'){

    document.onkeydown = function (e) {
        /* edit_article_map[e.keyCode] = e.type == 'keydown'; */
        // Check if some paragraph is selected

        if (event.srcElement.tagName != 'SELECT' &&
            event.srcElement.tagName != 'OPTION' &&
            event.srcElement.tagName != 'INPUT'){
            if (event.srcElement!=document.body && 
            (event.which == 13 || event.keyCode == 13 || 
                event.which == 46 || event.keyCode == 46 ||
                event.which == 8 || event.keyCode == 8 ||
                event.which == 38 || event.keyCode == 38 ||
                event.which == 40 || event.keyCode == 40 /*||
                (edit_article_map[17] && edit_article_map[66])*/)){
                // ADD NEW PARAGRAPH
                if (event.which == 13 || event.keyCode == 13) {     
                    event.preventDefault();
                    if (e.srcElement.innerHTML==''){
                        if (e.srcElement.tagName == 'P') addTitle(e.srcElement);  
                        else addElement(e.srcElement.parentNode);                  
                        e.srcElement.parentNode.removeChild(e.srcElement);
                    }
                    else addElement(e.srcElement);
                }
                // DELETE SELECTED PARAGRAPH
                else if (event.which == 46 || event.keyCode == 46) {
                    if (event.srcElement.innerHTML==''){
                        event.preventDefault();
                        var nextSibling = event.srcElement.nextSibling;
                        // Remove the element
                        event.srcElement.parentElement.removeChild(event.srcElement);
                        // Does not work for the last element. It throws an error!
                        nextSibling.focus();
                    }
                }
                // DELETE SELECTED PARAGRAPH
                else if (event.which == 8 || event.keyCode == 8) {
                    //alert(window.getSelection().toString());
                    if (event.srcElement.innerHTML==''){
                        event.preventDefault();
                        var previousSibling = event.srcElement.previousSibling;
                        // Remove the element
                        event.srcElement.parentElement.removeChild(event.srcElement);
                        // Does not work for the last element. It throws an error!
                        var range = document.createRange();
                        var sel = window.getSelection();
                        var position = previousSibling.innerHTML.length;
                        if (position != 0){
                            range.setStart(previousSibling.childNodes[0], position);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                        previousSibling.focus();
                    }
                }
                else if (event.which == 38 || event.keyCode == 38) {            
                    event.preventDefault();
                    var previousSibling = event.srcElement.previousSibling;
                    var range = document.createRange();
                    var sel = window.getSelection();
                    var position = previousSibling.innerHTML.length;
                    if (position != 0){
                        range.setStart(previousSibling.childNodes[0], position);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                    previousSibling.focus();
                }
                else if (event.which == 40 || event.keyCode == 40) {            
                    event.preventDefault();
                    var nextSibling = event.srcElement.nextSibling;
                    var range = document.createRange();
                    var sel = window.getSelection();
                    var position = nextSibling.innerHTML.length;
                    if (position != 0){
                        range.setStart(nextSibling.childNodes[0], position);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                    nextSibling.focus();
                }
                /*else if (edit_article_map[16] && edit_article_map[66]) {            
                    event.preventDefault();
                    document.execCommand('underline');
                    edit_article_map = {};
                }*/
            }
        }
    };

    document.getElementById("custom_tags").onkeypress = function (e) {
        if (event.which == 44 || event.keyCode == 44 ||
            event.which == 13 || event.keyCode == 13 ||
            event.which == 59 || event.keyCode == 59) {     
            event.preventDefault();
            var new_tag = document.createElement("span");
            new_tag.className="label label-info";
            new_tag.innerHTML = e.srcElement.value;
            new_tag.onclick = function(e){
                this.parentElement.removeChild(this);
            }
            document.getElementById("selected_tags").appendChild(new_tag);
            e.srcElement.value = '';
        }
    };

    $("#upload_image_form").submit(function(e) {
        e.preventDefault();    
        var formData = new FormData(this);
        
        $("#upload_image_modal").modal('hide');

        $.ajax({
            url: '/articles/uploads/images/',
            type: 'POST',
            data: formData,
            success: function (data) {
                if (data.success) alert("Your image has been successfully uploaded!");
                document.getElementById("upload_image_form").reset();
                addImage(data.imageSrc);                    
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });


    var cols = document.querySelectorAll('#columns p');
    [].forEach.call(cols, addDnDHandlers);

}

function handleDragStart(e) {
    // Target (this) element is the source node.
    edit_article_dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragElem');
}
function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }
    this.classList.add('over');
    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
    return false;
}
function handleDragEnter(e) {
    // this / e.target is the current hover target.
}
function handleDragLeave(e) {
    this.classList.remove('over');  // this / e.target is previous target element.
}
function handleDrop(e) {
    // this/e.target is current target element.
    if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
    }
    // Don't do anything if dropping the same column we're dragging.
    if (edit_article_dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the column we dropped on.
        //alert(this.outerHTML);
        //edit_article_dragSrcEl.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        this.parentNode.removeChild(edit_article_dragSrcEl);
        var dropHTML = e.dataTransfer.getData('text/html');
        this.insertAdjacentHTML('beforebegin',dropHTML);
        var dropElem = this.previousSibling;
        addDnDHandlers(dropElem);                
    }
    // THIS FIXES A BUG
    else this.classList.remove('dragElem');
    this.classList.remove('over');
    return false;   
}
function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('over');
    /*[].forEach.call(cols, function (col) {
        col.classList.remove('over');
    });*/
}
function addDnDHandlers(elem) {
    elem.addEventListener('dragstart', handleDragStart, false);
    elem.addEventListener('dragenter', handleDragEnter, false)
    elem.addEventListener('dragover', handleDragOver, false);
    elem.addEventListener('dragleave', handleDragLeave, false);
    elem.addEventListener('drop', handleDrop, false);
    elem.addEventListener('dragend', handleDragEnd, false);
}











/**********************/
/***  READ ARTICLE  ***/
/**********************/

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






if (typeof is_read_article_template !== 'undefined'){
    
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
}










/*************************/
/***  SEARCH by TOPIC  ***/
/*************************/


if (typeof is_search_by_topic_template !== 'undefined'){

    var active_topic = topic_key;

    var topics_active_page = [];
    topics_active_page["AI"] = 1;
    topics_active_page["WP"] = 1;
    topics_active_page["SE"] = 1;
    topics_active_page["DS"] = 1;
    topics_active_page["C"] = 1;

    var topics_already_loaded = [];
    topics_already_loaded["AI"] = false;
    topics_already_loaded["WP"] = false;
    topics_already_loaded["SE"] = false;
    topics_already_loaded["DS"] = false;
    topics_already_loaded["C"] = false;

    topics_already_loaded[topic_key] = true;



    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            // you're at the bottom of the page
            loadTopicArticles(active_topic, null);
        }
    };

}




function read_article_url(id){
    return '/articles/' + id + '/';
}

function topic_articles_url(topic){
    return '/topic/' + topic + '/';
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}





function loadTopicArticles(topic_id, topic_description){

    // Set the window location
    history.pushState(null, topic_id + '_articles', '/topic/' + topic_id + '/');

    // Set main heading (1st time) or active page
    if (topic_description != null) 
        document.getElementById("topic_description").innerHTML = topic_description;

    // In case the action is legit (and not a random click)
    if (active_topic != topic_id || topics_already_loaded[topic_id]){

        active_topic = topic_id;

        if (topic_description != null && topics_already_loaded[topic_id] == true) return;
        else topics_already_loaded[topic_id] = true;

        // Set main heading (1st time) or active page
        if (topic_description == null) 
            topics_active_page[topic_id] = topics_active_page[topic_id] + 1;

        // Load the articles
        url = '/topic/' + topic_id + '/json/' + topics_active_page[topic_id] + '/';
        $.get(url, function(data, status){
            

            // Hide the loader circle
            if (document.getElementById(topic_id + "_loader") != null)
                document.getElementById(topic_id + "_loader").style.display = 'none';
            
            // Process data
            if (data.articles!=null){
                var user = data.author;
                var html = '';
                data.articles.forEach(article => {
                    user_image_html = '<span class="glyphicon glyphicon-user pull-left"></span>';
                    var article_image_url = (article.image_path != "" ? ('/static/articles/' + article.image_path) : "https://www.freeiconspng.com/uploads/no-image-icon-6.png")
                    html += `
                        <div class="col-md-6" id="article_box_${ article.id }">
                            <div class="article-box">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="article-box-image" style="background-image: url('${article_image_url}');">
                                            <div class="article-box-controls-container">
                                                <p class="article-box-controls">
                                                    <a href="${ read_article_url(article.id) }"><span class="glyphicon glyphicon-eye-open edit-action-icon" title="Read"></span></a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" onclick="window.location.href = '${ read_article_url(article.id) }'">
                                        <div class="article-box-content">
                                            <div class="article-box-title">
                                                <h3>${ article.title }</h3>
                                                <p class="ellipsed">${ article.description }</p>
                                            </div>
                                            <div class="article-author">
                                                ${user_image_html}
                                                <h4><a href="/profile/@${ article.author }/">${ article.author }</a></h4>
                                                <p>
                                                    <span class="glyphicon glyphicon-calendar"></span>&nbsp;
                                                    ${ article.last_modified_date.split('T')[0] }</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                document.getElementById(topic_id + '_content').innerHTML += html;
            }
        });
    }
}










/****************/
/***  SEARCH  ***/
/****************/

function read_article_url(id){
    return '/articles/' + id + '/';
}

function search_url(){
    return '/search/';
}

function setTypeOfSearch(type){
    document.getElementById("search_box").name = type;
    document.getElementById("search_box").placeholder = 'Search ' + type + '...';
    document.getElementById(type + "_picker").style.color = 'green';
    if (type == 'articles') document.getElementById("people_picker").style.color = 'lightgreen';
    else if (type == 'people') document.getElementById("articles_picker").style.color = 'lightgreen';
}


var search_active_page = 1;



function loadSearchResults(page){

    $.ajax({
        url: search_url(),
        type: 'GET',
        data: $("#search_form").serialize() + '&page=' + page,
        success: function (data) {

            // Process data

            console.log(data.articles);
            console.log(data.people);

            // List of articles
            if (data.articles != null && data.articles.length > 0){
                console.log('ARTICLES');
                var html = '';
                data.articles.forEach(article => {
                    user_image_html = '<span class="glyphicon glyphicon-user pull-left"></span>';
                    var article_image_url = (article[5] != "" ? ('/static/articles/' + article[5]) : "https://www.freeiconspng.com/uploads/no-image-icon-6.png")
                    html += `
                        <div class="col-md-6" id="article_box_${ article[0] }">
                            <div class="article-box">
                                <div class="row">
                                    <div class="col-sm-6">
                                        <div class="article-box-image" style="background-image: url('${article_image_url}');">
                                            <div class="article-box-controls-container">
                                                <p class="article-box-controls">
                                                    <a href="${ read_article_url(article[0]) }"><span class="glyphicon glyphicon-eye-open edit-action-icon" title="Read"></span></a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" onclick="window.location.href = '${ read_article_url(article[0]) }'">
                                        <div class="article-box-content">
                                            <div class="article-box-title">
                                                <h3>${ article[1] }</h3>
                                                <p class="ellipsed">${ article[2] }</p>
                                            </div>
                                            <div class="article-author">
                                                ${user_image_html}
                                                <h4><a href="/profile/@${ article[3] }/">${ article[3] }</a></h4>
                                                <p>
                                                    <span class="glyphicon glyphicon-calendar"></span>&nbsp;
                                                    ${ article[6].split('T')[0] }</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });
                document.getElementById("error_message").innerHTML = '';
                document.getElementById("search_people").innerHTML = '';
                if (page == 1) document.getElementById("search_articles").innerHTML = html;
                else document.getElementById("search_articles").innerHTML += html;
            }

            // List of people
            else if (data.people != null) {
                console.log('PEOPLE');
                var html = '';
                data.people.forEach(person => {
                    user_image_html = person.profileImagePath != null ? 
                        '<img class="pull-left profile-img" width="90" height="90" src="'+person.profileImagePath+'"></img>' : 
                        '<span class="glyphicon glyphicon-user search-user-glyph pull-left"></span>';
                    html += `
                        <div class="user-search-box" onclick="window.location.href='/profile/@${person.username}/';">
                            ${ user_image_html }
                            <div>
                                <div class="search-user-info">
                                    <h2><a href="/profile/@${person.username}/">${person.first_name != "" ? person.first_name : person.username } ${person.first_name != "" ? person.last_name : "" }</a></h2>
                                    <h4>${person.resume != null ? person.resume : ""}</h4>
                                </div>
                            </div>
                        </div>
                        <hr>
                    `;
                });
                document.getElementById("error_message").innerHTML = '';
                document.getElementById("search_articles").innerHTML = '';
                if (page == 1) document.getElementById("search_people").innerHTML = html;
                else document.getElementById("search_people").innerHTML += html;
            }

            // No results
            else {
                console.log('ERROR');
                document.getElementById("search_articles").innerHTML = '';
                document.getElementById("search_people").innerHTML = '';
                document.getElementById("error_message").innerHTML = "No results were found!";
            }


        }
    });
}



if (typeof is_search_template !== 'undefined') {


    $("#search_form").submit(function(e) {
        search_active_page = 1;    
        e.preventDefault();    
        var formData = new FormData(this);
        loadSearchResults(search_active_page++);
    });
    
        
    
    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
            // you're at the bottom of the page
            loadSearchResults(search_active_page++);
        }
    };
    
}











/******************************/
/***  CONFIRM REGISTRATION  ***/
/******************************/

/* */









