# Leaflet.Hexagonal

![image](/assets/demo.jpg)


[Click here for a quick example](https://kaynut.github.io/Leaflet.Hexagonal/)
- [basic example](./exampleBasic.html)
- [manipulate options](./exampleOptions.html)
- [performance.html](./examplePerformance.html) 

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer, that takes 
- points (single, multiple or linked points) 
- geojson (Point, LineString, Feature, FeatureCollection),
- markers (images,svg)

and 

- clusters them - based on a hexagonal grid 
- links them up - based on supplied identifiers
- styles them - based on supplied metadata
- makes them interactive (highlight, select)



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

## Use cases
Developed to cluster sparse data (bounding-boxes of tracks) in a nice (hexagonal) manner, the layer evolved to kind of a "eierlegende Wollmilchsau" (direct translation from German would be something like "egg-laying wool-milk-sow"). Possible scenarios:
- Grant overview of sparse or highly detailed data
- Illustrate line-like features (tracks with fotos and icons)
- Select distinct data out of a large pile 


## Priorities
This layer was designed to be  
- easy to use out of then box and easy to adjust through options ([Options](#Options))
- customization-friendly: Lots of functions simply exist to be overwritten for specific needs ([Customization](#Customization))
- of reasonable performance: It should handle 10.000 points quite easly. (If you would dump a lot of the easy/friendly-stuff and took webgl for rendering, you could definitly improve performance a lot... but in this case performance  only comes in at third place. ([examplePerformance.html](https://kaynut.github.io/Leaflet.Hexagonal/examplePerformance.html))


## Options
Below, you find a list of options, that you can pass on initialisation - and most can be altered afterwards. Take a look at the exampleOptions.html
```html

hexagonVisible: true || false
hexagonSize: number || function(zoom) { return size; } 	
hexagonGap: pixels (difference between clustering-size and display-size of the hexagons) 
hexagonMode: "topFlat" || "topPointy"
hexagonFill: "color" || false
hexagonLine: "color" || false
hexagonLineWidth: pixels || false

colorStyle: "count" || "weight" || "point0" || false 
   (coloring for hexagon-clusters depends on point-count || sum of point.weight || first point metadata || default) 	
colorWeightProp: string
   (name of property in point-metadata, that should be used as weight)
colorRamp: [ "#color", "rgba(r,g,b)", [r,g,b,a],...]
   (an array of colors, defining the ramp for colorStyle=count and colorStyle=weight)
colorRampFallback: [ "#color", "rgba(r,g,b)", [r,g,b,a],...]

markerVisible: true || false
markerFill: "color" || false
markerLine: "color" || false
markerLineWidth: pixels
markerOpacity: number (0-1)


linkVisible: true || false
linkMode: "centered" || "straight" || "hexagonal" || false
   (how a link is drawn between two points)
linkForce: integer 
   (0=only adjacent points with same id get linked, 100= 100 points (with different id) may be added in the meantime)
linkReach: meters 
   (longest distance to be linked. controls how large of an area will be evaluated - for performance issues)
linkJoin: number 
   (0=gap between cell and line / 0.5= cell and line touch / 1=cellcenter and line fully joined)
linkFill: "color" || false
linkLine: "color" || false
linkLineWidth: pixels
linkLineBorder: pixels

selectionVisible: true || false
selectionFill: "color" || false
selectionLine: "color" || false
selectionLineWidth: pixels

infoVisible: true || false
infoMode: "count" || "ids" || "custom" || false
infoClassName: string || ""
infoItemsMax: number (max items shown explicitly in info)

```


## Customization

## License

[MIT](https://choosealicense.com/licenses/mit/)
