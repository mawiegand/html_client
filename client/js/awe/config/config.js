/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};

AWE.Config = (function(module) { 
  
  module.MAP_RUN_TESTS = true;
  module.MAP_SERVER_BASE = 'http://localhost:3000/game_server/map/';
  
  module.MAPPING_FORTRESS_SIZE = 64;
  
  // how many tiles showing minimum when not at leaf level
  module.MAP_MIN_VISIBLE_TILES = 64;

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

    "map/easement": "images/verbot.png",
    "map/region/icon": "images/dot.png"
  };
  
  return module;
  
}(AWE.Config || {}));

