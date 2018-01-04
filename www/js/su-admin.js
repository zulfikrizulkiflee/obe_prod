var superID = ["55"];
var sessionID = localStorage.getItem('obe_sessionID');

if(superID.indexOf(sessionID)>=0){
    $('[data-user=super]').show();
    $('[data-user=agent-new]').hide();
    $('[href=#show-new] i').text("pending");
    $('[href=#show-complete] i').text("active");
    $('.articles_list ul a').attr('href',"#");
    var pending = 0;
    var active = 0;
    $.get(api + 'GO_USER_PROFILE.php?action=su-subs', function (response) {
        response = JSON.parse(response);
        $('.total-count').html(response.length);
        console.log(response);
        $('.new_subs').html("");
        $.each(response,function(i,v){
           if(v.status == "New"){
               pending++;
               var subs_date = v.start_date.split(" ");
               var str = '<li><a href="#subs-detail" data-subs-id=' + v.id + '><span class="day_name">' + subs_date[0] + '</span><label class="digits"> ' + v.user_name + ' </label><div class="clear"></div></a></li>';
               $('.new_subs').append(str);
           }else if(v.status == "Active"){
               active++;
//               var subs_date = v.start_date.split(" ");
//               var str = '<li><a href="#subs-detail" data-subs-id=' + v.id + '><span class="day_name">' + subs_date[0] + '</span><label class="digits"> ' + v.user_name + ' </label><div class="clear"></div></a></li>';
//               $('.new_subs').append(str);
           }
        });
        if($('.new_subs li').length == 0){
            var str = '<li style="text-align:center"><a href="#">No new subscription<div class="clear"></div></a></li>';
            $('.new_subs').append(str);
        }
        $('.new-count').html(pending);
        $('.complete-count').html(active);
    });
}