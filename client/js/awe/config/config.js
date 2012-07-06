/* Author: Sascha Lange <sascha@5dlab.com>, Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};


AWE.Config = (function(module) { 
  
  // automatically determine the server to use -> same origin policy
  module.SERVER_ROOT = document.location.protocol + '//' + document.location.host;
  if (!document.location.host) { // for the case where it's loaded from file 
    module.SERVER_ROOT = 'http://localhost/'
  }
  
  module.DEBUG_LEVEL_ERROR   = 0;
  module.DEBUG_LEVEL_WARNING = 1;
  module.DEBUG_LEVEL_INFO    = 2;
  module.DEBUG_LEVEL_DEBUG   = 3;
  
  module.MAP_DEBUG_LEVEL = module.DEBUG_LEVEL_INFO
  module.MAP_DEBUG_FRAMES = false;
  
  module.MAP_RUN_TESTS = false;
  module.MAP_SERVER_BASE          = module.SERVER_ROOT + '/game_server/map/';
  module.MILITARY_SERVER_BASE     = module.SERVER_ROOT + '/game_server/military/';
  module.TRAINING_SERVER_BASE     = module.SERVER_ROOT + '/game_server/training/';
  module.FUNDAMENTAL_SERVER_BASE  = module.SERVER_ROOT + '/game_server/fundamental/';
  module.ACTION_SERVER_BASE       = module.SERVER_ROOT + '/game_server/action/';
  module.RULES_SERVER_BASE        = module.SERVER_ROOT + '/game_server/game_rules/';
  module.SETTLEMENT_SERVER_BASE   = module.SERVER_ROOT + '/game_server/settlement/';
  module.CONSTRUCTION_SERVER_BASE = module.SERVER_ROOT + '/game_server/construction/';
  module.SHOP_SERVER_BASE         = module.SERVER_ROOT + '/game_server/shop/';
  module.MESSAGING_SERVER_BASE    = module.SERVER_ROOT + '/game_server/messaging/';
  module.PAYMENT_PROVIDER_BASE    = module.SERVER_ROOT + '/payment_provider/';

  module.RANKING_SERVER_BASE      = module.SERVER_ROOT + '/game_server/ranking/character_rankings';

  
  module.DEFAULT_LOCALE = 'en_US';
  
  // access token of Egbert, expires in 100 days.
  module.DEV_ACCESS_TOKEN = "eyJ0b2tlbiI6eyJpZGVudGlmaWVyIjoiZU9tS3ZOa1hTUkxtYlREUSIsInNjb3BlIjpbIjVkZW50aXR5Iiwid2Fja2Fkb28iXSwidGltZXN0YW1wIjoiMjAxMi0wNS0wMlQxNjozMDowMyswMjowMCJ9LCJzaWduYXR1cmUiOiJhZDQ0MzU4NzRmMGFmYTg2N2RlOTAwOTExYTJlMmNlODQzNmNlYTU0In0="
  
  module.DEV_ALLIANCE_ID = 1;
  
  module.TIME_DIFF_RANGE = 2; // TODO problem with slot refresh if less than 2
  
  module.NET_AUTO_DETECT_REDIRECT_FLAWS = false ;
  
  module.BASE_LEVEL_DIVISOR     = 40;
  module.FORTRESS_LEVEL_DIVISOR =  3;
  module.OUTPOST_LEVEL_DIVISOR  = 10;
  
  module.MAPPING_FORTRESS_SIZE  = 64;
  
  module.MAP_ARMY_WIDTH  =  64;
  module.MAP_ARMY_HEIGHT = 128;
  
  module.ARMY_MODE_IDLE     = 0;
  module.ARMY_MODE_MOVING   = 1;
  module.ARMY_MODE_FIGHTING = 2;

	module.MAP_USE_GOOGLE = false;
  module.MAP_USE_OSM = true;
  
  // how many tiles showing minimum when not at leaf level
  module.MAP_MIN_VISIBLE_TILES = 64;

  module.MAP_REGION_STREETS_COLOR = "#857d66"; //#444
  module.MAP_REGION_STREETS_WIDTH = 2; 
  module.MAP_REGION_STREETS_MIN_DETAIL_LEVEL = 1;

  module.MAP_LOCATION_STREETS_COLOR = "#b1ad6e"; //#444
  module.MAP_LOCATION_STREETS_WIDTH = 1; 

  module.MAP_LOCATION_SPOT_WIDTH = 49;
  module.MAP_LOCATION_SPOT_HEIGHT = 30;
  //frame.width * MAP_REGION_STREETS_WIDTH = offset from the broder away
  module.MAP_LOCATION_SPOT_BORDER_MARGIN = 0.14;
  module.MAP_LOCATION_SPOT_COLOR = "rgba(177, 173, 110, .5)";//"#b1ad6e";//"#EEE894";

  module.MAP_LOCATION_MIN_DETAIL_LEVEL = 2;
  module.MAP_LOCATION_TYPE_CODES = ["empty","fortress","base","outpost"];
  
  module.MAPVIEW_DONT_UPDATE_MODEL_WHILE_SCROLLING = true;

  //Settings for the camera that handles the panning after a double click
  module.MAP_DBLCLK_MAX_TIME_FOR_DBLCLK = 400; ///< maximum amount of milliseconds between clicks for a double click
  module.MAP_DBLCLK_CAMERA_PANTIME = 400; ///< time for the panning animation
  module.MAP_DBLCLK_CAMERA_BORDER_FACTOR = 0.15; ///< border around a node after zoom in
  module.MAP_DBLCLK_CAMERA_CROSS_CLICK_SIZE = 35;

  module.MAP_CAMERA_MAX_VIEWFRAME_SIZE = { width: 30000000, height: 30000000 };
  module.MAP_CAMERA_MIN_VIEWFRAME_SIZE = { width: 500000, height: 500000 };
  
  module.SETTLEMENT_REFRESH_INTERVAL = 30 * 1000;
  
  module.RESOURCES_REFRESH_INTERVAL = 5 * 1000;

  return module;
  
}(AWE.Config || {}));
