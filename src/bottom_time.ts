import { width, height, triangle, snappedSelection, svg, x, x_axis, y } from "./variables"
import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import { draw_map } from "./leaf";
import { data_sort } from "./sort_data";

//--------------timeline-------------------------
//brushing selection events
let current_data
let current_network_data
let brushing = function (event) {
    // console.log(current_data);
    // based on: https://bl.ocks.org/mbostock/6232537
    if (!event.selection && !event.sourceEvent) return;
    const s0 = event.selection ? event.selection : [1, 2].fill(event.sourceEvent.offsetX),
        d0 = filteredDomain(x, ...s0);
    let s1 = s0;
    //end of selection triggers redrawing of the map for speed
    if (event.sourceEvent && event.type === 'end') {
        let year_range = [d3.min(d0), d3.max(d0)]
        draw_map(year_range, current_data)
        // data_sort(current_network_data, year_range)
        s1 = snappedSelection(x, d0);
        d3.select(this).transition().call(event.target.move, s1);
    }
    // move handlers
    d3.selectAll('g.handles')
        .attr('transform', d => {
            const x = d == 'handle--o' ? s1[0] : s1[1];
            return `translate(${x}, 0)`;
        });
    // update labels
    d3.selectAll('g.handles').selectAll('text')
        .attr('dx', d0.length > 1 ? 0 : 6)
        .text((d, i) => {
            let year;
            if (d0.length > 1) {
                year = d == 'handle--o' ? d3.min(d0) : d3.max(d0);
            } else {
                year = d == 'handle--o' ? d3.min(d0) : '';
            }
            return year;
        })
    // update bars
    d3.selectAll('.bar, .bar-text')
        .attr('opacity', function (d) {
            return d0.includes(d[0]) ? 1 : 0.3;
        })
}

//brushing dimensions
let brush = d3.brushX()
    .handleSize(20)
    .extent([[0, 0], [width, height]])
    .on('start brush end', brushing)
//array of years selected
let filteredDomain = function (scale, min, max) {
    let dif = scale(d3.min(scale.domain())) - scale.range()[0],
        iMin = (min - dif) < 0 ? 0 : Math.round((min - dif) / x.step()),
        iMax = Math.round((max - dif) / x.step());
    if (iMax == iMin) --iMin;
    return scale.domain().slice(iMin, iMax)
}


function update_bottom_timeline(year_group, the_data, net_data) {
    // the_thing.current_data = the_data;
    // the_thing.foo(the_data)
    current_data = the_data
    console.log(current_data);
    
    current_network_data = net_data
    //domain for x axis based on the data
    x.domain(d3.map(year_group, function (d) {
        return d[0]
    }))
    //append x axis
    svg.selectAll(".myXaxis")
        .transition().duration(1000)
        .call(x_axis)
        .selectAll("text")
        .attr("transform", "translate(0,-4)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-family", "Montserrat");

    //drawing timeline rectangles
    svg.selectAll(".bar")
        .data(year_group)
        .join(
            enter => enter.append("rect")
                // .attr('transform', (d,i) => `translate(${ 10 },${ i * 30 })`)
                .attr("class", "bar")
                .attr("x", d => x(d[0]))
                .attr("y", height)
                .attr("rx", 3)
                .attr("height", 0)
                .attr("width", x.bandwidth())
                .attr("fill", "#006197")
                .transition().duration(1000)
                .attr("y", d => y(d[1].length))
                .attr("height", d => height - y(d[1].length))
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x", d => x(d[0]))
                .attr("y", d => y(d[1].length))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d[1].length))
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("y", height)
                .attr("height", 0)
                .remove()
        )

    svg.selectAll(".bar-text")
        .data(year_group)
        .join(
            enter => enter.append("text")
                .attr("class", "bar-text")
                .attr('text-anchor', 'middle')
                .attr("fill", "white")
                .attr("font-size", "10px")
                .attr("x", function (d) { return x(d[0]) + x.bandwidth() / 2; })
                .attr("y", function (d, i) { return y(d[1].length) - 5; })
                .text(function (d) { return d[1].length; })
                .attr("opacity", 0)
                .transition().duration(1000)
                .attr("opacity", 1)
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x", function (d) { return x(d[0]) + x.bandwidth() / 2; })
                .attr("y", function (d, i) { return y(d[1].length) - 5; })
                .text(function (d) { return d[1].length; })
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("opacity", 0)
                .remove()
        )

    //appending brusing g element
    const gBrush = svg.append('g')
        .call(brush)
        .call(brush.move, [0, width])
    //Handle group
    const gHandles = gBrush.selectAll('g.handles')
        .data(['handle--o', 'handle--e'])
        .join('g')
        .attr('class', d => `handles ${d}`)
        .attr('fill', "white")
        .attr('transform', d => {
            const x = d == 'handle--o' ? 0 : width;
            return `translate(${x}, 0)`;
        });
    //Label
    gHandles.selectAll('text')
        .data(function (d) {
            return [d]
        })
        .join('text')
        .attr('text-anchor', 'middle')
        .style("font-size", "14px")
        .style('font-family', 'Montserrat')
        .attr('fill', 'white')
        .attr('dy', -10)
        .text(d => d == 'handle--o' ? d3.min(x.domain()) : d3.max(x.domain()));
    //Triangle
    gHandles.selectAll('.triangle')
        .data(d => [d])
        .join('path')
        .attr('class', d => `triangle ${d}`)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr('d', triangle)
        .attr('transform', d => {
            const x = d == 'handle--o' ? -6 : 6,
                rot = d == 'handle--o' ? -90 : 90;
            return `translate(${x}, ${height / 2}) rotate(${rot})`;
        });
    //Visible Line
    gHandles.selectAll('.line')
        .data(d => [d])
        .join('line')
        .attr('class', d => `line ${d}`)
        .attr('x1', 0)
        .attr('y1', -5)
        .attr('x2', 0)
        .attr('y2', height + 5)
        .attr('stroke', "white");
    //set brusing rectangle to lower opacity and remove line
    d3.selectAll(".selection")
        .attr("stroke", "none")
        .attr("fill-opacity", 0)
    //remove tick lines
    // d3.selectAll(".tick line").style("visibility", "hidden")

}

export { update_bottom_timeline }