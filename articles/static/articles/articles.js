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
                        var article_image_url = (article.image_path != "" ? ('http://p7g5g3g9.hostrycdn.com/' + article.image_path) : "https://www.freeiconspng.com/uploads/no-image-icon-6.png")
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