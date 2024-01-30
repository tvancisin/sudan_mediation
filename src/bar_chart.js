import {
    net_height, complete_height, margin, bar_svg, bar_x,
    bar_x_axis, bar_y, bar_y_axis, width, bar_line, y_mirror,
    bar_y_mirror, triangle, snappedSelection,
} from "./variables";
import * as d3 from "d3";
import { draw_map } from './leaf';
import { nonstate_draw } from "./nonstate";
import { data_sort } from "./sort_data";
import 'leaflet/dist/leaflet.css';

let grouped_data;
let individual_data;
let state = "state";
let complete_data;

let brushing = function (event) {
    if (!event.selection && !event.sourceEvent) return;
    const s0 = event.selection ? event.selection : [1, 2].fill(event.sourceEvent.offsetX),
        d0 = filteredDomain(bar_x, ...s0);
    let s1 = s0;
    //end of selection triggers redrawing of the map for speed
    if (event.sourceEvent && event.type === 'end') {
        let year_range = [d3.min(d0), d3.max(d0)]
        if (state == "state") {
            draw_map(year_range, grouped_data, complete_data)
        }
        else if (state == "nonstate") {
            nonstate_draw(individual_data, year_range)
        }
        else if (state == "net") {
            data_sort(individual_data, year_range)
        }
        else if (state == "bar") {
            console.log("no need to draw");
        }
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
    // d3.selectAll('g.handles').selectAll('text')
    //     .attr('dx', d0.length > 1 ? 0 : 6)
    //     .text((d, i) => {
    //         let year;
    //         if (d0.length > 1) {
    //             year = d == 'handle--o' ? d3.min(d0) : d3.max(d0);
    //         } else {
    //             year = d == 'handle--o' ? d3.min(d0) : '';
    //         }
    //         return year;
    //     })
    //update bars
    d3.selectAll('.top_bar, .bottom_bar')
        .attr('opacity', function (d) {
            return d0.includes(d.data.group) ? 1 : 0.3;
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
const gBrush = bar_svg.append('g').attr("class", "brush");
let bars = bar_svg.append("g").attr("class", "bars");
let unq_bars = bar_svg.append("g").attr("class", "unq_bars");

//bar chart
function draw_bars(bar_data, context_data, size, map_data, current_state, comp_data) {
    // console.log(bar_data, context_data, size, map_data, current_state);
    // update current datasets
    complete_data = comp_data;
    grouped_data = map_data;
    state = current_state
    individual_data = bar_data;

    // mediations data formatting
    let g_data = d3.groups(individual_data, d => d.year, d => d.lateral);
    let formatted_years = [];

    g_data.forEach(function (d) {
        let unilat_number;
        let multilat_number;
        if (d[1].length == 1) {
            // console.log("here", d[1][0][1].length);
            if (d[1][0][0] == "unilateral") {
                multilat_number = 0
                unilat_number = d[1][0][1].length
            }
            else {
                unilat_number = 0
                multilat_number = d[1][0][1].length
            }
        }
        else {
            if (d[1][0][0] == "unilateral") {
                unilat_number = d[1][0][1].length
                multilat_number = d[1][1][1].length
            }
            else {
                multilat_number = d[1][0][1].length
                unilat_number = d[1][1][1].length
            }
        }
        let indi_year = {
            group: d[0],
            unilateral: unilat_number,
            multilateral: multilat_number
        }
        formatted_years.push(indi_year)
    })

    // console.log(formatted_years);

    let subgroups = ["unilateral", "multilateral"];
    const groups = formatted_years.map(d => (d.group))
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['gray', 'white'])

    //unique actors data formatting
    let multigroup = d3.groups(bar_data, d => d.year, d => d.third_party)
    let unique_years = [];

    multigroup.forEach(function (d) {
        let state_unq = 0;
        let nonstate_unq = 0;
        let global_unq = 0;
        let regional_unq = 0;
        d[1].forEach(function (x) {
            if (x[1][0].third_party_type == "state") {
                state_unq += 1
            }
            else if (x[1][0].third_party_type == "nonstate") {
                nonstate_unq += 1
            }
            else if (x[1][0].third_party_type == "global") {
                global_unq += 1
            }
            else if (x[1][0].third_party_type == "regional") {
                regional_unq += 1
            }
        })
        let indi_year = {
            group: d[0],
            nonstate: nonstate_unq,
            global: global_unq,
            regional: regional_unq,
            state: state_unq,
        }
        unique_years.push(indi_year)
    })

    let unq_subgroups = ["regional", "nonstate", "global", "state"];
    const unq_groups = unique_years.map(d => (d.group))
    const unq_color = d3.scaleOrdinal()
        .domain(unq_subgroups)
        .range(["#dd1e37", "#ab4298", "#ffe241", "#0091ba"])

    //mediations by year data
    // let year_group = d3.groups(bar_data, d => d.year)
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
        bar_y.domain([0, 250])
        y_mirror.domain([250, 0])
    }
    else if (size == "country") {
        d3.selectAll("#bar, .bar_svg")
            .transition().duration(1000)
            .style("height", 150 + "px")
        bar_h = 150 / 1.35 - margin.top - margin.bottom;
        full_bar_h = 150 - margin.top - margin.bottom;
        context_line = 9;
        context_text = 10;
        d3.select(".brush").style("display", "none")
        bar_y.domain([0, 50])
        y_mirror.domain([50, 0])
    }
    else if (size == "big") {
        d3.selectAll("#bar, .bar_svg")
            .transition().duration(1000)
            .style("height", complete_height + "px")

        d3.select(".brush").style("display", "none")
        context_line = 20;
        context_text = 22;
        bar_h = net_height / 1.5 - margin.top - margin.bottom;
        full_bar_h = net_height - margin.top - margin.bottom;
        bar_y.domain([0, 200])
        y_mirror.domain([200, 0])
    }
    //update ranges
    bar_y.range([bar_h, 0])
    y_mirror.range([bar_h * 2 + 16, bar_h + 16]);
    //update axes
    // bar_x.domain(d3.map(year_group, function (d) {
    //     return d[0]
    // }))

    let bla = [1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995,
        1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005,
        2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
        2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]

    bar_x.domain(bla)

    const stackedData = d3.stack()
        .keys(subgroups)
        (formatted_years)

    const unq_stackedData = d3.stack()
        .keys(unq_subgroups)
        (unique_years)

    // console.log(formatted_years, unique_years);

    bar_svg.selectAll(".myXaxis").transition().duration(1000)
        .call(bar_x_axis)
        .attr("transform", `translate(0, ${bar_h})`)
        .selectAll("text")
        .attr("transform", "translate(0,-5)")
        .style("fill", "white")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        // .style("font-weight", "bold")
        .style("font-family", "Montserrat");

    bar_svg.selectAll(".myYaxis").transition().duration(1000)
        .call(bar_y_axis)
        .style("stroke-dasharray", "10, 5")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("x", 10)
        .style("fill", "white")
        .style("font-size", "12px")
        .style("font-family", "Montserrat");

    bar_svg.selectAll(".myMaxis").transition().duration(1000)
        .call(bar_y_mirror)
        .style("stroke-dasharray", "10, 5")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("x", 10)
        .style("fill", "white")
        .style("font-size", "12px")
        .style("font-family", "Montserrat");

    //update top bars
    // bar_svg.selectAll(".my_top_bar")
    //     .data(year_group, function (d) {
    //         return d[0]
    //     })
    //     .join(
    //         enter => enter.append("rect")
    //             .attr("class", "my_top_bar")
    //             .attr("x", d => bar_x(d[0]))
    //             .attr("y", bar_h)
    //             .attr("rx", 3)
    //             .attr("height", 0)
    //             .attr("width", bar_x.bandwidth())
    //             .attr("fill", "white")
    //             .attr("stroke", "black")
    //             .attr("stroke-width", 0.5)
    //             .transition().duration(1000)
    //             .attr("y", d => bar_y(d[1].length))
    //             .attr("height", d => bar_h - bar_y(d[1].length))
    //             .selection(),
    //         update => update
    //             .transition().duration(1000)
    //             .attr("x", d => bar_x(d[0]))
    //             .attr("y", d => bar_y(d[1].length))
    //             .attr("width", bar_x.bandwidth())
    //             .attr("height", d => bar_h - bar_y(d[1].length))
    //             .selection(),
    //         exit => exit
    //             .transition().duration(500)
    //             .attr("y", bar_h)
    //             .attr("height", 0)
    //             .remove()
    //     )


    bars
        .selectAll("g")
        .data(stackedData, d => d)
        .join(
            enter => enter
                .append("g")
                .attr("fill", function (x) {
                    return color(x.key)
                }),
            null, // no update function
            exit => {
                exit
                    .transition().duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        ).selectAll("rect")
        .data(d => d, d => d.data.key)
        .join(
            enter => enter
                .append("rect")
                .attr("class", "top_bar")
                .attr("rx", 2)
                .attr("x", d => bar_x(d.data.group))
                .attr("y", (d) => {
                    return bar_y(0);
                })
                .attr("height", 0)
                .attr("width", bar_x.bandwidth())
                .transition().duration(500)
                .attr("y", d => bar_y(d[1]))
                .attr("height", d => bar_y(d[0]) - bar_y(d[1]))
            ,
            null,
            exit => {
                exit
                    .transition().duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        )
    // .transition()
    // .attr("x", d => bar_x(d.data.group))
    // .attr("y", d => bar_y(d[1]))
    // .attr("width", bar_x.bandwidth())
    // .attr("height", d => bar_y(d[0]) - bar_y(d[1]))


    unq_bars
        .selectAll("g")
        .data(unq_stackedData, d => d)
        .join(
            enter => enter
                .append("g")
                .attr("fill", function (x) {
                    return unq_color(x.key)
                }),
            null, // no update function
            exit => {
                exit
                    .transition()
                    .duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        ).selectAll("rect")
        .data(d => d, d => d.data.key)
        .join(
            enter => enter
                .append("rect")
                .attr("class", "bottom_bar")
                .attr("rx", 2)
                .attr("x", d => bar_x(d.data.group))
                .attr("y", bar_h + 16)
                .attr("height", 0)
                .attr("width", bar_x.bandwidth())
                .transition().duration(500)
                .attr("y", function (d) {
                    return y_mirror(d[1]) - (bar_y(d[0]) - bar_y(d[1]))
                })
                .attr("height", d => bar_y(d[0]) - bar_y(d[1])),
            null,
            exit => {
                exit
                    .transition()
                    .duration(500)
                    .style("fill-opacity", 0)
                    .remove();
            }
        )
    // .transition()
    // .attr("width", bar_x.bandwidth())
    // .attr("y", function (d) {
    //     return y_mirror(d[1]) - (bar_y(d[0]) - bar_y(d[1]))
    // })
    // .attr("height", d => bar_y(d[0]) - bar_y(d[1]))

    //update bottom bars
    // bar_svg.selectAll(".mirrorbar")
    //     .data(multigroup, function (d) {
    //         return d[0]
    //     })
    //     .join(
    //         enter => enter.append("rect")
    //             .attr("class", "mirrorbar")
    //             .attr("x", d => bar_x(d[0]))
    //             .attr("y", bar_h + 16)
    //             .attr("rx", 3)
    //             .attr("height", 0)
    //             .attr("width", bar_x.bandwidth())
    //             .attr("fill", "white")
    //             .attr("stroke", "black")
    //             .attr("stroke-width", 0.5)
    //             .transition().duration(1000)
    //             .attr("height", d => bar_h - bar_y(d[1].length))
    //             .selection(),
    //         update => update
    //             .transition().duration(1000)
    //             .attr("x", d => bar_x(d[0]))
    //             .attr("y", bar_h + 16)
    //             .attr("width", bar_x.bandwidth())
    //             .attr("height", d => bar_h - bar_y(d[1].length))
    //             .selection(),
    //         exit => exit
    //             .transition().duration(500)
    //             .attr("y", bar_h + 16)
    //             .attr("height", 0)
    //             .remove()
    //     )
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
                    else if (size == "country") {
                        return bar_h / 1.5 - i * context_line
                    }
                    else if (size == "big") {
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
                    else if (size == "country") {
                        return bar_h / 1.5 - i * context_line
                    }
                    else if (size == "big") {
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
                    else if (size == "country") {
                        return bar_h / 1.5 - i * context_text
                    }
                    else if (size == "big") {
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
                    else if (size == "country") {
                        return bar_h / 1.5 - i * context_text
                    }
                    else if (size == "big") {
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
        .call(brush.move, [12, width - 12])
    //Handle group
    const gHandles = gBrush.selectAll('g.handles')
        .data(['handle--o', 'handle--e'])
        .join('g')
        .attr('class', d => `handles ${d}`)
        .attr('fill', "white")
        .attr('transform', d => {
            const x = d == 'handle--o' ? 15 : width - 15;
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
        .attr("fill", "#fed800")
        .attr("stroke", "black")
        .attr('d', triangle)
        .attr('transform', d => {
            const x = d == 'handle--o' ? -5 : 5,
                rot = d == 'handle--o' ? -90 : 90;
            return `translate(${x}, ${full_bar_h / 1.7}) rotate(${rot})`;
        });
    //Visible Line
    gHandles.selectAll('.line')
        .data(d => [d])
        .join('line')
        .attr('class', d => `line ${d}`)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', full_bar_h + 4)
        .attr('stroke', "#fed800")
        .attr('stroke-width', "1.3")
    //set brusing rectangle to lower opacity and remove line
    d3.selectAll(".selection")
        .attr("stroke", "none")
        .attr("fill-opacity", 0.2)
    //remove tick lines
    // d3.selectAll(".tick line").style("visibility", "hidden")
}

export { draw_bars }