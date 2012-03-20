/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};

AWE.Config = (function(module) { 
  
  module.MAP_RUN_TESTS = true;
  module.MAP_SERVER_BASE = 'http://localhost:3000/game_server/map/';
  
  module.MAP_REGION_IMAGE_URL = 'images/region.png';
  module.MAP_LEAF_IMAGE_URL = 'images/leaf.png';

  module.MAP_FORTRESS_IMAGE_URL = 'images/army.png';
  
  module.MAPPING_TILE_SIZE = 256;
  module.MAPPING_FORTRESS_SIZE = 64;
  
  // how many tiles showing minimum when not at leaf level
  module.MAP_MIN_VISIBLE_TILES = 64;

  //image cache
  module.IMAGE_CACHE_LOAD_LIST = {
    "map/leaf": module.MAP_LEAF_IMAGE_URL,
    "map/region": module.MAP_REGION_IMAGE_URL,
    "map/fortress": module.MAP_FORTRESS_IMAGE_URL,
    "map/region/icon": "images/dot.png"
  };
  
  return module;
  
}(AWE.Config || {}));

