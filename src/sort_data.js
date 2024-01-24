import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import { update_net } from "./network";

//creating nodes and links for network
//global dataset changes based on data_sort
let dataset = {};

const data_sort = function (data, years) {
    // filter by years 
    let year_sudan = data.filter(function (d) {
        return d.year >= years[0] && d.year <= years[1]
    });
    //construct network data
    let sudan_network = d3.groups(year_sudan, d => d.third_party, d => d.mediation_ID);
    // let sudan_network = s_network.slice(0, 50)
    //comapre arrays
    const compare = function (a1, a2) {
        return a1.reduce((a, c) => a + a2.includes(c), 0);
    };
    //creating a source-target-value object
    let actor_connections = [];
    let counter = 0;
    for (let i = 0; i < sudan_network.length; i++) {
        for (let j = i + 1; j < sudan_network.length; j++) {
            let first_array = [],
                second_array = [],
                src = sudan_network[i][0],
                trg = sudan_network[j][0];

            sudan_network[i][1].forEach(function (b) {
                first_array.push(b[0])
            })
            sudan_network[j][1].forEach(function (p) {
                second_array.push(p[0])
            })
            let connections = compare(first_array, second_array)
            if (connections !== 0) {
                counter += 1;
                actor_connections.push({
                    index: counter,
                    source: src,
                    target: trg,
                    value: connections
                })
            }
        }
    }
    //creating object with individual actors
    let individual_actors = [];
    sudan_network.forEach(function (n) {
        // console.log(n[1][0][1][0].third_party_type);
        individual_actors.push({
            id: n[0],
            type: n[1][0][1][0].third_party_type,
            locale: n[1][0][1][0].third_party_locale
        })
    })
    //combining individual actors object with connections object
    dataset = {
        nodes: individual_actors,
        links: actor_connections
    };
    //draw network
    update_net(dataset, "update");
}

export { data_sort }