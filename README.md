# Leaflet.Hexagonal

![image](/assets/demo.jpg)
[**Click here to see an example**](https://kaynut.github.io/Leaflet.Hexagonal/)

<br>

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer (composite-layer), that takes 
- **points** (single, multiple or linked points) 
- **lines** (array of array, array of latLng-objects)
- **geojson** (Point, LineString, Feature, FeatureCollection)
- **markers** (images or svg-icons)

and 

- **locates**, **clusters** them - based on a hexagonal grid 
- **links** them up - based on supplied identifiers
- **styles** them - based on supplied metadata
- makes them **interactive** (highlight, select via click/hover)

<br>

## Setup
Download this repository and add the links to **leaflet.hexagonal.js** and **leaflet.hexagonal.css** to your project - below the links to leaflet.js and leaflet.css.
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
Depending on the kind and format of your data, you can choose between different functions for adding data. The basic function for adding data is called ***addPoint(coordinates, metadata)***. All other functions internally use this one: They are just there to make unpacking, configuring and then adding your data a bit more convenient. Each of these functions takes one mandatory argument (***coordinates***) and one optional argument (***metadata***).
```js
// add a single point: using coordinate object {lat:y , lng:x } 
layer.addPoint( { lat: 31, lng: 121 } );

// add a single point: using coordinate object {lat:y , lon:x } 
layer.addPoint( { lat: 31, lon: 121 } );

// add a single point: using coordinate notation [longitude, latitude] 
layer.addPoint( [ 121, 31 ] ); // ATTENTION: order of arguments is [x,y]
                               // LIKE in geojson-standard / classic coordinate-systems 
                               // NOT LIKE in leaflet.js, where it is [y,x]

// add three points: points default to metadata.linked:false
layer.addPoints( [ [121,31], [122,32], [123,33] ] ),

// add a line: lines default to metadata.linked:true
layer.addLine( [ {lat: 31, lng: 121}, {lat: 32, lon: 122}, [123,33] ] ),

// add a geojson-file: geojson of type Point,Points,LineString,Feature,FeatureCollection
layer.addGeojson("./assets/EUROPE5000.geojson");

// add a geojson-object: geojson of type Point,Points,LineString,Feature,FeatureCollection
var geojson_obj = {"type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Point", "coordinates": [127, 37] } } ] };
layer.addGeojson(geojson_obj);
```
[**Click here to see an example**](https://codepen.io/kaynut/pen/vYzjgXm?editors=0010)

<br>

The functions addMarker(...), addIcon(...), addImage(...) work just like the above, but will create a Leaflet.divIcon, sitting ontop of the canvas layer, where all the other additions to this layer live. 

```js
// add an image: mandatory property 'image' takes a url
layer.addImage( [129,39] , { image: "./assets/image0.jpg" });
// add an image: mandatory property 'image' takes a dataUrl
layer.addImage( [131,41] , { image: "data:image/png;base64,..." });

// add an icon: mandatory property 'icon' takes a svg-string
layer.addIcon( [128,38] , { icon: '<svg xmlns="http://www.w3.org/2000/svg" ... </svg>"' });
// add an icon: mandatory property 'icon' takes an identifier of a previously cached icon
layer.cacheIcon("home",'<svg xmlns="http://www.w3.org/2000/svg" ... </svg>', 0.5);
layer.addIcon( [130,40] , { icon: "home" }); // 

// add an icon or image, depending on the property passed
layer.addMarker( [131,41] , { image: "data:image/png;base64,..." });
layer.addMarker( [130,40] , { icon: "home" });

``` 
[Click here to see an example](https://codepen.io/kaynut/pen/vYzjgXm?editors=0010)

<br>

### Metadata
The second argument is optional. It contains additional data for the supplied point/points. Data-properties needed for clustering-purposes also belong here: See 'altitude' and 'population' in the example - and watch for the possibility of **collisions** with default metadata-properties. 
|metadata|type|default|description|
|:--|:--|:--|:--|
|id|string|auto|a value identifing a single point. Used for example to remove this point|
|group|string|auto|a value to bind this point to a [new/existing] group of points|
|info|string|false|Info to be passed on selection|
|fill|color|false| Color, the point is drawn, if drawn on its own (not clustered,etc)|
|linked|boolean|false|whether point should be linked to previous point in group. addLine(...) and addGeojson(LineString) default to true|
|pointless|boolean|false|if point should be drawn. Using addMarker(...) defaults to true|
|marker|boolean|false|**Images** and **icons** default to true|
|image|string|false|**Images** only: Determines the image source. Can be a regular url or a dataUrl|
|icon|string|false|**Icons** only: Determines the icon source. Can be a svg-string or the name of a previously cached icon. See cacheIcon(...)|
|scale|number|1|**Icons** only: Determines the scaling of svg-icons|



```js
      // add point with metadata
      layer.addPoint( [121,31], {
         id: "a001",
         group: "A",
         info: "Group A",
         fill: "#a00",   
         linked: false,
         // cluster-properties                
         altitude: 4810,
         population: 1000000
      });
```

<br>

## Removing data
Added data, qualified by 'group' or 'id', can removed as follows: (Removing all points and adding the needed ones back may be a quite good option in some cases.)
```js
      // remove point by id
      layer.removeItem("a00"); // can be point or marker
      layer.removePoint("a00"); // has to be point
      layer.removeMarker("a00"); // has to be marker
      layer.removeIcon("a00"); // has to be marker
      layer.removeImage("a00"); // has to be marker

      // remove group of points
      layer.removeGroup("A");

      // remove all points
      layer.removeAll();
```  
<br>

## Concepts
### group
- A group ist not set explicitly. If you add a point, declaring a group, then from hereon the group exists. 
- You can add points to a group at any point in time - and add/remove other points in between. 
- Only points within a group can be linked.
- Removing a group, removes all containing points.
- You can assign a fillcolor to a group by **setGroupColor(groupName, color)**
- You can assign an info to a group by **setGroupInfo(groupName, info)** 
```js
layer.addPoint([120,30], { id:"A0", group: "A"}); // from hereon there exists a group called "A"
layer.addPoint([121,31], { id:"A1", group: "A"});
layer.setGroupColor( "A", "#f00" );
layer.setGroupInfo( "A", "Group A" );
layer.removeGroup("A");
```

### link
- A link is not set explicitly: If you add a point, declaring an already existing group and setting linked:true, a link will be added.
- A link reaches from a specific point (with: linked:true) to its group internal predecessor.
```js
layer.addPoint([120,30], { id:"A0", group: "A"});
layer.addPoint([121,31], { id:"B0", group: "B"});
layer.addPoint([122,32], { id:"A1", group: "A", linked:true }); // link > A1 back to A0 
```

### refresh
- There should be no cases, where it's nessesary to call **refresh()**.
- Every change you make to the data/appearance should automatically issue a refresh.
- Adding thousands of points individually should not be painful: The refreshing of the layer is debounced.
- If you have issues, where you think, the layer isn't updating properly, feel free to call refresh() as many times as you want.  
```js
for(var i=0; i<10000; i++) {
   layer.addPoint([120+i/1000,30]);
}
layer.refresh(); // !!! not nessesary at all

```

## Options
Apart from the default options of a canvas-layer (like: minZoom, maxZoom, opacity, etc), there are plenty of options, to change the appearance and behaviour of the layer. Those can be set on instantiation or (for nearly all) at some later point. <br>

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
|hexagonVisible|boolean|true|Whether or not hexagons should be visible|
|hexagonSize|pixels|16|Size in pixels of the hexagonal grid. Defines the smallest crossection of a hexagon in pixels.|
|hexagonSize|function||The size can also be given as a function (depending on the zoomlevel), returning a pixel-size. For example, if you want your hexagons not to shrink (in realworld area) beyond a certain zoomlevel, pass something like this: <br>``` hexagonSize: function(zoom) { return Math.max(16,Math.pow(2, zoom-6));```|
|hexagonGap|pixels|0|Visual gap between the cells of the hexagonal grid|
|hexagonOrientation|"flatTop"<br> "pointyTop"|"flatTop"|Orientation of the hexagonal grid. flatTop, meaning each hexagon has a horizontal line on its northern edge, is the default|

<br>

### style-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|fillColor|color|"#ffdd11"|Sets the default fillcolor for the hexagons and links|
|strokeColor|color|"#303234"|Sets the standard linecolor for the hexagons and links|
|borderWidth|pixels|1|Sets the width of the lines surrounding the hexagons and links|

<br>

### data-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|idProperty|string|"id"|Property in the metadata, to extract the id of a point from. If extraction fails, id is autogenerated.|
|groupProperty|string|"group"|Property in the metadata, to extract the group of a point from. If extraction fails, group is autogenerated.|
|groupDefault|string|false|Normally each point, that is not explicitly set to a group, is set to a new, autogenerated group. If you want all those points to belong to one specific group, pass a name for this group.| 
|dataProperties|array|["data"]|Determines the data-properties, that are imported on adding a point. Those property-names should point to numerical properties only. They can later be used for clustering and gathering info. <br>Best practise would be to set this array up, as soon and as with so many properties as you need: Points added before a later change may otherwise show default values - cause point-metadata is only imported directly on addition.|
|infoProperty|string|"info"|Property in the metadata, to extract the id of a point from. This should normally point to a property describing the point: for example the name of the point.| 

<br>

### marker-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|markerVisible|boolean|true|Whether markers (icons/images) should be visible|
|markerOpacity|number|0.9|Opacity of the Leafelt.groupLayer() every added marker automatically gets attached to.|

<br>

### link-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|linkVisible|boolean|true|Whether the links should be visible|	
|linkWidth|pixels|2|How thick the link-line should be. If options.borderWidth is set, this adds to this width of the link|
|linkFill|color, <br>boolean|true|Whether the link-line should have a fixed (color) or a adapted (boolean) colorfilling|	
|linkMode|"curve"<br> "spline"<br> "line"<br> "aligned"<br> "hexagonal"|"spline"|Determines the way the links are drawn. For better understanding, what each mode does, it's probably best to play around with them.|
|linkJoin|number|1| Determines from where to where the links are drawn: <br>0 = link starts at the following cell<br>0.5 = link starts midway<br>1 = link starts in the center of the cell itself|  
|linkReach|number|50000|Max distance (meter) beyond the viewport, for which links are calculated. If you're not missing any far reaching links, don't care about this one: It's a performance thing.|

<br>

### gutter-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|gutterFill|color, false|false|If you want hexagons, that don't contain any data, to be drawn, set a fillcolor for those|
|gutterStroke|color, false|false|If you want hexagons, that don't contain any data, to be drawn, set a linecolor for those|

<br>

### cluster-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|clusterMode|"count",<br>"sum","avg",<br>"min","max",<br>"first","last",<br>false|false|Determines the way the fillcolor of hexagons with multiple points is calculated. Clustering relies on a number of options, but mostly on the *dataProperties*, the *clusterProperty* and the *clusterColors*.|
|clusterProperty|property|"data"|Determines the name of the property, that is being used to calculate the fillcolor of the hexagon. Idealy the property should be present in each added point and must hold a numerical value.|
|clusterDefaultValue|number|0|If a point does not have the defined clusterProperty, it defaults to this value.|
|clusterMin|number|false|Defines the lower bound of the clustering-result.|
|clusterMax|number|false|Defines the upper bound of the clustering-result.|
|clusterScale|"linear",<br>"square",<br>"log"|"log"|Defines the scale used for interpolating colors between min and max. "square" standing for the square root, "log" standing for the natural logarithm.|
|clusterColors|array|["#4d4","#dd4",<br>"#d44","#800"]|Array of colors defines a color-ramp, which is used for color-interpolation during clustering.|

<br>

### selection-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|selectionVisible|boolean|true|Whether the selection should be visible.|
|selectionFillColor|color|"rgba(255,255,255,0.2)"|Fillcolor for the selection|
|selectionStrokeColor|color|"rgba(255,255,255,0.2)"|Strokecolor for the selection|
|selectionBorderWidth|pixels|2|Borderwidth for the selection|

<br>

### info-options
|<div style="min-width:150px">option</div>|<div style="min-width:100px">values</div>|<div style="min-width:100px">default</div>|<div style="min-width:300px">description</div>|
|:--|:--|:--|:--|
|infoVisible|boolean|true|Whether the info-overlay should be visible.|
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