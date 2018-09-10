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
                    var article_image_url = (article[5] != "" ? ('http://p7g5g3g9.hostrycdn.com/' + article[5]) : "https://www.freeiconspng.com/uploads/no-image-icon-6.png")
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



if (is_search_template == true) {


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