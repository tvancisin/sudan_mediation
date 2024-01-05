import {
    net_height, complete_height, margin, bar_svg, bar_x, bar_x_axis, bar_y, bar_y_axis,
    width, bar_line, y_mirror, bar_y_mirror, triangle, snappedSelection, complete_width
} from "./variables";
import * as d3 from "d3";
import { draw_map } from './leaf';
import { data_sort } from "./sort_data";
import 'leaflet/dist/leaflet.css';

let current_sudan;
let current_for_network;
let brushing = function (event) {
    // based on: https://bl.ocks.org/mbostock/6232537
    if (!event.selection && !event.sourceEvent) return;
    const s0 = event.selection ? event.selection : [1, 2].fill(event.sourceEvent.offsetX),
        d0 = filteredDomain(bar_x, ...s0);
    let s1 = s0;
    //end of selection triggers redrawing of the map for speed
    if (event.sourceEvent && event.type === 'end') {
        let year_range = [d3.min(d0), d3.max(d0)]
        draw_map(year_range, current_sudan)
        // data_sort(current_for_network, year_range)
        s1 = snappedSelection(bar_x, d0);
        d3.select(this).transition().call(event.target.move, s1);
    }
    //move handlers
    d3.selectAll('g.handles')
        .attr('transform', d => {
            const x = d == 'handle--o' ? s1[0] : s1[1];
            return `translate(${x}, 0)`;
        });
    //update labels
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
    //update bars
    d3.selectAll('.my_top_bar, .mirrorbar')
        .attr('opacity', function (d) {
            return d0.includes(d[0]) ? 1 : 0.3;
        })
}

//brushing dimensions
let brush = d3.brushX()
    .handleSize(20)
    .extent([[0, 0], [width, 150]])
    .on('start brush end', brushing)
//array of years selected
let filteredDomain = function (scale, min, max) {
    let dif = scale(d3.min(scale.domain())) - scale.range()[0],
        iMin = (min - dif) < 0 ? 0 : Math.round((min - dif) / bar_x.step()),
        iMax = Math.round((max - dif) / bar_x.step());
    if (iMax == iMin) --iMin;
    return scale.domain().slice(iMin, iMax)
}
const gBrush = bar_svg.append('g').attr("class", "brush")

//----------------bar chart----------------
function draw_bars(data, context_data, size, map_data) {
    current_sudan = map_data;
    current_for_network = data;

    //unique actors data
    let multigroup = d3.groups(data, d => d.year, d => d.third_party)
    //mediations by year data
    let year_group = d3.groups(data, d => d.year)
    //update bar height based on click
    let bar_h, full_bar_h, context_text, context_line;
    if (size == "small") {
        d3.selectAll("#bar, .bar_svg")
            .transition().duration(1000)
            .style("height", 150 + "px")
        bar_h = 150 / 1.35 - margin.top - margin.bottom;
        full_bar_h = 150 - margin.top - margin.bottom;
        context_line = 8;
        context_text = 9;
        d3.select(".brush").style("display", "block")
    }
    else {
        d3.selectAll("#bar, .bar_svg")
            .transition().duration(1000)
            .style("height", complete_height + "px")

        d3.select(".brush").style("display", "none")
        context_line = 30;
        context_text = 30;
        bar_h = net_height / 1.5 - margin.top - margin.bottom;
        full_bar_h = net_height - margin.top - margin.bottom;
    }
    //update ranges
    bar_y.range([bar_h, 0])
    y_mirror.range([bar_h * 2 + 16, bar_h + 16]);
    //update axes
    bar_x.domain(d3.map(year_group, function (d) {
        return d[0]
    }))

    bar_svg.selectAll(".myXaxis").transition().duration(1000)
        .call(bar_x_axis)
        .attr("transform", `translate(0, ${bar_h})`)
        .selectAll("text")
        .attr("transform", "translate(0,-5)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Montserrat");

    bar_svg.selectAll(".myYaxis").transition().duration(1000)
        .call(bar_y_axis)
        .style("stroke-dasharray", "10, 5")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("x", 3)
        .style("fill", "white")
        .style("font-size", "10px")
        .style("font-family", "Montserrat");

    bar_svg.selectAll(".myMaxis").transition().duration(1000)
        .call(bar_y_mirror)
        .style("stroke-dasharray", "10, 5")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("x", 3)
        .style("fill", "white")
        .style("font-size", "10px")
        .style("font-family", "Montserrat");
    //update top bars
    bar_svg.selectAll(".my_top_bar")
        .data(year_group, function (d) {
            return d[0]
        })
        .join(
            enter => enter.append("rect")
                .attr("class", "my_top_bar")
                .attr("x", d => bar_x(d[0]))
                .attr("y", bar_h)
                .attr("rx", 3)
                .attr("height", 0)
                .attr("width", bar_x.bandwidth())
                // .attr("fill", "#fed800")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .transition().duration(1000)
                .attr("y", d => bar_y(d[1].length))
                .attr("height", d => bar_h - bar_y(d[1].length))
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x", d => bar_x(d[0]))
                .attr("y", d => bar_y(d[1].length))
                .attr("width", bar_x.bandwidth())
                .attr("height", d => bar_h - bar_y(d[1].length))
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("y", bar_h)
                .attr("height", 0)
                .remove()
        )
    //update bottom bars
    bar_svg.selectAll(".mirrorbar")
        .data(multigroup, function (d) {
            return d[0]
        })
        .join(
            enter => enter.append("rect")
                .attr("class", "mirrorbar")
                .attr("x", d => bar_x(d[0]))
                .attr("y", bar_h + 16)
                .attr("rx", 3)
                .attr("height", 0)
                .attr("width", bar_x.bandwidth())
                // .attr("fill", "#fed800")
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .transition().duration(1000)
                .attr("height", d => bar_h - bar_y(d[1].length))
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x", d => bar_x(d[0]))
                .attr("y", bar_h + 16)
                .attr("width", bar_x.bandwidth())
                .attr("height", d => bar_h - bar_y(d[1].length))
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("y", bar_h + 16)
                .attr("height", 0)
                .remove()
        )
    //update context line
    bar_line.selectAll(".context_line")
        .data(context_data)
        .join(
            enter => enter.append("line")
                .attr("class", "context_line")
                .attr("x1", function (d) { return bar_x(d.year) + bar_x.bandwidth() / 2 })
                .attr("x2", function (d) { return bar_x(d.year) + bar_x.bandwidth() / 2 })
                .attr("y1", function (d, i) {
                    if (size == "small") {
                        return bar_h / 2 - i * context_line
                    }
                    else {
                        return bar_h / 3 - i * context_line
                    }
                })
                .attr("y2", full_bar_h)
                .attr("stroke-width", 1)
                .attr("stroke", "gray")
                .attr("stroke-dasharray", "5,5")
                .attr("opacity", 0)
                .transition().duration(1000)
                .attr("opacity", 1)
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x1", function (d) { return bar_x(d.year) + bar_x.bandwidth() / 2 })
                .attr("x2", function (d) { return bar_x(d.year) + bar_x.bandwidth() / 2 })
                .attr("y1", function (d, i) {
                    if (size == "small") {
                        return bar_h / 2 - i * context_line
                    }
                    else {
                        return bar_h / 3 - i * context_line
                    }
                })
                .attr("y2", full_bar_h)
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("opacity", 0)
                .remove()
        )
    //update text
    bar_line.selectAll(".context_text")
        .data(context_data)
        .join(
            enter => enter.append("text")
                .attr("class", "context_text")
                .attr('text-anchor', 'start')
                .attr("fill", "gray")
                .attr("font-size", "10px")
                .attr("x", function (d) { return bar_x(d.year) + 2 })
                .attr("y", function (d, i) {
                    if (size == "small") {
                        return bar_h / 2 - i * context_text
                    }
                    else {
                        return bar_h / 3 - i * context_text
                    }
                })
                .text(function (d) { return d.text })
                .attr("opacity", 0)
                .transition().duration(1000)
                .attr("opacity", 1)
                .selection(),
            update => update
                .transition().duration(1000)
                .attr("x", function (d) { return bar_x(d.year) + 2 })
                .attr("y", function (d, i) {
                    if (size == "small") {
                        return bar_h / 2 - i * context_text
                    }
                    else {
                        return bar_h / 3 - i * context_text
                    }
                })
                .text(function (d) { return d.text })
                .selection(),
            exit => exit
                .transition().duration(500)
                .attr("opacity", 0)
                .remove()
        )

    d3.selectAll(".domain")
        .attr("visibility", "hidden")

    //appending brusing g element
    gBrush
        .call(brush)
        .call(brush.move, [0, width])
    //Handle group
    const gHandles = gBrush.selectAll('g.handles')
        .data(['handle--o', 'handle--e'])
        .join('g')
        .attr('class', d => `handles ${d}`)
        .attr('fill', "white")
        .attr('transform', d => {
            const x = d == 'handle--o' ? 10 : width - 10;
            return `translate(${x}, 0)`;
        });
    //Label
    // gHandles.selectAll('text')
    //     .data(function (d) {
    //         return [d]
    //     })
    //     .join('text')
    //     .attr("class", "year_text")
    //     .attr('text-anchor', 'middle')
    //     .style("font-size", "12px")
    //     .style('font-family', 'Montserrat')
    //     .attr('dy', 0)
    //     .text(d => d == 'handle--o' ? d3.min(bar_x.domain()) : d3.max(bar_x.domain()));
    //Triangle
    gHandles.selectAll('.triangle')
        .data(d => [d])
        .join('path')
        .attr('class', d => `triangle ${d}`)
        // .attr("fill", "red")
        .attr("fill", "#fed800")
        .attr("stroke", "black")
        .attr('d', triangle)
        .attr('transform', d => {
            const x = d == 'handle--o' ? -6 : 6,
                rot = d == 'handle--o' ? -90 : 90;
            return `translate(${x}, ${full_bar_h / 2}) rotate(${rot})`;
        });
    //Visible Line
    gHandles.selectAll('.line')
        .data(d => [d])
        .join('line')
        .attr('class', d => `line ${d}`)
        .attr('x1', 0)
        .attr('y1', 3)
        .attr('x2', 0)
        .attr('y2', full_bar_h - 2)
        .attr('stroke', "red");
    //set brusing rectangle to lower opacity and remove line
    d3.selectAll(".selection")
        .attr("stroke", "none")
        .attr("fill-opacity", 0)
    //remove tick lines
    // d3.selectAll(".tick line").style("visibility", "hidden")
}

export { draw_bars }