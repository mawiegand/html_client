/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};

AWE.Config = (function(module) { 
  
  module.DEBUG_LEVEL_ERROR   = 0;
  module.DEBUG_LEVEL_WARNING = 1;
  module.DEBUG_LEVEL_INFO    = 2;
  module.DEBUG_LEVEL_DEBUG   = 3;
  
  module.MAP_DEBUG_LEVEL = module.DEBUG_LEVEL_ERROR;
  
  module.MAP_RUN_TESTS = false;
  module.MAP_SERVER_BASE = 'http://localhost:3000/game_server/map/';
  
  module.MAPPING_FORTRESS_SIZE = 64;
  
  // how many tiles showing minimum when not at leaf level
  module.MAP_MIN_VISIBLE_TILES = 64;

  module.MAP_REGION_STREETS_COLOR = "#857d66"; //#444
  module.MAP_REGION_STREETS_WIDTH = 2; 
  module.MAP_REGION_STREETS_MIN_DETAIL_LEVEL = 1;

  module.MAP_LOCATION_STREETS_COLOR = "#b1ad6e"; //#444
  module.MAP_LOCATION_STREETS_WIDTH = 1; 

  module.MAP_LOCATION_SPOT_WIDTH = 25;
  module.MAP_LOCATION_SPOT_HEIGHT = 15;
  //frame.width * MAP_REGION_STREETS_WIDTH = offset from the broder away
  module.MAP_LOCATION_SPOT_BORDER_MARGIN = 0.2;
  module.MAP_LOCATION_SPOT_COLOR = "#b1ad6e";//"#EEE894";

  module.MAP_LOCATION_MIN_DETAIL_LEVEL = 2;
  module.MAP_LOCATION_TYPE_CODES = ["empty","fortress","settlement","outpost"];

  //image cache
  module.IMAGE_CACHE_LOAD_LIST = {
    "map/tiles/split128": 'images/tiles/split128.png',
    "map/tiles/base128": 'images/tiles/base128.png',
    "map/tiles/forest128": 'images/tiles/forest128.png',
    "map/tiles/plain128": 'images/tiles/plain128.png',
    
    "map/tiles/split256": 'images/tiles/split256.png',
    "map/tiles/base256": 'images/tiles/base256.png',
    "map/tiles/forest256": 'images/tiles/forest256.png',
    "map/tiles/plain256": 'images/tiles/plain256.png',
    
    "map/fortress/small": 'images/settlements/fortresssmall.png',
    "map/fortress/middle": 'images/settlements/fortressmiddle.png',
    "map/fortress/large": 'images/settlements/fortresslarge.png',

    "map/colony/small": "images/settlements/colonysmall.png",
    "map/colony/middle": "images/settlements/colonymiddle.png",
    "map/colony/big": "images/settlements/colonybig.png",

    "map/outpost" : "images/settlements/outpost.png",

    "map/button": 'images/army.png',
    "map/easement": "images/verbot.png",
    "map/region/icon": "images/dot.png"
  };
  
  return module;
  
}(AWE.Config || {}));
