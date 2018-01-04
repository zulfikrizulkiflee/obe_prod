// Wait for device API libraries to load
//
function onLoad() {
    FCMPlugin.getToken(function(token){
        localStorage.setItem('obe_pushToken',token);
    });
    document.addEventListener("deviceready", onDeviceReady, false);
    FCMPlugin.onNotification(function(data){
        if(data.wasTapped){
            //Notification was received on device tray and tapped by the user.
            alert(data);
        }else{
            //Notification was received in foreground. Maybe the user needs to be notified.
            alert(data);
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

var lastTimeBackPress=0;
var timePeriodToExit=2000;

function onBackKeyDown(e){
    e.preventDefault();
    e.stopPropagation();
    if(new Date().getTime() - lastTimeBackPress < timePeriodToExit){
        navigator.app.exitApp();
    }else{
        window.plugins.toast.showWithOptions(
            {
                message: "Press again to exit.",
                duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            }
        );

        lastTimeBackPress=new Date().getTime();
    }
};