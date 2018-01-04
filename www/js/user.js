var profile_form_original_data = $("form#edit-profile").serialize();
var password_form_original_data = $("form#edit-password").serialize();

$('.update-profile').on('click', function () {
    if (confirm("Update your profile?")) {
        if ($("form#edit-profile").serialize() != profile_form_original_data) {
            $.get(api + 'GO_USER_PROFILE.php?action=edit-profile&obe_id=' + localStorage.getItem('obe_sessionID') + "&" + $('form#edit-profile').serialize(), function (response) {
                if (response == 1) {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    alert("Update complete");
                    $.mobile.navigate('#profile');
                    location.reload();
                } else {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    alert("Oops! Cannot update!");
                }
            });
        }
        if ($("form#edit-password").serialize() != password_form_original_data) {
            $.get(api + 'GO_USER_PROFILE.php?action=edit-password&obe_id=' + localStorage.getItem('obe_sessionID') + "&" + $('form#edit-password').serialize(), function (response) {
                if (response == 1) {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    alert("Update complete");
                    $.mobile.navigate('#profile');
                    location.reload();
                } else {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    alert("Oops! Cannot update!");
                }
            });
        }
    }
});