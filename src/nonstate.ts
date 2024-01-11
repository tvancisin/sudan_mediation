import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import './css/style.css'
import {
    complete_width, simulation, nonstate_simulation, nonstate_zoom,
    nonstate_context, non_ticked, context_data, context_data_south,
    nonstate_svg, net_height, top_five_svg
} from "./variables"

let circle_scale = d3.scaleLinear()
    .range([5, 130])
    .domain([1, 130])

const nonstate_draw = function (data, years) {
    console.log(data,years);
    
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