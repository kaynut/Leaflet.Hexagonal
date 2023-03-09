# Leaflet.Hexagonal

![image](/assets/demo.jpg)
[Click here for a quick example](https://kaynut.github.io/Leaflet.Hexagonal/)

[Click here for a jsfiddle](https://jsfiddle.net/badorties/5udqgs4c/27/)
<br>

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer (composite-layer), that takes 
- points (single, multiple or linked points) 
- lines (array of array, array of latLng-objects)
- geojson (Point, LineString, Feature, FeatureCollection)
- markers (images or svg-icons)

and 

- clusters them - based on a hexagonal grid 
- links them up - based on supplied identifiers
- styles them - based on supplied metadata
- makes them interactive (highlight, select via click/hover)

<br>

## Basic setup
```js
      <!DOCTYPE html>
      <html>
         <head>    
            <meta name="viewport" content="width=device-width, initial-scale=1">
            
            <!-- Leaflet -->
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=" crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js" integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=" crossorigin=""></script>
            
            <!-- Leaflet.hexagonal -->
            <link rel="stylesheet" href="./leaflet.hexagonal.css" />
            <script src="./leaflet.hexagonal.js" />
         
         </head>
         <body>

            <div id="map" style="width: 600px; height: 400px;"></div>
            
            <script type="text/javascript">

               // init Leaflet map
               var map = L.map('map').setView([65, -17], 13);
               var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);

               // init Leaflet.hexagonal layer
               var layer = L.hexagonal().addTo(map);

               // add data to layer
               layer.addPoint({lng:-17.1, lat:65.1});

            </script>

         </body>
      </html>
```

<br>

## Adding data 
Depending on the kind and format of your data, you can choose between different functions for adding data. The most basic function is called ***addPoint(coordinates, metadata)***. The other ones internally all use this one. They are just there to make unpacking, configuring and then adding your data a bit more straight forward. 
```js
      // add a single point
      layer.addPoint({ lat: 31, lng: 121 });

      // add 2 points
      layer.addPoints( [ [122,32], [123,33] ] ),

      // add a line (linked points)
      layer.addLine( [ [124,34], [125,35], [126,36] ] ),

      // add geojson-object
      var geojson_obj = {"type": "FeatureCollection", "features": [ { "type": "Feature", "properties": {}, "geometry": { "type": "Point",
         "coordinates": [127, 37] } } ] };
      layer.addGeojson(geojson_obj);

      // add geojson-file
      layer.addGeojson("./assets/EUROPE5000.geojson");

      // add an icon (with an svg-icon)
      layer.addIcon( [128,38] , { icon: "fallback" });

      // add an image (with an svg-icon)
      layer.addImage( [129,39] , { image: "./assets/image0.jpg" });

      // add a marker (with an svg-icon)
      layer.addMarker( [130,40] , { icon: "fackback" });

      // add a marker (with an image)
      layer.addMarker( [131,41] , { image: "./assets/image0.jpg" });
``` 

Each of those functions takes one mandatory argument (***coordinates***) and one optional argument (***metadata***)

```js
   // addFunction(   coordinates         ,   metadata       ) 
   layer.addPoint( { lat: 31, lng: 121 } , { fill: "#f00" } );
``` 
<br>

### Coordinates
There are three recognised coordinate-notations (see below). For data containing more than one point, use those notations inside an array. In case of geojson-data you have to stick to the geojson-convention. 
```js
   // object with lat, lng           
   { lat: 31, lng: 121 } 

   // object with lat, lon
   { lat: 31, lon: 121 }

   // array with at least two items, the first being longitude, the second latitude
   [ 121, 31 ]

   // array of coordinates
   [ {lat: 31, lng: 121} , {lat: 32, lon: 122} , [123,133] ]

   // geojson
   { type:"Point", "coordinates": [ 121, 31 ] }

```
<br>  

### Metadata
The second argument is optional. It contains additional data for the supplied point/points. 
|metadata|type|default|description|
|--|--|--|--|
|id|string|auto|a value identifing a single point. Used for example to remove this point|
|group|string|auto|a value to bind this point to a [new/existing] group of points|
|linked|boolean|false|whether point should be linked to previous point in group. addLine(...) and addGeojson(LineString) default to true|
|fill|color|options. hexagonFill| Color, the point is drawn, if drawn on its own (not clustered,etc)|
|info|string|false|Info to be passed on selection|
|pointless|boolean|false|if point should be drawn. Using addMarker(...) defaults to true|
|scale|number|1|Determines the scaling of svg-icons 

```js
      // add point with metadata
      layer.addPoint( [121,31], {
         linked: false,
         fill: "#a00",
         group: "A",
         id: "a001",
         info: "Group A"
      });
```

<br>

## Removing data
Added data, qualified by 'group' or 'id', can removed as follows. (Removing all points and adding the needed ones back may be a quite good option in some cases.)
```js
      // remove point by id
      layer.removeItem("a001"); // can be point or marker
      layer.removePoint("a001"); // has to be point
      layer.removeMarker("a001"); // has to be marker

      // remove group of points
      layer.removeGroup("A");

      // remove all points
      layer.removeAll();
```  
<br>

## Options
Apart from the default options of a canvas-layer (like: minZoom, maxZoom, opacity, etc), there are plenty of options, to change the appearance and behaviour of the layer. Those can be set on instantiation or (for nearly all) at some later point. 
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
|option|type|default|description|
|--|--|--|--|
|hexagonVisible|boolean|true|Whether or not hexagons should be visible|
|hexagonSize|pixels|16|Size in pixels of the hexagonal grid. Defines the smallest crossection of a hexagon in pixels.|
|hexagonSize|function||The size can also be given as a function (depending on the zoomlevel), returning a number. For example, if you want your hexagons not to shrink (in realworld area) beyond a certain zoomlevel, pass something like this: <br>``` hexagonSize: function(zoom) { return Math.max(16,Math.pow(2, zoom-6));```|
|hexagonGap|pixels|0|Visual gap between the cells of the hexagonal grid|
|hexagonOrientation|"flatTop", "pointyTop"|"flatTop"|Orientation of the hexagonal grid. flatTop, meaning each hexagon has a horizontal line on its northern edge, is the default|
|hexagonFill|color|"#ffdd11"|Sets the default fillcolor for the hexagons|
|hexagonStroke|color|"#303234"|Sets the standard linecolor for the hexagons|
|hexagonLineWidth|pixels|1|Sets the linewidth for the line surrounding the hexagons|

<br>

### marker-options
|option|type|default|description|
|--|--|--|--|
|markerVisible|boolean|true|Whether markers (icons/images) should be visible|
|markerOpacity|number|0.9|Opacity of markers|

<br>

### group-options
|option|type|default|description|
|--|--|--|--|
|groupDefault|string|false|Normally each point, that is not set to a group (via metadata), opens a new, autogenerated group. If you want all those points to belong to one specific group, pass a name for this group.| 

<br>

### link-options
|option|type|default|description|
|--|--|--|--|
|linkVisible|boolean|true|Whether the links should be visible|	
|linkWidth|pixels|2|How thick the link-line should be|
|linkFill|color boolean|true|Whether the link-line should have a fixed (color) or a adapted (boolean) colorfilling|	
|linkMode|"curve", "spline", "line", "aligned", "hexagonal"|"spline"|Determines the way the links are drawn. For better understanding, what each mode does, it's probably best to play around with them.|
|linkJoin|number|1| Determines from where to where the links are drawn: <br>0 = link starts at the following cell<br>0.5 = link starts midway<br>1 = link starts in the center of the cell itself|  
|linkReach|number|50000|longest distance (meter) outside the viewport links are calculated (If you're not missing any far away links, don't care about this one: It's a performance thing)|

<br>

### gutter-options
|option|type|default|description|
|--|--|--|--|
|gutterFill|color, false|false|If you want hexagons, that don't contain any data, to be drawn, set a fillcolor for those|
|gutterStroke|color, false|false|If you want hexagons, that don't contain any data, to be drawn, set a linecolor for those|

<br>

### cluster-options
|option|type|default|description|
|--|--|--|--|

<br>

### selection-options
|option|type|default|description|
|--|--|--|--|

<br>

### info-options
|option|type|default|description|
|--|--|--|--|

<br>

### layer-options
|option|type|default|description|
|--|--|--|--|
|visible|boolean|true|after init to be set by method: layer.setVisibility()|
|opacity|float|0.5|after init to be set by method: layer.setOpacity()|
|minZoom|float|0|minimal zoomlevel at which the layer is rendered|
|maxZoom|float|18|maximmal zoomlevel at which the layer is rendered|
|padding|float|0.1|amount of rendering beyond the viewport
|zIndex|integer|100| after init to be set by method: layer.setZIndex()|



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



## Customization

## License

[MIT](https://choosealicense.com/licenses/mit/)
