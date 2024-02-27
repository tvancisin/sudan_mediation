import * as d3 from "d3";
import 'leaflet/dist/leaflet.css';
import './css/style.css'
// import {
//   complete_width, simulation, context_data, zoom_level,
//   net_height, top_five_svg, context_data_south
// } from "./variables"
import {
  complete_width, context_data, zoom_level,
  net_height, top_five_svg, context_data_south
} from "./variables"
import { draw_bars } from './bar_chart';
import { nonstate_draw } from "./nonstate";
import { map, draw_map, init_map } from './leaf';
import { update_net } from './network';
import { data_sort } from './sort_data';
// years for brushing
let yrs = [1988, 2023];

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

  // //draw leaflet map
  init_map(function () {
    draw_map(yrs, all_just_states, data)
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
        draw_map(yrs, both_unilateral_group, data)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(both_unilateral_nonstate, yrs, data)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sudan_unilateral_group, data)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_unilateral_nonstate, yrs, data)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, south_unilateral_group, data)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(south_unilateral_nonstate, yrs, data)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(both_unilateral_state, yrs)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_unilateral_state, yrs)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(sousudan_unilateral_state, yrs)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "net", data)
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar", data)
      }
    }

    else if (selected == "Multilateral") {
      button_pressed_lateral = "multilateral";

      if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_map(yrs, all_just_states, data)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(both_non_state, yrs, data)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sud_just_states, data)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_non_state, yrs, data)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, sou_sud_just_states, data)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sousudan_non_state, yrs, data)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(both_multilateral_indi_state, yrs)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_multilateral_indi_state, yrs)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(sousudan_multilateral_indi_state, yrs)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "net", data)
      }

      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_non_state, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(sousudan_non_state, context_data_south, "big", south_unilateral_group, "bar", data)
      }

    }

    else if (selected == "All") {
      button_pressed_lateral = "all";

      if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_map(yrs, all_s_mu_g, data)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        nonstate_draw(all_n_mu_i, yrs, data)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_map(yrs, sudan_s_mu_g, data)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(sudan_n_mu_i, yrs, data)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_map(yrs, south_s_mu_g, data)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        nonstate_draw(south_n_mu_i, yrs, data)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "state") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net", data)
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "state") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_state == "nonstate") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "state") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "state") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar", data)
      }

    }
  })


  // state dropdown
  d3.select('#dropdown_state').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "States") {
      button_pressed_state = "state";
      collaborations(all_non_states)

      if (button_pressed_vis == "map") {
        d3.select("#nonstate")
          .transition().duration(1000)
          .style("left", - complete_width + "px")
        if (button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, all_just_states, data)
          draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, both_unilateral_group, data)
          draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state", data)
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "all") {
          draw_map(yrs, all_s_mu_g, data)
          draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, sud_just_states, data)
          draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, sudan_unilateral_group, data)
          draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "all") {
          draw_map(yrs, sudan_s_mu_g, data)
          draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
          draw_map(yrs, sou_sud_just_states, data)
          draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
          draw_map(yrs, south_unilateral_group, data)
          draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
          draw_map(yrs, south_s_mu_g, data)
          draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state", data)
        }
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        data_sort(both_multilateral_indi_state, yrs)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        data_sort(both_unilateral_state, yrs)
        draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_multilateral_indi_state, yrs)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sudan_unilateral_state, yrs)
        draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_multilateral_indi_state, yrs)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sousudan_unilateral_state, yrs)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net", data)
      }

      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar", data)
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
          nonstate_draw(both_non_state, yrs, data)
          draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
          nonstate_draw(both_unilateral_nonstate, yrs, data)
          draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "all" && button_pressed_lateral == "all") {
          nonstate_draw(all_n_mu_i, yrs, data)
          draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
          nonstate_draw(sudan_non_state, yrs, data)
          draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
          nonstate_draw(sudan_unilateral_nonstate, yrs, data)
          draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "sudan" && button_pressed_lateral == "all") {
          nonstate_draw(sudan_n_mu_i, yrs, data)
          draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
          nonstate_draw(sousudan_non_state, yrs, data)
          draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
          nonstate_draw(south_unilateral_nonstate, yrs, data)
          draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate", data)
        }
        else if (button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
          nonstate_draw(south_n_mu_i, yrs, data)
          draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate", data)
        }
      }

      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        data_sort(both_unilateral_nonstate, yrs)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        data_sort(sudan_unilateral_nonstate, yrs)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", south_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        data_sort(south_unilateral_nonstate, yrs)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net", data)
      }


      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "multilateral") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "all" && button_pressed_lateral == "all") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_non_state, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "sudan" && button_pressed_lateral == "all") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_non_state, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "unilateral") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_country == "south_sudan" && button_pressed_lateral == "all") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar", data)
      }
    }
  });


  // conflict dropdown
  d3.select('#dropdown_country').on("change", function () {
    let selected = d3.select(this).property('value')

    if (selected == "All") {
      button_pressed_country = "all"

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, all_just_states, data)
        draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, all_med_per_actor_unilateral, data)
        draw_bars(both_unilateral_state, context_data, "small", all_med_per_actor_unilateral, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, all_s_mu_g, data)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(both_non_state, yrs, data)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(both_unilateral_nonstate, yrs, data)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(all_n_mu_i, yrs, data)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        data_sort(all_sn_mu_i, yrs)
        draw_bars(all_sn_mu_i, context_data, "small", all_just_states, "net", data)

        // data_sort(both_multilateral_indi_state, yrs)
        // draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(all_s_mu_i, yrs)
        draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(both_non_state, yrs)
        draw_bars(both_non_state, context_data, "small", both_unilateral_group, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(all_n_mu_i, yrs)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net", data)
      }


      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(both_non_state, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar", data)
      }
    }

    else if (selected == "Sudan") {
      button_pressed_country = "sudan"

      console.log(button_pressed_country, button_pressed_lateral, button_pressed_state, button_pressed_vis);

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, sud_just_states, data)
        draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, sud_med_per_actor_unilateral, data)
        draw_bars(sudan_unilateral_state, context_data, "small", sud_med_per_actor_unilateral, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, sudan_s_mu_g, data)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(sudan_non_state, yrs, data)
        draw_bars(sudan_non_state, context_data, "small", sud_just_states, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(sudan_unilateral_nonstate, yrs, data)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(sudan_n_mu_i, yrs, data)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        // data_sort(sudan_multilateral_indi_state, yrs)
        // draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net", data)

        data_sort(sudan_sn_mu_i, yrs)
        draw_bars(sudan_sn_mu_i, context_data, "small", all_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(sudan_s_mu_i, yrs)
        draw_bars(sudan_s_mu_i, context_data, "small", sudan_n_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(sudan_non_state, yrs)
        draw_bars(sudan_non_state, context_data, "small", sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(sudan_n_mu_i, yrs)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net", data)
      }

      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(sudan_s_mu_i, context_data, "big", sudan_n_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(sudan_non_state, context_data, "big", sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar", data)
      }

    }

    else if (selected == "South Sudan") {
      button_pressed_country = "south_sudan"

      if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_map(yrs, sou_sud_just_states, data)
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_map(yrs, sou_sud_med_per_actor_unilateral, data)
        draw_bars(sousudan_unilateral_state, context_data_south, "small", sou_sud_med_per_actor_unilateral, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_map(yrs, south_s_mu_g, data)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        nonstate_draw(sousudan_non_state, yrs, data)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        nonstate_draw(south_unilateral_nonstate, yrs, data)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group, "nonstate", data)
      }
      else if (button_pressed_vis == "map" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        nonstate_draw(south_n_mu_i, yrs, data)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate", data)
      }

      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {

        data_sort(south_sn_mu_i, yrs)
        draw_bars(south_sn_mu_i, context_data, "small", all_just_states, "net", data)

        // data_sort(sousudan_multilateral_indi_state, yrs)
        // draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        data_sort(south_s_mu_i, yrs)
        draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        data_sort(sousudan_non_state, yrs)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "net", data)
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        console.log("no connections")
      }
      else if (button_pressed_vis == "net" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        data_sort(south_n_mu_i, yrs)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "net", data)
      }


      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
        draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "state" && button_pressed_lateral == "all") {
        draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
        draw_bars(sousudan_non_state, context_data_south, "big", sou_sud_just_states, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
        draw_bars(south_unilateral_nonstate, context_data_south, "big", south_unilateral_group, "bar", data)
      }
      else if (button_pressed_vis == "time" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
        draw_bars(south_n_mu_i, context_data_south, "big", south_n_mu_g, "bar", data)
      }
    }
  })

  //Visualization Buttons
  d3.select('#map_button').on("click", function () {
    button_pressed_vis = "map"
    d3.select("#bar")
      .transition().duration(1000)
      .style("bottom", 0 + "px")
    d3.select("#map_button").style("background-color", "#006297")
    d3.selectAll("#net_button, #time_button").style("background-color", "#04AA6D")
    d3.selectAll("#org-legend, #org-legend-lateral").transition().duration(800)
      .style("opacity", 0)
      .style("visibility", "hidden")
    d3.select("#filters").style("height", 270 + "px")
    d3.select("#state_drop_div").style("visibility", "visible")

    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, all_just_states, data)
      draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, both_unilateral_group, data)
      draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "state", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, all_s_mu_g, data)
      draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "state", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(both_non_state, yrs, data)
        draw_bars(both_non_state, context_data, "small", all_non_states, "nonstate", data)
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(both_unilateral_nonstate, yrs, data)
        draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group_nonstate, "nonstate", data)
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(all_n_mu_i, yrs, data)
        draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "nonstate", data)
      }
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, sud_just_states, data)
      draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "state", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, sudan_unilateral_group, data)
      draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "state", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, sudan_s_mu_g, data)
      draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "state", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(sudan_non_state, yrs, data)
        draw_bars(sudan_non_state, context_data, "small", sudan_non_states, "nonstate", data)
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(sudan_unilateral_nonstate, yrs, data)
        draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group_nonstate, "nonstate", data)
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(sudan_n_mu_i, yrs, data)
        draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "nonstate", data)
      }
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_map(yrs, sou_sud_just_states, data)
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "state", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_map(yrs, south_unilateral_group, data)
      draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "state", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_map(yrs, south_s_mu_g, data)
      draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "state", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate") {
      d3.select("#nonstate")
        .transition().duration(1000)
        .style("left", 0 + "px")
      if (button_pressed_lateral == "multilateral") {
        nonstate_draw(sousudan_non_state, yrs, data)
        draw_bars(sousudan_non_state, context_data_south, "small", sou_sud_just_states, "nonstate", data)
      }
      else if (button_pressed_lateral == "unilateral") {
        nonstate_draw(south_unilateral_nonstate, yrs, data)
        draw_bars(south_unilateral_nonstate, context_data_south, "small", south_unilateral_group_nonstate, "nonstate", data)
      }
      else if (button_pressed_lateral == "all") {
        nonstate_draw(south_n_mu_i, yrs, data)
        draw_bars(south_n_mu_i, context_data_south, "small", south_n_mu_g, "nonstate", data)
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
    // let empty = {
    //   nodes: [{}],
    //   links: [{}]
    // }
    // //wait a second and remove nodes and links
    // setTimeout(() => {
    //   update_net(empty, "update")
    //   simulation.stop()
    //   d3.selectAll(".node, .link, .network_nodename").remove()
    // }, "1000");

  });

  d3.select('#net_button').on("click", function () {
    d3.select("#nonstate")
      .transition().duration(1000)
      .style("left", - complete_width + "px")
    d3.select("#net")
      .transition().duration(1000)
      .style("right", - 0 + "px")
    d3.select("#net_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #time_button").style("background-color", "#04AA6D")
    d3.selectAll("#org-legend, #org-legend-lateral").transition().duration(800)
      .style("opacity", 0)
      .style("visibility", "hidden")
    button_pressed_vis = "net"
    d3.select("#state_drop_div").style("visibility", "hidden")
    d3.select("#filters").style("height", 190 + "px")
    // data_sort(sousudan_multilateral_indi_state, yrs)
    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(all_sn_mu_i, context_data, "small", all_just_states, "net", data)
    }

    // if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
    //   data_sort(both_multilateral_indi_state, yrs)
    //   draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "net", data)
    // }
    // else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
    //   data_sort(both_unilateral_state, yrs)
    //   draw_bars(both_unilateral_state, context_data, "small", both_unilateral_group, "net", data)
    // }
    // else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
    //   data_sort(all_s_mu_i, yrs)
    //   draw_bars(all_s_mu_i, context_data, "small", all_s_mu_g, "net", data)
    // }
    // else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
    //   data_sort(both_non_state, yrs)
    //   draw_bars(both_non_state, context_data, "small", all_non_states, "net", data)
    // }
    // else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
    //   data_sort(both_unilateral_nonstate, yrs)
    //   draw_bars(both_unilateral_nonstate, context_data, "small", both_unilateral_group_nonstate, "net", data)
    // }
    // else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
    //   data_sort(all_n_mu_i, yrs)
    //   draw_bars(all_n_mu_i, context_data, "small", all_n_mu_g, "net", data)
    // }

    // else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
    //   data_sort(sudan_multilateral_indi_state, yrs)
    //   draw_bars(sudan_multilateral_indi_state, context_data, "small", sud_just_states, "net", data)
    // }
    // else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
    //   data_sort(sudan_unilateral_state, yrs)
    //   draw_bars(sudan_unilateral_state, context_data, "small", sudan_unilateral_group, "net", data)
    // }
    // else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
    //   data_sort(sudan_s_mu_i, yrs)
    //   draw_bars(sudan_s_mu_i, context_data, "small", sudan_s_mu_g, "net", data)
    // }
    // else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
    //   data_sort(sudan_non_state, yrs)
    //   draw_bars(sudan_non_state, context_data, "small", sudan_non_states, "net", data)
    // }
    // else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
    //   data_sort(sudan_unilateral_nonstate, yrs)
    //   draw_bars(sudan_unilateral_nonstate, context_data, "small", sudan_unilateral_group_nonstate, "net", data)
    // }
    // else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
    //   data_sort(sudan_n_mu_i, yrs)
    //   draw_bars(sudan_n_mu_i, context_data, "small", sudan_n_mu_g, "net", data)
    // }

    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
    //   data_sort(sousudan_multilateral_indi_state, yrs)
    //   draw_bars(sousudan_multilateral_indi_state, context_data_south, "small", sou_sud_just_states, "net", data)
    // }
    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
    //   data_sort(sousudan_unilateral_state, yrs)
    //   draw_bars(sousudan_unilateral_state, context_data_south, "small", south_unilateral_group, "net", data)
    // }
    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
    //   data_sort(south_s_mu_i, yrs)
    //   draw_bars(south_s_mu_i, context_data_south, "small", south_s_mu_g, "net", data)
    // }
    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
    //   data_sort(sousudan_non_state, yrs)
    //   draw_bars(sousudan_non_state, context_data_south, "small", south_non_states, "net", data)
    // }
    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
    //   data_sort(south_unilateral_nonstate, yrs)
    //   draw_bars(south_unilateral_nonstate, context_data, "small", south_unilateral_group_nonstate, "net", data)
    // }
    // else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
    //   data_sort(south_n_mu_i, yrs)
    //   draw_bars(south_n_mu_i, context_data, "small", south_n_mu_g, "net", data)
    // }

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
    d3.selectAll("#org-legend, #org-legend-lateral").transition().delay(500).duration(1000)
      .style("opacity", 1).style("visibility", "visible")
    d3.select("#time_button").style("background-color", "#006297")
    d3.selectAll("#map_button, #net_button").style("background-color", "#04AA6D")
    button_pressed_vis = "time"
    d3.select("#filters").style("height", 270 + "px")
    d3.select("#state_drop_div").style("visibility", "visible")

    if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(both_multilateral_indi_state, context_data, "big", all_just_states, "bar", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(both_unilateral, context_data, "big", all_just_states, "bar", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(all_s_mu_i, context_data, "big", all_s_mu_g, "bar", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(both_non_state, context_data, "big", all_non_states, "bar", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(both_unilateral_nonstate, context_data, "big", both_unilateral_group_nonstate, "bar", data)
    }
    else if (button_pressed_country == "all" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(all_n_mu_i, context_data, "big", all_n_mu_g, "bar", data)
    }


    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(sudan_multilateral_indi_state, context_data, "big", sud_just_states, "bar", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(sudan_unilateral_state, context_data, "big", sudan_unilateral_group, "bar", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(sudan_s_mu_i, context_data, "big", sudan_s_mu_g, "bar", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(sudan_non_state, context_data, "big", sudan_non_states, "bar", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(sudan_unilateral_nonstate, context_data, "big", sudan_unilateral_group_nonstate, "bar", data)
    }
    else if (button_pressed_country == "sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(sudan_n_mu_i, context_data, "big", sudan_n_mu_g, "bar", data)
    }

    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "multilateral") {
      draw_bars(sousudan_multilateral_indi_state, context_data_south, "big", sou_sud_just_states, "bar", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "unilateral") {
      draw_bars(sousudan_unilateral_state, context_data_south, "big", south_unilateral_group, "bar", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "state" && button_pressed_lateral == "all") {
      draw_bars(south_s_mu_i, context_data_south, "big", south_s_mu_g, "bar", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "multilateral") {
      draw_bars(sousudan_non_state, context_data_south, "big", south_non_states, "bar", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "unilateral") {
      draw_bars(south_unilateral_nonstate, context_data, "big", south_unilateral_group_nonstate, "bar", data)
    }
    else if (button_pressed_country == "south_sudan" && button_pressed_state == "nonstate" && button_pressed_lateral == "all") {
      draw_bars(south_n_mu_i, context_data, "big", south_n_mu_g, "bar", data)
    }

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
      .style("bottom", net_height - 50 + "px")
    d3.select("#title2")
      .transition().duration(1000)
      .style("font-size", 20 + "px")
      .style("bottom", 20 + "px")
    //wait a second and remove nodes and links
    setTimeout(() => {
      update_net(empty, "update")
      simulation.stop()
      d3.selectAll(".node, .link, .network_nodename").remove()
    }, "1000");
  })

  const collaborations = function (non_state_data) {
    let five = non_state_data.sort((a, b) => b[1].length - a[1].length).slice(0, 5);
    five.sort((a, b) => a[1].length - b[1].length)
    top_five_svg.selectAll(".rectangles")
      .data(five)
      .join("rect")
      .attr("x", 15)
      .attr("y", function (d, i) {
        return 130 - (i * 25 + 25)
      })
      .attr("width", 20)
      .attr("height", 20)
      .attr("rx", 3)
      .style("cursor", "pointer")
      .style("fill", "white")
      .style("fill-opacity", 0)
      .style("stroke", "white")
      .style("stroke-width", 0.5)
      .attr("class", "rectangles")
      .on("click", function (d) {
        d3.selectAll(".rectangles").style("fill-opacity", 0)
        d3.select(this).style("fill-opacity", 0.5)
        let non_state = d.target.__data__;
        let current_igo = non_state[0];
        let mediation_array = [];
        non_state[1].forEach(function (d) {
          mediation_array.push(d[0])
        })
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
          draw_map(yrs, the_partners, data)
          draw_bars(partners, context_data, "small", all_just_states, "state", data)
        }
        else if (button_pressed_vis == "map" && button_pressed_state == "nonstate") {
          data.forEach(function (d) {
            if (mediation_array.includes(d.mediation_ID)
              && d.third_party !== current_igo
              && d.third_party_type != "state") {
              partners.push(d)
            }
          })
          nonstate_draw(partners, yrs, data)
          draw_bars(partners, context_data, "small", all_just_states, "nonstate", data)
        }

        else if (button_pressed_vis == "net" && button_pressed_state == "state") {
          data.forEach(function (d) {
            if ((mediation_array.includes(d.mediation_ID)) && (d.third_party == current_igo || d.third_party_type == "state")) {
              partners.push(d)
            }
          })
          data_sort(partners, yrs)
          draw_bars(partners, context_data, "small", all_just_states, "net", data)
        }

        else if (button_pressed_vis == "net" && button_pressed_state == "nonstate") {
          data.forEach(function (d) {
            if ((mediation_array.includes(d.mediation_ID)) && (d.third_party == current_igo || d.third_party_type !== "state")) {
              partners.push(d)
            }
          })
          data_sort(partners, yrs)
          draw_bars(partners, context_data, "small", all_just_states, "net", data)
        }
      })

    top_five_svg.selectAll(".tooltip")
      .data(five)
      .join("text")
      .attr("text-anchor", "left")
      .attr("dx", 10)
      .attr("class", "tooltip")
      .attr("x", 40)
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
        return country
      })
      .style("font-size", 12)
  }

  // filters
  let counter = 0;
  d3.select("#filter_button").on("click", function () {
    counter += 1;
    if (counter % 2 !== 0) {
      d3.select("#filter_button")
        .transition().duration(500)
        .style("left", 205 + "px")
        .style("background-color", "#006297")
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
        .style("background-color", "#04AA6D")
        .text("Filter")
    }
  })
  // info
  let counter_collab = 0;
  d3.select("#info_button").on("click", function () {
    counter_collab += 1;
    if (counter_collab % 2 !== 0) {
      d3.select("#info")
        .transition().duration(500)
        .style("right", 0 + "px")
    }
    else {
      d3.select("#info")
        .transition().duration(500)
        .style("right", -405 + "px")
    }
  })

  //draw bar chart
  draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
  //draw nonstate 
  collaborations(all_non_states)
  //draw network 
  data_sort(all_sn_mu_i, yrs)

  //reset everything
  d3.select("#refresh_button").on("click", function (d) {
    d3.selectAll("#org-legend, #org-legend-lateral").transition().duration(800)
      .style("opacity", 0)
      .style("visibility", "hidden")
    button_pressed_lateral = "multilateral";
    button_pressed_state = "state";
    button_pressed_country = "all";
    button_pressed_vis = "map";
    counter = 0;
    counter_collab = 0;
    draw_map(yrs, all_just_states, data)
    draw_bars(both_multilateral_indi_state, context_data, "small", all_just_states, "state", data)
    collaborations(all_non_states)
    // let empty = {
    //   nodes: [{}],
    //   links: [{}]
    // }
    // //wait a second and remove nodes and links
    // setTimeout(() => {
    //   update_net(empty, "update")
    //   simulation.stop()
    //   d3.selectAll(".node, .link, .network_nodename").remove()
    // }, "1000");
    // map.flyTo([25, 5], 2.5, { duration: 1 });
    map.flyTo({
      center: [4, 10],
      zoom: zoom_level,
      essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });

    d3.select("#filters")
      .transition().duration(500)
      .style("left", -200 + "px")
    d3.select("#filter_button")
      .transition().duration(500)
      .style("left", 0 + "px")
      .text("Filter")
    d3.select("#info")
      .transition().duration(500)
      .style("right", -405 + "px")
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
    d3.selectAll("#net_button, #time_button").style("background-color", "#04AA6D")
    d3.select("#map_button").style("background-color", "#006297")
    d3.select("#nonstate")
      .transition().duration(1000)
      .style("left", - complete_width + "px")
    d3.selectAll("#net")
      .transition().duration(1000)
      .style("right", - complete_width + "px")
  })
})

