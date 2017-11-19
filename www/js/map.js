var map, mapName, trackbox = {}, tracking;

function onMapsApiLoaded() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(33.252814, 130.245334),
        zoom: 12,
        disableDefaultUI: true
    });

    setTrackboxMap("saga2017");
    
    // init long touch
    TrackboxLongTouch = initTrackboxLongTouch(map);
    var longtouch = new TrackboxLongTouch(map, "map");
    
    
    tracking = new Tracking();
}

function setTrackboxMap(name) {
    if (tracking && tracking.tracking) return alert("トラッキング中は変更できません");
    if (trackbox.goals && trackbox.goals.hasGoals()){
        if (!confirm("現在のデータを破棄します")) return;
    }
    
    // ui .active
    if (name != mapName){
        $("#map-overlay-list li.active").removeClass("active");
        $("#map-overlay-list li[ref='" + name + "']").addClass("active");
    }

    // remove map
    if (!name || name != mapName){
        if (trackbox.map){
            trackbox.map.remove();
            trackbox.map = null;
        }
    }

    // add map
    if (name && name != mapName){
        if (mapdefs[name]){
            trackbox.map = new TrackboxMap(mapdefs[name]);
            trackbox.map.addTo(map);
            
            // init view
            if (!trackbox.map._tileBounds.contains(map.getCenter())){
                map.setZoom(12);
                map.setCenter(new google.maps.LatLng(mapdefs[name].center[0], mapdefs[name].center[1]));
            }
        }
    }
    
    toggleNoMapUI(name);

    if (trackbox.firebase && name != mapName){
        
    }
    mapName = name;
}

function toggleNoMapUI(name){
    if (!name){
        
    }else{
        
    }
}

var mapdefs = {
    saga2017: {
        name: "Saga2017",
        bounds: [[33.07754498441214, 129.95346411545185], [33.41060691858563, 130.49726791761674]],
        center: [33.252814, 130.245334],
        zoom: { min: 5, max: 15 },
        utm: {
            zone: 52,
            xmin: 588987,
            xmax: 639232,
            ymin: 3660873,
            ymax: 3697218
        },
        url: "https://d128cdxvkxdfwx.cloudfront.net/map/saga2017",
        waypoint_url: "https://track-box.github.io/trackbox-map/saga2017/waypoint.json"
    },
    suzuka2017: {
        name: "Suzuka2017",
		bounds: [[34.64856419321580, 136.32401408639996], [35.01820185150547, 136.68759634821404]],
        center: [34.884255, 136.531435],
		zoom: { min: 5, max: 15 },
		utm: {
			zone: 53,
			xmin: 621330,
			xmax: 653978,
			ymin: 3835355,
			ymax: 3875869
		},
		url: "https://d128cdxvkxdfwx.cloudfront.net/map/suzuka2017",
		waypoint_url: "https://track-box.github.io/trackbox-map/suzuka2017/waypoint.json"
	}

};

