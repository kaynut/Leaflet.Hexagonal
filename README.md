# Leaflet.Hexagonal

Leaflet.Hexagonal is a Leaflet-canvas-layer, that...
- takes single points, lines or geojson
- clusters data based on hexagonal grid (if zoomed out)
- lines up connected data (if zoomed in)
- draws customizable, clickable hexagons
- highlights specific hexagons
- ...  


## Usage

```html
<link rel="stylesheet" href="./leaflet.hexagonal.css" />
<script src="./leaflet.hexagonal.min.js" />
```
<<<<<<< HEAD
=======


>>>>>>> 44b2f1ea4ce6c044b06362c8751828d7272ea77a

## Example
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1">
<<<<<<< HEAD
=======

>>>>>>> 44b2f1ea4ce6c044b06362c8751828d7272ea77a
    	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" integrity="sha256-kLaT2GOSpHechhsozzB+flnD+zUyjE2LlfWPgU04xyI=" crossorigin=""/>
    	<script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js" integrity="sha256-WBkoXOwTeyKclOHuWtc+i2uENFpDZ9YPdf5Hf+D7ewM=" crossorigin=""></script>

    	<link rel="stylesheet" href="./leaflet.hexagonal.css" />
    	<script src="./leaflet.hexagonal.min.js" />
	
    	<style>
		html, body { height: 100%; margin: 0; }
		.leaflet-container { height: 400px; width: 600px; max-width: 100%; max-height: 100%; }
	</style>
<<<<<<< HEAD
</head>
<body>
    	<div id="map" style="width: 600px; height: 400px;"></div>
    	<script>
		const map = L.map('map').setView([51.505, -0.09], 13);
		const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        	const hexagonals = L.hexagonals();	
=======

</head>
<body>

    	<div id="map" style="width: 600px; height: 400px;"></div>

    	<script>

		const map = L.map('map').setView([51.505, -0.09], 13);

		const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);

        	const hexagonals = L.hexagonals();	

>>>>>>> 44b2f1ea4ce6c044b06362c8751828d7272ea77a
    	</script>

</body>
</html>
```



## License

[MIT](https://choosealicense.com/licenses/mit/)
