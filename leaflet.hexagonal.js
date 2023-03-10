// todo:
// add: selectionMode > single hexagon, group
// clusterMode: clusterIndicator (if single or clustered)
// update marker-clickablility

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



			// hexagonVisible: boolean 
			// > whether or not hexagons will be visible
			hexagonVisible: true,

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

			// fillColor: "color" || false
			fillColor: "#fd1",
			// strokeColor: "color" || false
			strokeColor: "#303234", 	
			// borderWidth: pixels
			borderWidth: 1,
			//dataProperties: "meta.propertyName" 
			dataProperties: [], // properties for data-based coloring (included in meta)
			// idProperty: false || "meta.propertyName" 
			idProperty: "id",
			// groupProperty: false || "meta.propertyName" 
			groupProperty: "group",
			// groupDefault: false || "groupName"
			// if set, points with no group, will default to this. if not set, ungrouped points will be put in an indiviual group
			groupDefault: false,

			// clusterMode: "count" || "sum" || "avg" || "min" || "max" || "first" || "last" || false (style for hexagon-cluster: depending on point data) 	
			clusterMode: false,
			//clusterProperty: "meta.propertyName" 
			clusterProperty: "data", // current property for data-based coloring (included in meta)
			//clusterDefaultValue: number 
			clusterDefaultValue: 0, // default value, when current clusterProperty is not set for datapoint
			// clusterMin: false || number
			clusterMin: false,
			// clusterMax: false || number
			clusterMax: false,
			// clusterScale: false="linear" || "square" || "log"
			clusterScale: "log",
			// clusterColors: [ "#color", "rgba(r,g,b)", [r,g,b,a],...] 
			clusterColors: ["#4d4","#dd4","#d44","#800"],


			// markerVisible: boolean
			markerVisible: true,
			//markerOpacity: number (0-1)
			markerOpacity: 0.9,


			// linkVisible: boolean
			linkVisible: true,	
			// linkWidth: pixels
			linkWidth: 2,
			// linkFill: false || true || "#color"
			linkFill: true,			
			// linkMode: "spline" || "line" || "aligned" || "hexagonal" || false
			linkMode: "spline",
			// linkReach: meters (longest distance to be linked. controls how large of an area will be evaluated - for performance issues)
			linkReach: 50000,
			// linkJoin: number (0=gap between cell and line / 0.5= cell and line touch / 1=cellcenter and line fully joined)
			linkJoin: 1,  


			// gutterFill: false || "#color"
			gutterFill: false, //"#101214",
			// gutterStroke: false || "#color"
			gutterStroke: false, //"#202224",


			// selectionVisible: true || false
			selectionVisible: true,
			// selectionFillColor: "color" || false
			selectionFillColor: "rgba(255,255,255,0.2)", 	
			// selectionStrokeColor: "color" || false
			selectionStrokeColor: "rgba(255,255,255,0.2)", 	 	
			// selectionBorderWidth: pixels
			selectionBorderWidth: 2,	
			

			// infoVisible: true || false
			infoVisible: true,
			// infoOpacity: true || false
			infoOpacity: 0.9,
			// infoProperty: "propertyName" || false
			infoProperty: "info",
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

		points: [],
		totals:{
			count:0,
			sum:0,
			avg:0,
			min: false,
			max: false,
			delta: 0
		},
		links: [],

		markers:[],
		markerLayer: false,

		selection: {},

		groupInfo: {},
		groupStyle: {},

		info: false,
		infoLayer: false,

		clusterRamp: false,
		clusterRampHash: false,

		gutter: false,

		images: { 
			fallback: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TRS0VBzuIOGSoTlZERRy1CkWoEGqFVh1MLv2CJg1Jiouj4Fpw8GOx6uDirKuDqyAIfoC4ujgpukiJ/0sKLWI8OO7Hu3uPu3eAUC8zzeoYBzTdNlOJuJjJropdrwiiByGMQZSZZcxJUhK+4+seAb7exXiW/7k/R6+asxgQEIlnmWHaxBvE05u2wXmfOMKKskp8Tjxq0gWJH7muePzGueCywDMjZjo1TxwhFgttrLQxK5oa8RRxVNV0yhcyHquctzhr5Spr3pO/MJzTV5a5TnMICSxiCRJEKKiihDJsxGjVSbGQov24j3/Q9UvkUshVAiPHAirQILt+8D/43a2Vn5zwksJxoPPFcT6Gga5doFFznO9jx2mcAMFn4Epv+St1YOaT9FpLix4BfdvAxXVLU/aAyx1g4MmQTdmVgjSFfB54P6NvygL9t0BozeutuY/TByBNXSVvgINDYKRA2es+7+5u7+3fM83+fgBrWnKkrQ9hpQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAJhJREFUaN7t1rENhDAQRNHRVbCluP8EdwAd+RIHDg68BJzG4r+IwEgzgJaVAAAAAODliqRNUiTORj9bnApUSU3SPikR/Uzr99gIScekxBj+SL4tmxL24a9KLBP+rMRS4X+VeDT858ES7eR6iac/fjaz6WQdPpIj1jb8nf+EbfglStTktBlLWK0SpQfKLnPVbZkDAAAAgL/7Aqb3P9fcxRkbAAAAAElFTkSuQmCC"
		},
		icons: {
			fallback: { svg:'<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24"><path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z"/></svg>', size:{width:24, height:24}, scale:1 }
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
			var t = this.options.padding; 
			var i = this._map.getSize();
			var o = this._map.containerPointToLayerPoint(i.multiplyBy(-t));
			this._padding = i.multiplyBy(t);
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
				if (this.options.visible = !0, this._isZoomVisible()) {
					return this._map.on(this.getEvents(), this),
					this.getContainer().style.display = "", 
					this._update(), 
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
		addPoint: function addPoint(latlng, meta) { //  {lng,lat} , {id, group, linked, data, marker}
			latlng = this.validateLatLng(latlng);
			meta = meta || {};

			// group
			var group = false;
			if(this.options.groupProperty) {
				group = meta[this.options.groupProperty];
			}
			group = group || this._genGroup(); 


			// id
			var id = false;
			if(this.options.idProperty) {
				id = meta[this.options.idProperty];
			}
			id = id || this._genId(); 

			
			// link
			var link = -1;
			if(meta.linked) { link = this.getLinkIndex(group); } 


			// pointless
			var pointless = meta.pointless || false;


			// info
			var info = "";
			if(this.options.infoProperty) {
				info = meta[this.options.infoProperty] || "";
			}


			// data
			var data = this.getMetaData(meta);


			// point
			var point = {
				group: group,
				id: id,
				link: link,
				pointless: pointless,
				cell: false,
				latlng: latlng,

				meta: { 
					count: 1,
					data: data,
					info: info
				},

				style: {
					fill: meta.fill || false,
					stroke: meta.stroke || false,
					lineWidth: meta.lineWidth || false,
					linkWidth: meta.linkWidth || false,
					image: meta.image || false,
					icon: meta.icon || false,
					size: meta.size || false
				},

				marker: meta.marker || false
			};


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
		addLine: function addLine(points, meta) {  // [ latlng0, latlng1, ... ] , {group,data, marker} 
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
			var m = Object.assign({}, meta);

			// group
			m.group = m.group || this._genGroup();

			// linked
			m.linked = m.linked || false; 

			// loop points
			var c = 0;
			for(var i=0; i<points.length; i++) {
				c += this.addPoint(points[i], m);
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
				g.properties = g.properties || {};
				var m = Object.assign({},g.properties, meta);
				if(m.image || m.icon) {
					m.marker=true;
					this.addMarker({lng:g.coordinates[0],lat:g.coordinates[1]}, m);
				}
				else {
					this.addPoint({lng:g.coordinates[0],lat:g.coordinates[1]}, m);
				}
				return 1;
			}
			if(g.type == "LineString") {
				var c = g.coordinates.length;
				if(!c) { return 0; }

				g.properties = g.properties || {};
				var m = Object.assign({},g.properties, meta);

				if(!m.group) { m.group = this._genGroup(); }
				if(m.linked!==false) { m.linked = true; }
				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, m);
				}
				return c;
			}
			if(g.type == "Feature") {
				g.properties = g.properties || {};
				var m = Object.assign({},g.properties, meta);

				if(m.image || m.icon) {
					m.marker = true;
				}
				return this.addGeojson(g.geometry, m);
			}
			if(g.type == "FeatureCollection") {
				var c = 0;
				for(var i=0; i<g.features.length; i++) {

					var f = g.features[i];
					f.properties = f.properties || {};
					var m = Object.assign({},f.properties, meta);

					if(m.image || m.icon) {
						m.marker = true;
					}
					else {
						m.marker = false;
					}
					c+= this.addGeojson(f.geometry, m);
				}
				return c;
			}

			console.warn("Leaflet.hexagonal.addGeojson: no valid data in geojson");
			return 0;

		},
		// addMarker
		addMarker: async function addMarker(latlng, meta) {
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addMarker: latlng not valid", latlng);
			}

			// meta
			meta = meta || {};

			// group
			if(!meta.group) {
				meta.group = this._genGroup();
			}

			if(typeof meta.marker == "undefined") {
				meta.marker = true;
			}

			if(typeof meta.pointless == "undefined") {
				meta.pointless = true;
			}

			meta.scale = meta.scale || 1;

			if(meta.marker) {
				// image
				if(meta.image) {
					this.addPoint(latlng, meta);
					return 1;
				}
				// icon
				if(meta.icon) {
					// points to cache directly
					if(this.icons[meta.icon]) {
						this.addPoint(latlng, meta);
						return 1;
					}

					// points to cache via hash
					var hash = this._genHash(meta.icon); 
					if(this.icons[hash]) {
						meta.icon = hash;
						this.addPoint(latlng, meta);
						return 1;						
					}
					// new icon
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

				else {
					console.warn("Leaflet.hexagonal.addMarker: a marker has to have a image- or an icon-property");
				}
	
			}

		},
		// addIcon
		addIcon: async function addIcon(latlng, meta) {
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addIcon: latlng not valid", latlng);
				return 0;
			}

			// meta
			meta = meta || {};

			if(!meta.icon) {
				meta.icon = "fallback";
			}

			return this.addMarker(latlng, meta);

		},
		// addImage
		addImage: async function addImage(latlng, meta) {
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addIcon: latlng not valid", latlng);
				return 0;
			}

			// meta
			meta = meta || {};

			if(!meta.image) {
				meta.image = this.images.fallback;
				meta.scale = 0.5;
			}

			return this.addMarker(latlng, meta);

		},

		// #endregion
		
		
		// #######################################################
		// #region remove 
		removeItem: function removeItem(id) {

			// remove points and markers
			var c = this.removePoint(id);
			c += this.removeMarker(id);

			this.refresh();

			return c;
		},
		removePoint: function removePoint(id) {
			if(this.points.length<1) { return false; }
			if(typeof id != "number" && typeof id != "string") {
				return 0;
			}

			// points
			var c = 0;
			for(var j=0; j<this.points.length; j++) {
				if(id===this.points[j].id) {

					var link = this.points[j].link;

					this.points.splice(j, 1);

					// readjust link
					for(var i=0; i<this.points.length; i++) {
						if(this.points[i].link>j) {
							this.points[i].link -= 1;
						}
						else if(this.points[i].link==j) {
							this.points[i].link = link;
						}
					}
					c++;
					j--;
				}
			}

			this.refresh();

			return c;
		},
		removeMarker: function removeMarker(id) {
			if(this.points.length<1) { return false; }
			if(typeof id != "number" && typeof id != "string") {
				return 0;
			}

			// markers
			var c = 0;
			if(this.markers.length<1) { return false; }
			var c = 0;
			for(var j=0; j<this.markers.length; j++) {
				if(id===this.markers[j].id) {
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
		removeGroup: function removeGroup(group) {
			if(this.points.length<1) { return false; }
			if(typeof group != "number" && typeof group != "string") {
				return 0;
			}

			// points
			var c = 0;
			for(var j=0; j<this.points.length; j++) {
				if(group===this.points[j].group) {

					var link = this.points[j].link;

					this.points.splice(j, 1);

					// readjust link
					for(var i=0; i<this.points.length; i++) {
						if(this.points[i].link>j) {
							this.points[i].link -= 1;
						}
						else if(this.points[i].link==j) {
							this.points[i].link = link;
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
				sum:0,
				avg:0,
				min:false,
				max:false,
				delta:0
			};
			this.markerLayer.clearLayers();

			this.refresh();
			return c;
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
		_onDraw: function _onDraw() {
			var drawTime = performance.now();
			this.hexagonalize();
			this.updateClusterRamp();
			this.totals.hexTime = performance.now() - drawTime; 
			this.onDraw(this._container, this.hexagonals, this.selection, this.links, this.options);
			this.totals.drawTime = performance.now() - drawTime; 

			//console.log("totals",this.totals.hexTime, this.totals.drawTime, this.totals);

		},
		onDraw: function onDraw(canvas, hexagonals, selection, links, options) {

			// canvasContext
			var ctx = canvas.getContext("2d");

			var selectionGroups = {};
			if(selection.groups) { selectionGroups = selection.groups; }

			// layers
			if(this.markerLayer.needsRefresh) {
				this.markerLayer.clearLayers();
			}

			// style
			var style = { 
				fill: this.options.fillColor || "#f00", 
				stroke: this.options.strokeColor || "#f00", 
				lineWidth: this.options.borderWidth || 1,
				linkWidth: this.options.linkWidth || 1
			};

			// totals
			var tCount = this.totals.count;
			var tMin = this.totals.min;
			if(typeof this.options.clusterMin == "number") {
				tMin = this.options.clusterMin;
			}
			var tMax = this.totals.max; 
			if(typeof this.options.clusterMax == "number") {
				tMax = this.options.clusterMax;
			} 

			// draw gutter
			if(this.options.gutterFill || this.options.gutterStroke) {
				this.drawGutter(ctx);
			}
			

			// draw links
			if(links.length && options.linkVisible) {
				for(var i=0; i<links.length; i++) {

					var cluster = false;
					var link = false;

					// todo: avg out start/end or make a gradient-link?

					if(links[i].end.cell.cluster) {
						cluster = links[i].end.cell.cluster;
						link = links[i].end;
					}
					else if(links[i].start.cell.cluster) {
						cluster = links[i].start.cell.cluster;
						link = links[i].start;
					}
					else if(links[i].style) {
						link = links[i];
					}


					// style
					style.fill = link?.style?.fill || this.groupStyle[link.group]?.fill || this.options.fillColor;

					// if start/end-point is visibly clustered (?!)
					if(this.options.clusterMode) {

						//clusterMode = "count" || "sum" || "avg" || "min" || "max" || "first" || "last" || false
						if(!cluster) {
							style.fill = this.calcClusterColor(0,0,1);
						}
						else if(this.options.clusterMode=="count") {
							style.fill = this.calcClusterColor(cluster.count, 1, tCount);
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
						else if(this.options.clusterMode=="first") {
							style.fill = link.style0.fill || this.options.fillColor;
						}
						else if(this.options.clusterMode=="last") {
							style.fill = link.style1.fill || this.options.fillColor;
						}
					}


					this.drawLink(ctx, links[i], style);
					if(selectionGroups[links[i].group] && options.selectionVisible) {
						this.drawLinkSelected(ctx, links[i]);
					}

				}

			}


			// draw points and marker
			var hexs = Object.keys(hexagonals);
			if(hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					// draw point
					if(options.hexagonVisible && hexagonals[hexs[h]].pointIndices.length) {

						var gs = this.points[hexagonals[hexs[h]].pointIndices[0]].group;
						style.fill = hexagonals[hexs[h]].style0.fill || this.groupStyle[gs]?.fill || this.options.fillColor;

						//clusterMode = "count" || "sum" || "avg" || "min" || "max" || "first" || "last" || false
						if(this.options.clusterMode) {
							if(this.options.clusterMode=="count") {
								style.fill = this.calcClusterColor(hexagonals[hexs[h]].cluster.count, 1, tCount);
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
							else if(this.options.clusterMode=="first") {
								style.fill = hexagonals[hexs[h]].style0.fill || this.options.fillColor;
							}
							else if(this.options.clusterMode=="last") {
								style.fill = hexagonals[hexs[h]].style1.fill || this.options.fillColor;
							}

						}

						if(hexagonals[hexs[h]].pointless==false) {
							this.drawHexagon(ctx, hexagonals[hexs[h]], style);
						}
						if(options.selectionVisible) {
							var hgs = Object.keys(hexagonals[hexs[h]].groups);
							for(var i=0;i<hgs.length;i++) {
								var hid = hexagonals[hexs[h]].groups[hgs[i]];
								if(selectionGroups[hid]) {
									this.drawHexagonSelected(ctx, hexagonals[hexs[h]]);
								}
							}
						}

					}


					// draw marker
					if(this.markerLayer.needsRefresh) {
						if(options.markerVisible && hexagonals[hexs[h]].markerIndices.length) {
							this.drawMarker(hexagonals[hexs[h]]);
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
			if(style.fill) {
				ctx.fillStyle = style.fill;
				ctx.fill(hPath);
			}
			if(style.stroke) {
				ctx.strokeStyle = style.stroke;
				ctx.lineWidth = style.lineWidth;
				ctx.stroke(hPath);
			}
		},
		drawMarker: function drawMarker(hexagon) {
			var m0 = this.markers[hexagon.markerIndices[0]];
			var style0 = m0.style;
			var ref = this;
			if(typeof style0 != "object") { return; }


			// style
			var size = style0.size || hexagon.size;
			var fill = style0.fill || this.options.fillColor || "#ff0000";


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

			
			// image
			if(typeof style0.image == "string") {

				// onload: add image-marker
				var ii = new Image();
				ii.onload = function() {
					var icon = L.divIcon({
						className: 'leaflet-hexagonal-marker',
						html: `<svg width="${w}" height="${h}" opacity="${ref.options.markerOpacity}" >
							<symbol id="hexa${m0.id}"><polygon points="${poly}"></polygon></symbol>
							<mask id="mask${m0.id}"><use href="#hexa${m0.id}" fill="#fff" stroke="#000" stroke-width="${ref.options.borderWidth+1}" /></mask>
							<use href="#hexa${m0.id}" fill="${ref.options.strokeColor}" shape-rendering="geometricPrecision" />
							<image preserveAspectRatio="xMidYMid slice" href="${style0.image}" mask="url(#mask${m0.id})" width="${w}" height="${h}" ></image>
							</svg>`,
						className: "",
						iconSize: [w,h],
						iconAnchor: [w/2,h/2],
					}); 
					var lm = L.marker(hexagon.latlng, {icon: icon, opacity:ref.options.markerOpacity}).addTo(ref.markerLayer); 
					L.DomEvent.on(lm, 'click', function(e) { 
						L.DomEvent.stopPropagation;
						ref._onClick(e);
					});
				};

				// onerror: replace with error-icon-marker
				ii.onerror = function() {
					console.warn("Leaflet.hexagonal.drawMarker: image-url invalid", style0.image);

					// fallback
					ref.drawMarkerFallback(hexagon, size);
					
				};
				ii.src = style0.image;
				return;
			}

			// icon
			if(typeof style0.icon == "string" && this.icons[style0.icon]) {

				var micon = this.icons[style0.icon]; 
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
						<use href="#hexa${m0.id}" fill="${fill}" stroke="${this.options.strokeColor}" stroke-width="${this.options.borderWidth}" shape-rendering="geometricPrecision" />
						${svg}
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 
				var lm = L.marker(hexagon.latlng, {icon: icon, opacity:this.options.markerOpacity}).addTo(this.markerLayer);
				L.DomEvent.on(lm, 'click', function(e) { 
					L.DomEvent.stopPropagation;
					ref._onClick(e);
				});
				return; 
			}	

			console.warn("Leaflet.hexagonal.drawMarker: parameters invalid");

		},
		drawMarkerFallback: function drawMarkerFallback(hexagon, size) {
			var marker = this.markers[hexagon.markerIndices[0]];
			var ref = this;

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

			var micon = this.icons["fallback"];
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
					<symbol id="hexa${marker.id}"><polygon points="${poly}"></polygon></symbol>
					<mask id="mask${marker.id}"><use href="#hexa${marker.id}" fill="#fff" stroke="#000" stroke-width="${this.options.borderWidth}" /></mask>
					<use href="#hexa${marker.id}" fill="${this.options.fillColor}" stroke="${this.options.strokeColor}" stroke-width="${this.options.borderWidth}" shape-rendering="geometricPrecision" />
					${svg}
					</svg>`,
				className: "",
				iconSize: [w,h],
				iconAnchor: [w/2,h/2],
			}); 
			var lm = L.marker(hexagon.latlng, {icon: icon, opacity:this.options.markerOpacity}).addTo(this.markerLayer); 
			L.DomEvent.on(lm, 'click', function(e) { 
				L.DomEvent.stopPropagation;
				ref._onClick(e);
			});
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
			if(this.options.strokeColor) {
				ctx.lineJoin = "round";
				ctx.strokeStyle = style.stroke;
				ctx.lineWidth = style.linkWidth + style.lineWidth*2;
				ctx.stroke(path);
			}

			if(!this.options.linkFill) { return; }
			
			if(this.options.linkFill===true) {
				ctx.strokeStyle = style.fill;
			}
			else {
				ctx.strokeStyle = this.options.linkFill;
			}
			ctx.lineWidth = style.linkWidth;
			ctx.stroke(path);

			
		},
		drawLinkSelected: function drawLinkSelected(ctx, link) {
			var path = new Path2D(link.path);
			if(this.options.strokeColor && this.options.selectionStrokeColor) {
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
				this.options.clusterMin = options.min;
			}
			if(typeof options.max == "number") {
				this.options.clusterMax = options.max;
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
		_onClick: function _onClick(e) {
			var selection = this.setSelection(e.latlng);
			if(selection) {
				this.setInfo(selection);
			}
			this.onClick(e,selection);
		},
		onClick: function onClick(e,selection) {
			if(selection) {

 				console.log("onClick", selection);
				console.log("onClick points",this.points);
				console.log("onClick-point0.meta.data", this.points[selection.pointIndices[0]].meta.data);
				console.log("onClick-point0.meta.info", this.points[selection.pointIndices[0]].meta.info);
			}
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
		// #region group/info
		setGroupStyle: function setGroupStyle(group, style = {}) {
			if(typeof group != "string" && typeof group != "number") {
				console.warn("Leaflet.hexagonal.setGroupStyle: name of group invalid", group);
				return;
			}
			if(typeof style == "string") {
				style = {fill: style};
			}
			if(typeof style !== "object") {
				console.warn("Leaflet.hexagonal.setGroupStyle: style invalid", style);
				return;				
			}
			if(typeof style.fill !== "string") {
				style.fill = this.options.fillColor;
			}
			this.groupStyle[group] = style;
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
			} 

			if(!info || !this.options.infoVisible) {
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

			this.info = L.marker(info.latlng, {icon: divicon, zIndexOffset:1000, opacity:this.options.infoOpacity }).addTo(this.infoLayer);
			L.DomEvent.on(this.info, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.on(this.info, 'click', function(e) { 
				L.DomEvent.stopPropagation;
				console.log('clicked info!',e);
			});
		},
		buildInfo: function buildInfo(info) {
			var html = "";

			var pis =  info.pointIndices.length;
			var ps = [];
			for(var i=0; i< pis; i++) {
				var p = this.points[info.pointIndices[i]];
				if(p.meta.info) {
					ps.push(p.meta.info);
				}
			}
			if(!ps.length) { html = `${pis}`; }
			else if(ps.length==1) { html = `${ps[0]}`; }
			else if(ps.length==2) { html = `${ps[0]}<br>${ps[1]}`; }
			else if(ps.length==3) { html = `${ps[0]}<br>${ps[1]}<br>${ps[2]}`; }
			else { html = `${ps[0]}<br>${ps[1]}<br>...<br>${ps[ps.length-1]}`; }

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
			var h = this.calcHexagonCell(p.x,p.y,size, offset,zoom);

			// hexagonals
			if(this.hexagonals[h.cell]) {
				return this.hexagonals[h.cell];
			}

			// no
			return false;

		},


		// #endregion



		// #######################################################
		// #region hexagonal
		hexagonalize: function hexagonalize() { 
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
			var hexagonOffset = this._map.project(nw, zoom);
			hexagonOffset= {x:Math.round(hexagonOffset.x), y: Math.round(hexagonOffset.y) };
			var hexagonOverhang = (1 + (this.options.linkReach / this.calcHexagonDiameter())) * hexagonSize;


			// hexagonBounds
			var hnw = this.calcHexagonCell(-padding.x,-padding.y, hexagonSize, hexagonOffset, zoom);
			var hse = this.calcHexagonCell(w,h, hexagonSize, hexagonOffset, zoom);
			var hexagonBounds = [hnw.idx, hnw.idy, hse.idx, hse.idy];


			// totals
			var tSum = 0;
			var tMin = Number.MAX_SAFE_INTEGER;
			var tMax = Number.MIN_SAFE_INTEGER;
			

			// cluster points
			var pl = this.points.length;
			for (var i = 0; i < pl; i++) {

				var point = this.points[i];

				var p = this.getPixels_from_latlng(point.latlng, w, h, hexagonOverhang);
				point.visible = p.visible;

				var d = point.meta.data[this.options.clusterProperty] || this.options.clusterDefaultValue || 0;

				if (p.visible) {

					var h = this.calcHexagonCell(p.x,p.y,hexagonSize, hexagonOffset, zoom);
					point.cell = h;

					/* 	hexagonals
					
						cell:"z-x-y", 
						idx:idx, idy:idy, 
						cx:cx, cy:cy, 
						px:x, py:y, 
						path:"M0 0 ...", 
						latlng: {lat:0, lng:0}, 
						size:size, 
						pointyTop:false,

						pointIndices:[i0,i1,i2...],
						markerIndices: [i0,i1,i2, ...]
						linkIndices: [[i01,i02],[i11,i12], ...]
						groups:{"groupA:"groupA", "groupB":"groupB", ...},
						...
					*/

					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].pointIndices = [];
						this.hexagonals[h.cell].markerIndices = [];
						this.hexagonals[h.cell].linkIndices = [];
						this.hexagonals[h.cell].groups = {};
						this.hexagonals[h.cell].cluster = { count:0, sum:0, avg:0, min:0, max:0, first:false }; 
						this.hexagonals[h.cell].style0 = { fill:false };
						this.hexagonals[h.cell].style1 = { fill:false };
						this.hexagonals[h.cell].pointless = false;
					}
					if(!this.hexagonals[h.cell].pointIndices.length) {
						this.hexagonals[h.cell].cluster.first = d;
						this.hexagonals[h.cell].cluster.min = d;
						this.hexagonals[h.cell].cluster.max = d;
						this.hexagonals[h.cell].style0 = { fill: (point.style.fill || false) };
					}
					//this.hexagonals[h.cell].points[point.group] = point;
					this.hexagonals[h.cell].pointIndices.push(i);
					this.hexagonals[h.cell].groups[point.group] = point.group;

					// cluster data
					this.hexagonals[h.cell].cluster.count++;
					this.hexagonals[h.cell].cluster.last = d;
					this.hexagonals[h.cell].cluster.sum += d;
					this.hexagonals[h.cell].cluster.avg = this.hexagonals[h.cell].cluster.sum / this.hexagonals[h.cell].cluster.count || 0; 
					this.hexagonals[h.cell].cluster.min = Math.min(this.hexagonals[h.cell].cluster.min, d);
					this.hexagonals[h.cell].cluster.max = Math.max(this.hexagonals[h.cell].cluster.max, d);
					this.hexagonals[h.cell].style1 = { fill: (point.style.fill || false) };
					this.hexagonals[h.cell].pointless = point.pointless || this.hexagonals[h.cell].pointless;
				}

				
				tSum += d;
				tMin = Math.min(tMin, d); 
				tMax = Math.max(tMax, d); 


			}

			
			// cluster markers 
			if(this.options.markerVisible) {
				for (var i = 0; i < this.markers.length; i++) {
					
					var marker = this.markers[i];

					var m = this.getPixels_from_latlng(marker.latlng, w, h, hexagonOverhang);
					marker.visible = m.visible;

					var h = this.calcHexagonCell(m.x,m.y,hexagonSize, hexagonOffset, zoom);
					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].pointIndices = [];
						this.hexagonals[h.cell].markerIndices = [];
						this.hexagonals[h.cell].linkIndices = [];
						this.hexagonals[h.cell].groups = {};
						this.hexagonals[h.cell].cluster = { count:0, sum:0, avg:0, min:0, max:0, first:false };
						this.hexagonals[h.cell].style0 = { fill:false };
						this.hexagonals[h.cell].style1 = { fill:false };
						this.hexagonals[h.cell].pointless = false;
					}

					this.hexagonals[h.cell].markerIndices.push(i);
					this.hexagonals[h.cell].groups[marker.group] = marker.group;

					marker.cell = h;
					
				}
			}

			// collect links
			this.links = [];
			if(this.options.linkVisible && this.options.linkMode && pl>1) {
				for(var i=1; i<pl; i++) {
					var p1 = this.points[i];
					var i1 = i;
					if(p1.link>=0) {
						var p0 = this.points[p1.link];
						var i0 = p1.link;
						if(p0.visible && p1.visible) {
							var path = this.getLinkPath(i0,i1,hexagonSize, hexagonOffset, zoom);
							if(path) {
								var style = p0.style || p1.style || false;
								this.links.push({group: p0.group, start:p0, end:p1, path:path, style:style});
							}
						}
					}
				}
			}

			// gutter
			if(this.options.gutterFill || this.options.gutterStroke) {	
				this.gutter = this.calcGutterCells(hexagonBounds, hexagonSize, hexagonOffset);
			}

			this.totals.cells = Object.keys(this.hexagonals).length; 
			this.totals.markers = this.markers.length;
			this.totals.links = this.links.length;
			this.totals.count = pl;
			this.totals.sum = tSum;
			this.totals.avg = tSum/pl || 0;
			this.totals.min = tMin;
			this.totals.max = tMax;
			this.totals.delta = tMax-tMin;

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
			var idy = Math.floor((Math.floor(2 * ys + 1) + t) / 3);
			var idx = Math.floor((t + Math.floor(-ys + sqrt3 * xs + 1)) / 3);
			
			var cy = (idy - idx/2) * size - offset.y;
			var cx = idx/2 * sqrt3 * size - offset.x;
			var clatlng = this._map.containerPointToLatLng([Math.round(cx),Math.round(cy)]);
			idy -= Math.floor(idx/2); // flat - offset even-q
			var cell = zoom + "_" + idx + "_" + idy; 

			var pointyTop=false;

			var path = "M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:pointyTop };
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
			var idx = Math.floor((Math.floor(2 * xs + 1) + t) / 3);
			var idy = Math.floor((t + Math.floor(-xs + sqrt3 * ys + 1)) / 3);
			
			var cx = (idx-idy/2) * size - offset.x;
			var cy = idy/2 * sqrt3 * size - offset.y;
			var clatlng = this._map.containerPointToLatLng([cx,cy]);
			idx -= Math.floor(idy/2); // pointy - offset even-r
			var cell = zoom + "_" + idx + "_" + idy; 

			var path = "M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, pointyTop:true };
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
			var idx,idy,cx,cy;
			for(var y=y0; y<=y1;y+=1) {
				for(var x=x0;x<=x1;x+=1) {
					idy = y;
					idx = x;
					if(this.hexagonals[idx+"_"+idy]?.cell) { }
					else {
						idy += Math.floor(idx/2);
						cy = (idy - idx/2) * size - offset.y;
						cx = idx/2 * sqrt3 * size - offset.x;
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
			var idx,idy,cx,cy;
			for(var y=y0; y<=y1;y+=1) {
				for(var x=x0;x<=x1;x+=1) {
					idy = y;
					idx = x;
					if(this.hexagonals[idx+"_"+idy]?.cell) { }
					else {
						idx += Math.floor(idy/2);
						cx = (idx - idy/2) * size - offset.x;
						cy = idy/2 * sqrt3 * size - offset.y;
						cells.push("M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z");
					} 
				}
			}
			return cells;

		},
		getLinkPath: function getLinkPath(index0, index1, size, offset, zoom) {

			var point0 = this.points[index0];
			var point1 = this.points[index1];

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
				h = this.calcHexagonCell(x,y,size,offset,zoom);
				if(!hs[h.cell]) {
					hs[h.cell] = h;

					// add hexagonal - just for clickablility: todo: adapt for linkMode=curve 
					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].pointIndices = [];
						this.hexagonals[h.cell].markerIndices = [];
						this.hexagonals[h.cell].linkIndices = [];
						this.hexagonals[h.cell].groups = {};
					}

					this.hexagonals[h.cell].linkIndices.push([index0,index1]);
					this.hexagonals[h.cell].groups[group] = group;

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
		getMetaData: function getMetaData(meta) {
			var cd = {};
			var ps = this.options.dataProperties || [];
			if(!ps.length) {
				if(this.options.clusterProperty) {
					ps.push(this.options.clusterProperty);
				}	
			}
			for(var i=0; i<ps.length;i++) {
				if(typeof meta[ps[i]]=="number") {
					cd[ps[i]] = meta[ps[i]];
				}
				else {
					cd[ps[i]] = false;
				}
			}
			return cd;
		},
		getLinkIndex: function getLinkIndex(group) {
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
			if(str.length>21) {
				return str.substring(0,10) + h.substring(h.length-10, h.length);
			}
			return str;
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
