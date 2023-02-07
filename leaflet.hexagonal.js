// todo:
// done : id => group... id => entity , entity => group
// done: addLine, addPoints
// imagesizeMax
// done: namengebung straight => default, line, hexagonal
// done: pointyTop => pointyTop flatTop
// done: bug: Rundungsproblem bei hexagonen > exampleOptions.html (zoomlevel: 10) > offset-value needed rounding  
// check all addFunctions (with parameters)
// check removeFunctions
// delete/sum up some options for style



/*!
 * Leaflet.Hexagonal.js v0.8.0
 * 
 * Copyright (c) 2023-present Knut Wanzenberg
 * Released under the MIT License - https://choosealicense.com/licenses/mit/
 * 
 * https://github.com/kaynut/Leaflet.Hexagonal
 * 
*/


!function (t, e) {
	"object" == typeof exports && "undefined" != typeof module ? e(exports, require("leaflet")) : "function" == typeof define && define.amd ? define(["exports", "leaflet"], e) : e(((t = t || self).Leaflet = t.Leaflet || {},
		t.Leaflet.Hexagonal = {}), t.L);
}(this, function (t, e) {
	"use strict";
	/**
	 * @class Hexagonal
	 * @inherits Layer
	 *
	 * Leaflet overlay plugin: L.Hexagonal
	*/
	var i = (e = e && e.hasOwnProperty("default") ? e["default"] : e).Layer.extend({


		// #######################################################
		// #region options

		options: {

			// container, layer
			container: document.createElement("CANVAS"),
			zIndex: undefined,
			opacity: 0.5,
			visible: !0,
			minZoom: 0,
			maxZoom: 18,



			// hexagonVisible: boolean
			hexagonVisible: true,
			// hexagonSize: number || function(zoom) { return size; }
			hexagonSize: function(zoom) { return Math.max(32,Math.pow(2, zoom-5)); }, 
			// hexagonGap: pixels (difference between display- and clustering-size of hexagon) 
			hexagonGap: 0, 	
			// hexagonMode: "flatTop" || "pointyTop",
			hexagonMode: "flatTop",
			// hexagonFill: "color" || false
			hexagonFill: "#fd1",
			// hexagonLine: "color" || false
			hexagonLine: "#303234", 	
			// hexagonLineWidth: pixels
			hexagonLineWidth: 1,



			// colorStyle: "count" || "weight" || "static" || "point0" || false (style for hexagon-cluster: depending on pointCount, sum of pointWeights or first point metadata) 	
			colorStyle: "point0",
			// colorRamp: [ "#color", "rgba(r,g,b)", [r,g,b,a],...]
			colorRamp: ["#ffdd11","#eeeeee","bb4400"],
			// colorRampFallback: [ "#color", "rgba(r,g,b)", [r,g,b,a],...]
			colorRampFallback: ["#ffdd11","#eeeeee","bb4400"],
			//colorWeightProp: "meta.propertyName" 
			colorWeightProp: "weight", // propertyName for weight-based coloring (included in meta)
			//colorStaticProp: "meta.propertyName" 
			colorStaticProp: "static", // propertyName for static-based coloring (included in meta)

			

			// markerVisible: boolean
			markerVisible: true,
			//markerFill: "color" || false
			markerFill: "#fd1",
			//markerLine: "color" || false
			markerLine: "#303234",
			//markerLine: pixels
			markerLineWidth: 1,
			//markerOpacity: number (0-1)
			markerOpacity: 1,


			// linkVisible: boolean
			linkVisible: true,			
			// linkMode: "default" || "line" ||"hexagonal" || false
			linkMode: "default",
			// linkReach: meters (longest distance to be linked. controls how large of an area will be evaluated - for performance issues)
			linkReach: 50000,
			// linkJoin: number (0=gap between cell and line / 0.5= cell and line touch / 1=cellcenter and line fully joined)
			linkJoin: 1,  
			// linkFill: "color" || false
			linkFill: "#fd1",
			// linkLine: "color" || false
			linkLine: "#303234", 	
			// linkLineWidth: pixels
			linkLineWidth: 2,	
			// linkLineBorder: pixels
			linkLineBorder: 1,	


			// selectionVisible: true || false
			selectionVisible: true,
			// selectionFill: "color" || false
			selectionFill: "rgba(255,255,255,0.2)", 	
			// selectionLine: "color" || false
			selectionLine: "rgba(255,255,255,0.2)", 	 	
			// selectionLineWidth: pixels
			selectionLineWidth: 2,	
			

			// infoVisible: true || false
			infoVisible: true,
			// infoMode: "count" || "ids" || "custom" || false
			infoMode: "count", 
			// infoClassName: class || ""
			infoClassName: "leaflet-hexagonal-info-container", 
			// infoItemsMax: number (max items shown explicitly in info)
			infoItemsMax: 5	

		},
		// #endregion



		// #######################################################
		// #region props
		
		_incId: 0,
		_incGroup: 0,

		hexagonSize:0,
		hexagonals: {},

		points: [],
		totals:{
			count:0,
			weight:0
		},
		links: [],

		markers:[],
		markerLayer: false,

		selection: {},

		groupInfo: {},

		info: false,
		infoLayer: false,

		colorRamp: [[0,0,0,1],[255,255,255,1]],

		images: { 
			default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAK5JREFUSEvtlMsNgzAQBYcO6CTpIKSElJJKUgolEDognaSE6ElG2gPxrvkckOwTCPTGb1jccPBqDs6nAlzDVVEL9MATmJZ8bVGk8AG4AiPQ7Qmw4Z8U/t0LEA4XMKdI1V/AA5h3VxTuAd7ALX28e6o/O89qsapyDbRbQS5mQtQqHO410HML0X1ReARgIbrWKC5Oy78zI/ofqIlWUXi0gXug5V6INlgNqQBX3fkV/QBZex4ZCtJcsAAAAABJRU5ErkJggg=="
		},
		icons: {
			close48: { svg:'<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"/></svg>', size: { width:48, height:48}, scale:1 },
			close24: { svg:'<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"/></svg>', size: { width:24, height:24}, scale:1 }
		},
		
		// #endregion


/*!
* Leaflet.CustomLayer.js v2.1.0
* 
* Copyright (c) 2019-present Derek Li
* Released under the MIT License - https://choosealicense.com/licenses/mit/
* 
* https://github.com/iDerekLi/Leaflet.CustomLayer
*/


		// #######################################################
		// #region base: modified, based on Leaflet.CustomLayer.js
		initialize: function initialize(t) {
			e.setOptions(this, t),
				e.stamp(this);
				this._map = undefined;
				this._container = undefined;
				this._bounds = undefined;
				this._center = undefined; 
				this._zoom = undefined;

				this._instanceUID = Date.now();
				this._incId = (Date.now() & 16777215)*1000;
				this._incGroup = (Date.now() & 16777215)*1000;

				this.setColorRamp(this.options.colorRamp);

		},
		beforeAdd: function beforeAdd() {
			this._zoomVisible = true;
		},
		getEvents: function getEvents() {
			var t = {
				viewreset: this._onLayerViewReset,
				zoom: this._onLayerZoom,
				moveend: this._onLayerMoveEnd,
				zoomend: this._onLayerZoomEnd,
				click: this._onClick,
				mousemove: this._onMouseRest
			};
			return this._zoomAnimated && (t.zoomanim = this._onLayerAnimZoom), t;
		},
		onAdd: function onAdd() {
			if (this.fire("layer-beforemount"), this._container || this._initContainer(), this.setOpacity(this.options.opacity), window.isNaN(this.options.zIndex)) { this.setZIndex(100); }
			else { this.setZIndex(this.options.zIndex); }
			this.getPane().appendChild(this._container);
			this._onZoomVisible();
			this.fire("layer-mounted");
			this.markerLayer = L.layerGroup([]).addTo(this._map);
			this.markerLayer.needsRefresh = true;
			this.markerLayer.markerLayer = true;
			this.infoLayer = L.layerGroup([]).addTo(this._map);
			this.infoLayer.needsRefresh = true;
			this.infoLayer.infoLayer = true;
			this._update();
		},
		onRemove: function onRemove() {
			this.fire("layer-beforedestroy"); 
			this._destroyContainer();
			this.fire("layer-destroyed");
		},
		// events
		_onLayerViewReset: function _onLayerViewReset() {
			this._reset();
		},
		_onLayerAnimZoom: function _onLayerAnimZoom(t) {
			this._updateTransform(t.center, t.zoom);
		},
		_onLayerZoom: function _onLayerZoom() {
			this._updateTransform(this._map.getCenter(), this._map.getZoom());
		},
		_onLayerMoveEnd: function _onLayerMoveEnd() {
			this._isZoomVisible() ? this._update() : this._zoomHide();
		},
		_onLayerZoomEnd: function _onLayerZoomEnd() {
			this.onZoomEnd();
		},
		_onZoomVisible: function _onZoomVisible() {
			this._isZoomVisible() ? this._zoomShow() : this._zoomHide();
		},
		// methods
		_initContainer: function _initContainer() {
			var t = this._container = this.options.container;
			e.DomUtil.addClass(t, "leaflet-layer");
			this._zoomAnimated && e.DomUtil.addClass(this._container, "leaflet-zoom-animated");
		},
		_destroyContainer: function _destroyContainer() {
			e.DomUtil.remove(this._container);
			delete this._container;
		},
		_isZoomVisible: function _isZoomVisible() {
			var t = this.options.minZoom;
			var e = this.options.maxZoom;
			var i = this._map.getZoom();
			return i >= t && i <= e;
		},
		_zoomShow: function _zoomShow() {
			this._zoomVisible || (this._zoomVisible = !0, this._map.off({zoomend: this._onZoomVisible}, this), this.options.visible && (this._map.on(this.getEvents(), this), this.getContainer().style.display = ""));
		},
		_zoomHide: function _zoomHide() {
			this._zoomVisible && (this._zoomVisible = !1, this._map.off(this.getEvents(), this), this._map.on({zoomend: this._onZoomVisible }, this), this.getContainer().style.display = "none");
		},
		_updateTransform: function _updateTransform(t, i) {
			var o = this._map.getZoomScale(i, this._zoom), n = e.DomUtil.getPosition(this._container), s = this._map.getSize().multiplyBy(.5 + 0), a = this._map.project(this._center, i), r = this._map.project(t, i).subtract(a), h = s.multiplyBy(-o).add(n).add(s).subtract(r);
			e.Browser.any3d ? e.DomUtil.setTransform(this._container, h, o) : e.DomUtil.setPosition(this._container, h);
		},
		_update: function _update() {
			if (!this._map._animatingZoom || !this._bounds) {
				this.__update();
				var t = this._bounds;
				var i = this._container;
				this._onDraw();
				e.DomUtil.setPosition(i, t.min), this.fire("layer-render");
			}
		},
		__update: function __update() {
			var t = 0; 
			var i = this._map.getSize();
			var o = this._map.containerPointToLayerPoint(i.multiplyBy(-t));
			this._bounds = new e.Bounds(o, o.add(i.multiplyBy(1 + 2 * t)));
			this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();
		},
		_reset: function _reset() {
			this._update();
			this._updateTransform(this._center, this._zoom);
		},
		getContainer: function getContainer() {
			return this._container;
		},
		setContainer: function setContainer(t) {
			var e = this.getContainer(), i = e.parentNode;
			if (delete this._container, this.options.container = t, this._container || this._initContainer(),this.setOpacity(this.options.opacity), window.isNaN(this.options.zIndex)) { this.setZIndex(100); } 
			else { this.setZIndex(this.options.zIndex); }
			return i ? i.replaceChild(t, e) : this.getPane().appendChild(t), this._update(), this;
		},
		getOpacity: function getOpacity() {
			return this.options.opacity;
		},
		setOpacity: function setOpacity(t) {
			return this.getContainer().style.opacity = this.options.opacity = 1 * t, this;
		},
		getZIndex: function getZIndex() {
			return this.options.zIndex;
		},
		setZIndex: function setZIndex(t) {
			return this.getContainer().style.zIndex = this.options.zIndex = 1 * t, this;
		},
		show: function show() {
			if (!this.options.visible) {
				if (this.options.visible = !0, this._isZoomVisible()) return this._map.on(this.getEvents(), this),
					this.getContainer().style.display = "", this._update(), this;
				this._zoomHide();
			}
		},
		hide: function hide() {
			if (this.options.visible) return this.options.visible = !1, this._zoomHide(), this._map.off(this.getEvents(), this),
				this.getContainer().style.display = "none", this;
		},

		// #endregion


/*!
* Leaflet.Hexagonal.js v0.8.0
* 
* Copyright (c) 2023-present Knut Wanzenberg
* Released under the MIT License - https://choosealicense.com/licenses/mit/
* 
* https://github.com/kaynut/Leaflet.Hexagonal
* 
*/


		// #######################################################
		// #region points
		// addPoint:  add single point with metadata
		addPoint: function addPoint(latlng, meta) { //  {lng,lat} , {group, linked, weight,marker}
			latlng = this.validateLatLng(latlng);
			meta = meta || {};

			// group
			var group = meta.group;
			if (typeof meta.group != "number" && typeof meta.group !="string") { group = this._genGroup(); }

			// _id
			var _id = this._genId();
			
			// _link
			var _link = -1;
			if(meta.linked) { _link = this.getLinkPos(group); } 

			// point
			var point = {
				group: group,
				_id: _id,
				_link: _link,
				cell: false,
				latlng: latlng,

				meta: { 
					count: 1,
					weight: meta[this.options.colorWeightProp] || 1,
					static: meta[this.options.colorStaticProp] || false
				},

				style: {
					fill: meta.fill || false,
					line: meta.line || false,
					lineWidth: meta.lineWidth || false,
					lineBorder: meta.lineBorder || false,
					image: meta.image || false,
					icon: meta.icon || false,
					size: meta.size || false
				},

				marker: meta.marker || false
			};

			// totals
			this.totals.count += 1;
			this.totals.weight += point.meta.weight;

			// add to points
			this.points.push(point);

			// add to marker
			if(point.marker) {
				this.markers.push(point);
			}	

			// refresh
			this.refresh();

			// return number of points added
			return 1; 

		},

		// addLine: add array of points (all with same metadata), all in the same group and all linked by default
		addLine: function addLine(points, meta) {  // [ latlng0, latlng1, ... ] , {group,weight, marker} 
			if(!Array.isArray(points)) {
				console.warn("Leaflet.hexagonal.addLine: parameter must be an array", points);
				return 0;
			}
			if(!points.length) { return 0; }

			// meta
			meta = meta || {};

			// group
			if(!meta.group) {
				meta.group = this._genGroup();
			}
			// linked
			if(typeof meta.linked=="undefined") { 
				meta.linked = true; 
			} 

			// loop points
			var c = 0;
			for(var i=0; i<points.length; i++) {
				c+= this.addPoint(points[i], meta);
			}
			
			// return number of points added
			return c;

		},
		
		// addPoints: add array of points (all with same metadata), by default each in a seperate group and not linked
		addPoints: function addPoints(points, meta) {  
			if(!Array.isArray(points)) {
				console.warn("Leaflet.hexagonal.addPoints: parameter must be an array", points);
				return;
			}
			if(!points.length) { return; }


			// meta
			meta = meta || {};

			// group
			var group = meta.group || false;
			if(group) { meta.group = group; }

			// linked
			meta.linked = meta.linked || false;

			// loop points
			var c = 0;
			for(var i=0; i<points.length; i++) {
				if(!group) { meta.group = this._genGroup(); }
				c += this.addPoint(points[i], meta);
			}

			// return number of points added
			return c;

		},

		// addGeojson: add url || geojson-string || geosjon-object
		addGeojson: function addGeojson(g, meta) {

			meta = meta || {};

			if(typeof g == "string") {

				// geojson.url
				if(g.endsWith(".json") || g.endsWith(".geojson")) { 
					meta = meta || {};
					var ref = this;
					fetch(g)
					.then((resp) => resp.json())
					.then((json) => {
						ref.addGeojson(json,meta);
					});
					return 0;
				}

				// geojson-string
				try {
					g = JSON.parse(g);
				} catch(e) {
					console.warn("Leaflet.hexagonal.addGeojson: invalid geojson-string", g);
					return 0;
				}

			}

			
			// invalid object
			if(typeof g != "object" || typeof g.type != "string") { 
				console.warn("Leaflet.hexagonal.addGeojson: invalid geojson-object", g);
				return 0; 
			}
			


			// g = geojson-object
			if(g.type == "Point" && g.coordinates) {
				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}
				this.addPoint({lng:g.coordinates[0],lat:g.coordinates[1]}, meta);
				return 1;
			}
			if(g.type == "MultiPoint") {
				var c = g.coordinates.length;
				if(!c) { return 0; }

				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}

				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, meta);
				}
				return c;
			}
			if(g.type == "LineString") {
				var c = g.coordinates.length;
				if(!c) { return 0; }

				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}
				if(!meta.group) { meta.group = this._genGroup(); }
				if(meta.linked!==false) { meta.linked = true; }
				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, meta);
				}
				return c;
			}
			if(g.type == "MultiLineString") {
				var c = 0;

				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}

				var group = false;
				if(typeof meta.group == "string" || typeof meta.group == "number") { group = meta.group; }
				var linked = false;
				if(meta.linked===true) { linked = true; }

				for(var i=0; i<g.coordinates.length; i++) {
					var ci = g.coordinates[i];
					if(!group) { meta.group = this._genGroup(); }
					if(!linked) { meta.linked = false; }
					for(var j=0; j<ci.length; j++) {
						// properties
						this.addPoint({lng:ci[j][0],lat:ci[j][1]}, meta);
						meta.linked = true;
						c++;
					}
				}
				return c;
			}
			if(g.type == "Feature") {

				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}

				return this.addGeojson(g.geometry, meta);
			}
			if(g.type == "FeatureCollection") {
				var c = 0;

				if(g.properties) {
					meta = Object.assign({},g.properties, meta);
				}

				for(var i=0; i<g.features.length; i++) {
					c+= this.addGeojson(g.features[i].geometry, meta);
				}
				return c;
			}

			console.warn("Leaflet.hexagonal.addGeojson: no valid data in geojson");
			return 0;

		},
	

		// addMarker
		addMarker: function addMarker(latlng, meta) {
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addMarker: latlng not valid", latlng);
			}
			latlng.lat = latlng.lat || 0;
			latlng.lng = latlng.lng || 0;

			meta = meta || {};

			if (typeof meta.group != "number" && typeof meta.group !="string") { meta.group = this._genGroup(); }

			if(meta.marker) {
				if(meta.image || meta.icon) {
					this.addPoint(latlng, meta);
				}
				else {
					console.warn("Leaflet.hexagonal.addMarker: a marker has to have a image- or an icon-property");
				}
			}
			else {
				console.warn("Leaflet.hexagonal.addMarker: no sufficient data");
			}
		},

		// #endregion
		
		
		// #######################################################
		// #region remove and clear: todo	
		removeGroup: function removeGroup(group) {
			if(this.points.length<1) { return false; }
			if(typeof group != "number" && typeof group != "string") {
				return false;
			}

			// points
			var c = 0;
			for(var j=0; j<this.points.length; j++) {
				if(group===this.points[j].group) {

					var link = this.points[j]._link;
					var weight = this.points[j].weight;

					this.totals.count -= 1;
					this.totals.weight -= weight;

					this.points.splice(j, 1);

					// readjust _link
					for(var i=0; i<this.points.length; i++) {
						if(this.points[i]._link>j) {
							this.points[i]._link -= 1;
						}
						else if(this.points[i]._link==j) {
							this.points[i]._link = link;
						}
					}
					c++;
					j--;
				}
			}

			// markers
			if(this.markers.length<1) { return false; }
			var c = 0;
			for(var j=0; j<this.markers.length; j++) {
				if(group===this.markers[j].group) {
					this.markers.splice(j, 1);
					c++;
					j--;
				}
			}

			// markerLayer
			this.markerLayer.needsRefresh=true;

			this.refresh();

			return c;
		},
		removeAll: function removeAll() {
			var c = this.points.length;
			this.points = [];
			this.links = [];
			this.markers = [];
			this.totals = {
				count:0,
				weight:0
			};
			this.markerLayer.clearLayers();

			this.refresh();
			return c;
		},


		// depricated
		removePoint: function removePoint(group) {
			console.warn("Leaflet.hexagonal.removePoint: Depricated: use removeGroup");
			return this.removeGroup(group);
			/*
			if(this.points.length<1) { return false; }
			if(typeof group != "number" && typeof group != "string") {
				return false;
			}

			var c = 0;
			for(var j=0; j<this.points.length; j++) {
				if(group===this.points[j].group) {

					var link = this.points[j]._link;
					var weight = this.points[j].weight;

					this.totals.count -= 1;
					this.totals.weight -= weight;

					this.points.splice(j, 1);

					// readjust _link
					for(var i=0; i<this.points.length; i++) {
						if(this.points[i]._link>j) {
							this.points[i]._link -= 1;
						}
						else if(this.points[i]._link==j) {
							this.points[i]._link = link;
						}
					}
					c++;
					j--;
				}
			}

			return c;
			*/
		},		
		clearPoints: function clearPoints() {
			console.warn("Leaflet.hexagonal.clearPoint: Depricated: use removeAll");
			return this.removeGroup(group);
			/*
			var c = this.points.length;
			this.points = [];
			this.refresh();
			return c;
			*/
		},
		removeMarker: function removeMarker(group) {
			console.warn("Leaflet.hexagonal.removeMarker: Depricated: use removeGroup");
			return this.removeGroup(group);
			/*
			if(this.markers.length<1) { return false; }
			if(typeof group != "number" && typeof group != "string") {
				return false;
			}
			var c = 0;
			for(var j=0; j<this.markers.length; j++) {
				if(group===this.markers[j].group) {
					this.markers.splice(j, 1);
					c++;
					j--;
				}
			}
			this.markerLayer.needsRefresh=true;
			this.refresh();
			return c;
			*/
		},	
		clearMarkers: function clearMarkers() {
			console.warn("Leaflet.hexagonal.clearMarkers: Depricated: use removeAll");
			return this.removeGroup(group);
			/*
			var c = this.markers.length;
			this.markers = [];
			this.refresh();
			return c;
			*/
		},


		// #endregion



		// #######################################################
		// #region draw
		refresh: function refresh() { 
			var self = this;
			window.clearTimeout(self._refreshPoints_debounce);
			self._refreshPoints_debounce = window.setTimeout(function () {
				self.markerLayer.needsRefresh = true;
				self._update();
			}, 50);
		},

		_preDraw: function _preDraw() { 
			// map/layer
			var dpr = L.Browser.retina ? 2 : 1;
			var size = this._bounds.getSize();
			this._container.width = dpr * size.x;
			this._container.height = dpr * size.y;
			this._container.style.width = size.x + "px";
			this._container.style.height = size.y + "px";
			var zoom = this._map.getZoom();

			// canvas
			var ctx = this._container.getContext("2d");
			if (L.Browser.retina) { ctx.scale(dpr, dpr); }
			var w = dpr * size.x;
			var h = dpr * size.y;

			// hexagonals
			this.hexagonals = {};

			// hexagonSize
			var hexagonSize = this.calcHexagonSize(zoom);
			this.hexagonSize = hexagonSize;

			// hexagonOffset, hexagonOverhang 
			var nw = this._map.getBounds().getNorthWest();
			var hexagonOffset = this._map.project(nw, zoom);
			hexagonOffset= {x:Math.round(hexagonOffset.x), y: Math.round(hexagonOffset.y) };
			var hexagonOverhang = (1 + (this.options.linkReach / this.calcHexagonDiameter()))*hexagonSize;

			// cluster points
			for (var i = 0; i < this.points.length; i++) {

				var point = this.points[i];

				var p = this.getPixels_from_latlng(point.latlng, w, h, hexagonOverhang);
				point.visible = p.visible;

				if (p.visible) {

					var h = this.calcHexagonCell(p.x,p.y,hexagonSize, hexagonOffset)

					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].ids = {};
						this.hexagonals[h.cell].cluster = { count:0, weight:0 };
						this.hexagonals[h.cell].style = { fill:false };
					}
					if(!this.hexagonals[h.cell].point0) {
						this.hexagonals[h.cell].point0 = point;
						this.hexagonals[h.cell].points = {};
						this.hexagonals[h.cell].style = { fill: (point.style.fill || false) };
					}
					this.hexagonals[h.cell].points[point.group] = point;
					this.hexagonals[h.cell].ids[point.group] = point.group;

					// cluster data
					this.hexagonals[h.cell].cluster.count++;
					this.hexagonals[h.cell].cluster.weight += point.meta.weight;
					
				}

				point.cell = h;
			}

			
			// cluster markers 
			if(this.options.markerVisible) {
				for (var i = 0; i < this.markers.length; i++) {
					
					var marker = this.markers[i];

					var m = this.getPixels_from_latlng(marker.latlng, w, h, hexagonOverhang);
					marker.visible = m.visible;

					//if (m.visible) {

						var h = this.calcHexagonCell(m.x,m.y,hexagonSize, hexagonOffset)

						if(!this.hexagonals[h.cell]) {
							this.hexagonals[h.cell] = h;
							this.hexagonals[h.cell].ids = {};
							this.hexagonals[h.cell].cluster = { count:0, weight:0 };
							this.hexagonals[h.cell].style = { fill:false };
						}
						if(!this.hexagonals[h.cell].marker0) {
							this.hexagonals[h.cell].marker0 = marker;
							this.hexagonals[h.cell].markers = {};
						}
						this.hexagonals[h.cell].markers[marker.group] = marker;
						this.hexagonals[h.cell].ids[marker.group] = marker.group;

					//}
					marker.cell = h;
					
				}
			}

			// collect links
			this.links = [];
			if(this.options.linkVisible) {
				if(this.options.linkMode && this.points.length>1) {
					for(var i=1; i<this.points.length; i++) {
						var p1 = this.points[i];
						if(p1._link>=0) {
							var p0 = this.points[p1._link];
							if(p0.visible && p1.visible) {
								var path = this.getLinkPath(p0,p1,hexagonSize, hexagonOffset);
								if(path) {
									this.links.push({group: p0.group, start:p0, end:p1, path:path});
								}
							}
						}
					}
				}
			}

			this.totals.cells = Object.keys(this.hexagonals).length;
			this.totals.markers = this.markers.length;
			this.totals.count = this.points.length;
			this.totals.links = this.links.length;


		},
		_onDraw: function _onDraw() {
			var drawTime = performance.now();
			this._preDraw();
			this.onDraw(this._container, this.hexagonals, this.selection, this.links, this.options);
			this.totals.drawTime = performance.now() - drawTime; 
		},
		onDraw: function onDraw(canvas, hexagonals, selection, links, options) {

			// canvasContext
			var ctx = canvas.getContext("2d");

			var selectionIds = {};
			if(selection.ids) { selectionIds = selection.ids; }


			// layers
			if(this.markerLayer.needsRefresh) {
				this.markerLayer.clearLayers();
			}

			// style
			var style = { 
				hexagonFill: this.options.hexagonFill, 
				hexagonLine: this.options.hexagonLine,
				hexagonLineWidth: this.options.hexagonLineWidth,
				linkFill: this.options.linkFill,
				linkLine: this.options.linkLine
			};

			// draw links
			if(links.length && options.linkVisible) {
				for(var i=0; i<links.length; i++) {
	
					// if start/end-point is visivbly clustered (?!)
					if(links[i].end.cell.cluster) {

						if(this.options.colorStyle=="count") {
							style.linkFill = this.getColorRampColor(links[i].end.cell.cluster.count, this.totals.count);
						}
						else if(this.options.colorStyle=="weight") {
							style.linkFill = this.getColorRampColor(links[i].end.cell.cluster.weight, this.totals.weight);
						}
						else if(this.options.colorStyle=="point0") {
							style.linkFill = links[i].end.style.fill || this.options.linkFill;
						}
						else {
							style.linkFill = this.options.linkFill;
						}
		
						this.drawLink(ctx, links[i], style);
						if(selectionIds[links[i].group] && options.selectionVisible) {
							this.drawLinkSelected(ctx, links[i]);
						}
					}
				}

			}


			// draw points and marker
			var hexs = Object.keys(hexagonals);
			if(hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					// draw hexagon
					if(options.hexagonVisible && hexagonals[hexs[h]].point0) {

						if(this.options.colorStyle=="count") {
							style.hexagonFill = this.getColorRampColor(hexagonals[hexs[h]].cluster.count, this.totals.count);
						}
						else if(this.options.colorStyle=="weight") {
							style.hexagonFill = this.getColorRampColor(hexagonals[hexs[h]].cluster.weight, this.totals.weight);
						}
						else if(this.options.colorStyle=="point0") {
							style.hexagonFill = hexagonals[hexs[h]].style.fill || this.options.hexagonFill;
						}
						else {
							style.hexagonFill = this.options.hexagonFill;
						}

						this.drawHexagon(ctx, hexagonals[hexs[h]], style);

						if(options.selectionVisible) {
							var hids = Object.keys(hexagonals[hexs[h]].ids);
							for(var i=0;i<hids.length;i++) {
								var hid = hexagonals[hexs[h]].ids[hids[i]];
								if(selectionIds[hid]) {
									this.drawHexagonSelected(ctx, hexagonals[hexs[h]]);
								}
							}
						}

					}


					// draw marker
					if(this.markerLayer.needsRefresh) {
						if(options.markerVisible && hexagonals[hexs[h]].marker0) {
							this.drawHexagonMarker(hexagonals[hexs[h]]);
						}
					}
				}

			}

			this.markerLayer.needsRefresh = false;

			this.afterDraw();

		},
		afterDraw: function afterDraw() {

		},

		drawHexagon: function drawHexagon(ctx, hexagon, style) {
			var hPath = new Path2D(hexagon.path);
			if(style.hexagonFill) {
				ctx.fillStyle = style.hexagonFill;
				ctx.fill(hPath);
			}
			if(style.hexagonLine) {
				ctx.strokeStyle = style.hexagonLine;
				ctx.lineWidth = style.hexagonLineWidth;
				ctx.stroke(hPath);
			}
		},
		drawHexagonMarker: function drawHexagonMarker(hexagon) {
			var m0 = hexagon.marker0;
			var style0 = hexagon.marker0.style;
			if(typeof style0 != "object") { return; }

			// marker type
			var img = style0.image || style0.icon || this.images.default; 

			var size = style0.size || hexagon.size;
			var fill = style0.fill || this.options.markerFill || "#303234";

			// calc path
			var w,h;
			var poly = false;
			if(!hexagon.pointyTop) {
				w = size*1.155;
				h = size;
				poly = `0 ${size*0.5},${size*0.289} 0,${size*0.866} 0,${size*1.155} ${size*0.5},${size*0.866} ${size},${size*0.289} ${size}`;
			}

			else {
				w = size;
				h = size*1.155;
				poly = `0 ${size*0.289},${size*0.5} 0,${size*1} ${size*0.289},${size*1} ${size*0.866},${size*0.5} ${size*1.155},0 ${size*0.866}`;
			}

			
			// image-icon
			var icon;
			if(typeof style0.image == "string") {
				icon = L.divIcon({
					className: 'leaflet-hexagonal-marker',
					html: `<svg width="${w}" height="${h}" opacity="${this.options.markerOpacity}" >
						<symbol id="hexa${m0._id}"><polygon points="${poly}"></polygon></symbol>
						<mask id="mask${m0._id}"><use href="#hexa${m0._id}" fill="#fff" stroke="#000" stroke-width="${this.options.markerLineWidth+1.5}" /></mask>
						<use href="#hexa${m0._id}" fill="${this.options.markerLine}" shape-rendering="geometricPrecision" />
						<image preserveAspectRatio="xMidYMid slice" href="${img}" mask="url(#mask${m0._id})" width="${w}" height="${h}" ></image>
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 
			}
			// svg-icon
			else if(typeof style0.icon == "string") {

				var svg = "";
				if(this.icons[style0.icon]) { 
				
					var micon = this.icons[style0.icon];
					var mw = micon.size.width || 1;
					var mh = micon.size.height || 1;
					var s = micon.scale;
					var ms = (w*s)/(mw*2);
					var ox = (w - mw*ms) / 2; 
					var oy = (h - mh*ms) / 2;

					svg = `<g transform="matrix(${ms},0,0,${ms},${ox},${oy})" opacity="0.75">${micon.svg}</g>`;
				}
				else {
					console.warn("Leaflet.hexagonal.drawHexagonMarker: Unknown icon", style0.icon);
				}

				icon = L.divIcon({
					className: 'leaflet-hexagonal-marker',
					html: `<svg width="${w}" height="${h}" opacity="${this.options.markerOpacity}" >
						<symbol id="hexa${m0._id}"><polygon points="${poly}"></polygon></symbol>
						<mask id="mask${m0._id}"><use href="#hexa${m0._id}" fill="#fff" stroke="#000" stroke-width="${this.options.markerLineWidth}" /></mask>
						<use href="#hexa${m0._id}" fill="${fill}" stroke="${this.options.markerLine}" stroke-width="${this.options.markerLineWidth}" shape-rendering="geometricPrecision" />
						${svg}
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 				
			}

			L.marker(hexagon.latlng, {icon: icon}).addTo(this.markerLayer); 
			// todo: maybe add a click-listener to marker (marker can be bigger than hexagonal) 			

		},
		drawHexagonSelected: function drawHexagonSelected(ctx, hexagon) {
			var hPath = new Path2D(hexagon.path);

			if(this.options.selectionFill) {
				ctx.fillStyle = this.options.selectionFill;
				ctx.fill(hPath);
			}
			if(this.options.selectionLine) {
				ctx.strokeStyle = this.options.selectionLine;
				ctx.lineWidth = this.options.selectionLineWidth;
				ctx.stroke(hPath);
			}
		},

		drawLink: function drawLink(ctx, link, style) {
			var path = new Path2D(link.path);
			if(this.options.linkLineBorder) {
				ctx.lineJoin = "round";
				ctx.strokeStyle = this.options.linkLine;
				ctx.lineWidth = this.options.linkLineWidth + this.options.linkLineBorder*2;
				ctx.stroke(path);
			}
			ctx.strokeStyle = style.linkFill;
			ctx.lineWidth = this.options.linkLineWidth;
			ctx.stroke(path);
		},
		drawLinkSelected: function drawLinkSelected(ctx, link) {
			var path = new Path2D(link.path);
			if(this.options.linkLineBorder && this.options.selectionLine) {
				ctx.lineJoin = "round";
				ctx.strokeStyle = this.options.selectionLine;
				ctx.lineWidth = this.options.linkLineWidth + this.options.linkLineBorder*2;
				ctx.stroke(path);
			}
			ctx.strokeStyle = this.options.selectionFill;
			ctx.lineWidth = this.options.linkLineWidth;
			ctx.stroke(path);
		},

		getColorRampColor: function getColorRampColor(value, total, logarithmic=true) {
			var ramp = this.colorRamp;
			var l = ramp.length - 1;

			var t;
			if(value>=total || !total) { t=1; }
			else if(logarithmic) { t = Math.log(value)/Math.log(total); }
			else { t = value/total;	}

			if(t==0) {
				return "rgba(" + ramp[0][0] + "," + ramp[0][1] + "," + ramp[0][2] + "," + ramp[0][3] + ")";
			}
			else if(t==1) {
				return "rgba(" + ramp[l][0] + "," + ramp[l][1] + "," + ramp[l][2] + "," + ramp[l][3] + ")";
			}

			t = t * l;
			var f = Math.floor(t);
			t = t - f;
			
			return "rgba(" + (ramp[f][0]*(1-t)+ramp[f+1][0]*t) + "," + (ramp[f][1]*(1-t)+ramp[f+1][1]*t) + "," + (ramp[f][2]*(1-t)+ramp[f+1][2]*t) + ","  + (ramp[f][3]*(1-t)+ramp[f+1][3]*t) + ")";
		},
		setColorRamp: function setColorRamp(colorArray) {
			if(!colorArray) {
				this.colorRamp = this.colorRampFallback;
				return;
			}

			if(!Array.isArray(colorArray) || !colorArray.length) {
				console.warn("Leaflet.hexagonal.setColorRamp: Parameter colorArray is invalid", colorArray);
				this.colorRamp = this.colorRampFallback;
				return;
			}
			this.colorRamp = [];
			for(var i=0; i<colorArray.length; i++) {
				if(typeof colorArray[i] == "string") {
					colorArray[i] = this.getRgbaFromColor(colorArray[i]);
				}
				else if(Array.isArray(colorArray[i])) {}
				else {
					colorArray[i] = [0,0,0,1];
				}
				colorArray[i][0] = colorArray[i][0] || 0;
				colorArray[i][1] = colorArray[i][1] || 0;
				colorArray[i][2] = colorArray[i][2] || 0;
				colorArray[i][3] = colorArray[i][3] || 1;

				this.colorRamp[i] = colorArray[i];
			}

			if(colorArray.length<2) {
				this.colorRamp[1] = colorArray[0];
			}

		},
		getRgbaFromColor: function getRgbaFromColor(color) {
			var r,g,b,a;
			if(!color.indexOf("#")) {
				color = color.toUpperCase() + "FF";
				  if(color.length>8) { 
					[r,g,b,a] = color.match(/[0-9A-F]{2}/g).map(x => parseInt(x, 16));
					return [r,g,b,a];
				  }
				   color += "F";
				   [r,g,b,a] = color.match(/[0-9A-F]{1}/g).map(x => parseInt(x, 16)*17);
				return [r,g,b,a];
			}
			if(!color.indexOf("rgb")) {
				color += ",1";
				[r,g,b,a] = color.match(/[.0-9]{1,3}/g);
				return [r,g,b,a];
			}
			if(Array.isArray(color)) {
				if(color.length==4) {
					return color;
				}
			}
			return [0,0,0,1];
		},
		// #endregion



		// #######################################################
		// #region events
		_onClick: function _onClick(e) {
			var selection = this.setSelection(e.latlng);
			if(selection) {
				this.setInfo(selection);
			}
			this.onClick(e,selection);
		},
		onClick: function onClick(e,selection) {
			return selection;
		},
		_onMouseRest: function _onMouseRest(e) {
			var self = this;
			window.clearTimeout(self._onMouseRestDebounced_Hexagonal);
			self._onMouseRestDebounced_Hexagonal = window.setTimeout(function () {
				
				var selection = self.getSelection(e.latlng);
				self.onMouseRest(selection);

			}, 250);
		},
		onMouseRest: function onMouseRest(selection) {
			//console.info("onMouseRest",selection);
		},
		onZoomEnd: function onZoomEnd() {

			this.markerLayer.needsRefresh = true;

			if(this.selection) { 
				this.setInfo(false);
			}
		},
		// #endregion



		// #######################################################
		// #region info
		setGroupInfo: function setGroupInfo(group, info) {
			if(typeof group != "string" && typeof group != "number") {
				console.warn("Leaflet.hexagonal.setGroupInfo: name of group invalid", group);
				return;
			}
			this.groupInfo[group] = info;
		},
		setInfo: function setInfo(info) {

			if(this.info) {
				this.infoLayer.clearLayers();
			} 

			if(!info || !this.options.infoVisible) {
				return;
			}


			// convert points{} to points[]
			var points = this._toArray(info.points);

			// get html for info
			var html = this.buildInfo(points);

			var iconHtml = document.createElement("DIV");
			iconHtml.className = "leaflet-hexagonal-info leftTop";
			iconHtml.innerHTML = html;
			var divicon = L.divIcon({
				iconSize:null,
				html: iconHtml,
				className: this.options.infoClassName
			});

			this.info = L.marker(info.latlng, {icon: divicon, zIndexOffset:1000 }).addTo(this.infoLayer);
			L.DomEvent.on(this.info, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.on(this.info, 'click', L.DomEvent.stopPropagation);
		},
		buildInfo: function buildInfo(points) {

			var html = "";
			var more = "";
			var br = "";
			var maxPoints = this.options.infoItemsMax;

			// infoMode: count
			if(this.options.infoMode=="count") {
				return points.length;
			}

			// infoMode: ids
			if(this.options.infoMode=="ids") {
				if(points.length>maxPoints) {
					more = "<br><span style='float:right'>[" + (points.length - maxPoints) + " more]</span>"; 
				}
				maxPoints = Math.min(points.length, maxPoints);

				for(var i=0;i<maxPoints; i++) {
					html += br + points[i].group;
					br = "<br>";
				}
				return html + more;
			}

			// infoMode: custom
			if(this.infoCustom) {
				if(points.length>maxPoints) {
					more = "<br><span style='float:right'>[" + (points.length - maxPoints) + " more]</span>"; 
				}
				maxPoints = Math.min(points.length, maxPoints);

				for(var i=0;i<maxPoints; i++) {
					html += br + this.infoCustom(points[i]);
					br = "<br>";
				}
				return html + more;
			}

			// // infoMode: default
			return points.length;

		},
		showInfo: function showInfo() {
			if(this.info) {
				var i = document.querySelector('.leaflet-hexagonal-info-container');
				if(i) { i.style.display="block"; }
			}
		},
		hideInfo: function hideInfo() {
			if(this.info) {
				var i =document.querySelector('.leaflet-hexagonal-info-container');
				if(i) { i.style.display="none"; }
			}
		},
		// #endregion



		// #######################################################
		// #region selection
		setSelection: function setSelection(latlng) {

			// if no latlng ==> clear
			if(!latlng) { 
				this.selection = false;
				this.setInfo(false);
				this.refresh();
				return false; 
			}


			// get selection
			var selection = this.getSelection(latlng);


			// if no points got hit
			if(!selection) {
				this.selection = false;
				this.setInfo(false);
				this.refresh();
				return false;
			}


			this.selection = selection;
			this.refresh();
			return selection;

		},
		getSelection: function getSelection(latlng) {

			if(!latlng) {
				return this.selection;
			}

			var wh = this._map.getSize();
			var zoom = this._map.getZoom();
			var size = this.calcHexagonSize(zoom);
			var overhang = (1 + (this.options.linkReach / this.calcHexagonDiameter()))*size;
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			offset = {x:Math.round(offset.x), y: Math.round(offset.y) };
			var p = this.getPixels_from_latlng(latlng, wh.w, wh.h, overhang);
			var h = this.calcHexagonCell(p.x,p.y,size, offset);

			// hexagonals
			if(this.hexagonals[h.cell]) {
				return this.hexagonals[h.cell];
			}

			// no
			return false;

		},


		// #endregion



		// #######################################################
		// #region hexagon
		calcHexagonSize: function calcHexagonSize(zoom) {
			if(this.options.hexagonSize) { 
				if(typeof this.options.hexagonSize == "number") {
					return this.options.hexagonSize; 
				}
				if(typeof this.options.hexagonSize == "function") {
					return this.options.hexagonSize(zoom);
				}	
			}
			return 16;
		},	
		calcHexagonCell: function calcHexagonCell(x,y, size, offset) { // hexagon top-flat
			if(this.options.hexagonMode == "pointyTop") {
				return this.calcHexagonCell_pointyTop(x,y, size, offset);
			}

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.7320508075688772;  
			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2;  
			
			var t = Math.floor(ys + sqrt3 * xs + 1);
			var idy = Math.floor((Math.floor(2 * ys + 1) + t) / 3);
			var idx = Math.floor((t + Math.floor(-ys + sqrt3 * xs + 1)) / 3);
			
			var cy = (idy - idx/2) * size - offset.y;
			var cx = idx/2 * sqrt3 * size - offset.x;
			var clatlng = this._map.containerPointToLatLng([Math.round(cx),Math.round(cy)]);
			idy -= Math.floor(idx/2); // flat - offset even-q
			var cell = (idx + "_" + idy); 

			var pointyTop=false;

			var path = "M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:pointyTop };
		},
		calcHexagonCell_pointyTop: function calcHexagonCell_pointyTop(x,y, size, offset) { // hexagon top-pointy
			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.7320508075688772; 
			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2;

			var t = Math.floor(xs + sqrt3 * ys + 1);
			var idx = Math.floor((Math.floor(2 * xs + 1) + t) / 3);
			var idy = Math.floor((t + Math.floor(-xs + sqrt3 * ys + 1)) / 3);
			
			var cx = (idx-idy/2) * size - offset.x;
			var cy = idy/2 * sqrt3 * size - offset.y;
			var clatlng = this._map.containerPointToLatLng([cx,cy]);
			idx -= Math.floor(idy/2); // pointy - offset even-r
			var cell = (idx + "_" + idy); 

			var pointyTop = true;

			var path = "M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:pointyTop };
		},
		getLinkPath: function getLinkPath(point0, point1, size, offset) {

			var group = point0.group;
			var h0 = point0.cell;
			var h1 = point1.cell;

			// distance between hexagon-centers
			var dx = h0.cx - h1.cx;
			var dy = h0.cy - h1.cy;
			var dist = Math.sqrt((dx*dx+dy*dy)) / size;
   
			// identity or direct neighbor
			if(dist<1.1) {
			   return false;
			}

			// collect unique hexagons on connecting line
			var h;
			var hs = {};
			var d = 1/(Math.ceil(dist));
			for(var t=d; t<1-d/2; t+=d) {
			   	var x = h0.cx + (h1.cx-h0.cx) * t;
				var y = h0.cy + (h1.cy-h0.cy) * t;
				h = this.calcHexagonCell(x,y,size,offset);
				if(!hs[h.cell]) {

					hs[h.cell] = h;

					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = { };
						this.hexagonals[h.cell].ids = {};
					}
					if(!this.hexagonals[h.cell].link0) {
						this.hexagonals[h.cell].link0 = point0;
						this.hexagonals[h.cell].links = {};
					}
					this.hexagonals[h.cell].links[point0.group] = point0;
					this.hexagonals[h.cell].ids[point0.group] = point0.group;
				}

			}



			// linkMode = line
			if(this.options.linkMode=="line") {			
				var join = 1 - this.options.linkJoin; 
		
				var mx = (h0.cx+h1.cx)/2;
				var my = (h0.cy+h1.cy)/2;

				var x = h0.cx + (mx-h0.cx) * join;
				var y = h0.cy + (my-h0.cy) * join;
				var path = `M${x} ${y} L${mx} ${my} `;
				x = h1.cx + (mx-h1.cx) * join;
				y = h1.cy + (my-h1.cy) * join;
				path += `L${x} ${y}`;

				return path;
			}


			// linkMode = default
			if(this.options.linkMode=="default") {			
				var join = 1 - this.options.linkJoin;
				var ks = Object.keys(hs);
		
				var x = h0.cx + (hs[ks[0]].cx-h0.cx) * join;
				var y = h0.cy + (hs[ks[0]].cy-h0.cy) * join;
				var path = `M${x} ${y} `;
				var i=0;
				path += `L${hs[ks[i]].cx} ${hs[ks[i]].cy} `;
				i = ks.length-1;
				path += `L${hs[ks[i]].cx} ${hs[ks[i]].cy} `;
				x = h1.cx + (hs[ks[i]].cx-h1.cx) * join;
				y = h1.cy + (hs[ks[i]].cy-h1.cy) * join;
				path += `L${x} ${y}`;

				return path;
			}


			// linkMode = hexagonal
			var join = 1 - this.options.linkJoin;
			var ks = Object.keys(hs);
			var x = h0.cx + (hs[ks[0]].cx-h0.cx) * join;
			var y = h0.cy + (hs[ks[0]].cy-h0.cy) * join;
			var path = `M${x} ${y} `;
			for(var i=0; i<ks.length; i++) {
				path += `L${hs[ks[i]].cx} ${hs[ks[i]].cy} `;
			}
			x = h1.cx + (hs[ks[ks.length-1]].cx-h1.cx) * join;
			y = h1.cy + (hs[ks[ks.length-1]].cy-h1.cy) * join;
			path += `L${x} ${y}`;
			return path;
			
		},
		calcHexagonDiameter: function calcHexagonDiameter() {
			var size = this.hexagonSize;
			var ll0 = this._map.containerPointToLatLng([0,0]);
			var ll1 = this._map.containerPointToLatLng([size*1.077,0]); // avg between shortest(1) and longest(2/sqrt(3)) hexagon-crosssection
			return this.getDistance(ll0.lng,ll0.lat,ll1.lng,ll1.lat);
		},
		// #endregion


		// #######################################################
		// #region helpers
		addIconSvg: function addIconSvg(iconName, svg, scale) {
			if(typeof iconName != "string" || typeof svg != "string") {
				console.warn("Leaflet.hexagonal.addIcon: parameter 'iconName' and 'svg' have to be strings");
				return;
			}

			// svg is url
			if(svg.substring(svg.length - 4)==".svg") {
				var ref = this;
				fetch(svg)
				.then((resp) => resp.text())
				.then((svg_string) => {
					ref.addIconSvg(iconName, svg_string, scale);
				});
				return;
			}
			
			// svg is not a string
			if(svg.indexOf("<svg")!==0) {
				console.warn('Leaflet.hexagonal.addSvg: parameter <svg> must be a svg-string');
				return;
			}

			//size
			var size = {width:0, height:0};
			var p = new DOMParser();
			var d = p.parseFromString(svg,"text/xml");
			size.width = d.getElementsByTagName("svg")[0].getAttribute('width') || 0;
			size.height = d.getElementsByTagName("svg")[0].getAttribute('height') || 0;
	
			if(!size.width || !size.height) {
				console.warn("Leaflet.hexagonal.addIconSvg: svg lacks width and/or height - falls back on default (24,24)");
				size.width = 24;
				size.height = 24;
			} 

			scale = scale || 1;

			this.icons[iconName] = {svg:svg, size:size, scale:scale};
		},

		validateLatLng: function validateLatLng(latlng) {
			if(typeof latlng == "object") {
				if(typeof latlng.lat == "number") {
					if(typeof latlng.lng == "number") {
						return { lat:latlng.lat, lng:latlng.lng };
					}
					if(typeof latlng.lon == "number") {
						return { lat:latlng.lat, lng:latlng.lon };
					}
					console.warn("Leaflet.hexagonal.latlng: unknown format", latlng);
					return { lat:0, lng:0, nullIsland:true };
				}
				if(Array.isArray(latlng)) {
					return {lng: latlng[0], lat: latlng[1]};
				}
			}
			console.warn("Leaflet.hexagonal.latlng: unknown format", latlng);
			return { lat:0, lng:0, nullIsland:true };
		},
		getBbox_from_tile15: function getBbox_from_tile15(t15) {
			t15 = t15 + "AAAAA";
			var z = 15;
			var z3 = Math.floor(z / 3);
			// t64 > quad
			var q = "";
			var ks = "ABIJCDKLQRYZSTabEFMNGHOPUVcdWXefghopijqrwx45yz67klstmnuv018923-_";
			var j, k;
			for (var i = 0; i < z3; i++) {
				j = ks.indexOf(t15[i]);
				k = j.toString(4);
				while (k.length < 3) { k = "0" + k; }
				q += k;
			}
			// quad > tile
			var tx = 0;
			var ty = 0;
			var b, m;
			for (var i = 0; i < z; i++) {
				b = z - i;
				m = 1 << (b - 1);
				if (q[z - b] === "1") { tx |= m; }
				else if (q[z - b] === "2") { ty |= m; }
				else if (q[z - b] === "3") { tx |= m; ty |= m; }
			}
			// tile > mxyz
			var f = 360 / Math.pow(2, z);
			var e = 0.0000000001;
			var x0 = ((tx + e) * f) - 180;
			var y0 = 180 - (ty + e) * f;
			var x1 = ((tx + 1 + e) * f) - 180;
			var y1 = 180 - (ty + 1 + e) * f;
			// mxyz > latlng
			var r = 360 / Math.PI;
			return [x0, r * Math.atan(Math.exp((y1 * Math.PI) / 180)) - 90, x1, r * Math.atan(Math.exp((y0 * Math.PI) / 180)) - 90];
		},
		getPixels_from_bbox: function getPixels_from_bbox(bbox, w, h) {
			var p0 = this._map.latLngToContainerPoint([bbox[1], bbox[0]]);
			var p1 = this._map.latLngToContainerPoint([bbox[3], bbox[2]]);
			var visible = true;
			if (p1.x < 0 || p1.y < 0 || p0.x > w || p0.y > h) { visible = false; }
			return { x0: p0.x, y0: p1.y, x1: p1.x, y1: p0.y, visible: visible };
		},
		getPixels_from_latlng: function getPixels_from_latlng(latlng, w, h, overhang=50) {
			var p = this._map.latLngToContainerPoint([latlng.lat, latlng.lng]);
			if (p.x < -overhang || p.y < -overhang || p.x > w+overhang || p.y > h+overhang) { return { x: p.x, y: p.y, visible: false }; }
			return { x: p.x, y: p.y, visible: true };
		},
		getLinkPos: function getLinkPos(group) {
			var il = this.points.length;
			if(il<1) { return -1; }
			var i=il-1;
			while(i>=0) {
				if(group==this.points[i].group) {
					return i;
				}
				i--;
			}
			return -1;
		},
		getDistance: function (lng1, lat1, lng2, lat2) { // lng1, lat1, lng2, lat2 || {lng1, lat1}, {lng2, lat2}
			if (typeof lng1 == "object" && typeof lat1 == "object") {
				lat2 = lat1.lat;
				lng2 = lat1.lng;
				lat1 = lng1.lat;
				lng1 = lng1.lng;
			}
			if ((lat1 == lat2) && (lng1 == lng2)) {
				return 0;
			}

			var d2r = Math.PI / 180;
			var r2d = 180 / Math.PI;

			var radlat1 = lat1 * d2r;
			var radlat2 = lat2 * d2r;
			var theta = lng1 - lng2;
			var radtheta = theta * d2r;;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = dist * r2d * 111319.49;
			return Math.round(dist * 100) / 100;

		},
		_toArray: function _toArray(obj) {
			var arr = [];
			if(typeof obj !="object") { return arr; }
			var ks = Object.keys(obj);
			if(!ks.length) { return arr; }
			ks.sort();
			for(var i=0;i<ks.length; i++) {
				arr.push(obj[ks[i]]);
			}
			return arr;
		},
		_genUID: function _genUID() {
			return (Date.now()&16777215) + "_" + Math.floor(Math.random() * 1000000); // string = uses 4.6 days worth of ms and 10^6 random
		},
		_genId: function _genId() {
			this._incId++;
			return this._incId;
		},
		_genGroup: function _genGroup() {
			this._incGroup++;
			return this._incGroup;
		},
		// #endregion


	});

	// Instanciator
	function hexagonal(t) {
		return e.hexagonal ? new i(t) : null;
	}

	// Plugin Props
	e.Hexagonal = i,
		e.hexagonal = hexagonal,
		t.Hexagonal = i,
		t.hexagonal = hexagonal,
		t["default"] = hexagonal,
		Object.defineProperty(t, "__esModule", { value: !0 });
});
