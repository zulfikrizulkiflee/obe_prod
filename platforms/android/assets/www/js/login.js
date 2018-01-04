// Login Form
$(function () {
    if (localStorage.getItem('obe_sessionID') != "0") {
        $("#preloader").show();
        $.get(api + 'GO_USER_PROFILE.php?action=user_detail', {
            obe_id: localStorage.getItem('obe_sessionID')
        }, function (response) {
            if (response != "") {
                response = JSON.parse(response);
                console.log(response);
                $('.profile-name').html(response[0].user_name);
                if (response[0].user_img != null) {
                    $('.profile-img').attr('src', "http://www.zfikri.tk/obe_api/upload/" + response[0].user_img);
                    $('.preview-img').attr('src', "http://www.zfikri.tk/obe_api/upload/" + response[0].user_img);
                }
                $('.account-status').html(response[0].status);
                $('.account-expired').html(response[0].end_date);
                $('.profile-callsign').html(response[0].user_callsign);
                $('#edit-profile input[name=user_name]').attr('value',response[0].user_name);
                $('#edit-profile input[name=user_phone]').attr('value',response[0].user_phone);
                $('#edit-profile input[name=user_email]').attr('value',response[0].user_email);
                $("#preloader").delay(1000).fadeOut("slow").hide();
                $.mobile.navigate('#profile');
            }
            else {
                $("#preloader").delay(1000).fadeOut("slow").hide();
//                alert(localStorage.getItem('obe_sessionID'))
                if(localStorage.getItem('obe_sessionID') != null) alert("Invalid login");
            }
        });
    }
    var button = $('#loginButton');
    var box = $('#loginBox');
    var form = $('#loginForm');
    button.removeAttr('href');
    button.mouseup(function (login) {
        box.toggle();
        button.toggleClass('active');
    });
    form.mouseup(function () {
        return false;
    });
    $(this).mouseup(function (login) {
        if (!($(login.target).parent('#loginButton').length > 0)) {
            button.removeClass('active');
            box.hide();
        }
    });
});
$('#login-submit').on('click', function () {
    $("#preloader").show();
    $.get(api + 'GO_USER_PROFILE.php?action=login', $('#login-form').serialize(), function (response) {
        if (response != "") {
            document.getElementById("login-form").reset();
            response = JSON.parse(response);
            console.log(response);
            $.get(api + 'GO_USER_PROFILE.php?action=registerToken', {
                token: localStorage.getItem('obe_pushToken')
                , obe_id: response[0].obe_id
            }, function (data) {}, function (error) {
                console.error(error);
            });
            localStorage.setItem("obe_sessionID", response[0].obe_id);
            localStorage.setItem("obe_sessionNAME", response[0].user_name);
            localStorage.setItem("obe_sessionROLE", response[0].user_role);
            localStorage.setItem("obe_sessionSTOCKISTID", response[0].parent_id);
            localStorage.setItem("obe_sessionSTATUS", response[0].status);
            $('.profile-name').html(response[0].user_name);
            if (response[0].user_img != null) {
                $('.profile-img').attr('src', "http://www.zfikri.tk/obe_api/upload/" + response[0].user_img);
                $('.preview-img').attr('src', "http://www.zfikri.tk/obe_api/upload/" + response[0].user_img);
            }
            $('.profile-callsign').html(response[0].user_callsign)
            $("#preloader").delay(1000).fadeOut("slow").hide();
            $.mobile.navigate('#profile');
            location.reload();
        }
        else {
            $("#preloader").delay(1000).fadeOut("slow").hide();
            alert("Invalid login");
        }
    });
});
$('#logout-submit').on('click', function () {
    if (confirm("Are you sure?") == true) {
        $("#preloader").show();
        $.get(api + 'GO_USER_PROFILE.php?action=destroyToken', {
            obe_id: localStorage.getItem("obe_sessionID")
        }, function (data) {}, function (error) {
            console.error(error);
        });
        localStorage.setItem("obe_sessionID", "0");
        $('.profile-img').attr('src', "images/man.png");
        $('.preview-img').attr('src', "images/man.png");
        $("#preloader").delay(1000).fadeOut("slow").hide();
        $.mobile.navigate("#login");
        location.reload();
    }
});