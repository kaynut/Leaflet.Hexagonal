// todo:
// DONE: selection rework
// DONE: add: selectionMode > single hexagon, group > selectionMode: "group" || "id"
// DONE: update marker-clickablility
// DONE: options.thingVisible >> options.thingDisplay >> this.display.thing && _checkDisplay 
// DONE: check again if links are colored the right way in clustering
// DONE: link:0 does not work , check === true
// DONE: draw marker ontop of hexagons !!!!
// DONE: linkSelectable

// DONE: calc groupDistance, pointDistance, groupDuration, pointDuration
// rework setInfo, buildInfo
// DONE: draw selected points first, then everything else


// updates
// DONE: special treatment for linkMode=curve clickability?
// SKIP: put part of hexagonalize in webworker?
// SKIP: clusterMode: clusterIndicator (if single or clustered)
// SKIP: tint and stuff to drawMarker?

/*!
 * Leaflet.Hexagonal.js v0.9.0
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
			opacity: 0.7,
			visible: true,
			minZoom: 0,
			maxZoom: 18,
			padding: 0.1,



			// hexagonDisplay: boolean || {minZoom,maxZoom}
			// > whether or not / at what zoomlevels hexagons will be visible
			hexagonDisplay: true,
			// hexagonSize: integer || function
			// size of hexagonal grid
			hexagonSize: 16, 
			hexagonSize: function(zoom) { return Math.max(16,Math.pow(2, zoom-6)); }, 
			// hexagonGap: pixels 
			// gap between the cells of the hexagonal grid 
			hexagonGap: 0, 	
			// hexagonOrientation: "flatTop" || "pointyTop"  || "circle"
			// whether the hexagons are flat or pointy on the upper part
			hexagonOrientation: "flatTop",		

			// fillDefault: "color" || false
			fillDefault: "#fd1",
			// strokeDefault: "color" || false
			strokeDefault: "#303234", 	
			// borderWidth: pixels
			borderWidth: 1,


			// groupDefault: false || "groupName"
			groupDefault: "_group", // if set, points with no group, will default to this. if not set, ungrouped points will be put in an indiviual group


			// clusterMode: "population" || "sum" || "avg" || "min" || "max" || false (style for hexagon-cluster: depending on point data) 	
			clusterMode: false,
			//clusterProperty: "meta.propertyName" 
			clusterProperty: "_", // current property for data-based coloring (included in meta)
			//clusterDefaultValue: number 
			clusterDefaultValue: 0, // default value, when current clusterProperty is not set for datapoint
			// clusterMinValue: false || number
			clusterMinValue: false,
			// clusterMaxValue: false || number
			clusterMaxValue: false,
			// clusterScale: false="linear" || "square" || "log"
			clusterScale: "log",
			// clusterColors: [ "#color", "rgba(r,g,b)", [r,g,b,a],...] 
			clusterColors: ["#4d4","#dd4","#d44","#800"],


			// markerDisplay: boolean || {minZoom,maxZoom}
			markerDisplay: true,
			// markerImageTint: false || color
			markerImageTint:"#303234",
			// markerImageScaler: float
			markerImageScaler: 1.15,
			// markerIconColor: false || color
			markerIconColor:"#303234",
			// markerIconScaler: float
			markerIconScaler: 0.7,


			// linkDisplay: boolean || {minZoom,maxZoom}
			linkDisplay: true,	
			// linkWidth: pixels
			linkWidth: 2,
			// linkFill: false || true || "#color"
			linkFill: true,	
			// linkOpacity: false , number(0.1-1)
			linkOpacity: false,		
			// linkMode: "spline" || "line" || "aligned" || "hexagonal" || false
			linkMode: "spline",
			// linkJoin: number (0=gap between hexagon and line / 0.5=hexagon and line touch / 1=hexagon-center and line fully joined)
			linkJoin: 1,  
			// linkSelectable: boolean
			linkSelectable: true,


			//  gutterDisplay: boolean || {minZoom,maxZoom}
			gutterDisplay: true,
			// gutterFill: false || "#color"
			gutterFill: false, //"#101214",
			// gutterStroke: false || "#color"
			gutterStroke: "#202224",

			// thumbSize: integer
			thumbSize: 128,


			// selectionMode: "point" || "points" || "group" || "groups" || "linked" || "ids"
			selectionMode: "group",
			// selectionTolerance
			selectionTolerance:4,	
			
			// highlightDisplay: boolean || {minZoom,maxZoom}
			highlightDisplay: true,
			// highlightStrokeColor: "color" || false
			highlightStrokeColor: "rgba(255,255,255)", 	 	
			// highlightStrokeWidth: pixels
			highlightStrokeWidth: 2,

			// infoDisplay: boolean || {minZoom,maxZoom}
			infoDisplay: true,
			// infoOpacity: true || false
			infoOpacity: 0.9,
			// infoClassName: class || ""
			infoClassName: "leaflet-hexagonal-info-container",

			// develClicker: boolean (overlay ration)
			develClicker:false,

		},
		// #endregion



		// #######################################################
		// #region props
		
		_incId: 0,
		_incGroup: 0,
		_incCid:0,

		hexagonSize:0,
		hexagonals: {},

		totals:{
			population:0,
			sum:0,
			avg:0,
			min: false,
			max: false,
			delta: 0
		},

		points: {},
		links: [],
		markers: {},

		clickId: 0,
		clicks: [],

		selection: {
			type:false,
			mode:false,
			ts:0,
			selected:[],
			highlighted: []
		},

		groupOrder:[],
		groupVisibility:{},
		groupInfo: {},
		groupFill: {},

		filters: [],
		filterActive: true,

		info: false,
		infoLayer: false,

		clusterRamp: false,
		clusterRampHash: false,

		gutter: false,

		display: {},

		thumbs:{},
		thumbsInfo: { called:0, resolved:0, last:0 },

		view: {
			zoom:false,
			center:[]
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
				this._padding = undefined;

				this._instanceUID = Date.now();
				this._incId = (Date.now() & 16777215)*1000;
				this._incGroup = (Date.now() & 16777215)*1000;
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

			this.fetchThumb("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20height%3D%2224%22%20width%3D%2224%22%3E%3Cpath%20d%3D%22M6.4%2019%205%2017.6l5.6-5.6L5%206.4%206.4%205l5.6%205.6L17.6%205%2019%206.4%2013.4%2012l5.6%205.6-1.4%201.4-5.6-5.6Z%22%2F%3E%3C%2Fsvg%3E",{id:"error"});	
			this._clicker = document.createElement("CANVAS");
			this.infoLayer = L.layerGroup([]).addTo(this._map);
			this.infoLayer.infoLayer = true;

			this._update("onAdd");
		},
		onRemove: function onRemove() {
			this.fire("layer-beforedestroy"); 
			this._destroyContainer();
			this.fire("layer-destroyed");
		},
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
			var zoom = this._map.getZoom();
			var majorChange = false;
			if(zoom!==this.view.zoom) { 
				this.view.zoom = zoom;
				majorChange = "onZoom";
			}
			this._isZoomVisible() ? this._update(majorChange) : this._zoomHide();
		},
		_onLayerZoomEnd: function _onLayerZoomEnd(e) {
			this._onZoomEnd(e);
		},
		_onZoomVisible: function _onZoomVisible() {
			this._isZoomVisible() ? this._zoomShow() : this._zoomHide();
		},
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
			var o = this._map.getZoomScale(i, this._zoom);
			var n = e.DomUtil.getPosition(this._container);
			var s = this._map.getSize().multiplyBy(.5 + this.options.padding);
			var a = this._map.project(this._center, i);
			var r = this._map.project(t, i).subtract(a);
			var h = s.multiplyBy(-o).add(n).add(s).subtract(r);
			e.Browser.any3d ? e.DomUtil.setTransform(this._container, h, o) : e.DomUtil.setPosition(this._container, h);
		},
		_update: function _update(majorChange) {
			if (!this._map._animatingZoom || !this._bounds) {
				this.__update();
				var t = this._bounds;
				var i = this._container;
				this._onDraw(majorChange);
				e.DomUtil.setPosition(i, t.min), this.fire("layer-render");
			}
		},
		__update: function __update() {
			var t = this.options.padding; 
			var i = this._map.getSize();
			var o = this._map.containerPointToLayerPoint(i.multiplyBy(-t));
			this._padding = i.multiplyBy(t);
			this._bounds = new e.Bounds(o, o.add(i.multiplyBy(1 + 2 * t)));
			this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();
		},
		_reset: function _reset() {
			this._update(false);
			this._updateTransform(this._center, this._zoom);
		},
		getContainer: function getContainer() {
			return this._container;
		},
		setContainer: function setContainer(t) {
			var e = this.getContainer(), i = e.parentNode;
			if (delete this._container, this.options.container = t, this._container || this._initContainer(),this.setOpacity(this.options.opacity), window.isNaN(this.options.zIndex)) { this.setZIndex(100); } 
			else { this.setZIndex(this.options.zIndex); }
			return i ? i.replaceChild(t, e) : this.getPane().appendChild(t), this._update(false), this;
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
				if (this.options.visible = !0, this._isZoomVisible()) {
					return this._map.on(this.getEvents(), this),
					this.getContainer().style.display = "", 
					this._update("onShow"), 
					this; 
				}
				this._zoomHide();
				
			}
		},
		hide: function hide() {
			if (this.options.visible) {
				return this.options.visible = !1, 
				this._zoomHide(), 
				this._map.off(this.getEvents(), this),
				this.getContainer().style.display = "none", 
				this;
			}
		},
		setVisibility: function setVisibility(show) {
			if(typeof show != "boolean") {
				show = !this.options.visible;
			}
			if(show==this.options.visible) { return; }
			if(show) {
				if(!this._map.hasLayer(this.infoLayer)) {
					this._map.addLayer(this.infoLayer);
				}
				this.show();
			}
			else if(this._map.hasLayer(this.infoLayer)) {
				this._map.removeLayer(this.infoLayer);
				this.hide();
			}
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
		// #region add
		// addPoint:  add single point with metadata
		addPoint: function addPoint(latlng, meta) { //  {lng,lat} , {id, group, link, ... }
			
			// latlng
			latlng = this._valLatlng(latlng);
			var mxy = this._getMxy(latlng);
			
			// meta
			meta = meta || {};

			// group
			var group = this._valGroup(meta);

			// id
			var id = this._valId(meta);
			
			// link
			var link = this._valLink(meta, group);

			// name
			var name = this._valName(meta);

			// data
			var data = this._valData(meta);

			// tags
			var tags = this._valTags(meta);

			// marker
			var marker = this._valMarker(meta);

			// scale
			var scale = meta.scale || 1;

			// dist
			var dist = this._valDist(meta, latlng, group, link);

			// timespan
			var ts = this._valTimeSpan(meta, group);

			// point 
			var point = {
				latlng: latlng,	
				mxy: mxy,
				cell: false,

				id: id,
				group: group,
				name: name,					
				tags: tags,

				dist:dist,
				time:ts.time,
				span:ts.span,
			
				data: data,

				marker: marker,
				link:link,

				style: {
					fill: meta.fill || false,
					stroke: meta.stroke || false,
					borderWidth: meta.borderWidth || false,
					linkWidth: meta.linkWidth || false,
					scale: scale
				}
			};

			// add points
			this.points[group].push(point);

			// add marker
			if(meta.marker) {

				var thumb = this.fetchThumb(meta.marker);
				if(thumb !== false) {
					point.style.thumb = thumb;
					this.markers[group].push(point);
				}
				else {
					point.marker = false;
				}

			}	

			// refresh
			this.refresh();

			// return add-count
			return 1; 

		},




		// addLine: add array of latlngs (all with same metadata), all in the same group and all linked by default
		addLine: function addLine(latlngs, meta) {  // [ latlng0, latlng1, ... ] , {group,data, ...} 
			if(!Array.isArray(latlngs)) {
				console.warn("Leaflet.hexagonal.addLine: parameter must be an array", latlngs);
				return 0;
			}
			if(!latlngs.length) { return 0; }

			// meta
			meta = meta || {};

			// group
			meta.group = this._valGroup(meta);
			
			// link
			meta.link = true;

			// loop latlngs
			var c = 0;
			for(var i=0; i<latlngs.length; i++) {
				c += this.addPoint(latlngs[i], meta);
			}
			
			// return add-count
			return c;

		},
		// addPoints: add array of latlngs (all with same metadata), by default each in a seperate group and not linked
		addPoints: function addPoints(latlngs, meta) {  
			if(!Array.isArray(latlngs)) {
				console.warn("Leaflet.hexagonal.addPoints: parameter must be an array", latlngs);
				return 0;
			}
			if(!latlngs.length) { return 0; }

			// meta
			meta = meta || {};

			// group
			meta.group = this._valGroup(meta);
			
			// link
			meta.link = false;

			// loop latlngs
			var c = 0;
			for(var i=0; i<latlngs.length; i++) {
				c += this.addPoint(latlngs[i], meta);
			}
			
			// return add-count
			return c;

		},
		// addGeojson: add url || geojson-string || geosjon-object
		addGeojson: function addGeojson(g, meta) {

			// meta
			meta = meta || {};

			// g == string
			if(typeof g == "string") {
				
				// g == geojson-url
				if(g.endsWith(".json") || g.endsWith(".geojson")) { 
					meta = meta || {};
					var that = this;
					fetch(g)
						.then((resp) => resp.json())
						.then((json) => {
							that.addGeojson(json,meta);
					});
					return 0;
				}
				// g == geojson-string
				try {
					g = JSON.parse(g);
				} catch(e) {
					console.warn("Leaflet.hexagonal.addGeojson: invalid geojson-string", g);
					return 0;
				}
			}

			
			// g == invalid
			if(typeof g != "object" || typeof g.type != "string") { 
				console.warn("Leaflet.hexagonal.addGeojson: invalid geojson-object", g);
				return 0; 
			}
			

			// g == Point
			if(g.type == "Point" && g.coordinates) {
				var gp = g.properties || {};
				var m = Object.assign({}, gp, meta);
				this.addPoint({lng:g.coordinates[0],lat:g.coordinates[1]}, m);
				return 1;
			}

			// g == LineString
			if(g.type == "LineString") {
				var c = g.coordinates.length;
				if(!c) { return 0; }

				var gp = g.properties || {};
				var m = Object.assign({}, gp, meta);
				m.group = this._valGroup(m);
				m.link = true;

				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, m);
				}
				return c;
			}

			// g == MultiPoint
			if(g.type == "MultiPoint") {
				var c = g.coordinates.length;
				if(!c) { return 0; }

				var gp = g.properties || {};
				var m = Object.assign({}, gp, meta);
				m.group = this._valGroup(m);
				m.link = false;

				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, m);
				}
				return c;
			}

			// g == Feature
			if(g.type == "Feature") {
				var gp = g.properties || {};
				var m = Object.assign({}, gp, meta);
				return this.addGeojson(g.geometry, m);
			}

			// g == FeatureCollection
			if(g.type == "FeatureCollection") {
				var c = 0;
				var gp = g.properties || {};
				for(var i=0; i<g.features.length; i++) {
					var gpi = g.features[i].properties || {};
					var m = Object.assign({}, gp, gpi, meta);
					c+= this.addGeojson(g.features[i].geometry, m);
				}
				return c;
			}

			// g == invalid
			console.warn("Leaflet.hexagonal.addGeojson: no valid data in geojson");
			return 0;

		},
		// addMarker
		addMarker: async function addMarker(latlng, meta) {
			// latlng
			latlng = this._valLatlng(latlng);

			// meta
			meta = meta || {};

			var marker = this._valMarker(meta);
			if(!marker) {
				marker = "error";
			}


			return this.addPoint(latlng, meta);
	
		},

		// #endregion
		
		
		// #######################################################
		// #region remove
		removeGroup: function removeGroup(group) {
			if(typeof group != "number" && typeof group != "string") {
				return 0;
			}

			var c = 0;

			for(var go=0; go<this.groupOrder.length; go++) {
				if(group !== this.groupOrder[go]) {
					continue;
				}

				c += this.points[group].length;

				// remove group-stuff
				this.groupOrder.splice(go,1);
				delete this.groupVisibility[group];
				delete this.points[group];
				delete this.markers[group];

			}

			this.refresh();

			return c;
		},
		removeAll: function removeAll() {
			var c = 0;

			for(var go=0; go<this.groupOrder.length; go++) {
				var group = this.groupOrder[go];

				c += this.points[group].length;

				// remove group-stuff
				this.groupOrder.splice(go,1);
				delete this.groupVisibility[group];
				delete this.points[group];
				delete this.markers[group];
			}


			this.refresh();

			return c;
		},


		// #endregion


		// #######################################################
		// #region hexagonal
		hexagonalize: function hexagonalize(majorChange) { 
			// map/layer
			var dpr = L.Browser.retina ? 2 : 1;
			var size = this._bounds.getSize();
			this._container.width = dpr * size.x;
			this._container.height = dpr * size.y;
			this._container.style.width = size.x + "px";
			this._container.style.height = size.y + "px";
			var zoom = this._map.getZoom();
			var padding = this._padding;

			// canvas
			var ctx = this._container.getContext("2d");
			if (L.Browser.retina) { ctx.scale(dpr, dpr); }
			ctx.translate(padding.x, padding.y);
			var w = dpr * size.x;
			var h = dpr * size.y;

			// clicker
			this._clicker.width = w;
			this._clicker.height = h;
			var ctxc = this._clicker.getContext("2d");
			if (L.Browser.retina) { ctxc.scale(dpr, dpr); }
			ctxc.translate(padding.x, padding.y);


			// hexagonals
			this.hexagonals = {};


			// hexagonSize
			var hexagonSize = this.calcHexagonSize(zoom);
			this.hexagonSize = hexagonSize;


			// hexagonOffset, hexagonOverhang 
			var nw = this._map.getBounds().getNorthWest(); 
			var se = this._map.getBounds().getSouthEast();
			var hexagonOffset = this._map.project(nw, zoom);
			hexagonOffset= {x:Math.round(hexagonOffset.x), y: Math.round(hexagonOffset.y) };
			var hexagonOverhang = hexagonSize*2; 


			// pixelOrigin, pixelPane
			var pixelOrigin = this._map.getPixelOrigin();
			var pixelPane = this._map._getMapPanePos(); //L.DomUtil.getPosition(this._map._mapPane);


			// hexagonBounds
			var hnw = this.calcHexagonCell(-padding.x,-padding.y, hexagonSize, hexagonOffset, zoom);
			var hse = this.calcHexagonCell(w,h, hexagonSize, hexagonOffset, zoom);
			var hexagonBounds = [hnw.cellX, hnw.cellY, hse.cellX, hse.cellY];


			// display
			this.display.hexagons = this._checkDisplay(this.options.hexagonDisplay,zoom);
			this.display.markers = this._checkDisplay(this.options.markerDisplay,zoom);
			this.display.links = this._checkDisplay(this.options.linkDisplay,zoom);
			this.display.gutter = this._checkDisplay(this.options.gutterDisplay,zoom);
			this.display.highlight = this._checkDisplay(this.options.highlightDisplay,zoom);
			this.display.info = this._checkDisplay(this.options.infoDisplay,zoom);


			// totals
			var tSum = 0;
			var tPopulationCellMax = 1;
			var tPopulation = 0;
			var tMarkers = 0;
			var tLinks = 0;
			var tMin = Number.MAX_SAFE_INTEGER;
			var tMax = Number.MIN_SAFE_INTEGER;


			// cluster points
			for(var go=0; go<this.groupOrder.length; go++) {
				var group = this.groupOrder[go];

				// group no visible
				if(!this.groupVisibility[group]) {
					continue;
				}

				// loop group-points
				var pl = this.points[group].length;
				for (var i = 0; i < pl; i++) {

					// point
					var point = this.points[group][i];

					// position/visibility/filter
					var p = this._getPixels_from_mxy(point.mxy, w,h, hexagonOverhang, zoom, pixelOrigin, pixelPane);
					point.visible = p.visible;
					point.position = [p.x,p.y];
					point.filter = this.checkFilter(point);

					// skip filtered
					if(!point.filter) {
						continue;
					}

					// skip invisible+unlinked
					if(!point.visible) {
						if(!this.display.links) {
							continue;
						}
					}
					

					// hexagon-cell
					var h = this.calcHexagonCell(p.x,p.y,hexagonSize, hexagonOffset, zoom);
					point.cell = h;

					// data
					var d = point.data[this.options.clusterProperty];
					if(isNaN(d)) { d = this.options.clusterDefaultValue || 0; }


					// create hex
					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;

						this.hexagonals[h.cell].point = false;
						this.hexagonals[h.cell].points = [];

						this.hexagonals[h.cell].group = false;
						this.hexagonals[h.cell].groups = {};

						this.hexagonals[h.cell].ids = {};
						
						this.hexagonals[h.cell].marker = false;
						this.hexagonals[h.cell].markers = [];

						this.hexagonals[h.cell].link = false;
						this.hexagonals[h.cell].links = [];
						this.hexagonals[h.cell].linkOnly = false;

						this.hexagonals[h.cell].cluster = { population:0, sum:0, avg:0, min:0, max:0 }; 
						
						this.hexagonals[h.cell].style = { fill:false };

						this.hexagonals[h.cell].visible = p.visible;

						this.hexagonals[h.cell].selected = 0;

					}

					// first point in hex
					if(!this.hexagonals[h.cell].point) {
						this.hexagonals[h.cell].cluster.min = d;
						this.hexagonals[h.cell].cluster.max = d;
					}

					// new point in hex
					this.hexagonals[h.cell].point = [group,i];
					this.hexagonals[h.cell].points.push([group, i]);

					this.hexagonals[h.cell].selected = Math.max(point.selected, this.hexagonals[h.cell].selected);
					
					// new group in hex
					if(typeof this.hexagonals[h.cell].groups[group] != "number") {
						this.hexagonals[h.cell].groups[group] = 0;
					}
					this.hexagonals[h.cell].group = group;
					this.hexagonals[h.cell].groups[group]++;

					// ids
					this.hexagonals[h.cell].ids[point.id]=true;

					// cluster data
					this.hexagonals[h.cell].cluster.population++;
					this.hexagonals[h.cell].cluster.sum += d;
					this.hexagonals[h.cell].cluster.avg = this.hexagonals[h.cell].cluster.sum / this.hexagonals[h.cell].cluster.population || 0; 
					this.hexagonals[h.cell].cluster.min = Math.min(this.hexagonals[h.cell].cluster.min, d);
					this.hexagonals[h.cell].cluster.max = Math.max(this.hexagonals[h.cell].cluster.max, d);
					this.hexagonals[h.cell].style = { fill: (point.style.fill || false) };

					// countMax
					tPopulationCellMax = Math.max(this.hexagonals[h.cell].cluster.population, tPopulationCellMax);  

					// point cluster
					point.cell.cluster = this.hexagonals[h.cell].cluster;

					// totals
					tSum += d;
					tMin = Math.min(tMin, d); 
					tMax = Math.max(tMax, d); 
					tPopulation++;

				}
			}
			// cluster markers 
			if(this.display.markers) {

				for(var go=0; go<this.groupOrder.length; go++) {
					var group = this.groupOrder[go];

					// group no visible
					if(!this.groupVisibility[group]) {
						continue;
					}

					// loop group-markers
					var pl = this.markers[group].length;	
					for (var i = 0; i < pl; i++) {

						// marker-pixels/visible
						var marker = this.markers[group][i]; 
						var m = this._getPixels_from_mxy(marker.mxy, w,h, hexagonOverhang, zoom, pixelOrigin, pixelPane);
						marker.visible = m.visible;
						marker.position = [m.x,m.y];
						marker.filter = this.checkFilter(marker);

						// skip filtered
						if(!marker.filter) {
							continue;
						}

						if(!marker.visible) {
							continue;
						}

						// hexagon-cell
						var scale = marker.style.scale; 
						var h = this.calcHexagonCell(m.x,m.y,hexagonSize, hexagonOffset, zoom, scale);
						marker.cell = h; 

						// create hex
						if(!this.hexagonals[h.cell]) {
							this.hexagonals[h.cell] = h;

							this.hexagonals[h.cell].point = false;
							this.hexagonals[h.cell].points = [];

							this.hexagonals[h.cell].group = group;
							this.hexagonals[h.cell].groups = {};
							
							this.hexagonals[h.cell].ids = {};

							this.hexagonals[h.cell].marker = false;
							this.hexagonals[h.cell].markers = [];

							this.hexagonals[h.cell].link = false;
							this.hexagonals[h.cell].links = [];
							this.hexagonals[h.cell].linkOnly = false;

							this.hexagonals[h.cell].cluster = { population:0, sum:0, avg:0, min:0, max:0 }; 
							
							this.hexagonals[h.cell].style = { fill:false };

							this.hexagonals[h.cell].visible = m.visible;

							this.hexagonals[h.cell].selected = 0;

						}

						// new marker in hex
						this.hexagonals[h.cell].marker = [group,i];
						this.hexagonals[h.cell].markers.push([group, i]);
						this.hexagonals[h.cell].style.marker = marker.style;
						this.hexagonals[h.cell].selected = Math.max(point.selected, this.hexagonals[h.cell].selected);

						// new group in hex
						if(typeof this.hexagonals[h.cell].groups[group] != "number") {
							this.hexagonals[h.cell].groups[group] = 0;
						}
						this.hexagonals[h.cell].group = group;
						this.hexagonals[h.cell].groups[group]++;

						tMarkers++;

					}
				}
			}

			// collect links
			this.links = [];
			if(this.display.links) { 
				for(var go=0; go<this.groupOrder.length; go++) {
					var group = this.groupOrder[go];

					// group no visible
					if(!this.groupVisibility[group]) {
						continue;
					}

					// group too short for links
					var pl = this.points[group].length;			
					if(pl<2) { continue; }
			
					// loop group-points for links
					for(var i=0; i<pl; i++) {
						var p1 = this.points[group][i];
						var i1 = i;
						var c1 = p1.cell.cell;

						// filter
						if(!p1.filter) { continue; }

						// loop point-links
						var ll = p1.link.length; 
						for(var j=0; j<ll; j++) { 

							if(p1.link[j]<pl) { // if index is within bounds
								var p0 = this.points[group][p1.link[j]];
								var i0 = p1.link[j];
								var c0 = p0.cell.cell;

								// filter
								if(!p0.filter) { continue; }

								// same cell  > no link
								if(c0==c1) { continue; } 
								
								// at least one point visible OR link intersects viewport
								var visible = p0.visible || p1.visible || this.checkLinkVisible(p0.latlng, p1.latlng, nw, se);
								if(visible) {
									var path = this.getLinkPath(group,i0,i1,hexagonSize, hexagonOffset, zoom);
									if(path) {
										var style = p1.style || false;
										
										if(p1.marker) {
											style = p0.style; 
										}

										this.links.push({group: group, start:p0, end:p1, path:path, style:style, link:[group,i,i0], selected:p1.selected});
										tLinks++;
									}
								}
							}	

						}
					}
				}
			}


			// gutter
			if(this.display.gutter) {	
				this.gutter = this.calcGutterCells(hexagonBounds, hexagonSize, hexagonOffset);
			}

			this.totals.hexagons = Object.keys(this.hexagonals).length; 
			this.totals.markers = tMarkers; 
			this.totals.links = tLinks;
			this.totals.points = tPopulation;
			this.totals.population = tPopulation;
			this.totals.populationCellMax = tPopulationCellMax;
			this.totals.sum = tSum;
			this.totals.avg = tSum/tPopulation || 0;
			this.totals.min = tMin;
			this.totals.max = tMax;
			this.totals.delta = tMax-tMin;

			//console.log("totals", this.totals)

		},
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
		calcHexagonCell: function calcHexagonCell(x,y, size, offset, zoom, scale=1) { // hexagon top-flat
			if(this.options.hexagonOrientation == "pointyTop") {
				return this.calcHexagonCell_pointyTop(x,y, size, offset, zoom, scale);
			}
			if(this.options.hexagonOrientation == "circle") {
				return this.calcHexagonCell_circle(x,y, size, offset, zoom, scale);
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
			var cellY = Math.floor((Math.floor(2 * ys + 1) + t) / 3);
			var cellX = Math.floor((t + Math.floor(-ys + sqrt3 * xs + 1)) / 3);
			
			var cy = (cellY - cellX/2) * size - offset.y;
			var cx = cellX/2 * sqrt3 * size - offset.x;
			var clatlng = this._map.containerPointToLatLng([Math.round(cx),Math.round(cy)]);
			cellY -= Math.floor(cellX/2); // flat - offset even-q
			var cell = zoom + "_" + cellX + "_" + cellY; 

			var pointyTop=false;

			s2=s2*scale;
			s4=s4*scale;
			h=h*scale;

			var path = `M${cx-s2} ${cy} L${cx-s4} ${cy-h} L${cx+s4} ${cy-h} L${cx+s2} ${cy} L${cx+s4} ${cy+h} L${cx-s4} ${cy+h} Z`;
			return { cell:cell, cellX:cellX, cellY:cellY, cx:cx, cy:cy, path:path, latlng:clatlng, size:size, pointyTop:pointyTop };
		},
		calcHexagonCell_pointyTop: function calcHexagonCell_pointyTop(x,y, size, offset, zoom, scale) { // hexagon top-pointy
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
			var cellX = Math.floor((Math.floor(2 * xs + 1) + t) / 3);
			var cellY = Math.floor((t + Math.floor(-xs + sqrt3 * ys + 1)) / 3);
			
			var cx = (cellX-cellY/2) * size - offset.x;
			var cy = cellY/2 * sqrt3 * size - offset.y;
			var clatlng = this._map.containerPointToLatLng([cx,cy]);
			cellX -= Math.floor(cellY/2); // pointy - offset even-r
			var cell = zoom + "_" + cellX + "_" + cellY; 

			s2=s2*scale;
			h=h*scale;
			s4=s4*scale;
			var path = `M${cx} ${cy-s2} L${cx-h} ${cy-s4} L${cx-h} ${cy+s4} L${cx} ${cy+s2} L${cx+h} ${cy+s4} L${cx+h} ${cy-s4} Z`;
			
			return { cell:cell, cellX:cellX, cellY:cellY, cx:cx, cy:cy, path:path, latlng:clatlng, size:size, pointyTop:true };
		},
		calcHexagonCell_circle: function calcHexagonCell_circle(x,y, size, offset, zoom, scale) { // hexagon circle
			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.7320508075688772; 
			var s0 = size - gap;
			var r = s0/2;

			var t = Math.floor(xs + sqrt3 * ys + 1);
			var cellX = Math.floor((Math.floor(2 * xs + 1) + t) / 3);
			var cellY = Math.floor((t + Math.floor(-xs + sqrt3 * ys + 1)) / 3);
			
			var cx = (cellX-cellY/2) * size - offset.x;
			var cy = cellY/2 * sqrt3 * size - offset.y;
			var clatlng = this._map.containerPointToLatLng([cx,cy]);
			cellX -= Math.floor(cellY/2); // pointy - offset even-r
			var cell = zoom + "_" + cellX + "_" + cellY; 

			r = r * scale;
			var path = `M${cx-r} ${cy-r} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`;
			
			return { cell:cell, cellX:cellX, cellY:cellY, cx:cx, cy:cy, path:path, latlng:clatlng, size:size, pointyTop:true };
		},
		calcGutterCells: function calcGutterCells(bounds, size, offset) { // hexagon top-flat
			if(this.options.hexagonOrientation == "pointyTop") {
				return this.calcGutterCells_pointyTop(bounds, size, offset);
			}

			var [x0,y0,x1,y1] = bounds || [0,0,0,0];

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var sqrt3 = 1.7320508075688772;  
			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2; 

			var cells = [];
			var cellX,cellY,cx,cy;
			for(var y=y0; y<=y1;y+=1) {
				for(var x=x0;x<=x1;x+=1) {
					cellY = y;
					cellX = x;
					if(this.hexagonals[cellX+"_"+cellY]?.cell) { }
					else {
						cellY += Math.floor(cellX/2);
						cy = (cellY - cellX/2) * size - offset.y;
						cx = cellX/2 * sqrt3 * size - offset.x;
						//cells.push("M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z");				
						cells.push(`M${cx-s2} ${cy} L${cx-s4} ${cy-h} L${cx+s4} ${cy-h} L${cx+s2} ${cy} L${cx+s4} ${cy+h} L${cx-s4} ${cy+h} Z`); 
					} 
				}
			}
			return cells;

		},
		calcGutterCells_pointyTop: function calcGutterCells_pointyTop(bounds, size, offset) { // hexagon top-flat
			var [x0,y0,x1,y1] = bounds || [0,0,0,0];

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var sqrt3 = 1.7320508075688772;  
			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2; 

			var cells = [];
			var cellX,cellY,cx,cy;
			for(var y=y0; y<=y1;y+=1) {
				for(var x=x0;x<=x1;x+=1) {
					cellY = y;
					cellX = x;
					if(this.hexagonals[cellX+"_"+cellY]?.cell) { }
					else {
						cellX += Math.floor(cellY/2);
						cx = (cellX - cellY/2) * size - offset.x;
						cy = cellY/2 * sqrt3 * size - offset.y;
						//cells.push("M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z");
						cells.push(`M${cx} ${cy-s2} L${cx-h} ${cy-s4} L${cx-h} ${cy+s4} L${cx} ${cy+s2} L${cx+h} ${cy+s4} L${cx+h} ${cy-s4} Z`); 
					} 
				}
			}
			return cells;

		},
		checkLinkVisible: function checkLinkVisible(p0,p1,nw,se) {
			var t = 0;
			if ((p0.lng >= nw.lng && p0.lng <= se.lng && p0.lat >= nw.lat && p0.lat <= se.lat) || (p1.lng >= nw.lng && p1.lng <= se.lng && p1.lat >= nw.lat && p1.lat <= se.lat)) {
				return true;
			}
			if (p0.lng < nw.lng && p1.lng >= nw.lng) { 
				t = p0.lat + (p1.lat - p0.lat) * (nw.lng - p0.lng) / (p1.lng - p0.lng);
				if (t > nw.lat && t <= se.lat) { return true; }
			}
			else if (p0.lng > se.lng && p1.lng <= se.lng) { 
				t = p0.lat + (p1.lat - p0.lat) * (se.lng - p0.lng) / (p1.lng - p0.lng);
				if (t >= nw.lat && t <= se.lat) { return true; }
			}
			if (p0.lat < nw.lat && p1.lat >= nw.lat) { 
				t = p0.lng + (p1.lng - p0.lng) * (nw.lat - p0.lat) / (p1.lat - p0.lat);
				if (t >= nw.lng && t <= se.lng) { return true; }
			} 
			else if (p0.lat > se.lat && p1.lat <= se.lat) {  //  Bottom edge
				t = p0.lng + (p1.lng - p0.lng) * (se.lat - p0.lat) / (p1.lat - p0.lat);
				if (t >= nw.lng && t <= se.lng) { return true;}
			}
			return false;
		},
		getLinkPath: function getLinkPath(group, index0, index1, size, offset, zoom) {

			var p0 = this.points[group][index0];
			var p1 = this.points[group][index1];

			var group = p0.group;
			var h0 = p0.cell;
			var h1 = p1.cell;

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


				// hexagon-cell
				h = this.calcHexagonCell(x,y,size,offset,zoom);

				if(!hs[h.cell]) {
					hs[h.cell] = h;

					
					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;

						this.hexagonals[h.cell].point = false;
						this.hexagonals[h.cell].points = [];

						this.hexagonals[h.cell].group = group;
						this.hexagonals[h.cell].groups = {};

						this.hexagonals[h.cell].ids = {};
						
						this.hexagonals[h.cell].marker = false;
						this.hexagonals[h.cell].markers = [];

						this.hexagonals[h.cell].link = false;
						this.hexagonals[h.cell].links = [];
						this.hexagonals[h.cell].linkOnly = true;

						this.hexagonals[h.cell].cluster = { population:0, sum:0, avg:0, min:0, max:0 }; 
						
						this.hexagonals[h.cell].style = { fill:false };

					}

					this.hexagonals[h.cell].link = [group, index0, index1];
					this.hexagonals[h.cell].links.push([group, index0, index1]);

					// link clickability
					// if hexagon only contains links > add group/groups //// and not curve-mode
					if(this.hexagonals[h.cell].linkOnly===true) { //// && this.options.linkMode!="curve") {
						if(typeof this.hexagonals[h.cell].groups[group] != "number") {
							this.hexagonals[h.cell].groups[group] = 0;
						}
						this.hexagonals[h.cell].group = group;
						this.hexagonals[h.cell].groups[group]++;
					}
					
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


			// linkMode = spline
			if(this.options.linkMode=="spline") {			
				var join = 1 - this.options.linkJoin;
				var ks = Object.keys(hs);
		
				var x = h0.cx + (hs[ks[0]].cx-h0.cx) * join;
				var y = h0.cy + (hs[ks[0]].cy-h0.cy) * join;
				var path = `M${x} ${y} `;
				var i = ks.length-1;
				path += `C ${hs[ks[i]].cx} ${hs[ks[i]].cy}, `;
				i = 0;
				path += `${hs[ks[i]].cx} ${hs[ks[i]].cy}, `;
				x = h1.cx + (hs[ks[i]].cx-h1.cx) * join;
				y = h1.cy + (hs[ks[i]].cy-h1.cy) * join;
				path += `${x} ${y}`;
				return path;
			}


			// linkMode = curve
			if(this.options.linkMode=="curve") {			
				var join = 1 - this.options.linkJoin;
				var ks = Object.keys(hs);
		
				var x = h0.cx + (hs[ks[0]].cx-h0.cx) * join;
				var y = h0.cy + (hs[ks[0]].cy-h0.cy) * join;
				var path = `M${x} ${y} `;
				var i = 0;
				path += `C ${x} ${hs[ks[i]].cy}, `;
				i = ks.length-1;
				path += `${hs[ks[i]].cx} ${y}, `;
				x = h1.cx + (hs[ks[i]].cx-h1.cx) * join;
				y = h1.cy + (hs[ks[i]].cy-h1.cy) * join;
				path += `${x} ${y}`;
				return path;
			}

			// linkMode = aligned
			if(this.options.linkMode=="aligned") {			
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
			//var ll1 = this._map.containerPointToLatLng([size*1.077,0]); // avg between shortest(1) and longest(2/sqrt(3)) hexagon-crosssection
			var ll1 = this._map.containerPointToLatLng([size*1.0501,0]); // 1.0501 avg diameter, based on hexagonal-circular-area comp
			return this.getDistance(ll0,ll1);
		},

		// #endregion


		// #######################################################
		// #region draw
		refresh: function refresh() { 
			var self = this;
			window.clearTimeout(self._refreshPoints_debounce);
			self._refreshPoints_debounce = window.setTimeout(function () {
				self._update("onRefresh");
			}, 50);
		},
		_onDraw: function _onDraw(majorChange) {
			var startTime = performance.now();
			this.view.zoom = this._zoom;
			this.view.center = this._center;
			this.hexagonalize(majorChange);
			this.totals.hexTime = performance.now() - startTime; 
			this.updateClusterRamp();
			this.onDraw(this._container, this.hexagonals, this.links, this.selection, majorChange);
			this.totals.drawTime = performance.now() - startTime; 
		},

		onDraw: function onDraw(canvas, hexagonals, links, selection, majorChange) {

			// canvasContext
			var ctx = canvas.getContext("2d");
			ctx.globalCompositeOperation = "destination-over";
			ctx.globalAlpha = 1;

			var clicker = this._clicker.getContext("2d");
			clicker.globalCompositeOperation = "destination-over";

			// layers
			if(majorChange) {}

			// style
			var style = { 
				fill: this.options.fillDefault, 
				stroke: this.options.strokeDefault, 
				borderWidth: this.options.borderWidth || 1,
				linkWidth: this.options.linkWidth || 1
			};

			// selection
			var selTs = false;
			if(this.display.highlight) {
				selTs = this.selection.ts;
			}	
			var highlighted = [];		

			// clicker
			this.clickId = -1;

			// totals
			var tPopulation = this.totals.population;
			var tMin = this.totals.min;
			if(typeof this.options.clusterMinValue == "number") {
				tMin = this.options.clusterMinValue;
			}
			var tMax = this.totals.max; 
			if(typeof this.options.clusterMaxValue == "number") {
				tMax = this.options.clusterMaxValue;
			} 
			var tHexagonsDrawn = 0;
			var tLinksDrawn = 0;
			var tMarkersDrawn = 0;


			// draw markers, points and links
			var hexs = Object.keys(hexagonals); 
			
			// draw markers
			if(this.display.markers && hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					var hex = hexagonals[hexs[h]];

					if(hex.visible && hex.marker) {

						// style 
						style.fill = hex.style.marker.fill || hex.style.fill || this.groupFill[hex.group] || this.options.fillDefault;

						// cluster style
						if(this.options.clusterMode) {
							if(this.options.clusterMode=="population") {
								style.fill = this.calcClusterColor(hex.cluster.population, 1, tPopulation);
							}
							else if(this.options.clusterMode=="sum") {
								style.fill = this.calcClusterColor(hex.cluster.sum,  tMin, tMax);
							}
							else if(this.options.clusterMode=="avg") {
								style.fill = this.calcClusterColor(hex.cluster.avg,  tMin, tMax);
							}
							else if(this.options.clusterMode=="min") {
								style.fill = this.calcClusterColor(hex.cluster.min,  tMin, tMax);
							}
							else if(this.options.clusterMode=="max") {
								style.fill = this.calcClusterColor(hex.cluster.max,  tMin, tMax);
							}
						}
					
						// draw selected
						var sel = false;
						if(selTs && hex.selected >= selTs) {
							sel = true; 
							selection.highlighted.push(hex);
							highlighted.push(hex);
						}

						// draw
						tMarkersDrawn += this.drawMarker(ctx, hex, style, sel, clicker);

					}
				}
			}


			// draw points
			if(this.display.hexagons && hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					var hex = hexagonals[hexs[h]];

					// draw hexagonal points
					if(hex.visible && hex.point && !hex.marker) {	

						// style hexagonals
						style.fill = hex.style.fill || this.groupFill[hex.group] || this.options.fillDefault;
						if(this.options.clusterMode) {
							if(this.options.clusterMode=="population") {
								style.fill = this.calcClusterColor(hex.cluster.population, 1, tPopulation);
							}
							else if(this.options.clusterMode=="sum") {
								style.fill = this.calcClusterColor(hex.cluster.sum,  tMin, tMax);
							}
							else if(this.options.clusterMode=="avg") {
								style.fill = this.calcClusterColor(hex.cluster.avg,  tMin, tMax);
							}
							else if(this.options.clusterMode=="min") {
								style.fill = this.calcClusterColor(hex.cluster.min,  tMin, tMax);
							}
							else if(this.options.clusterMode=="max") {
								style.fill = this.calcClusterColor(hex.cluster.max,  tMin, tMax);
							}
						}

						// draw hexagon selected
						var sel = false;
						if(hex.selected >= selTs) {
							sel = true; 
							selection.highlighted.push(hex);
							highlighted.push(hex);
						}
						
						tHexagonsDrawn += this.drawPoint(ctx, hex, style, sel, clicker);

					}

				}
			}



			// draw links:ok
			if(links.length && this.display.links) {

				ctx.globalAlpha = this.options.linkOpacity || 1;
				ctx.lineJoin = "round";

				for(var i=0; i<links.length; i++) {

					var cluster = false;
					var link = links[i].start;
					var cluster = link.cell.cluster;

					// style
					style.fill = links[i]?.style?.fill || this.groupFill[link.group] || this.options.fillDefault;


					// cluster style
					if(this.options.clusterMode) {
						if(this.options.clusterMode=="population") {
							style.fill = this.calcClusterColor(cluster.population, 1, tPopulation);
						}
						else if(this.options.clusterMode=="sum") {
							style.fill = this.calcClusterColor(cluster.sum, tMin, tMax);
						}
						else if(this.options.clusterMode=="avg") {
							style.fill = this.calcClusterColor(cluster.avg,  tMin, tMax);
						}
						else if(this.options.clusterMode=="min") {
							style.fill = this.calcClusterColor(cluster.min,  tMin, tMax);
						}
						else if(this.options.clusterMode=="max") {
							style.fill = this.calcClusterColor(cluster.max,  tMin, tMax);
						}
					}
					
					// draw 
					var sel = false;
					if(links[i].selected >= selTs) {
						sel = true; 
						selection.highlighted.push(links[i]);
					}
					tLinksDrawn += this.drawLink(ctx, links[i], style, sel, clicker);


				}

			}


			// draw highlights
			ctx.globalCompositeOperation = "source-over";
			for(var i=0;i<highlighted.length; i++) {
				this.drawHighlight(ctx, highlighted[i]);
			} 

			// draw gutter
			if(this.display.gutter) {
				ctx.globalCompositeOperation = "destination-over";
				this.drawGutter(ctx);
			}
			

			// totals
			this.totals.hexagonsDrawn = tHexagonsDrawn;
			this.totals.markersDrawn = tMarkersDrawn;
			this.totals.linksDrawn = tLinksDrawn;

			// afterDraw
			this.afterDraw();

			// devel
			if(this.options.develClicker) {
				ctx.globalCompositeOperation = "source-over";
				ctx.drawImage(this._clicker,-this._padding.x,-this._padding.y);
			}
			

		},


		afterDraw: function afterDraw() {

		},
		drawPoint: function drawPoint(ctx, hexagon, style, selected, clicker) {
			var hPath = new Path2D(hexagon.path);

			// stroke
			ctx.strokeStyle = style.stroke;
			ctx.lineWidth = style.borderWidth;
			ctx.stroke(hPath);

			// fill
			ctx.fillStyle = style.fill;
			ctx.fill(hPath);

			// clicker
			this.clickId++;
			this.clicks[this.clickId] = hexagon.point; 
			clicker.fillStyle = "#" + (this.clickId+1048576).toString(16);
			clicker.fill(hPath);
	
			return 1;
		},
		drawMarker: function drawMarker(ctx,hexagon,style, selected, clicker) {

			var marker = this.markers[hexagon.marker[0]][hexagon.marker[1]];
			var thumb = this.thumbs[marker.style.thumb];
			if(!thumb.image) { return 0; } 

			var size = this.options.thumbSize;
			var scale = marker.style.scale;
			var sizeH = this.hexagonSize * scale;
			if(thumb.type=="icon") { sizeH *= this.options.markerIconScaler;} // 0.7
			else { sizeH *= this.options.markerImageScaler; } // 1.15
			var ix0 = hexagon.cx - sizeH/2;
			var iy0 = hexagon.cy - sizeH/2;

			var hPath = new Path2D(marker.cell.path);

			// stroke
			ctx.strokeStyle = style.stroke;
			ctx.lineWidth = style.borderWidth;
			ctx.stroke(hPath);
	

			// thumb
			ctx.save();
			ctx.clip(hPath);
			ctx.drawImage(thumb.image, 0,0,size,size, ix0,iy0, sizeH,sizeH); 
			ctx.restore();

			// fill
			ctx.fillStyle = style.fill;
			ctx.fill(hPath);

			// clicker
			this.clickId++;
			this.clicks[this.clickId] = hexagon.point; 
			clicker.fillStyle = "#" + (this.clickId+1048576).toString(16);
			clicker.fill(hPath);

			return 1;

		},
		drawLink: function drawLink(ctx, link, style, selected, clicker) {
			var path = new Path2D(link.path);

			// fill
			if(this.options.linkFill) {
				ctx.strokeStyle = this.options.linkFill;
				if(this.options.linkFill===true) {
					ctx.strokeStyle = style.fill;
				}
				ctx.lineWidth = style.linkWidth;
				ctx.stroke(path);
			}

			// stroke linkBorder, linkSelected
			if(selected) {
				ctx.strokeStyle = this.options.highlightStrokeColor;
				ctx.lineWidth = this.options.linkWidth + this.options.highlightStrokeWidth*2;
			}
			else {
				ctx.strokeStyle = style.stroke;
				ctx.lineWidth = style.linkWidth + style.borderWidth*2;
			}
			ctx.stroke(path);

			// clicker
			if(this.options.linkSelectable) {
				this.clickId++;
				this.clicks[this.clickId] = link.link; 
				clicker.strokeStyle = "#" + (this.clickId+1048576).toString(16);
				clicker.lineWidth = style.linkWidth + style.borderWidth*2 + this.options.selectionTolerance;
				clicker.stroke(path);
			}

			return 1;
			
		},
		drawHighlight: function drawHighlight(ctx, hexagon) {
			
			// highlight marker
			if(hexagon.marker) {
				var marker = this.markers[hexagon.marker[0]][hexagon.marker[1]];
				var hPath = new Path2D(marker.cell.path);
				ctx.strokeStyle = this.options.highlightStrokeColor;
				ctx.lineWidth = this.options.highlightStrokeWidth;
				ctx.stroke(hPath);	
			}
			else {
				var hPath = new Path2D(hexagon.path);
				ctx.strokeStyle = this.options.highlightStrokeColor;
				ctx.lineWidth = this.options.highlightStrokeWidth;
				ctx.stroke(hPath);				
			}

		},
		drawGutter: function drawGutter(ctx) {
			if(!this.gutter.length) { return; }
			ctx.strokeStyle = this.options.gutterStroke;
			ctx.fillStyle = this.options.gutterFill;
			ctx.lineWidth = 1;
			for(var g=0; g<this.gutter.length; g++) {
				var path = new Path2D(this.gutter[g]);
				if(this.options.gutterFill) {
					ctx.fill(path);
				}
				if(this.options.gutterStroke) {
					ctx.stroke(path);
				}
			}
		},

		//#endregion


		// #######################################################
		// #region cluster
		setClustering: function setClustering(options) {
			if(typeof options != "object") { return; }

			if(typeof options.property == "string" && options.property!="") {
				this.options.clusterProperty = options.property;
			}
			if(typeof options.defaultValue == "number") {
				this.options.clusterDefaultValue = options.defaultValue;
			}
			if(typeof options.min == "number") {
				this.options.clusterMinValue = options.min;
			}
			if(typeof options.max == "number") {
				this.options.clusterMaxValue = options.max;
			}
			if(typeof options.mode == "string") {
				this.options.clusterMode = options.mode;
			}
			if(typeof options.scale == "string") {
				this.options.clusterScale = options.scale;
			}
			if(typeof options.colors == "object" && Array.isArray(options.colors)) {
				this.options.clusterColors = options.colors;
			}

		},
		updateClusterRamp: function checkClusterRamp() {
			var ocr = JSON.stringify(this.options.clusterColors);
			if(ocr!=this.clusterRampHash) {
				this.setClusterRamp(this.options.clusterColors);
			}
		},
		setClusterRamp: function setClusterRamp(colorArray) {
			this.clusterRamp = [[48, 50, 52, 1] , [224, 226, 228, 1]]; // default value
			this.clusterRampHash = JSON.stringify(this.clusterRamp);
			if(!colorArray) {
				return;
			}
			if(!Array.isArray(colorArray) || !colorArray.length) {
				console.warn("Leaflet.hexagonal.setClusterRamp: Parameter colorArray is invalid", colorArray);
				return;
			}

			this.clusterRamp = [];
			for(var i=0; i<colorArray.length; i++) {
				if(typeof colorArray[i] == "string") {
					colorArray[i] = this._getRGBA(colorArray[i]);
				}
				else if(Array.isArray(colorArray[i])) {}
				else {
					colorArray[i] = [0,0,0,1];
				}
				colorArray[i][0] = colorArray[i][0] || 0;
				colorArray[i][1] = colorArray[i][1] || 0;
				colorArray[i][2] = colorArray[i][2] || 0;
				colorArray[i][3] = colorArray[i][3] || 1;

				this.clusterRamp[i] = colorArray[i];
			}

			if(colorArray.length<2) {
				this.clusterRamp[1] = colorArray[0];
			}

			this.clusterRampHash = JSON.stringify(this.clusterRamp);

		},
		calcClusterColor: function calcClusterColor(value, min=0, max=1) {
			var ramp = this.clusterRamp;
			var l = ramp.length - 1;

			var t0 = Math.min(min,max);
			var t1 = Math.max(min,max);

			if(value<=t0) { 
				return "rgba(" + ramp[0][0] + "," + ramp[0][1] + "," + ramp[0][2] + "," + ramp[0][3] + ")";
			}
			else if(value>=t1) { 
				return "rgba(" + ramp[l][0] + "," + ramp[l][1] + "," + ramp[l][2] + "," + ramp[l][3] + ")"; 
			}

			var t;
			if(this.options.clusterScale=="log") {
				t = Math.log(value-t0+1)/Math.log(t1-t0+1); 
			}
			else if(this.options.clusterScale=="square") {
				t = Math.sqrt(value-t0)/Math.sqrt(t1-t0);
			}
			else {
				t = (value-t0) / (t1-t0);
			}

			t = t * l;
			var f = Math.floor(t);
			t = t - f;
			
			return "rgba(" + (ramp[f][0]*(1-t)+ramp[f+1][0]*t) + "," + (ramp[f][1]*(1-t)+ramp[f+1][1]*t) + "," + (ramp[f][2]*(1-t)+ramp[f+1][2]*t) + ","  + (ramp[f][3]*(1-t)+ramp[f+1][3]*t) + ")";
		},
		// #endregion



		// #######################################################
		// #region filter
		checkFilter: function checkFilter(point) {
			if(!this.filterActive  || !this.filters.length) { return true; }

			// filters are always linked with the logical operator AND
			var checks = 0;
			var filters = this.filters.length;
			for(var i=0; i<filters;i++) {
				var f = this.filters[i];

				if(f.operator=="=") {
					if(point.data[f.property] === f.value) { checks++; }
					continue;
				}
				if(f.operator=="!=") {
					if(point.data[f.property] !== f.value) { checks++; }
					continue;
				}
				if(f.operator==">") {
					if(point.data[f.property] > f.value) { checks++; }
					continue;
				}
				if(f.operator==">=") {
					if(point.data[f.property] >= f.value) { checks++; }
					continue;
				}
				if(f.operator=="<") {
					if(point.data[f.property] < f.value) { checks++; }
					continue;
				}
				if(f.operator=="<=") {
					if(point.data[f.property] <= f.value) { checks++; }
					continue;
				}
				if(f.operator=="><") {
					if(point.data[f.property] >= f.value0 && point.data[f.property] <= f.value1) { checks++; }
					continue;
				}
				if(f.operator=="<>") {
					if(point.data[f.property] <= f.value0 && point.data[f.property] >= f.value1) { checks++; }
					continue;
				}

				if(f.property=="name" || f.property=="tags" || f.property=="group" || f.property=="id") {
					var t = point[f.property].toLowerCase();
					if(f.operator=="contains") {
						if(t.indexOf(f.value)>=0) { checks++; }
						continue;
					}
					if(f.operator=="startswith") {
						if(t.startsWith(f.value)) { checks++; }
						continue;
					}
					if(f.operator=="endswith") {
						if(t.endsWith(f.value)) { checks++; }
						continue;
					}
				}

			}

			return (checks==filters);
		},
		getFilter: function getFilter() {
			return this.filters;
		},
		setFilter: function setFilter(param) {

			// boolean param => set filterActive
			if(typeof param == "boolean") {
				if(param == this.filterActive) { return; }
				this.filterActive = param;
				this.refresh();
				return;
			}

			// none-object param
			if(typeof param != "object") { return; 	}

			// object param.active
			if(typeof param.active == "boolean") {
				if(param.active!=this.filterActive) {
					this.filterActive = param.active;
					this.refresh();
				}
			}
			// object param.filter
			if(typeof param.filter == "object") {
				param.filters = param.filter;
			}
			// object param.filters
			if(typeof param.filters == "object") {
				if(!Array.isArray(param.filters)) {
					param.filters = [param.filters];
				}
				for(var i=0; i<param.filters.length; i++) {
					this.addFilter(param.filters[i]);
				}
			}

		},
		toggleFilter: function toggleFilter() {
			this.filterActive = !this.filterActive;
			this.refresh();
			return;
		},
		addFilter: function addFilter(filter) {
			if(typeof filter != "object") { return 0; }
			if(typeof filter.property != "string") { return 0; }
			if(typeof filter.operator != "string") { return 0; }
			filter.operator = filter.operator.toLowerCase();

			// number equal: = 
			if(filter.operator=="=") {
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number not equal: != 
			if(filter.operator== "not" || filter.operator=="!=") {
				filter.operator = "!=";
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number greater: >
			if(filter.operator== "greater" || filter.operator==">") {
				filter.operator = ">";
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number greaterequal: >=
			if(filter.operator== "greaterequal" || filter.operator==">=") {
				filter.operator = ">=";
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number less: <
			if(filter.operator== "less" || filter.operator== "smaller" || filter.operator=="<") {
				filter.operator = "<";
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number lessequal: <=
			if(filter.operator== "lessequal" || filter.operator== "smallerequal" || filter.operator=="<=") {
				filter.operator = "<=";
				if(isNaN(filter.value*1)) { return 0; }
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number between: >< 
			if(filter.operator== "between" || filter.operator=="><") {
				filter.operator = "><";
				if(isNaN(filter.value0*1)) { return 0; }
				if(isNaN(filter.value1*1)) { return 0; }
				if(filter.value0>filter.value1) {
					var v1 = filter.value0;
					filter.value0 = filter.value1;
					filter.value1 = v1;
				}
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// number apart: <> 
			if(filter.operator== "apart" || filter.operator=="<>") {
				filter.operator = "<>";
				if(isNaN(filter.value0*1)) { return 0; }
				if(isNaN(filter.value1*1)) { return 0; }
				if(filter.value0>filter.value1) {
					var v1 = filter.value0;
					filter.value0 = filter.value1;
					filter.value1 = v1;
				}
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// string contains
			if(filter.operator== "contains") {
				filter.value = filter.value+"";
				if(typeof filter.value != "string") { return 0; }
				filter.value = filter.value.toLowerCase();
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// string startswith
			if(filter.operator== "startswith") {
				filter.value += "";
				if(typeof filter.value != "string") { return 0; }
				filter.value = filter.value.toLowerCase();
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			// string endswith
			if(filter.operator== "endswith") {
				filter.value += "";
				if(typeof filter.value != "string") { return 0; }
				filter.value = filter.value.toLowerCase();
				this.filters.push(filter);
				this.refresh();
				return 1;
			}

			return 0;

		},
		clearFilter: function clearFilter(index=-1) {
			if(this.filters.length<1) { return; }
			if(index==-1) { 
				this.filters = [];
				this.refresh();
				return;
			}
			if(index>=0 && index<=this.filters.length) {
				this.filters.splice(index, 1);
				this.refresh();
				return;
			}
		},
		// #endregion


		// #######################################################
		// #region group
		setGroupOrder: function setGroupOrder(mode, group) {
			var go = this.groupOrder;
			

			// string mode
			if(typeof mode == "string") {
				var goNew = [];
				mode = mode.toLowerCase();
				group = group || "";
				
				// reverse
				if(mode=="reverse") { 
					for(var i=go.length-1; i>=0; i--) {
						goNew.push(go[i]);
					}
					this.groupOrder = goNew;
					this.refresh();
					return;
				}

				// top
				if(mode=="top" || mode == "totop") {
					var f = false;
					for(var i=0; i<go.length; i++) {
						if(go[i]== group) { f = true; }
						else { goNew.push(go[i]); }
					}
					if(!f) { return; }
					goNew.push(group); 
					this.groupOrder = goNew; 
					this.refresh();
					return;
				}

				// bottom
				if(mode=="bottom" || mode == "tobottom") {
					var f = false;
					for(var i=0; i<go.length; i++) {
						if(go[i]== group) { f = true; }
						else { goNew.push(go[i]); }
					}
					if(!f) { return; }
					goNew.unshift(group); 
					this.groupOrder = goNew;
					this.refresh();
					return;
				}

				// up
				if(mode=="up" || mode == "scrollup") {
					group = go.pop();
					go.unshift(group);
					this.refresh();
					return;
				}
				// down
				if(mode=="down" || mode == "scrolldown") {
					group = go.shift();
					go.push(group);
					this.refresh();
					return;
				}


			}

			// array-mode
			if(Array.isArray(mode) && mode.length>0) {
				this.groupOrder = mode;
				this.refresh();
				return;
			}

		},
		setGroupFill: function setGroupFill(group, color = false) {
			if(typeof group != "string" && typeof group != "number") {
				console.warn("Leaflet.hexagonal.setGroupFill: name of group invalid", group);
				return;
			}
			if(typeof color !== "string") {
				color = false;
			}
			this.groupFill[group] = color;
		},
		setGroupInfo: function setGroupInfo(group, info) {
			if(typeof group != "string" && typeof group != "number") {
				console.warn("Leaflet.hexagonal.setGroupInfo: name of group invalid", group);
				return;
			}
			this.groupInfo[group] = info;
		},
		// #endregion

		


		// #######################################################
		// #region events
		// click
		_onClick: function _onClick(e, target={layer:true}) {
			var selection = this.setSelectionByClick(e); 
			console.log(selection);
			this.setInfo(selection);
			this.onClick(e,selection, target);
			
		},
		// overwritable
		onClick: function onClick(e, selection, target) {
		},

		// rest
		_onMouseRest: function _onMouseRest(e) {
			var self = this;
			window.clearTimeout(self._onMouseRestDebounced_Hexagonal);
			self._onMouseRestDebounced_Hexagonal = window.setTimeout(function () {
				
				//var selection = self.selectByLatlng(e.latlng);
				//self.onMouseRest(e, selection, {layer:true});

			}, 250);
		},
		// overwritable
		onMouseRest: function onMouseRest(e, selection, target) {
		},

		// zoomend
		_onZoomEnd: function _onZoomEnd(e) {
			if(this.selection) { 
				this.setInfo(false);
			}
			this.onZoomEnd(e);
		},
		// overwritable
		onZoomEnd: function onZoomEnd(e) {
		},

		// #endregion



		// #######################################################
		// #region selection
		setSelectionByClick: function setSelectionByClick(e) {

			var mode = this.options.selectionMode;
			var ts = Date.now();

			var selection = { 
				type:"click",
				mode: mode,
				ts: ts,
				selected: [],
				highlighted: [],
				target:false
			};


			// get click-color
			var cp = e.containerPoint;
			var x = cp.x+this._padding.x;
			var y = cp.y+this._padding.y;
			var ctx = this._clicker.getContext("2d"); 
			var col = ctx.getImageData(x,y,1,1).data;
			var id = ((col[0]-16)*65536 + col[1]*256 + col[2]); // r-shift for alignment
			if(typeof id != "number" || !this.clicks[id]) { 
				return this.setSelection();
			}

			// click-id
			var cid = this.clicks[id];
			var group = cid[0];
			var p0 = cid[1];
			var p1 = cid[2];
			var point0 = this.points[group][p0];
			var point1 = this.points[group][p1];



			// no hit > clear selection
			if(!point0) {
				return this.setSelection();
			}


			// get hexagon
			var hex = this.getHexagon(point0.latlng);

			selection.target = hex.latlng;

			// select by mode
			if(mode=="point") {
				point0.selected = ts;
				selection.selected.push([group,p0]);
				if(point1) {
					point1.selected = ts;
					selection.selected.push([group,p1]);
				}
			}
			else if(mode=="points") {
				var ps = hex.points;
				for(var i=0; i<ps.length;i++) {
					this.points[ps[i][0]][ps[i][1]].selected = ts;
					selection.selected.push([ps[i][0],ps[i][1]]);
				}
			}
			else if(mode=="group") {
				var ps = this.points[group];
				for(var i=0; i<ps.length;i++) {
					this.points[group][i].selected = ts;
					selection.selected.push([group,i]);
				}
			}
			else if(mode=="groups") {
				var gs = Object.keys(hex.groups);
				for(var j=0; j<gs.length; j++) {
					var g = gs[j]; 
					var ps = this.points[g]; 
					for(var i=0; i<ps.length;i++) {
						this.points[g][i].selected = ts;
						selection.selected.push([g,i]);
					}
				}
			}
			else if(mode=="linked") {
				//walkLink
				var ps = this.points[group];
				var ls = this.walkLink(ps,p0);
				for(var i=0;i<ls.length;i++) {
					this.points[group][ls[i]].selected = ts;
					selection.selected.push([group,ls[i]]);
				}

			}


			// update selection
			this.selection = selection;
			this.refresh();
			return selection; 



		},

		getSelectionByClick: function getSelectionByClick(e) {

			// get click-color
			var cp = e.containerPoint;
			var x = cp.x+this._padding.x;
			var y = cp.y+this._padding.y;
			var ctx = this._clicker.getContext("2d"); 
			var col = ctx.getImageData(x,y,1,1).data;
			var id = ((col[0]-16)*65536 + col[1]*256 + col[2]); // r-shift for alignment
			if(typeof id != "number" || !this.clicks[id]) { 
				return this.setSelection();
			}

			// click-id
			var cid = this.clicks[id];
			var group = cid[0];
			var p0 = this.points[cid[0]][cid[1]];
			var p1 = this.points[cid[0]][cid[2]];

			// no data
			if(!p0) {
				return this.setSelection();
			}

			// selector.point
			var selector = { 
				click:true,
				clicked: p0,
				clickId: cid,
				clickGroup: group,
				clickObj: "point",
				clickOrigin: e.latlng
			}; 
			if(p1) {
				selector.clickObj = "link";
			}

			return this.setSelection(selector);

		},
		setSelection: function setSelection(selector) {

			var mode = this.options.selectionMode;
			var ts = Date.now();

			var selection = { 
				type: false,
				mode: mode,
				ts: ts,
				selected: [],
				highlighted: [],
				target: false
			};

			// clear
			if(typeof selector != "object") {
				if(this.selection.selected) {
					this.selection = selection;
					this.refresh();
				}
				return selection; 
			}

			/* todo: setSelection(latlng ???)
			// latlng format
			if(Array.isArray(selector)) {
				if(typeof selector[0] == "number" && typeof selector[1] == "number") {
					var latlng = { lat:selector[1], lng:selector[0] }; 
					selector = { latlng: latlng };
				}
			}
			else if(typeof selector.lat == "number") {
				if(typeof selector.lng == "number") {
					selector.latlng = { lat:selector.lat, lng:selector.lng }; 
				}
				if(typeof selector.lon == "number") {
					selector.latlng = { lat:selector.lat, lng:selector.lon }; 
				}
			}

			// latlng  
			*/

			// group/groups
			if(selector.group || selector.groups)  {
				if(!selector.groups) { selector.groups = selector.group; }
				if(!Array.isArray(selector.groups)) { selector.groups = [selector.groups]; }
				this.options.selectionMode = "groups";
				selection.type ="groups";
				selection.mode = "groups";
				var gs = selector.groups;
				for(var j=0; j<gs.length; j++) {
					var g = gs[j]; 
					var ps = this.points[g]; 
					for(var i=0; i<ps.length;i++) {
						this.points[g][i].selected = ts;
						selection.selected.push([g,i]);
					}
				}
			}


			// id
			else if(selector.id || selector.ids) {
				if(!selector.ids) { selector.ids = selector.id; }
				if(!Array.isArray(selector.ids)) { selector.ids = [selector.ids]; }
				this.options.selectionMode = "points";
				selection.type ="ids";
				selection.mode = "points";

				for(var go=0; go<this.groupOrder.length; go++) {
					var group = this.groupOrder[go];

					for(var i=0; i<this.points[group].length; i++) {
						var p = this.points[group][i];

						for(var j=0; j<selector.ids.length;j++) {
							if(p.id == selector.ids[j]) {
								p.selected = ts;
								selection.selected.push([group,i]);
							}
						}
					}
				}
			}


			// update selection
			this.selection = selection;
			this.refresh();
			return selection; 

		},
		clearSelection: function clearSelection() {
			return this.setSelection();
		},
		selectByLatlng: function selectByLatlng(latlng) {

			if(!latlng) {
				return false;
			}

			var wh = this._map.getSize();
			var zoom = this._map.getZoom();
			var size = this.calcHexagonSize(zoom);
			var overhang = size*2; 
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			offset = {x:Math.round(offset.x), y: Math.round(offset.y) };
			var p = this._getPixels_from_latlng(latlng, wh.w, wh.h, overhang);
			var h = this.calcHexagonCell(p.x,p.y,size, offset,zoom);

			// hexagonals
			if(this.hexagonals[h.cell]) {
				return this.hexagonals[h.cell];
			}

			return false;

		},

		// #endregion


		// #######################################################
		// #region info
		setInfo: function setInfo(info) {

			if(this.info) {
				this.infoLayer.clearLayers();
				this.info = false;
			} 
			console.log("setInfo", info);

			if(!info.selected || !this.display.info) {
				return;
			}

			if(!info.target) {
				return;
			}



			// get html for info
			var html = this.buildInfo(info);

			var iconHtml = document.createElement("DIV");
			iconHtml.className = "leaflet-hexagonal-info leftTop";
			iconHtml.innerHTML = html;
			var divicon = L.divIcon({
				iconSize:null,
				html: iconHtml,
				className: this.options.infoClassName
			});

			this.info = L.marker(info.target, {icon: divicon, zIndexOffset:1000, opacity:this.options.infoOpacity }).addTo(this.infoLayer);
			L.DomEvent.on(this.info, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.on(this.info, 'click', function(e) { 
				L.DomEvent.stopPropagation;
				console.log('clicked info!',e);
			});
		
		},
		buildInfo: function buildInfo(info) {
			var html = "";

			// todo: rewrite with .point/.points - instead pointIndices
			/*
			var pis =  info.pointIndices.length;
			var ps = [];
			for(var i=0; i< pis; i++) {
				var p = this.points[info.pointIndices[i]];
				if(p.info) {
					ps.push(p.info);
				}
			}
			if(!ps.length) { html = `${pis}`; }
			else if(ps.length==1) { html = `${ps[0]}`; }
			else if(ps.length==2) { html = `${ps[0]}<br>${ps[1]}`; }
			else if(ps.length==3) { html = `${ps[0]}<br>${ps[1]}<br>${ps[2]}`; }
			else { html = `${ps[0]}<br>${ps[1]}<br>...<br>${ps[ps.length-1]}`; }
			*/
			return html;

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
		// #region thumb
		fetchThumb: function fetchThumb(source, meta=false) {
			if(typeof source != "string") { 
				console.warn("Leaflet.Hexagonal","fetchThumb(): invalid sourceType", typeof source);
				return false; 
			}
			var l = source.length;
			if(!l) { 
				console.warn("Leaflet.Hexagonal","fetchThumb(): lack of source");	
				return false; 
			}

			// thumb-soucre is thumb-name
			if(l<24 && this.thumbs[source]) {
				return source;
			}

			// id - hash
			var id = this._genHash(source);

			// meta
			if(typeof meta != "object") { meta = {id:false, tint:false, opacity:false} }
			var id = meta.id || this._genHash(source);
			var imageTint = meta.imageTint || this.options.markerImageTint || false;
			var iconColor = meta.iconColor || this.options.markerIconColor || false;
			

			// thumb already exists
			if(this.thumbs[id]) { 
				return id; 
			}


			var type = false;
			var start = source.substring(0,14).toLowerCase();
			var end = source.substring(l-4,l).toLowerCase();
			
			// imageUrl
			if(end==".jpg" || end=="jpeg" || end==".png") {
				type = "image";
			}
			// svgUrl
			else if(end==".svg") {
				type = "icon";
			}
			// svgString
			else if(start.startsWith("<svg ") || start.startsWith("<?xml")) {
				source = 'data:image/svg+xml,' + encodeURIComponent(source);
				type = "icon";
			}
			// svgData
			else if(start=='data:image/svg') {
				type = "icon";
			}
			// imageData
			else if(start.startsWith("data:image")) { 
				type = "image"; 
			}

			// invalid type
			if(!type) {
				console.warn("Leaflet.Hexagonal","fetchThumb(): invalid source", source);
				return false;
			}


			// thumb it
			this.thumbsInfo.called++;
			var that = this;
			var size = this.options.thumbSize;
			this.thumbs[id] = {loaded:false, size:size,  image:false, type:type} ;
			this.thumbs[id].image = new Image();
			this.thumbs[id].image.onload = function() {

				that.thumbs[id].original = { width:this.width, height:this.height };

				var thumb = document.createElement("CANVAS");
				thumb.width = size;
				thumb.height = size;
				var ctx = thumb.getContext("2d");

				var r = this.width-this.height;
				var ix,iy,iwh;
				if(r>0) {
					ix= r/2;
					iy= 0;
					iwh= this.height;
			  	}
				else {
					ix=0;
					iy = -r/2;
					iwh = this.width;
				}
				

				ctx.drawImage(this, ix,iy,iwh,iwh, 0, 0, size,size);

				if(type=="image" && imageTint) {
					ctx.fillStyle = imageTint;
					ctx.globalAlpha = 0.25;
					ctx.fillRect(0,0,size,size);					
				}

				if(type=="icon" && iconColor) {
					ctx.fillStyle = iconColor;
					ctx.globalCompositeOperation = "source-in";
					ctx.fillRect(0,0,size,size);
				}

				that.thumbs[id].image = thumb;
				that.thumbs[id].size = size;
				that.thumbs[id].loaded = 2;


				// check refresh
				that.thumbsInfo.resolved++;
				var ts = Date.now();
				if(that.thumbsInfo.called == that.thumbsInfo.resolved) {
					that.thumbsInfo.last = ts; 
					that.refresh();
				}
				else if(that.thumbsInfo.last+1000<ts) {
					that.thumbsInfo.last = ts; 
					that.refresh();		
				}

			};
			// onerror: error-image
			this.thumbs[id].image.onerror = function() {
				that.thumbs[id].loaded = 1;
				that.thumbs[id].image = that.thumbs.error.image;
				that.thumbs[id].size = that.thumbs.error.size;

				// check refresh
				that.thumbsInfo.resolved++;
				var ts = Date.now();
				if(that.thumbsInfo.called == that.thumbsInfo.resolved) {
					that.thumbsInfo.last = ts; 
					that.refresh();
				}
				else if(that.thumbsInfo.last+1000<ts) {
					that.thumbsInfo.last = ts; 
					that.refresh();		
				}

			};
			this.thumbs[id].image.src = source;
			return id;


		},
		// #endregion


		// #######################################################
		// #region helpers
		getDistance: function getDistance(latlng0, latlng1) { 
			var latlng0 = this._valLatlng(latlng0);
			if(latlng0.nullIsland) { return 0; }
			var latlng1 = this._valLatlng(latlng1);
			if(latlng1.nullIsland) { return 0; }
			if (latlng0.lat == latlng1.lat && latlng0.lng == latlng1.lng) { return 0; }
			var lat0 = latlng0.lat * 0.017453293;
			var lat1 = latlng1.lat * 0.017453293;
			var dt = (latlng0.lng-latlng1.lng) * 0.017453293;
			var d = Math.sin(lat0) * Math.sin(lat1) + Math.cos(lat0) * Math.cos(lat1) * Math.cos(dt);
			d = Math.min(1,d);
			return Math.round(Math.acos(d) * 6378136.78);
		},
		getHexagon: function getHexagon(latlng) {
			if(typeof latlng != "object") {
				return false;
			}
			if(typeof latlng.lat != "number" || typeof latlng.lng !="number") {
				return false;
			}

			var wh = this._map.getSize();
			var zoom = this._map.getZoom();
			var size = this.calcHexagonSize(zoom);
			var overhang = size*2; 
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			offset = {x:Math.round(offset.x), y: Math.round(offset.y) };
			var p = this._getPixels_from_latlng(latlng, wh.w, wh.h, overhang);
			var h = this.calcHexagonCell(p.x,p.y,size, offset,zoom);

			// hexagonals
			if(this.hexagonals[h.cell]) {
				return this.hexagonals[h.cell];
			}

			return false;
		},
		walkLink: function walkLink(groupArray, startIndex, resArray=[], pairs={}) {
			if(groupArray[startIndex]) {
				resArray.push(startIndex);
				if(groupArray[startIndex].link) {
					for(var i=0;i<groupArray[startIndex].link.length; i++) {
						var p = startIndex + "_" + groupArray[startIndex].link[i]; 
						if(!pairs[p]) {
							pairs[p]=true;
							resArray = this.walkLink(groupArray,groupArray[startIndex].link[i],resArray,pairs);
						}
					}
				}
			}
			return resArray;
		},
		_getPixels_from_mxy: function _getPixels_from_mxy(mxy, w,h, overhang=0, zoom, pixelOrigin, pixelPane) {
			var f = Math.pow(2,zoom)*256;
			var x = Math.round(mxy.x*f - pixelOrigin.x + pixelPane.x);
			var y = Math.round(mxy.y*f - pixelOrigin.y + pixelPane.y);
			if (x < -overhang || y < -overhang || x > w+overhang || y > h+overhang) { return { x: x, y: y, visible: false }; }
			return { x: x, y: y, visible: true };
		},

		_getPixels_from_latlng: function _getPixels_from_latlng(latlng, w, h, overhang=0) {
			var p = this._map.latLngToContainerPoint(latlng); 
			if (p.x < -overhang || p.y < -overhang || p.x > w+overhang || p.y > h+overhang) { return { x: p.x, y: p.y, visible: false }; }
			return { x: p.x, y: p.y, visible: true };
		},
		_getRGBA: function _getRGBA(color) {
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
		_getClickColor: function _getClickColor(clickId) {
			return "#" + (clickId+1048576).toString(16);
		},
		_genUid: function _genUid() {
			return (Date.now()&16777215) + "_" + Math.floor(Math.random() * 1000000); // string = uses 4.6 days worth of ms and 10^6 random
		},
		_genId: function _genId() {
			this._incId++;
			return this._incId;
		},
		_genGroup: function _genGroup() {
			if(this.options.groupDefault!==false) { return this.options.groupDefault; }
			this._incGroup++;
			return this._incGroup;
		},
		_genHash: function _genHash(str) {
			if(typeof str == "number") { str += ""; }
			if(typeof str != "string") { return false; }
			var l = str.length;
			if(l<33) {
				return str.replace(/[\W_]+/g,"_");
			}

			var str0 = str.substring(0,3).replace(/[\W_]+/g,"_");
			var str1 = str.substring(l-3,l).replace(/[\W_]+/g,"_");
			var hl = Math.min(65536,l);
			var h1 = 0xdeadbeef, h2 = 0x41c6ce57d;

			for(var i = 1, ch; i < hl; i++) {
				ch = str.charCodeAt(l-i);
				h1 = Math.imul(h1 ^ ch, 2654435761);
				h2 = Math.imul(h2 ^ ch, 1597334677);
			}
			h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
			h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
			h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
			h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
			return str0 + (4294967296 * (2097151 & h2) + (h1 >>> 0)) + str1;
		},
		
		_valLatlng: function _valLatlng(latlng) {
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
		_getMxy: function _getMxy(latlng) {
			var m = this._map.project(latlng,0);
			return {x:m.x/256, y:m.y/256};
		},
		_valGroup: function _valGroup(meta) {
			var prop = meta.groupProperty || "group";
			var group = meta[prop];
			if(typeof group == "string" && group != "") {  }
			else if(typeof group == "number") { group = group +""; }
			else { group = this.options.groupDefault; }
			if(!this.points[group]) {
				this.points[group] = [];
				this.markers[group] = [];
				this.groupOrder.push(group);
				this.groupVisibility[group] = true;
			}
			return group;	
		},
		_valId: function _valId(meta) {
			var prop = meta.idProperty || "id";
			var id = meta[prop];
			if(typeof id == "string" && id != "") { return id; }
			if(typeof id == "number") { return id+""; }
			return this._genId();
		},
		_valName: function _valName(meta) {
			var prop = meta.nameProperty || "name";
			var name = meta[prop];
			if(typeof name == "string") { return name;  }
			if(typeof name == "number") { return name+""; }
			return "";
		},
		_valMarker: function _valMarker(meta) {
			var prop = meta.markerProperty || "marker";
			var marker = meta[prop];
			if(typeof marker == "string") { return marker;  }
			return false;
		},
		_valLink: function _valLink(meta,group) {
			var prop = meta.linkProperty || "link";
			var link = meta[prop];
			var gl = this.points[group].length;

			// true => predecessor
			if(link === true) { 
				if(!gl) { return []; } // first in group => no link
				return [gl-1]; 
			} 

			// number => index
			if(typeof link == "number") { // index-position in group
				link = Math.floor(link);
				if(link>=0) { 
					return [link];
				}
				return [];
			}

			// array => indices
			if(Array.isArray(link)) { // index-positions in group
				var ls = [];
				for(var i=0; i<link.length; i++) {
					var l = Math.floor(link[i]); 
					if(l>=0) {
						ls.push(l);
					}
				}
				return ls;
			}

			// else => []
			return [];
		},
		_valData: function _valData(meta) {
			var mks = Object.keys(meta);
			var data = {};
			for(var i=0; i<mks.length; i++) {
				if(!isNaN(meta[mks[i]])) {
					data[mks[i]] = meta[mks[i]]*1;
				}
			}
			return data;
		},
		_valTags: function _valTags(meta) {
			var prop = meta.tagProperty || "tags";
			var tags = meta[prop] + "";
			if(tags=="undefined" || tags=="false") { tags = ""; }
			return tags;
		},
		_valDist: function _valDist(meta, latlng, group, links) {
			var dist = 0;
			for(var i=0; i<links.length; i++) {
				var p0 = this.points[group][links[i]];
				if(p0) {
					var d = p0.dist + this.getDistance(p0.latlng, latlng);
					if(d>dist) { 
						dist = d; 
					}
				}
			}
			return dist;
		},
		_valTimeSpan: function _valTimeSpan(meta,group) {
			var prop = meta.timeProperty || "time";
			var time = meta[prop];
			var span = 0;
			if(typeof time == "number" || !isNaN(time*1)) { 
				time *= 1;
			}
			else if(typeof time == "string") {  
				try {
					time = Date.parse(time);
				} 
				catch(err) {
					time = 0;
				}
			}
			else {
				time = 0;
			}
			if(this.points[group][0]){
				span = Math.max(0, time-this.points[group][0].time);
			}
			return { time:time, span:span };
		},
		_checkDisplay: function _checkDisplay(val,zoom=0) {
			if(typeof val == "boolean") {
				return val;
			}
			if(typeof val.minZoom == "number") {
				if(typeof val.maxZoom == "number") {
					return (zoom>=val.minZoom && zoom<=val.maxZoom); 
				}
				return zoom>=val.minZoom;
			}
			if(typeof val.maxZoom == "number") {
				return zoom<=val.maxZoom;
			}
			return true;
		}
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
