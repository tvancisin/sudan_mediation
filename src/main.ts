import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import './css/style.css'
import {
  complete_width, simulation, context_data,
  net_height, top_five_svg, context_data_south
} from "./variables"
import { draw_bars } from './bar_chart';
import { nonstate_draw } from "./nonstate";
import { map, draw_map, init_map } from './leaf';
import { update_net } from './network';
import { data_sort } from './sort_data';
// years for brushing
let yrs = [1988, 2023]

//read in the data
d3.csv("/data/sudan_update.csv").then(function (data) {
  // multi + unilateral mediations
  // state + nonstate individual
  let all_sn_mu_i = data;
  let sudan_sn_mu_i = data.filter(function (d) {
    return d.conflict_locale == "Sudan"
  });
  let south_sn_mu_i = data.filter(function (d) {
    return d.conflict_locale == "South Sudan"
  });
  // state + nonstate group 
  let all_sn_mu_g = d3.groups(all_sn_mu_i, d => d.third_party, d => d.mediation_ID)
  let sudan_sn_mu_g = d3.groups(sudan_sn_mu_i, d => d.third_party, d => d.mediation_ID)
  let south_sn_mu_g = d3.groups(south_sn_mu_i, d => d.third_party, d => d.mediation_ID)

  // state individual
  let all_s_mu_i = data.filter(function (d) {
    return d.third_party_type == "state"
  })
  let sudan_s_mu_i = data.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type == "state"
  })
  let south_s_mu_i = data.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type == "state"
  })
  // state group
  let all_s_mu_g = d3.groups(all_s_mu_i, d => d.third_party, d => d.mediation_ID)
  let sudan_s_mu_g = d3.groups(sudan_s_mu_i, d => d.third_party, d => d.mediation_ID)
  let south_s_mu_g = d3.groups(south_s_mu_i, d => d.third_party, d => d.mediation_ID)

  // nonstate individual
  let all_n_mu_i = data.filter(function (d) {
    return d.third_party_type !== "state"
  })
  let sudan_n_mu_i = data.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type !== "state"
  })
  let south_n_mu_i = data.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type !== "state"
  })
  // nonstate group
  let all_n_mu_g = d3.groups(all_n_mu_i, d => d.third_party, d => d.mediation_ID)
  let sudan_n_mu_g = d3.groups(sudan_n_mu_i, d => d.third_party, d => d.mediation_ID)
  let south_n_mu_g = d3.groups(south_n_mu_i, d => d.third_party, d => d.mediation_ID)


  // multilateral mediations
  // state + nonstate
  let lateral_group = d3.groups(data, function (d) {
    return d.lateral == "multilateral"
  });
  let multilateral = lateral_group[1][1];
  multilateral.forEach(function (d) {
    d.year = +d.year
  });

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

  // state
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
  // grouped mediations: [ERITREA (97)]
  let all_just_states = d3.groups(both_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)
  let sud_just_states = d3.groups(sudan_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)
  let sou_sud_just_states = d3.groups(sousudan_multilateral_indi_state, d => d.third_party, d => d.mediation_ID)

  // nonstate 
  // individual mediations: [mediationID, locale, etc.]
  let both_non_state = both_multilateral.filter(function (d) {
    return d.third_party_type !== "state"
  })
  let sudan_non_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "Sudan" && d.third_party_type !== "state"
  })
  let sousudan_non_state = both_multilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan" && d.third_party_type !== "state"
  })
  // grouped mediations: [UN (128)] 
  let all_non_states = d3.groups(both_non_state, d => d.third_party, d => d.mediation_ID);
  let sudan_non_states = d3.groups(sudan_non_state, d => d.third_party, d => d.mediation_ID);
  let south_non_states = d3.groups(sousudan_non_state, d => d.third_party, d => d.mediation_ID);

  // unilateral mediations 
  // state + nonstate 
  let unilateral = lateral_group[0][1];
  unilateral.forEach(function (d) {
    d.year = +d.year
  });

  // individual mediations: [mediationID, locale, etc.]
  let both_unilateral = unilateral
  let sudan_unilateral = both_unilateral.filter(function (d) {
    return d.conflict_locale == "Sudan"
  })
  let sousudan_unilateral = both_unilateral.filter(function (d) {
    return d.conflict_locale == "South Sudan"
  })
  // grouped mediations [UN: 128, Kenya: 57]
  let all_med_per_actor_unilateral = d3.groups(both_unilateral, d => d.third_party, d => d.mediation_ID)
  let sud_med_per_actor_unilateral = d3.groups(sudan_unilateral, d => d.third_party, d => d.mediation_ID)
  let sou_sud_med_per_actor_unilateral = d3.groups(sousudan_unilateral, d => d.third_party, d => d.mediation_ID)

  // state
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

  // nonstate
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
  let both_unilateral_group_nonstate = d3.groups(both_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)
  let sudan_unilateral_group_nonstate = d3.groups(sudan_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)
  let south_unilateral_group_nonstate = d3.groups(south_unilateral_nonstate, d => d.third_party, d => d.mediation_ID)

  // filters
  let counter = 0;
  d3.select("#filter_button").on("click", function () {
    counter += 1;
    if (counter % 2 !== 0) {
      d3.select("#filter_button")
        .transition().duration(500)
        .style("left", 205 + "px")
        .text("Hide")
      d3.select("#filters")
        .transition().duration(500)
        .style("left", 5 + "px")
    }
    else {
      d3.select("#filters")
        .transition().duration(500)
        .style("left", -205 + "px")
      d3.select("#filter_button")
        .transition().duration(500)
        .style("left", 0 + "px")
        .text("Filter")
    }
  })
  // collaboration filter
  let counter_collab = 0;
  d3.select("#collab_button").on("click", function () {
    counter_collab += 1;
    if (counter_collab % 2 !== 0) {
      d3.select("#collab_button")
        .transition().duration(500)
        .style("left", 205 + "px")
        .text("Hide")
      d3.select("#collab")
        .transition().duration(500)
        .style("left", 5 + "px")
    }
    else {
      d3.select("#collab")
        .transition().duration(500)
        .style("left", -205 + "px")
      d3.select("#collab_button")
        .transition().duration(500)
        .style("left", 0 + "px")
        .text("Mediating with")
    }
  })

  //initial button pressed
  let button_pressed_lateral = "multilateral";
  let button_pressed_state = "state";
  let button_pressed_country = "all";
  let button_pressed_vis = "map";

  ///////////////////////////////LATERAL DROPDOWN////////////////////////////
  d3.select('#dropdown_lateral').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "Unilateral") {
      button_pressed_lateral = "unilateral";

      if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_map(yrs, both_unilateral_group)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sudan_unilateral_group)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, south_unilateral_group)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(both_unilateral_state, yrs)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_unilateral_state, yrs)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(sousudan_unilateral_state, yrs)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "net")
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar")
      }
    }

    else if (selected == "Multilateral") {
      button_pressed_lateral = "multilateral";

      if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_map(yrs, all_just_states)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sud_just_states)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, sou_sud_just_states)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(both_multilateral_indi_state, yrs)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_multilateral_indi_state, yrs)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(sousudan_multilateral_indi_state, yrs)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "net")
      }

      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_non_state, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(sousudan_non_state, context_data_south, "big", south_unilateral_group, "bar")
      }

    }

    else if (selected == "All") {
      button_pressed_lateral = "all";

      if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_map(yrs, all_s_mu_g)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sudan_s_mu_g)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, south_s_mu_g)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net")
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar")
      }

    }
  })


  // state dropdown
  d3.select('#dropdown_state').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "State") {
      button_pressed_state = "state";
      collaborations(all_non_states)

      if (button_pressed_vis == "map") {
        d3.select("#nonstate")
          .transition().duration(1000)
          .style("left", - complete_width + "px")
        if (button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, all_just_states)
          draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, both_unilateral_group)
          draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state")
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "all") {
          draw_map(yrs, all_s_mu_g)
          draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, sud_just_states)
          draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, sudan_unilateral_group)
          draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "all") {
          draw_map(yrs, sudan_s_mu_g)
          draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, sou_sud_just_states)
          draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, south_unilateral_group)
          draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
          draw_map(yrs, south_s_mu_g)
          draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state")
        }
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        data_sort(both_multilateral_indi_state, yrs)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        data_sort(both_unilateral_state, yrs)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_multilateral_indi_state, yrs)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sudan_unilateral_state, yrs)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_multilateral_indi_state, yrs)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sousudan_unilateral_state, yrs)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net")
      }

      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar")
      }

    }

    else if (selected == "Organizations") {
      button_pressed_state = "nonstate";
      collaborations(all_s_mu_g)

      if (button_pressed_vis == "map") {
        d3.select("#nonstate")
          .transition().duration(1000)
          .style("left", 0 + "px")
        if (button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
          nonstate_draw(both_non_state, yrs)
          draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
          nonstate_draw(both_unilateral_nonstate, yrs)
          draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "all") {
          nonstate_draw(all_n_mu_i, yrs)
          draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
          nonstate_draw(sudan_non_state, yrs)
          draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
          nonstate_draw(sudan_unilateral_nonstate, yrs)
          draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "all") {
          nonstate_draw(sudan_n_mu_i, yrs)
          draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
          nonstate_draw(sousudan_non_state, yrs)
          draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
          nonstate_draw(south_unilateral_nonstate, yrs)
          draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate")
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
          nonstate_draw(south_n_mu_i, yrs)
          draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate")
        }
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        data_sort(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        data_sort(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net")
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_non_state, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_non_state, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar")
      }
    }
  });


  // conflict dropdown
  d3.select('#dropdown_country').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "All") {
      button_pressed_country = "all"

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, all_just_states)
        draw_bars(both_multilateral, context_data, "small", all_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, all_med_per_actor_unilateral)
        draw_bars(both_unilateral, context_data, "small", all_med_per_actor_unilateral, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, all_s_mu_g)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        data_sort(both_multilateral_indi_state, yrs)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net")
      }


      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar")
      }
    }

    else if (selected == "Sudan") {
      button_pressed_country = "sudan"

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, sud_just_states)
        draw_bars(sudan_multilateral, context_data, "small", sud_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, sud_med_per_actor_unilateral)
        draw_bars(sudan_unilateral, context_data, "small", sud_med_per_actor_unilateral, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, sudan_s_mu_g)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sud_just_states, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_multilateral_indi_state, yrs)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_n_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net")
      }

      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_n_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_non_state, context_data, "big", sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar")
      }

    }

    else if (selected == "South Sudan") {
      button_pressed_country = "south_sudan"

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, sou_sud_just_states)
        draw_bars(sousudan_multilateral, context_data_south, "small", sou_sud_just_states, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, sou_sud_med_per_actor_unilateral)
        draw_bars(sousudan_unilateral, context_data_south, "small", sou_sud_med_per_actor_unilateral, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, south_s_mu_g)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate")
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate")
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_multilateral_indi_state, yrs)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "net")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net")
      }


      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_non_state, context_data_south, "big", sou_sud_just_states, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar")
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar")
      }
    }
  })


  //Visualization Buttons
  d3.select('#map_button').on("click", function () {
    d3.select("#map_button").style("background-color", "#006297")
    d3.selectAll("#net_button, #time_button").style("background-color", "#071832")

    button_pressed_vis = "map"
    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, all_just_states)
      draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, both_unilateral_group)
      draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, all_s_mu_g)
      draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", all_non_states, "nonstate")
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group_nonstate, "nonstate")
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate")
      }
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, sud_just_states)
      draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, sudan_unilateral_group)
      draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, sudan_s_mu_g)
      draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_non_states, "nonstate")
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group_nonstate, "nonstate")
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate")
      }
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, sou_sud_just_states)
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, south_unilateral_group)
      draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, south_s_mu_g)
      draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "nonstate")
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group_nonstate, "nonstate")
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate")
      }
    }
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
    //empty object to remove nodes and links
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
    d3.select("#nonstate")
      .transition().duration(1000)
      .style("left", - complete_width + "px")
    d3.select("#net_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #time_button").style("background-color", "#071832")
    button_pressed_vis = "net"

    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      data_sort(both_multilateral_indi_state, yrs)
      draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      data_sort(both_unilateral_state, yrs)
      draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      data_sort(all_s_mu_i, yrs)
      draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      data_sort(both_non_state, yrs)
      draw_bars(both_non_state, context_data, "small", all_non_states, "net")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      data_sort(both_unilateral_nonstate, yrs)
      draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group_nonstate, "net")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      data_sort(all_n_mu_i, yrs)
      draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net")
    }

    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      data_sort(sudan_multilateral_indi_state, yrs)
      draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      data_sort(sudan_unilateral_state, yrs)
      draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      data_sort(sudan_s_mu_i, yrs)
      draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      data_sort(sudan_non_state, yrs)
      draw_bars(sudan_non_state, context_data, "small", sudan_non_states, "net")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      data_sort(sudan_unilateral_nonstate, yrs)
      draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group_nonstate, "net")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      data_sort(sudan_n_mu_i, yrs)
      draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net")
    }

    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      data_sort(sousudan_multilateral_indi_state, yrs)
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      data_sort(sousudan_unilateral_state, yrs)
      draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      data_sort(south_s_mu_i, yrs)
      draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      data_sort(sousudan_non_state, yrs)
      draw_bars(sousudan_non_state, context_data_south, "small", south_non_states, "net")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      data_sort(south_unilateral_nonstate, yrs)
      draw_bars(south_unilateral_nonstate, context_data, "small", south_unilateral_group_nonstate, "net")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      data_sort(south_n_mu_i, yrs)
      draw_bars(south_n_mu_i, context_data, "small", south_n_mu_g, "net")
    }

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
    d3.select("#nonstate")
      .transition().duration(1000)
      .style("left", - complete_width + "px")
    d3.select("#time_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #net_button").style("background-color", "#071832")
    button_pressed_vis = "time"
    console.log(button_pressed_country, button_pressed_state, button_pressed_lateral);

    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(both_unilateral, context_data, "big", all_just_states, "bar")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(both_non_state, context_data, "big", all_non_states, "bar")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group_nonstate, "bar")
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar")
    }


    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(sudan_non_state, context_data, "big", sudan_non_states, "bar")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group_nonstate, "bar")
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar")
    }

    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(sousudan_non_state, context_data_south, "big", south_non_states, "bar")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(south_unilateral_nonstate, context_data, "big", south_unilateral_group_nonstate, "bar")
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(south_n_mu_i, context_data, "big", south_n_mu_g, "bar")
    }

    // else if (button_pressed_country == "sudan") {
    //   draw_bars(sudan_multilateral, context_data, "big", sud_just_states)
    //   draw_map(yrs, sud_just_states)
    // }
    // else if (button_pressed_country == "south_sudan") {
    //   draw_bars(sousudan_multilateral, context_data_south, "big", sou_sud_just_states)
    //   draw_map(yrs, sou_sud_just_states)
    // }
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

  const collaborations = function (non_state_data) {
    let five = non_state_data.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
    let max = five[0][1].length

    let color_scale = d3.scaleLinear()
      .domain([0, max])
      .range([5, 40])

    five.sort((a, b) => a[1].length - b[1].length)
    top_five_svg.selectAll(".otherCircles")
      .data(five)
      .join("rect")
      .attr("x", 15)
      .attr("y", function (d, i) {
        return 130 - (i * 25 + 25)
      })
      .attr("width", function (d) {
        return color_scale(d[1].length)
      })
      .attr("height", 20)
      .attr("rx", 3)
      .style("cursor", "pointer")
      .style("fill", function (d) {
        return "white"
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

        console.log(non_state, current_igo, mediation_array);
        
        let partners = []
        if (button_pressed_vis == "map" && button_pressed_state == "state") {
          data.forEach(function (d) {
            if (mediation_array.includes(d.mediation_ID)
              && d.third_party !== current_igo
              && d.third_party_type == "state") {
              partners.push(d)
            }
          })
          let the_partners = d3.groups(partners, d => d.third_party, d => d.mediation_ID)
          draw_map(yrs, the_partners)
          draw_bars(partners, context_data, "small", all_just_states, "state")
        }
        else if (button_pressed_vis == "map" && button_pressed_state == "nonstate") {
          data.forEach(function (d) {
            if (mediation_array.includes(d.mediation_ID)
              && d.third_party !== current_igo
              && d.third_party_type != "state") {
              partners.push(d)
            }
          })
          nonstate_draw(partners, yrs)
          draw_bars(partners, context_data, "small", all_just_states, "nonstate")
        }

        else if (button_pressed_vis == "net" && button_pressed_state == "state") {
          data.forEach(function (d) {
            if ((mediation_array.includes(d.mediation_ID)) && (d.third_party == current_igo || d.third_party_type == "state")) {
              partners.push(d)
            }
          })
          data_sort(partners, yrs)
          draw_bars(partners, context_data, "small", all_just_states, "net")
        }

        else if (button_pressed_vis == "net" && button_pressed_state == "nonstate") {
          data.forEach(function (d) {
            if ((mediation_array.includes(d.mediation_ID)) && (d.third_party == current_igo || d.third_party_type !== "state")) {
              partners.push(d)
            }
          })
          data_sort(partners, yrs)
          draw_bars(partners, context_data, "small", all_just_states, "net")
        }
      })

    top_five_svg.selectAll(".tooltip")
      .data(five)
      .join("text")
      .attr("text-anchor", "left")
      .attr("dx", function (d) {
        return color_scale(d[1].length) - 10;
      })
      .attr("class", "tooltip")
      .attr("x", 30)
      .attr("y", function (d, i) {
        return 130 - (i * 25 + 10)
      })
      .text(function (d) {
        let country;
        if (d[0] == "United States of America") {
          country = "USA"
        }
        else {
          country = d[0]
        }
        return country + " (" + d[1].length + ")"
      })
      .style("font-size", 12)
  }

  d3.select("#map_button").style("background-color", "#006297")

  //draw leaflet map
  init_map(function () {
    draw_map(yrs, all_just_states)
  })

  //draw bar chart
  draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
  //draw nonstate 
  collaborations(all_non_states)

  //reset everything
  d3.select(".button1").on("click", function (d) {
    counter = 0;
    counter_collab = 0;
    d3.select("#filters")
      .transition().duration(500)
      .style("left", -250 + "px")
    d3.select("#filter_button")
      .transition().duration(500)
      .style("left", 0 + "px")
      .text("Filter")
    d3.select("#country").transition().duration(500)
      .style("right", -355 + "px")
    d3.select("#title1")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 125 + "px")
    d3.select("#title2")
      .transition().duration(1000)
      .style("font-size", 12 + "px")
      .style("bottom", 5 + "px")
    button_pressed_lateral = "multilateral";
    button_pressed_state = "state";
    button_pressed_country = "all";
    button_pressed_vis = "map";
    // map.flyTo([25, 5], 2.5, { duration: 1 });
    map.flyTo({
      center: [10, 9],
      zoom: 1.6,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });
    draw_map(yrs, all_just_states, data)
    draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state")
    d3.selectAll("#net_button, #time_button").style("background-color", "#071832")
    d3.select("#map_button").style("background-color", "#006297")
    d3.select("#nonstate")
      .transition().duration(1000)
      .style("left", - complete_width + "px")
    d3.selectAll("#net")
      .transition().duration(1000)
      .style("right", - complete_width + "px")
  })
})
