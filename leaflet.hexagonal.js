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

		options: {
			// container: auto generated
			container: document.createElement("CANVAS"),
			// zIndex of container
			zIndex: undefined,
			// opacity of container
			opacity: 1,
			// layer visible
			visible: !0,
			// layer visible beginning at zoomlevel
			minZoom: 0,
			// layer visible ending at zoomlevel
			maxZoom: 18,

			// size of hexagons
			hexagonSize: false, // set to false, if you want to set the size depending on Zoom
			// gap between hexagon-tiles (in pixels)
			hexagonGap:0,
			// if hexagon should be pointy on top (orientation of hexagon)
			hexagonMode: "topFlat", // "topPointy",
			// style hexagon
			hexagonFill: "#fd1", // "color", false
			hexagonLine: "#666", // color, false
			heagonLineWidth: 1,

			// if highlights should be shown
			highlightMode: true, // false, true
			// style highlight
			highlightFill: "rgba(0,0,0,0.4)", // "color", false
			highlightLine: false, // "color", false
			highlightLineWidth: 1,
			
			// if and how info should be kept on zoom 
			infoMode: "adaptOnZoom", //false, "clearOnZoom", "preserveOnZoom", "adaptOnZoom"
			infoClassName: "leaflet-hexagonal-marker-container",
			infoItemsMax: 5



		},
		initialize: function initialize(t) {
			e.setOptions(this, t),
				/* Built-in Date */
				e.stamp(this), this._map = undefined, this._container = undefined, this._bounds = undefined,
				this._center = undefined, this._zoom = undefined;
		},


		// #######################################################
		// props
		items: [],
		hexagonals: {},
		highlightIds: [],


		// #######################################################
		// built-in
		// lifecycle
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
			// Lifecycle mounted
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


		// #######################################################
		// items
		addItem: function addItem(latlng, id, meta) { // "id", {lng,lat}, {count,secs,dist,ts}
	
			if(typeof latlng != "object") {
				console.warn("hexagonal.addItem: latlng not valid", latlng);
			}
			latlng.lat = latlng.lat || 0;
			latlng.lng = latlng.lng || 0;

			if (typeof id != "number" && typeof id !="string") { id = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 100000); }

			meta = meta || {};


			var item = {
				id: id,
				latlng: latlng,
				count: meta.count || 0,
				secs: meta.secs || 0,
				dist: meta.dist || 0,
				weight: meta.weight || 0,
				ts: meta.ts || 0
			};

			this.items.push(item);


		},
		addItem_tiles15: function addItem_tiles15(tiles15, id, meta) { // "id", {"UxWd":{"count":105,"secs":1705,"dist":7694},....}
			if (typeof tiles15 == "string") {
				tiles15 = JSON.parse(tiles15);
			}
			if (typeof tiles15 != "object") {
				console.warn("hexagonal.addItem_tiles15: unknown format", tiles15);
				return;
			}

			if (typeof id != "number" && typeof id !="string") { id = "uid_" + Date.now() + "_" + Math.floor(Math.random() * 100000); }

			meta = meta || {};



			var keys = Object.keys(tiles15);
			for (var i = 0; i < keys.length; i++) {

				var bbox = this.getBbox_from_tile15(keys[i]);
				var latlng= { lng: (bbox[0]+bbox[2])/2, lat: (bbox[1]+bbox[3])/2 };

				var item = {
					id: id,
					latlng: latlng,
					count: meta.count || tiles15[keys[i]].count || 0,
					secs: meta.secs || tiles15[keys[i]].secs || 0,
					dist: meta.dist || tiles15[keys[i]].dist || 0,
					weight: meta.weight || tiles15[keys[i]].weight || 0,
					ts: meta.ts || tiles15[keys[i]].dist || 0
				};

				this.items.push(item);

			}

		},
		addGeojson: function addGeojson(g) {
			if(typeof g != "object" || typeof g.type != "string") { return 0; }
			if(g.type == "Point" && g.coordinates) {
				this.addItem({lng:g.coordinates[0],lat:g.coordinates[1]});
				return 1;
			}
			if(g.type == "MultiPoint" || g.type == "LineString") {
				var c = g.coordinates.length;
				for(var i=0; i<c; i++) {
					this.addItem({lng:g.coordinates[i][0],lat:g.coordinates[i][1]});
				}
				return c;
			}
			if(g.type == "MultiLineString") {
				var c = 0;
				for(var i=0; i<g.coordinates.length; i++) {
					var ci = g.coordinates[i];
					for(var j=0; j<ci.length; j++) {
						// properties
						this.addItem({lng:ci[j][0],lat:ci[j][1]});
						c++;
					}
				}
				return c;
			}
			if(g.type == "Feature") {
				return this.addGeojson(g.geometry);
			}
			if(g.type == "FeatureCollection") {
				var c = 0;
				for(var i=0; i<g.features.length; i++) {
					// properties
					c+= this.addGeojson(g.features[i].geometry);
				}
			}

			console.log("no valid data in geojson");
			return 0;

		},
		removeItem: function removeItem(id, refresh = true) {
			if(this.items.length<1) { return false; }
			if(typeof id != "number" && typeof id != "string") {
				return false;
			}

			for(var j=0; j<this.items.length; j++) {
				if(id===this.items[j].id) {
					this.items.splice(j, 1);
					if(refresh) {
						this.refresh();
					}
					return true;
				}
			}

			return false;
		},		
		clearItems: function clearItems(refresh) {
			var c = this.items.length;
			this.items = [];
			if(refresh) {
				this.refresh();
			}
			return c;
		},



		// #######################################################
		// draw
		refresh: function refresh() {
			this._update();
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


			// hexagonSize
			var hexagonSize = this.calcHexagonSize(zoom);


			// hexagonOffset 
			var nw = this._map.getBounds().getNorthWest();
			var hexagonOffset = this._map.project(nw, zoom);
			var hexagonGap = this.options.hexagonGap;


			// cluster hexagons
			this.hexagonals = {};
			for (var i = 0; i < this.items.length; i++) {

				var p = this.getPixels_from_latlng(this.items[i].latlng, w, h, hexagonSize);
				if (p.visible) {

					var h = this.calcHexagon(p.x,p.y,hexagonSize, hexagonOffset, hexagonGap)

					if(!this.hexagonals[h.grid]) {
						this.hexagonals[h.grid] = h;
						this.hexagonals[h.grid].items = {};
						this.hexagonals[h.grid].items[this.items[i].id] = this.items[i];

						var latlng = this._map.containerPointToLatLng([h.cx,h.cy]);
						this.hexagonals[h.grid].latlng = latlng;


					}
					else {
						this.hexagonals[h.grid].items[this.items[i].id] = this.items[i];
					}

				}

			}
		},
		_onDraw: function _onDraw() {

			this._preDraw();
			this.onDraw(this._container, this.hexagonals, this.highlightIds);
		},
		onDraw: function onDraw(canvas, hexagonals, highlightIds) {

			// canvasContext
			var ctx = canvas.getContext("2d");


			// draw hexagonals
			var hs = Object.keys(hexagonals);
			for (var h=0; h<hs.length; h++) {
				var hexa = hexagonals[hs[h]];
				this.drawHexagon(ctx, hexa);
			}


			// exit if no highlight
			if(!highlightIds.length || !this.options.highlightMode) {
				return;
			}


			// draw highlights
			for (var h=0; h<hs.length; h++) {
				var hexa = hexagonals[hs[h]];
				for(var i=0; i<highlightIds.length; i++) {
					var hl = highlightIds[i];
					if(hexa.items[hl]) {
						this.drawHighlight(ctx, hexa);
						break;
					}
				}
			}


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
		drawHighlight: function drawHighlight(ctx, hexagon) {
			var hPath = new Path2D(hexagon.path);

			if(this.options.highlightFill) {
				ctx.fillStyle = this.options.highlightFill;
				ctx.fill(hPath);
			}
			if(this.options.highlightLine) {
				ctx.strokeStyle = this.options.highlightLine;
				ctx.lineWidth = this.options.highlightLineWidth;
				ctx.stroke(hPath);
			}
		},




		// #######################################################
		// events
		_onClick: function _onClick(e) {

			var info = this.updateInfo(e.latlng);
			this.onClick(e,info);

		},
		onClick: function onClick(e,info) {
			
			return info;

		},
		_onMouseRest: function _onMouseRest(e) {
			var self = this;
			window.clearTimeout(self._onMouseRestDebounced_Hexagonal);
			self._onMouseRestDebounced_Hexagonal = window.setTimeout(function () {
				
				var info = self.getInfo_for_latlng(e.latlng);
				self.onMouseRest(info);

			}, 250);
		},
		onMouseRest: function onMouseRest(info) {
			//console.info("onMouseRest",info);
		},
		onZoomEnd: function onZoomEnd() {

			if(this.info) { 

				var zoom = this._map.getZoom();
				if(zoom<this.options.minZoom || zoom> this.options.maxZoom) { 
					this.hideInfo(); 
					return;
				}
				else {
					this.showInfo();
				}	
				

				if(this.options.infoMode=="adaptOnZoom") {
					this._preDraw();
					this.updateInfo(this.info.adapt);
				}
				else if(this.options.infoMode=="preserveOnZoom") {}
				else {
					this.info = false;
					this.setHighlight(false);
					this.setMarker(false);
				}

			}
		},



		// #######################################################
		// info
		updateInfo: function(latlng) {

			// if no latlng ==> clear
			if(!latlng || !this.options.infoMode) { 
				//console.info("updateInfo - clear");
				this.info = false;
				this.setHighlight(false);
				this.setMarker(false);
				return false; 
			}


			// get info
			var info = this.getInfo_for_latlng(latlng);
			

			// if no items got hit
			if(!info.items) {
				//console.info("updateInfo - no items", info);
				this.info = false;
				this.setHighlight(false);
				this.setMarker(false);
				return false;
			}


			// adapt
			info.adapt = info.items[Object.keys(info.items)[0]].latlng;

			// set marker
			this.setMarker(info);

			// set highlight
			var itemKeys = Object.keys(info.items);
			this.setHighlight(itemKeys);

			this.info = info;
			return true;

		},
		setMarker: function setMarker(info) {

			if(this.marker) {
				this._map.removeLayer(this.marker);
			} 

			if(!info) {
				return;
			}

			// convert items{} to items[]
			var items = this._toArray(info.items);

			var html = this.buildInfo(items);

			var iconHtml = document.createElement("DIV");
			iconHtml.className = "leaflet-hexagonal-marker leftTop";
			iconHtml.innerHTML = html;
			var icon = L.divIcon({
				iconSize:null,
				html: iconHtml,
				className: this.options.infoClassName
			});

			this.marker = L.marker(info.latlng, {icon: icon}).addTo(this._map);
			L.DomEvent.on(this.marker, 'mousewheel', L.DomEvent.stopPropagation);
			L.DomEvent.on(this.marker, 'click', L.DomEvent.stopPropagation);
		},
		buildInfo: function buildInfo(items) {
			var html = "";
			var more = "";
			var br = "";
			var maxItems = this.options.infoItemsMax;


			// if no itemInfo
			if(typeof this.itemInfo != "function") {
				return items.length;
			}


			// if too many items
			if(items.length>maxItems-2) {
				more = "<br><span style='float:right'>[" + (items.length - (maxItems - 2)) + " more]</span>"; 
			}
			maxItems = Math.min(items.length, maxItems-2);


			// build info from itemInfos
			for(var i=0;i<maxItems; i++) {
				html += br + this.itemInfo(items[i]);
				br = "<br>";
			}
			return html + more;
		},
		/*
		itemInfo: function itemInfo(item) {
			return item.id;
		},
		*/
		showInfo: function showInfo() {
			if(this.marker) {
				document.querySelector('.leaflet-hexagonal-marker-container').style.display="block";
			}
		},
		hideInfo: function hideInfo() {
			if(this.marker) {
				document.querySelector('.leaflet-hexagonal-marker-container').style.display="none";
			}
		},



		// #######################################################
		// highlight
		setHighlight: function setHighlight(ids) {
			if(!this.options.highlightMode) {
				return;
			}
			if(typeof ids == "string") {
				this.highlightIds = [ids];
			}
			else if(Array.isArray(ids)) {
				this.highlightIds = ids;
			}
			else {
				this.highlightIds = [];
			}

			this.refresh();
		},



		// #######################################################
		// hegagon
		calcHexagonSize: function calcHexagonSize(zoom) {
			if(this.options.hexagonSize) { return this.options.hexagonSize; }
			var size = 16;
			if(zoom>9) {
				size = Math.pow(2,zoom-5);
			}
			return size;
		},		
		calcHexagon: function calcHexagon(x,y, size, offset) { // hexagon top-flat
			if(this.options.hexagonMode == "topPointy") {
				return this.calcHexagon_topPointy(x,y, size, offset);
			}

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.73205081;        
			var t = Math.floor(ys + sqrt3 * xs + 1);
			var idy = Math.floor((Math.floor(2 * ys + 1) + t) / 3);
			var idx = Math.floor((t + Math.floor(-ys + sqrt3 * xs + 1)) / 3);
			var grid = (idx + "_" + idy); 
			var cy = (idy - idx/2) * size - offset.y;
			var cx = idx/2 * sqrt3 * size - offset.x;
			
			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2;
			var poly = [ 
			[cx-s2,cy],
			[cx-s4, cy-h],
			[cx+s4, cy-h],
			[cx+s2,cy],
			[cx+s4, cy+h],
			[cx-s4, cy+h],
			[cx-s2,cy]          
			];

			var path = "M"+(cx-s2)+" "+(cy) + " L"+(cx-s4)+" "+(cy-h) + " L"+(cx+s4)+" "+(cy-h) + " L"+(cx+s2)+" "+(cy) + " L"+(cx+s4)+" "+(cy+h) + " L"+(cx-s4)+" "+(cy+h) + "Z";

			return { grid:grid, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, poly:poly, path:path };
		},
		calcHexagon_topPointy: function calcHexagon_topPointy(x,y, size, offset) { // hexagon top-pointy

			offset = offset || {x:0,y:0};
			var gap = this.options.hexagonGap;
			var xs = (x+offset.x)/size;
			var ys = (y+offset.y)/size;
			var sqrt3 = 1.73205081;        
			var t = Math.floor(xs + sqrt3 * ys + 1);
			var idx = Math.floor((Math.floor(2 * xs + 1) + t) / 3);
			var idy = Math.floor((t + Math.floor(-xs + sqrt3 * ys + 1)) / 3);
			var grid = (idx + "_" + idy); 
			var cx = (idx-idy/2) * size - offset.x;
			var cy = idy/2 * sqrt3 * size - offset.y;

			var s0 = size - gap;
			var s2 = s0/sqrt3;
			var s4 = s2/2;
			var h = s0/2;
			var poly = [ 
			[cx,cy-s2],
			[cx-h, cy-s4],
			[cx-h, cy+s4],
			[cx,cy+s2],
			[cx+h, cy+s4],
			[cx+h, cy-s4],
			[cx,cy-s2]          
			];

			var path = "M"+(cx)+" "+(cy-s2) + " L"+(cx-h)+" "+(cy-s4) + " L"+(cx-h)+" "+(cy+s4) + " L"+(cx)+" "+(cy+s2) + " L"+(cx+h)+" "+(cy+s4) + " L"+(cx+h)+" "+(cy-s4) + "Z";

			return { grid:grid, idx:idx, idy:idy, cx:cx, cy:cy, px:x, py:y, poly:poly, path:path };
		},



		// #######################################################
		// helpers
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
		getInfo_for_latlng: function(latlng) {
			var wh = this._map.getSize();
			var zoom = this._map.getZoom();
			var size = this.calcHexagonSize(zoom);
			var nw = this._map.getBounds().getNorthWest();
			var offset = this._map.project(nw, zoom);
			var hexagonGap = this.options.hexagonGap;
			var p = this.getPixels_from_latlng(latlng, wh.w, wh.h, size);
			var h = this.calcHexagon(p.x,p.y,size, offset, hexagonGap);
			if(this.hexagonals[h.grid]) {
				return this.hexagonals[h.grid];
			}
			else {
				return false;
			}
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
			if(typeof id != "string") { return obj; }
			for(var i=0;i<arr.length; i++) {
				if(arr[i][id]) {
					obj[arr[i][id]] = arr[i];
				}
			}
			return obj;
		}


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
