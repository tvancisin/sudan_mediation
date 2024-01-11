
// type Lateral = "unilateral" | "multilateral" | "all";
// type State = "state" | "nonstate" | "all";
// type Country = "sudan" | "south_sudan" | "all";
// type Vis = "map" | "network" | "timeline";
// type Nest<T extends string, S> = { [K in T]: S }
// type StateFunction = Nest<Lateral, Nest<State, Nest<Country, Nest<Vis, () => void>>>>

// const execute = (lateral: Lateral, state: State, country: Country, vis: Vis, statefunction: StateFunction) => {
//     statefunction[lateral][state][country][vis]()
// }

// const stateFunction: StateFunction = {
//     all: {
//         all: {
//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         nonstate: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         state: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         }
//     },
//     multilateral: {
//         all: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         nonstate: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         state: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         }
//     },
//     unilateral: {
//         all: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         nonstate: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         },
//         state: {

//             all: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             },
//             south_sudan: {
//                 map: () => { },
//                 network: () => { },
//                 timeline: () => { }
//             }
//         }
//     }
// }

// execute(button_pressed_lateral, button_pressed_state, button_pressed_country, button_pressed_vis, stateFunction)