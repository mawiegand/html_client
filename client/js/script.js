
window.WACKADOO = (function(module) {
  
  /** creates an application singleton. */
  module.createApplication = function() {
    
    var _rootViewController = null;
    
    var that = {};
    
    that.init = function() {
      AWE.Network.init();                               // initialize the network stack
      AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
        AWE.UI.rootNode = AWE.Map.Manager.rootNode();
      });

      AWE.UI.ImageCache.init();                         // initializes the central image cache
      for (k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k]);
        }
      }
    
      AWE.UI.Map.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
      
      _rootViewController = AWE.Controller.createViewController(AWE.UI.Map);
    };
    
    that.run = function() {
      window.requestAnimFrame(that.runloop);
    };
    
    that.runloop = function() {
      _rootViewController.runloop();  // hand over control to present view controller
      
      window.requestAnimFrame(that.runloop);  // request next animation frame that will initiate the next cycle of the runloop
    }
    
    return that;
  };
  
  return module;
  
}(window.WACKADOO || {}));



$(document).ready(function() {
  
  var application = WACKADOO.createApplication();
  application.init();
  
  $('#zoomin').click(function(){AWE.UI.Map.zoom(.1, true)});
  $('#zoomout').click(function(){AWE.UI.Map.zoom(.1, false)});
  
  application.run();
  
});





