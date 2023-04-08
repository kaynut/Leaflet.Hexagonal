// todo:
// DONE: selection rework
// DONE: add: selectionMode > single hexagon, group > selectionMode: "group" || "id"
// DONE: update marker-clickablility
// DONE: options.thingVisible >> options.thingDisplay >> this.display.thing && _checkDisplay 
// DONE: check again if links are colored the right way in clustering
// DONE: link:0 does not work , check === true
// rework setInfo, buildInfo

// updates
// SKIP: special treatment for linkMode=curve clickability?
// SKIP: put part of hexagonalize in webworker?
// SKIP: clusterMode: clusterIndicator (if single or clustered)

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
			// hexagonOrientation: "flatTop" || "pointyTop",
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
			//markerOpacity: number (0-1)
			markerOpacity: 0.9,


			// linkDisplay: boolean || {minZoom,maxZoom}
			linkDisplay: true,	
			// linkWidth: pixels
			linkWidth: 2,
			// linkFill: false || true || "#color"
			linkFill: true,			
			// linkMode: "spline" || "line" || "aligned" || "hexagonal" || false
			linkMode: "spline",
			// linkJoin: number (0=gap between cell and line / 0.5= cell and line touch / 1=cellcenter and line fully joined)
			linkJoin: 1,  


			//  gutterDisplay: boolean || {minZoom,maxZoom}
			gutterDisplay: false,
			// gutterFill: false || "#color"
			gutterFill: false, //"#101214",
			// gutterStroke: false || "#color"
			gutterStroke: "#202224",


			// selectionDisplay: boolean || {minZoom,maxZoom}
			selectionDisplay: true,
			// selectionMode: "group" || "id"
			selectionMode: "group",
			// selectionFillColor: "color" || false
			selectionFillColor: "rgba(0,0,0,0)", //"rgba(255,255,255,0.2)", 	
			// selectionStrokeColor: "color" || false
			selectionStrokeColor: "rgba(255,255,255,0.3)", 	 	
			// selectionBorderWidth: pixels
			selectionBorderWidth: 5,	
			

			// infoDisplay: boolean || {minZoom,maxZoom}
			infoDisplay: true,
			// infoOpacity: true || false
			infoOpacity: 0.9,
			// infoClassName: class || ""
			infoClassName: "leaflet-hexagonal-info-container"

		},
		// #endregion



		// #######################################################
		// #region props
		
		_incId: 0,
		_incGroup: 0,

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

		markerLayer: false,

		selection: {
			selected:false,
			selector:false,
			highlighted: false
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

		icons: {
			fallback: { svg:'<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"/></svg>', size:{width:24, height:24}, scale:1 }
		},

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
			this.markerLayer = L.layerGroup([]).addTo(this._map);
			this.markerLayer.markerLayer = true;
			this.markerLayer.needsUpdate = true;
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
				if(!this._map.hasLayer(this.markerLayer)) {
					this._map.addLayer(this.markerLayer);
				}
				if(!this._map.hasLayer(this.infoLayer)) {
					this._map.addLayer(this.infoLayer);
				}
				this.show();
			}
			else if(this._map.hasLayer(this.markerLayer) || this._map.hasLayer(this.infoLayer)) {
				this._map.removeLayer(this.markerLayer);
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
		addPoint: function addPoint(latlng, meta) { //  {lng,lat} , {id, group, link, data, marker}
			
			// latlng
			latlng = this._valLatLng(latlng);
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

			// point 
			var point = {
				latlng: latlng,	
				mxy: mxy,
				cell: false,	
				
				id: id,
				group: group,
				name: name,					
				tags: tags,
			
				data: data,

				marker: meta.marker || false,
				link:link,

				pointless: (meta.pointless || false),	

				style: {
					fill: meta.fill || false,
					stroke: meta.stroke || false,
					borderWidth: meta.borderWidth || false,
					linkWidth: meta.linkWidth || false,
					image: meta.image || false,
					icon: meta.icon || false,
					size: meta.size || false
				}
			};

			// add points
			this.points[group].push(point);

			// add to marker
			if(point.marker) {
				this.markers[group].push(point);
			}	

			// refresh
			this.refresh();

			// return add-count
			return 1; 

		},
		// addLine: add array of latlngs (all with same metadata), all in the same group and all linked by default
		addLine: function addLine(latlngs, meta) {  // [ latlng0, latlng1, ... ] , {group,data, marker} 
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
					var ref = this;
					fetch(g)
						.then((resp) => resp.json())
						.then((json) => {
							ref.addGeojson(json,meta);
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
				if(m.image || m.icon) {
					m.marker=true;
					this.addMarker({lng:g.coordinates[0],lat:g.coordinates[1]}, m);
				}
				else {
					this.addPoint({lng:g.coordinates[0],lat:g.coordinates[1]}, m);
				}
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
			latlng = this._valLatLng(latlng);

			// meta
			meta = meta || {};
			if(typeof meta.marker == "undefined") {	meta.marker = true; }
			if(typeof meta.pointless == "undefined") { meta.pointless = true; }
			meta.scale = meta.scale || 1;

			// no marker
			if(!meta.marker) {
				return 0;
			}

			// meta.image
			if(meta.image) {
				this.addPoint(latlng, meta);
				return 1;
			}

			// meta.icon
			if(meta.icon) {

				// meta.icon pointing to cache directly
				if(this.icons[meta.icon]) {
					this.addPoint(latlng, meta);
					return 1;
				}

				// meta.icon pointing to cache via hash
				var hash = this._genHash(meta.icon); 
				if(this.icons[hash]) {
					meta.icon = hash;
					this.addPoint(latlng, meta);
					return 1;						
				}

				// meta.icon pointing to new icon
				var ref = this;
				this.icons[hash] = { svg: this.icons.fallback.svg, size: { width: this.icons.fallback.size.width, height: this.icons.fallback.size.height}, scale:1 };
				this.cacheIcon(hash, meta.icon, meta.scale).then(function(res) {
					if(!res) { 
						meta.icon = "fallback"; 
					}
					else { 
						meta.icon = res; 
					}
					ref.addPoint(latlng, meta);
					return 1;
				});
			}

			// meta.fallback
			meta.icon = "fallback";
			this.addPoint(latlng, meta);
			return 1;
	
		},
		// addIcon
		addIcon: async function addIcon(latlng, meta) {
			meta = meta || {};
			meta.marker = true;
			if(!meta.icon) { 
				meta.icon = "fallback"; 
			}
			return this.addMarker(latlng, meta);
		},
		// addImage
		addImage: async function addImage(latlng, meta) {
			meta = meta || {};
			meta.marker = true;
			if(!meta.image) {
				meta.icon = "fallback";
			}
			return this.addMarker(latlng, meta);
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
			this.display.selection = this._checkDisplay(this.options.selectionDisplay,zoom);
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
					var p = this.getPixels_from_mxy(point.mxy, w,h, hexagonOverhang, zoom, pixelOrigin, pixelPane);
					point.visible = p.visible;
					point.position = [p.x,p.y];
					point.filter = this.checkFilter(point);

					// skip filtered
					if(!point.filter) {
						continue;
					}

					// skip invisible+unlinked
					if(!point.visible) {
						if(!this.display.links || !point.link.length) {
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

						this.hexagonals[h.cell].pointless = false;

						this.hexagonals[h.cell].visible = p.visible;

					}

					// first point in hex
					if(!this.hexagonals[h.cell].point) {
						this.hexagonals[h.cell].cluster.min = d;
						this.hexagonals[h.cell].cluster.max = d;
					}

					// new point in hex
					this.hexagonals[h.cell].point = [group,i];
					this.hexagonals[h.cell].points.push([group, i]);
					
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
					this.hexagonals[h.cell].pointless = point.pointless || this.hexagonals[h.cell].pointless;

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
						var m = this.getPixels_from_mxy(marker.mxy, w,h, hexagonOverhang, zoom, pixelOrigin, pixelPane);
						marker.visible = m.visible;
						marker.position = [m.x,m.y];
						marker.filter = this.checkFilter(marker);

						// skip filtered
						if(!marker.filter) {
							continue;
						}

						// hexagon-cell
						var h = this.calcHexagonCell(m.x,m.y,hexagonSize, hexagonOffset, zoom);
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
							
							this.hexagonals[h.cell].pointless = false;

							this.hexagonals[h.cell].visible = m.visible;

						}

						// new marker in hex
						this.hexagonals[h.cell].marker = [group,i];
						this.hexagonals[h.cell].markers.push([group, i]);

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
										var style = p1.style || p0.style || false;
										this.links.push({group: p0.group, start:p0, end:p1, path:path, style:style});
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
		calcHexagonCell: function calcHexagonCell(x,y, size, offset, zoom) { // hexagon top-flat
			if(this.options.hexagonOrientation == "pointyTop") {
				return this.calcHexagonCell_pointyTop(x,y, size, offset, zoom);
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

			var path = "M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z";

			return { cell:cell, cellX:cellX, cellY:cellY, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:pointyTop };
		},
		calcHexagonCell_pointyTop: function calcHexagonCell_pointyTop(x,y, size, offset, zoom) { // hexagon top-pointy
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

			var path = "M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z";

			return { cell:cell, cellX:cellX, cellY:cellY, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:true };
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
						cells.push("M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z");				
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
						cells.push("M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z");
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

						this.hexagonals[h.cell].pointless = false;

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
			return this.getDistance(ll0.lng,ll0.lat,ll1.lng,ll1.lat);
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

			// layers
			if(majorChange) {
				this.markerLayer.clearLayers();
				this.markerLayer.needsUpdate = true;
			}

			// style
			var style = { 
				fill: this.options.fillDefault, 
				stroke: this.options.strokeDefault, 
				borderWidth: this.options.borderWidth || 1,
				linkWidth: this.options.linkWidth || 1
			};

			// selection
			var selGroups = false;
			if(this.display.selection && this.options.selectionMode=="group" && selection.selected.groups) {
				selGroups = selection.selected.groups;
			}
			var selIds = false;
			if(this.display.selection && this.options.selectionMode=="id" && selection.selected.ids) {
				selIds = selection.selected.ids;
			}


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


			// draw gutter
			if(this.display.gutter) {
				this.drawGutter(ctx);
			}
			

			// draw links
			if(links.length && this.display.links) {
				for(var i=0; i<links.length; i++) {

					var cluster = false;
					var link = links[i].start;
					var cluster = link.cell.cluster;

					// style
					style.fill = link?.style?.fill || this.groupFill[link.group] || this.options.fillDefault;

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
					

					// draw link
					tLinksDrawn += this.drawLink(ctx, links[i], style);

					// draw link selected
					if(selGroups) {
						if(selGroups[links[i].group]) {
							this.drawLinkSelected(ctx, links[i]);
							selection.highlighted.push(links[i]);
						}
					}

				}

			}


			// draw points and marker
			var hexs = Object.keys(hexagonals); 
			if(hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					// style hexagonals
					style.fill = hexagonals[hexs[h]].style.fill || this.groupFill[hexagonals[hexs[h]].group] || this.options.fillDefault;
					if(this.options.clusterMode) {
						if(this.options.clusterMode=="population") {
							style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.population, 1, tPopulation);
						}
						else if(this.options.clusterMode=="sum") {
							style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.sum,  tMin, tMax);
						}
						else if(this.options.clusterMode=="avg") {
							style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.avg,  tMin, tMax);
						}
						else if(this.options.clusterMode=="min") {
							style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.min,  tMin, tMax);
						}
						else if(this.options.clusterMode=="max") {
							style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.max,  tMin, tMax);
						}
					}


					// draw hexagonals
					if(this.display.hexagons && hexagonals[hexs[h]].point) {	
						if(hexagonals[hexs[h]].pointless==false) {
							tHexagonsDrawn += this.drawHexagon(ctx, hexagonals[hexs[h]], style);
						}

						// draw hexagon selected
						if(selGroups) {
							var gs = Object.keys(selGroups);
							for(var g=0; g<gs.length; g++) {
								if(hexagonals[hexs[h]].groups[gs[g]]) {
									this.drawHexagonSelected(ctx, hexagonals[hexs[h]]);
									selection.highlighted.push(hexagonals[hexs[h]]);
								}
							}
						}
						else if(selIds) {
							var gs = Object.keys(selIds);
							for(var g=0; g<gs.length; g++) {
								if(hexagonals[hexs[h]].ids[gs[g]]) {
									this.drawHexagonSelected(ctx, hexagonals[hexs[h]]);
									selection.highlighted.push(hexagonals[hexs[h]]);
								}
							}
						}
					}


					// draw marker
					if(this.display.markers) {
						if(majorChange || this.markerLayer.needsUpdate) {
							tMarkersDrawn += this.drawMarker(hexagonals[hexs[h]], style);
						}
					}
				}
			}

			// reset this.markerLayer.needsUpdate
			if(this.display.markers) {
				this.markerLayer.needsUpdate = false;
			}

			// totals
			this.totals.hexagonsDrawn = tHexagonsDrawn;
			this.totals.markersDrawn = tMarkersDrawn;
			this.totals.linksDrawn = tLinksDrawn;

			// afterDraw
			this.afterDraw();

		},
		afterDraw: function afterDraw() {

		},
		drawHexagon: function drawHexagon(ctx, hexagon, style) {
			if(!hexagon.visible) { return 0; }
			var hPath = new Path2D(hexagon.path);
			if(style.fill) {
				ctx.fillStyle = style.fill;
				ctx.fill(hPath);
			}
			if(style.stroke) {
				ctx.strokeStyle = style.stroke;
				ctx.lineWidth = style.borderWidth;
				ctx.stroke(hPath);
			}
			return 1;
		},
		drawMarker: function drawMarker(hexagon, styleHexagon={}) {
			var mi = hexagon.marker; 
			if(!mi) { return 0; }

			var m0 = this.markers[mi[0]][mi[1]];
			var style = m0.style;
			var ref = this;
			if(typeof style != "object") { return 0; }


			// style
			var size = style.size || hexagon.size; 
			var fill = style.fill || styleHexagon.fill || this.options.fillDefault;

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


			// drawIcon
			if(typeof style.icon == "string" && this.icons[style.icon]) {
				var micon = this.icons[style.icon]; 
				var mw = micon.size.width || 1;
				var mh = micon.size.height || 1;
				var s = micon.scale;
				var ms = (w*s)/(mw*2);
				var ox = (w - mw*ms) / 2; 
				var oy = (h - mh*ms) / 2;

				var svg = `<g transform="matrix(${ms},0,0,${ms},${ox},${oy})" opacity="0.75">${micon.svg}</g>`;

				var icon = L.divIcon({
					className: 'leaflet-hexagonal-marker',
					html: `<svg width="${w}" height="${h}" opacity="${this.options.markerOpacity}" >
						<symbol id="hexa${m0.id}"><polygon points="${poly}"></polygon></symbol>
						<mask id="mask${m0.id}"><use href="#hexa${m0.id}" fill="#fff" stroke="#000" stroke-width="${this.options.borderWidth}" /></mask>
						<use href="#hexa${m0.id}" fill="${fill}" stroke="${this.options.strokeDefault}" stroke-width="${this.options.borderWidth}" shape-rendering="geometricPrecision" />
						${svg}
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 
				var lm = L.marker(hexagon.latlng, {icon: icon, opacity:this.options.markerOpacity}).addTo(this.markerLayer);
				L.DomEvent.on(lm, 'click', function(e) { 
					L.DomEvent.stopPropagation;
					ref._onClick(e, {marker:m0});
				});
				return 1; 
			}	
			

			// image
			if(typeof style.image == "string") {

				// onload: add image-marker
				var ii = new Image();
				ii.onload = function() {
					var icon = L.divIcon({
						className: 'leaflet-hexagonal-marker',
						html: `<svg width="${w}" height="${h}" opacity="${ref.options.markerOpacity}" >
							<symbol id="hexa${m0.id}"><polygon points="${poly}"></polygon></symbol>
							<mask id="mask${m0.id}"><use href="#hexa${m0.id}" fill="#fff" stroke="#000" stroke-width="${ref.options.borderWidth+1}" /></mask>
							<use href="#hexa${m0.id}" fill="${ref.options.strokeDefault}" shape-rendering="geometricPrecision" />
							<image preserveAspectRatio="xMidYMid slice" href="${style.image}" mask="url(#mask${m0.id})" width="${w}" height="${h}" ></image>
							</svg>`,
						className: "",
						iconSize: [w,h],
						iconAnchor: [w/2,h/2],
					}); 
					var lm = L.marker(hexagon.latlng, {icon: icon, opacity:ref.options.markerOpacity}).addTo(ref.markerLayer); 
					L.DomEvent.on(lm, 'click', function(e) { 
						L.DomEvent.stopPropagation;
						ref._onClick(e, {marker:m0});
					});
				};

				// onerror: replace with error-icon-marker
				ii.onerror = function() {
					console.warn("Leaflet.hexagonal.drawMarker: image-url invalid", style.image);

					// fallback
					style.icon = "fallback";
					ref.drawMarker(hexagon,styleHexagon);
					
				};
				ii.src = style.image;
				return 1;
			}



			console.warn("Leaflet.hexagonal.drawMarker: parameters invalid");

		},
		drawHexagonSelected: function drawHexagonSelected(ctx, hexagon) {
			var hPath = new Path2D(hexagon.path);

			if(this.options.selectionFillColor) {
				ctx.fillStyle = this.options.selectionFillColor;
				ctx.fill(hPath);
			}
			if(this.options.selectionStrokeColor) {
				ctx.strokeStyle = this.options.selectionStrokeColor;
				ctx.lineWidth = this.options.selectionBorderWidth;
				ctx.stroke(hPath);
			}
		},
		drawLink: function drawLink(ctx, link, style) {
			var path = new Path2D(link.path);
			if(this.options.strokeDefault) {
				ctx.lineJoin = "round";
				ctx.strokeStyle = style.stroke;
				ctx.lineWidth = style.linkWidth + style.borderWidth*2;
				ctx.stroke(path);
			}

			if(!this.options.linkFill) { return 1; }
			
			if(this.options.linkFill===true) {
				ctx.strokeStyle = style.fill;
			}
			else {
				ctx.strokeStyle = this.options.linkFill;
			}
			ctx.lineWidth = style.linkWidth;
			ctx.stroke(path);

			return 1;
			
		},
		drawLinkSelected: function drawLinkSelected(ctx, link) {
			var path = new Path2D(link.path);
			if(this.options.strokeDefault && this.options.selectionStrokeColor) {
				ctx.lineJoin = "round";
				ctx.strokeStyle = this.options.selectionStrokeColor;
				ctx.lineWidth = this.options.linkWidth + this.options.borderWidth*2;
				ctx.stroke(path);
			}
			ctx.strokeStyle = this.options.selectionFillColor;
			ctx.lineWidth = this.options.linkWidth;
			ctx.stroke(path);
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
					colorArray[i] = this.getRGBA(colorArray[i]);
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
		// #region events
		// click
		_onClick: function _onClick(e, target={layer:true}) {
			var selection = this.setSelection(e.latlng);
			if(selection.selected) {
				this.setInfo(selection);
			}
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
				
				var selection = self.selectByLatlng(e.latlng);
				self.onMouseRest(e, selection, {layer:true});

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
		// #region group/info
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


		setInfo: function setInfo(info) {

			if(this.info) {
				this.infoLayer.clearLayers();
				this.info = false;
			} 
console.log(info);
			if(!info || !this.display.info) {
				return;
			}
return; // todo
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

			this.info = L.marker(info.latlng, {icon: divicon, zIndexOffset:1000, opacity:this.options.infoOpacity }).addTo(this.infoLayer);
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
		// #region selection
		setSelection: function setSelection(selector) {
			var selection = { 
				selected: false,
				selector:false,
				highlighted: []
			};

			// clear
			if(typeof selector != "object") {
				if(this.selection.selected) {
					this.selection = selection;
					this.refresh();
				}
				return selection; 
			}

			// latlng
			if(Array.isArray(selector)) {
				if(typeof selector[0] == "number" && typeof selector[1] == "number") {
					var latlng = { lat:selector[1], lng:selector[0] }; 
					selector = { latlng: latlng };
				}
			}
			else if(typeof selector.lat == "number" && typeof selector.lng == "number") {
				selector.latlng = { lat:selector.lat, lng:selector.lng }; 
			}
			else if(typeof selector.lat == "number" && typeof selector.lon == "number") {
				selector.latlng = { lat:selector.lat, lng:selector.lon }; 
			}
			if(selector.latlng) {
				var sel = this.selectByLatlng(selector.latlng);
				if(sel) {
					//this.options.selectionMode = "group";
				}
				selection.selected = JSON.parse(JSON.stringify(sel));
				selection.selector = { mode:"latlng", value:selector.latlng };
				selection.highlighted = [];
			}

			// group/groups
			if(selector.group || selector.groups) {
				if(!selector.groups) { selector.groups = selector.group; }
				var sel = this.selectByGroups(selector.groups);
				if(sel) {
					this.options.selectionMode = "group";
					selection.selected = sel; 
					selection.selector = { mode:"group", value:sel.groups };
					selection.highlighted = [];
				}
			}

			// id
			if(selector.id || selector.ids) {
				if(!selector.ids) { selector.ids = selector.id; }
				var sel = this.selectByIds(selector.id);
				if(sel) {
					this.options.selectionMode = "id";
					selection.selected = sel; 
					selection.selector = { mode:"id", value:sel.ids };
					selection.highlighted = [];
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
				return this.selection;
			}

			var wh = this._map.getSize();
			var zoom = this._map.getZoom();
			var size = this.calcHexagonSize(zoom);
			var overhang = size*2; 
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			offset = {x:Math.round(offset.x), y: Math.round(offset.y) };
			var p = this.getPixels_from_latlng(latlng, wh.w, wh.h, overhang);
			var h = this.calcHexagonCell(p.x,p.y,size, offset,zoom);

			// hexagonals
			if(this.hexagonals[h.cell]) {
				return this.hexagonals[h.cell];
			}

			return false;

		},
		selectByGroups: function selectByGroups(groups) {
			var sel = false;

			if(typeof groups == "string" || typeof groups == "number") {
				groups = [groups];
			}
			if(!Array.isArray(groups)) {
				return sel;
			}

			for(var i=0; i<groups.length;i++) {
				if(typeof groups[i] == "number") {
					groups[i] += "";
				}
				if(typeof groups[i] == "string") {
					if(!sel) { 
						sel = { groups: {} };
					}
					sel.groups[groups[i]] = true;
				}
			}

			return sel;

		},
		selectByIds: function selectByIds(ids) {
			var sel = false;

			if(typeof ids == "string" || typeof ids == "number") {
				ids = [ids];
			}
			if(!Array.isArray(ids)) {
				return sel;
			}

			for(var i=0; i<ids.length;i++) {
				if(typeof ids[i] == "number") {
					ids[i] += "";
				}
				if(typeof ids[i] == "string") {
					if(!sel) { 
						sel = { ids: {} };
					}
					sel.ids[ids[i]] = true;
				}
			}

			return sel;
		},
		selectByName: function selectByName(name) {
			return {name:name};
		},


		// #endregion



		// #######################################################
		// #region helpers
		cacheIcon: function cacheIcon(iconName, svg, scale=1) {
			var ref = this;
			return new Promise((resolve) => {
				if(typeof iconName != "string" || typeof svg != "string") {
					console.warn("Leaflet.hexagonal.addIcon: parameter 'iconName' and 'svg' have to be strings");
					resolve(0);
				}

				if(this.icons[iconName]) {
					resolve(iconName);
				}
				if(this.icons[svg]) {
					resolve(svg);
				}
				var hash = this._genHash(svg);
				if(this.icons[hash]) {
					resolve(hash);
				}

				// svg is url
				if(svg.endsWith(".svg")) {
					fetch(svg)
					.then((resp) => resp.text())
					.then((svg_string) => {

						var size = {width:0, height:0};
						var p = new DOMParser();
						var d = p.parseFromString(svg_string,"text/xml");
						var e = d.getElementsByTagName("svg");
						if(!e.length) {
							resolve("fallback");
						}
						else {
							size.width = e[0].getAttribute('width') || 0;
							size.height = e[0].getAttribute('height') || 0;
					
							if(!size.width || !size.height) {
								console.warn("Leaflet.hexagonal.cacheIcon: svg lacks width and/or height - falls back on default (24,24)");
								size.width = 24;
								size.height = 24;
							} 

							ref.icons[iconName] = {svg:svg_string, size:size, scale:scale};
							resolve(iconName);
						}

					});
				}
				
				// svg is svg_string
				else if(svg.indexOf("<svg")===0) {
					var size = {width:0, height:0};
					var p = new DOMParser();
					var d = p.parseFromString(svg,"text/xml");
					var e = d.getElementsByTagName("svg");
					if(!e.length) {
						resolve("fallback");
					}
					else {
						size.width = d.getElementsByTagName("svg")[0].getAttribute('width') || 0;
						size.height = d.getElementsByTagName("svg")[0].getAttribute('height') || 0;
				
						if(!size.width || !size.height) {
							console.warn("Leaflet.hexagonal.cacheIcon: svg lacks width and/or height - falls back on default (24,24)");
							size.width = 24;
							size.height = 24;
						} 

						ref.icons[iconName] = {svg:svg, size:size, scale:scale};
						resolve(iconName);
					}
				}

				// svg not valid
				else {
					//console.warn('Leaflet.hexagonal.addSvg: parameter must be an url, a svg-string or the name of a already cached icon', svg);
					resolve(false);
				}

			});
		},


		getPixels_from_mxy: function getPixels_from_mxy(mxy, w,h, overhang=0, zoom, pixelOrigin, pixelPane) {
			var f = Math.pow(2,zoom)*256;
			var x = Math.round(mxy.x*f - pixelOrigin.x + pixelPane.x);
			var y = Math.round(mxy.y*f - pixelOrigin.y + pixelPane.y);
			if (x < -overhang || y < -overhang || x > w+overhang || y > h+overhang) { return { x: x, y: y, visible: false }; }
			return { x: x, y: y, visible: true };
		},

		getPixels_from_latlng: function getPixels_from_latlng(latlng, w, h, overhang=0) {
			var p = this._map.latLngToContainerPoint(latlng); 
			if (p.x < -overhang || p.y < -overhang || p.x > w+overhang || p.y > h+overhang) { return { x: p.x, y: p.y, visible: false }; }
			return { x: p.x, y: p.y, visible: true };
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
		getRGBA: function getRGBA(color) {
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
			if(this.options.groupDefault!==false) { return this.options.groupDefault; }
			this._incGroup++;
			return this._incGroup;
		},
		_genHash: function _genHash(str) {
			str = str.replace(/[\W_]+/g,"_");
			if(str.length>64) {
				str = str.substring(0,10) + str.substring(str.length-54, str.length);
			}
			return str;
		},
		_valLatLng: function _valLatLng(latlng) {
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
