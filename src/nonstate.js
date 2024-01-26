import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import './css/style.css';
import { draw_bars } from "./bar_chart";
import {
    nonstate_simulation, nonstate_context, non_ticked, context_data
} from "./variables"

let circle_scale = d3.scaleLinear()
    .range([5, 130])
    .domain([1, 130])

const nonstate_draw = function (data, years, complete_data) {
    console.log(data, complete_data);
    // restrict to the passed years
    let restrict_by_years = data.filter(function (d) {
        if (d.year >= years[0] && d.year <= years[1]) { return d }
    })
    // group by organization
    let group_data = d3.groups(restrict_by_years, d => d.third_party, d => d.mediation_ID);
    // create objects for individual organizations with type and locale
    let individual_org = [];
    group_data.forEach(function (m) {
        individual_org.push({
            id: m[0],
            weight: m[1].length,
            type: m[1][0][1][0].third_party_type,
            locale: m[1][0][1][0].third_party_locale
        })
    })
    // keep old nodes
    const old = new Map(nonstate_context.node.data().map(d => [d.id, d]));
    let nodes = individual_org.map(d => ({ ...old.get(d.id), ...d }));
    // sort nodes by size
    nodes = nodes.sort(function (a, b) { return b.weight - a.weight; });
    //adjust simulation
    nonstate_simulation.nodes(nodes);
    nonstate_simulation.force('collision', d3.forceCollide().radius(function (d) {
        return circle_scale(d.weight);
    }))
    nonstate_simulation.alpha(1).restart().tick();
    non_ticked(); // render now!
    // draw nodes
    nonstate_context.node = nonstate_context.node
        .data(nodes, d => d.id)
        .join("circle")
        .style("fill", function (d) {
            console.log(d);
            // return "white"
            if (d.type == "global") {
                return "#ffe241"
            }
            else if (d.type == "regional") {
                return "#dd1e37"
            }
            else if (d.type == "nonstate") {
                return "#ab4298"
            }
        })
        .attr('r', function (d) {
            return circle_scale(d.weight);
        })
        .attr('cx', function (d) {
            return d.x
        })
        .attr('cy', function (d) {
            return d.y
        })
        .on("click", function (i, d) {
            console.log(d, group_data);
            let clicked_country = d.id;

            d3.select("#country")
                .transition().duration(500)
                .style("right", 5 + "px")

            // title and years
            d3.select("#country_title")
                .html(clicked_country + `</br>` + years[0] + ` - ` + years[1])

            let country_in_array = group_data.find(function (d) {
                if (d[0] == clicked_country) {
                    return true
                }
            });

            let ungroupped = [];
            country_in_array[1].forEach(function (m) {
                m[1].forEach(function (x) {
                    ungroupped.push(x)
                })
            })
            
            draw_bars(ungroupped, context_data, "country", data, "bar", complete_data)

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
                    && d.third_party !== clicked_country
                    && d.third_party_type == "state") {
                    partners.push(d)
                }
            })
            let the_partners = d3.groups(partners, d => d.third_party, d => d.mediation_ID)
            let five = the_partners.sort((a, b) => b[1].length - a[1].length).slice(0, 5);

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

            let num_of_med = group_data.filter(obj => {
                return obj[0] == clicked_country
            })
            console.log(num_of_med);
            d3.select("#med_title").html(`Mediation Events ` + num_of_med[0][1].length + ` <b style="color:#fed800;">(` + peace_agreements + ` Peace Agreements)</b>: `)




        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        )
    // draw text
    nonstate_context.text = nonstate_context.text
        .data(nodes, d => d.id)
        .join("text")
        .text(function (d) {
            if (d.weight >= 3) {
                return d.id
            }
        })
        .attr("class", "nodename")
        .style('opacity', 0.8)
        // .attr("dx", 15)
        // .attr("dy", ".35em")
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("paint-order", "stroke")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
    // dragging functions
    function dragstarted(event, d) {
        if (!event.active) nonstate_simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
        d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
        d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
    }
    //When the drag gesture starts, the targeted node is fixed to the pointer
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    //the targeted node is released when the gesture ends
    function dragended(event, d) {
        if (!event.active) nonstate_simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        // console.log("dataset after dragged is ...", dataset);
    }
}

export { nonstate_draw }