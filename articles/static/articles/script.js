




/*****************/
/***  GENERAL  ***/
/*****************/

if (is_base_public_template == true){

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












/*****************/
/***  PROFILE  ***/
/*****************/












/**********************/
/***  OWN ARTICLES  ***/
/**********************/












/**********************/
/***  EDIT ARTICLE  ***/
/**********************/













/**********************/
/***  READ ARTICLE  ***/
/**********************/












/*************************/
/***  SEARCH by TOPIC  ***/
/*************************/












/****************/
/***  SEARCH  ***/
/****************/













/******************************/
/***  CONFIRM REGISTRATION  ***/
/******************************/

/* */









