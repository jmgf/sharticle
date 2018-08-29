
function checkChanges(){
    if (document.getElementById('resume_content').value != resume) 
        document.getElementById('save_profile_button').disabled = false;
    else
        document.getElementById('save_profile_button').disabled = true;
}



if (is_edit_profile_template == true){
    /*
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });
    */
}

