import * as d3 from "d3";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
// import * as turf from '@turf/turf';

//-------------------------leaflet---------------------------------
//append leaflet map to div
let map = L.map('map', { 
    maxZoom: 6,
    attributionControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0.5
 })
.setView([25, 5], 2.5);
map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';
//load tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 6,
}).addTo(map);

// L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}', {
//     maxZoom: 6,
// 	subdomains: 'abcd',
//     pane: 'labels',
//     ext: "png"
// }).addTo(map)

// L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
// 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
// 	subdomains: 'abcd',
// 	maxZoom: 20
// }).addTo(map)

//attribution top left
// L.control.attribution({
//     position: 'bottomright'
// }).addTo(map);

map.zoomControl.setPosition('topright');
//empty geoJSON
let geojson = L.geoJSON(false).addTo(map)
//draw map function
const draw_map = function (value, data) {
    
    //getting names of current states
    let state_array = [];
    data.forEach(function (d) {
        state_array.push(d[0])
    })
    //clear the previous layer
    geojson.clearLayers()
    //filter geoJSON based on the array above and brushed years
    function geo_year_filter(feature) {
        if ((state_array.includes(feature.properties.ADMIN))
            && feature.properties.year <= value[1]
            && feature.properties.year >= value[0]) {
                // console.log(state_array, feature.properties.ADMIN, feature.properties.year, value );
                
            return true
        }
    }
    //based on the involvement in peace processes color geoJSON polygons
    const find_iso = function (feature) {
        let filtered_obj = data.filter(obj => {
            return obj[0] == feature
        })
        let intensity = filtered_obj[0][1].length;
        let color_scale = d3.scaleLinear().domain([0, 50]).range([0.2, 1])
        return color_scale(intensity);
    }
    //style for the map
    function style(feature) {
        let gradient = find_iso(feature.properties.ADMIN)
        if (feature.properties.ADMIN == "Sudan" || feature.properties.ADMIN == "South Sudan") {
            return {
            fillColor: "#fed800",
            weight: 1,
            color: '#fed800',
            fillOpacity: gradient
        };

        }
        
        return {
            fillColor: "white",
            weight: 0,
            color: 'black',
            fillOpacity: gradient
        };
    }
    //highlight on hover
    function highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: 'black',
            fillColor: 'red',
            fillOpacity: 0.5
        });
        layer.bringToFront();
        // info.update(layer.feature.properties);
    }
    //reset style on moveout
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
        // info.update();
    }
    //zoom to country
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

    //set highlight and zoom functions for each polygon 
    function onEachFeature(feature, layer) {
        // max_area_polygon;
        // max_area = 0;

        // for (poly in (feature.geometry.coordinates)) {
        //     polygon = turf.polygon((feature.geometry.coordinates)[poly])
        //     area = turf.area(polygon);

        //     if (area > max_area) {
        //         max_area = area
        //         max_area_polygon = polygon // polygon with the largest area
        //     }
        // }
        // center = turf.centerOfMass(max_area_polygon);



        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    }

    geojson = new L.geoJSON(geo_data, {
        filter: geo_year_filter,
        // filter: geo_filter,
        style: style,
        onEachFeature,
    });
    geojson.addTo(map);
}

export { map, draw_map }
