// import {
//     slide, ticked, simulation, context, colorin, colorout, colornone, bundle_width, bundle_radius, bundle_tree, bundle_line, bundle_svg, arcInnerRadius,
//     arcOuterRadius, arcWidth, arc, bundle_link, bundle_node
// } from "./variables"
import {
    colorin, colorout, colornone, bundle_width, bundle_radius, bundle_tree, bundle_line, bundle_svg, arcInnerRadius,
    arcOuterRadius, arcWidth, arc, bundle_link, bundle_node, slide
} from "./variables"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';

let dataset
//filtering network based on number of links
// let output = document.getElementById("demo");
// var slider = document.getElementById("myRange");
// output.innerHTML = slider.value;
// slide.oninput = function () {
//       output.innerHTML = this.value;

//     let newLinks = dataset.links.filter(l => l.value >= this.value);
//     let new_dataset = {
//         nodes: dataset.nodes,
//         links: newLinks
//     }
//     update_net(new_dataset, "noupdate")
// }

//change opacity
let output = document.getElementById("demo");
var slider = document.getElementById("myRange");
output.innerHTML = slider.value;
slide.oninput = function () {
    output.innerHTML = this.value;
    console.log(this.value);
    d3.selectAll(".link").style("stroke-opacity", this.value)
}

//update the network
function update_net(bundle_data, update) {
    if (update == "update") {
        dataset = bundle_data
    }
    else {
        console.log("no need");
    }

    d3.selectAll(".bundle_node").remove()
    console.log(bundle_data);

    const root = bundle_tree(bilink(d3.hierarchy(hierarchy(bundle_data))
    ));

    const leafGroups = d3.groups(root.leaves(), d => d.parent.data.name);

    const arcAngles = leafGroups.map(g => ({
        name: g[0],
        start: d3.min(g[1], d => d.x),
        end: d3.max(g[1], d => d.x)
    }));

    bundle_svg.selectAll(".arc")
        .data(arcAngles)
        .join("path")
        .attr("id", (d, i) => `arc_${i}`)
        .attr("d", (d) => arc({ start: d.start, end: d.end }))
        .attr("class", "arc")
        .attr("fill", function (d) {
            if (d.name == "african") {
                return "#dd1e36"
            }
            else if (d.name == "western") {
                return "#40af4a"
            }
            else if (d.name == "nonwestern") {
                return "#ab4298"
            }
            else if (d.name == "international") {
                return "white"
            }
        })
        .attr("stroke", "none");

    // svg.selectAll(".arcLabel")
    //     .data(arcAngles)
    //     .join("text")
    //     .attr("x", 2) //Move the text from the start angle of the arc
    //     .attr("dy", (d) => ((arcOuterRadius - arcInnerRadius) * 0.8)) //Move the text down
    //     .append("textPath")
    //     .attr("class", "arcLabel")
    //     .attr("xlink:href", (d, i) => `#arc_${i}`)
    //     .text((d, i) => ((d.end - d.start) < (6 * Math.PI / 180)) ? "" : d.name); // 6 degrees min arc length for label to apply


    let gru = d3.scaleLinear()
        .domain([1, 100])
        .range([5, 25]);

    // add nodes
    bundle_node.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("class", "bundle_node")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y}, 0)`)
        .append("text")
        .style("font-size", function (d, i) {
            let font = gru(d.data.imports.length)
            return font + "px"
        })
        .style("fill", "gray")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? (arcWidth + 13) : (arcWidth + 13) * -1) // note use of arcWidth
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .text(d => d.data.name)
        .each(function (d) { d.text = this; })
        .on("mouseover", overed)
        .on("mouseout", outed)
        // .call(text => text.append("title").text(d => `${id(d)} ${d.outgoing.length} outgoing ${d.incoming.length} incoming`));


    // add edges
    bundle_link.selectAll("path")
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
        .each(function (d) {
            (d.source = d[0]), (d.target = d[d.length - 1]);
        })
        .each(function (d) { d.path = this; })
        .attr("class", "link")
        .attr("fill", "none")
        .attr("d", ([i, o]) => bundle_line(i.path(o)))
    
    function overed(event, d) {
        // link.style("mix-blend-mode", null);
        d3.select(this).style("fill", "#fed800").attr("font-weight", "bold").style("font-size", "25px");
        d3.selectAll(d.incoming.map(d => d.path)).style("stroke", colorin).style("stroke-opacity", 1).raise()
        d3.selectAll(d.incoming.map(([d]) => d.text)).style("fill", colorin).attr("font-weight", "bold");
        d3.selectAll(d.outgoing.map(d => d.path)).style("stroke", colorout).style("stroke-opacity", 1).raise();
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).style("fill", colorout).attr("font-weight", "bold");
    }

    function outed(event, d) {
        // link.style("mix-blend-mode", "multiply");
        let return_font = gru(d.data.imports.length)
        d3.select(this).style("fill", "gray").attr("font-weight", null).style("font-size", return_font + "px");
        d3.selectAll(d.incoming.map(d => d.path)).style("stroke", "rgb(93, 93, 93)").style("stroke-opacity", 0.3);
        d3.selectAll(d.incoming.map(([d]) => d.text)).style("fill", "gray").attr("font-weight", null);
        d3.selectAll(d.outgoing.map(d => d.path)).style("stroke", "rgb(93, 93, 93)").style("stroke-opacity", 0.3);
        d3.selectAll(d.outgoing.map(([, d]) => d.text)).style("fill", "gray").attr("font-weight", null);
    }

    function id(node) {
        return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
    }

    function bilink(root) {
        const map = new Map(root.leaves().map(d => [id(d), d]));
        for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
        for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
        return root;
    }

    function hierarchy(data, delimiter = ".") {
        let root;
        const map = new Map;
        data.forEach(function find(data) {
            const { name } = data;
            if (map.has(name)) return map.get(name);
            const i = name.lastIndexOf(delimiter);
            map.set(name, data);
            if (i >= 0) {
                find({ name: name.substring(0, i), children: [] }).children.push(data);
                data.name = name.substring(i + 1);
            } else {
                root = data;
            }
            return data;
        });
        return root;
    }

    // let node_size_sou = d3.groups(data.links, d => d.source)
    // let node_size_tar = d3.groups(data.links, d => d.target)
    // data.nodes.forEach(function (d) {
    //     const l = node_size_sou.find((n) => n[0] == d.id)
    //     const m = node_size_tar.find((m) => m[0] == d.id)
    //     if (typeof l !== 'undefined' && typeof m !== 'undefined') {
    //         d.weight = l[1].length + m[1].length
    //     }
    //     else if (typeof l !== 'undefined' && typeof m == 'undefined') {
    //         d.weight = l[1].length
    //     }
    //     else if (typeof l == 'undefined' && typeof m !== 'undefined') {
    //         d.weight = m[1].length
    //     }
    // })

    // //keep already drawn nodes
    // const old = new Map(context.node.data().map(d => [d.id, d]));
    // let nodes = data.nodes.map(d => ({ ...old.get(d.id), ...d }));
    // let links = data.links.map(d => ({ ...d }));

    // nodes = nodes.sort(function (a, b) { return b.weight - a.weight; });
    // // let min = d3.min(data.links, function (d) { return d.value; });
    // // let max = d3.max(data.links, function (d) { return d.value; });
    // // slide.min = min;
    // // slide.max = max;
    // // document.getElementById("myRange").value = max;
    // // console.log(slide);

    // const linkOpacity = 0.6;
    // const labelOpacity = 0.7;
    // //draw links
    // context.link = context.link
    //     .data(links, d => [d.source, d.target])
    //     .join("line")
    //     .attr("class", "link")
    //     .attr("stroke-opacity", linkOpacity)
    //     .attr("stroke-width", function (d) { return Math.sqrt(d.value); })
    //     .attr("opacity", 0.6);

    // const nodeMouseOver = (event, elem) => {
    //     // make current node in front
    //     d3.select(event.currentTarget).raise();
    //     // fade disconnected links
    //     d3.selectAll(".link")
    //         .filter(d => elem.id != d.source.id && elem.id != d.target.id)
    //         .style("stroke-opacity", linkOpacity / 4);
    //     // highlight connected links 
    //     const links = d3.selectAll(".link")
    //         .filter(d => elem.id == d.source.id || elem.id == d.target.id)
    //         .style("stroke-opacity", 1);
    //     // get list of connected nodes
    //     const involved_nodes = links.data().map(x => [x.source.id, x.target.id]).flat();
    //     // fade disconnected nodes
    //     d3.selectAll(".node")
    //         .filter(d => !involved_nodes.includes(d.id))
    //         .style("opacity", 0.25);
    //     // highlight connected labels
    //     d3.selectAll(".nodename")
    //         .filter(d => involved_nodes.includes(d.id))
    //         .style("opacity", 1);
    //     // highlight this label
    //     // const thisLabel = d3.selectAll(".nodename")
    //     //     .filter(d => elem.index == d.index)
    //     //     .attr("font-weight", 500)
    //     //     .style("opacity", 1);
    //     // // make background white
    //     // thisLabel.clone(true);
    //     // thisLabel
    //     //     .attr("class", "nodename backwhite")
    //     //     .attr("stroke", "#fff")
    //     //     .attr("stroke-width", 3);
    // }
    // const nodeMouseOut = () => {
    //     // reset all
    //     d3.selectAll(".nodename.backwhite").remove();
    //     d3.selectAll(".node")
    //         .style("opacity", 1);
    //     d3.selectAll(".link")
    //         .style("stroke-opacity", linkOpacity);
    //     d3.selectAll(".nodename")
    //         .attr("font-weight", 400)
    //         .style("opacity", labelOpacity);
    // }

    // var the_rscale = d3.scaleLinear()
    //     .range([1, 20])
    //     .domain([1, 40])

    // //draw nodes
    // context.node = context.node
    //     .data(nodes, d => d.id)
    //     .join("circle")
    //     .attr("class", "node")
    //     .attr("r", function (x) {
    //         // return Math.sqrt(x.weight * 5)
    //         return the_rscale(x.weight)
    //     })
    //     .style("fill", function (d) {
    //         // console.log(d);
    //         if (d.locale == "western") {
    //             return "#40af4a"
    //         }
    //         if (d.locale == "nonwestern") {
    //             return "#ab4298"
    //         }
    //         if (d.locale == "african") {
    //             return "#dd1e36"
    //         }
    //         if (d.locale == "international") {
    //             return "white"
    //         }

    //     })
    //     .style("stroke", "black")
    //     .style("stroke-width", 0.5)
    //     // .call(d3.drag()  //sets the event listener for the specified typenames and returns the drag behavior.
    //     //     .on("start", dragstarted) //start - after a new pointer becomes active (on mousedown or touchstart).
    //     //     .on("drag", dragged)      //drag - after an active pointer moves (on mousemove or touchmove).
    //     //     .on("end", dragended)     //end - after an active pointer becomes inactive (on mouseup, touchend or touchcancel).
    //     // )
    //     .on("mouseover", nodeMouseOver)
    //     .on("mouseout", nodeMouseOut)
    // //draw text
    // context.text = context.text
    //     .data(nodes, d => d.id)
    //     .join("text")
    //     .text(d => d.id)
    //     .attr("class", "network_nodename")
    //     .style('opacity', labelOpacity)
    //     .attr("dx", 5)
    //     // .attr("dy", ".35em")
    //     .attr("fill", "black")
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", "10px")
    // //adjust simulation
    // simulation.nodes(nodes);
    // simulation.force("link").links(links);
    // simulation.alpha(1).restart().tick();
    // ticked(); // render now!

    // //When the drag gesture starts, the targeted node is fixed to the pointer
    // //The simulation is temporarily “heated” during interaction by setting the target alpha to a non-zero value.
    // function dragstarted(event, d) {
    //     if (!event.active) simulation.alphaTarget(0.3).restart();//sets the current target alpha to the specified number in the range [0,1].
    //     d.fy = d.y; //fx - the node’s fixed x-position. Original is null.
    //     d.fx = d.x; //fy - the node’s fixed y-position. Original is null.
    // }
    // //When the drag gesture starts, the targeted node is fixed to the pointer
    // function dragged(event, d) {
    //     d.fx = event.x;
    //     d.fy = event.y;
    // }
    // //the targeted node is released when the gesture ends
    // function dragended(event, d) {
    //     if (!event.active) simulation.alphaTarget(0);
    //     d.fx = null;
    //     d.fy = null;
    //     console.log("dataset after dragged is ...", dataset);
    // }
}

export { update_net }