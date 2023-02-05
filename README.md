# Leaflet.Hexagonal

![image](/examples/assets/demo.jpg)


[Click here for a quick demo... and the possiblity to play with some of its options](https://kaynut.github.io/Leaflet.Hexagonal/)

 

## What is Leaflet.Hexagonal
Leaflet.Hexagonal is a Leaflet-canvas-layer, that takes 
- single points, 
- lines,
- geojson,
- icons (svg)
- markers (images) 

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
<html lang="en">
<head>
   <meta name="viewport" content="width=device-width, initial-scale=1">

   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=" crossorigin=""/>
   <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js" integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=" crossorigin=""></script>

   <link rel="stylesheet" href="./leaflet.hexagonal.css" />
   <script src="./leaflet.hexagonal.min.js" />

   <style type="text/css">
      html, body { height: 100%; margin: 0; }
      .leaflet-container { height: 400px; width: 600px; max-width: 100%; max-height: 100%; }
   </style>

</head>

<body>

   <div id="map" style="width: 600px; height: 400px;"></div>

   <script type="text/javascript">

      const map = L.map('map').setView([51.505, -0.09], 13);

      const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);

      const hexagonals = L.hexagonals();	

   </script>

</body>
</html>
```



## License

[MIT](https://choosealicense.com/licenses/mit/)
