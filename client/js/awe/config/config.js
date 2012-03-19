/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};

AWE.Config = (function(module) { 
  
  module.MAP_RUN_TESTS = true;
  module.MAP_SERVER_BASE = 'http://localhost:3000/game_server/map/';
  
  module.MAPPING_TILE_SIZE = 256;
  
  // how many tiles showing minimum when not at leaf level
  module.MAP_MIN_VISIBLE_TILES = 64;
  
  return module;
  
}(AWE.Config || {}));

