//api link
var api_user_image = 'http://www.obe-apps.tk/obe_apiv2/upload/';
var api_product_image = 'http://www.obe-apps.tk/obe_apiv2/product/';
var api_user = 'http://www.obe-apps.tk/obe_apiv2/GO_USER_PROFILE.php?action=';
var api_order = 'http://www.obe-apps.tk/obe_apiv2/GO_ORDER_CONTROLLER.php?action=';
var api_product = 'http://www.obe-apps.tk/obe_apiv2/GO_PRODUCT_CONTROLLER.php?action=';
var api_feed = 'http://www.obe-apps.tk/obe_apiv2/GO_FEEDS_CONTROLLER.php?action=';

var api_upload = 'http://www.obe-apps.tk/obe_apiv2/upload.php?type=';
//*******************************************
//
//*******************************************
// Init App
var myApp = new Framework7({
    //    modalTitle: 'Pepin',
    // Enable Material theme
    material: true
    , cache: true
    , materialRipple: true
    , scrollTopOnNavbarClick: true
    , onAjaxStart: function (xhr) {
        myApp.showIndicator();
    }
    , onAjaxComplete: function (xhr) {
        myApp.hideIndicator();
    }
    , modalCloseByOutside: false
});
// Expose Internal DOM library
var $$ = Dom7;
// Add main view
var mainView = myApp.addView('.view-main', {});

// Add vue
// var vue = new Vue({
//     el: '#app',
//     data: {
//         message:'Hello'
//     }
// });
//*******************************************
//
//*******************************************
// LOGIN & LOGOUT
$$(document).on('click', '.alert-for-pass', function () {
    myApp.modal({
        title: 'Forgot Password ?'
        , text: 'Please enter your email'
        , afterText: '<input type="text" class="modal-text-input forgotpw-email" placeholder="Your email">'
        , buttons: [{
            text: 'OK'
            , onClick: function () {
                var email = $$('.forgotpw-email').val();
                if (email != "") {
                    myApp.showIndicator();
                    $$.get(api_user + 'forgotpassword', {
                        email: email
                    }, function (response) {
                        var response = extractAJAX(response);
                        if (response.status == true) {
                            myModal('Password Reset', response.data);
                            myApp.hideIndicator();
                            mainView.router.loadPage('login.html');
                        }
                        else {
                            myApp.hideIndicator();
                            myModal('Reset Password Error!', response.data);
                        }
                    });
                }
                else {
                    myApp.modal({
                        title: 'Forgot Password ?'
                        , text: 'Email is empty'
                        , buttons: [{
                            text: 'OK'
                        }]
                    });
                }
            }
        , }, {
            text: 'Cancel'
        , }, ]
    });
});
$$(document).on('click', '#login-btn', function () {
    myApp.showIndicator();
    if ($$('[name=user_name]').val() == "" || $$('[name=user_password]').val() == "") {
        myModal('Login Error!', 'Empty Username/Password');
        myApp.hideIndicator();
        return;
    }
    $$('#login-form').trigger('submit');
    var formData = myApp.formToJSON('#login-form');
    myApp.showIndicator();
    $$.get(api_user + 'login', $$.serializeObject(formData), function (response) {
        var response = extractAJAX(response);
        if (response.status == true) {
            Object.keys(response.data[0]).forEach(function (key) {
                localStorage.setItem('OBE_' + key, response.data[0][key]);
            });
            mainView.router.loadPage('home.html');
        }
        else {
            myModal('Login Error!', response.data);
        }
    }, function () {
        myModal('Login Error!', 'Connection Error');
    });
    myApp.hideIndicator();
});
$$(document).on('click', '.logout', function () {
    myApp.modal({
        title: 'Confirm log out ?'
        , buttons: [{
            text: 'OK'
            , onClick: function () {
                myApp.showIndicator();
                $.each(localStorage, function (key, value) {
                    if (key.indexOf("OBE_") >= 0) {
                        localStorage.removeItem(key);
                    }
                });
                window.open("index.html", "_self");
                myApp.hideIndicator();
            }
    }, {
            text: 'Cancel'
        , }, ]
    });
});
//REGISTER
$$(document).on('click', '#register-btn', function () {
    var has_empty = false;
    $('#register-form').find('input[type!="hidden"]').each(function () {
        if (!$(this).val()) {
            has_empty = true;
            return false;
        }
    });
    if (has_empty) {
        myModal('Register Error!', 'All fields required');
        return;
    }
    if ($$('[name=confirmpassword]').val() != $$('[name=regpassword]').val()) {
        myModal('Register Error!', 'Password Mismatch');
        return;
    }
    myApp.confirm('Are you sure?', 'Register', function () {
        myApp.showIndicator();
        $$('#register-form').trigger('submit');
        var formData = myApp.formToJSON('#register-form');
        $$.get(api_user + 'register', $$.serializeObject(formData), function (response) {
            var response = extractAJAX(response);
            if (response.status == true) {
                myModal('Registration Successful!', response.data);
                myApp.hideIndicator();
                mainView.router.loadPage('login.html');
            }
            else {
                myApp.hideIndicator();
                myModal('Registration Error!', response.data);
            }
        }, function () {
            myApp.hideIndicator();
            myModal('Registration Error!', 'Connection Error');
        });
    });
});
$$(document).on('click', '.fav', function () {
    $(this).toggleClass('color-change')
});
//*******************************************
//
//*******************************************
$$(document).on('pageInit', function (e) {
    // Do something here when page loaded and initialized
    var mySwiper = myApp.swiper('.swiper-container.swiper-init', {
        pagination: '.swiper-pagination'
        , paginationHide: false
        , autoplay: 3000
        , onReachEnd: function (swiper) {
            //callback function code here
        }
    });

    if (localStorage.getItem('OBE_obe_id') != null) {
        var user_img = localStorage.getItem('OBE_user_img');
        $$('.user_name').html(localStorage.getItem('OBE_user_name'));

        if (localStorage.getItem('OBE_user_img') != 'null') {
            user_img = api_user_image + localStorage.getItem('OBE_user_img');
        } else {
            user_img = 'img/default.jpg';
        }
        $$('.user_img').attr('src', user_img);
    }
});
//*******************************************
//
//*******************************************
//FUNCTIONS
function gotPic(event) {
    if (event.target.files.length === 1 && event.target.files[0].type.indexOf('img/') === 0) {
        $$('#avatar').attr('src', URL.createObjectURL(event.target.files[0]));
    }
}
function extractAJAX(response) {
    var responseJSON = JSON.parse(response);
    var dataJSON;
    if (responseJSON[0].status == true && IsJsonString(responseJSON[0].data) == true) {
        dataJSON = JSON.parse(responseJSON[0].data);
    }
    else {
        dataJSON = responseJSON[0].data;
    }
    return {
        status: responseJSON[0].status
        , data: dataJSON
    };
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}

function cari() {
    $('form#cari').addClass('layer searchbar-active');
}

function pangkah() {
    $('form#cari').removeClass('layer searchbar-active');
}

function myModal(title, text) {
    myApp.modal({
        title: title
        , text: text
        , buttons: [{
            text: 'Close'
    }]
    });
}
//*******************************************
//
//*******************************************
myApp.onPageInit('brand-new-add', function (page) {
    $$('.back-modal').on('click', function () {
        myApp.confirm('Discard this brand?', '', function () {
            mainView.router.back();
        });
    });
    $$('.brand-save').on('click', function () {
        var counter = 0;
        var required = $$('.required').length;
        $$('.item-input .required').each(function () {
            if ($$(this).val() == "") {
                $$(this).closest('li').attr('style', 'background:#ff000030');
            }
            else {
                counter++;
                $$(this).closest('li').attr('style', 'background:#fff');
            }
        });
        if (counter == required) {
            myApp.confirm('Add brand ?', '', function () {
                myApp.showIndicator();
                $$.get(api_product + 'addbrand&obe-id=' + localStorage.getItem('OBE_obe_id') + '&' + $('#new-brand-form').serialize(), function (response) {
                    var response = extractAJAX(response);
                    if (response.status == true) {
                        myApp.alert('Successfully created brand', '');
                        callAPI(api_product, "brandlist");
                        mainView.router.loadPage('my-brand.html');
                    }
                    else {
                        myModal('Error!', response.data);
                    }
                    myApp.hideIndicator();
                });
            });
        }
        else {
            myApp.hideIndicator();
        }
    });
});
//*******************************************
//
//*******************************************
function callAPI(type, section) {
	$$.get(type + section + '&obe-id=' + localStorage.getItem('OBE_obe_id'), function(response){
		var response = extractAJAX(response);
		// console.log(response.data);
		if (response.status == true && response.data != localStorage.getItem('OBE_' + section)) {
			localStorage.setItem('OBE_' + section, JSON.stringify(response.data));

			// if (section == "follower-list") {
			// 	console.log(response.data);
			// }
		} else {
			if (section == 'to-ship' || section == 'shipping' || section == 'completed') {
				localStorage.removeItem('OBE_' + section);
			}
		}
    });
}

var imageFile;
function product_onSuccess(imageURI) {
    mainView.router.loadPage('new-product.html');
    // Set image source
    $('.product-image img').attr('src', imageURI + '?' + Math.random());
    imageFile = imageURI;
}

function product_onFail(message) {
    //    alert('Failed because: ' + message);
}

//*******************************************
//
//*******************************************
myApp.onPageInit('home', function (page) {
    var obe_id = localStorage.getItem('OBE_obe_id');
    if (obe_id != null) {
        $$('.user-callsign').html(localStorage.getItem('OBE_user_callsign'));
        mainView.router.loadPage('home.html');
    }
    else {
        mainView.router.loadPage('login.html');
    }
}).trigger();

var tabClick;

myApp.onPageInit('home', function (page) {
    callAPI(api_product, "categorylist");
    callAPI(api_order, "to-ship");
    callAPI(api_order, "shipping");
    callAPI(api_order, "completed");
    callAPI(api_feed, "feeds");
    callAPI(api_product, "brandlist");
    callAPI(api_user, "following-list");
    callAPI(api_user, "follower-list");
    callAPI(api_user, "network-info");
    callAPI(api_product, "brandcards");

    $$('.refresh-page').on('click', function () {
        page.view.router.refreshPage();
    });

    var buyArr = [];
    var sellArr = [];
    var buyChart = [];
    var sellChart = [];

    function formatDate(date){
        var dd = date.getDate();
        var mm = date.getMonth()+1;
        if(dd<10) {dd='0'+dd}
        if(mm<10) {mm='0'+mm}
        date = dd + "/" + mm;
        return date;
    }

    function Last7Days() {
        var result = [];
        for (var i=0; i<7; i++) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            result.push( formatDate(d) );
        }

        return(result);
    }

    var completed = JSON.parse(localStorage.getItem('OBE_completed'));

    console.log(completed);

    if (completed) {
        $.each(completed, function (j, k) {
            var order_date = k.completed_date.split(" ");
            order_date = order_date[0];
            order_date = order_date.split("-");
            order_date = order_date[2] + "/" + order_date[1];

            if (k.stockist_id == localStorage.getItem('OBE_obe_id') && Last7Days().indexOf(order_date) >= 0) {
                sellArr.push(order_date);
            } else {
                sellArr.push(null);
            }

            if (k.agent_id == localStorage.getItem('OBE_obe_id') && Last7Days().indexOf(order_date) >= 0) {
                buyArr.push(order_date);
            } else {
                buyArr.push(null);
            }
            
        });

        sell = { };
        for(var i = 0; i < sellArr.length; ++i) {
            if(!sell[sellArr[i]])
                sell[sellArr[i]] = 0;
            ++sell[sellArr[i]];
        }

        buy = { };
        for(var i = 0; i < buyArr.length; ++i) {
            if(!buy[buyArr[i]])
                buy[buyArr[i]] = 0;
            ++buy[buyArr[i]];
        }

        $.each(Last7Days(), function (i, v) {
            if (sell[v] != undefined) {
                sellChart.push(sell[v]);
            }else {
                sellChart[i] = 0;
            }

            if (buy[v] != undefined) {
                buyChart.push(buy[v]);
            }else {
                buyChart[i] = 0;
            }
        });
    }

    console.log(buyChart);
    

    var ctx = $('#chart');
    var myChart = new Chart(ctx, {
        type: 'line'
        , data: {
            datasets: [{
                label: 'Buying'
                , data: buyChart.reverse()
                , backgroundColor: 'transparent'
                , borderColor: 'rgba(255,99,132,1)'
                , borderWidth: 1
                , lineTension: 0
            , }, {
                label: 'Selling'
                , data: sellChart.reverse()
                , backgroundColor: 'transparent'
                , borderColor: '#36a2eb'
                , borderWidth: 1
                , lineTension: 0
            , }]
            , labels: Last7Days().reverse()
        }
        , options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1
                    }
                }]
            }
            , responsive: true
            , legend: {
                position: 'top'
                , labels: {
                    usePointStyle: true
                }
            }
        }
    });

    $$('.trigger-actionsheet').on('click', function () {
        var buttons = [
            {
                text: '<i class="icon material-icons" style="margin-right:8px;color:#777;">&#xE8A0;</i>Open'
        }, {
                text: '<i class="icon material-icons" style="margin-right:8px;color:#777;">&#xE7FD;</i>View User'
        }
            , {
                text: '<i class="icon material-icons" style="margin-right:8px;color:#777;">&#xE92B;</i>Remove'
                , color: 'red'
        }
    , ];
        myApp.actions(buttons);
    });

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
    

    $$('.open-vertical-modal').on('click', function () {
        myApp.modal({
            title: 'Add product from'
            , verticalButtons: true
            , buttons: [
                {
                    text: 'Camera'
                    , onClick: function () {
                        if (getMobileOperatingSystem() == "Android") {
                            navigator.camera.cleanup();
                            navigator.camera.getPicture(product_onSuccess, product_onFail, {
                                quality: 20
                                , targetWidth: 900
                                , targetHeight: 900
                                , allowEdit: true
                                , sourceType: Camera.PictureSourceType.CAMERA
                                , destinationType: Camera.DestinationType.FILE_URL
                                , encodingType: Camera.EncodingType.JPEG
                            });
                        } else {
                            myApp.alert('You clicked camera!')
                            mainView.router.loadPage('new-product.html');
                        }
                    }
                }, 
                {
                    text: 'Photos'
                    , onClick: function () {
                        if (getMobileOperatingSystem() == "Android") {
                            navigator.camera.cleanup();
                            navigator.camera.getPicture(product_onSuccess, product_onFail, {
                                quality: 50
                                , targetWidth: 900
                                , targetHeight: 900
                                , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
                                , allowEdit: true
                                , destinationType: Camera.DestinationType.FILE_URI
                                , encodingType: Camera.EncodingType.JPEG
                            });
                        } else {
                            myApp.alert('You clicked photos!')
                            mainView.router.loadPage('new-product.html');
                        }
                    }
                }
            ]
        })
    });

    var brandCards = JSON.parse(localStorage.getItem('OBE_brandcards'));

    if (brandCards) {
        $$('.brand-cards').html("");
        $.each(brandCards, function (i, v) {
            if(v.user_img == null){
                v.user_img = 'default.jpg';
            }
            var setting = '<a href="#" class="link icon-only"> <i class="material-icons fav">favorite</i> </a> <a href="#" class="link icon-only"> <i class="material-icons">book</i> </a>';

            if (v.owner_id == localStorage.getItem('OBE_obe_id')) {
                setting = '<a href="#" class="link icon-only"> <i class="material-icons brand-setting">&#xE8B8;</i> </a>';
            }

            if (v.product_count > 0) {
                var brandStr = '<div class="card ks-card-header-pic brand-card-row" style="margin-bottom:15px;"> <div class="navbar article"> <div class="navbar-inner opacity-container-top"> <div class="center">' + v.brand_name + '</div> <div class="right"> ' + setting + ' </div> </div> </div> <div class="header-container" style="margin-top: -53px;"> <a href="brand-page.html?bid=' + v.brand_id + '&bname=' + v.brand_name + '&up=' + v.uplevel_id + '"> <div style="background-image:url(img/fleur.jpg)" valign="bottom" class="card-header color-white no-border"></div> </a> </div> <div class="card-footer"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"> </div> <div class="item-inner" style="margin-left: 20px;"> <div class="row no-gutter" style="text-align: left;"> <div class="col-100 info" style="text-align: left;font-weight:;font-size: 3vmin;margin-bottom: -10px; color: grey;">'+v.user_name+'</div> <div class="row" style="padding-top:10px;text-align: left;font-size:1vmin;margin-bottom: 5px;"> <div class="col-10" style="text-align: left;"> <i class="material-icons small-rating">star</i> </div> <div class="col-10" style="text-align: left;"> <i class="material-icons small-rating">star</i> </div> <div class="col-10" style="text-align: left;"> <i class="material-icons small-rating">star</i> </div> <div class="col-10" style="text-align: left;"> <i class="material-icons small-rating">star</i> </div> <div class="col-10" style="text-align: left;"> <i class="material-icons small-unrating">star</i> </div> <div class="col-10" style="text-align: left;"> </div> <div class="col-40" style="text-align: left;"> <div style="font-size: 3vmin;color: grey;line-height: 3vmin;font-weight: lighter;">(Ratings)</div> </div> </div> </div> </div> <div class="icon-social"> <div class="link icon-only" style="color: green; padding-right: 15px; font-size: 4vmin;">' + v.product_count + ' Products</div> </div> </div> </div>';
                $$('.brand-cards').append(brandStr);
            }
        });
    }

    if ($$('.brand-card-row').length == 0) {
        $$('.brand-title').hide();
    }
    
    var feeds = JSON.parse(localStorage.getItem('OBE_feeds'));     
    $$('.feed-list').html("");
    if (feeds){
        var newOrder = 0;
        var shipping = 0;
        var completed = 0;
        
        $.each(feeds, function (i, v) {
            if(v.user_img == null){
                v.user_img = 'default.jpg';
            }
            if (v.type == "order" && v.status == "New") {
                newOrder++;
                var feedStr = '<li style="border-bottom:1px solid lightgray"><a href="#" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"/><span style="margin-left:8px;">'+v.user_name+' sent you an order</span></div><span style="float:right;" class="trigger-actionsheet"><i style="margin-right:16px;color:#777" class="material-icons"></i></span></a></li>';
                $$('.feed-list').append(feedStr);
            }else if(v.type == "product" && v.obe_id != localStorage.getItem('OBE_obe_id')){
                var feedStr = '<li style="border-bottom:1px solid lightgray"><a href="product.html?pid='+v.id+'" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"/><span style="margin-left:8px;">'+v.user_name+' created new product</span></div><span style="float:right;" class="trigger-actionsheet"><i style="margin-right:16px;color:#777" class="material-icons"></i></span></a><img src="'+api_product_image+v.product_image+'" style="width:100%;max-height:55vw;object-fit:cover;"></li>';
                $$('.feed-list').append(feedStr);
            }

            if (v.type == "order" && v.status == "Processed") {
                shipping++;
            } else if (v.type == "order" && v.status == "Completed") {
                completed++;
            }

        });
        $$('.new-order').html(newOrder);

        localStorage.setItem('OBE_to-ship_count', newOrder);
        localStorage.setItem('OBE_shipping_count', shipping);
        localStorage.setItem('OBE_completed_count', completed);

    }

    if ($('.feed-list li').length == 0) {
        var feedStr = '<li><a href="#" class="item-link item-content">Nothing to show</a></li>';
        $$('.feed-list').append(feedStr);
    }

    var json1 = JSON.parse(localStorage.getItem('OBE_to-ship'));
    var json2 = JSON.parse(localStorage.getItem('OBE_completed'));

    var orderDetail;

    if (json1 != null && json2 != null) {
        orderDetail = json1.concat(json2);
    } else {
        if (json1 != null) {
            orderDetail = json1;
        } else {
            orderDetail = json2;
        }
    }

    if (orderDetail) {
        var countOrderNew = 0;
        $$('.order-list').html("");
        $.each(orderDetail, function (i, v) {
            var product = JSON.parse(v.order_detail);

            var product_count = 0;

            $.each(product, function (j, k) {
                product_count += parseInt(k.quantity);
            });

            var image = v.agent_img;
            var name = v.agent_name;
            if (v.agent_id == localStorage.getItem('OBE_obe_id')) {
                image = v.stockist_img;
                name = v.stockist_name;
            }

            if (v.status == "New") {
                countOrderNew++;
            }

            if(image == null){
                image = 'default.jpg';
            }

            var orderStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+image+'" width="80"/></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+name+'</div> <div class="item-after">'+product_count+' pcs</div> </div> <div class="item-subtitle">'+v.brand_name+'</div> <div class="item-text text-' + v.status + '">'+v.status+'</div> </div></a></li>';
            $$('.order-list').append(orderStr);
        });
        
        if (countOrderNew == 0) {
            $$('.order-badge').hide();
        } else {
            $$('.order-badge').html(countOrderNew);
        }
    } else {
        $$('.order-badge').hide();
    }

    

    var noti_list = localStorage.getItem('OBE_notifications');
    var noti_count = 0;

    if (noti_list) {
        noti_list = JSON.parse(noti_list);
        $.each(noti_list, function(i, v){
            if (v.obe_id == localStorage.getItem('OBE_obe_id') && v.network_status == 'Active' && v.click != true) {
                noti_count++;
            } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.network_status == 'Applied' && v.click != true) {
                noti_count++;
            } else if (v.obe_id == localStorage.getItem('OBE_obe_id') && v.status == 'Completed' && v.click != true) {
                noti_count++;
            } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.status == 'New' && v.click != true) {
                noti_count++;
            }
        });
    }

    if (noti_count == 0) {
        $$('.notification-badge').hide();
    } else {
        $$('.notification-badge').html(noti_count);
    }

});
//*******************************************
//
//*******************************************
myApp.onPageInit('my-brand', function (page) {
    callAPI(api_product, "brandlist");
    var brandList = JSON.parse(localStorage.getItem('OBE_brandlist'));
    if (brandList) {
        $$('.my-brand-list').html("");
        $.each(brandList, function (i, v) {
            var brandStr = '<li style="border-bottom:1px solid lightgray"> <a href="#" class="item-link item-content brand-cta" data-brand-id="' + v.brand_id + '"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"><span style="margin-left:8px;">' + v.brand_name + '</span></div></a> </li>';
            $$('.my-brand-list').append(brandStr);
        });
    }
    else {
        var brandStr = '<li style="border-bottom:1px solid lightgray"> <a href="#" class="item-link item-content"> <span style="margin-left:8px;">' + brandList + '</span></a> </li>';
        $$('.my-brand-list').append(brandStr);
    }
    $$('.brand-cta').each(function () {
        $$(this).on('click', function () {
            var brand_id = $$(this).attr('data-brand-id');
            var brand_name = $(this).children().find('span').html();
            mainView.router.loadPage('new-product.html?brand_id=' + brand_id + '&brand_name=' + brand_name);
        });
    });
});
//*******************************************
//
//*******************************************
myApp.onPageInit('my-purchase', function (page) {
    if (!tabClick) {
        tabClick = '#to-pay';
    }
    $$(tabClick).addClass('active');
    $('[href=' + tabClick + ']').addClass('active'); 
    switch (tabClick) {
    case '#to-pay':
        $$('.mypurchase-tab .tab-link-highlight').attr('style', 'width: 33.3333%;margin-left:0;');
        break;
    case '#to-receive':
        $$('.mypurchase-tab .tab-link-highlight').attr('style', 'width: 33.3333%; margin-left:33.3333%;');
        break;
    case '#completed':
        $$('.mypurchase-tab .tab-link-highlight').attr('style', 'width: 33.3333%; margin-left:66.6666%;');
        break;
    }
    
    $$('.to-pay-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(0%, 0px, 0px);');
    });

    $$('.to-receive-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(100%, 0px, 0px);');
    });

    $$('.completed-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(200%, 0px, 0px);');
    });

    var json1 = JSON.parse(localStorage.getItem('OBE_to-ship'));
    var json2 = JSON.parse(localStorage.getItem('OBE_shipping'));
    var json3 = JSON.parse(localStorage.getItem('OBE_completed'));

    var orderArr = [json1, json2, json3];
    var orderDetail = [];

    $.each(orderArr, function(i, v) {
        if (v != "null" && orderDetail != []) {
            orderDetail.concat(v);
        } else {
            orderDetail = v;
        }
    });

    console.log(orderDetail);

    if (orderDetail != []) {
        myApp.showIndicator();
        $.each(orderDetail, function (i, v) {
            console.log(v);
            var product = JSON.parse(v.order_detail);

            var product_count = 0;

            var image = v.agent_img;
            var name = v.agent_name;
            if (v.agent_id == localStorage.getItem('OBE_obe_id')) {
                image = v.stockist_img;
                name = v.stockist_name;

                if(image == null){
                    image = 'default.jpg';
                }

                $.each(product, function (j, k) {
                    product_count += parseInt(k.quantity);
                });

                var orderStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+image+'" width="80"/></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+name+'</div> <div class="item-after">'+product_count+' pcs</div> </div> <div class="item-subtitle">'+v.brand_name+'</div> <div class="item-text">'+v.note+'</div> </div></a></li>';
                

                switch(v.status) {
                    case 'New':
                        $$('.pay-list').append(orderStr);  
                        break;
                    case 'Processed':
                        $$('.receive-list').append(orderStr);
                        break;
                    case 'Completed':
                        $$('.completed-list').append(orderStr);
                        break;
                }
            }

        });
        myApp.hideIndicator();
    } 

});
//*******************************************
//
//*******************************************
myApp.onPageInit('my-sales', function (page) {
    if (!tabClick) {
        tabClick = '#to-ship';
    }
    $$(tabClick).addClass('active');
    $('[href=' + tabClick + ']').addClass('active'); 
    switch (tabClick) {
    case '#to-ship':
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(0%, 0px, 0px);');
        break;
    case '#shipping':
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(100%, 0px, 0px);');
        break;
    case '#completed':
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(200%, 0px, 0px);');
        break;
    }

    $$('.to-ship-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(0%, 0px, 0px);');
    });

    $$('.shipping-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(100%, 0px, 0px);');
    });

    $$('.completed-tab').on('click', function(){
        $$('.mysales-tab .tab-link-highlight').attr('style', 'width: 33.3333%; transform: translate3d(200%, 0px, 0px);');
    });

    
    var toShip = JSON.parse(localStorage.getItem('OBE_to-ship'));
    var newOrder = 0;
    if (toShip) {
        myApp.showIndicator();
        $.each(toShip, function (i, v) {
            newOrder++;

            var image = v.agent_img;
            var name = v.agent_name;
            if (v.agent_id == localStorage.getItem('OBE_obe_id')) {
                image = v.stockist_img;
                name = v.stockist_name;

                if(image == null){
                    image = 'default.jpg';
                }

                var product = JSON.parse(v.order_detail);

                var product_count = 0;

                $.each(product, function (j, k) {
                    product_count += parseInt(k.quantity);
                });

                var orderStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+image+'" width="80"/></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+name+'</div> <div class="item-after">'+product_count+' pcs</div> </div> <div class="item-subtitle">'+v.brand_name+'</div> <div class="item-text">'+v.note+'</div> </div></a></li>';
                $$('.order-list').append(orderStr);
            }
        });
        myApp.hideIndicator();
    }
        
    var shipping = JSON.parse(localStorage.getItem('OBE_shipping'));

    if (shipping) {
        myApp.showIndicator();
        $.each(shipping, function (i, v) {
            var product = JSON.parse(v.order_detail);

            var product_count = 0;

            var image = v.agent_img;
            var name = v.agent_name;
            if (v.stockist_id == localStorage.getItem('OBE_obe_id')) {
                image = v.stockist_img;
                name = v.stockist_name;

                if(image == null){
                    image = 'default.jpg';
                }

                $.each(product, function (j, k) {
                    product_count += parseInt(k.quantity);
                });

                var orderStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+image+'" width="80"/></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+name+'</div> <div class="item-after">'+product_count+' pcs</div> </div> <div class="item-subtitle">'+v.brand_name+'</div> <div class="item-text">'+v.note+'</div> </div></a></li>';
                $$('.shipping-list').append(orderStr);
            }
        });
        myApp.hideIndicator();
    }
        

    var completed = JSON.parse(localStorage.getItem('OBE_completed'));

    if (completed) {
        myApp.showIndicator();
        $.each(completed, function (i, v) {
            var product = JSON.parse(v.order_detail);

            var product_count = 0;

            var image = v.agent_img;
            var name = v.agent_name;
            if (v.stockist_id == localStorage.getItem('OBE_obe_id')) {
                image = v.stockist_img;
                name = v.stockist_name;

                if(image == null){
                    image = 'default.jpg';
                }

                $.each(product, function (j, k) {
                    product_count += parseInt(k.quantity);
                });

                var orderStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+image+'" width="80"/></div> <div class="item-inner"> <div class="item-title-row"> <div class="item-title">'+name+'</div> <div class="item-after">'+product_count+' pcs</div> </div> <div class="item-subtitle">'+v.brand_name+'</div> <div class="item-text">'+v.note+'</div> </div></a></li>';
                $$('.completed-list').append(orderStr);
            }
        });
        myApp.hideIndicator();
    } 
});
//*******************************************
//
//*******************************************
myApp.onPageInit('network', function (page) {
    $$('.show-on-search').hide();
    $$('.search-user').on('click', function () {
        $$('.hide-on-search').hide();
        $$('.show-on-search').attr('style','background: rgb(246, 108, 38); padding: 0px 15px 0px 0px; display: content;');
        $('.show-on-search .user-search').get(0).focus();
    });
    $$('.searchbar-clear').on('click', function () {
        $('.show-on-search .user-search').get(0).focus();
    });
    $('.show-on-search .user-search').focusout(function() {
        $$('.show-on-search').hide();
        $$('.hide-on-search').show();
        $('.show-on-search .user-search').val("");
    });

    var followingList = JSON.parse(localStorage.getItem('OBE_following-list'));

    if (followingList) {
        // $$('.following-badge').html(followingList.length);
        $$('.following-list').html("");
        var searchStr='';
        $.each(followingList, function (i, v) {
            if(v.user_img == null){
                v.user_img = 'default.jpg';
            }
            
            searchStr = searchStr+'<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"><span style="margin-left:8px;">'+v.user_name+'</span></div></a></li>';
        });
        $$('.following-list').html(searchStr);
        myApp.hideIndicator();
    }else{
        // $$('.following-list').html("");
        // var searchStr = '<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content">'+followingList+'</a></li>';
        // $$('.following-list').append(searchStr);
        myApp.hideIndicator();
    }

    var followerList = JSON.parse(localStorage.getItem('OBE_follower-list'));

    if (followerList) {
        // $$('.follower-badge').html(followerList.length);
        $$('.follower-list').html("");
        var searchStr='';
        $.each(followerList, function (i, v) {
            if(v.user_img == null){
                v.user_img = 'default.jpg';
            }
            
            searchStr = searchStr+'<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"><span style="margin-left:8px;">'+v.user_name+'</span></div></a></li>';
        });
        $$('.follower-list').html(searchStr);
        myApp.hideIndicator();
    }else{
        // $$('.follower-list').html("");
        // var searchStr = '<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content">'+followerList+'</a></li>';
        // $$('.follower-list').append(searchStr);
        myApp.hideIndicator();
    }

    var followingCount = $('.following-list li').length;
    var followerCount = $('.follower-list li').length;

    if (followingCount == 0) {
        $$('.following-badge').hide();
    } else {
        $$('.following-badge').html(followingCount);
    }

    if (followerCount == 0) {
        $$('.follower-badge').hide();
    } else {
        $$('.follower-badge').html(followerCount);
    }
});

function process(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    var searchValue = $('.show-on-search .user-search').val();
    if (code == 13 && searchValue != "") { //Enter keycode
        myApp.showIndicator();
        $$.get(api_user + 'search-user&id=' + localStorage.getItem('OBE_obe_id') + '&sp=' + searchValue, function (response) {
            var response = extractAJAX(response);
            if (response.status == true) {
                console.log(response.data);
                $$('.search-result-list').html("");
                var searchStr='';
                $.each(response.data, function (i, v) {
                    if(v.user_img == null){
                        v.user_img = 'default.jpg';
                    }

                    var buttonbg = '#f06a30';
                    var clickgo = "followUser("+v.obe_id+")";
                    var buttonText = '+ Follow';

                    if(v.parent_id != null){
                        var parentArr = [];
                        parentArr = v.parent_id.split(',');
                        $.each(parentArr, function(i,parent_id){
                            if(parent_id == localStorage.getItem('OBE_obe_id')){
                                buttonbg = '#b9b7b6';
                                clickgo = '';
                                buttonText = 'Following';
                            }
                        });
                    }

                    if(v.status == 'Applied'){
                        buttonbg = '#b9b7b6';
                        clickgo = '';
                        buttonText = 'Applied';
                    }
                    
                    searchStr = searchStr+'<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"><span style="margin-left:8px;">'+v.user_name+'</span></div><span style="float:right;margin-right:10px;background:'+buttonbg+';padding:5px 10px;color:#fff;font-size:12px;" onclick='+clickgo+'>'+buttonText+'</span></a></li>';
                });
                $$('.search-result-list').html(searchStr);
                $$('.search-result-list').prepend('<li style="border-bottom:5px solid #f2f2f2"><a href="#" class="item-link item-content">'+response.data.length+' user found<span class="clear-search" style="float:right;padding:5px 10px;color:#f06a30;font-size:12px;" onclick="hideResult()">Clear Search</span></a></li>');
                myApp.hideIndicator();
            }else{
                $$('.search-result-list').html("");
                var searchStr = '<li style="border-bottom:1px solid #f2f2f2"><a href="#" class="item-link item-content">'+response.data+'<span class="clear-search" style="float:right;padding:5px 10px;color:#f06a30;font-size:12px;" onclick="hideResult()">Clear Search</span></a></li>';
                $$('.search-result-list').append(searchStr);
                myApp.hideIndicator();
            }
        });
    }
}

function hideResult(){
    $$('.search-result-list').html("");
}

function followUser(obe_id){
    myApp.modal({
        title: 'Follow this user ?'
        , buttons: [{
            text: 'OK'
            , onClick: function () {
                $$.get(api_user + 'follow-user&id=' + obe_id + '&uid=' + localStorage.getItem('OBE_obe_id'), function (response) {
                    var response = extractAJAX(response);
                    if (response.status == true) {
                        myApp.modal({
                            title: 'Request to follow successfully sent'
                            , text: response.data
                            , buttons: [{
                                text: 'OK'
                            }]
                        });
                    }else{
                        myApp.modal({
                            title: ''
                            , text: 'Request to follow failed'
                            , buttons: [{
                                text: 'Close'
                            }]
                        });
                    }
                });
            }
    }, {
            text: 'Cancel'
        , }, ]
    });
}
//*******************************************
//
//*******************************************
var indVar = 1;
var wholesaleJSON = [];
myApp.onPageInit('new-product', function (page) {
    if (page.query.brand_name) {
        $$('.brand-name').html(page.query.brand_name);
        $('input[name=brand-id]').val(page.query.brand_id)
    }
    
    callAPI(api_product, "categorylist");
    var category_list = JSON.parse(localStorage.getItem('OBE_categorylist'));
    $$('.product-category-list').html("");
    $.each(category_list, function (i, v) {
        var catStr = '<option value="' + v.category_id + '">' + v.category_name + '</option>';
        $$('.product-category-list').append(catStr);
    });

    $$('.variation-show').hide();
    $('[data-page=new-product] .back-modal').on('click', function () {
        myApp.confirm('Discard this product?', '', function () {
            mainView.router.loadPage('home.html');
        });
    });
    $$('.variation-add').on('click', function () {
        $$('input[name=variation-price-main]').removeClass('required');
        var varStr = '<li class="variation-show var_' + indVar + '"> <div class="item-content"> <div class="item-media" data-section="variation-field" onclick="removeVar(\'.var_' + indVar + '\');" style="align-self: auto;margin-top: 30px;"><i class="icon material-icons">&#xE15C;</i></div> <div class="item-inner"> <ul style="padding: 0;"> <li> <div class="item-content" style="padding:0;"> <div class="item-media"><i class="icon material-icons">&#xE3DE;</i></div> <div class="item-inner"> <div class="item-title floating-label">Type</div> <div class="item-input"> <input type="text" class="variant-type required" placeholder="Type"> </div> </div> </div> </li> <li> <div class="item-content" style="padding:0;"> <div class="item-media"><i class="icon material-icons">&#xE227;</i></div> <div class="item-inner"> <div class="item-title floating-label">Price</div> <div class="item-input"> <input class="variation-price variant-price required" type="number" placeholder="Price"> </div> </div> </div> </li> <li> <div class="item-content" style="padding:0;"> <div class="item-media"><i class="icon material-icons">&#xE53B;</i></div> <div class="item-inner"> <div class="item-title floating-label">Stock</div> <div class="item-input"> <input type="number" class="variant-stock" placeholder="Stock"> </div> </div> </div> </li> </ul> </div> </div> </li>';
        $$('.variation-hide').hide();
        $('.variation-list').before(varStr);
        var varPrice = $$('input[name=variation-price-main]').val();
        if (varPrice) {
            $$('input.variation-price').parent().addClass('not-empty-state');
            $$('input.variation-price').parent().parent().addClass('not-empty-state');
            $$('input.variation-price').val(varPrice).addClass('not-empty-state');
            $$('input.variation-price').removeClass('variation-price');
        }
        $$('.variation-show').show();
        indVar++;
    });
    $$('.product-save').on('click', function () {
        var counter = 0;
        var required = $$('.required').length;
        if ($$('.variation-show').length > 0) {
            $$('[name=variation-price-main]').removeClass('required');
        }
        $$('.item-input .required').each(function () {
            if ($$(this).val() == "") {
                $$(this).closest('li').attr('style', 'background:#ff000030');
            }
            else {
                counter++;
                $$(this).closest('li').attr('style', 'background:#fff');
            }
        });
        if (counter == required) {
            myApp.confirm('Add product ?', '', function () {
                myApp.showIndicator();
                var variationJSON = [];
                $$('.variation-show').each(function () {
                    var data = '{"variation_type":"' + $(this).find('.variant-type').val() + '", "variation_price":"' + $(this).find('.variant-price').val() + '", "variation_stock":"' + $(this).find('.variant-stock').val() + '"}'
                    variationJSON.push(data);
                });

                $$.get(api_product + 'addproduct&obe-id=' + localStorage.getItem('OBE_obe_id') + '&' + $('#new-product-form').serialize() + "&product-variant=[" + variationJSON + "]&wholesale=[" + wholesaleJSON + "]", function (response) {
                    var response = extractAJAX(response);
                    if (response.status == true) {
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
                        ft.upload(imageFile, api_upload + "product&action=new&id=" + response.id, function (result) {
                            myApp.confirm('Add another product ?', response.data, function () {
                                mainView.router.reloadPage('new-product.html'); 
                            }, function () {
                                mainView.router.loadPage('home.html');
                            });
                        }, function (e) {
                            e.preventDefault();
                            myModal('Error!', response.data);
                        }, options);
                        
                    }
                    else {
                        myModal('Error!', response.data);
                    }
                    myApp.hideIndicator();
                });
            });
        }
        else {
            myApp.hideIndicator();
        }
    });
});

function removeVar(target) {
    if ($$('.variation-show').length == 1) {
        $$('.variation-hide').show();
        $$('input[name=variation-price-main]').addClass('requireds');
    }
    $(target).remove();
    indVar--;
}
//*******************************************
//
//*******************************************
myApp.onPageInit('notifications', function (page) { //Change icon when add or delete person
    $$(document).on('click', 'i.material-icons.add', function () {
        $(this).replaceWith('<div class="item-after"><i class="material-icons done">done</i></div>');
    });
    $$(document).on('click', 'i.material-icons.done', function () {
        $(this).replaceWith('<div class="item-after"><i class="material-icons add">&#xE7FE;</i></div>');
    });

    var noti_list = localStorage.getItem('OBE_notifications');
    noti_list = JSON.parse(noti_list);

    if (noti_list) {
        reloadNotification();
    }

    function reloadNotification() {
        $$('.notification-list').html("");
        $.each(noti_list, function(i, v){
            var click = "noti-tag";
            if (v.click == true) {
                click = "ex-noti-tag";
            }
            
            var statusStr = '';

            var user_img = v.user_img;

            if (v.user_img != null) {
                user_img = api_user_image + v.user_img;
            } else {
                user_img = 'img/default.jpg';
            }

            var noti_date;

            var update_date = new Date(v.date.toString());
            var current_date = new Date();
            var yesterday = current_date.getDate()-1;
            var display_date = update_date.getDate() + "-" + (update_date.getMonth()+1) + "-" + update_date.getFullYear();
            if (update_date.getDate() == yesterday && update_date.getFullYear() == current_date.getFullYear() && update_date.getMonth() == current_date.getMonth()) {
                noti_date = "Yesterday " + update_date.toLocaleTimeString();
            } else if (update_date.getDate() == current_date.getDate() && update_date.getFullYear() == current_date.getFullYear() && update_date.getMonth() == current_date.getMonth()) {
                noti_date = "Today " + update_date.toLocaleTimeString();
            } else {
                noti_date = display_date + " " + update_date.toLocaleTimeString();
            }

            var action_needed = '<a href="#" data-id="' + i + '" data-network-id="' + v.network_id + '" style="display:inline-block;text-align:center;padding: 10px 0;width: 49%; border-right: 1px solid #666; color:#f66c26;" class="item-link acceptReq">Accept</a><a href="#" data-id="' + i + '" data-network-id="' + v.network_id + '" style="display:inline-block;text-align:center;padding: 10px 0;width: 50%;" class="item-link rejectReq">Reject</a>';

            var noti_show = true;
            var origin;

            if (v.network_id) {
                if (v.obe_id == localStorage.getItem('OBE_obe_id') && v.network_status == 'Active') {
                    statusStr = 'has accepted your request.';
                    origin = v.to_user;
                    action_needed = '';
                } else if (v.obe_id == localStorage.getItem('OBE_obe_id') && v.network_status == 'Rejected') {
                    statusStr = 'has rejected your request.';
                    origin = v.to_user;
                    action_needed = '';
                } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.network_status == 'Applied') {
                    statusStr = 'has requested to follow you.';
                    origin = v.from_user;
                } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.network_status == 'Active') {
                    action_needed = '';
                    noti_show = false;
                } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.network_status == 'Rejected') {
                    action_needed = '';
                    noti_show = false;
                } 

                var notiStr = '<li><a href="#" data-id="' + i + '" class="item-link item-content ' + click + '"> <div class="item-media"><img src="' + user_img + '" width="80"/></div> <div class="item-inner"> <div class="item-text"><span style="font-weight: bold;">' + origin + '</span> ' + statusStr + '</div> <div style="background:none;" class="item-title-row"> <div style="margin-left:0;" class="item-after">' + noti_date + '</div> </div> </div></a>' + action_needed + '</li>';

                if (noti_show == true) {
                    $$('.notification-list').append(notiStr);
                }
            } else if (v.order_id) {
                if (v.obe_id == localStorage.getItem('OBE_obe_id') && v.status == 'Completed') {
                    statusStr = 'has completed your order.';
                    origin = v.to_user;

                    var notiStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" data-id="' + i + '" class="item-link item-content ' + click + '"> <div class="item-media"><img src="' + user_img + '" width="80"/></div> <div class="item-inner"> <div class="item-text"><span style="font-weight: bold;">' + origin + '</span> ' + statusStr + '</div> <div style="background:none;" class="item-title-row"> <div style="margin-left:0;" class="item-after">' + noti_date +  '</div> </div> </div></a></li>';     
                    $$('.notification-list').append(notiStr);
                } else if (v.obe_id != localStorage.getItem('OBE_obe_id') && v.status == 'New') {
                    statusStr = 'has sent you an order.';
                    origin = v.user_name;

                    var notiStr = '<li><a href="order-detail.html?oid=' + v.order_id + '" data-id="' + i + '" class="item-link item-content ' + click + '"> <div class="item-media"><img src="' + user_img + '" width="80"/></div> <div class="item-inner"> <div class="item-text"><span style="font-weight: bold;">' + origin + '</span> ' + statusStr + '</div> <div style="background:none;" class="item-title-row"> <div style="margin-left:0;" class="item-after">' + noti_date +  '</div> </div> </div></a></li>';

                    $$('.notification-list').append(notiStr);
                }
            }       
        });
    }

    $$('.notification-list li a').each(function(){
        $$(this).on('click', function(){
            var id = $$(this).attr('data-id');

            noti_list[id].click = true;
            localStorage.setItem('OBE_notifications', JSON.stringify(noti_list));
            reloadNotification();
        });
    });

    $$('.acceptReq').each(function(){
        $$(this).on('click', function(){
            myApp.modal({
                title: ''
                , text: 'Accept request?'
                , buttons: [{
                    text: 'Accept'
                    , onClick: function () {
                        updateNotification('network', localStorage.getItem('OBE_obe_id'));
                    }
                }, {
                    text: 'Cancel'
                }]
            });
            var network_id = $$(this).attr('data-network-id');
            var handle = "accept";
            
            handleRequest(handle, network_id);
        });
    });

    $$('.rejectReq').each(function(){
        $$(this).on('click', function(){
            var network_id = $$(this).attr('data-network-id');
            var handle = "reject";
            
            handleRequest(handle, network_id);
        });
    });

    function handleRequest(handle, network_id) {
        myApp.showIndicator();
        var chose = handle == 'accept' ? 'Active' : 'Rejected';

        $$.get(api_user + 'handle-request&res=' + chose + '&nid=' + network_id + '&uid=' + localStorage.getItem('OBE_obe_id'), function (response) {
            var response = extractAJAX(response);

            console.log(response);

            if (response.status == true) {
                myApp.hideIndicator();
                myApp.modal({
                    title: ''
                    , text: response.data
                    , buttons: [{
                        text: 'Close'
                        , onClick: function () {
                            updateNotification('network', localStorage.getItem('OBE_obe_id'));
                        }
                    }]
                });
            }
        });
    }

});

function updateNotification(type, id) {
	$$.get(api_user + 'notification&type=' + type + '&id=' + id, function (response) {
        myApp.showIndicator();
        var response = extractAJAX(response);

        if (response.status == true) {
        	var noti = response.data[0];

        	noti.date = new Date();
        	noti.click = false;

        	var noti_local = localStorage.getItem('OBE_notifications');

        	if (noti_local) {
        		noti_local = JSON.parse(noti_local);
        		var exists = false;

				$.each(noti_local, function(i, v){
					if (v.network_id == noti.network_id && v.network_status != noti.network_status && type == 'network') {
						v.network_status = noti.network_status;
						v.click = false;
						exists = true;
					}

					if (v.order_id == noti.order_id && v.status != noti.status && type == 'order') {
						v.status = noti.status;
						v.click = false;
						exists = true;
					}
				});

				if (exists == false) {
					noti_local.push(noti);
				}

				noti_local.sort(function(a,b){
					var c = new Date(a.date);
					var d = new Date(b.date);
					return d-c;
				});

				localStorage.setItem('OBE_notifications', JSON.stringify(noti_local));

        	} else {
        		noti_local = [];
        		noti_local.push(noti);

				noti_local.sort(function(a,b){
					var c = new Date(a.date);
					var d = new Date(b.date);
					return d-c;
				});

        		localStorage.setItem('OBE_notifications', JSON.stringify(noti_local));
        	}

            location.reload();
            
            myApp.hideIndicator();
        }
    });
}
//*******************************************
//
//*******************************************
myApp.onPageInit('order-detail', function (page) {
    var order_id = page.query.oid;

    var json1 = JSON.parse(localStorage.getItem('OBE_to-ship'));
    var json2 = JSON.parse(localStorage.getItem('OBE_completed'));

    var orderDetail;

    if (json1 != null && json2 != null) {
        orderDetail = json1.concat(json2);
    } else {
        if (json1 != null) {
            orderDetail = json1;
        } else {
            orderDetail = json2;
        }
    }

    $.each(orderDetail, function(i, v) {
        if (v.order_id == order_id) {
            $$('.product-cards').html('');
            var order_detail = JSON.parse(v.order_detail);
            var total_price;
            if ($.isArray(order_detail)) {
                total_price = order_detail[0].price;
            } else {
                total_price = order_detail.price;
            }

            var date2 = new Date();
            var date1 = new Date(v.created_date);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var days = Math.ceil(timeDiff / (1000 * 3600 * 24));
            var dayStr = (days > 1) ? " days ago" : " day ago";

            $$('.product-header').attr('src', api_product_image+v.product_image);
            $$('.product-name').html(v.product_name);
            $$('.product-created').html('<i class="icon material-icons" style="line-height:20px;">&#xE889;</i> '+days + dayStr + ' (' + date1.toLocaleTimeString() + ')');
            $$('.product-price').html('<i class="icon material-icons" style="line-height:20px;">&#xE54E;</i> RM'+total_price);
            $$('.note-text').html(v.note);
            // $$('.product-category').html('<i class="icon material-icons" style="line-height:20px;">&#xE8F0;</i> In '+v.category);
            // $$('.product-brand').html(brand_name);
            $$('.product-description').html('From : ' + v.agent_name);

            if ($.isArray(order_detail)) {
                $.each(order_detail, function(j, k) {
                    if (k.type == 'null') {
                        k.type = '';
                        $$('.variant-title').html('<i class="icon material-icons" style="line-height: 20px">&#xE8CC;</i> Quantity');
                    }
                    var varStr = '<li><a href="#" style="padding-left:0" class="item-content item-link">' + k.type + ' (' + k.quantity + 'pcs)<span class="right">RM' + k.price + '</span></a></li>';
                    $$('.variant-list').append(varStr);
                });
            }

            if (v.agent_id == localStorage.getItem('OBE_obe_id')) {
                $$('.order-btn').hide();
            }
        }
    });

    $$('.order-btn').on('click', function(){
        myApp.modal({
            title: ''
            , text: 'Complete this order?'
            , buttons: [{
                text: 'Yes'
                , onClick: function () {
                    myApp.showIndicator();
                    $$.get(api_order + 'complete&oid=' + order_id, function (response) {
                        var response = extractAJAX(response);
                        if (response.status == true) {
                            myApp.modal({
                                title: ''
                                , text: response.data
                                , buttons: [{
                                    text: 'Close'
                                    , onClick: function () {
                                        callAPI(api_order, "to-ship");
                                        callAPI(api_order, "shipping");
                                        callAPI(api_order, "completed");
                                        updateNotification("order", order_id);
                                        // mainView.router.loadPage('home.html');
                                    }
                                , }]
                            });
                        }
                        else {
                            myModal('Error!', response.data);
                        }
                        myApp.hideIndicator();
                    });
                }
            , }]
        });
        
    });
});
//*******************************************
//
//*******************************************
myApp.onPageInit('product', function (page) {
    var product_id = page.query.pid;
    var brand_id = page.query.bid;
    var brand_name = page.query.bname;
    var uplevel_id = page.query.up;

    $$('.order-btn').attr('product-id', product_id);

    $$('.back-product').attr('href','brand-page.html?bid='+brand_id+'&bname='+brand_name);

    $$.get(api_product + 'product_info&pid=' + product_id, function (response) {
        myApp.showIndicator();
        var response = extractAJAX(response);

        if (response.status == true) {
            $$('.product-cards').html('');
            console.log(response.data);
            $.each(response.data, function (i, v) {
                var product_price = JSON.parse(v.product_variant);
                if ($.isArray(product_price)) {
                    product_price = product_price[0].variation_price;
                } else {
                    product_price = product_price.variation_price;
                }

                var date2 = new Date();
                var date1 = new Date(v.created_date);
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var days = Math.ceil(timeDiff / (1000 * 3600 * 24));
                var dayStr = (days > 1) ? " days ago" : " day ago";

                $$('.product-header').attr('src', api_product_image+v.product_image);
                $$('.product-name').html(v.product_name);
                $$('.product-created').html('<i class="icon material-icons" style="line-height:20px;">&#xE889;</i> '+days + dayStr);
                $$('.product-price').html('<i class="icon material-icons" style="line-height:20px;">&#xE54E;</i> RM'+product_price);
                $$('.product-category').html('<i class="icon material-icons" style="line-height:20px;">&#xE8F0;</i> In '+v.category);
                $$('.product-brand').html(brand_name);
                $$('.product-description').html(v.product_description);

                var variants = JSON.parse(v.product_variant);
                console.log(variants);

                if (v.wholesale_price) {
                    var wholesale = JSON.parse(v.wholesale_price);

                    $.each(wholesale, function(j, k) {
                        var wholesaleStr = '<div class="product-detail">' + k.minorder + ' ~ ' + k.maxorder + ' RM' + k.unitprice + '/pcs</div>';
                        $$('.wholesale-prices').append(wholesaleStr);
                    });
                }

                if ($.isArray(variants)) {
                    $.each(variants, function(j, k) {
                        var varStr = '<li class="accordion-item"><a href="#" style="padding-left:0" class="item-content item-link"> <div class="item-inner">' + k.variation_type + ' (RM' + k.variation_price + '/pcs)</div></a> <div class="accordion-item-content"> <div style="padding-left:0;" class="content-block"><div class="product-detail"><input type="number" class="order-number" data-type="' + k.variation_type + '" data-id="'+j+'" data-price="' + k.variation_price + '" placeholder="Quantity"/></div></div> </div> </li>';
                        $$('.variant-list').append(varStr);
                    });
                } else {
                    $$('.variant-title').html('<i class="icon material-icons" style="line-height: 20px">&#xE8CC;</i> Quantity');

                    var varStr = '<li><div class="product-detail" style=""><input type="number" class="order-number" data-price="' + variants.variation_price + '" placeholder="Insert quantity here.."/></div></li>';
                    $$('.variant-list').append(varStr);
                }

            });
            myApp.hideIndicator();

            var order_number = 0;

            checkFields();

            function checkFields() {
                var check = $$('.order-number').filter(function () {
                    return $(this).val().trim() !== "";
                });

                return check.length !== 0;
            }

            $$('.order-number').each(function(){
                $$(this).on('keyup', function() {
                    if (checkFields() == true) {
                        $$('.note-container').css('display', 'block');
                        $$('.order-btn').removeClass('disabled');
                        var current = parseInt($$(this).val());
                        order_number += current;
                    } else {
                        $$('.note-container').css('display', 'none');
                        $$('.order-btn').addClass('disabled');
                    }
                });
            });

            var order_note = "";

            $$('.save-note').on('click', function(){
                order_note = $$('input.order-note').val();
                if (order_note) {
                    $$('.note-text').html(order_note);
                    
                }
            });

            $$('.note-text').on('click', function(){
                $$('.note-text').html(order_note);
                myApp.pickerModal('.note-modal')
            });

            $$('.cancel-note').on('click', function(){
                $$('.order-note').val(order_note);
            });

            $$('.order-btn').on('click', function(){
                myApp.modal({
                    title: ''
                    , text: 'Confirm order?'
                    , buttons: [{
                        text: 'Yes'
                        , onClick: function () {
                            myApp.showIndicator();
                            var variationJSON = [];
                            var totalNumber = 0;
                            $$('.order-number').each(function () {
                                if ($$(this).val().trim() !== "") {
                                    
                                    var data = '{"id":"' + $$(this).attr('data-id') + '","type":"' + $$(this).attr('data-type') + '", "quantity":"' + $$(this).val() + '", "price":"' + $$(this).attr('data-price') * $$(this).val() + '"}'
                                    variationJSON.push(data);
                                    totalNumber += parseInt($$(this).val());
                                }
                            });

                            $$.get(api_order + 'order&obe-id=' + localStorage.getItem('OBE_obe_id') + '&up=' + uplevel_id + '&bid=' + brand_id + '&pid=' + product_id + '&ov=[' + variationJSON + ']&tn=' + totalNumber + '&note=' + order_note, function (response) {
                                var response = extractAJAX(response);
                                if (response.status == true) {
                                    myApp.modal({
                                        title: ''
                                        , text: response.data
                                        , buttons: [{
                                            text: 'Close'
                                            , onClick: function () {
                                                mainView.router.loadPage('home.html');
                                            }
                                        , }]
                                    });
                                }
                                else {
                                    myModal('Error!', response.data);
                                }
                                myApp.hideIndicator();
                            });
                        }
                    , },{
                        text: 'Cancel'
                    }]
                });
            });
        }
    });
});
//*******************************************
//
//*******************************************
myApp.onPageInit('brand-page', function (page) {
    var brand_id = page.query.bid;
    var brand_name = page.query.bname;
    var uplevel_id = page.query.up;

    $$('.brand-name-inpage').html(brand_name);
    myApp.showIndicator();

    $$.get(api_product + 'product_list&bid=' + brand_id, function (response) {
        
        var response = extractAJAX(response);

        if (response.status == true) {
            // $$('.product-cards').html('');
            console.log(response.data);
            $.each(response.data, function (i, v) {
                if (v.status == 'Active') {
                    if(v.user_img == null){
                        v.user_img = 'default.jpg';
                    }
                    var product_price = JSON.parse(v.product_variant);
                    if ($.isArray(product_price)) {
                        product_price = product_price[0].variation_price;
                    } else {
                        product_price = product_price.variation_price;
                    }
              
                    var productStr = '<div class="col-50"> <article> <div class="card ks-card-header-pic product-left"><a href="product.html?pid=' + v.product_id + '&bid=' + brand_id + '&up=' + uplevel_id + '&bname=' + brand_name + '"> <div class="navbar article"> <div class="navbar-inner opacity-container-top"> <div class="center">'+v.product_name+'</div> </div> </div> <div style="margin-top: -53px;" class="header-container"> <div style="background-image:url('+api_product_image+v.product_image+')" valign="bottom" class="card-header color-white no-border"></div> </div></a> <div style="padding: 4px 8px" class="card-footer"> <div class="item-media"><img src="'+api_user_image+v.user_img+'" width="44" style="margin-top: 5px;"/></div> <div style="margin-left: 5px;" class="item-inner"> <div style="text-align: left;" class="row no-gutter"> <div style="text-align: left;font-weight:;font-size: 3vmin;margin-bottom: -10px; color: grey;" class="col-100 info">'+v.user_name+'</div> <div style="padding-top:10px;text-align: left;width: 100%;" class="row"><span class="product-price">RM'+product_price+'</span></div> </div> </div> </div> </div> </article> </div>';
                    $$('.product-cards').append(productStr);
                } 
            });
            myApp.hideIndicator();
        }
    });
});
//*******************************************
//
//*******************************************
var tabClick;
myApp.onPageInit('profile', function (page) {
    $$('i.material-icons.fav').on('click', function (e) { //Changing color icons onclick
        $$(this).toggleClass('color-change');
    });

    if (localStorage.getItem('OBE_to-ship_count') == 0) {
        $$('.to-ship-badge').hide();
    } else {
        $$('.to-ship-badge').html(localStorage.getItem('OBE_to-ship_count'));
    }

    if (localStorage.getItem('OBE_shipping_count') == 0) {
        $$('.shipping-badge').hide();
    } else {
        $$('.shipping-badge').html(localStorage.getItem('OBE_shipping_count'));
    }

    if (localStorage.getItem('OBE_completed_count') == 0) {
        $$('.complete-badge').hide();
    } else {
        $$('.complete-badge').html(localStorage.getItem('OBE_completed_count'));
    }

    var networkInfo = JSON.parse(localStorage.getItem('OBE_network-info'));

    if (networkInfo) {
        $$('.follow-num').html(networkInfo[0].following);
        $$('.follower-num').html(networkInfo[0].follow);
    }

    $$('.my-sales').on('click', function () {
        tabClick = "#to-ship";
    });

    $$('.to-pay').on('click', function () {
        tabClick = "#to-pay";
    });
    $$('.to-receive').on('click', function () {
        tabClick = "#to-receive";
    });
    $$('.completed').on('click', function () {
        tabClick = "#completed";
    });
    $$('.to-ship').on('click', function () {
        tabClick = "#to-ship";
    });
    $$('.shipping').on('click', function () {
        tabClick = "#shipping";
    });
});
//*******************************************
//
//*******************************************
var indTier = 2;
myApp.onPageInit('wholesale', function (page) {
    if (wholesaleJSON.length != 0) {
        $$('.price-tier-container').html("");
        var indTier = 2;
        var whStr = JSON.stringify(wholesaleJSON);
        $.each(wholesaleJSON, function (i, v) {
            var whStr = JSON.parse(v);
            console.log(whStr);
            var tierStr = '<div class="row price-tier-row tier_' + indTier + '"> <div style="width:12%"><i class="icon material-icons price-tier-remove" onclick="removeTier(\'.tier_' + indTier + '\')" style="line-height: 37px;">&#xE15C;</i></div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number" value="' + whStr.minorder + '" class="ws-input min-order" style="border: none; width: 100%; text-align: center;"> </div> </div> <div style="width:2%;line-height: 35px;">-</div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number" value="' + whStr.maxorder + '" class="ws-input max-order"style="border: none; width: 100%; text-align: center;"> </div> </div> <div style="width:2%;line-height: 35px;">:</div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number" value="' + whStr.unitprice + '" class="ws-input unit-price" style="border: none; width: 100%; text-align: center;"> </div> </div> </div> </div>';
            $$('.price-tier-container').append(tierStr);
            indTier++;
        });
    }
    $$('.price-tier-save').on('click', function () {
        wholesaleJSON = [];
        $$('.price-tier-row').each(function () {
            var data = '{"minorder":"' + $(this).find('.min-order').val() + '", "maxorder":"' + $(this).find('.max-order').val() + '", "unitprice":"' + $(this).find('.unit-price').val() + '"}';
            wholesaleJSON.push(data);
        });
        mainView.router.back();
        if ($$('.price-tier-row').length > 0) {
            $$('.wholesale-detail').html(">=" + $('.price-tier-container').first('.price-tier-row').find('.min-order').val() + " price RM" + $('.price-tier-container').first('.price-tier-row').find('.unit-price').val());
        }
        else {
            $$('.wholesale-detail').html("");
        }
    });
    $$('.price-tier-add').each(function () {
        $$(this).on('click', function () {
            var tierStr = '<div class="row price-tier-row tier_' + indTier + '"> <div style="width:12%"><i class="icon material-icons price-tier-remove" onclick="removeTier(\'.tier_' + indTier + '\')" style="line-height: 37px;">&#xE15C;</i></div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number" class="min-order" style="border: none; width: 100%; text-align: center;"> </div> </div> <div style="width:2%;line-height: 35px;">-</div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number"  class="max-order"style="border: none; width: 100%; text-align: center;"> </div> </div> <div style="width:2%;line-height: 35px;">:</div> <div style="width:28%"> <div class="item-input" style="margin: 2px 10px; border: 1px solid #afafaf; border-radius: 5px; padding: 5px;"> <input type="number" class="unit-price" style="border: none; width: 100%; text-align: center;"> </div> </div> </div> </div>';
            $$('.price-tier-container').append(tierStr);
            indTier++;
        });
    });
});

function removeTier(target) {
    if ($$('.price-tier-row').length == 1) {
        wholesaleJSON = [];
        $$('.wholesale-detail').html("");
    }
    $(target).remove();
    indTier--;
}