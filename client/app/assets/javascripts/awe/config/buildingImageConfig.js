/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


 var AWE = window.AWE || {};


 AWE.Config = (function(module) {

  module.BuildingImageLibrary = {
    building_chief_cottage: {  // das sollten arrays sein! dann könnte man fragen, wie viele level es gibt.
      0: 0,
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 4,
      7: 5,
      8: 5,
      9: 5,
      10: 5,
      11: 6,
      12: 6,
      13: 6,
      14: 6,
      15: 6,
      16: 6,
      17: 6,
      18: 6,
      19: 6,
      20: 6,
      hasFire: true
    },
    building_gatherer: {
      0: 0,
      1: 0,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 1,
      7: 1,
      8: 2,
      9: 2,
      10: 2,
      hasFire: true
    },
    building_special_gatherer: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 1,
      10: 1,
      hasFire: true
    },
    building_barracks: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_cottage: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_tavern: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_storage: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_campfire: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_quarry: {
      0: 0,
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 4,
      7: 5,
      8: 5,
      9: 5,
      10: 6,
      hasFire: false
    },
    building_logger: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_training_cave: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_artifact_stand: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_furrier: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_copper_smelter: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_firing_range: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_alliance_hall: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: true
    },
    building_cottage_2: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_storage_2: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_quarry_2: {
      0: 0,
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 4,
      7: 5,
      8: 5,
      9: 5,
      10: 6,
      hasFire: false
    },
    building_logger_2: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_stud: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_command_post: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_furrier_2: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_garrison: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_haunt: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_field_camp: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_altar: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_fortress_fortification: {
        0: 0,
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 4,
        7: 5,
        8: 5,
        9: 5,
        10: 6,
        hasFire: true
    },
    building_infantry_tower: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_artillery_tower: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_infantry_tower: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },
    building_cavalry_tower: {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      9: 0,
      10: 0,
      hasFire: false
    },

    hasFire: function(building) {
      if (typeof this[building] === "undefined")
      {
        return false;
      }
      return this[building].hasFire;
    },

    getImageLevelForBuilding: function(building, level) {
      var def = "building_barracks";
      if (typeof this[building] === "undefined")
      {
        building = def;
      }
      if (typeof this[building][level] === "undefined")
      {
        level = 0; // level zero _must_ be there...
      }
      return this[building][level];
    }
  }
  return module;

}(AWE.Config || {}));