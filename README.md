# Leaflet.Hexagonal

![image](/examples/assets/demo.jpg)


[Click here for a quick demo... and the possiblity to play with some of its options](https://kaynut.github.io/Leaflet.Hexagonal/)



## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer, that takes 
- points (single, multiple or linked points) 
- geojson (Point, LineString, Feature, FeatureCollection),
- marker (images,svg)


and 

- clusters them (based on a hexagonal grid) 
- links them up (based on supplied identifiers)
- styles them (by supplied data)
- make them interactive (highlight, select)




## How to use Leaflet.Hexagonal

```html
<link rel="stylesheet" href="./leaflet.hexagonal.css" />
<script src="./leaflet.hexagonal.min.js" />
```


## Example
```html
<!DOCTYPE html>
<html>
   <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">

      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=" crossorigin=""/>
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js" integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=" crossorigin=""></script>

      <link rel="stylesheet" href="./leaflet.hexagonal.css" />
      <script src="./leaflet.hexagonal.min.js" />

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
- cluster 
- tracks


## Priorities
This layer was designed  
- to be easy to use (out of the box)
- to be pretty friendly for customisation: Lots of functions a
- to have a reasonably performance. 

## License

[MIT](https://choosealicense.com/licenses/mit/)
