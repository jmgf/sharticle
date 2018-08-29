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



if (is_register_template == true){

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
