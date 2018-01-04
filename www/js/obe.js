$(document).on('pagechange', function (e, data) {
    var activePage = $.mobile.activePage.attr('id');
    if(activePage == "show-new"){
        
    }
});

var local_api = "api/";
var remote_api = "http://www.zfikri.tk/obe_api/";
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
} else {
    api = remote_api;
}
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
            quality: 20,
            targetWidth: 900,
            targetHeight: 900,
            allowEdit: true,
            sourceType: Camera.PictureSourceType.CAMERA,
            destinationType: Camera.DestinationType.FILE_URL,
            encodingType: Camera.EncodingType.JPEG
        });
    });
});
// upload select 
$('.but_select').each(function () {
    $(this).on('click', function () {
        navigator.camera.cleanup();
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            targetWidth: 900,
            targetHeight: 900,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG
        });
    });
});
// receipt upload select 
$('#upload-receipt').on('click', function () {
    navigator.camera.cleanup();
    navigator.camera.getPicture(receiptonSuccess, onFail, {
        quality: 50,
        targetWidth: 900,
        targetHeight: 900,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.JPEG
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
            ft.upload(imageFile, "http://www.zfikri.tk/obe_api/upload.php?obe_id=" + localStorage.getItem('obe_sessionID'), function (result) {
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
        ft.upload(imageURI, "http://www.zfikri.tk/obe_api/upload-receipt.php?obe_id=" + localStorage.getItem('obe_sessionID'), function (result) {
            $("#preloader").delay(1000).fadeOut("slow").hide();
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
} else if (localStorage.getItem("obe_sessionROLE") == "Stockist") {
    $('[data-user=agent]').hide();
    $('[data-user=stockist]').show();
    $('[data-user=agent-new]').hide();
    $('[data-user=super]').hide();
} else {
    $('[data-user=stockist]').hide();
    $('[data-user=agent]').hide();
    $('[data-user=agent-new]').show();
    $('[data-user=super]').hide();
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
$('.reload-page').on('click',function(){
    location.reload();
});