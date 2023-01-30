/*!
 * Leaflet.Hexagonal.js v0.8.0
 * 
 * Copyright (c) 2023-present Knut Wanzenberg
 * Released under the MIT License - https://choosealicense.com/licenses/mit/
 * 
 * https://github.com/kaynut/Leaflet.Hexagonal
 * 
 * 
 * 
 * Leaflet plugin (version >=1.0)
 * - draws/clusters points in a hexagonal manner on a canvas-layer
 * - for a well-made overview to hexagons see: https://www.redblobgames.com/grids/hexagons/
 * - as a base for this layer I took Derek Li's CustomLayer
 * 
 * 
 * 
 * 
*/

/*!
 * Leaflet.CustomLayer.js v2.1.0
 * 
 * Copyright (c) 2019-present Derek Li
 * Released under the MIT License - https://choosealicense.com/licenses/mit/
 * 
 * https://github.com/iDerekLi/Leaflet.CustomLayer
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
			// hexagonMode: "topFlat" || "topPointy",
			hexagonMode: "topFlat",
			// hexagonFill: "color" || false
			hexagonFill: "#fd1",
			// hexagonLine: "color" || false
			hexagonLine: "#666", 	
			// hexagonLineWidth: pixels
			hexagonLineWidth: 1,	


			// markerVisible: boolean
			markerVisible: true,
			//markerFill: "color" || false
			markerFill: "#fd1",
			//markerLine: "color" || false
			markerLine: "#333",
			//markerLine: pixels
			markerLineWidth: 1,
			//markerOpacity: number (0-1)
			markerOpacity: 1,


			// linkVisible: boolean
			linkVisible: true,			
			// linkMode: "centered" || "straight" || "hexagonal" || false
			linkMode: "straight",
			// linkJoin: number (0=gap between cell and line / 0.5= cell and line touch / 1=cellcenter and line fully joined)
			linkJoin: 1,  
			// linkFill: "color" || false
			linkFill: "#fd1",
			// linkLine: "color" || false
			linkLine: "#666", 	
			// linkLineWidth: pixels
			linkLineWidth: 3,	
			// linkLineBorder: pixels
			linkLineBorder: 1,	


			// selectionVisible: true || false
			selectionVisible: true,
			// selectionFill: "color" || false
			selectionFill: "rgba(0,0,0,0.5)", 	
			// selectionLine: "color" || false
			selectionLine: "rgba(0,0,0,0.5)", 	 	
			// selectionLineWidth: pixels
			selectionLineWidth: 1,	
			

			// infoVisible: true || false
			infoVisible: true,
			// infoDisplayMode: "count" || "ids" || "custom" || false
			infoDisplayMode: "count", 
			// infoZoomMode: "clearOnZoom" || "preserveOnZoom" || "adaptOnZoom" || false
			infoZoomMode: "adaptOnZoom", 
			// infoClassName: class || ""
			infoClassName: "leaflet-hexagonal-infobox-container", 
			// infoItemsMax: number (max items shown explicitly in info)
			infoItemsMax: 5	

		},
		// #endregion



		// #######################################################
		// #region props
		
		_incNr: 0,
		_incId: 0,

		hexagonals: {},
		points: [],
		links: [],
		markers:[],
		markerLayer: false,
		selection: {},

		images: { 
			default: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAK5JREFUSEvtlMsNgzAQBYcO6CTpIKSElJJKUgolEDognaSE6ElG2gPxrvkckOwTCPTGb1jccPBqDs6nAlzDVVEL9MATmJZ8bVGk8AG4AiPQ7Qmw4Z8U/t0LEA4XMKdI1V/AA5h3VxTuAd7ALX28e6o/O89qsapyDbRbQS5mQtQqHO410HML0X1ReARgIbrWKC5Oy78zI/ofqIlWUXi0gXug5V6INlgNqQBX3fkV/QBZex4ZCtJcsAAAAABJRU5ErkJggg=="
		},
		icons: {
			person: "M9 22V8.775q-2.275-.6-3.637-2.513Q4 4.35 4 2h2q0 2.075 1.338 3.537Q8.675 7 10.75 7h2.5q.75 0 1.4.275.65.275 1.175.8L20.35 12.6l-1.4 1.4L15 10.05V22h-2v-6h-2v6Zm3-16q-.825 0-1.412-.588Q10 4.825 10 4t.588-1.413Q11.175 2 12 2t1.413.587Q14 3.175 14 4q0 .825-.587 1.412Q12.825 6 12 6Z"
		},
		
		// #endregion



		// #######################################################
		// #region base
		// lifecycle
		initialize: function initialize(t) {
			e.setOptions(this, t),
				/* Built-in Date */
				e.stamp(this), this._map = undefined, this._container = undefined, this._bounds = undefined,
				this._center = undefined, this._zoom = undefined;

				this._instanceUID = Date.now();
				this._incNr = (Date.now() & 16777215)*1000;
				this._incId = (Date.now() & 16777215)*1000;
		},
		beforeAdd: function beforeAdd() {
			this._zoomVisible = !0;
		},
		getEvents: function getEvents() {
			// Layer trigger priority
			// move: movestart -> move -> moveend
			// zoom: zoomstart -> movestart -> zoomanim -> zoom -> move -> zoomend -> moveend
			// resize: move -> resize -> moveend
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
			if (this.fire("layer-beforemount"), // Lifecycle beforeMount
				this._container || this._initContainer(), this.setOpacity(this.options.opacity),
				window.isNaN(this.options.zIndex)) { this.setZIndex(100); }
			else { this.setZIndex(this.options.zIndex); }
			this.getPane().appendChild(this._container);
			this._onZoomVisible();
			this.fire("layer-mounted");
			this.markerLayer = L.layerGroup([]).addTo(this._map);
			this.markerLayer.needsRefresh = true;
			this.markerLayer.markerLayer = true;
			this._update();
		},
		onRemove: function onRemove() {
			this.fire("layer-beforedestroy"), // Lifecycle beforeDestroy
				this._destroyContainer(), this.fire("layer-destroyed");
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
			e.DomUtil.addClass(t, "leaflet-layer"), this._zoomAnimated && e.DomUtil.addClass(this._container, "leaflet-zoom-animated");
		},
		_destroyContainer: function _destroyContainer() {
			e.DomUtil.remove(this._container), delete this._container;
		},
		_isZoomVisible: function _isZoomVisible() {
			var t = this.options.minZoom, e = this.options.maxZoom, i = this._map.getZoom();
			return i >= t && i <= e;
		},
		_zoomShow: function _zoomShow() {
			this._zoomVisible || (this._zoomVisible = !0, this._map.off({
				zoomend: this._onZoomVisible
			}, this), this.options.visible && (this._map.on(this.getEvents(), this), this.getContainer().style.display = ""));

		},
		_zoomHide: function _zoomHide() {
			this._zoomVisible && (this._zoomVisible = !1, this._map.off(this.getEvents(), this),
				this._map.on({
					zoomend: this._onZoomVisible
				}, this), this.getContainer().style.display = "none");
		},
		_updateTransform: function _updateTransform(t, i) {
			var o = this._map.getZoomScale(i, this._zoom), n = e.DomUtil.getPosition(this._container), s = this._map.getSize().multiplyBy(.5 + 0), a = this._map.project(this._center, i), r = this._map.project(t, i).subtract(a), h = s.multiplyBy(-o).add(n).add(s).subtract(r);
			e.Browser.any3d ? e.DomUtil.setTransform(this._container, h, o) : e.DomUtil.setPosition(this._container, h);
		},
		_update: function _update() {
			if (!this._map._animatingZoom || !this._bounds) {
				this.__update();
				var t = this._bounds, i = this._container;
				this._onDraw();
				e.DomUtil.setPosition(i, t.min), this.fire("layer-render");
			}
		},
		__update: function __update() {
			var t = 0; 
			var i = this._map.getSize(), o = this._map.containerPointToLayerPoint(i.multiplyBy(-t));
			this._bounds = new e.Bounds(o, o.add(i.multiplyBy(1 + 2 * t))), this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();
		},
		_reset: function _reset() {
			this._update(), this._updateTransform(this._center, this._zoom);
		},
		getContainer: function getContainer() {
			return this._container;
		},
		setContainer: function setContainer(t) {
			var e = this.getContainer(), i = e.parentNode;
			if (delete this._container, this.options.container = t, this._container || this._initContainer(),
				this.setOpacity(this.options.opacity), window.isNaN(this.options.zIndex)) { this.setZIndex(100); } 
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



		// #######################################################
		// #region points
		addPoint: function addPoint(latlng, id, meta) { // "id", {lng,lat}, {count,secs,dist,ts, weight, marker}
	
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addPoint: latlng not valid", latlng);
			}
			latlng.lat = latlng.lat || 0;
			latlng.lng = latlng.lng || 0;

			if (typeof id != "number" && typeof id !="string") { id = this._genId(); }

			meta = meta || {};

			var _nr = this._genNr();

			var point = {
				id: id,
				_nr: _nr,
				_prev: this.getPrevPoint({id:id , _nr:_nr}),
				cell: false,
				latlng: latlng,

				count: meta.count || 0,
				secs: meta.secs || 0,
				dist: meta.dist || 0,
				weight: meta.weight || 0,
				ts: meta.ts || 0,
				marker: meta.marker || false

			};

			this.points.push(point);

			if(point.marker) {
				this.markers.push(point);
			}

			this.refresh();

		},
		addPoint_tiles15: function addPoint_tiles15(tiles15, id, meta) { // "id", {"UxWd":{"count":105,"secs":1705,"dist":7694},....}
			if (typeof tiles15 == "string") {
				tiles15 = JSON.parse(tiles15);
			}
			if (typeof tiles15 != "object") {
				console.warn("Leaflet.hexagonal.addPoint_tiles15: unknown format", tiles15);
				return;
			}

			if (typeof id != "number" && typeof id !="string") { id = this._genId(); }

			meta = meta || {};


			var keys = Object.keys(tiles15);
			for (var i = 0; i < keys.length; i++) {

				var bbox = this.getBbox_from_tile15(keys[i]);
				var latlng= { lng: (bbox[0]+bbox[2])/2, lat: (bbox[1]+bbox[3])/2 };

				var _nr = this._genNr();

				var point = {
					id: id,
					_nr: _nr,
					_prev: this.getPrevPoint({id:id , _nr:_nr}),
					cell: false,
					latlng: latlng,
					count: meta.count || tiles15[keys[i]].count || 0,
					secs: meta.secs || tiles15[keys[i]].secs || 0,
					dist: meta.dist || tiles15[keys[i]].dist || 0,
					weight: meta.weight || tiles15[keys[i]].weight || 0,
					ts: meta.ts || tiles15[keys[i]].dist || 0,
					marker: false // todo??
				};

				this.points.push(point);

				if(point.marker) { // todo??
					this.markers.push(point);
				}

				this.refresh();

			}

		},
		addGeojson: function addGeojson(g,props) {
			if(typeof g != "object" || typeof g.type != "string") { return 0; }
			if(g.type == "Point" && g.coordinates) {
				var id = this._genId();
				var ps = props || {};
				this.addPoint({lng:g.coordinates[0],lat:g.coordinates[1]},id, ps);
				return 1;
			}
			if(g.type == "MultiPoint") {
				var c = g.coordinates.length;
				for(var i=0; i<c; i++) {
					var id = this._genId();
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, id);
				}
				return c;
			}
			if(g.type == "LineString") {
				var c = g.coordinates.length;
				var id = this._genId();
				for(var i=0; i<c; i++) {
					this.addPoint({lng:g.coordinates[i][0],lat:g.coordinates[i][1]}, id);
				}
				return c;
			}
			if(g.type == "MultiLineString") {
				var c = 0;
				for(var i=0; i<g.coordinates.length; i++) {
					var ci = g.coordinates[i];
					var id = this._genId();
					for(var j=0; j<ci.length; j++) {
						// properties
						this.addPoint({lng:ci[j][0],lat:ci[j][1]}, id);
						c++;
					}
				}
				return c;
			}
			if(g.type == "Feature") {
				var ps = g.properties || {};
				return this.addGeojson(g.geometry, ps);
			}
			if(g.type == "FeatureCollection") {
				var c = 0;
				for(var i=0; i<g.features.length; i++) {
					var ps = g.features[i]?.properties || {};
					c+= this.addGeojson(g.features[i].geometry, ps);
				}
				return c;
			}

			console.warn("Leaflet.hexagonal.addGeojson: no valid data in geojson");
			return 0;

		},
		removePoint: function removePoint(id) {
			if(this.points.length<1) { return false; }
			if(typeof id != "number" && typeof id != "string") {
				return false;
			}

			for(var j=0; j<this.points.length; j++) {
				if(id===this.points[j].id) {
					this.points.splice(j, 1);
					return true;
				}
			}

			return false;
		},		
		clearPoints: function clearPoints() {
			var c = this.points.length;
			this.points = [];
			this.refresh();
			return c;
		},

		getPrevPoint: function getPrevPoint(point) {
			var il = this.points.length;
			if(!il) { return false; }
			var prevPoint = this.points[il-1];
			if(point.id==prevPoint.id && point._nr-1 == prevPoint._nr) {
				return prevPoint._nr;
			}
			return false;
		},

		addMarker: function addMarker(latlng, id, meta) {
			if(typeof latlng != "object") {
				console.warn("Leaflet.hexagonal.addMarker: latlng not valid", latlng);
			}
			latlng.lat = latlng.lat || 0;
			latlng.lng = latlng.lng || 0;

			if (typeof id != "number" && typeof id !="string") { id = this._genId(); }
			meta = meta || {};

			if(meta.marker) {
				this.addPoint(latlng, id, meta);
			}
			else {
				console.warn("Leaflet.hexagonal.addMarker: no sufficient data");
			}
		},
		removeMarker: function removeMarker(id) {
			if(this.markers.length<1) { return false; }
			if(typeof id != "number" && typeof id != "string") {
				return false;
			}
			for(var j=0; j<this.markers.length; j++) {
				if(id===this.markers[j].id) {
					this.markers.splice(j, 1);
					return true;
				}
			}
			return false;
		},	
		clearMarker: function clearMarker() {
			var c = this.markers.length;
			this.markers = [];
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

			// hexagonOffset 
			var nw = this._map.getBounds().getNorthWest();
			var hexagonOffset = this._map.project(nw, zoom);


			// cluster points
			for (var i = 0; i < this.points.length; i++) {

				var point = this.points[i];

				var p = this.getPixels_from_latlng(point.latlng, w, h, hexagonSize);
				if (p.visible) {

					var h = this.calcHexagonCell(p.x,p.y,hexagonSize, hexagonOffset)

					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].ids = {};
					}
					if(!this.hexagonals[h.cell].point0) {
						this.hexagonals[h.cell].point0 = point;
						this.hexagonals[h.cell].points = {};
					}
					this.hexagonals[h.cell].points[point.id] = point;
					this.hexagonals[h.cell].ids[point.id] = point.id;

				}
				point.cell = h;
			}


			// cluster markers 
			for (var i = 0; i < this.markers.length; i++) {
				
				var marker = this.markers[i];

				var p = this.getPixels_from_latlng(marker.latlng, w, h, hexagonSize);
				if (p.visible) {

					var h = this.calcHexagonCell(p.x,p.y,hexagonSize, hexagonOffset)

					if(!this.hexagonals[h.cell]) {
						this.hexagonals[h.cell] = h;
						this.hexagonals[h.cell].ids = {};
					}
					if(!this.hexagonals[h.cell].marker0) {
						this.hexagonals[h.cell].marker0 = marker;
						this.hexagonals[h.cell].markers = {};
					}
					this.hexagonals[h.cell].markers[marker.id] = marker;
					this.hexagonals[h.cell].ids[marker.id] = marker.id;

				}
				marker.cell = h;
				
			}


			// no links
			this.links = [];
			if(!this.options.linkMode) { return; }
			if(this.points.length<2) { return; }


			// collect links
			for (var i = 1; i < this.points.length; i++) {

				var point0 = this.points[i-1];
				var point1 = this.points[i];

				if(point0.id==point1.id) {
					var path = this.getLinkPath(point0,point1,hexagonSize, hexagonOffset);
					if(path) {
						this.links.push({id: point1.id, start:point0, end:point1, path:path});
					}
				}

			}


		},
		_onDraw: function _onDraw() {

			this._preDraw();
			this.onDraw(this._container, this.hexagonals, this.selection, this.links, this.options);
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

			// draw links
			if(links.length && options.linkVisible) {
				for(var i=0; i<links.length; i++) {
					this.drawLink(ctx, links[i]);

					if(selectionIds[links[i].id] && options.selectionVisible) {
						this.drawLinkSelected(ctx, links[i]);
					}
				}

			}


			// draw points and marker
			var hexs = Object.keys(hexagonals);
			if(hexs.length) {
				for (var h=0; h<hexs.length; h++) {

					// draw point
					if(options.hexagonVisible && hexagonals[hexs[h]].point0) {
						this.drawHexagon(ctx, hexagonals[hexs[h]]);

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


			// info
			//if(this.info && !this.options.infoVisible) {
				//this.setInfobox(false);
			//}

		},

		drawHexagon: function drawHexagon(ctx, hexagon) {
			var hPath = new Path2D(hexagon.path);

			if(this.options.hexagonFill) {
				ctx.fillStyle = this.options.hexagonFill;
				ctx.fill(hPath);
			}
			if(this.options.hexagonLine) {
				ctx.strokeStyle = this.options.hexagonLine;
				ctx.lineWidth = this.options.hexagonLineWidth;
				ctx.stroke(hPath);
			}
		},
		drawHexagonMarker: function drawHexagonMarker(hexagon) {
			var m0 = hexagon.marker0;
			var m0m = hexagon.marker0.marker;
			if(typeof m0m != "object") { return; }

			// marker type
			var img = m0m.image || m0m.icon || this.images.default; 
			if(typeof m0m.text == "string") {
				return;	// todo add text marker
			}

			var size = m0m.size || hexagon.size;
			var fill = m0m.fill || this.options.markerFill || "#303234";

			// calc path
			var w,h;
			var poly = false;
			if(!hexagon.topPointy) {
				w = size*1.155;
				h = size;
				poly = `0 ${size*0.5},${size*0.289} 0,${size*0.866} 0,${size*1.155} ${size*0.5},${size*0.866} ${size},${size*0.289} ${size}`;
			}

			else {
				w = size;
				h = size*1.155;
				poly = `0 ${size*0.289},${size*0.5} 0,${size*1} ${size*0.289},${size*1} ${size*0.866},${size*0.5} ${size*1.155},0 ${size*0.866}`;
			}

			var icon;

			// image
			if(m0m.image) {
				icon = L.divIcon({
					className: 'leaflet-hexagonal-marker',
					html: `<svg width="${w}" height="${h}" opacity="${this.options.markerOpacity}" >
						<symbol id="hexa${m0._nr}"><polygon points="${poly}"></polygon></symbol>
						<mask id="mask${m0._nr}"><use href="#hexa${m0._nr}" fill="#fff" stroke="#000" stroke-width="${this.options.markerLineWidth}" /></mask>
						<use href="#hexa${m0._nr}" fill="${this.options.markerLine}" shape-rendering="geometricPrecision" />
						<image preserveAspectRatio="xMidYMid slice" href="${img}" mask="url(#mask${m0._nr})" width="${w}" height="${h}" ></image>
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 
			}
			else if(m0m.icon) {
				var svg = "";
				if(this.icons[m0m.icon]) {
					svg = `<path opacity="0.75" transform="translate(${w/2-12},${h/2-12})" d="${this.icons[m0m.icon]}"  />`; 
				}
				icon = L.divIcon({
					className: 'leaflet-hexagonal-marker',
					html: `<svg width="${w}" height="${h}" opacity="${this.options.markerOpacity}" >
						<symbol id="hexa${m0._nr}"><polygon points="${poly}"></polygon></symbol>
						<mask id="mask${m0._nr}"><use href="#hexa${m0._nr}" fill="#fff" stroke="#000" stroke-width="${this.options.markerLineWidth}" /></mask>
						<use href="#hexa${m0._nr}" fill="${fill}" stroke="${this.options.markerLine}" stroke-width="${this.options.markerLineWidth}" shape-rendering="geometricPrecision" />
						${svg}
						</svg>`,
					className: "",
					iconSize: [w,h],
					iconAnchor: [w/2,h/2],
				}); 				
			}

			L.marker(hexagon.latlng, {icon: icon}).addTo(this.markerLayer);			

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

		drawLink: function drawLink(ctx, link) {
			var path = new Path2D(link.path);
			if(this.options.linkLineBorder) {
				ctx.strokeStyle = this.options.linkLine;
				ctx.lineWidth = this.options.linkLineWidth + this.options.linkLineBorder*2;
				ctx.stroke(path);
			}
			ctx.strokeStyle = this.options.linkFill;
			ctx.lineWidth = this.options.linkLineWidth;
			ctx.stroke(path);
		},
		drawLinkSelected: function drawLinkSelected(ctx, link) {
			var path = new Path2D(link.path);
			if(this.options.linkLineBorder && this.options.selectionLine) {
				ctx.strokeStyle = this.options.selectionLine;
				ctx.lineWidth = this.options.linkLineWidth + this.options.linkLineBorder*2;
				ctx.stroke(path);
			}
			ctx.strokeStyle = this.options.selectionFill;
			ctx.lineWidth = this.options.linkLineWidth;
			ctx.stroke(path);
		},
		// #endregion



		// #######################################################
		// #region events
		_onClick: function _onClick(e) {

			var selection = this.setSelection(e.latlng);
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
/*
				var zoom = this._map.getZoom();
				if(zoom<this.options.minZoom || zoom> this.options.maxZoom) { 
					this.hideInfo(); 
					return;
				}
				else {
					this.showInfo();
				}	
				

				if(this.options.infoZoomMode=="adaptOnZoom") {
					this._preDraw();
					//this.setSelection(this.info.adapt);
				}
				else if(this.options.infoZoomMode=="preserveOnZoom") {}
				else {
					this.selection = false;
					this.setInfobox(false);
				}
*/
			}
		},
		// #endregion



		// #######################################################
		// #region info

		setInfobox: function setInfobox(info) {

			if(this.infobox) {
				this._map.removeLayer(this.infobox);
			} 

			if(!info) {
				return;
			}


			// convert points{} to points[]
			var points = this._toArray(info.points);

			// get html for info
			var html = this.buildInfo(points);

			var iconHtml = document.createElement("DIV");
			iconHtml.className = "leaflet-hexagonal-infobox leftTop";
			iconHtml.innerHTML = html;
			var divicon = L.divIcon({
				iconSize:null,
				html: iconHtml,
				className: this.options.infoClassName
			});

			this.infobox = L.marker(info.latlng, {icon: divicon}).addTo(this._map);
			L.DomEvent.on(this.infobox, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.on(this.infobox, 'click', L.DomEvent.stopPropagation);
		},
		buildInfo: function buildInfo(points) {

			var html = "";
			var more = "";
			var br = "";
			var maxPoints = this.options.infoItemsMax;

			// infoDisplayMode: count
			if(this.options.infoDisplayMode=="count") {
				return points.length;
			}

			// infoDisplayMode: ids
			if(this.options.infoDisplayMode=="ids") {
				if(points.length>maxPoints) {
					more = "<br><span style='float:right'>[" + (points.length - maxPoints) + " more]</span>"; 
				}
				maxPoints = Math.min(points.length, maxPoints);

				for(var i=0;i<maxPoints; i++) {
					html += br + points[i].id;
					br = "<br>";
				}
				return html + more;
			}

			// infoDisplayMode: custom
			if(this.pointInfo) {
				if(points.length>maxPoints) {
					more = "<br><span style='float:right'>[" + (points.length - maxPoints) + " more]</span>"; 
				}
				maxPoints = Math.min(points.length, maxPoints);

				for(var i=0;i<maxPoints; i++) {
					html += br + this.pointInfo(points[i]);
					br = "<br>";
				}
				return html + more;
			}

			// // infoDisplayMode: default
			return points.length;

		},

		showInfo: function showInfo() {
			if(this.infobox) {
				var i = document.querySelector('.leaflet-hexagonal-infobox-container');
				if(i) { i.style.display="block"; }
			}
		},
		hideInfo: function hideInfo() {
			if(this.infobox) {
				var i =document.querySelector('.leaflet-hexagonal-infobox-container');
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
				this.setInfobox(false);
				return false; 
			}


			// get selection
			var selection = this.getSelection(latlng);


			// if no points got hit
			if(!selection) {
				this.selection = false;
				this.setInfobox(false);
				return false;
			}


			// adapt
			//selection.adapt = selection.points[Object.keys(selection.points)[0]].latlng;

			// set infobox
			//this.setInfobox(selection);


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
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			var p = this.getPixels_from_latlng(latlng, wh.w, wh.h, size);
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
			if(this.options.hexagonMode == "topPointy") {
				return this.calcHexagonCell_topPointy(x,y, size, offset);
			}

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.73205081; 
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

			var topPointy=false;

			var path = "M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, topPointy:topPointy };
		},
		calcHexagonCell_topPointy: function calcHexagonCell_topPointy(x,y, size, offset) { // hexagon top-pointy

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap || 0;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.73205081; 
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

			var topPointy = true;

			var path = "M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z";

			return { cell:cell, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, path:path, latlng:clatlng, size:size, topPointy:topPointy };
		},
		getLinkPath: function getLinkPath(point0, point1, size,offset) {

			var id = point0.id;
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
					this.hexagonals[h.cell].links[point0.id] = point0;
					this.hexagonals[h.cell].ids[point0.id] = point0.id;
				}

			}



			// linkMode = centered
			if(this.options.linkMode=="centered") {			
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


			// linkMode = straight
			if(this.options.linkMode=="straight") {			
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
		// #endregion


		// #######################################################
		// #region helpers
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
		getPixels_from_latlng: function getPixels_from_latlng(latlng, w, h, pad) {
			var p = this._map.latLngToContainerPoint([latlng.lat, latlng.lng]);
			pad = pad || 0;
			var visible = true;
			if (p.x < -pad || p.y < -pad || p.x > w+pad || p.y > h+pad) { visible = false; }
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
		_toObject: function _toObject(arr, id) {
			var obj = {};
			if(!Array.isArray(arr)) { return obj; }
			if(!arr.length) { return obj; }
			
			// if no id
			if(typeof id != "string") { 
				// if flat alphanumeric array
				if(typeof arr[0] == "string" || typeof arr[0] == "number") {
					for(var i=0;i<arr.length; i++) {
						obj[arr[i]] = arr[i];
					}
				}
				return obj; 
			}

			// if id
			for(var i=0;i<arr.length; i++) {
				if(arr[i][id]) {
					obj[arr[i][id]] = arr[i];
				}
			}
			return obj;
		},
		_genUID: function _genUID() {
			return (Date.now()&16777215) + "_" + Math.floor(Math.random() * 1000000); // string = uses 4.6 days worth of ms and 10^6 random
		},
		_genNr: function _genNr() {
			this._incNr++;
			return this._incNr;
		},
		_genId: function _genId() {
			this._incId++;
			return this._incId;
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
