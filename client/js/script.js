window.WACKADOO = Ember.Application.create(function() {
  var _numLoadedAssets = 0, _numAssets = 0; // this uses a closure for private, not-bindable vars

  return {
    
    rootScreenController: null,
    appCompletelyLoaded: false,
    
    mapScreenController: null,
    allianceScreenController: null,
    
    screenContentAnchor: $('#screen-content'),
    notificationLayerAnchor: $('#notification-layer'),
    hudLayerAnchor: $('#hud-layer'),
    dialogLayerAnchor: $('#dialog-layer'),
  
  
    /** custom object initialization goes here. */
    init: function() {
      this._super();
    },
  
    
    
    /** registers the runloop to be started with next animation frame. Triggered
     * by window.requestAnimationFrame. */
    startRunloop: function() { 
      window.requestAnimFrame(function(self) { return function() {self.runloop(); }; }(this)); // wrap it to keep context (this) correct
    },
    
    
    
    /** the application's runloop. Does basic stuff needed by the application and then hands over
     * control to the view controller that has to do all the real work. The idea behind implementing
     * the runloop inside view controllers is to spread the application logic for different screens
     * (map screen, settlement screen, news screen, message center) among individual, unrelated
     * classes. That is, each screen should be able to implement it's own application logic, so that
     * it can choose the best technique for the particular task (e.g. canvas for the map, basic HTML
     * for sending and receiving messages.) */
    runloop: function() { 
      if (this.get('appCompletelyLoaded') && this.get('rootScreenController')) {
        this.get('rootScreenController').runloop();      // hand over control to present screen controller
      }
      else { // TODO: bind this to the attributes using an ember template.
        $('#debug2').html('Loading Assets. Progress: ' + _numLoadedAssets + ' / ' + _numAssets);
      }
      window.requestAnimFrame(function(self) { return function() {self.runloop(); }; }(this));  // request next animation frame that will initiate the next cycle of the runloop
    },
    
    
  
    /** loads and initializes needed modules. 
     * Caution: 
     * initialization is done asynchronously! check _initialized = true before
     * doing anything wit the app controller. */
    loadAssets: function() {
      var self = this;
      var loadDialog;

      /** does final initialization after loading has finished */
      var postLoading = function() {
        loadDialog.remove();
        loadDialog = null;                             // done, can be garbage collected.
        $('#debug2').html("Initialization done.");
        
        Ember.Handlebars.bootstrap();                  // Bootstrap Ember a second time to parse the newly loaded templates.

        self.appCompletelyLoaded = true;                       // ready to run
      }
      
  
      /** callback executed for each asset that completely loaded. */
      var assetLoaded = function() {
        _numLoadedAssets += 1;
        $('div.loaddialog-progress').css('width', '' + Math.floor(_numLoadedAssets / _numAssets * 100) + '%');
        if (_numLoadedAssets === _numAssets) {           // have loaded all assets?
          postLoading(); 
        }
      };
    
      loadDialog = Ember.View.create({
        templateName: 'load-dialog',
      });
      loadDialog.append();   
          
      _numLoadedAssets = _numAssets = 0;
      
      _numAssets += 1;  // ok, current character is not really an asset, but it needs to be loaded necessarily as first thing at start
      AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
        if (statusCode === AWE.Net.OK && AWE.GS.CharacterManager.currentCharacter) {
          console.log('INFO: playing as character ' + entity + '.');
          assetLoaded();
        }
        else {
          console.log('CRITICAL ERROR: could not load current character from server. Error code: ' + statusCode + '. Terminate App.');
          throw "ABORT Due to Failure to Load Player's Current Character.";
        }
      });

      for (var i=0; i < AWE.UI.Ember.templates.length; i++) {
        _numAssets += 1;
        AWE.Util.TemplateLoader.registerTemplate(AWE.UI.Ember.templates[i], function() {
          assetLoaded();
        });
      }

      AWE.UI.ImageCache.init();                         // initializes the central image cache
      for (var k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          _numAssets += 1;                              // count assets
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k], function(name) {
            assetLoaded();
          });
        }
      }

      AWE.Util.TemplateLoader.loadAllTemplates();       // doing this last makes sure _numLoadedAssets may not accidently equal _numAssets before all requests have been started
    },
    
    activateMapController: function() {
      this.setScreenController(this.get('mapScreenController'));
    },
    
    activateAllianceController: function() {
      var allianceController = this.get('allianceScreenController');
      if (!allianceController) {
        allianceController = AWE.Controller.createAllianceController('#layers');
        this.set('allianceScreenController', allianceController);
      }
      this.setScreenController(allianceController);
    },
    
    append: function(controller) {
      if (this.get('screenContentAnchor')) {
        this.get('screenContentAnchor').append(controller.rootElement());
      }
    },
    
    remove: function() {
      if (this.get('screenContentAnchor')) {
        this.get('screenContentAnchor').remove(controller.rootElement());
      }
    },
    
    setScreenController: function(controller) {
      var rootController = this.get('rootScreenController');
      if (controller != rootController) {
        if (rootController) {
          rootController.viewWillDisappear();
          this.remove(rootController);
          rootController.viewDidDisappear();
        }
        this.set('rootScreenController', controller);
        if (controller) {
          controller.viewWillAppear();
          this.append(controller);
          controller.viewDidAppear();
        }
      }
    },
  
    /** starts the app when the document is ready. */
    ready: function() {
      this._super();
    
      AWE.Net.init();                                   // initialize the network stack
      AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
        AWE.UI.rootNode = AWE.Map.Manager.rootNode();
      });
        
      this.loadAssets();
    
      var controller = AWE.Controller.createMapController('#layers');
      controller.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
  
      var self = this;
      $('#zoomin').click(function(){ self.activateAllianceController(); });   //controller.zoom(.1, true)});   // TODO: this is linked to the map controller and will send events even in case the controller's gone
      $('#zoomout').click(function(){ self.activateMapController(); }); //controller.zoom(.1, false)});

      this.set('mapScreenController', controller);
      this.setScreenController(controller);

      this.startRunloop();
    }
  }
}());






