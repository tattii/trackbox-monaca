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
                stopTracking();
            }
        }
    });
    
    
    $("#new-track").click(function(){
        if (tracking.tracking){
            var result = confirm("現在のデータを破棄します");
            if (result){
                // delete traking data
                // reset all
                tracking.reset();
                stopTracking(true);

            }else{
                return;
            }
        }
        
        tracking.new();
        $(".track-nav").show();
    });
    
    $("#tracking-link").click(function(){
        var link = "https://track-box.github.io/realtime/#" + trackbox.firebase.trackid;
        window.open(link, '_system');  
    });
    
    
    $("#location-button").click(function(){
        trackbox.map.showCurrentPosition(); 
    });
    
    $("#goal-modal").modal();
	$("#goal-button").click(function(){
		$("#goal-modal-number").val("");
		$("#goal-modal").modal("open");
        $("#goal-modal-number").focus();
	});
    
    $("#goal-modal-add").click(function(){
        addGoal();
	});
	$("#goal-modal-form").submit(function(e){
		e.preventDefault();
        addGoal();
		return false;
	});
    function addGoal(){
        $("#goal-modal").modal("close");
        trackbox.goals.addGoal($("#goal-modal-number").val());
    }
    
    $("#goal-info-edit").click(function(){
        $(".goal-edit-form").show();
    });
    $("#goal-edit-save").click(function(){
        var key = $("#coord").val();
        var name = $("#name").val();
        $("#goal-info-name").text(name);
            
        var circle = [];
        if ($("#circle1").val()) circle[0] = $("#circle1").val();
        if ($("#circle2").val()) circle[1] = $("#circle2").val();
        if ($("#circle3").val()) circle[2] = $("#circle3").val();
            
        trackbox.goals.updateGoal(key, name, circle);
    });
    
    $("#goal-delete").click(function(){
        var key = $("#coord").val();
        trackbox.goals.deleteGoal(key);
        $("#goal-info").modal("close");
    });
    
    $("#map-modal").modal();
    $("#map-setting").click(function(){
        $sideNav.sideNav('hide');
        $("#map-modal").modal("open");
    });
    
    $("#map-overlay-list li").click(function(){
        if ($(this).hasClass("active")) {
            setTrackboxMap(null);

        }else{
            setTrackboxMap($(this).attr("ref"));
        }
    });
    
    $("#goal-info-modal").modal().modal("open");
    $(".modal-overlay").hide();
    $("#goal-modal-header").on("click", function(){
        if ($("#goal-info-modal").height() > 66){
            $("#goal-info-modal").velocity({ maxHeight: "66px" });
        }else{
            $("#goal-info-modal").velocity({ maxHeight: "100%" });
        }
    });
    var listener = map.addListener("click", function(){
        $("#goal-info-modal").modal("close");
        google.maps.event.removeListener(listener);
    });
});

function stopTracking(reset){
    $("#footer-bar").hide();
    $(".bottom-button").removeClass("tracking");
    $("#start-tracking").html((reset) ?
        '<i class="material-icons">play_arrow</i>Start tracking' :
        '<i class="material-icons">play_circle_outline</i>Resume tracking'
    );
}
