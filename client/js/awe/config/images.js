/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};


AWE.Config = (function(module) { 
  
  //image cache
  module.IMAGE_CACHE_LOAD_LIST = {
    "map/tiles/split128": 'images/tiles/split128.png',
    "map/tiles/base128": 'images/tiles/base128.png',
    "map/tiles/forest128": 'images/tiles/forest128.png',
    "map/tiles/plain128": 'images/tiles/plain128.png',
    "map/tiles/mountains128": 'images/tiles/mountains128.png',
    "map/tiles/mud128": 'images/tiles/mud128.png',
    
    "map/tiles/split256": 'images/tiles/split256.png',
    "map/tiles/base256": 'images/tiles/base256.png',
    "map/tiles/forest256": 'images/tiles/forest256.png',
    "map/tiles/plain256": 'images/tiles/plain256.png',
    "map/tiles/mountains256": 'images/tiles/mountains256.png',
    "map/tiles/mud256": 'images/tiles/mud256.png',

    "map/tiles/split512": 'images/tiles/split256.png',
    "map/tiles/base512": 'images/tiles/base256.png',
    "map/tiles/forest512": 'images/tiles/forest512.png',
    "map/tiles/plain512": 'images/tiles/plain512.png',
    "map/tiles/mountains512": 'images/tiles/mountains512.png',
    "map/tiles/mud512": 'images/tiles/mud256.png',
    
    "map/fortress/small": 'images/settlements/fortresssmall.png',
    "map/fortress/middle": 'images/settlements/fortressmiddle.png',
    "map/fortress/large": 'images/settlements/fortresslarge.png',

    "map/colony/small": "images/settlements/colonysmall.png",
    "map/colony/middle": "images/settlements/colonymiddle.png",
    "map/colony/big": "images/settlements/colonybig.png",

    "map/army": 'images/army.png',
    
    "map/army/stanceAggressive": "images/army/warrior_pose_2_96.png",
    "map/army/stanceDefensive": "images/army/warrior_pose_1_96.png",
    "map/army/stanceNeutral": "images/army/warrior_pose_1_96.png",

    "map/army/rank1": 'images/army/rank1.png',
    "map/army/rank2": 'images/army/rank2.png',
    "map/army/rank3": 'images/army/rank3.png',
    "map/army/rank4": 'images/army/rank4.png',
    "map/army/rank5": 'images/army/rank4.png',

    "map/army/target": 'images/army/target.png',
    "map/army/target_background": 'images/white_background.png',

    "map/army/battle": 'images/battle.png',
    
    "map/outpost": "images/settlements/outpost.png",
    "map/emptyslot" : "images/white_icon.png",

    "map/easement/yes": "images/ok.png",
    "map/easement/no": "images/verbot.png",

    "map/display/icon": "images/white_icon.png",

    "map/region/icon": "images/dot.png",
    
    "map/button1": 'images/green_button.png',
    "map/button1highlighted": 'images/red_button.png',
    "map/button1disabled": 'images/green_button_disabled.png',
    "map/button2": 'images/red_button.png',
    "map/button3": 'images/blue_button.png',
    
    "map/icon/owner": "images/icons/heads.png",
    "map/icon/home": "images/icons/house.png",
    "map/icon/actionpoints": "images/icons/magnifier.png",
    "map/icon/rank": "images/icons/star.png",
    "map/icon/army/strength": "images/icons/flash.png",
    "map/icon/army/size": "images/icons/gearwheel.png",
    "map/icon/army/size1": "images/icons/gearwheel.png",
    "map/icon/army/size2": "images/icons/gearwheel.png",
    "map/icon/army/size3": "images/icons/gearwheel.png",

    "activityindicator/small": "images/icons/activityindicator_small.svg",
    
    // heads.png, eye.png, flash.png, gearwheel.png, heads.png, house.png, magnifier.png, sandglass.png, star.png
    
    "hud/head": 'images/head.png',
    "hud/frog/face": 'images/kopfkroete40.png',
  };
  
  module.MAP_STANCE_IMAGES = [
    "map/army/stanceNeutral",
    "map/army/stanceAggressive",
    "map/army/stanceDefensive"
  ];
  
  return module;
  
}(AWE.Config || {}));
