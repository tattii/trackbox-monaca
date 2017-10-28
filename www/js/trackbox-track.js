/*
 * TrackboxTrack - trackbox track class based on Google Maps
 *
 */

/** @constructor */
function TrackboxTrack(map) {
    this.map = map;
    this.prevPos;
    this.trackPoints = [];
}

TrackboxTrack.prototype.addTrackPoint = function (pos){
    var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    this.trackPoints.push({ pos: position });
    
    if (this.prevPos){
        this._drawPolyline(this.prevPos, position);
    }
    this.prevPos = position;
};

TrackboxTrack.prototype._drawPolyline = function (p1, p2){
    var polyline = new google.maps.Polyline({
		path: [ p1, p2 ],
		//strokeColor: color,
		strokeWeight: 4,
		strokeOpacity: 1,
		map: this.map
	});
};

TrackboxTrack.prototype._fixedGradient = function(x) {
    var grad = [
		{ value:0.00, r:0,   g:0,   b:255 },
		{ value:0.25, r:0,   g:255, b:255 },
		{ value:0.50, r:0,   g:255, b:0   },
		{ value:0.75, r:255, g:255, b:0   },
		{ value:1.00, r:255, g:0,   b:0   }
	];

	var pivot;
	for (pivot = 1; pivot < grad.length; pivot++){
		if ( x <= grad[pivot].value ){
			break;
		}
	}

	var l = grad[pivot-1];
	var r = grad[pivot];

	var delta = (x - grad[pivot-1].value) / (grad[pivot].value - grad[pivot-1].value);

	var color = {
		r: Math.round( (r.r - l.r) * delta + l.r ),
		g: Math.round( (r.g - l.g) * delta + l.g ),
		b: Math.round( (r.b - l.b) * delta + l.b )
	};

	return "#" + this._doubleHex(color.r) +
		this._doubleHex(color.g) + this._doubleHex(color.b);
};

TrackboxTrack.prototype._doubleHex = function(x) {
	return ( x < 16 ) ? "0" + x.toString(16) : x.toString(16);
};
