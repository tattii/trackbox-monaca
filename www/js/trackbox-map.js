/*
 * TrackboxMap - trackbox map class based on Google Maps
 *
 * ref. Overlay map types
 * https://developers.google.com/maps/documentation/javascript/examples/maptype-overlay
 *
 */

/** @constructor */
function TrackboxMap(def) {
	this.tileSize = new google.maps.Size(256, 256);
	this.maxZoom = 21;
	this.name = def.name;
	this.alt = '';

	this._def = def;

	this._tileBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(def.bounds[0][0], def.bounds[0][1]),
		new google.maps.LatLng(def.bounds[1][0], def.bounds[1][1]));

	this._retina = window.devicePixelRatio >= 2;
}

TrackboxMap.prototype.addTo = function(map) {
	this.map = map;

	//map.fitBounds(this._tileBounds);

	this._setOverlayControl();

	map.mapTypes.set(this._def.name, this);
	//map.setMapTypeId(this._def.name);
	map.overlayMapTypes.insertAt(0, this);
	this._show = true;

	if (this._def.waypoint_url){
		this._waypoint = new TrackboxWaypoints(this._def.waypoint_url, map);
	}
    
    trackbox.goals = new TrackboxGoals(map, this);
};

TrackboxMap.prototype.remove = function() {
    if (this._waypoint) this._waypoint.remove();
    
    trackbox.goals.reset();
    trackbox.goals = null;
    
    this.map.overlayMapTypes.removeAt(0);
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].removeAt(0);
};

TrackboxMap.prototype.getTile = function(coord, zoom, owner) {
	var tileBounds = this._tileCoordsToBounds(coord, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		if (zoom >= this._def.zoom.min && zoom <= this._def.zoom.max){

			if (this._retina && zoom < this._def.zoom.max){
				var tile = owner.createElement('div');
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				this._createRetinaTile(tile, coord, zoom + 1, 0, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 0, 1);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 1);

				return tile;				

			}else{
				var tile = owner.createElement('img');
				tile.alt = '';

				tile.src = this._getTileUrl(coord, zoom);
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				return tile;
			}
		}
	}
	
	var tile = owner.createElement('img');
	tile.alt = '';
	return tile;
};


TrackboxMap.prototype._createRetinaTile = function(tile, coord, zoom, px, py) {
	var coord1 = { x: coord.x * 2 + px, y: coord.y * 2 + py };
	var tileBounds = this._tileCoordsToBounds(coord1, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		var tile1 = document.createElement('img');
		tile1.src = this._getTileUrl(coord1, zoom);
		tile1.style.width = (this.tileSize.width / 2) + 'px';
		tile1.style.height = (this.tileSize.height / 2) + 'px';
		tile1.style.position = 'absolute';
		tile1.style.top = (this.tileSize.width / 2 * py) + 'px';
		tile1.style.left = (this.tileSize.height / 2 * px) + 'px';

		tile.appendChild(tile1);
	}
};

TrackboxMap.prototype._getTileUrl = function(coord, zoom) {
	var y = (1 << zoom) - coord.y - 1;
	return this._def.url + '/' + zoom + '/' + coord.x + '/' + y + '.png';
};

TrackboxMap.prototype._tileCoordsToBounds = function(coord, zoom) {
	var proj = this.map.getProjection();
	var scale = Math.pow(2, zoom);

	var p1 = new google.maps.Point(
		(coord.x + 1)* this.tileSize.width / scale,
		coord.y * this.tileSize.height / scale);
	var p2 = new google.maps.Point(
		coord.x * this.tileSize.width / scale,
		(coord.y + 1) * this.tileSize.height / scale);
	
	var ne = proj.fromPointToLatLng(p1);
	var sw = proj.fromPointToLatLng(p2);

	return new google.maps.LatLngBounds(sw, ne);
};


TrackboxMap.prototype._setOverlayControl = function() {
	var div = document.createElement('div');
	div.index = 1;

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#fff';
	controlUI.style.border = '2px solid #fff';
	controlUI.style.borderRadius = '2px';
	controlUI.style.boxShadow = '0 1px 4px -1px rgba(0,0,0,.3)';
	controlUI.style.cursor = 'pointer';
	controlUI.style.marginTop = '24px';
	controlUI.style.marginRight = '10px';
	controlUI.style.padding = '10px';
	controlUI.style.textAlign = 'center';
	controlUI.style.color = '#37474f';
	controlUI.style.fontSize = '11px';
	controlUI.style.position = 'relative';
	controlUI.style.display = 'block';
	controlUI.innerHTML = this._def.name;
	
	if (this._retina) controlUI.style.padding = '9px 6px';

    this.controlUI = controlUI;
	div.appendChild(controlUI);

	var self = this;
	controlUI.addEventListener('click', function() {
		self._toggle();
	});

	this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(div);
};


TrackboxMap.prototype._toggle = function() {
	if (this._show){
		if (this._waypoint) this._waypoint.showZoomgt(13);
		this.map.overlayMapTypes.removeAt(0);
        this.controlUI.style.color = '#b0bec5';
	}else{
		if (this._waypoint) this._waypoint.showZoomgt(15);
		this.map.overlayMapTypes.insertAt(0, this);
        this.controlUI.style.color = '#37474f';
	}
	this._show = !this._show;
};

TrackboxMap.prototype.showCurrentPosition = function() {
	if (this._currentPosition){
		this._showCurrentPosition();

	}else if (!this._watchId){
		var self = this;
		this._watchId = navigator.geolocation.watchPosition(
			function(pos) {
                console.log(pos);
				self._showCurrentPosition(pos);
			},
			function(err) {
				alert(err.message);
			},
			{
				enableHighAccuracy: false,
				timeout: 30000,
				maximumAge: 0
			}
		);
	}
};

TrackboxMap.prototype._showCurrentPosition = function(pos) {
	if (!pos){
		if (this._currentPosition) this.map.panTo(this._currentPosition);
		return;
	}

	var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	this._currentPosition = position;
	
	if (!this._currentPosMarker) {
        var image = {
            url: 'img/position-icon.png',
            scaledSize: new google.maps.Size(40, 38),
            anchor: new google.maps.Point(20, 19)
        };

		this._currentPosMarker = new google.maps.Marker({
			position: position,
			map: this.map,
			icon: image
		});

		this.map.panTo(position);

	}else{
		this._currentPosMarker.setPosition(position);
	}

    if (this._navigation){
        this._updateNavigation(this._currentPosition);
    }
    if (this._directionChanged){
        this._directionChanged(this._calculateDirection(this._currentPosition, this._directTo));
    }
};

TrackboxMap.prototype.watchDirection = function(lat, lon, callback) {
    this._directTo = new google.maps.LatLng(lat, lon);
    this._directionChanged = callback;
    
    if (this._currentPosition){
        callback(this._calculateDirection(this._currentPosition, this._directTo));
    }else{
        callback("");
    }
};

TrackboxMap.prototype.clearWatchDirection = function(){
    this._directionChanged = null;
};

TrackboxMap.prototype.enableNavigation = function(lat, lon) {
    this._navigation = true;
    this._navigateTo = new google.maps.LatLng(lat, lon);

    if (this._currentPosition){
        this._updateNavigation(this._currentPosition);

    }else{
        this.showCurrentPosition();
    }
};

TrackboxMap.prototype.isNavigating = function(lat, lon) {
    return this._navigateTo && this._navigateTo.lat() == lat && this._navigateTo.lng() == lon;
};

TrackboxMap.prototype.disableNavigation = function() {
    this._navigation = false;
    this._removeNavigation();
};

TrackboxMap.prototype._updateNavigation = function(pos) {
    if (!this._navigatePolyline){
        this._navigatePolyline = new google.maps.Polyline({
            path: [ pos, this._navigateTo ],
            strokeColor: "#f06292",
	        strokeWeight: 2,
	        strokeOpacity: 0.7,
            zIndex: 20,
	        map: this.map
        });

    }else{
        this._navigatePolyline.setPath([ pos, this._navigateTo ]);
    }
    
    var direction = this._calculateDirection(pos, this._navigateTo);
    this._drawDirectionLabel(pos, direction);
};

TrackboxMap.prototype._removeNavigation = function() {
    this._navigatePolyline.setMap(null);
    this._navigatePolyline = null;
    this._directinoLabel.setMap(null);
    this._directinoLabel = null;
};

TrackboxMap.prototype._drawDirectionLabel = function(pos, label) {
    var labelPos = new google.maps.LatLng(
        (this._navigateTo.lat() + pos.lat()) / 2,
        (this._navigateTo.lng() + pos.lng()) / 2
    );
    
    if (!this._directinoLabel){
        this._directinoLabel = new google.maps.Marker({
            position: labelPos,
            label: label,
            icon: "img/empty.png",
            map: this.map
        });

    }else{
        this._directinoLabel.setLabel(label);
        this._directinoLabel.setPosition(labelPos);
    }
};

TrackboxMap.prototype._calculateDirection = function(pos, target) {
    var distance = google.maps.geometry.spherical.computeDistanceBetween(pos, target);
    var heading = google.maps.geometry.spherical.computeHeading(pos, target);
    
    var dis;
    if (distance < 100){
        dis = distance.toFixed(1) + "m";

    }else if (distance < 1000){
        dis = distance.toFixed(0) + "m";

    }else if (distance < 100000){
        dis = (distance / 1000).toFixed(1) + "km";

    }else{
        dis = (distance / 1000).toFixed(0) + "km";
    }
    
    if (heading < 0) heading += 360;
    var head = heading.toFixed(0) + "°";
    
    return dis + " " + head;
};

TrackboxMap.prototype.measure = function(lat, lon, onUpdate) {
    this._measureTarget = new google.maps.LatLng(lat, lon);
    
    var lineSymbol = {
        path: 'M 0,0 0,1',
        strokeOpacity: 1,
        strokeColor: '#2979ff',
        scale: 4
    };
    var center = this.map.getCenter();
    this._measureDashline = new google.maps.Polyline({
        path: [ this._measureTarget, center ],
	    strokeOpacity: 0,
        zIndex: 50,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '10px'
        }],
	    map: this.map
    });
    
    var direction = this._calculateDirection(this._measureTarget, center);
    onUpdate(direction);
 
    var self = this;
    this._measureListener1 = this.map.addListener("center_changed", update);
    this._measureListener2 = this.map.addListener("drag", update);
    
    function update(){
        var center = self.map.getCenter();
        self._measureDashline.setPath([ self._measureTarget, center ]);

        var direction = self._calculateDirection(self._measureTarget, center);
        onUpdate(direction);
    }

};

TrackboxMap.prototype.stopMeasure = function(){
    this._measureDashline.setMap(null);
    this._measureDashline = null;
    
    google.maps.event.removeListener(this._measureListener1);
    google.maps.event.removeListener(this._measureListener2);
};

function initTrackboxLongTouch() {
    var TrackboxLongTouch;
    TrackboxLongTouch.prototype = new google.maps.OverlayView();

    function TrackboxLongTouch(map, div_id) {
        this.map = map;
        this.setMap(map);
        this._initEvents(div_id);
    };

    TrackboxLongTouch.prototype.onAdd = function() {};
    TrackboxLongTouch.prototype.draw = function() {};
    TrackboxLongTouch.prototype.onRemove = function() {};

    TrackboxLongTouch.prototype._initEvents = function(div_id) {
        var div = document.getElementById(div_id);
        var self = this;

        div.addEventListener("touchstart", function (e){ self._touchStart(e) });
        div.addEventListener("mousedown", function (e){ self._touchStart(e) });

        div.addEventListener("touchend", function (e){ self._touchStop(e) });
        div.addEventListener("mouseup", function (e){ self._touchStop(e) });
        div.addEventListener("mouseout", function (e){ self._touchStop(e) });

        this.map.addListener('drag', function (e){ self._touchStop(e) });
        this.map.addListener('zoom_changed', function (e){ self._touchStop(e) });
    };


    TrackboxLongTouch.prototype._touchStart = function(e) {
        this._touched = true;
        this._touch_time = 0;
        clearInterval(document.interval);

        var self = this;
        document.interval = setInterval(function(){
            self._touch_time += 100;
            if (self._touch_time >= 1000) {
                var X, Y;
                if (e.type == "touchstart"){
                    X = e.touches[0].clientX;
                    Y = e.touches[0].clientY;

                }else{
                    X = e.clientX;
                    Y = e.clientY;
                }

                self.show(X, Y);
                clearInterval(document.interval);
            }
        }, 100)
    };

    TrackboxLongTouch.prototype._touchStop = function(e) {
        if (this._touched){
            clearInterval(document.interval);
        }

        var self = this;
        setTimeout(function(){
            self._touched = false;
        }, 200);
    };

    TrackboxLongTouch.prototype.getLatLng = function(x, y) {
        return this.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x, y));
    };

    TrackboxLongTouch.prototype.show = function(x, y) {
        var pos = this.getLatLng(x, y);
        if (!this.marker){
            this.marker = new google.maps.Marker({
                position: pos,
                draggable: true,
                map: this.map
            });
            
            // marker drag
            this.marker.addListener("dragend", function(e) {
                pos = e.latLng;
                digit = trackbox.goals._getDigit(pos.lat(), pos.lng());
                $("#marker-info-name").text(digit);
            });

        }else{
            this.marker.setPosition(pos);
            this.marker.setMap(this.map);
        }

        var digit = trackbox.goals._getDigit(pos.lat(), pos.lng());

        var self = this;
        openMarkerInfo(digit, function(){
            // add goal callback
            trackbox.goals.addPointLatLng(pos.lat(), pos.lng(), digit, true);

        }, function(){
            // close modal callback
            self.marker.setMap(null);
        });
    };

    return TrackboxLongTouch;
}

