document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

}

$(function(){
    $("#menu-button a").sideNav({
        menuWidth: 240,
        onOpen: function() {},
        onClose: function() {}
    });
    
    $("#location-button").click(function(){
        trackboxMap.showCurrentPosition(); 
    });
});


