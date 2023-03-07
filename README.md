# Leaflet.Hexagonal

![image](/assets/demo.jpg)
[Click here for a quick example](https://kaynut.github.io/Leaflet.Hexagonal/)

<br>

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer, that takes 
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

## How to use Leaflet.Hexagonal
```html
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

               // init Leaflet
               var map = L.map('map').setView([65, -17], 13);
               var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);

               // init Leaflet.hexagonal
               var hexagonals = L.hexagonal().addTo(map);

               // add data
               hexagonals.addPoint({lng:-17.1, lat:65.1});

            </script>

         </body>
      </html>
```
## How to add/remove data
Depending on the kind and format of your data, you can choose betweem different functions for adding data. 
All of these function expect at least one parameter, containing the coordinate - in some way. 
```js
      // add a single point
      hexagonals.addPoint( [120,30] );
      hexagonals.addPoint({ lat: 31, lng: 121 });

      // add 2 points
      hexagonals.addPoints([ [122,32], [123,33] ],

      // add a line (linked points)
      hexagonals.addLine([ [124,34], [125,35], [126,36] ],

      // add a marker (with an image)
      hexagonals.addMarker( [127,37] , { image:"./assets/image0.jpg" });

      // add a marker (with an svg-icon)
      hexagonals.addMarker( [128,38] , { icon:"default" });

      // add line (four linked points) with style
      hexagonals.addGeojson("./assets/EUROPE5000.geojson");
```
Each of these functions accepts a second parameter: An object, containing various metadata for the point/points defined in the first parameter.

```js
      // add point with metadata
      hexagonals.addPoint( [122,32], {
         linked: false,
         fill: "#a00",
         group: "A",
         id: "a001",
         info: "Group A"
      });
```
Added data, qualified by 'group' or 'id', can removed with as follows
```js
      // remove point by id
      hexagonals.removeItem("a001"); // can be point or marker
      hexagonals.removePoint("a001"); // has to be point
      hexagonals.removeMarker("a001"); // has to be marker

      // remove group of points
      hexagonals.removeGroup("A");

      // remove all points
      hexagonals.removeAll();
```  
<br>

## How to change the appearance and behaviour
Apart from the default options of a canvas-layer, there are plenty of options, to change the appearance and behaviour to your needs. Those can be set on initiation or at a later point. [For a complete list of options see below](#options)

```js

   // set options on initiation
   var hexagonals = L.hexagonal({
      opacity:0.7,
      hexagonSize:16,
      hexagonMode:"flatTop"
   }).addTo(map);

   //... (e.g. adding data)

   // set options later on
   hexagonals.options.hexagonSize = 24;

```


## options
### hexagon options
```js
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
```        
### style options
```js
// styleFill: "color" || false
styleFill: "#fd1",
// styleStroke: "color" || false
styleStroke: "#303234", 	
// styleLineWidth: pixels
styleLineWidth: 1,
```  

|default layer options|type|default|description|
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
