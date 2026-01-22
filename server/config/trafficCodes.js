/**
 * Traffic Code Database
 * Maps violation types to state-specific traffic codes, penalties, and points
 */

export const trafficCodes = {
  CA: {
    // California Vehicle Code
    running_red_light: {
      code: 'CVC 21453(a)',
      description: 'Failure to stop at red signal',
      fineRange: { min: 100, max: 500 },
      points: 1,
      isMisdemeanor: false
    },
    running_stop_sign: {
      code: 'CVC 22450',
      description: 'Failure to stop at stop sign',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    speeding: {
      code: 'CVC 22350',
      description: 'Basic speed law - driving at unsafe speed',
      fineRange: { min: 35, max: 500 },
      points: 1,
      isMisdemeanor: false
    },
    illegal_lane_change: {
      code: 'CVC 21658(a)',
      description: 'Unsafe lane change',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    unsafe_lane_change: {
      code: 'CVC 22107',
      description: 'Turning or changing lanes without signaling',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    failure_to_signal: {
      code: 'CVC 22108',
      description: 'Failure to signal before turning',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    tailgating: {
      code: 'CVC 21703',
      description: 'Following too closely',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    following_too_close: {
      code: 'CVC 21703',
      description: 'Following too closely',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    reckless_driving: {
      code: 'CVC 23103',
      description: 'Reckless driving',
      fineRange: { min: 145, max: 1000 },
      points: 2,
      isMisdemeanor: true
    },
    aggressive_driving: {
      code: 'CVC 23103',
      description: 'Reckless driving with wanton disregard',
      fineRange: { min: 145, max: 1000 },
      points: 2,
      isMisdemeanor: true
    },
    road_rage: {
      code: 'CVC 23103 / PC 245',
      description: 'Reckless driving / Assault with deadly weapon',
      fineRange: { min: 1000, max: 10000 },
      points: 2,
      isMisdemeanor: true
    },
    hit_and_run: {
      code: 'CVC 20002',
      description: 'Hit and run - property damage',
      fineRange: { min: 1000, max: 10000 },
      points: 2,
      isMisdemeanor: true
    },
    dui_suspected: {
      code: 'CVC 23152',
      description: 'DUI - Driving under influence',
      fineRange: { min: 390, max: 5000 },
      points: 2,
      isMisdemeanor: true
    },
    distracted_driving: {
      code: 'CVC 23123',
      description: 'Using wireless telephone while driving',
      fineRange: { min: 20, max: 250 },
      points: 1,
      isMisdemeanor: false
    },
    texting_while_driving: {
      code: 'CVC 23123.5',
      description: 'Texting while driving',
      fineRange: { min: 20, max: 250 },
      points: 1,
      isMisdemeanor: false
    },
    illegal_turn: {
      code: 'CVC 22100',
      description: 'Illegal turn at intersection',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    illegal_u_turn: {
      code: 'CVC 22102',
      description: 'Illegal U-turn in business district',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    failure_to_yield: {
      code: 'CVC 21801',
      description: 'Failure to yield right-of-way',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    wrong_way_driving: {
      code: 'CVC 21651(b)',
      description: 'Wrong way driving on divided highway',
      fineRange: { min: 500, max: 1000 },
      points: 2,
      isMisdemeanor: true
    },
    street_racing: {
      code: 'CVC 23109(a)',
      description: 'Speed contest on highway',
      fineRange: { min: 355, max: 1000 },
      points: 2,
      isMisdemeanor: true
    },
    exhibition_of_speed: {
      code: 'CVC 23109(c)',
      description: 'Exhibition of speed',
      fineRange: { min: 355, max: 1000 },
      points: 2,
      isMisdemeanor: true
    },
    failure_to_stop_for_school_bus: {
      code: 'CVC 22454',
      description: 'Failure to stop for school bus',
      fineRange: { min: 150, max: 1000 },
      points: 1,
      isMisdemeanor: false
    },
    passing_on_right: {
      code: 'CVC 21755',
      description: 'Improper passing on right',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    crossing_double_yellow: {
      code: 'CVC 21460',
      description: 'Crossing double yellow lines',
      fineRange: { min: 35, max: 238 },
      points: 1,
      isMisdemeanor: false
    },
    other: {
      code: 'CVC',
      description: 'Other traffic violation',
      fineRange: { min: 25, max: 500 },
      points: 0,
      isMisdemeanor: false
    }
  },

  FL: {
    // Florida Statutes
    running_red_light: {
      code: 'FL 316.075',
      description: 'Failure to obey traffic control device',
      fineRange: { min: 158, max: 262 },
      points: 4,
      isMisdemeanor: false
    },
    running_stop_sign: {
      code: 'FL 316.123',
      description: 'Failure to obey stop or yield sign',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    speeding: {
      code: 'FL 316.183',
      description: 'Unlawful speed',
      fineRange: { min: 25, max: 500 },
      points: 3,
      isMisdemeanor: false
    },
    illegal_lane_change: {
      code: 'FL 316.085',
      description: 'Improper lane change',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    unsafe_lane_change: {
      code: 'FL 316.085',
      description: 'Improper lane change',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    failure_to_signal: {
      code: 'FL 316.155',
      description: 'Failure to signal turn or lane change',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    tailgating: {
      code: 'FL 316.0895',
      description: 'Following too closely',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    following_too_close: {
      code: 'FL 316.0895',
      description: 'Following too closely',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    reckless_driving: {
      code: 'FL 316.192',
      description: 'Reckless driving',
      fineRange: { min: 25, max: 500 },
      points: 4,
      isMisdemeanor: true
    },
    aggressive_driving: {
      code: 'FL 316.1923',
      description: 'Aggressive careless driving',
      fineRange: { min: 116, max: 500 },
      points: 4,
      isMisdemeanor: false
    },
    road_rage: {
      code: 'FL 784.011 / 316.192',
      description: 'Assault / Reckless driving',
      fineRange: { min: 500, max: 5000 },
      points: 4,
      isMisdemeanor: true
    },
    hit_and_run: {
      code: 'FL 316.061',
      description: 'Leaving scene of crash - property damage',
      fineRange: { min: 500, max: 5000 },
      points: 6,
      isMisdemeanor: true
    },
    dui_suspected: {
      code: 'FL 316.193',
      description: 'DUI - Driving under influence',
      fineRange: { min: 500, max: 2000 },
      points: 0,
      isMisdemeanor: true
    },
    distracted_driving: {
      code: 'FL 316.305',
      description: 'Texting while driving',
      fineRange: { min: 30, max: 60 },
      points: 0,
      isMisdemeanor: false
    },
    texting_while_driving: {
      code: 'FL 316.305',
      description: 'Texting while driving',
      fineRange: { min: 30, max: 60 },
      points: 0,
      isMisdemeanor: false
    },
    illegal_turn: {
      code: 'FL 316.151',
      description: 'Required position for turning',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    illegal_u_turn: {
      code: 'FL 316.1515',
      description: 'U-turn limitations',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    failure_to_yield: {
      code: 'FL 316.123',
      description: 'Failure to yield right-of-way',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    wrong_way_driving: {
      code: 'FL 316.081',
      description: 'Driving on wrong side of roadway',
      fineRange: { min: 116, max: 500 },
      points: 4,
      isMisdemeanor: true
    },
    street_racing: {
      code: 'FL 316.191',
      description: 'Racing on highways',
      fineRange: { min: 500, max: 5000 },
      points: 4,
      isMisdemeanor: true
    },
    exhibition_of_speed: {
      code: 'FL 316.191',
      description: 'Racing on highways',
      fineRange: { min: 500, max: 5000 },
      points: 4,
      isMisdemeanor: true
    },
    failure_to_stop_for_school_bus: {
      code: 'FL 316.172',
      description: 'Failure to stop for school bus',
      fineRange: { min: 165, max: 300 },
      points: 4,
      isMisdemeanor: false
    },
    passing_on_right: {
      code: 'FL 316.084',
      description: 'Improper passing on right',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    crossing_double_yellow: {
      code: 'FL 316.0875',
      description: 'Driving over gore or marked boundary line',
      fineRange: { min: 116, max: 191 },
      points: 3,
      isMisdemeanor: false
    },
    other: {
      code: 'FL 316',
      description: 'Other traffic violation',
      fineRange: { min: 25, max: 500 },
      points: 0,
      isMisdemeanor: false
    }
  },

  TX: {
    // Texas Transportation Code
    running_red_light: {
      code: 'TTC 544.007',
      description: 'Disobedience of traffic control device',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    running_stop_sign: {
      code: 'TTC 544.010',
      description: 'Stop signs and yield signs',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    speeding: {
      code: 'TTC 545.351',
      description: 'Maximum speed requirement',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    illegal_lane_change: {
      code: 'TTC 545.060',
      description: 'Driving on roadway laned for traffic',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    unsafe_lane_change: {
      code: 'TTC 545.104',
      description: 'Signaling turns and stops',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    failure_to_signal: {
      code: 'TTC 545.104',
      description: 'Signaling turns and stops',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    tailgating: {
      code: 'TTC 545.062',
      description: 'Following distance',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    following_too_close: {
      code: 'TTC 545.062',
      description: 'Following distance',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    reckless_driving: {
      code: 'TTC 545.401',
      description: 'Reckless driving',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: true
    },
    aggressive_driving: {
      code: 'TTC 545.401',
      description: 'Reckless driving',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: true
    },
    road_rage: {
      code: 'TPC 22.01 / TTC 545.401',
      description: 'Assault / Reckless driving',
      fineRange: { min: 500, max: 4000 },
      points: 2,
      isMisdemeanor: true
    },
    hit_and_run: {
      code: 'TTC 550.022',
      description: 'Accident involving damage to vehicle',
      fineRange: { min: 1, max: 500 },
      points: 0,
      isMisdemeanor: true
    },
    dui_suspected: {
      code: 'TPC 49.04',
      description: 'DWI - Driving while intoxicated',
      fineRange: { min: 0, max: 2000 },
      points: 0,
      isMisdemeanor: true
    },
    distracted_driving: {
      code: 'TTC 545.4251',
      description: 'Use of portable wireless communication device',
      fineRange: { min: 25, max: 200 },
      points: 0,
      isMisdemeanor: false
    },
    texting_while_driving: {
      code: 'TTC 545.4251',
      description: 'Use of portable wireless communication device',
      fineRange: { min: 25, max: 200 },
      points: 0,
      isMisdemeanor: false
    },
    illegal_turn: {
      code: 'TTC 545.101',
      description: 'Turning at intersection',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    illegal_u_turn: {
      code: 'TTC 545.102',
      description: 'U-turn limitations',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    failure_to_yield: {
      code: 'TTC 545.151',
      description: 'Vehicle turning left',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    wrong_way_driving: {
      code: 'TTC 545.051',
      description: 'Driving on right side of roadway',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    street_racing: {
      code: 'TTC 545.420',
      description: 'Racing on highway',
      fineRange: { min: 350, max: 2000 },
      points: 0,
      isMisdemeanor: true
    },
    exhibition_of_speed: {
      code: 'TTC 545.420',
      description: 'Racing on highway',
      fineRange: { min: 350, max: 2000 },
      points: 0,
      isMisdemeanor: true
    },
    failure_to_stop_for_school_bus: {
      code: 'TTC 545.066',
      description: 'Passing school bus',
      fineRange: { min: 500, max: 1250 },
      points: 0,
      isMisdemeanor: false
    },
    passing_on_right: {
      code: 'TTC 545.057',
      description: 'Passing to the right',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    crossing_double_yellow: {
      code: 'TTC 545.055',
      description: 'No-passing zones',
      fineRange: { min: 1, max: 200 },
      points: 2,
      isMisdemeanor: false
    },
    other: {
      code: 'TTC',
      description: 'Other traffic violation',
      fineRange: { min: 1, max: 200 },
      points: 0,
      isMisdemeanor: false
    }
  },

  NY: {
    // New York Vehicle and Traffic Law
    running_red_light: {
      code: 'VTL 1111(d)',
      description: 'Failure to stop at red signal',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    running_stop_sign: {
      code: 'VTL 1172(a)',
      description: 'Failure to stop at stop sign',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    speeding: {
      code: 'VTL 1180',
      description: 'Speed not reasonable and prudent',
      fineRange: { min: 45, max: 600 },
      points: 3,
      isMisdemeanor: false
    },
    illegal_lane_change: {
      code: 'VTL 1128(a)',
      description: 'Failure to stay in lane',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    unsafe_lane_change: {
      code: 'VTL 1128(a)',
      description: 'Failure to stay in lane',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    failure_to_signal: {
      code: 'VTL 1163(a)',
      description: 'Failure to signal',
      fineRange: { min: 50, max: 150 },
      points: 2,
      isMisdemeanor: false
    },
    tailgating: {
      code: 'VTL 1129(a)',
      description: 'Following too closely',
      fineRange: { min: 50, max: 150 },
      points: 4,
      isMisdemeanor: false
    },
    following_too_close: {
      code: 'VTL 1129(a)',
      description: 'Following too closely',
      fineRange: { min: 50, max: 150 },
      points: 4,
      isMisdemeanor: false
    },
    reckless_driving: {
      code: 'VTL 1212',
      description: 'Reckless driving',
      fineRange: { min: 100, max: 300 },
      points: 5,
      isMisdemeanor: true
    },
    aggressive_driving: {
      code: 'VTL 1212',
      description: 'Reckless driving',
      fineRange: { min: 100, max: 300 },
      points: 5,
      isMisdemeanor: true
    },
    road_rage: {
      code: 'PL 120.00 / VTL 1212',
      description: 'Assault / Reckless driving',
      fineRange: { min: 500, max: 5000 },
      points: 5,
      isMisdemeanor: true
    },
    hit_and_run: {
      code: 'VTL 600(1)',
      description: 'Leaving scene of property damage incident',
      fineRange: { min: 250, max: 15000 },
      points: 3,
      isMisdemeanor: true
    },
    dui_suspected: {
      code: 'VTL 1192',
      description: 'DWAI/DWI - Driving while impaired/intoxicated',
      fineRange: { min: 500, max: 10000 },
      points: 0,
      isMisdemeanor: true
    },
    distracted_driving: {
      code: 'VTL 1225-c',
      description: 'Use of mobile telephone',
      fineRange: { min: 50, max: 200 },
      points: 5,
      isMisdemeanor: false
    },
    texting_while_driving: {
      code: 'VTL 1225-d',
      description: 'Use of portable electronic device',
      fineRange: { min: 50, max: 200 },
      points: 5,
      isMisdemeanor: false
    },
    illegal_turn: {
      code: 'VTL 1160',
      description: 'Required position and method of turning',
      fineRange: { min: 50, max: 150 },
      points: 2,
      isMisdemeanor: false
    },
    illegal_u_turn: {
      code: 'VTL 1161',
      description: 'U-turn on curve or grade',
      fineRange: { min: 50, max: 150 },
      points: 2,
      isMisdemeanor: false
    },
    failure_to_yield: {
      code: 'VTL 1142',
      description: 'Failure to yield right-of-way',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    wrong_way_driving: {
      code: 'VTL 1127',
      description: 'Driving on wrong side of divided highway',
      fineRange: { min: 50, max: 300 },
      points: 3,
      isMisdemeanor: false
    },
    street_racing: {
      code: 'VTL 1182',
      description: 'Speed contest',
      fineRange: { min: 300, max: 1000 },
      points: 5,
      isMisdemeanor: true
    },
    exhibition_of_speed: {
      code: 'VTL 1182',
      description: 'Speed contest',
      fineRange: { min: 300, max: 1000 },
      points: 5,
      isMisdemeanor: true
    },
    failure_to_stop_for_school_bus: {
      code: 'VTL 1174(a)',
      description: 'Passing a stopped school bus',
      fineRange: { min: 250, max: 400 },
      points: 5,
      isMisdemeanor: false
    },
    passing_on_right: {
      code: 'VTL 1123',
      description: 'Improper passing on the right',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    crossing_double_yellow: {
      code: 'VTL 1126',
      description: 'Driving left of pavement markings',
      fineRange: { min: 50, max: 150 },
      points: 3,
      isMisdemeanor: false
    },
    other: {
      code: 'VTL',
      description: 'Other traffic violation',
      fineRange: { min: 25, max: 300 },
      points: 0,
      isMisdemeanor: false
    }
  },

  GA: {
    // Georgia Code
    running_red_light: {
      code: 'OCGA 40-6-20',
      description: 'Obedience to traffic-control devices',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    running_stop_sign: {
      code: 'OCGA 40-6-72',
      description: 'Stop signs and yield signs',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    speeding: {
      code: 'OCGA 40-6-181',
      description: 'Maximum limits',
      fineRange: { min: 25, max: 500 },
      points: 2,
      isMisdemeanor: false
    },
    illegal_lane_change: {
      code: 'OCGA 40-6-123',
      description: 'Improper lane change',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    unsafe_lane_change: {
      code: 'OCGA 40-6-123',
      description: 'Improper lane change',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    failure_to_signal: {
      code: 'OCGA 40-6-123',
      description: 'Signal required for lane change',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    tailgating: {
      code: 'OCGA 40-6-49',
      description: 'Following too closely',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    following_too_close: {
      code: 'OCGA 40-6-49',
      description: 'Following too closely',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    reckless_driving: {
      code: 'OCGA 40-6-390',
      description: 'Reckless driving',
      fineRange: { min: 25, max: 1000 },
      points: 4,
      isMisdemeanor: true
    },
    aggressive_driving: {
      code: 'OCGA 40-6-397',
      description: 'Aggressive driving',
      fineRange: { min: 100, max: 1000 },
      points: 6,
      isMisdemeanor: true
    },
    road_rage: {
      code: 'OCGA 16-5-20 / 40-6-390',
      description: 'Simple assault / Reckless driving',
      fineRange: { min: 500, max: 5000 },
      points: 4,
      isMisdemeanor: true
    },
    hit_and_run: {
      code: 'OCGA 40-6-270',
      description: 'Duty to stop - property damage',
      fineRange: { min: 300, max: 1000 },
      points: 3,
      isMisdemeanor: true
    },
    dui_suspected: {
      code: 'OCGA 40-6-391',
      description: 'DUI - Driving under influence',
      fineRange: { min: 300, max: 1000 },
      points: 0,
      isMisdemeanor: true
    },
    distracted_driving: {
      code: 'OCGA 40-6-241.2',
      description: 'Wireless telecommunications device; hands-free',
      fineRange: { min: 50, max: 150 },
      points: 1,
      isMisdemeanor: false
    },
    texting_while_driving: {
      code: 'OCGA 40-6-241.2',
      description: 'Wireless telecommunications device; hands-free',
      fineRange: { min: 50, max: 150 },
      points: 1,
      isMisdemeanor: false
    },
    illegal_turn: {
      code: 'OCGA 40-6-120',
      description: 'Required position and method of turning',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    illegal_u_turn: {
      code: 'OCGA 40-6-121',
      description: 'U-turn limitations',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    failure_to_yield: {
      code: 'OCGA 40-6-71',
      description: 'Failure to yield right-of-way',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    wrong_way_driving: {
      code: 'OCGA 40-6-40',
      description: 'Driving on right side of roadway',
      fineRange: { min: 100, max: 500 },
      points: 4,
      isMisdemeanor: false
    },
    street_racing: {
      code: 'OCGA 40-6-186',
      description: 'Racing on highways',
      fineRange: { min: 300, max: 1000 },
      points: 6,
      isMisdemeanor: true
    },
    exhibition_of_speed: {
      code: 'OCGA 40-6-186',
      description: 'Racing on highways',
      fineRange: { min: 300, max: 1000 },
      points: 6,
      isMisdemeanor: true
    },
    failure_to_stop_for_school_bus: {
      code: 'OCGA 40-6-163',
      description: 'Passing a school bus',
      fineRange: { min: 300, max: 1000 },
      points: 6,
      isMisdemeanor: false
    },
    passing_on_right: {
      code: 'OCGA 40-6-43',
      description: 'Passing on the right',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    crossing_double_yellow: {
      code: 'OCGA 40-6-48',
      description: 'No-passing zones',
      fineRange: { min: 75, max: 250 },
      points: 3,
      isMisdemeanor: false
    },
    other: {
      code: 'OCGA',
      description: 'Other traffic violation',
      fineRange: { min: 25, max: 300 },
      points: 0,
      isMisdemeanor: false
    }
  }
};

// List of all US states with their abbreviations
export const usStates = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' }
];

// Violation type definitions with display info
export const violationTypes = [
  { value: 'running_red_light', label: 'Running Red Light', icon: 'traffic-light', category: 'signals' },
  { value: 'running_stop_sign', label: 'Running Stop Sign', icon: 'stop-sign', category: 'signals' },
  { value: 'speeding', label: 'Speeding', icon: 'gauge', category: 'speed' },
  { value: 'illegal_lane_change', label: 'Illegal Lane Change', icon: 'arrows-left-right', category: 'lane' },
  { value: 'unsafe_lane_change', label: 'Unsafe Lane Change', icon: 'arrows-left-right', category: 'lane' },
  { value: 'failure_to_signal', label: 'Failure to Signal', icon: 'turn-signal', category: 'lane' },
  { value: 'tailgating', label: 'Tailgating', icon: 'car-crash', category: 'following' },
  { value: 'following_too_close', label: 'Following Too Close', icon: 'car-crash', category: 'following' },
  { value: 'reckless_driving', label: 'Reckless Driving', icon: 'car-burst', category: 'dangerous' },
  { value: 'aggressive_driving', label: 'Aggressive Driving', icon: 'car-burst', category: 'dangerous' },
  { value: 'road_rage', label: 'Road Rage', icon: 'face-angry', category: 'dangerous' },
  { value: 'hit_and_run', label: 'Hit and Run', icon: 'person-running', category: 'dangerous' },
  { value: 'dui_suspected', label: 'Suspected DUI', icon: 'wine-glass', category: 'impaired' },
  { value: 'distracted_driving', label: 'Distracted Driving', icon: 'mobile-phone', category: 'distracted' },
  { value: 'texting_while_driving', label: 'Texting While Driving', icon: 'message', category: 'distracted' },
  { value: 'illegal_turn', label: 'Illegal Turn', icon: 'turn-up', category: 'turning' },
  { value: 'illegal_u_turn', label: 'Illegal U-Turn', icon: 'u-turn', category: 'turning' },
  { value: 'failure_to_yield', label: 'Failure to Yield', icon: 'yield-sign', category: 'right-of-way' },
  { value: 'wrong_way_driving', label: 'Wrong Way Driving', icon: 'ban', category: 'dangerous' },
  { value: 'street_racing', label: 'Street Racing', icon: 'flag-checkered', category: 'speed' },
  { value: 'exhibition_of_speed', label: 'Exhibition of Speed', icon: 'gauge-high', category: 'speed' },
  { value: 'failure_to_stop_for_school_bus', label: 'Failure to Stop for School Bus', icon: 'bus-school', category: 'special' },
  { value: 'passing_on_right', label: 'Passing on Right', icon: 'arrow-right', category: 'lane' },
  { value: 'crossing_double_yellow', label: 'Crossing Double Yellow', icon: 'road', category: 'lane' },
  { value: 'other', label: 'Other Violation', icon: 'circle-exclamation', category: 'other' }
];

// Severity definitions
export const severityLevels = [
  { value: 'minor', label: 'Minor', description: 'Low-risk violation with minimal danger', color: '#f59e0b' },
  { value: 'moderate', label: 'Moderate', description: 'Potentially dangerous behavior', color: '#f97316' },
  { value: 'severe', label: 'Severe', description: 'Serious violation posing significant risk', color: '#ef4444' },
  { value: 'critical', label: 'Critical', description: 'Extremely dangerous, immediate threat', color: '#991b1b' }
];

/**
 * Get applicable statutes for a violation type in a given state
 * @param {string} violationType - The type of violation
 * @param {string} state - Two-letter state code
 * @returns {Array} Array of applicable statutes
 */
export function getApplicableStatutes(violationType, state) {
  const stateCode = trafficCodes[state]?.[violationType];
  if (stateCode) {
    return [{
      state,
      code: stateCode.code,
      description: stateCode.description,
      fineRange: stateCode.fineRange,
      points: stateCode.points,
      isMisdemeanor: stateCode.isMisdemeanor
    }];
  }

  // Return generic info if state-specific code not available
  return [{
    state,
    code: 'N/A',
    description: `${violationType.replace(/_/g, ' ')} - State-specific code not available`,
    fineRange: { min: 0, max: 0 },
    points: 0,
    isMisdemeanor: false
  }];
}

/**
 * Get all traffic codes for a given state
 * @param {string} state - Two-letter state code
 * @returns {Object} All traffic codes for the state
 */
export function getStateTrafficCodes(state) {
  return trafficCodes[state] || {};
}

/**
 * Check if state has traffic codes defined
 * @param {string} state - Two-letter state code
 * @returns {boolean}
 */
export function hasStateTrafficCodes(state) {
  return !!trafficCodes[state];
}

export default {
  trafficCodes,
  usStates,
  violationTypes,
  severityLevels,
  getApplicableStatutes,
  getStateTrafficCodes,
  hasStateTrafficCodes
};
