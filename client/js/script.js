
window.WACKADOO = (function(module) {
  
  /** creates an application singleton */
  module.createApplication = function(my) {
    
    var _rootScreenController = null;
    var _initialized = false;
    var _numLoadedAssets = 0;
    var _numAssets = 0;
    
    var loadDialog;
    
    my = my || {};
    
    my.assetLoaded = function() {
      _numLoadedAssets += 1;
      $('div.loaddialog-progress').css('width', '' + Math.floor(_numLoadedAssets / _numAssets * 100) + '%');
      if (_numLoadedAssets === _numAssets) {           // have loaded all assets?
        my.postInit(); 
      }
    }
    
    /** does final initialization after loading and finishing everything that
     * has been triggered in init(), */
    my.postInit = function() {
      loadDialog.remove();
      loadDialog = null;                             // done, can be garbage collected.
      $('#debug2').html("Initialization done.");
        
      Ember.Handlebars.bootstrap();                  // Bootstrap Ember a second time to parse the newly loaded templates.

      _initialized = true;                           // ready to run
      
    }
    
    var that = {};
    
    /** initializes needed modules and creates a root view controller. Caution: 
     * initialization is done asynchronously! check _initialized = true before
     * doing anything wit the app controller. */
    that.init = function() {
      loadDialog = Ember.View.create({
        templateName: 'load-dialog',
      });
      loadDialog.append();   
      
      AWE.UI.templates.push('js/awe/UI/dom/templates/armydetails.html');
      
      AWE.Net.init();                                   // initialize the network stack
      AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
        AWE.UI.rootNode = AWE.Map.Manager.rootNode();
      });
  
      _numLoadedAssets = _numAssets = 0;

      for (var i=0; i < AWE.UI.templates.length; i++) {
        _numAssets += 1;
        AWE.Util.TemplateLoader.registerTemplate(AWE.UI.templates[i], function() { console.log('loaded TEMPLATE');
          my.assetLoaded();
        });
      }
      AWE.Util.TemplateLoader.loadAllTemplates();

      AWE.UI.ImageCache.init();                         // initializes the central image cache
      for (var k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          _numAssets += 1;                              // count assets
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k], function(name) {
            my.assetLoaded();
          });
        }
      }
    
      _rootScreenController = AWE.Controller.createMapController('#layers');
      _rootScreenController.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
    };
    
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
    
    that.rootScreenController = function() { return _rootScreenController; }

    
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





