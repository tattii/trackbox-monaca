document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    console.log(StatusBar);
}

$(function(){
    $("#menu-button a").sideNav({
        menuWidth: 240,
        onOpen: function() {},
        onClose: function() {}
    });
});


