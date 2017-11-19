/*
 * TrackboxGoals - trackbox goals management class
 *
 *  use 
 *  	materialize
 *  	google maps
 *  	proj4
 *
 */

/** @constructor */
function TrackboxGoals(map, trackboxMap) {
	this.map = map;

    if (trackboxMap._waypoint){
	    this._waypoint = trackboxMap._waypoint;
    }

    if (trackboxMap._def){
	    this._utm = trackboxMap._def.utm;
	    this._utm.xbase = Math.floor(this._utm.xmax / 100000) * 100000;
	    this._utm.ybase = Math.floor(this._utm.ymax / 100000) * 100000;
    }

	this._goals = {};
    
    TrackboxGoal = initTrackboxGoal();
}

TrackboxGoals.prototype.reset = function(){
    for (var key in this._goals){
        this._goals[key].goal.delete();
    }
};

TrackboxGoals.prototype.hasGoals = function(){
    return Object.keys(this._goals).length > 0;
};

TrackboxGoals.prototype.addGoal = function(x, noshow) {
	if (!x){
		return;
	}

	if (this._goals[x]){
		return;
	}

	if (x.length == 3){
		if (this._waypoint.data.waypoints[x]){
			var w = this._waypoint.data.waypoints[x];
			this._addPoint(x, w.lat, w.lon, x);
            this._showGoalName(x);

		}else{
			Materialize.toast("not found", 1000);
		}
	}else if (x.length == 8){
		var latlon = this._getDigitLatLon(x);
        var num = (Object.keys(this._goals).length + 1) + "";
		this._addPoint(num, latlon.lat, latlon.lon, x);
        this._showGoalName(x);

	}else{
		Materialize.toast("error!", 1000);
	}
};

TrackboxGoals.prototype.addPointLatLng = function(lat, lon, digit) {   
    var num = (Object.keys(this._goals).length + 1) + "";
    this._addPoint(num, lat, lon, (this._utm) ? digit : num);
};

TrackboxGoals.prototype._getDigitLatLon = function(digit) {
	var dx = parseInt(digit.substr(0, 4));
	var dy = parseInt(digit.substr(4, 4));

	var x = this._utm.xbase + dx * 10;
	var y = this._utm.ybase + dy * 10;

	if (x > this._utm.xmax) x -= 1000000;
	if (y > this._utm.ymax) y -= 1000000;

	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(utm, wgs84, [x, y]);

	return { lat: pos[1], lon: pos[0] };
};

TrackboxGoals.prototype._getDigit = function(lat, lon) {
    if (!this._utm) return lat.toFixed(5) + ", " + lon.toFixed(5);

	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(wgs84, utm, [lon, lat]);

	var x = Math.floor(pos[0] / 10);
	var y = Math.floor(pos[1] / 10);

	var dx = x % 10000;
	var dy = y % 10000;

	return "" + dx + dy;
};

TrackboxGoals.prototype._addPoint = function(name, lat, lon, coord) {
    this._goals[coord] = true;
    
	var pos = new google.maps.LatLng(lat, lon);
    var goal = new TrackboxGoal(coord, name, pos, { coord: coord }, this.map);
    
	this._goals[coord] = {
        name: name,
		pos: pos,
        lat: lat,
        lon: lon,
        coord: coord,
        circle: [],
        goal: goal
	};

    if (trackbox.firebase){
        this._goals[coord].id = trackbox.firebase.addGoal({
            name: name,
            lat: lat,
            lon: lon,
            coord: coord,
            circle: []
        });
    }
};


TrackboxGoals.prototype.addGoalsFirebase = function(firebase) {
    for (var key in this._goals){
        var goal = this._goals[key];
        var data = {
            name: goal.name,
            lat: goal.lat,
            lon: goal.lon,
            coord: goal.coord,
            circle: goal.circle
        };

        this._goals[key].id = firebase.addGoal(data);
    }
};

TrackboxGoals.prototype.updateGoal = function (key, name, circle){
    if (name != this._goals[key].name){
        this._goals[key].name = name;
        this._goals[key].goal.setName(name);
    }
    
    if (circle.length > 0){
        this._goals[key].circle = circle;
        this._goals[key].goal.setCircles(circle);
    }
    
    if (trackbox.firebase){
        var goal = this._goals[key];
        var data = {
            name: name,
            lat: goal.lat,
            lon: goal.lon,
            coord: goal.coord,
            circle: circle
        };
        trackbox.firebase.updateGoal(goal.id, data);
    }
};

TrackboxGoals.prototype.deleteGoal = function (key) {
    this._goals[key].goal.delete();
    
    if (trackbox.firebase){
        var goal = this._goals[key];
        trackbox.firebase.deleteGoal(goal.id);
    }
    this._goals[key] = null;
};

TrackboxGoals.prototype._showGoalName = function(name) {
    if (this._goals[name]){
		this.map.setZoom(14);
		this.map.panTo(this._goals[name].pos);
	}
};

TrackboxGoals.prototype._addPointMarker = function(name, lat, lon, coord, noshow) {
	this._goals[name] = true;

	var pos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: pos, 
		map: this.map
	});

    var self = this;
	marker.addListener('click', function() {
		self._showMarkerInfo(name);
	});

    if (!noshow) this._showGoal(pos);
    
	this._goals[name] = {
		pos: pos,
		marker: marker
	};
};

TrackboxGoals.prototype.showGoalInfo = function(key) {
    if (this._goals[key]){
        var goal = this._goals[key];
		var lat = goal.pos.lat();
		var lon = goal.pos.lng();

        // init
        $("#goal-info-name").text(goal.name);
		$("#goal-info-href").attr("href", "http://maps.google.com/maps?q="+ lat +","+ lon);
        $(".goal-edit-form").hide();
        
        $("#name").val(goal.name);
        if (goal.coord) $("#coord").val(goal.coord);
    
        $("#circle1").val(goal.circle[0]);
        $("#circle2").val(goal.circle[1]);
        $("#circle3").val(goal.circle[2]);

        $("#goal-info").modal().modal("open");
    }
};


TrackboxGoals.prototype._showMarkerInfo = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];
		var lat = goal.pos.lat();
		var lon = goal.pos.lng();
		$("#marker-info-name").text(name);
		$("#marker-info-href").attr("href", "http://maps.google.com/maps?q="+ lat +","+ lon);
		$("#marker-info").modal().modal("open");
	}
};

TrackboxGoals.prototype._showGoal = function(pos) {
	this.map.setZoom(14);
	this.map.panTo(pos);
};

TrackboxGoals.prototype.updatePosition = function(position) {
	if (position){
		this._lastPosition = position;

		for (var key in this._goals){
			var goal = this._goals[key];

			var distance = google.maps.geometry.spherical.computeDistanceBetween(position, goal.pos);
			var heading = google.maps.geometry.spherical.computeHeading(position, goal.pos);

			if (heading < 0) heading += 360;

			var d = Math.round(distance) + "m";
			var head = Math.round(heading) + "°";

			goal.sheet.cells[1].innerHTML = d;
			goal.sheet.cells[2].innerHTML = head;
		}
	}else if (this._lastPosition){
		this.updatePosition(this._lastPosition);
	}
};


TrackboxGoals.prototype.deleteGoalMarker = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];

		goal.marker.setMap(null);

		delete this._goals[name];
	}
};


