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