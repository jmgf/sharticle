
if (is_search_by_topic_template == true){

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