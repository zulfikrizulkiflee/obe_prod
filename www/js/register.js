function checkForm(){
    var count = 0;
    var form_count = 0;
    $('.register-form input.required').each(function (i, registerDataElement) {
        var check = ["Name","Phone Number","Email","Username","Password"];
        if ($(this).val() == '' || check.indexOf($(this).val()) >= 0) {
            form_count++;
        }
    });
    
    if (count != form_count) {
        alert("Please fill up all fields.")
    }else{
        $.mobile.navigate("#landing2");
    }
}

function numberMobile(e){
    e.target.value = e.target.value.replace(/\s/g, '');
    return false;
}

$('#register-btn').on('click', function () {
    var count = 0;
    var form_count = 0;
    $('.register-form input.required').each(function (i, registerDataElement) {
        var check = ["Name","Phone Number","Email","Username","Password"];
        if ($(this).val() == '' || check.indexOf($(this).val()) >= 0) {
            form_count++;
        }
    });
    if (count != form_count) {
        alert("Please fill up all fields.")
    }
    else {
        var data = $('.register-form').serialize();
        $.get(api + 'GO_USER_PROFILE.php?action=register', data, function (response) {
            if (response == "false") {
                alert("Sorry, the username has been taken.\n\nPlease change your username.");
            }
            else {
                if (response > 0) {
                    $('.register-form input').each(function(){
                       $(this).val(""); 
                    });
                    alert("Registration Complete");
                    $.mobile.navigate('#login');
                }
                else {
                    alert("Error Registering Account");
                    $.mobile.loading("hide");
                }
            }
        });
    }
});