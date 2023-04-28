# Leaflet.Hexagonal

![image](/assets/demo.jpg)
[Click here to see an example](https://kaynut.github.io/Leaflet.Hexagonal/)
<br>
<br>
## Contents
- [What is Leaflet.Hexagonal](#what-is-leaflet-hexagonal)
- [Setup](#setup)
- Adding: [adding data](#adding-data) / [metadata](#metadata) / [removing data](#removing-data)
- Concepts: [group](#group) / [link](#link) / [refresh](#refresh) / [clustering](#clustering)
- Options: [hexagon](#hexagon-options) / [style](#style-options) / [data](#data-options) / [marker](#marker-options) / [link](#link-options) / [gutter](#gutter-options) / [cluster](#cluster-options) / [selection](#selection-options) / [info](#info-options) / [layer](#layer-options)
- [Customisation](#customisation)
- [Notes and License](#notes)


<br>

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer, that takes 
- **points** (single, multiple or linked points) 
- **markers** (images or svg-icons)
- **geojson** (Point, LineString, Feature, FeatureCollection)

and 

- **displays** them, **clusters** them - based on a hexagonal grid 
- **groups** them, **links** them, **styles** them - based on metadata
- **filters** them - based on conditions
- **selects and highlights** them - based on interaction 


<br>

## Setup
Download the repository and add the links to **leaflet.hexagonal.js** and **leaflet.hexagonal.css** to your project - below the links to leaflet.js and leaflet.css. (Leaflet version >1.0)
```html
<!DOCTYPE html>
<html>
<head>

   <!-- Leaflet -->
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
   <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
   
   <!-- Leaflet.Hexagonal -->
   <link rel="stylesheet" href="./leaflet.hexagonal.css" />
   <script src="./leaflet.hexagonal.js"></script>

</head>
<body>

   <!-- map container -->
   <div id="map" style="width: 600px; height: 400px;"></div>

   <script>
      
      // Leaflet map setup
      var map = L.map("map").setView({ lat: 47.5, lng: 10.5 }, 5);
      var tilesUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      var tilesAttr = `&copy; <a href="https://www.openstreetmap.org/copyright">
                       OpenStreetMap</a>contributors 
                       &copy; <a href="https://carto.com/attributions">CARTO</a>`;
      var tiles = L.tileLayer(tilesUrl, {attribution:tilesAttr} ).addTo(map);


      // Leaflet.hexagonal setup
      var layer = L.hexagonal().addTo(map);

      // add data to layer
      layer.addPoint({lng:10.5, lat:47.5});  
      
   </script>
</body>
</html>   
```
[**Click here to see an example**](https://codepen.io/kaynut/pen/vYzjgXm?editors=0010)

<br>

## Adding data 

Depending on the kind and format of your data, you can choose between different functions for adding data. The basic function for adding data is called ***addPoint(coordinates, metadata)***.
Functions like **addPoints(...)**, **addLine(...)** and **addGeojson(...)** are there to make unpacking, configuring and then adding your larger amounts of data a little bit more convenient.
Each of these functions takes one mandatory argument (***coordinates***) and one optional argument (***metadata***).
```js
// add a single point: using coordinate object {lat:y , lng:x } 
layer.addPoint( { lat: 31, lng: 121 } );

// add a single point: using coordinate object {lat:y , lon:x } 
layer.addPoint( { lat: 31, lon: 121 } );

// add a single point: using coordinate notation [longitude, latitude] // NOTE: order of arguments is [x,y]
layer.addPoint( [ 121, 31 ] ); 

// add three points: points default to metadata.link:false
layer.addPoints( [ [121,31], [122,32], [123,33] ] ),

// add a line: lines default to metadata.link:true
layer.addLine( [ {lat: 31, lng: 121}, {lat: 32, lon: 122}, [123,33] ] ),

// add a geojson-file via url: geojson of type Point,Points,LineString,Feature,FeatureCollection
layer.addGeojson("./assets/EUROPE5000.geojson");

// add a geojson-object: geojson of type Point,Points,LineString,Feature,FeatureCollection
var geojson_obj = {"type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [127, 37] } } ] };
layer.addGeojson(geojson_obj);
```
[Click here to see an example](https://codepen.io/kaynut/pen/vYzjgXm?editors=0010)

<br>

### Adding markers

The function **addMarker(...)** will add an image/icon and therefor needs a source, defined in the metadata-argument. 

```js
// add an image: mandatory property 'marker' takes a url
layer.addMarker( [129,39] , { marker: "./assets/image0.jpg" });

// add an icon: mandatory property 'marker' takes a url
layer.addMarker( [129,39] , { marker: "./assets/token.svg" });

// add an image: mandatory property 'marker' takes a dataUrl
layer.addMarker( [131,41] , { marker: "data:image/png;base64,..." });

// add an icon: mandatory property 'marker' takes a svg-string
layer.addMarker( [128,38] , { marker: '<svg xmlns="http://www.w3.org/2000/svg" ... </svg>"' });

``` 
[Click here to see an example](https://codepen.io/kaynut/pen/vYzjgXm?editors=0010)

<br>

### Metadata
The second argument is optional. It contains additional data for the supplied point/points. 
|metadata|type|default|description|
|:--|:--|:--|:--|
|id|string|increment|value identifing the point|
|group|string|'group'|name of the group the point should be bound to|
|name|string|''|value describing the point (for filtering, selection,...)|
|tags|string|''|value describing the point (for filtering, selection,...)|
|marker|string|false|image/icon-source in from of a url, data-url, svg-string|
|link|boolean, array|false|whether the point should be linked to previous point in the group<br> or to which indices in the group the point should be linked to|
|time|integer|0|unix-timestamp (millisecs) of the point|
|fill|color|false| individual fillcolor for the point (if not clustered,etc)|
|stroke|color|false| individual strokecolor for the point (if not clustered,etc)|
|scale|float|1| individual scaling factor for the point (if not clustered,etc)|

It's totally fine to pass custom properties (e.g: for clustering purposes). But be aware, that only properties with numerical values will be accessable later on. If you have to pass strings, use the properties 'name' and 'tags'. <br>
You can redirect the lookup of values by adding an additional property, defining the redirect. (For an example, see below. Works with every metadata-property: 'idProperty', 'groupProperty', 'fillProperty', ....)  

```js
// add point with metadata
layer.addPoint( [121,31], {
   id: "a001",
   group: "A",
   name: "Group A",
   fill: "#a00",   
   link: false,

   // custom properties for clustering   
   altitude: 4810,              
   population: 1000000,

   // redirect property from 
   ts:123456,
   timeProperty:"ts"
});
```
<br>

### Removing data
Added points, qualified by 'group' or 'id', can removed later - individually and at any time. Never the less: Removing all points (or groups) and adding back the needed ones may be more straight forward - in most cases.
```js
// add and remove single point by 'id'
layer.addPoint( [129,39] , { id:"A" });
layer.removePoint("A");

// remove a group of points
layer.addPoints( [ [121,31], [122,32], [123,33] ], { group:"B" } );
layer.removeGroup("B");

// remove all points in all groups
layer.removeAll();
```  
<br>

## Concepts
### group
- A group ist not set on its own. If you add a point, declaring a group, then from hereon the group exists. 
- You can add points to a group at any time - and add/remove other points in between. 
- Each point belongs to a group. If you don't declare a group, the point becomes part of a default group.
- Only points within a group can be linked ("connected with a line").
- Removing a group, removes all containing points.
- You can assign a style to a group by **setGroupStyle(groupName, style)**
- You can assign an info to a group by **setGroupName(groupName, name)**
- Groups (and there points) are drawn one after the other. The order, in which they are drawn can be altered by using **setGroupOrder(mode, groupName)**
```js
layer.addPoint([120,30], { id:"A0", group: "A" }); 
layer.addPoint([121,31], { id:"A1", group: "A" });
layer.addPoint([122,32], { id:"B1", group: "B" });
layer.setGroupColor( "A", {fill:"#f00"} );
layer.setGroupName( "A", "Group A" );
layer.setGroupOrder( "reverse" );
layer.setGroupOrder( "up","B" );
layer.removeGroup("A");
```
<br>

### link
- A link is a connection between two points in the same group, repesentend by a line - of some sort.
- A link is not set on its own: If you add a point, you can use **link:true** to connect this point to it's predecessor in the group. You can also use **link:[...]** to link this point to a specific point or a number of points: The Array has to consist of a number of indicies in this group.
```js
layer.addPoint([120,30], { id:"A0", group: "A"});
layer.addPoint([121,31], { id:"B0", group: "B"});
layer.addPoint([122,32], { id:"A1", group: "A", link:true });  // link: A1 to predecessor A0 
layer.addPoint([123,32], { id:"A2", group: "A", link:[0] });   // link: A2 to A0 
layer.addPoint([124,32], { id:"A3", group: "A", link:[0,1] }); // link: A3 to A0 and to A1
```
<br>

### refresh
- The function **refresh()** forces the layer to be reevaluated and redrawn.
- If you use the functions of plugin, there should be few cases, where it is nessesary to call **refresh()**: Every change you make to the data/appearance should automatically issue a refresh. 
- **refresh()** is debounced: If triggered repeatedly within a short amount of time (100ms), only the last call will trigger a refresh. 

```js
for(var i=0; i<10000; i++) {
   layer.addPoint([120+i/1000,30]);
   layer.refresh(); // not nessesary at all, but shouldn't harm performance too much
}
layer.refresh(); // !!! not nessesary

```
<br>

### clustering
The if and how of the data-clustering is handled by a number of [options](#clustering-options). The best way to get a grip on how clustering is implemented here, is probably to see it in action and to play with the options.
- [Clustering example](https://codepen.io/kaynut/pen/OJoQRGp?editors=0100)
- Clustering playground  
<br>

<br>

## Options
Apart from the default options of a canvas-layer (like: minZoom, maxZoom, opacity, etc), there are plenty of options, to change the appearance and behaviour of the layer. Those can be set on instantiation or (for nearly all) at some later point. 
<br>

```js
// set options on initiation
var layer = L.hexagonal({
   opacity:0.7,
   hexagonSize:16,
   hexagonMode:"flatTop"
}).addTo(map);

//... (e.g. adding data)

// set options later on
layer.options.hexagonSize = 24;
```
<br>

### hexagon-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|hexagonDisplay|boolean<br>{...}|true|Whether or not hexagons should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|
|hexagonSize|pixels|16|Size in pixels of the hexagonal grid. (Smallest crossection of a hexagon)|
|hexagonSize|function||The size can also be given as a function (depending on the zoomlevel), returning a pixel-size. For example, if you want your hexagons not to shrink (in realworld area) beyond a certain zoomlevel, pass something like this: <br>```hexagonSize: (z) => { return Math.max(16,Math.pow(2, z-6)); }```|
|hexagonGap|pixels|0|Visual gap between the cells of the hexagonal grid and the grid itself|
|hexagonOrientation|"flatTop"<br> "pointyTop"<br>"circle"|"flatTop"|Orientation of the hexagonal grid. "flatTop" means, each hexagon has a horizontal line on its northern edge. Compared to "flatTop", "pointTop" is rotated by 90°. "circle" is the other hand is a flatTop grid, but represented as packed circles|

<br>

### style-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|fillDefault|color|"#ffdd11"|Sets the default fillcolor for the hexagons and links. This color will only apply, if there is no point- or group-based coloring and there is no clustering going on. |
|strokeDefault|color|"#303234"|Sets the standard linecolor for the hexagons and links|
|borderDefault|pixels|1|Sets the width of the lines surrounding the hexagons and links|

<br>

### marker-options / thumb-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|markerDisplay|boolean<br>{...}|true|Whether or not markers should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|
|markerImageScaler|float|1.15|The amount a raster-image is scaled|
|markerIconScaler|float|0.7|The amount a vector-image is scaled|
|thumbFetchSize|pixels|128|Thumbsize in pixels for a marker-image or marker-icon|
|thumbImageTint|color|"303234"|Color to tint the raster-image with|
|thumbIconColor|color|"#303234"|Color to draw the vector-image with|

<br>

### link-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|linkDisplay|boolean<br>{...}|true|Whether or not links should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|	
|linkWidth|pixels|2|The thickness of the link-line|
|linkFill|color, <br>boolean|true|Whether the link-line should have a fixed (color) or a adapted (boolean) colorfilling|
|linkOpacity|float|1|The opacity of the link-lines|	
|linkMode|"curve"<br> "spline"<br> "line"<br> "aligned"<br> "hexagonal"|"spline"|Determines the way the links are drawn. For better understanding, what each mode does, it's probably best to play around with them.|
|linkJoin|number|1| Determines from where to where the links are drawn: <br>0 = link starts at the following cell<br>0.5 = link starts midway<br>1 = link starts in the center of the cell itself|  
|linkSelectable|boolean|true|Determines, if a link is selectable/clickable|

<br>

### gutter-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|gutterDisplay|boolean<br>{...}|false|Whether or not the gutter should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|
|gutterFill|color, false|false|If you want hexagons, that don't contain any data, to be drawn, set a fillcolor for those|
|gutterStroke|color, false|"#202224"|If you want hexagons, that don't contain any data, to be drawn, set a linecolor for those|

<br>

### cluster-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|clusterMode|"population",<br>"sum","avg",<br>"min","max",<br>false|false|Determines the way the fillcolor of hexagons with multiple points is calculated. Clustering relies on a number of options, but mostly on the *dataProperties*, the *clusterProperty* and the *clusterColors*.|
|clusterProperty|property|false|The name of the property in your data (passed to metadata), upon which the cluster-coloring will be calculated.|
|clusterDefaultValue|number|0|If a point does not have a value for the defined clusterProperty, it defaults to this value.|
|clusterMinValue|number|false|Defines the lower bound of the clustering-result.|
|clusterMaxValue|number|false|Defines the upper bound of the clustering-result.|
|clusterScale|"linear",<br>"sqrt",<br>"log"|"log"|Defines the scale used for interpolating colors between min and max. "sqrt" standing for the square root, "log" standing for the natural logarithm.|
|clusterColors|array|["#4d4","#dd4",<br>"#d44","#800"]|Array of colors, defining a color-ramp, which is used for color-interpolation during clustering.|

<br>

### selection-options / highlight-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|selectionMode|"point", "points"<br>"group", "groups"<br>"linked", "ids"|"group"|Determines the extend of a selection. A click on an hexagon could select the point ontop, all points, the group ontop, all groups or the group-points linked up to this point. <br>With the help of **setSelection(...)** it's also possible to select a list of points, via their ids.|
|selectionTolerance|pixels|4|The tolerance in pixels for a click to hit a certain object| 
|highlightDisplay|boolean<br>{...}|false|Whether or not the highlighting should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|
|highlightStrokeColor|color|"rgba(255,255,255)"|Strokecolor for the selection|
|highlightStrokeWidth|pixels|2|Borderwidth for the selection|

<br>

### info-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|infoDisplay|boolean<br>{...}|false|Whether or not the infobox should be displayed.<br>To limit the display to a zoomrange, pass { minZoom:x, maxZoom:y }|
|infoOpacity|float|0.9|Opacity of info-overlay.|
|infoClassName|css-class|"leaflet-hexagonal-<br>info-container"|Classname for the info-overlay|


<br>

### layer-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|visible|boolean|true|after init to be set by method: layer.setVisibility()|
|opacity|float|0.5|after init to be set by method: layer.setOpacity()|
|minZoom|float|0|minimal zoomlevel at which the layer is rendered|
|maxZoom|float|18|maximmal zoomlevel at which the layer is rendered|
|padding|float|0.1|amount of rendering beyond the viewport
|zIndex|integer|100| after init to be set by method: layer.setZIndex()|

<br>




## Customisation
For easy customisation, there are several functions in this plugin, that are meant to be overridden.
- buildInfo
- onClick
- onRest

<br>


## Use cases
Developed to cluster sparse data (bounding-boxes of tracks) in a nice (hexagonal) manner, the layer evolved to kind of a "eierlegende Wollmilchsau" (direct translation from German would be something like "egg-laying wool-milk-sow"). Possible scenarios:
- Grant overview of sparse or highly detailed data
- Illustrate line-like features (tracks with fotos and icons)
- Select distinct data out of a large pile 


## Priorities
This layer was designed to be  
- easy to use out of then box and easy to adjust through options ([Options](#ptions))
- customization-friendly: Lots of functions simply exist to be overwritten for specific needs ([Customization](#Customization))
- of reasonable performance: It should handle 10.000 points quite easly. (If you would dump a lot of the easy/friendly-stuff and took webgl for rendering, you could definitly improve performance a lot... but in this case performance  only comes in at third place. ([examplePerformance.html](https://kaynut.github.io/Leaflet.Hexagonal/examplePerformance.html))




## License

[MIT](https://choosealicense.com/licenses/mit/)


## Examples

### Boilerplate
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Leaflet -->
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
	<script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>

    <!-- Leaflet.Hexagonal -->  
	<link rel="stylesheet" href="./leaflet.hexagonal.css" />
	<script src="./leaflet.hexagonal.js"></script>

    <!-- styles -->
	<style type="text/css">
		html,body { position: absolute;left: 0; top: 0; right: 0; bottom: 0; margin: 0;	}
		.leaflet-container { height: 100%; width: 100%; opacity: 0.9; }
	</style>

</head>

<body>
	<div id="map"></div>
	<script>

		// map
		var map = L.map('map').setView({ lat: 47.5, lng: 10.5 }, 6);
		var tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>', subdomains: 'abcd', maxZoom: 20 }).addTo(map);

		// hexagonals
		var hexagonals = new L.Hexagonal().addTo(map);

		// add single point
		hexagonals.addPoint({ lat: 47.5, lng: 10.5 });

	</script>
</body>
</html>
```


## Contents
- [What is Leaflet.Hexagonal](#what-is-leaflet-hexagonal)
- [Setup](#setup)
- [Adding data](#adding-data)
   - [coordinates](#coordinates)
   - [metadata](#metadata)
- [Removing data](#removing-data)
- [Options](#options)
   - [hexagon options](#hexagon-options)
   - [style options](#style-options)
   - [marker options](#marker-options)
   - [link options](#link-options)
   - [gutter options](#gutter-options)
   - [cluster options](#cluster-options)
   - [selection options](#selection-options)
   - [info options](#info-options)
   - [layer-options](#layer-options)
- [Demos](#demos)
- [Use cases](#use-cases)
- [Priorities](#priorities)
- [License](#license)



### data-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|idProperty|string|"id"|Property in the metadata, to extract the id of a point from. If extraction fails, id is autogenerated.|
|groupProperty|string|"group"|Property in the metadata, to extract the group of a point from. If extraction fails, group is autogenerated.|
|groupDefault|string|false|Normally each point, that is not explicitly set to a group, is set to a new, autogenerated group. If you want all those points to belong to one specific group, pass a name for this group.| 
|dataProperties|array|["data"]|Determines the data-properties, that are imported on adding a point. Those property-names should point to numerical properties only. They can later be used for clustering and gathering info. <br>Best practise would be to set this array up, as soon and as with so many properties as you need: Points added before a later change may otherwise show default values - cause point-metadata is only imported directly on addition.|
|infoProperty|string|"info"|Property in the metadata, to extract the id of a point from. This should normally point to a property describing the point: for example the name of the point.| 

<br>
