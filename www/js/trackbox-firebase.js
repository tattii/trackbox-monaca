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
    // init trackbox data
    var trackdata = {
        name: "test",  
        map: trackbox.map._def,
        tracks: [],
        goals: []
    };
    
    this.db = firebase.database();
    this.tracks = this.db.ref().child("tracks");
    this.trackid = this.tracks.push(trackdata).key;
    
    this.trackPoints = this.db.ref("/tracks/" + this.trackid).child("tracks");
    this.goals = this.db.ref("/tracks/" + this.trackid).child("goals");
    
    console.log("track id: " + this.trackid);
    
    if (trackbox.goals){
        trackbox.goals.addGoalsFirebase(this);
    }
}

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
