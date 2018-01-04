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