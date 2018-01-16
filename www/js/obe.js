// Wait for device API libraries to load
//
function onLoad() {
    FCMPlugin.getToken(function (token) {
        localStorage.setItem('obe_pushToken', token);
    });
    document.addEventListener("deviceready", onDeviceReady, false);
    FCMPlugin.onNotification(function (data) {
        console.log(data);
        if (data.wasTapped) {
            //Notification was received on device tray and tapped by the user.
            location.reload();
            //            var selectt = "[href="+data.page+"]";
            //            $(selectt).click();
            //            location.href()=location.href();
            //            alert(data);
        }
        else {
            //Notification was received in foreground. Maybe the user needs to be notified.
            if (data.page == "#incoming-order") {
                var messageToast = "You received new order";
            }
            else if (data.page == "#show-complete") {
                var messageToast = "One of your order has been completed";
            }
            alert(messageToast);
            location.reload();
        }
    });
}
// device APIs are available
//
function onDeviceReady() {
    StatusBar.backgroundColorByHexString("#1f253d");
    //    StatusBar.hide();
    // Register the event listener
    document.addEventListener("backbutton", onBackKeyDown, false);
}
var lastTimeBackPress = 0;
var timePeriodToExit = 2000;

function onBackKeyDown(e) {
    e.preventDefault();
    e.stopPropagation();
    if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
        navigator.app.exitApp();
    }
    else {
        window.plugins.toast.showWithOptions({
            message: "Press again to exit."
            , duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
            position: "bottom"
            , addPixelsY: -40 // added a negative value to move it up a bit (default 0)
        });
        lastTimeBackPress = new Date().getTime();
    }
};
var local_api = "api/";
var remote_api = "http://www.obe-apps.tk/obe_api/";
var api = "";

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
}
console.log(getMobileOperatingSystem());
if (getMobileOperatingSystem() == "Android") {
    api = remote_api;
}
else {
    api = remote_api;
}

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
                    $('.profile-img').attr('src', api + "upload/" + response[0].user_img);
                    $('.preview-img').attr('src', api + "upload/" + response[0].user_img);
                }
                var acstatus = "New";
                if(response[0].status != null){
                    acstatus = response[0].status;
                }

                var account_date = "Unavailable";
                if(response[0].end_date != null){
                    account_date = response[0].end_date.split(" ");
                    account_date = account_date[0].split("-");
                    account_date = account_date[2]+"/"+account_date[1]+"/"+account_date[0];
                }

                if (acstatus == "Active"){
                    $('.account-status').attr('style','background:#11a8ab');
                    $('.expired-stockist').hide();
                }else if(acstatus == "Expired"){
                    $('.account-status').attr('style','background:#e64c65');
                }else{
                    $('.account-status').attr('style','background:#fcb150');
                    $('.expired-stockist').hide();
                }

                $('.account-role').html(response[0].user_role);
                $('.account-status').html(acstatus);
                $('.account-expired').html(account_date);
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
                $('.profile-img').attr('src', api + "upload/" + response[0].user_img);
                $('.preview-img').attr('src', api + "upload/" + response[0].user_img);
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

$('#remove').on('click', function () {
    if (confirm("Are you sure to remove?\nSubscribe as stockist can be find in setting.")) {
        $(this).parent().parent().animate({
            opacity: 'hide', // animate slideUp
            right: '200px', // slide left
        }, 'slow', 'linear', function () {
            $(this).parent().remove();
        });
    }
});
$('.show-password').each(function () {
    $(this).on('mousedown', function () {
        var type = $(this).parent().parent().find('input[data-input=pwd]');
        type.prop('type', "text");
    });
    $(this).on('mouseup', function () {
        var type = $(this).parent().parent().find('input[data-input=pwd]');
        type.prop('type', "password");
    });
});
var productName = ['Brest Garden', 'Caen Lemon', 'Honey Paris', 'La Rochelle', 'Le Havre', 'Le Mans', 'Lille Vanilla', 'Lorraine Lime', 'Lyanne Reims', 'Lyon Air', 'Marseille Lavender', 'Nancy Strawberry', 'Orly Orange', 'Toulouse Apple'];
var productImg = ['brest-garden', 'caen-lemon', 'honey-paris', 'la-rochelle', 'le-havre', 'le-mans', 'lille-vanilla', 'lorraine-lime', 'lyanne-reims', 'lyon-air', 'marseille-lavender', 'nancy-strawberry', 'orly-orange', 'toulouse-apple'];
$('.product-list').html("");
for (i = 0; i < productName.length; i++) {
    var str = '<li> <a href="#" data-item="' + productImg[i] + '" data-type="product"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/fleur/' + productImg[i] + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em">' + productName[i] + '</p> <p><span class="product-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" style="width:65%;padding:3px 10px;text-align: right;" maxlength="5"> <i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
    $('.product-list').append(str);
}
var marketingName = ['Tester', 'Flyers', 'Poster', 'Standee', 'Rolls Up', 'T-stand'];
var marketingImg = ['tester', 'flyers', 'poster', 'standee', 'rolls-up-t-stand', 'rolls-up-t-stand'];
$('.marketing-list').html("");
for (i = 0; i < marketingName.length; i++) {
    var str = '<li> <a href="#" data-item="' + marketingImg[i] + '" data-type="marketing"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/marketing/' + marketingImg[i] + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em">' + marketingName[i] + '</p> <p><span class="marketing-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" style="width:65%;padding:3px 10px;text-align: right;" maxlength="5"> <i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
    $('.marketing-list').append(str);
}
$('.main').on('pagebeforeshow', function (event, data) {
    var prevPage = data.prevPage.attr('id');
    $('.go-back').attr('href', "#" + prevPage);
});
$('#add-agent .go-back').bind('click', function () {
    location.reload();
});
// take picture from camera
$('.but_take').each(function () {
    $(this).on('click', function () {
        navigator.camera.cleanup();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 20
            , targetWidth: 900
            , targetHeight: 900
            , allowEdit: true
            , sourceType: Camera.PictureSourceType.CAMERA
            , destinationType: Camera.DestinationType.FILE_URL
            , encodingType: Camera.EncodingType.JPEG
        });
    });
});
// upload select 
$('.but_select').each(function () {
    $(this).on('click', function () {
        navigator.camera.cleanup();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50
            , targetWidth: 900
            , targetHeight: 900
            , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            , allowEdit: true
            , destinationType: Camera.DestinationType.FILE_URI
            , encodingType: Camera.EncodingType.JPEG
        });
    });
});
// receipt upload select 
$('.upload-receipt').each(function () {
    $(this).on('click', function () {
        navigator.camera.cleanup();
        navigator.camera.getPicture(receiptonSuccess, onFail, {
            quality: 50
            , targetWidth: 900
            , targetHeight: 900
            , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            , allowEdit: false
            , destinationType: Camera.DestinationType.FILE_URI
            , encodingType: Camera.EncodingType.JPEG
        });
    });
});
// Change image source and upload photo to server
var imageFile;
$('.upload-profile-img').each(function () {
    $(this).on('click', function () {
        if (imageFile != null || imageFile != "") {
            $("#preloader").show();
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = imageFile.substr(imageFile.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";
            var params = {};
            params.value1 = "test";
            params.value2 = "param";
            options.params = params;
            options.chunkedMode = false;
            var ft = new FileTransfer();
            ft.upload(imageFile, api + "upload.php?obe_id=" + localStorage.getItem('obe_sessionID'), function (result) {
                $('.profile-img').attr('src', imageFile + '?' + Math.random());
                $("#preloader").delay(1000).fadeOut("slow").hide();
                //                alert('successfully uploaded ' + result.response);
            }, function (e) {
                //                alert('error : ' + JSON.stringify(error));
                $("#preloader").delay(1000).fadeOut("slow").hide();
                e.preventDefault();
                alert('Oops, something went wrong!');
            }, options);
        }
    });
});

function onSuccess(imageURI) {
    // Set image source
    $('.preview-img').attr('src', imageURI + '?' + Math.random());
    //    var image = document.getElementsByClassName('profile-img');
    //    image.src = imageURI + '?' + Math.random();
    imageFile = imageURI;
}

function receiptonSuccess(imageURI) {
    if (imageURI != null || imageURI != "") {
        $("#preloader").show();
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        var params = {};
        params.value1 = "test";
        params.value2 = "param";
        options.params = params;
        options.chunkedMode = false;
        var ft = new FileTransfer();
        ft.upload(imageURI, api + "upload-receipt.php?obe_id=" + localStorage.getItem('obe_sessionID'), function (result) {
            $("#preloader").delay(1000).fadeOut("slow").hide();
            localStorage.setItem("obe_paymentMade", "true");
            $('#upload-receipt').hide();
            alert("Payment accepted, please wait for our validation.\nThank you.");
            //                alert('successfully uploaded ' + result.response);
        }, function (e) {
            //                alert('error : ' + JSON.stringify(error));
            $("#preloader").delay(1000).fadeOut("slow").hide();
            e.preventDefault();
            alert('Oops, something went wrong!');
        }, options);
    }
}

function onFail(message) {
    //    alert('Failed because: ' + message);
}
$('.cancel-img-update').on('click', function () {
    $('.preview-img').attr('src', $('.profile-img').attr('src'));
});
if (localStorage.getItem("obe_sessionROLE") == "Agent") {
    $('[data-user=stockist]').hide();
    $('[data-user=agent]').show();
    $('[data-user=agent-new]').show();
    $('[data-user=super]').hide();
}
else if (localStorage.getItem("obe_sessionROLE") == "Stockist") {
    $('[data-user=agent]').hide();
    $('[data-user=stockist]').show();
    $('[data-user=agent-new]').hide();
    $('[data-user=super]').hide();
}
else if (localStorage.getItem("obe_sessionROLE") == "Mini Stockist") {
    $('[data-user=agent]').show();
    $('[data-user=stockist]').show();
    $('[data-user=agent-new]').hide();
    $('[data-user=super]').hide();
}
else {
    $('[data-user=stockist]').hide();
    $('[data-user=agent]').hide();
    $('[data-user=agent-new]').show();
    $('[data-user=super]').hide();
}
if (localStorage.getItem("obe_paymentMade") == "true") {
    $('#upload-receipt').hide();
}
else {
    $('#upload-receipt').show();
}
$('.marketing-list').hide();
$('#show-marketing-only').on('click', function () {
    $('.marketing-list').show();
    $('.product-list').hide();
});
$('#show-product-only').on('click', function () {
    $('.marketing-list').hide();
    $('.product-list').show();
});
//$('.reload-page').on('click', function () {
//    location.reload();
//});

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

$('#add-agent .add_agent').on('click', function () {
    if (confirm("Add this agent?")) {
        $("#preloader").show();
        if ($(this).val() != "Agent Username" || $(this).val() != "") {
            $.get(api + 'GO_USER_PROFILE.php?action=network', {
                agent_username: $('#add-agent form input[name=agent_username]').val(),
                obe_id: localStorage.getItem('obe_sessionID')
            }, function (response) {
                if (response == 1) {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    if (confirm("Agent added, add more?") == false) {
                        $.mobile.navigate("#profile");
                        location.reload();
                    } else {
                        $('#add-agent form input[name=agent_username]').val("Agent Username");
                    }
                } else {
                    $("#preloader").delay(1000).fadeOut("slow").hide();
                    alert(response);
                }
            });
        }
    }
});
$.get(api + 'GO_STOCKIST_CONTROLLER.php?action=agent_list&sorting=top' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
    $('#profile .agent_list').html("");
    response = JSON.parse(response);
    for (i = 0; i < response.length; i++) {
        var order_count;
        if (response[i].order_count != null) {
            order_count = response[i].order_count;
        } else {
            order_count = "0";
        }
        var str = '<li> <a href="#agent-detail" data-agent-id=' + response[i].obe_id + '> <label class="digits" style="float: left;"> ' + response[i].agent_name + ' </label><span class="day_name" style="float: right">' + order_count + ' pcs</span> <div class="clear"></div> </a> </li>';
        if (i < 5) {
            $('#profile .agent_list').append(str);
        }
    }
    $('[href=#agent-detail]').each(function () {
        $(this).on('click', function () {
            var agent_id = $(this).attr('data-agent-id');
            $.get(api + 'GO_STOCKIST_CONTROLLER.php?action=agent_performance' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
                response = JSON.parse(response);
                console.log(response);
                for (i = 0; i < response.length; i++) {
                    if (response[i].obe_id == agent_id) {
                        $('#agent-detail .agent_name').html(response[i].agent_name);
                        $('#agent-detail .user_name').html(response[i].user_callsign);
                        $('#agent-detail .date_join').html(response[i].created_date);
                        $('#agent-detail .last_order').html(response[i].last_order_date);
                        $('#agent-detail .last_quantity').html(evadeNull(response[i].last_quantity)+"pcs");
                        $('#agent-detail .total_order').html(evadeNull(response[i].total_quantity)+"pcs");
                    }
                }
            });
        });

        function evadeNull(value){
            if(value != null){
                return value;
            }else{
                return "0";
            }          
        }
    });
});
$.get(api + 'GO_STOCKIST_CONTROLLER.php?action=agent_list' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
    $('#all-agent .agent_list').html("");
    response = JSON.parse(response);
    for (i = 0; i < response.length; i++) {
        var str = '<li><a href="#agent-detail" data-agent-id=' + response[i].obe_id + '>' + response[i].agent_name + '<label class="digits" style="background: #4eb75c;">Active</label></a></li>';
        $('#all-agent .agent_list').append(str);
    }
    $('[href=#agent-detail]').each(function () {
        $(this).on('click', function () {
            var agent_id = $(this).attr('data-agent-id');
            $.get(api + 'GO_STOCKIST_CONTROLLER.php?action=agent_performance' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
                response = JSON.parse(response);
                console.log(response);
                for (i = 0; i < response.length; i++) {
                    if (response[i].obe_id == agent_id) {
                        $('#agent-detail .agent_name').html(response[i].agent_name);
                        $('#agent-detail .user_name').html(response[i].user_callsign);
                        $('#agent-detail .date_join').html(response[i].created_date);
                        $('#agent-detail .last_order').html(response[i].last_order_date);
                        $('#agent-detail .last_quantity').html(evadeNull(response[i].last_quantity)+"pcs");
                        $('#agent-detail .total_order').html(evadeNull(response[i].total_quantity)+"pcs");
                    }
                }
            });
        });

        function evadeNull(value){
            if(value != null){
                return value;
            }else{
                return "0";
            }          
        }
    });
});

$('#add-order .product-list input').each(function () {
    $(this).on('blur', function () {
        var productTotal = 0;
        $('#add-order .product-list input').each(function () {
            if ($(this).val() != '') {
                productTotal += parseInt($(this).val());
            }
            $('#add-order input[name=total_product]').val(productTotal);
        });
    });
});
$('#add-order .marketing-list input').each(function () {
    $(this).on('blur', function () {
        var marketingTotal = 0;
        $('#add-order .marketing-list input').each(function () {
            if ($(this).val() != '') {
                marketingTotal += parseInt($(this).val());
            }
            $('#add-order input[name=total_marketing]').val(marketingTotal);
        });
    });
});
$('#add-order .order-now').on('click', function () {
    if ($('textarea[name=order_desc]').val() != "Name, address, phone number and note" && ($('#add-order input[name=total_product]').val() != 0 || $('#add-order input[name=total_marketing]').val() != 0)) {
        var method = "POST";
        if (confirm("Place order?") == true) {
            var jsonProduct = [];
            $('#add-order li a').each(function () {
                var id = $(this).attr("data-item");
                var type = $(this).attr("data-type");
                var quantity = $(this).find('input').val();
                item = {}
                item["product_id"] = id;
                item["type"] = type;
                item["quantity"] = quantity;
                if (quantity != 0) {
                    jsonProduct.push(item);
                }
            });
            localStorage.setItem('obe_sessionORDERITEMS', JSON.stringify(jsonProduct));
            $.get(api + 'GO_ORDER_CONTROLLER.php?action=order', {
                agent_id: localStorage.getItem('obe_sessionID'),
                stockist_id: localStorage.getItem('obe_sessionSTOCKISTID'),
                order_detail: jsonProduct,
                total_quantity: $('input[name=total_product]').val(),
                note: $('textarea[name=order_desc]').val()
            }, function (response) {
                if (method == "POST" && response > 0) {
                    localStorage.setItem('obe_sessionORDERID', response);
                    alert("Order sent");
                    $.mobile.navigate("#profile");
                    location.reload();
                } else {
                    if(response == 0){
                        alert("Order failed, invalid/inactive Stockist");
                        location.reload();
                    }else{
                        alert("We are having difficulties processing your order.\nPlease try again.");
                    }
                }
            });
        }
    } else {
        alert("Please complete order form.");
    }
});

$.get(api + 'GO_ORDER_CONTROLLER.php?action=agent_order_history' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {   
    response = JSON.parse(response);
    var rLength = response.length;
    console.log(response);
    function generateList(){
        $('#profile .outgoing-order').html("");
        $('#outgoing-order .outgoing-order').html("");
        $('#show-new .new-order').html("");
        $('#show-complete .complete-order').html("");
        $('#show-total .total-order').html("");
        var new_count = 0;
        var complete_count = 0;
        for (i = 0; i < response.length; i++) {
            if (response[i].order_status != null) {
                if (response[i].order_status == "New") {
                    new_count++;
                    $('.new-count').html(new_count);
                    $('.total-count').html(new_count + complete_count);
                }
                if (response[i].order_status == "Completed") {
                    complete_count++;
                    $('.complete-count').html(complete_count);
                    $('.total-count').html(new_count + complete_count);
                }
                var pquantity = 0;
                var mquantity = 0;
                var itemArr = JSON.parse(response[i].order_detail);
                $.each(itemArr, function (j, item) {
                    if (item.type == "product") {
                        pquantity += parseInt(item.quantity);
                    } else if (item.type == "marketing") {
                        mquantity += parseInt(item.quantity);
                    }
                });
                var order_date = response[i].order_date.split("/");
                var year = order_date[2].split('');

                var str = '<li style="position:relative">' + checkOrder(response[i].status) + '<a href="#order-detail" data-order-id=' + response[i].order_id + '><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div></a></li>';
                if (i < 5 && response[i].status == "New") {
                    $('#profile .outgoing-order').append(str);
                }
                $('#outgoing-order .outgoing-order').append(str);
                if (response[i].status == "New") {
                    var str2 = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-new .new-order').append(str2);
                }
                if (response[i].status == "Completed") {
                    var str2 = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-complete .complete-order').append(str2);
                }
                if (response[i].status == "New" || response[i].status == "Completed") {
                    var str2 = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-total .total-order').append(str2);
                }

            }
        }
    }

    if(rLength != 0 && $('#show-new .new-order li').length == 0){
        generateList();
    }
    if(rLength != 0 && $('#show-new .complete-order li').length == 0){
        generateList();
    }
    if(rLength != 0 && $('#show-new .total-order li').length == 0){
        generateList();
    }

    $('[href=#order-detail]').each(function () {
        $(this).bind('click', function () {
            var orderID = $(this).attr('data-order-id');
            localStorage.setItem('obe_sessionCURRENTORDER', orderID);
            for (i = 0; i < response.length; i++) {
                if (response[i].order_id == orderID) {
                    var order_date = response[i].order_date.split("/");
                    var pquantity = 0;
                    var mquantity = 0;
                    var itemArr = JSON.parse(response[i].order_detail);
                    $.each(itemArr, function (j, item) {
                        if (item.type == "product") {
                            pquantity += parseInt(item.quantity);
                        } else if (item.type == "marketing") {
                            mquantity += parseInt(item.quantity);
                        }
                    });

                    $('.agent_name').html(response[i].user_name);
                    $('.username').html(response[i].user_callsign);
                    $('.date_order').html(order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + "&nbsp;");
                    $('.time_order').html(response[i].order_time);
                    $('.p-quantity_order').html(pquantity + "pcs");
                    $('.m-quantity_order').html(mquantity + "pcs");
                    $('.status-badge').html(response[i].status);
                    $('.order_note').html(response[i].note);

                    if (response[i].status == "Completed") {
                        $('.status-badge').css('background', '#11a8ab');
                        $('.id_order').html(response[i].order_id + '&nbsp;');
                        $('#order-detail .complete-wrapper .complete_on').html(response[i].clear_date);
                        $('#order-detail .signin_facebook').hide();
                    } else if (response[i].status == "New") {
                        $('.id_order').html(response[i].order_id + '&nbsp;');
                        $('.status-badge').css('background', '#e64c65');
                        $('.complete-wrapper').hide();
                        $('#order-detail .signin_facebook').show();
                    }

                    if (localStorage.obe_sessionROLE == "Agent") {
                        $('#order-detail .signin_facebook').hide();
                    }
                }
            }
        });
    });
    $('[href=#quantity-break]').each(function () {
        $(this).bind('click', function () {
            var itemType = $(this).find('label').attr('class');
            if (itemType == "p-quantity_order") {
                $('#quantity-break .quantity-title').html("Product Order Details");
                $('#quantity-break .order-detail label.p-quantity_order').show();
                $('#quantity-break .order-detail label.m-quantity_order').hide();
                $('#quantity-break .product-list-order').show();
                $('#quantity-break .marketing-list-order').hide();
                $('.product-list-order').html("");
                for (i = 0; i < response.length; i++) {
                    if (response[i].agent_id == localStorage.getItem('obe_sessionID') && response[i].order_id == localStorage.getItem('obe_sessionCURRENTORDER')) {
                        var orderDetail = response[i].order_detail;
                        orderDetail = JSON.parse(orderDetail);
                        $.each(orderDetail, function (j, item) {
                            if (item.type == "product") {
                                var str = '<li> <a href="#" data-item="' + item.product_id + '" data-type="product"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/fleur/' + item.product_id + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em;text-transform:capitalize">' + item.product_id.split('-').join(' ') + '</p> <p><span class="product-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" value="' + item.quantity + '" style="width:65%;padding:3px 10px;text-align: right;" disabled><i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
                                $('.product-list-order').append(str);
                            }
                        });
                    }
                }
            } else if (itemType == "m-quantity_order") {
                $('#quantity-break .quantity-title').html("Marketing Order Details");
                $('#quantity-break .order-detail label.m-quantity_order').show();
                $('#quantity-break .order-detail label.p-quantity_order').hide();
                $('#quantity-break .marketing-list-order').show();
                $('#quantity-break .product-list-order').hide();
                $('.marketing-list-order').html("");
                for (i = 0; i < response.length; i++) {
                    if (response[i].agent_id == localStorage.getItem('obe_sessionID') && response[i].order_id == localStorage.getItem('obe_sessionCURRENTORDER')) {
                        var orderDetail = response[i].order_detail;
                        orderDetail = JSON.parse(orderDetail);
                        $.each(orderDetail, function (j, item) {
                            if (item.type == "marketing") {
                                var str = '<li> <a href="#" data-item="' + item.product_id + '" data-type="product"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/marketing/' + item.product_id + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em;text-transform:capitalize">' + item.product_id.split('-').join(' ') + '</p> <p><span class="product-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" value="' + item.quantity + '" style="width:65%;padding:3px 10px;text-align: right;" disabled><i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
                                $('.marketing-list-order').append(str);
                            }
                        });
                    }
                }
            }
        });
    });
});
$.get(api + 'GO_ORDER_CONTROLLER.php?action=stockist_order_history' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
    response = JSON.parse(response);
    var rLength = response.length;
    console.log(response);
    function generateList(){
        var new_count = 0;
        var complete_count = 0;
        $('#profile .incoming-order').html("");
        $('#incoming-order .incoming-order').html("");
        $('#show-new .new-order').html("");
        $('#show-complete .complete-order').html("");
        $('#show-total .total-order').html("");
        for (i = 0; i < response.length; i++) {
            if (response[i].order_status != null) {
                if (response[i].order_status == "New") {
                    new_count++;
                    $('.new-count').html(new_count);
                    $('.total-count').html(new_count + complete_count);
                }
                if (response[i].order_status == "Completed") {
                    complete_count++;
                    $('.complete-count').html(complete_count);
                    $('.total-count').html(new_count + complete_count);
                }
                var pquantity = 0;
                var mquantity = 0;
                var itemArr = JSON.parse(response[i].order_detail);
                $.each(itemArr, function (j, item) {
                    if (item.type == "product") {
                        pquantity += parseInt(item.quantity);
                    } else if (item.type == "marketing") {
                        mquantity += parseInt(item.quantity);
                    }
                });
                var order_date = response[i].order_date.split("/");
                var str = '<li style="position:relative">' + checkOrder(response[i].status) + '<a href="#order-detail" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div></a></li>';
                if (i < 5 && response[i].status == "New") {
                    $('#profile ul.incoming-order').append(str);
                }
                $('#incoming-order .incoming-order').append(str);

                if (response[i].status == "New") {
                    var str2 = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-new .new-order').append(str2);
                }else if (response[i].status == "Completed") {
                    var str2 = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-complete .complete-order').append(str2);
                }
                if (response[i].status == "New" || response[i].status == "Completed") {
                    var str2 = '<li style="position:relative">' + checkOrder(response[i].status) + '<a href="#order-detail" style="position: relative;" data-order-id="' + response[i].order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + response[i].order_time + ' <label class="digits"> ' + response[i].user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(response[i].agent_id) + '"></div></a> </li>';
                    $('#show-total .total-order').append(str2);
                }
            }
        }
    }

    if(rLength != 0 && $('#show-new .new-order li').length == 0){
        generateList();
    }
    if(rLength != 0 && $('#show-new .complete-order li').length == 0){
        generateList();
    }
    if(rLength != 0 && $('#show-new .total-order li').length == 0){
        generateList();
    }

    $('[href=#order-detail]').each(function () {
        $(this).bind('click', function () {
            var orderID = $(this).attr('data-order-id');
            localStorage.setItem('obe_sessionCURRENTORDER', orderID);
            for (i = 0; i < response.length; i++) {
                if (response[i].order_id == orderID) {
                    var order_date = response[i].order_date.split("/");
                    var pquantity = 0;
                    var mquantity = 0;
                    var itemArr = JSON.parse(response[i].order_detail);
                    $.each(itemArr, function (j, item) {
                        if (item.type == "product") {
                            pquantity += parseInt(item.quantity);
                        } else if (item.type == "marketing") {
                            mquantity += parseInt(item.quantity);
                        }
                    });

                    $('.agent_name').html(response[i].user_name);
                    $('.username').html(response[i].user_callsign);
                    $('.date_order').html(order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + "&nbsp;");
                    $('.time_order').html(response[i].order_time);
                    $('.p-quantity_order').html(pquantity + "pcs");
                    $('.m-quantity_order').html(mquantity + "pcs");
                    $('.status-badge').html(response[i].status);
                    $('.order_note').html(response[i].note);

                    if (response[i].status == "Completed") {
                        $('#order-detail .complete-wrapper').show();
                        $('.status-badge').css('background', '#11a8ab');
                        $('.id_order').html(response[i].order_id + '&nbsp;');
                        $('#order-detail .complete-wrapper .complete_on').html(response[i].clear_date);
                        $('#order-detail .signin_facebook').hide();
                    } else if (response[i].status == "New") {
                        $('.id_order').html(response[i].order_id + '&nbsp;');
                        $('.status-badge').css('background', '#e64c65');
                        $('#order-detail .complete-wrapper').hide();
                        $('#order-detail .signin_facebook').show();
                    }
                }
            }
        });
    });
    $('[href=#quantity-break]').each(function () {
        $(this).bind('click', function () {
            var itemType = $(this).find('label').attr('class');
            if (itemType == "p-quantity_order") {
                $('#quantity-break .quantity-title').html("Product Order Details");
                $('#quantity-break .order-detail label.p-quantity_order').show();
                $('#quantity-break .order-detail label.m-quantity_order').hide();
                $('#quantity-break .product-list-order').show();
                $('#quantity-break .marketing-list-order').hide();
                $('.product-list-order').html("");
                for (i = 0; i < response.length; i++) {
                    if (response[i].stockist_id == localStorage.getItem('obe_sessionID') && response[i].order_id == localStorage.getItem('obe_sessionCURRENTORDER')) {
                        var orderDetail = response[i].order_detail;
                        orderDetail = JSON.parse(orderDetail);
                        $.each(orderDetail, function (j, item) {
                            if (item.type == "product") {
                                var str = '<li> <a href="#" data-item="' + item.product_id + '" data-type="product"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/fleur/' + item.product_id + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em;text-transform:capitalize">' + item.product_id.split('-').join(' ') + '</p> <p><span class="product-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" value="' + item.quantity + '" style="width:65%;padding:3px 10px;text-align: right;" disabled><i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
                                $('.product-list-order').append(str);
                            }
                        });
                    }
                }
            } else if (itemType == "m-quantity_order") {
                $('#quantity-break .quantity-title').html("Marketing Order Details");
                $('#quantity-break .order-detail label.m-quantity_order').show();
                $('#quantity-break .order-detail label.p-quantity_order').hide();
                $('#quantity-break .marketing-list-order').show();
                $('#quantity-break .product-list-order').hide();
                $('.marketing-list-order').html("");
                for (i = 0; i < response.length; i++) {
                    if (response[i].stockist_id == localStorage.getItem('obe_sessionID') && response[i].order_id == localStorage.getItem('obe_sessionCURRENTORDER')) {
                        var orderDetail = response[i].order_detail;
                        orderDetail = JSON.parse(orderDetail);
                        $.each(orderDetail, function (j, item) {
                            if (item.type == "marketing") {
                                var str = '<li> <a href="#" data-item="' + item.product_id + '" data-type="product"> <table style="width: 100%"> <tr> <td style="width: 35%;padding:0;"><img src="images/marketing/' + item.product_id + '.jpeg" style="width: 80px;height: 80px;border: 3px solid #50597b;border-radius: 50%;"></td> <td style="width:65%;padding:0 0 0 10px;vertical-align:top;color:#fff;"> <p style="font-size: 1.3em;text-transform:capitalize">' + item.product_id.split('-').join(' ') + '</p> <p><span class="product-order" style="margin: 0;position: absolute;width: 50%;"> <input type="number" name="order_quantity" value="' + item.quantity + '" style="width:65%;padding:3px 10px;text-align: right;" disabled><i>pcs</i> </span> </p> </td> </tr> </table> <div class="clear"></div> </a> </li>';
                                $('.marketing-list-order').append(str);
                            }
                        });
                    }
                }
            }
        });
    });
});

$('.complete-now').on('click', function () {
    if (confirm("Complete order?")) {
        $('#preloader').show();
        $.get(api + 'GO_ORDER_CONTROLLER.php?action=complete' + '&order_id=' + localStorage.getItem('obe_sessionCURRENTORDER'), function (response) {
            console.log(response);
            if (response == 1) {
                $("#preloader").delay(1000).fadeOut("slow").hide();
                alert("Order Completed");
                //                location.reload();
            }
        });
    }
});

function checkOrder(status) {
    var checked = '<span style="position: absolute; right: 5px; top:5px;"><img src="images/check.png" id="remove" alt="" style="width:16px"></span>';
    if (status == "Completed") {
        return checked;
    } else {
        return "";
    }
}

function ioCheck(agent_id) {
    if (agent_id == localStorage.getItem('obe_sessionID')) {
        return "outgoing";
    } else {
        return "incoming";
    }
}

$('.search-now').each(function () {
    $(this).on('click', function () {
        var value = $(this).parent().parent().find("form input").val();
        var section = $(this).attr('data-section');
        searchOrder(value, section);
    });
});

function searchOrder(value, section) {
    if(section == "Completed"){
        var section_lc = '#show-'+section.toLocaleLowerCase().slice(0,-1)+' .'+section.toLocaleLowerCase().slice(0,-1)+'-order';
    }else{
        var section_lc = '#show-'+section.toLocaleLowerCase()+' .'+section.toLocaleLowerCase()+'-order';
    }
    var role = "agent";
    if(localStorage.getItem('obe_sessionROLE') == "Stockist"){
        role = "stockist";
    }
    $('#preloader').show();
    $.get(api + 'GO_ORDER_CONTROLLER.php?action='+role+'_order_history' + '&obe_id=' + localStorage.getItem('obe_sessionID'), function (response) {
        $("#preloader").delay(1000).fadeOut("slow").hide();
        response = JSON.parse(response);
        $(section_lc).html("");
        $.each(response, function (i, v) {
            if (section != "Total") {
                if (v.user_name.toLowerCase().indexOf(value.toLowerCase()) >= 0 && v.status == section) {
                    var order_date = response[i].order_date.split("/");
                    var str = '<li><a href="#order-detail" style="position: relative;" data-order-id="' + v.order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + v.order_time + ' <label class="digits"> ' + v.user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(v.agent_id) + '"></div></a> </li>';
                    $(section_lc).append(str);
                }
            } else {
                if (v.user_name == value) {
                    var order_date = response[i].order_date.split("/");
                    var str = '<li style="position:relative">'+checkOrder(v.status)+'<a href="#order-detail" style="position: relative;" data-order-id="' + v.order_id + '"><span class="day_name">' + order_date[0] + '/' + order_date[1] + '/' + order_date[2][2] + order_date[2][3] + '</span>&nbsp; ' + v.order_time + ' <label class="digits"> ' + v.user_name + ' </label><div class="clear"></div><div id="box-' + ioCheck(v.agent_id) + '"></div></a> </li>';
                    $(section_lc).append(str);
                }
            }
        });
    });
}

var superID = ["55"];
var sessionID = localStorage.getItem('obe_sessionID');
if (superID.indexOf(sessionID) >= 0) {
    $('[data-user=super]').show();
    $('[data-user=agent-new]').hide();
    $('[href=#show-new] i').text("pending");
    $('[href=#show-complete] i').text("active");
    $('.articles_list ul a').attr('href', "#");
    var pending = 0;
    var active = 0;
    $.get(api + 'GO_USER_PROFILE.php?action=su-subs', function (response) {
        response = JSON.parse(response);
        $('.total-count').html(response.length);
        console.log(response);
        $('.new_subs').html("");
        $.each(response, function (i, v) {
            if (v.status == "New") {
                pending++;
                var subs_date = v.start_date.split(" ");
                var str = '<li><a href="#subs-detail" data-subs-id=' + v.id + ' data-index="' + i + '"><span class="day_name">' + subs_date[0] + '</span><label class="digits"> ' + v.user_name + ' </label><div class="clear"></div></a></li>';
                $('.new_subs').append(str);
            }
            else if (v.status == "Active") {
                active++;
            }
        });
        if ($('.new_subs li').length == 0) {
            var str = '<li style="text-align:center"><a href="#">No new subscription<div class="clear"></div></a></li>';
            $('.new_subs').append(str);
        }
        $('.new-count').html(pending);
        $('.complete-count').html(active);
        var ind;
        $('[href=#subs-detail]').each(function () {
            $(this).on('click', function () {
                var subsid = $(this).attr('data-subs-id');
                ind = $(this).attr('data-index');
                $('.receipt-view').attr('src', api + "payment/" + response[ind].payment);
                $('.subs_id').html(response[ind].obe_id);
                $('.subs_name').html(response[ind].user_name);
                $('.current_status').html(response[ind].status);
                $('.expired_date').html(response[ind].end_date);
            });
        });
        $('.renew-accept').on('click', function () {
            if(confirm("Approve user?")){
                $.get(api + 'GO_USER_PROFILE.php?action=su-approve', {
                    id: response[ind].id
                }, function (response) {
                    if (response == 1) {
                        alert("Subscription Approved");
                    }
                    else {
                        alert("Oops! Something went wrong.")
                    }
                    location.reload();
                });
            }
        });
        $('.renew-reject').on('click', function () {
            if(confirm("Reject user?")){
                $.get(api + 'GO_USER_PROFILE.php?action=su-reject', {
                    id: response[ind].id
                }, function (response) {
                    if (response == 1) {
                        alert("Subscription Rejected");
                    }
                    else {
                        alert("Oops! Something went wrong.")
                    }
                    location.reload();
                });
            }
        });
    });
};

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



