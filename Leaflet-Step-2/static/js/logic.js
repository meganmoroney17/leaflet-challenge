var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Function to make the marker color based on magnitude.
function magnitudeColor(scale) {
  switch (scale) {
    case scale = -1:
      return "white";
    case scale = 0:
      return "#f3f7b5";
    case scale = 1:
      return "#faf732";
    case scale = 2:
      return "#ed9b0e";
    case scale = 3:
      return "#e36002";
    case scale = 4:
      return "#f71919";
    // case scale = 5:
    //   return "#ea822c";
    // case scale = 6:
    //     return "#ea822c";
    // case scale = 7:
    //     return "#ea822c";
    default:
      return "#780000";
  }
}

d3.json(queryUrl, function (data) {
  console.log("Earthquake data--> ", data);
  d3.json(platesUrl, function (pData) {
    console.log("Plate data--> ", pData);


    var earthquakes = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.circle(latlng, {
          radius: feature.properties.mag * 18000,
          fillColor: magnitudeColor(Math.floor(feature.properties.mag)),
          color: "#000",
          weight: 1,
          opacity: 0.5,
          fillOpacity: 1.0
        })
          .bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) +
            "</h3><hr><p>" + "Magnitude>>> " + feature.properties.mag + "</p>");
      }
    });

  // adding another geojson layer to show the faultlines
    var faultlines = L.geoJSON(pData, {
      style: function (feature) {
        return {
          color: "#ff9c2a",
          weight: 1.5
        }
      }
    });

  // satellite, light and outdoor layers

  var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
  });
 
    var lightMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY
    });

    var outdoorMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/outdoors-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
      });

  // basemaps for base layers
    var baseMap = {
      "Satellite": satelliteMap,
      "Light": lightMap,
      "Outdoor": outdoorMap
    };

    var overlayMaps = {
      FaultLines: faultlines,
      Earthquakes: earthquakes
    };

  // creating map 
    var myMap = L.map("map", {
      center: [
        39.8283, -98.5795
      ],
      zoom: 4,
      layers: [satelliteMap, faultlines, earthquakes]
    });

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (myMap) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

      // loop for intervals to get label with a colored square for each
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + magnitudeColor(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
    };

    legend.addTo(myMap);

    L.control.layers(baseMap, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  })

})


