import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import $ from "jquery";

//set margins height and width
const margin = { top: 10, right: 20, bottom: 5, left: 20 },
    complete_width = window.innerWidth,
    complete_height = window.innerHeight,
    width = window.innerWidth - margin.left - margin.right,
    net_width = window.innerWidth / 2 - margin.left - margin.right - 10,
    net_height = window.innerHeight - margin.top - margin.bottom - 10,
    bar_height = 140 / 1.5 - margin.top - margin.bottom,
    full_bar_height = 140 - margin.top - margin.bottom,
    height = 130 - margin.top - margin.bottom;

d3.select("#net").style("right", - complete_width + "px")
d3.select("#country").style("height", net_height - 180 + "px")
d3.select("#the_content").style("height", net_height - 430  + "px")

d3.select("#nonstate")
    .style("left", - complete_width + "px")
    .style("width", complete_width + "px")
    .style("height", complete_height + "px")

//set map width
$("#map").width(complete_width)
let slide = document.getElementById('myRange');

//------------------ NONSTATE-----------------------

const nonstate_zoom = d3.zoom()
    .on('zoom', (event) => {
        net_svg.attr('transform', event.transform);
    })
    .scaleExtent([0.5, 3]);

const nonstate_svg = d3.select("#nonstate")
    .append("svg")
    .attr("width", complete_width)
    .attr("height", net_height + margin.top + margin.bottom)
    .attr("style", "max-width: 100%; height: auto;")
    .call(nonstate_zoom)
    .append("g")

let nonstate_node = nonstate_svg.append("g")
    .selectAll("circle");
let nonstate_text = nonstate_svg.append("g")
    .selectAll("text")

function non_ticked() {
    nonstate_context.node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    nonstate_context.text.attr("x", d => d.x)
        .attr("y", d => d.y);
}

let nonstate_simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody().strength(-20))
    .force("forceX", d3.forceX().x(complete_width * .5))
    .force("forceY", d3.forceY().y(complete_height * .5))
    // .force('x', d3.forceX().x(function (d) {
    //     if (d.type == "global") {
    //         return complete_width / 2
    //     }
    //     else if (d.type == "regional") {
    //         return complete_width / 2 - 120
    //     }
    //     else if (d.type == "nonstate") {
    //         return complete_width / 2 + 120
    //     }
    // }))
    // .force('y', d3.forceY().y(function (d) {
    //     if (d.type == "global") {
    //         return complete_height / 2 - 80
    //     }
    //     else if (d.type == "regional") {
    //         return complete_height / 2 + 80
    //     }
    //     else if (d.type == "nonstate") {
    //         return complete_height / 2 + 80
    //     }
    // }))
    .force("center", d3.forceCenter(complete_width / 2, net_height / 2))
    .on('tick', non_ticked);

const nonstate_context = {
    node: nonstate_node,
    text: nonstate_text
}

const top_five_svg = d3.select("#collab")
    .append("svg")
    .attr("width", 200 + "px")
    .attr("height", 130 + "px")
    .append("g")


//---------------------network------------------------------------
//zooming and panning for the network
const zoom = d3.zoom()
    .on('zoom', (event) => {
        net_svg.attr('transform', event.transform);
    })
    .scaleExtent([0.5, 3]);
//append svg to dataviz div 
const net_svg = d3.select("#net")
    .append("svg")
    .attr("width", complete_width)
    .attr("height", net_height + margin.top + margin.bottom)
    .attr("style", "max-width: 100%; height: auto;")
    .call(zoom)
    .append("g")
//position nodes and links
function ticked() {
    context.node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
    context.link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    context.text.attr("x", d => d.x - 5)
        .attr("y", d => d.y + 5);
}
var rscale = d3.scaleLinear()
    .range([1, 20])
    .domain([1, 40])
//create a simulation for an array of nodes, and compose the desired forces.
let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(complete_width / 2, complete_height / 2))
    .force('collision', d3.forceCollide().radius(function (d) {
        return rscale(d.weight);
    }))
    .force('x', d3.forceX().x(function (d) {
        if (d.locale == "western") {
            return 10
        }
        else if (d.locale == "african") {
            return 10
        }
        else if (d.locale == "international") {
            return width
        }
        else if (d.locale == "nonwestern") {
            return width
        }
    }))
    .force('y', d3.forceY().y(function (d) {
        if (d.locale == "western") {
            return 80
        }
        else if (d.locale == "african") {
            return net_height
        }
        else if (d.locale == "international") {
            return 50
        }
        else if (d.locale == "nonwestern") {
            return net_height
        }
    }))
    .on("tick", ticked);
//prepare initial links 
let link = net_svg.append("g")
    .selectAll("line");
//prepare initial nodes 
let node = net_svg.append("g")
    .selectAll("circle");
//prepare initial texts
let text = net_svg.append("g")
    .selectAll("text")
//variable to use with ts
const context = {
    link: link,
    node: node,
    text: text
}


//----------------timeline----------------
//append the svg object to the body of the page
//triangle for timeline selector
let triangle = d3.symbol()
    .size(80)
    .type(d3.symbolTriangle)
//snap selection to exact year if line in middle of rect
let snappedSelection = function (bandScale, domain) {
    const min = d3.min(domain),
        max = d3.max(domain);
    return [bandScale(min), bandScale(max) + bandScale.bandwidth()]
}
const bar_svg = d3.select("#bar")
    .append("svg")
    .attr("class", "bar_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", full_bar_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(20,10)`);
//historical events data
const context_data = [{ year: 2003, text: "Darfur War" }, { year: 2005, text: "The Comprehensive Peace Agreement" },
{ year: 2011, text: "South Sudan Independence" }, { year: 2013, text: "South Sudan Civil War" },
{ year: 2019, text: "Ouster of Omar al-Bashir" }, { year: 2021, text: "Sudanese Coup D'état" }]
const context_data_south = [{ year: 2011, text: "South Sudan Independence" }, { year: 2013, text: "South Sudan Civil War" },
{ year: 2019, text: "Ouster of Omar al-Bashir" }, { year: 2021, text: "Sudanese Coup D'état" }]
//x scaling
const bar_x = d3.scaleBand()
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.4)
    .align(0.5)
const bar_x_axis = d3.axisBottom(bar_x);
bar_svg.append("g")
    .attr("class", "myXaxis")
//y scaling
const bar_y = d3.scaleLinear()
    .domain([0, 280])
const bar_y_axis = d3.axisLeft(bar_y).tickSize(-width).ticks(3);
bar_svg.append("g")
    .attr("class", "myYaxis")
//y mirror scaling
const y_mirror = d3.scaleLinear()
    .domain([280, 0])
const bar_y_mirror = d3.axisLeft(y_mirror).tickSize(-width).ticks(3);
bar_svg.append("g")
    .attr("class", "myMaxis")
//context line
let bar_line = bar_svg.append("g")


////////////////////gradient legend/////////////////////
let colorScale = d3.scaleLinear()
    .domain([1, 50])
    .range(['#2F4F4F', 'white']);
// append a defs (for definition) element to SVG
let svgLegend = d3.select('#gradient').append('svg')
    .attr("width", 150)
    .attr("height", 70);
let defs = svgLegend.append('defs');
// append a linearGradient element to the defs and give it a unique id
let linearGradient = defs.append('linearGradient')
    .attr('id', 'linear-gradient');
// horizontal gradient
linearGradient
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
// append multiple color stops by using D3's data/enter step
linearGradient.selectAll("stop")
    .data([
        { offset: "0%", color: "#2F4F4F" },
        { offset: "50%", color: "gray" },
        { offset: "100%", color: "white" }
    ])
    .join("stop")
    .attr("offset", function (d) {
        return d.offset;
    })
    .attr("stop-color", function (d) {
        return d.color;
    });
// append title
svgLegend.append("text")
    .attr("class", "legendTitle")
    .attr("x", 0)
    .attr("y", 20)
    .style("text-anchor", "left")
    .style("font-size", "10px")
    .text("Mediation Involvement");
// draw the rectangle and fill with gradient
svgLegend.append("rect")
    .attr("x", 0)
    .attr("y", 30)
    .attr("width", 150 - 10)
    .attr("height", 15)
    .style("fill", "url(#linear-gradient)");
//create tick marks
let xLeg = d3.scaleLinear()
    .domain([1, 50])
    .range([5, 150]);
let axisLeg = d3.axisBottom(xLeg)
    .tickValues(colorScale.domain())
svgLegend
    .attr("class", "axis")
    .append("g")
    .attr("transform", "translate(-1, 40)")
    .style("text-anchor", "end")
    .call(axisLeg);

export {
    margin, complete_width, complete_height, width, net_width, net_height, bar_height,
    context, full_bar_height, height, slide, triangle, snappedSelection, zoom,
    net_svg, ticked, simulation, nonstate_simulation, nonstate_zoom, bar_svg, context_data,
    context_data_south, nonstate_context, bar_x, bar_x_axis, bar_y, bar_y_axis, y_mirror,
    bar_y_mirror, bar_line, nonstate_svg, non_ticked, top_five_svg
}