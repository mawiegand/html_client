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
  module.MAP_SERVER_BASE = module.SERVER_ROOT + '/game_server/map/';
  module.MILITARY_SERVER_BASE = module.SERVER_ROOT + '/game_server/military/';
  module.FUNDAMENTAL_SERVER_BASE = module.SERVER_ROOT + '/game_server/fundamental/';
  module.ACTION_SERVER_BASE = module.SERVER_ROOT + '/game_server/action/';
  module.RULES_SERVER_BASE = module.SERVER_ROOT + '/game_server/game_rules/';
  
  module.PAYMENT_PROVIDER_BASE = module.SERVER_ROOT + '/payment_provider/';
  
  // access token of Egbert, expires in 100 days.
  module.DEV_ACCESS_TOKEN = "eyJ0b2tlbiI6eyJpZGVudGlmaWVyIjoiZU9tS3ZOa1hTUkxtYlREUSIsInNjb3BlIjpbIjVkZW50aXR5Iiwid2Fja2Fkb28iXSwidGltZXN0YW1wIjoiMjAxMi0wNS0wMlQxNjozMDowMyswMjowMCJ9LCJzaWduYXR1cmUiOiJhZDQ0MzU4NzRmMGFmYTg2N2RlOTAwOTExYTJlMmNlODQzNmNlYTU0In0="
  
  module.DEV_ALLIANCE_ID = 1;
  
  module.NET_AUTO_DETECT_REDIRECT_FLAWS = false ;
  
  module.MAPPING_FORTRESS_SIZE = 64;
  
  module.MAP_ARMY_WIDTH = 64;
  module.MAP_ARMY_HEIGHT = 128;
  
  module.ARMY_MODE_IDLE = 0;
  module.ARMY_MODE_MOVING = 1;
  module.ARMY_MODE_FIGHTING = 2;
  
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
    
    "map/army/stanceAggressive": "images/army/stance_agg.png",
    "map/army/stanceDefensive": "images/army/stance_def.png",
    "map/army/stanceNeutral": "images/army/stance_neu.png",

    "map/army/rank1": 'images/army/rank1.png',
    "map/army/rank2": 'images/army/rank2.png',
    "map/army/rank3": 'images/army/rank3.png',
    "map/army/rank4": 'images/army/rank4.png',
    "map/army/rank5": 'images/army/rank4.png',

    "map/army/target": 'images/army/target.png',
    "map/army/target_background": 'images/white_background.png',

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
    
    // heads.png, eye.png, flash.png, gearwheel.png, heads.png, house.png, magnifier.png, sandglass.png, star.png
    
    "hud/head": 'images/head.png',
    "hud/frog/face": 'images/kopfkroete40.png',
  };
  
  module.MAP_STANCE_IMAGES = [
    "map/army/stanceNeutral",
    "map/army/stanceAggressive",
    "map/army/stanceDefensive"
  ];
  
  console.log('CONFIGURATION: ');
  console.dir(module);
  
  return module;
  
}(AWE.Config || {}));
