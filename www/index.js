document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {

}

$(function(){
    var $sideNav = $("#menu-button a");
    $sideNav.sideNav({
        menuWidth: 240,
        onOpen: function() {
            closeGoalInfoModal();
        },
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
    
    
    // goal-modal: add goal from input
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
    
    
    // map-modal: map setting
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
    
    
    $("#goal-info-modal").modal();
    $("#goal-modal-header").on("click touchstart", function(e){
        e.preventDefault();
        if ($("#goal-info-modal").height() > 66){
            $("#goal-info-modal").velocity({ maxHeight: "66px" });
        }else{
            $("#goal-info-modal").velocity({ maxHeight: "100%" });
        }
        return false;
    });
    
    $("#marker-info").modal();
});

function stopTracking(reset){
    $("#footer-bar").hide();
    $(".bottom-button").removeClass("tracking");
    $("#start-tracking").html((reset) ?
        '<i class="material-icons">play_arrow</i>Start tracking' :
        '<i class="material-icons">play_circle_outline</i>Resume tracking'
    );
}

function openWaypointInfo(name, lat, lon){
    $("#goal-add").show();
    $(".goal").hide();

    openGoalInfoModal(name, lat, lon);
    
    $("#goal-add").off("click touchstart").on("click touchstart", function(e){
        e.preventDefault();
        trackbox.goals.addGoal(name, true);
        closeGoalInfoModal();
        return false;
	});
}

function openGoalInfo(name, lat, lon, coord, circle){
    $("#goal-add").hide();
    $(".goal").show();

    $("#name").val(name);
    $("#coord").val(coord);
    
    $("#circle1").val(circle[0]);
    $("#circle2").val(circle[1]);
    $("#circle3").val(circle[2]);
    
    openGoalInfoModal(name, lat, lon);
    
    // change
    $("#name").off("change").change(function(){
        var val = $(this).val();
        if (val){
            name = val;
            $("#goal-title").text(name);
            trackbox.goals.updateGoalName(coord, name);
        }else{
            $(this).val(name);
        }
    });
    $("#circle1").off("change").change(function(){ changeGoalCircle($(this).val(), circle, 0, coord); });
    $("#circle2").off("change").change(function(){ changeGoalCircle($(this).val(), circle, 1, coord); });
    $("#circle3").off("change").change(function(){ changeGoalCircle($(this).val(), circle, 2, coord); });
    
    // delete
    $("#delete-goal").off("click").click(function(){
        var result = confirm("削除します");
        if (result){
            trackbox.goals.deleteGoal(coord);
            closeGoalInfoModal();
        }
    });
}

function changeGoalCircle(val, circle, ref, coord){
    circle[ref] = val;
    trackbox.goals.updateGoalCircle(coord, circle);
}

var goalInfoModalListener;
function openGoalInfoModal(name, lat, lon){
    if (goalInfoModalListener) google.maps.event.removeListener(goalInfoModalListener);

    $("#goal-title").text(name);
    
    $("#goal-info-modal").css({ maxHeight: "66px" }).modal("open");
    $(".modal-overlay").hide();
    
    // actions
    $("#goal-navigation").off("click").click(function(){
        if (!trackbox.map._navigation){
            trackbox.map.enableNavigation(lat, lon);
            $(this).addClass("active");
        }else{
            trackbox.map.disableNavigation();
            $(this).removeClass("active");
        }
    });
    $("#link-google-map").off("click").click(function(){
        var link = "http://maps.google.com/maps?q="+ lat +","+ lon;
        window.open(link, '_system');
    });

    setTimeout(function(){
        goalInfoModalListener = map.addListener("click", closeGoalInfoModal);
    }, 200);
}

function closeGoalInfoModal(){
    $("#goal-info-modal").modal("close");
    google.maps.event.removeListener(goalInfoModalListener);
}




var markerInfoListener;
function openMarkerInfo(name, onAdd, onClose){
    if (markerInfoListener) google.maps.event.removeListener(markerInfoListener);

    $("#marker-info-name").text(name);   
    $("#marker-info").modal("open")
    $(".modal-overlay").hide();
    
    $("#marker-add").off("click touchstart").on("click touchstart", function(e){
        e.preventDefault();
        onAdd();
        closeMarkerInfo(onClose);
        return false;
    });

    setTimeout(function(){
        markerInfoListener = map.addListener("click", function(){
            closeMarkerInfo(onClose);
        });
    }, 500);
}

function closeMarkerInfo(callback){
    $("#marker-info").modal("close")
    google.maps.event.removeListener(markerInfoListener);
    callback();
}
