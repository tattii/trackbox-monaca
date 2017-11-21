// Initialize Firebase
var config = {
    apiKey: "AIzaSyCJAN2lEcfIAistGj4hETX7nvvu_1JJf2Y",
    authDomain: "trackbox-47f81.firebaseapp.com",
    databaseURL: "https://trackbox-47f81.firebaseio.com",
    projectId: "trackbox-47f81",
    storageBucket: "trackbox-47f81.appspot.com",
    messagingSenderId: "301600620133"
};
firebase.initializeApp(config);



/** @constructor */
function TrackboxFirebase() {
    this.db = firebase.database();  
}


// new track
TrackboxFirebase.prototype.new = function(name){
    // init trackbox data
    var trackdata = {
        name: name,
        map: trackbox.map._def,
        tracks: [],
        goals: []
    };
    
    this.tracks = this.db.ref().child("tracks");
    this.trackid = this.tracks.push(trackdata).key;
    
    this.trackPoints = this.db.ref("/tracks/" + this.trackid).child("tracks");
    this.goals = this.db.ref("/tracks/" + this.trackid).child("goals");
    
    console.log("track id: " + this.trackid);
    
    if (trackbox.goals){
        trackbox.goals.addGoalsFirebase(this);
    }
    
    return this;
};


TrackboxFirebase.prototype.init = function(trackid, track) {
    this.trackid = trackid;
    this.track = track;
    this.trackPoints = this.db.ref("/tracks/" + this.trackid + "/tracks");
    this.goals = this.db.ref("/tracks/" + this.trackid + "/goals");
    
    $("#loader").show();   
    this.initData();
    
    return this;
};


// push data
TrackboxFirebase.prototype.addTrackPoint = function(pos) {
    var heading = (isNaN(pos.coords.heading)) ? "-" : pos.coords.heading;
    
    this.trackPoints.push([
        pos.timestamp,
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.altitude,
        pos.coords.speed,
        heading
    ]);
};


TrackboxFirebase.prototype.addGoal = function(goal) {
    return this.goals.push(goal).key;
};

TrackboxFirebase.prototype.updateGoal = function(id, goal) {
    this.goals.child(id).update(goal);
};

TrackboxFirebase.prototype.deleteGoal = function(id) {
    this.goals.child(id).set(null);
};



// get data
TrackboxFirebase.prototype.initData = function() {
    var self = this;
    this.db.ref("/tracks/" + this.trackid).once("value", function(d){
        var name = d.child("name").val();
        $("#track-name").text(name);
        $(".track-nav").show();
        $("#start-tracking").html('<i class="material-icons">play_circle_outline</i>Resume tracking');
        
        self.initTrack(d.child("tracks").val());
        self.initGoals(d.child("goals").val());
        $("#loader").hide();
    });
};

TrackboxFirebase.prototype.initTrack = function(points) {
    for (var i in points){
        var point = points[i];
        var position = new google.maps.LatLng(point[1], point[2]);
        this.track.addTrackPoint2(position, point);
    }
};

TrackboxFirebase.prototype.initGoals = function(goals) {
    for (var key in goals){
        trackbox.goals.addRemoteGoal(key, goals[key]);
    }
};