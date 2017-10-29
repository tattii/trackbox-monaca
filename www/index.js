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
            
            // ui
            $("#footer-bar").show();
            $(".bottom-button").addClass("tracking");
            $(this).html('<i class="material-icons">stop</i>Stop tracking');

        }else{
            $sideNav.sideNav('hide');
            
            // stop tracking dialog
            var result = confirm("航跡を停止します");            
            
            if (result){
                // stop tracking
                tracking.stop();
            
                // ui
                $("#footer-bar").hide();
                $(".bottom-button").removeClass("tracking");
                $(this).html('<i class="material-icons">play_arrow</i>Start tracking');
            }
        }
    });
});


