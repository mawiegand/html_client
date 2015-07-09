/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


 var AWE = window.AWE || {};


 AWE.Config = (function(module) {

  module.BuildingSettings = {
    building_chief_cottage: {
      newUpgrade: true
    },
    building_gatherer: {
      newUpgrade: false
    },
    building_special_gatherer: {
      newUpgrade: false
    },
    building_trade_center: {
      newUpgrade: false
    },
    building_barracks: {
      newUpgrade: true
    },
    building_cottage: {
      newUpgrade: false
    },
    building_tavern: {
      newUpgrade: true
    },
    building_storage: {
      newUpgrade: false
    },
    building_campfire: {
      newUpgrade: true
    },
    building_quarry: {
      newUpgrade: false
    },
    building_logger: {
      newUpgrade: false
    },
    building_training_cave: {
      newUpgrade: false
    },
    building_artifact_stand: {
      newUpgrade: false
    },
    building_furrier: {
      newUpgrade: false
    },
    building_copper_smelter: {
      newUpgrade: true
    },
    building_firing_range: {
      newUpgrade: true
    },
    building_alliance_hall: {
      newUpgrade: false
    },
    building_barracks_2: {
      newUpgrade: true
    },
    building_firing_range_2: {
      newUpgrade: true
    },
    building_stud_2: {
      newUpgrade: true
    },
    building_cottage_2: {
      newUpgrade: false
    },
    building_storage_2: {
      newUpgrade: false
    },
    building_quarry_2: {
      newUpgrade: false
    },
    building_logger_2: {
      newUpgrade: false
    },
    building_stud: {
      newUpgrade: true
    },
    building_command_post: {
      newUpgrade: false
    },
    building_furrier_2: {
      newUpgrade: false
    },
    building_garrison: {
      newUpgrade: false
    },
    building_haunt: {
      newUpgrade: true
    },
    building_field_camp: {
      newUpgrade: false
    },
    building_altar: {
      newUpgrade: false
    },
    building_fortress_fortification: {
      newUpgrade: true
    },
    building_infantry_tower: {
      newUpgrade: true
    },
    building_artillery_tower: {
      newUpgrade: true
    },
    building_infantry_tower: {
      newUpgrade: true
    },
    building_cavalry_tower: {
      newUpgrade: true
    },

    newUpgradeForBuilding: function(building) {
      if (typeof this[building] === "undefined")
      {
        return false;
      }
      return this[building].newUpgrade;
    }
  }
  return module;

}(AWE.Config || {}));