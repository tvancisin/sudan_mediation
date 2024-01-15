import * as d3 from "d3";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { draw_bars } from "./bar_chart";
import { context_data } from "./variables";
// import { all_just_states } from "./main";
// import * as turf from '@turf/turf';

//-------------------------leaflet---------------------------------
//append leaflet map to div
let map = L.map('map', {
    maxZoom: 6,
    minZoom: 2,
    attributionControl: false,
    zoomDelta: 0.5,
    zoomSnap: 0.5
})
    .setView([25, 5], 2.5);
// map.setMaxBounds(map.getBounds());

// map.createPane('labels');
// map.getPane('labels').style.zIndex = 650;
// map.getPane('labels').style.pointerEvents = 'none';
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

map.zoomControl.setPosition('bottomright');
//empty geoJSON
let geojson = L.geoJSON(false).addTo(map)

//draw map function
const draw_map = function (years, data) {
    console.log(data);

    // restrict data to passed years
    let year_restriction = [];
    data.forEach(function (d) {
        let inv_number = 0;
        d[1].forEach(function (x) {
            if (x[1][0].year >= years[0] && x[1][0].year <= years[1]) {
                inv_number += 1
            }
        })
        if (inv_number >= 1) {
            let indi_year = {
                country: d[0],
                number: inv_number
            };
            year_restriction.push(indi_year)
        }
    })
    //getting names of current states
    let state_array = [];
    year_restriction.forEach(function (d) {
        state_array.push(d.country)
    })
    //clear the previous layer
    geojson.clearLayers()
    //filter geoJSON based on the array above and brushed years
    function geo_year_filter(feature) {
        if ((state_array.includes(feature.properties.ADMIN))) {
            return true
        }
    }
    //based on the involvement in peace processes color geoJSON polygons
    const find_iso = function (feature) {
        let filtered_obj = year_restriction.filter(obj => {
            return obj.country == feature
        })
        let intensity = filtered_obj[0].number;
        let color_scale = d3.scaleLinear().domain([0, 50]).range([0.2, 1])
        return color_scale(intensity);
    }
    //style for the map
    function style(feature) {
        let gradient = find_iso(feature.properties.ADMIN)
        if (feature.properties.ADMIN == "Sudan" || feature.properties.ADMIN == "South Sudan") {
            return {
                fillColor: "#fed800",
                weight: 0,
                color: '#fed800',
                fillOpacity: gradient
            };
        }
        else {
            return {
                fillColor: "white",
                weight: 0,
                fillOpacity: gradient
            };

        }
    }
    //highlight on hover
    function highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 1,
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

        map.flyToBounds(e.target.getBounds(), { duration: 0.5 });
        // map.fitBounds(e.target.getBounds());
        let country = e.target.feature.properties.ADMIN
        let country_in_array = data.find(function (d) {
            if (d[0] == country) {
                return true
            }
        });
        let ungroupped = [];
        country_in_array[1].forEach(function (m) {
            m[1].forEach(function (x) {
                ungroupped.push(x)
            })
        })
        console.log(ungroupped);
        draw_bars(ungroupped, context_data, "small", data, "state")

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

    geojson = new L.geoJSON(geo1, {
        filter: geo_year_filter,
        // filter: geo_filter,
        style: style,
        onEachFeature,
    });
    geojson.addTo(map);
}

export { map, draw_map }
