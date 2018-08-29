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

if (is_edit_article_template == true){

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
var cols = document.querySelectorAll('#columns p');
[].forEach.call(cols, addDnDHandlers);