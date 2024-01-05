import { slide, ticked, simulation, context } from "./variables"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';

let dataset
//filtering network based on number of links
let output = document.getElementById("demo");
var slider = document.getElementById("myRange");
output.innerHTML = slider.value;
slide.oninput = function () {
      output.innerHTML = this.value;

    let newLinks = dataset.links.filter(l => l.value >= this.value);
    let new_dataset = {
        nodes: dataset.nodes,
        links: newLinks
    }
    update_net(new_dataset, "noupdate")
}
//update the network
function update_net(data, update) {
    
    if (update == "update"){
        dataset = data
    }
    else {
        console.log("no need");
    }
    let node_size_sou = d3.groups(data.links, d => d.source)
    let node_size_tar = d3.groups(data.links, d => d.target)
    data.nodes.forEach(function (d) {
        const l = node_size_sou.find((n) => n[0] == d.id)
        const m = node_size_tar.find((m) => m[0] == d.id)
        if (typeof l !== 'undefined' && typeof m !== 'undefined') {
            d.weight = l[1].length + m[1].length
        }
        else if (typeof l !== 'undefined' && typeof m == 'undefined') {
            d.weight = l[1].length
        }
        else if (typeof l == 'undefined' && typeof m !== 'undefined') {
            d.weight = m[1].length
        }
    })

    //keep already drawn nodes
    const old = new Map(context.node.data().map(d => [d.id, d]));
    let nodes = data.nodes.map(d => ({ ...old.get(d.id), ...d }));
    let links = data.links.map(d => ({ ...d }));

    nodes = nodes.sort(function (a, b) { return b.weight - a.weight; });
    // let min = d3.min(data.links, function (d) { return d.value; });
    // let max = d3.max(data.links, function (d) { return d.value; });
    // slide.min = min;
    // slide.max = max;
    // document.getElementById("myRange").value = max;
    // console.log(slide);

    const linkOpacity = 0.6;
    const labelOpacity = 0.7;
    //draw links
    context.link = context.link
        .data(links, d => [d.source, d.target])
        .join("line")
        .attr("class", "link")
        .attr("stroke-opacity", linkOpacity)
        .attr("stroke-width", function (d) { return Math.sqrt(d.value); })
        .attr("opacity", 0.6);

    const nodeMouseOver = (event, elem) => {
        // make current node in front
        d3.select(event.currentTarget).raise();
        // fade disconnected links
        d3.selectAll(".link")
            .filter(d => elem.id != d.source.id && elem.id != d.target.id)
            .style("stroke-opacity", linkOpacity / 4);
        // highlight connected links 
        const links = d3.selectAll(".link")
            .filter(d => elem.id == d.source.id || elem.id == d.target.id)
            .style("stroke-opacity", 1);
        // get list of connected nodes
        const involved_nodes = links.data().map(x => [x.source.id, x.target.id]).flat();
        // fade disconnected nodes
        d3.selectAll(".node")
            .filter(d => !involved_nodes.includes(d.id))
            .style("opacity", 0.25);
        // highlight connected labels
        d3.selectAll(".nodename")
            .filter(d => involved_nodes.includes(d.id))
            .style("opacity", 1);
        // highlight this label
        // const thisLabel = d3.selectAll(".nodename")
        //     .filter(d => elem.index == d.index)
        //     .attr("font-weight", 500)
        //     .style("opacity", 1);
        // // make background white
        // thisLabel.clone(true);
        // thisLabel
        //     .attr("class", "nodename backwhite")
        //     .attr("stroke", "#fff")
        //     .attr("stroke-width", 3);
    }
    const nodeMouseOut = () => {
        // reset all
        d3.selectAll(".nodename.backwhite").remove();
        d3.selectAll(".node")
            .style("opacity", 1);
        d3.selectAll(".link")
            .style("stroke-opacity", linkOpacity);
        d3.selectAll(".nodename")
            .attr("font-weight", 400)
            .style("opacity", labelOpacity);
    }

    var the_rscale = d3.scaleLinear()
        .range([1, 20])
        .domain([1, 40])

    //draw nodes
    context.node = context.node
        .data(nodes, d => d.id)
        .join("circle")
        .attr("class", "node")
        .attr("r", function (x) {
            // return Math.sqrt(x.weight * 5)
            return the_rscale(x.weight)
        })
        .style("fill", function (d) {
            // console.log(d);
            if (d.locale == "western") {
                return "#40af4a"
            }
            if (d.locale == "nonwestern") {
                return "#ab4298"
            }
            if (d.locale == "african") {
                return "#dd1e36"
            }
            if (d.locale == "international") {
                return "white"
            }

        })
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        // .call(d3.drag()  //sets the event listener for the specified typenames and returns the drag behavior.
        //     .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
        //     .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
        //     .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
        // )
        .on("mouseover", nodeMouseOver)
        .on("mouseout", nodeMouseOut)
    //draw text
    context.text = context.text
        .data(nodes, d => d.id)
        .join("text")
        .text(d => d.id)
        .attr("class", "nodename")
        .style('opacity', labelOpacity)
        .attr("dx", 5)
        // .attr("dy", ".35em")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
    //adjust simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart().tick();
    ticked(); // render now!

    //When the drag gesture starts, the targeted node is fixed to the pointer
    //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
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
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        console.log("dataset after dragged is ...", dataset);
    }
}

export { update_net }