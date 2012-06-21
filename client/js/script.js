/**
 * @fileOverview 
 * Customized application controller for the WACK-A-DOO client.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 */


/**
 * Customized Application controller for WACKADOO client
 *
 * @class 
 * @extends AWE.Application.MultiStageApplication
 * @name WACKADOO
 */
window.WACKADOO = AWE.Application.MultiStageApplication.create(function() {
  var _numLoadedAssets = 0, _numAssets = 0; // this uses a closure for private, not-bindable vars
  
  return /** @lends WACKADOO# */ {
    
    mapScreenController: null,
    allianceScreenController: null,  
    settlementScreenController: null,
    messageCenterController: null,
  
    /** custom object initialization goes here. */
    init: function() {
      this._super();
    },
  
    /** the application's runloop. Does basic stuff needed by the application and then hands over
     * control to the view controller that has to do all the real work. The idea behind implementing
     * the runloop inside view controllers is to spread the application logic for different screens
     * (map screen, settlement screen, news screen, message center) among individual, unrelated
     * classes. That is, each screen should be able to implement it's own application logic, so that
     * it can choose the best technique for the particular task (e.g. canvas for the map, basic HTML
     * for sending and receiving messages.) */
    runloop: function() { 
      if (!this.get('readyForRunloop')) {
        $('#debug2').html('Loading Assets. Progress: ' + _numLoadedAssets + ' / ' + _numAssets);
      }
      else {
        this.get('hudController').setNeedsLayout();
        this.get('hudController').setNeedsDisplay();
      }
      this._super();
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

        self.readyToRun();                            // ready to run
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
      
      _numAssets +=1;
      AWE.GS.RulesManager.updateRules(function(rules, statusCode) {
        if (statusCode === AWE.Net.OK) {
          console.log(rules);
          assetLoaded();
        }
        else {
          console.log('CRITICAL ERROR: could not load rules from server. Error code: ' + statusCode + '. Terminate App.');
          throw "ABORT Due to Failure to load rules.";
        }
      });
      
      _numAssets += 1;  // ok, current character is not really an asset, but it needs to be loaded necessarily as first thing at start
      AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
        if (statusCode === AWE.Net.OK && AWE.GS.CharacterManager.currentCharacter) {
          console.log('INFO: playing as character ', entity);
          var currentCharacter = AWE.GS.CharacterManager.currentCharacter;
          if (currentCharacter.get('alliance_id') && currentCharacter.get('alliance_id') > 0) {
            _numAssets +=1;
            AWE.GS.AllianceManager.updateAlliance(currentCharacter.get('alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
              assetLoaded();
            });
          }
          if (currentCharacter.get('base_node_id')) {
            _numAssets +=1;
            AWE.Map.Manager.fetchSingleNodeById(currentCharacter.get('base_node_id'), function(node) {
              AWE.GS.CharacterManager.currentCharacter.set('base_node', node);
              console.log("Node", node)
              if (self.get('mapScreenController')) {
                self.get('mapScreenController').moveTo(node);
              }
              assetLoaded();
            });
          }
          AWE.GS.ResourcePoolManager.updateResourcePool(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(resourcePool, statusCode) {
            if (statusCode === AWE.Net.OK) {
              console.log(resourcePool);
            }
            else {
              console.log('CRITICAL ERROR: could not load resource pool from server. Error code: ' + statusCode + '. Terminate App.');
              throw "ABORT Due to Failure to load player's resource pool.";
            }
          });

          assetLoaded();
          AWE.Shop.Manager.init();
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

      AWE.UI.ImageCache.init();                   // initializes the central image cache
      for (var k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          _numAssets += 1;                        // count assets
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k], function(name) {
            assetLoaded();
          });
        }
      }

      AWE.Util.TemplateLoader.loadAllTemplates(); // doing this last makes sure _numLoadedAssets may not accidently equal _numAssets before all requests have been started
    },
    
    
    baseButtonClicked: function() {
      if (this.get('presentScreenController') === this.get('mapScreenController')) {
        var node = AWE.GS.CharacterManager.currentCharacter.get('base_node');
        if (node) {
          this.get('presentScreenController').moveTo(node);
        }
      }
      else {
        this.activateMapController();
      }
    },
    
    messagesButtonClicked: function() {
      this.activateMessagesController();
    },
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //  SWITCH SCREEN CONTROLLER
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    activateBaseController: function(reference) {
      var baseController = this.get('settlementScreenController');
      if (!baseController) {
        baseController = AWE.Controller.createSettlementController('#layers');
        this.set('settlementScreenController', baseController);
      }
      if (reference.settlementId !== undefined) {
        baseController.setSettlementId(reference.baseId);
      }
      else if (reference.locationId !== undefined) {
        baseController.setLocationId(reference.locationId);
      }
      else {
        console.log('ERROR: no base to enter specified.')
      }
      console.log(reference)
      this.setScreenController(baseController);
    },
   
    activateFortressController: function(reference) {
      var fortressController = this.get('settlementScreenController');
      if (!fortressController) {
        fortressController = AWE.Controller.createSettlementController('#layers');
        this.set('settlementScreenController', fortressController);
      }
      if (reference.settlementId !== undefined) {
        fortressController.setSettlementId(reference.settlementId);
      }
      else if (reference.locationId !== undefined) {
        fortressController.setLocationId(reference.locationId);
      }
      else if (reference.node !== undefined) {
        fortressController.setNode(reference.node);
      }
      else {
        console.log('ERROR: no fortress to enter specified.')
      }
      this.setScreenController(fortressController);
    },   
   
   
    activateMessagesController: function() {
      var messageCenterController = this.get('messageCenterController');
      if (!messageCenterController) {
        messageCenterController = AWE.Controller.createMessageCenterController('#layers');
        this.set('messageCenterController', messageCenterController);
      }
      this.setScreenController(messageCenterController);      
    },
    
    activateMapController: function() {
      this.setScreenController(this.get('mapScreenController'));
    },
       
    activateAllianceController: function(alliance_id) {
      var allianceController = this.get('allianceScreenController');
      if (!allianceController) {
        allianceController = AWE.Controller.createAllianceController('#layers');
        this.set('allianceScreenController', allianceController);
      }
      allianceController.setAllianceId(alliance_id);
      this.setScreenController(allianceController);
    },
    
    
    /** starts the app when the document is ready. */
    ready: function() {
      this._super();
      
      
      var args = JSON.parse(window.name)
      log(window.name, args)

      // window.name = "";                                 // unset variables
      
      if (!args || !args.accessToken) {
        alert('FATAL ERROR: Invalid Credentials. Please contact the support staff.');
        document.location.href = AWE.Config.SERVER_ROOT;
        return ;
      }
      var accessToken = args.accessToken ; // || AWE.Config.DEV_ACCESS_TOKEN || null;
      AWE.Settings.locale = args.locale || AWE.Config.DEFAULT_LOCALE;  // TODO: This is a hack, should go to settings.
            
      AWE.Net.currentUserCredentials = AWE.Net.UserCredentials.create({
        access_token: accessToken,
      });
          
      AWE.Net.init();                                   // initialize the network stack
      AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
        AWE.UI.rootNode = AWE.Map.Manager.rootNode();
      });
   
      // AWE.Shop.Manager.init();                          // initialize the shop manager
      
      this.loadAssets();

      var hud = AWE.Controller.createHUDController();
      hud.init();
      this.setHudController(hud);
  
      var controller = AWE.Controller.createMapController('#layers');
      controller.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
    

      var self = this;
      $('#zoomin').click(function(){ WACKADOO.get('presentScreenController').zoom(0.1, true); });   //controller.zoom(.1, true)});   // TODO: this is linked to the map controller and will send events even in case the controller's gone
      $('#zoomout').click(function(){ WACKADOO.get('presentScreenController').zoom(0.1, false); }); //controller.zoom(.1, false)});

      this.set('mapScreenController', controller);
      this.setScreenController(controller);
      
      this.startRunloop();
    }
  }
}());






