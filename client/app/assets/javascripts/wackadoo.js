/**
 * @fileOverview 
 * Customized application controller for the WACK-A-DOO client.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 */


/*window.onunload = function() {
  alert('hello')
}*/

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
    
    startupArguments: null,
    
    mapScreenController:        null,
    allianceScreenController:   null,  
    messageCenterController:    null,

    settlementScreenController: null,    
    baseScreenController:       null,
    fortressScreenController:   null,
    outpostScreenController:    null,
    
    sessionEnded: false,
  
    /** custom object initialization goes here. */
    init: function() {
      this._super();
    },
    
    reload: function() {
      window.name = this.get('startupArguments');
      window.location.reload();
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
        //this.get('hudController').setNeedsLayout();
        //this.get('hudController').setNeedsDisplay();
      }
      
      if (!this.get('sessionEnded') && AWE.Net.currentUserCredentials.expiration.getTime() < new Date().getTime()) {
        this.set('sessionEnded', true);
        document.location.href = AWE.Config.PORTAL_ROOT;
      }
      
      this._super();
    },
    
    showWelcomeDialog: function() {
      var dialog = AWE.UI.Ember.WelcomeDialog.create({
        okPressed:    function() {
          AWE.GS.TutorialStateManager.checkForNewQuests();
          this.destroy();
        },            
      });
      this.presentModalDialog(dialog);      
    },
    
    openEncyclopedia: function() {
      var dialog = AWE.UI.Ember.EncyclopediaView.create();
      this.presentModalDialog(dialog);      
    },
    
    showQuestListDialog: function() {
      var self = this;
      var dialog = AWE.UI.Ember.QuestListView.create({
        tutorialState: AWE.GS.TutorialStateManager.getTutorialState(),
      });
      this.presentModalDialog(dialog);      
      AWE.GS.TutorialStateManager.updateTutorialState(function(tutorialState, statusCode) {
        // log('---> tutorial state geladen', tutorialState, statusCode);
      });
    },
    
    showAnnouncement: function() {
      var self = this;
      
      /*
      var dialog = AWE.UI.Ember.TutorialEndDialog.create();
      self.presentModalDialog(dialog); */
      
      AWE.GS.AnnouncementManager.updateAnnouncement(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(announcement, statusCode) {
        if (statusCode === AWE.Net.OK) {
          var dialog = AWE.UI.Ember.AnnouncementDialog.create({
            announcement: announcement,
            okPressed:    function() {
              AWE.GS.TutorialStateManager.checkForNewQuests();
              this.destroy();
            },            
          });
          self.presentModalDialog(dialog);      
        }
        else {
          log('ERROR: could not fetch latest announcement.')
        }
      });
    },

    reconnectChat: function() {
	    disconnectMini();
	    this.initChat(true);
    },
    
    initChat: function(reconnect) {
	  reconnect = reconnect || false;
      DEVELOPER = 'on'
      
      var jappix_addBuddyMini = addBuddyMini; // jappix is in global namespace :-(

      
/*      addBuddyMini = function(xid, hash, nick, groupchat, subscription) {
        var filter             = [ 'global', 'help' ] ;
        
        var shouldAdd = true ;
        filter.forEach(function(channel) {
          var start = groupchat.slice(0, channel.length);
          shouldAdd = shouldAdd && channel !== start;
        });
        
        if (!shouldAdd) {
          return false ;
        }
        else {
          return jappix_addBuddyMini(xid, hash, nick, groupchat, subscription);
        }
      };    */
      
      var identifier  = AWE.GS.game.currentCharacter.get('identifier');
      var tag         = AWE.GS.game.currentCharacter.get('alliance_tag');
      var name        = AWE.GS.game.currentCharacter.get('name');
      var accessToken = AWE.Net.currentUserCredentials.get('access_token');
      
      var base        = AWE.Config.JABBER_SERVER_BASE;
    
      // we're using a standalone js-script (MPL licensed)
      // extracted from JAPPIX. details can be found in this pull request:
      // https://github.com/jappix/jappix/pull/110

      HOST_MAIN      = base;
      HOST_MUC       = "conference."+base;
      HOST_PUBSUB    = "pubsub."    +base;
      HOST_VJUD      = "vjud."      +base;
      HOST_ANONYMOUS = "anonymous." +base;
      HOST_BOSH      = "http://"+base+"/http-bind/";
      
      var character = AWE.GS.game && AWE.GS.game.get('currentCharacter');
      var beginner  = character && character.get('login_count') <= 1;    
      var openPane  = character && character.get('login_count') <= 3;  // whether or not to open a chat pane initially

      // Define groupchats here
      if (beginner) {
        MINI_GROUPCHATS                  = tag ? [ tag+"@conference."+base, "plauderhöhle@conference."+base, 'help@conference.'+base ] : [ "plauderhöhle@conference."+base, 'help@conference.'+base ];
        MINI_SUGGEST_GROUPCHATS          =  [ "global@conference."+base, 'handel@conference.'+base, 'plauderhöhle@conference.'+base ]; 
        MINI_5D_NON_CLOSEABLE_GROUPCHATS = tag ? [ 'help@conference.'+base,  tag+"@conference."+base ] : [ 'help@conference.'+base ];       
      }
      else {
        MINI_GROUPCHATS                  = tag ? [ tag+"@conference."+base, "plauderhöhle@conference."+base , "global@conference."+base] : [ "plauderhöhle@conference."+base,  "global@conference."+base ];
        MINI_SUGGEST_GROUPCHATS          =  [ 'help@conference.'+base, 'handel@conference.'+base, 'plauderhöhle@conference.'+base ];
        MINI_5D_NON_CLOSEABLE_GROUPCHATS = tag ? [ tag+"@conference."+base, "global@conference."+base ] : [ "global@conference."+base ];     
          
        if (character && character.hasStaffRole('help')) {
          MINI_GROUPCHATS.push("help@conference."+base);
        }
      }
      
      MINI_5D_NO_USERLIST_GROUPCHATS     = [ 'help@conference.'+base, 'global@conference.'+base ];
      MINI_5D_STAFF_POSTFIXES            = [ '| 5D', '@mod', '@admin', '@staff' ];
      
      JAPPIX_STATIC = 'jappix/'
      
      // Define chats here
      MINI_CHATS = [];
      
      // Add an animation
      MINI_ANIMATE = false;
      
      // Define the user nickname
      MINI_NICKNAME = (name || "ChatUser") + (tag ? " | "+tag : "");
      
      // Random user nickname (if no nickname)
      MINI_RANDNICK = true;
      
      // Override the default session resource
      MINI_RESOURCE = "WackadooChat" + Math.floor(Math.random()*100000);
      
      // Connect the user (autoconnect, show_pane, domain, username, password)
      // Notice: put true/false to autoconnect and show_pane
      // Notice: exclude "user" and "password" if using anonymous login
            
      if (AWE.Config.IN_DEVELOPMENT_MODE) {
        log('JABBER LOGIN FOR DEVELOPMENT MODE:', AWE.Config.JABBER_DEVELOPMENT_JID);
        launchMini(!beginner, openPane, base, AWE.Config.JABBER_DEVELOPMENT_JID, AWE.Config.JABBER_DEVELOPMENT_PWD);
      }
      else {
        launchMini(!beginner, openPane, base, identifier, accessToken);
      }

  	  if (!reconnect) {
          this.addDomElement(('.jm_prompt'), false);      
          this.addDomElement(('.jm_starter'), false);
          this.addDomElement(('.jm_pane'), false);
          this.addDomElement(('.jm_chat-content'), false);
          this.addDomElement(('.jm_conversation'), false);
          this.addDomElement(('.jm_conversations'), false)
          this.addDomElement(('.jm_roster'), false)
          this.addDomElement(('.jm_send-messages'), false)
          this.addDomElement(('.jm_chat-content form'), false);
  	  }
    },   
    
    showStartupDialogs: function() {
      
      if (!AWE.GS.game.getPath('currentCharacter.login_count') || AWE.GS.game.getPath('currentCharacter.login_count') <= 1) { // in case the character is not already set (bug!), show the welcome dialog to make sure, new players always see it.
        this.showWelcomeDialog();
      }
      else {
        this.showAnnouncement();
      }
      
      if (AWE.GS.game.currentCharacter && !AWE.GS.game.currentCharacter.get('reached_game')) {
        // track conversion: character reached the game (and pressed a button!)
        var action = AWE.Action.Fundamental.createTrackCharacterConversionAction("reached_game");
        action.send();   
      }  
      
    },
  
    /** loads and initializes needed modules. 
     * Caution: 
     * initialization is done asynchronously! check _initialized = true before
     * doing anything wit the app controller. */
    loadAssets: function() {
      var self = this;

      /** does final initialization after loading has finished */
      var postLoading = function() {
        $('#loaddialog-wrapper').remove();

        $('#debug2').html("Initialization done.");
        
        Ember.Handlebars.bootstrap();                  // Bootstrap Ember a second time to parse the newly loaded templates.

        var hud = AWE.Controller.createHUDController();
        hud.init();
        self.setHudController(hud);
        
        AWE.Map.Manager.init(2, function() {              // initialize the map manager (fetches data!)
          AWE.UI.rootNode = AWE.Map.Manager.rootNode();
        });
        
        var controller = AWE.Controller.createMapController('#layers');
        controller.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));  // TODO init with users main location
        self.set('mapScreenController', controller);
      
       // $('#zoomin').click(function(){ WACKADOO.get('presentScreenController').zoom(0.1, true); });   //controller.zoom(.1, true)});   // TODO: this is linked to the map controller and will send events even in case the controller's gone
       // $('#zoomout').click(function(){ WACKADOO.get('presentScreenController').zoom(0.1, false); }); //controller.zoom(.1, false)});
  
  
        var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
        
        if (!AWE.Config.USE_TUTORIAL ||
            (tutorialState &&
             tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID) &&
             tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID).get('status') >= AWE.GS.QUEST_STATUS_FINISHED)) {
          self.activateMapController();
          var node = AWE.GS.CharacterManager.getCurrentCharacter().get('base_node');
          controller.moveTo(node);
        }
        else {
          var locationId = AWE.GS.CharacterManager.getCurrentCharacter().get('base_location_id');
          self.activateBaseController({locationId: locationId});
        }
        
        self.startRunloop();
        self.readyToRun();                            // ready to run
        self.showStartupDialogs();
        
        if (AWE.Config.CHAT_SHOW) {  // && AWE.GS.game.currentCharacter && AWE.GS.game.currentCharacter.get('login_count') > 1) {
          self.initChat();
        }
      }
      
  
      /** callback executed for each asset that completely loaded. */
      var assetLoaded = function() {
        _numLoadedAssets += 1;
        $('div.loaddialog-progress').css('width', '' + Math.floor(Math.pow(_numLoadedAssets / _numAssets, 2.0) * 100) + '%');
        if (_numLoadedAssets === _numAssets) {           // have loaded all assets?
          postLoading(); 
        }
      };
              
      _numLoadedAssets = _numAssets = 0;
      
      // /// REGISTER AND COUNT IMAGES AND TEMPLATES ////

      AWE.UI.ImageCache.init();                   // initializes the central image cache
      for (var k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          _numAssets += 1;                        // count assets
        }
      }

      _numAssets += AWE.UI.Ember.templates.length;
      for (var i=0; i < AWE.UI.Ember.templates.length; i++) {
        AWE.Util.TemplateLoader.registerTemplate(AWE.UI.Ember.templates[i], function() {
          assetLoaded();
        });
      }
      // /// DONE ///      
      
      _numAssets +=1;
      AWE.GS.RulesManager.updateRules(function(rules, statusCode) {
        if (statusCode === AWE.Net.OK) {
          log('Rules', rules);

          _numAssets += 1;  // ok, current character is not really an asset, but it needs to be loaded necessarily as first thing at start
          AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
            if (statusCode === AWE.Net.OK && AWE.GS.CharacterManager.getCurrentCharacter()) {
              log('INFO: playing as character ', entity);
              var currentCharacter = AWE.GS.CharacterManager.getCurrentCharacter();
              if (currentCharacter.get('alliance_id') && currentCharacter.get('alliance_id') > 0) {
                _numAssets +=1;
                // log('---> load alliance');
                AWE.GS.AllianceManager.updateAlliance(currentCharacter.get('alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
                  assetLoaded();
                });
              }
          
              if (currentCharacter.get('base_node_id')) {
                _numAssets +=1;
                AWE.Map.Manager.fetchSingleNodeById(currentCharacter.get('base_node_id'), function(node) {
                  AWE.GS.CharacterManager.getCurrentCharacter().set('base_node', node);
                  log("Node", node)
                  assetLoaded();
                });
              }

              if (AWE.Config.USE_TUTORIAL) {
                _numAssets += 2;
                AWE.GS.TutorialManager.updateTutorial(function(tutorial, statusCode) {
                  if (statusCode === AWE.Net.OK) {
                    log('Tutorial', tutorial);
                    assetLoaded();
                
                    AWE.GS.TutorialStateManager.updateTutorialState(function(tutorialState, statusCode) {
                      log("TutorialState", tutorialState)
                      assetLoaded();
                    });
                  }
                  else {
                    log('CRITICAL ERROR: could not load tutorial from server. Error code: ' + statusCode + '. Terminate App.');
                    throw "ABORT Due to Failure to load tutorial.";
                  }
                });
              }

              _numAssets += 1;
              AWE.GS.ResourcePoolManager.updateResourcePool(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(resourcePool, statusCode) {
                if (statusCode === AWE.Net.OK) {
                  log(resourcePool);
                  assetLoaded();
                }
                else {
                  log('CRITICAL ERROR: could not load resource pool from server. Error code: ' + statusCode + '. Terminate App.');
                  throw "ABORT Due to Failure to load player's resource pool.";
                }
              });

              _numAssets += 1;
              AWE.GS.RoundInfoManager.updateRoundInfo(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(resourcePool, statusCode) {
                if (statusCode === AWE.Net.OK) {
                  log('RoundInfo', AWE.GS.game.roundInfo);
                  assetLoaded();
                }
                else {
                  log('CRITICAL ERROR: could not load round info from server. Error code: ' + statusCode + '. Terminate App.');
                  throw "ABORT Due to Failure to load game's round info.";
                }
              });

              assetLoaded();
            }
            else {
              alert ('Das Spiel konnte nicht geladen werden. Bitte drücke den Aktualisieren-Knopf Deines Browsers, meist hilft schlichtes Neuladen der Seite und Login. Falls auch das nicht hilft, kontaktiere bitte den Support. Wir unterstützen folgende Browser: Chrome, Firefox, Internet Explorer 9 und Safari; je neuer, desto besser (und schneller).');
              log('CRITICAL ERROR: could not load current character from server. Error code: ' + statusCode + '. Terminate App.');
              throw "ABORT Due to Failure to Load Player's Current Character.";
            }
          });

          assetLoaded();
        }
        else {
          log('CRITICAL ERROR: could not load rules from server. Error code: ' + statusCode + '. Terminate App.');
          throw "ABORT Due to Failure to load rules.";
        }
      });
      
      for (var k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {     // and preload assets
        if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
          AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k], function(name) {
            assetLoaded();
          });
        }
      }

      AWE.Util.TemplateLoader.loadAllTemplates(); // doing this last makes sure _numLoadedAssets may not accidently equal _numAssets before all requests have been started
    },
    
    
    baseButtonClicked: function() {
      if (this.get('presentScreenController') === this.get('mapScreenController')) {
        var node = AWE.GS.game.getPath('currentCharacter.base_node');
        if (node) {
          this.get('presentScreenController').moveTo(node, true);
        }
      }
      else {
        this.activateMapController();
      }
    },
    
    baseButtonDoubleClicked: function() {
      this.activateBaseController();
    },    
    
    characterButtonClicked: function() {
      var dialog = AWE.UI.Ember.ProfileView.create({
        characterBinding: 'AWE.GS.game.currentCharacter',
      });
      this.presentModalDialog(dialog);      
    },
    
    messagesButtonClicked: function() {
      this.activateMessagesController();
    },
    
    presentResourceDetailsDialog: function() {
      var dialog = AWE.UI.Ember.ResourceDetailsDialog.create({
        pool: AWE.GS.ResourcePoolManager.getResourcePool(),
      });
      this.presentModalDialog(dialog);
    },
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //  SWITCH SCREEN CONTROLLER
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    // it's not necessary to have three different controllers for the different
    // settlement types, as the settlement controller will handle a switch
    // from a settlement of one type to a settlement of another type gracefully.
    // But there is one benefit of using different controllers: it allows
    // the user to switch faster between different settlements, as the most time
    // is needed to recreate a view for another type. Having three different 
    // controllers (with the correct view already associated and created), 
    // completely removes the need for recreating the view.
    //
    // a small glitch: when you enter an outpost from the map, the base-controller
    // is instantiated presently. on your first switch to your base you will
    // see a short flicker because the view has to be recreated with the correct
    // type. this should be improved later.
    activateSettlementController: function(settlement) {
      if (settlement.get('type_id') === AWE.GS.SETTLEMENT_TYPE_FORTRESS) {
        log('ACTIVATE FORTRESS CONTROLLER');
        this.activateFortressController({ settlementId: settlement.get('id')});
      }
      else if (settlement.get('type_id') === AWE.GS.SETTLEMENT_TYPE_OUTPOST) {
        log('ACTIVATE OUTPOST CONTROLLER');
        this.activateOutpostController({ settlementId: settlement.get('id')});
      }
      else {
        log('ACTIVATE BASE CONTROLLER');
        this.activateBaseController({ settlementId: settlement.get('id')});
      }
    },
    
    activateBaseController: function(reference) {
      reference = reference ||  { locationId: AWE.GS.game.getPath('currentCharacter.base_location_id') };
      var baseController = this.get('baseScreenController');
      if (!baseController) {
        baseController = AWE.Controller.createSettlementController('#layers');
        this.set('baseScreenController', baseController);
      }
      if (reference.settlementId !== undefined) {
        baseController.setSettlementId(reference.settlementId);
      }
      else if (reference.locationId !== undefined) {
        baseController.setLocationId(reference.locationId);
      }
      else {
        log('ERROR: no base to enter specified.')
      }
      log(reference)
      this.setScreenController(baseController);
    },
   
    baseControllerActive: function() {
      return (this.get('presentScreenController') === this.get('outpostScreenController') && this.get('outpostScreenController')) ||(this.get('presentScreenController') === this.get('baseScreenController') && this.get('baseScreenController')) || (this.get('presentScreenController') === this.get('fortressScreenController') && this.get('fortressScreenController'));
    },
      
       
    activateFortressController: function(reference) {
      var fortressController = this.get('fortressScreenController');
      if (!fortressController) {
        fortressController = AWE.Controller.createSettlementController('#layers');
        this.set('fortressScreenController', fortressController);
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
        log('ERROR: no fortress to enter specified.')
      }
      this.setScreenController(fortressController);
    },   
    
    activateOutpostController: function(reference) {
      var outpostController = this.get('outpostScreenController');
      if (!outpostController) {
        outpostController = AWE.Controller.createSettlementController('#layers');
        this.set('outpostScreenController', outpostController);
      }
      if (reference.settlementId !== undefined) {
        outpostController.setSettlementId(reference.settlementId);
      }
      else if (reference.locationId !== undefined) {
        outpostController.setLocationId(reference.locationId);
      }
      else if (reference.node !== undefined) {
        outpostController.setNode(reference.node);
      }
      else {
        log('ERROR: no outpost to enter specified.')
      }
      this.setScreenController(outpostController);
    },   
   
    activateMessagesController: function(args) {
      args = args || {};
      var messageCenterController = this.get('messageCenterController');
      if (!messageCenterController) {
        messageCenterController = AWE.Controller.createMessageCenterController('#layers');
        this.set('messageCenterController', messageCenterController);
      }
      this.setScreenController(messageCenterController);      
      if (args.recipient !== undefined && args.recipient !== null) {
        messageCenterController.createDraftTo(args.recipient.name);
      }
    },
    
    activateMapController: function(preventZoomingToLastSelection) {
      var controller = this.get('mapScreenController');
      this.setScreenController(controller, preventZoomingToLastSelection);
      return controller;
    },
    
    mapControllerActive: function() {
      return this.get('presentScreenController') === this.get('mapScreenController');
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
    
    
    showBrowserSelection: function() {
      document.location.href = AWE.Config.PORTAL_ROOT + '/browser.html';
    },

    /** starts the app when the document is ready. */
    ready: function() {
      
      /** uncomment the following two lines to print translation table and exit */
      // AWE.I18n.printTranslationTable();
      // return;
      
      this._super();
      
      try {
        var args = JSON.parse(window.name ) //|| "{}")
        log('window.name, parsed window.name', window.name, args)
      }
      catch (e) {
      }
      this.set('startupArguments', window.name);
      window.name = "";                                 // unset variables
      
      if (!args || !args.accessToken) {
        // alert('FATAL ERROR: Invalid Credentials. Please contact the support staff.');
        document.location.href = AWE.Config.PORTAL_ROOT;
        return ;
      }
      var accessToken = args.accessToken ;                             // || AWE.Config.DEV_ACCESS_TOKEN || null;
      var expiration  = parseInt(args.expiration || "3600");           // asume one hour validity as default
      AWE.Settings.locale = args.locale || AWE.Config.DEFAULT_LOCALE;  // TODO: This is a hack, should go to settings.
      AWE.Settings.signin_with_client_id = args.client_id || '';   
      AWE.Settings.referer = args.referer;
      AWE.Settings.requestUrl = args.requestUrl;
      AWE.Settings.playerInvitation = args.playerInvitation;
      AWE.Settings.allianceInvitation = args.allianceInvitation;
      
      log('SETTINGS', AWE.Settings);
            
      AWE.Net.currentUserCredentials = AWE.Net.UserCredentials.create({
        access_token: accessToken,
        expiration: (new Date()).add(expiration-120).seconds(),
      });      
      
      AWE.Net.init();                                                  // initialize the network stack
      
      if (!AWE.Config.BROWSER_CHECK_ENABLED || AWE.Util.Browser.checkRequirements()) {
        this.loadAssets();
      }
      else {
        this.showBrowserSelection();
      }
    },
  }
}());
