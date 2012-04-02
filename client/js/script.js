
window.WACKADOO = (function(module) {
  
  /** creates an application singleton */
  module.createApplication = function() {
    
    var _rootScreenController = null;
    var _initialized = false;
    var _numLoadedAssets = 0;
    var _numAssets = 0;
    
    var that = {};
    
    /** initializes needed modules and creates a root view controller. */
    that.init = function() {
      AWE.Net.init();                                   // initialize the network stack
      AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
        AWE.UI.rootNode = AWE.Map.Manager.rootNode();
      });
  
      _numLoadedAssets = _numAssets = 0;

      AWE.UI.ImageCache.init();                         // initializes the central image cache
      for (k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          _numAssets += 1;                              // count assets
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k], function(name) {
            that.imageLoaded(name);
          });
        }
      }
    
      
      _rootScreenController = AWE.Controller.createMapController('#layers');
      _rootScreenController.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
    };
    
    that.imageLoaded = function(name) {
      _numLoadedAssets += 1;
      if (_numLoadedAssets === _numAssets) {           // have loaded all assets?
        _initialized = true;
        $('#debug2').html("Initialization done.");
      }
    }
    
    that.rootScreenController = function() { return _rootScreenController; }
    
    /** starts the application, enters an infinite loop triggered by window.requestAnimFrame. */
    that.run = function() {
      window.requestAnimFrame(that.runloop);
    };
    
    /** the application's runloop. Does basic stuff needed by the application and then hands over
     * control to the view controller that has to do all the real work. The idea behind implementing
     * the runloop inside view controllers is to spread the application logic for different screens
     * (map screen, settlement screen, news screen, message center) among individual, unrelated
     * classes. That is, each screen should be able to implement it's own application logic, so that
     * it can choose the best technique for the particular task (e.g. canvas for the map, basic HTML
     * for sending and receiving messages.) */
    that.runloop = function() {
      if (_initialized) {
        _rootScreenController.runloop();      // hand over control to present screen controller
      }
      else {
        $('#debug2').html('Loading Assets. Progress: ' + _numLoadedAssets + ' / ' + _numAssets);
      }
      window.requestAnimFrame(that.runloop);  // request next animation frame that will initiate the next cycle of the runloop
    };
    
    return that;
  };
  
  return module;
  
}(window.WACKADOO || {}));



$(document).ready(function() {
  
  var application = WACKADOO.createApplication();
  application.init();
  
  $('#zoomin').click(function(){application.rootScreenController().zoom(.1, true)});
  $('#zoomout').click(function(){application.rootScreenController().zoom(.1, false)});
  
  application.run();
});





