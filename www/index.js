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
            
                // ui
                $("#footer-bar").hide();
                $(".bottom-button").removeClass("tracking");
                $(this).html('<i class="material-icons">play_arrow</i>Start tracking');
            }
        }
    });
    
    
    
    $("#location-button").click(function(){
        trackboxMap.showCurrentPosition(); 
    });
    
    $("#goal-modal").modal();
	$("#goal-button").click(function(){
		$("#goal-modal-number").val("");
		$("#goal-modal").modal("open");
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
        trackbox.goals.addGoal($("#goal-modal-number").val());
		$("#goal-modal").modal("close");
    }
});


