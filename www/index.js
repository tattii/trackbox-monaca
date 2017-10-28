document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

}

$(function(){
    var $sideNav = $("#menu-button a");
    $sideNav.sideNav({
        menuWidth: 240,
        onOpen: function() {},
        onClose: function() {}
    });
    
    $("#location-button").click(function(){
        trackboxMap.showCurrentPosition(); 
    });
    
    $("#start-tracking").click(function(){
        if (!tracking.tracking){
            // start tracking
            $sideNav.sideNav('hide');
            tracking.start();

        }else{
            // stop tracking dialog
            
        }
    });
});


