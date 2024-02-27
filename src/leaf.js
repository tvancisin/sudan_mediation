import * as d3 from "d3";
// import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { draw_bars } from "./bar_chart";
import { context_data, zoom_level } from "./variables";
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

// //-------------------------leaflet
// //append leaflet map to div
// let map = L.map('map', {
//     maxZoom: 6,
//     minZoom: 2,
//     attributionControl: false,
//     zoomDelta: 0.5,
//     zoomSnap: 0.5
// })
//     .setView([25, 5], 2.5);
// // map.setMaxBounds(map.getBounds());

// // map.createPane('labels');
// // map.getPane('labels').style.zIndex = 650;
// // map.getPane('labels').style.pointerEvents = 'none';
// //load tiles
// L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//     maxZoom: 6,
// }).addTo(map);

// // L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}{r}.{ext}', {
// //     maxZoom: 6,
// // 	subdomains: 'abcd',
// //     pane: 'labels',
// //     ext: "png"
// // }).addTo(map)

// // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
// // 	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
// // 	subdomains: 'abcd',
// // 	maxZoom: 20
// // }).addTo(map)

// map.zoomControl.setPosition('bottomright');
// //empty geoJSON
// let geojson = L.geoJSON(false).addTo(map)

// --------------- mapbox

mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzaGFnYXJpYmFsZHkiLCJhIjoiY2xyajRlczBlMDhqMTJpcXF3dHJhdTVsNyJ9.P_6mX_qbcbxLDS1o_SxpFg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [4, 10],
    zoom: zoom_level,
    maxZoom: 5,
    minZoom: 1.5,
    attributionControl: false,
    projection: 'naturalEarth'
});

// const get_geo_data = () => {
//     return window.geo_data
// }

// const load_geo_data = async () => {
//     return new Promise((resolve) => {
//         let resolved = false;
//         setInterval(() => {
//             // console.log('.')
//             if (get_geo_data() != null && !resolved) {
//                 // console.log(window.geo_data)
//                 resolved = true;
//                 resolve();
//             }
//         }, 500)
//     })
// }

const on_map_load = (the_map, callback) => {
    if (the_map.loaded()) {
        callback()
    } else {
        the_map.on('load', callback);
    }
}

function init_map(callback) {

    on_map_load(map, () => {
        // console.log('..')

        // load_geo_data().then(() => {
        // const layers = map.getStyle().layers;
        // // Find the index of the first symbol layer in the map style.
        // let firstSymbolId;
        // for (const layer of layers) {
        //     if (layer.type === 'symbol') {
        //         firstSymbolId = layer.id;
        //         break;
        //     }
        // }
        map.addSource('states', {
            'type': 'geojson',
            'data': geo_data,
            'generateId': true //This ensures that all features have unique IDs
        });
        map.addLayer({
            'id': 'state-fills',
            'type': 'fill',
            'source': 'states',
            'layout': {},
            'paint': {
                'fill-color': "white"
                // [
                //     'case',
                //     ['==', ["get", "ADMIN"], "Sudan"],
                //     "#fed800",
                //     ['==', ["get", "ADMIN"], "South Sudan"],
                //     "#fed800",
                //     "white"
                // ],
            }
        },
            // firstSymbolId
        );
        map.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'states',
            'layout': {},
            'paint': {
                'line-color': 'black',
                'line-width': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    2,
                    0
                ],
            }
        });
        callback()

        // });
    });
}

let hoveredPolygonId = null;
let color_scale = d3.scaleLinear().domain([1, 30]).range([0.2, 1]);
let click_function, mousemove_function, mouseleave_function = null;
let sudans = [{
    'type': 'Sudan',
    'coordinates': [30.00919, 16.05325]
}, {
    'type': 'South Sudan',
    'coordinates': [30.34377, 7.263461]
}]
let dt;
const updateLayerFilter = (new_array, rest, data, year, complete_data) => {
    d3.selectAll(".marker").remove()
    if (data.length == 36){
        dt = [sudans[1]]
    }
    else if (data.length == 66){
        dt = sudans
    }
    else {
        dt = [sudans[0]]
    }

    for (const marker of dt) {
        const el = document.createElement('div');
        const width = 28;
        const height = 28;
        el.className = 'marker';
        el.style.backgroundImage = `url(pin.png)`;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;
        el.style.backgroundSize = '100%';
        el.style.cursor = "pointer"

        new mapboxgl.Marker(el)
            .setLngLat(marker.coordinates)
            .addTo(map);
    }

    // set opacity for polygons
    let opacity_match = [];
    rest.forEach(function (d) {
        opacity_match.push(d.country)
        opacity_match.push(color_scale(d.number))
    })
    //filter countries 
    map.setFilter('state-fills', ['in', 'ADMIN', ...new_array]);
    map.setPaintProperty('state-fills', 'fill-opacity', ['match', ['string', ['get', 'ADMIN']], ...opacity_match, 0])

    // mousemove
    if (mousemove_function != null) {
        map.off('mousemove', 'state-fills', mousemove_function)
    }
    mousemove_function = (e) => {
        map.getCanvas().style.cursor = 'pointer'
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState(
                    { source: 'states', id: hoveredPolygonId },
                    { hover: false }
                );
                map.setFeatureState(
                    { source: 'states', id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = e.features[0].id;
            map.setFeatureState(
                { source: 'states', id: hoveredPolygonId },
                { hover: true }
            );
        }

        let blong = rest.filter(obj => {
            return obj.country == e.features[0].properties.ADMIN
        })

        d3.select("#popup")
            .style("display", "block")
            .style("left", e.point.x + 30 + "px")
            .style("top", e.point.y - 25 + "px")
            .html(`<b>` + e.features[0].properties.ADMIN + `</b>` + `<br>` + "Mediations: " + blong[0].number)
    }
    //mouseleave
    if (mouseleave_function != null) {
        map.off('mouseleave', 'state-fills', mouseleave_function)
    }
    mouseleave_function = (e) => {
        d3.select("#popup")
            .style("display", "none")
        map.getCanvas().style.cursor = ''
        if (hoveredPolygonId !== null) {
            map.setFeatureState(
                { source: 'states', id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    }
    // click
    if (click_function != null) {
        map.off('click', 'state-fills', click_function)
    }
    click_function = (e) => {
        d3.selectAll(".pre, .p, .linkie").remove()
        let clicked_country = e.features[0].properties.ADMIN;
        let bound_box
        if (clicked_country == "Russia") {
            bound_box = [68.1434025400001, 86.74555084800015,
                97.36225305200006, 35.49540557900009]
        }
        else if (clicked_country == "United States of America") {
            bound_box = [-160.3688042289999, 34.546282924364334,
            -36.7005916009999, 32.71283640500015]
        }
        else if (clicked_country == "France") {
            bound_box = [-8.691314256999902, 40.909613348000065,
                12.771169467000021, 50.84788646]
        }
        else if (clicked_country == "Norway") {
            bound_box = [5.691314256999902, 60.909613348000065,
                20.771169467000021, 60.84788646]
        }
        else if (clicked_country == "United Kingdom") {
            bound_box = [-5.691314256999902, 45.909613348000065,
                1.771169467000021, 60.84788646]
        }
        else if (clicked_country == "Spain") {
            bound_box = [-15.16722571499986, 35.64223867400007,
                4.337087436000104, 43.79344310099999]
        }
        else if (clicked_country == "Portugal") {
            bound_box = [-25.16722571499986, 35.64223867400007,
                4.337087436000104, 43.79344310099999]
        }
        else if (clicked_country == "Netherlands") {
            bound_box = [5.521799927690466, 51.49522288100003,
                6.374525187000074, 51.49623769100013]
        }
        else {
            let countries = geo_data.features;
            let the_country = countries.find(function (d) {
                return d.properties.ADMIN == clicked_country
            })
            bound_box = turf.bbox(the_country);
        }

        map.fitBounds(bound_box, {
            padding: 100,
            center: turf.center(
                turf.points([
                    [bound_box[0] + 5, bound_box[1]],
                    [bound_box[2], bound_box[3]]
                ])
            ).geometry.coordinates
        });

        let country_in_array = data.find(function (d) {
            if (d[0] == clicked_country) {
                return true
            }
        });
        let first_involvement = country_in_array[1][0][1][0].year

        let ungroupped = [];
        country_in_array[1].forEach(function (m) {
            m[1].forEach(function (x) {
                ungroupped.push(x)
            })
        })
        draw_bars(ungroupped, context_data, "country", data, "bar", complete_data)

        d3.select("#country")
            .transition().duration(500)
            .style("right", 0 + "px")

        // populating country details
        let peace_agreements = 0;
        country_in_array[1].forEach(function (d) {
            if (d[1][0].peace_agreement !== "0") {
                peace_agreements += 1
            }
        })

        let just_mediation_numbers = []
        country_in_array[1].forEach(function (d) {
            just_mediation_numbers.push(d[0])
        })

        let partners = []
        complete_data.forEach(function (d) {
            if (just_mediation_numbers.includes(d.mediation_ID)
                && d.third_party !== e.features[0].properties.ADMIN
                && d.third_party_type != "state") {
                partners.push(d)
            }
        })
        let the_partners = d3.groups(partners, d => d.third_party, d => d.mediation_ID)
        let five = the_partners.sort((a, b) => b[1].length - a[1].length).slice(0, 5);

        // let all = [];
        // complete_data.forEach(function (d) {
        //     if (just_mediation_numbers.includes(d.mediation_ID)) {
        //         all.push(d)
        //     }
        // })
        // console.log(all);

        // d3.select("#country_net").on("click", function () {
        //     d3.selectAll("#net")
        //         .transition().duration(1000)
        //         .style("right", 0 + "px")
        //     data_sort(all, year)
        // })

        // title and years
        d3.select("#country_title")
            .html(clicked_country + `</br>` + `First Active:  ` + first_involvement)
        //top 5 
        d3.select("#med_top_cont").selectAll(".p")
            .data(five)
            .join("p")
            .attr("class", "p")
            .html(function (d) {
                return d[0] + ` (` + d[1].length + `)` + '</br>'
            })
        // list of mediations
        d3.select("#the_content")
            .selectAll(".pre")
            .data(country_in_array[1])
            .join("pre")
            .attr("class", "pre")
            .html(function (d) {
                return d[1][0].notes_1 + `<b style="color: steelblue;"> Source: (` + d[1][0].source_1 + `)</b>` + `</br>`
            })
            .style("color", function (d) {
                if (d[1][0].peace_agreement == "0") {
                    return "white"
                }
                else {
                    return "#fed800"
                }
            })

        let num_of_med = rest.filter(obj => {
            return obj.country == e.features[0].properties.ADMIN
        })
        d3.select("#med_title").html(`Mediation Events ` + num_of_med[0].number + ` <b style="color:#fed800;">(` + peace_agreements + ` Peace Agreements)</b>: `)

        const titleKeys = Object.keys(ungroupped[0])
        const refinedData = []
        refinedData.push(titleKeys)

        ungroupped.forEach(item => {
            refinedData.push(Object.values(item))
        })

        let csvContent = ''
        refinedData.forEach(row => {
            csvContent += row.join(',') + '\n'
        })

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8,' })
        const objUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.setAttribute('href', objUrl)
        link.setAttribute('class', "linkie")
        link.setAttribute('download', 'mediation.csv')
        link.textContent = 'Download Data'

        document.querySelector('#link').append(link)
    }

    map.on('click', 'state-fills', click_function)
    map.on('mousemove', 'state-fills', mousemove_function)
    map.on('mouseleave', 'state-fills', mouseleave_function)
};


//draw map function
const draw_map = function (years, data, complete_data) {
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

    updateLayerFilter(state_array, year_restriction, data, years, complete_data)



    // Leaflet Map
    // //clear the previous layer
    // geojson.clearLayers()

    // // restrict data to passed years
    // let year_restriction = [];
    // data.forEach(function (d) {
    //     let inv_number = 0;
    //     d[1].forEach(function (x) {
    //         if (x[1][0].year >= years[0] && x[1][0].year <= years[1]) {
    //             inv_number += 1
    //         }
    //     })
    //     if (inv_number >= 1) {
    //         let indi_year = {
    //             country: d[0],
    //             number: inv_number
    //         };
    //         year_restriction.push(indi_year)
    //     }
    // })
    // //getting names of current states
    // let state_array = [];
    // year_restriction.forEach(function (d) {
    //     state_array.push(d.country)
    // })
    // //filter geoJSON based on the array above and brushed years
    // function geo_year_filter(feature) {
    //     if ((state_array.includes(feature.properties.ADMIN))) {
    //         return true
    //     }
    // }
    // //based on the involvement in peace processes color geoJSON polygons
    // const find_iso = function (feature) {
    //     let filtered_obj = year_restriction.filter(obj => {
    //         return obj.country == feature
    //     })
    //     let intensity = filtered_obj[0].number;
    //     let color_scale = d3.scaleLinear().domain([0, 50]).range([0.2, 1])
    //     return color_scale(intensity);
    // }
    // //style for the map
    // function style(feature) {
    //     let gradient = find_iso(feature.properties.ADMIN)
    //     if (feature.properties.ADMIN == "Sudan" || feature.properties.ADMIN == "South Sudan") {
    //         return {
    //             fillColor: "#fed800",
    //             weight: 0,
    //             color: '#fed800',
    //             fillOpacity: gradient
    //         };
    //     }
    //     else {
    //         return {
    //             fillColor: "white",
    //             weight: 0,
    //             fillOpacity: gradient
    //         };

    //     }
    // }
    // //highlight on hover
    // function highlightFeature(e) {
    //     const layer = e.target;
    //     layer.setStyle({
    //         weight: 1,
    //         color: 'black',
    //         fillColor: 'red',
    //         fillOpacity: 0.5
    //     });
    //     layer.bringToFront();

    // }

    // function blargh(e) {
    //     let blong = data.filter(obj => {
    //         return obj[0] == e.target.feature.properties.ADMIN
    //     })

    //     d3.select("#popup")
    //         .style("display", "block")
    //         .style("left", e.containerPoint.x + 30 + "px")
    //         .style("top", e.containerPoint.y - 25 + "px")
    //         .html(`<b>` + e.target.feature.properties.ADMIN + `</b>` + `<br>` + "Mediations: " + blong[0][1].length)

    // }
    // //reset style on moveout
    // function resetHighlight(e) {
    //     geojson.resetStyle(e.target);

    //     d3.select("#popup")
    //         .style("display", "none")
    //     // info.update();
    // }
    // //zoom to country
    // function zoomToFeature(e) {
    //     map.flyToBounds(e.target.getBounds(), { duration: 0.5, padding: [100, 100] });
    //     // map.fitBounds(e.target.getBounds());
    //     let country = e.target.feature.properties.ADMIN
    //     let country_in_array = data.find(function (d) {
    //         if (d[0] == country) {
    //             return true
    //         }
    //     });
    //     let ungroupped = [];
    //     country_in_array[1].forEach(function (m) {
    //         m[1].forEach(function (x) {
    //             ungroupped.push(x)
    //         })
    //     })
    //     draw_bars(ungroupped, context_data, "small", data, "bar")
    // }

    // //set highlight and zoom functions for each polygon 
    // function onEachFeature(feature, layer) {
    //     // max_area_polygon;
    //     // max_area = 0;

    //     // for (poly in (feature.geometry.coordinates)) {
    //     //     polygon = turf.polygon((feature.geometry.coordinates)[poly])
    //     //     area = turf.area(polygon);

    //     //     if (area > max_area) {
    //     //         max_area = area
    //     //         max_area_polygon = polygon // polygon with the largest area
    //     //     }
    //     // }
    //     // center = turf.centerOfMass(max_area_polygon);

    //     layer.on({
    //         mouseover: highlightFeature,
    //         mousemove: blargh,
    //         mouseout: resetHighlight,
    //         click: zoomToFeature
    //     });
    // }

    // geojson = new L.geoJSON(geo1, {
    //     filter: geo_year_filter,
    //     // filter: geo_filter,
    //     style: style,
    //     onEachFeature,
    // });
    // geojson.addTo(map);
}

export { map, draw_map, init_map }
