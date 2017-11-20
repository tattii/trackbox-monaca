function Tracking() {
    this.tracking = false;

    this.$time = $("#footer-time span");
    this.$alt = $("#footer-altitude span");
    this.$heading = $("#footer-heading span");
    this.$speed = $("#footer-speed span");
}

Tracking.prototype.new = function() {
    this.track = new TrackboxTrack(map);
    this.trackName = this._defaultName();
    $("#track-name").text(this.trackName);
};

Tracking.prototype._defaultName = function() {
    var date = new Date();
    var date_str = date.getFullYear() + "." + pad(date.getMonth() + 1) + "." + pad(date.getDate());
    var ampm = (date.getHours() < 12) ? "am" : "pm";
    return date_str + "." + ampm;
};

Tracking.prototype.start = function() {
    this.tracking = true;
    if (!this._watchId){
		var self = this;
        this.startTimer();

		this._watchId = navigator.geolocation.watchPosition(
			function(pos) {
				self.positionUpdated(pos);
			},
			function(err) {
				alert(err.message);
			},
			{
				enableHighAccuracy: true,
				//timeout: 30000,
				maximumAge: 3000
			}
		);
	}
    
    if (trackbox.map._watchId){
        navigator.geolocation.clearWatch(trackbox.map._watchId);
        trackbox.map._watchId = null;
    }
};

Tracking.prototype.stop = function() {
    this.tracking = false;
    if (this._watchId){
        navigator.geolocation.clearWatch(this._watchId);
        this._watchId = null;
    }
};

Tracking.prototype.reset = function() {
    this.stop();
    trackbox.goals.reset();
    this.track.remove();
    this.track = null;
};


Tracking.prototype.positionUpdated = function(pos){
    var t = new Date(pos.timestamp);
    var time_str = pad(t.getHours()) + ":" + pad(t.getMinutes()) + ":" + pad(t.getSeconds());
    console.log(time_str + " " + pos.coords.accuracy);
    
    // accuracy check
    // ignore 1sec
    
    // ui
    if (pos.coords.altitude){
        this.$alt.text(pos.coords.altitude.toFixed(0));
        this.$heading.text(pos.coords.heading.toFixed(0));
        this.$speed.text(pos.coords.speed.toFixed(1));
    }
    
    // map
    this.track.addTrackPoint(pos);
    this.track.drawDirection(pos);
    trackbox.map._showCurrentPosition(pos);
    
    // firebase
    if (trackbox.firebase){
        trackbox.firebase.addTrackPoint(pos);
    }
};

function pad(n) { return n<10 ? '0'+n : n; }
Tracking.prototype.startTimer = function(){
    this.time = 0;
    this.$time.text("00:00:00");
    
    var self = this;
    this._timer = setInterval(function(){
        self.time++;
         
        var t = new Date(self.time * 1000);
        var time_str = pad(t.getUTCHours()) + ":" + pad(t.getUTCMinutes()) + ":" + pad(t.getUTCSeconds());
        
        self.$time.text(time_str);
    }, 1000);
};

Tracking.prototype.stopTimer = function(){
    if (this._timer) clearInterval(this._timer);
};

