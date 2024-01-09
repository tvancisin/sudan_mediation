import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import './css/style.css'
import {
  complete_width, simulation, context_data, 
  net_height, top_five_svg, context_data_south
} from "./variables"
import { draw_bars } from './bar_chart';
import { nonstate_draw } from "./nonstate";
import { draw_map } from './leaf';
import { update_net } from './network';
import { data_sort } from './sort_data';
// years for brushing
let yrs = [1988, 2023]

//read in the data
d3.csv("/data/sudan_update.csv").then(function (data) {

  ///////////////////////// MULTILATERAL MEDIATIONS ////////////////////////////
  let lateral_group = d3.groups(data, function (d) {
    return d.lateral == "multilateral"
  });
  let multilateral = lateral_group[1][1];
  multilateral.forEach(function (d) {
    d.year = +d.year
  });

  //// STATE + NONSTATE
  // individual mediations: [mediationID, locale, etc.]
  let both_multilateral = multilateral
  let sudan_multilateral = both_multilateral.filter(function (d) {
    return d.conflict_locale == "Sudan"
  })
  let sousudan_multilateral = both_multilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan"
  })
  // grouped mediations [UN: 128, Kenya: 57]
  // let all_multilateral_group = d3.groups(both_multilateral, d => d.third_party, d => d.mediation_ID)
  // let sud_multilateral_group = d3.groups(sudan_multilateral, d => d.third_party, d => d.mediation_ID)
  // let south_multilateral_group = d3.groups(sousudan_multilateral, d => d.third_party, d => d.mediation_ID)
  // console.log(all_multilateral_group, sud_multilateral_group, south_multilateral_group);

  //// STATE
  // individual mediations: [mediationID, locale, etc.]
  let both_multilateral_indi_state = both_multilateral.filter(function (d) {
    return d.third_party_type == "state"
  })
  let sudan_multilateral_indi_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type == "state"
  })
  let sousudan_multilateral_indi_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type == "state"
  })
  // console.log(sudan_multilateral_indi_state, both_multilateral_indi_state, sousudan_multilateral_indi_state);
  // grouped mediations: [ERITREA (97)]
  let all_just_states = d3.groups(both_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)
  let sud_just_states = d3.groups(sudan_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)
  let sou_sud_just_states = d3.groups(sousudan_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)
  // console.log(all_just_states, sud_just_states, sou_sud_just_states);

  //// NONSTATE
  // individual mediations: [mediationID, locale, etc.]
  let both_non_state = both_multilateral.filter(function (d) {
    return d.third_party_type !== "state"
  })
  console.log(both_non_state);
  
  let sudan_non_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type !== "state"
  })
  let sousudan_non_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type !== "state"
  })
  // console.log(both_non_state, sudan_non_state, sousudan_non_state);
  // grouped mediations: [UN (128)] 
  // let all_non_states = d3.groups(both_non_state, d => d.third_party, d => d.mediation_ID);
  // let sudan_non_states = d3.groups(sudan_non_state, d => d.third_party, d => d.mediation_ID);
  // let south_non_states = d3.groups(sousudan_non_state, d => d.third_party, d => d.mediation_ID);
  // console.log(all_non_states, sudan_non_states, south_non_states);
  // first five nonstate 
  // let all_first_five_nonstate = all_non_states.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
  // let sudan_first_five_nonstate = sudan_non_states.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
  // let south_first_five_nonstate = south_non_states.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
  //TODO further divide the above to regional,nonstate,global



  ///////////////////////// UNILATERAL MEDIATIONS ///////////////////////////////
  let unilateral = lateral_group[0][1];
  unilateral.forEach(function (d) {
    d.year = +d.year
  });
  // console.log(unilateral);

  //// STATE + NONSTATE
  // individual mediations: [mediationID, locale, etc.]
  let both_unilateral = unilateral
  let sudan_unilateral = both_unilateral.filter(function (d) {
    return d.conflict_locale == "Sudan"
  })
  let sousudan_unilateral = both_unilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan"
  })
  // console.log(both_unilateral, sudan_unilateral, sousudan_unilateral);
  // grouped mediations [UN: 128, Kenya: 57]
  let all_med_per_actor_unilateral = d3.groups(both_unilateral, d => d.third_party, d => d.mediation_ID)
  let sud_med_per_actor_unilateral = d3.groups(sudan_unilateral, d => d.third_party, d => d.mediation_ID)
  let sou_sud_med_per_actor_unilateral = d3.groups(sousudan_unilateral, d => d.third_party, d => d.mediation_ID)
  // console.log(all_med_per_actor_unilateral, sud_med_per_actor_unilateral, sou_sud_med_per_actor_unilateral);

  //// STATE
  // individual mediations: [mediationID, locale, etc.]
  let both_unilateral_state = both_unilateral.filter(function (d) {
    return d.third_party_type == "state"
  })
  let sudan_unilateral_state = both_unilateral.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type == "state"
  })
  let sousudan_unilateral_state = both_unilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type == "state"
  })
  // grouped mediations [UN: 128, Kenya: 57]
  let both_unilateral_group = d3.groups(both_unilateral_state, d => d.third_party, d => d.mediation_ID)
  let sudan_unilateral_group = d3.groups(sudan_unilateral_state, d => d.third_party, d => d.mediation_ID)
  let south_unilateral_group = d3.groups(sousudan_unilateral_state, d => d.third_party, d => d.mediation_ID)
  // console.log(both_unilateral_group, sudan_unilateral_group, south_unilateral_group);

  //// NONSTATE
  // individual mediations: [mediationID, locale, etc.]
  let both_unilateral_nonstate = both_unilateral.filter(function (d) {
    return d.third_party_type !== "state"
  })
  let sudan_unilateral_nonstate = both_unilateral.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type !== "state"
  })
  let south_unilateral_nonstate = both_unilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type !== "state"
  })
  // grouped mediations [UN: 128, Kenya: 57]
  // let both_unilateral_group_nonstate = d3.groups(both_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)
  // let sudan_unilateral_group_nonstate = d3.groups(sudan_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)
  // let south_unilateral_group_nonstate = d3.groups(south_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)
  // console.log(both_unilateral_group_nonstate, sudan_unilateral_group_nonstate, south_unilateral_group_nonstate);


  let counter = 0;
  ///////////////////////////////// FILTERS /////////////////////////////////
  d3.select("#filter_button").on("click", function () {
    counter += 1;
    if (counter % 2 !== 0) {
      d3.select("#filter_button")
        .transition().duration(500)
        .style("left", 255 + "px")
        .text("Hide")
      d3.select("#filters")
        .transition().duration(500)
        .style("left", 5 + "px")
    }
    else {
      d3.select("#filters")
        .transition().duration(500)
        .style("left", -250 + "px")
      d3.select("#filter_button")
        .transition().duration(500)
        .style("left", 0 + "px")
        .text("Filter")
    }
  })

  let button_pressed_lateral = "multilateral";
  let button_pressed_state = "state";
  let button_pressed_country = "all";
  let button_pressed_vis = "map";
  ///////////////////////////////LATERAL DROPDOWN////////////////////////////
  d3.select('#dropdown_lateral').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "Unilateral") {
      button_pressed_lateral = "unilateral";

      if (button_pressed_vis == "map") {
        if (button_pressed_country == "all") {
          if (button_pressed_state == "state") {
            draw_map(yrs, both_unilateral_group)
            draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(both_unilateral_nonstate, yrs)
            draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group)
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_state == "state") {
            draw_map(yrs, sudan_unilateral_group)
            draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(sudan_unilateral_nonstate, yrs)
            draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group)
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_state == "state") {
            draw_map(yrs, south_unilateral_group)
            draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(south_unilateral_nonstate, yrs)
            draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group)
          }
        }
      }
      else if (button_pressed_vis == "net") {
        if (button_pressed_country == "all") {
          if (button_pressed_state == "state") {
            data_sort(both_unilateral_state, yrs)
            draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(both_unilateral_nonstate, yrs)
            draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group)
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_state == "state") {
            data_sort(sudan_unilateral_state, yrs)
            draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(sudan_unilateral_nonstate, yrs)
            draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group)
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_state == "state") {
            data_sort(sousudan_unilateral_state, yrs)
            draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(south_unilateral_nonstate, yrs)
            draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group)
          }
        }
      }
    }

    else if (selected == "Multilateral") {
      button_pressed_lateral = "multilateral";

      if (button_pressed_vis == "map") {
        if (button_pressed_country == "all") {
          if (button_pressed_state == "state") {
            draw_map(yrs, all_just_states)
            draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group)
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_state == "state") {
            draw_map(yrs, sud_just_states)
            draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group)
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_state == "state") {
            draw_map(yrs, sou_sud_just_states)
            draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            nonstate_draw(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group)
          }
        }
      }

      else if (button_pressed_vis == "net") {
        if (button_pressed_country = "all") {
          if (button_pressed_state == "state") {
            data_sort(both_multilateral_indi_state, yrs)
            draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group)
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_state == "state") {
            data_sort(sudan_multilateral_indi_state, yrs)
            draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group)
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_state == "state") {
            data_sort(sousudan_multilateral_indi_state, yrs)
            draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states)
          }
          else if (button_pressed_state == "nonstate") {
            data_sort(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group)
          }
        }
      }
    }
  })


  ///////////////////////////////STATE DROPDOWN////////////////////////////
  d3.select('#dropdown_state').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "State") {
      button_pressed_state = "state";

      if (button_pressed_vis == "map") {
        d3.select("#nonstate")
          .transition().duration(1000)
          .style("left", - complete_width + "px")
        if (button_pressed_country == "all") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, all_just_states)
            draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, both_unilateral_group)
            draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state")
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, sud_just_states)
            draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, sudan_unilateral_group)
            draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state")
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, sou_sud_just_states)
            draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, south_unilateral_group)
            draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state")
          }
        }
      }
      else if (button_pressed_vis == "net") {
        if (button_pressed_country == "all") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(both_multilateral_indi_state, yrs)
            draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(both_unilateral_state, yrs)
            draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state")
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sudan_multilateral_indi_state, yrs)
            draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(sudan_unilateral_state, yrs)
            draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state")
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sousudan_multilateral_indi_state, yrs)
            draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(sousudan_unilateral_state, yrs)
            draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state")
          }
        }
      }
    }
    else if (selected == "Nonstate") {
      button_pressed_state = "nonstate";

      if (button_pressed_vis == "map") {
        d3.select("#nonstate")
          .transition().duration(1000)
          .style("left", 0 + "px")
        if (button_pressed_country == "all") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(both_unilateral_nonstate, yrs)
            draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate")
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(sudan_unilateral_nonstate, yrs)
            draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate")
          }

        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(south_unilateral_nonstate, yrs)
            draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate")
          }
        }
      }
      else if (button_pressed_vis == "net") {
        if (button_pressed_country == "all") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(both_unilateral_nonstate, yrs)
            draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate")
          }
        }
        else if (button_pressed_country == "sudan") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(sudan_unilateral_nonstate, yrs)
            draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate")
          }
        }
        else if (button_pressed_country == "south_sudan") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate")
          }
          else if (button_pressed_lateral == "unilateral") {
            data_sort(south_unilateral_nonstate, yrs)
            draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate")
          }
        }
      }
    }
  });


  ///////////////////////////////CONFLICT DROPDOWN////////////////////////////
  d3.select('#dropdown_country').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "All") {
      button_pressed_country = "all"

      if (button_pressed_vis == "map") {
        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, all_just_states)
            draw_bars(both_multilateral, context_data, "small", all_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, all_med_per_actor_unilateral)
            draw_bars(both_unilateral, context_data, "small", all_med_per_actor_unilateral)
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group)
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(both_unilateral_nonstate, yrs)
            draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group)
          }
        }
      }

      else if (button_pressed_vis == "net") {
        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(both_multilateral_indi_state, yrs)
            draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states)
          }
          if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(both_non_state, yrs)
            draw_bars(both_non_state, context_data, "small", both_unilateral_group)
          }
          else if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
      }
    }
    else if (selected == "Sudan") {
      button_pressed_country = "sudan"

      if (button_pressed_vis == "map") {
        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, sud_just_states)
            draw_bars(sudan_multilateral, context_data, "small", sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, sud_med_per_actor_unilateral)
            draw_bars(sudan_unilateral, context_data, "small", sud_med_per_actor_unilateral)
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(sudan_unilateral_nonstate, yrs)
            draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group)
          }
        }
      }
      else if (button_pressed_vis == "net") {
        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sudan_multilateral_indi_state, yrs)
            draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states)
          }
          if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sudan_non_state, yrs)
            draw_bars(sudan_non_state, context_data, "small", sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
      }
    }
    else if (selected == "South Sudan") {
      button_pressed_country = "south_sudan"

      if (button_pressed_vis == "map") {
        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            draw_map(yrs, sou_sud_just_states)
            draw_bars(sousudan_multilateral, context_data_south, "small", sou_sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            draw_map(yrs, sou_sud_med_per_actor_unilateral)
            draw_bars(sousudan_unilateral, context_data_south, "small", sou_sud_med_per_actor_unilateral)
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            nonstate_draw(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            nonstate_draw(south_unilateral_nonstate, yrs)
            draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group)
          }
        }
      }
      else if (button_pressed_vis == "net") {

        if (button_pressed_state == "state") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sousudan_multilateral_indi_state, yrs)
            draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states)
          }
          if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
        else if (button_pressed_state == "nonstate") {
          if (button_pressed_lateral == "multilateral") {
            data_sort(sousudan_non_state, yrs)
            draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states)
          }
          else if (button_pressed_lateral == "unilateral") {
            alert("no connections")
          }
        }
      }
    }
  })


  //Visualization Buttons
  d3.select('#map_button').on("click", function () {
    d3.select("#map_button").style("background-color", "#006297")
    d3.selectAll("#net_button, #time_button").style("background-color", "#071832")

    button_pressed_vis = "map"
    if (button_pressed_country == "all") {
      draw_map(yrs, all_just_states)
      draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states)
    }
    else if (button_pressed_country == "sudan") {
      draw_map(yrs, sud_just_states)
      draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states)
    }
    else if (button_pressed_country == "south_sudan") {
      draw_map(yrs, sou_sud_just_states)
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states)
    }
    d3.select("#bar")
      .transition().delay(1000)
      .style("background", "rgba(0, 0, 0, 0.5)")
    d3.selectAll("#net")
      .transition().duration(1000)
      .style("right", - complete_width + "px")
    d3.select("#title1")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 125 + "px")
    d3.select("#title2")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 5 + "px")
    //empty objsect to remove nodes and links
    let empty = {
      nodes: [{}],
      links: [{}]
    }
    //wait a second and remove nodes and links
    setTimeout(() => {
      update_net(empty, "update")
      simulation.stop()
      d3.selectAll(".node, .link, .network_nodename").remove()
    }, "1000");

  });

  d3.select('#net_button').on("click", function () {
    d3.select("#net_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #time_button").style("background-color", "#071832")
    button_pressed_vis = "net"
    if (button_pressed_country == "all") {
      data_sort(both_multilateral_indi_state, yrs)
      draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states)
    }
    else if (button_pressed_country == "sudan") {
      data_sort(sudan_multilateral_indi_state, yrs)
      draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states)
    }
    else if (button_pressed_country == "south_sudan") {
      data_sort(sousudan_multilateral_indi_state, yrs)
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states)
    }
    d3.select("#bar")
      .transition().delay(1000)
      .style("background", "none")
    d3.select("#net")
      .transition().duration(1000)
      .style("right", - 0 + "px")
    d3.select("#title1")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 125 + "px")
    d3.select("#title2")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 5 + "px")
  })

  d3.select('#time_button').on("click", function () {
    d3.select("#time_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #net_button").style("background-color", "#071832")
    button_pressed_vis = "time"
    if (button_pressed_country == "all") {
      draw_bars(both_multilateral, context_data, "big", all_just_states)
      draw_map(yrs, all_just_states)
    }
    else if (button_pressed_country == "sudan") {
      draw_bars(sudan_multilateral, context_data, "big", sud_just_states)
      draw_map(yrs, sud_just_states)
    }
    else if (button_pressed_country == "south_sudan") {
      draw_bars(sousudan_multilateral, context_data_south, "big", sou_sud_just_states)
      draw_map(yrs, sou_sud_just_states)
    }
    //black background
    d3.select("#bar")
      .style("background", "rgba(0, 0, 0, 0.8)")
    //move network to the right
    d3.selectAll("#net")
      .transition().duration(1000)
      .style("right", - complete_width + "px")
    //empty objsect to remove nodes and links
    let empty = {
      nodes: [{}],
      links: [{}]
    }
    d3.select("#title1")
      .transition().duration(1000)
      .style("font-size", 20 + "px")
      .style("bottom", net_height - 100 + "px")
    d3.select("#title2")
      .transition().duration(1000)
      .style("font-size", 20 + "px")
      .style("bottom", 80 + "px")
    //wait a second and remove nodes and links
    setTimeout(() => {
      update_net(empty, "update")
      simulation.stop()
      d3.selectAll(".node, .link, .network_nodename").remove()
    }, "1000");
  })


  /////////////////////////////INITIAL FUNCTIONS/////////////////////////////

  const draw_nonstate = function (non_state_data) {
    let color_scale = d3.scaleLinear()
      .domain([0, 130])
      .range(["#2F4F4F", "white"])

    non_state_data.sort((a, b) => a[1].length - b[1].length)
    top_five_svg.selectAll("#otherCircles")
      .data(non_state_data)
      .join("rect")
      .attr("x", 5)
      .attr("y", function (d, i) {
        return 200 - (i * 25 + 25)
      })
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .style("cursor", "pointer")
      // .attr("r", function (d) {
      //   return 10
      // })
      // .attr("cy", function (d, i) {
      //   return 200 - (i * 25 + 15)
      // })
      // .attr("cx", 7)
      .style("fill", function (d) {
        return color_scale(d[1].length)
      })
      .style("stroke", "black")
      .style("stroke-width", 0.5)
      .attr("class", "otherCircles")
      .on("click", function (d) {
        let non_state = d.target.__data__;
        let current_igo = non_state[0];
        let mediation_array = [];
        non_state[1].forEach(function (d) {
          mediation_array.push(d[0])
        })
        let partners = []
        data.forEach(function (d) {
          if (mediation_array.includes(d.mediation_ID)
            && d.third_party !== current_igo
            && d.third_party_type == "state") {
            partners.push(d)
          }
        })
        let the_partners = d3.groups(partners, d => d.third_party, d => d.mediation_ID)
        draw_map(yrs, the_partners)
        draw_bars(partners, context_data_south, "small", all_just_states)
      })


    top_five_svg.selectAll(".tooltip")
      .data(non_state_data)
      .join("text")
      .attr("text-anchor", "left")
      .attr("dx", function (d) {
        return "0.7em"
      })
      .attr("class", "tooltip")
      .attr("x", 23)
      .attr("y", function (d, i) {
        return 200 - (i * 25 + 10)
      })
      .text(function (d) {
        return d[0] + " (" + d[1].length + ")"
      })
      .style("font-size", 12)

  }

  d3.select("#map_button").style("background-color", "#006297")
  //draw leaflet map
  draw_map(yrs, all_just_states)
  //draw bar chart
  draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
  //draw nonstate 
  // draw_nonstate(all_first_five_nonstate)


})