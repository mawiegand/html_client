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

//  Ember.LOG_BINDINGS = true;

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
    
    logout: function() {
      try {
        AndroidDelegate.logout();
      }
      catch (err)
      {
        window.name = "empty";
        if (typeof sessionStorage !== "undefined")
        {
          sessionStorage.startupArguments = null;
        }
        window.location.reload();
      }
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
        //this.get('hudController').setNeedsDisplay();
      }

      if (!this.get('sessionEnded') && AWE.Net.currentUserCredentials.expiration.getTime() < new Date().getTime()) {
        this.set('sessionEnded', true);
        document.location.href = AWE.Config.PORTAL_ROOT;
      }

      this._super();
    },

    showWelcomeDialog: function() {
      var self = this;

      var dialog = AWE.UI.Ember.WelcomeDialog.create({
        okPressed:    function() {
          AWE.GS.TutorialStateManager.checkForNewQuests();
          this.destroy();

          self.get('presentScreenController').welcomeDialogClosed();
        },
      });
      this.presentModalDialog(dialog);
    },

    openEncyclopedia: function() {
      var dialog = AWE.UI.Ember.EncyclopediaView.create();
      this.presentModalDialog(dialog);
    },

    showQuestListDialog: function() {
      var dialog = AWE.UI.Ember.QuestListView.create({
        tutorialState: AWE.GS.TutorialStateManager.getTutorialState(),
      });
      this.presentModalDialog(dialog);
      AWE.GS.TutorialStateManager.updateTutorialState(function(tutorialState, statusCode) {
        // AWE.Log.Debug('---> tutorial state geladen', tutorialState, statusCode);
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

              self.get('presentScreenController').welcomeDialogClosed();
              //self.get('extrasController').startRandomPterodactylus(60, 90);
              self.get('extrasController').enableAutoPterodactylus();
            },
          });
          self.presentModalDialog(dialog);
        }
        else {
          AWE.Log.Debug('ERROR: could not fetch latest announcement.')
        }
      });
    },

    reconnectChat: function() {
      JappixMini.disconnect();
      $('jappix_mini').remove();
      this.initChat();
    },

    chatRoom: function(room, type) {
      if(!JappixCommon.isConnected()) {
        return;
      }

      var chat_room = JappixCommon.generateXID(room.toLowerCase(), 'groupchat');
      if (type == 'join') {
        setTimeout(function(){
          JappixMini.chat('groupchat', chat_room, room, hex_md5(chat_room), '', true);
        }, 10000);
        MINI_SUGGEST_GROUPCHATS.push(chat_room);
      } else if (type == 'leave') {
        JappixMini.removeGroupchat(chat_room);

        var removeID = MINI_SUGGEST_GROUPCHATS.indexOf(chat_room);
        if (removeID != -1) {
          MINI_SUGGEST_GROUPCHATS.splice(removeID, 1);
        }
      }
    },

    initChat: function() {
      MINI_5D_NON_CLOSEABLE_GROUPCHATS = [];
      MINI_5D_NO_USERLIST_GROUPCHATS   = [];

      var base = AWE.Config.JABBER_SERVER_BASE;
      var groupChats = [];
      var groupChatsSuggest = [];

      var character = AWE.GS.game && AWE.GS.game.get('currentCharacter');
      var firstStart= character && character.get('beginner');
      var beginner  = character && character.get('chat_beginner');
      var insider   = character && character.get('insider');
      var openPane  = character && character.get('open_chat_pane');  // whether or not to open a chat pane initially

      if (AWE.Config.IN_DEVELOPMENT_MODE) {
        AWE.Log.Debug('JABBER LOGIN FOR DEVELOPMENT MODE:', AWE.Config.JABBER_DEVELOPMENT_JID);
        var identifier  = AWE.Config.JABBER_DEVELOPMENT_JID;
        var accessToken = AWE.Config.JABBER_DEVELOPMENT_PWD;
      }
      else {
        var identifier  = AWE.GS.game.currentCharacter.get('identifier');
        var accessToken = AWE.Net.currentUserCredentials.get('access_token');
      }

      if (AWE.GS.game.currentCharacter.get('alliance_tag')) {
        groupChats.push(AWE.GS.game.currentCharacter.get('alliance_tag')+"@conference."+base);
        groupChatsSuggest.push(AWE.GS.game.currentCharacter.get('alliance_tag')+"@conference."+base);
        MINI_5D_NON_CLOSEABLE_GROUPCHATS = [AWE.GS.game.currentCharacter.get('alliance_tag')+"@conference."+base ];
      }
      groupChatsSuggest.push("help@conference."+base, "global@conference."+base, "handel@conference."+base);

      if (insider) {
        groupChats.push("insider@conference."+base);
        groupChatsSuggest.push("insider@conference."+base);
      }

      var locale = AWE.Settings.locale || AWE.Config.DEFAULT_LOCALE;
      if (locale && locale === "de_DE") {
        groupChats.push("plauderhöhle@conference."+base);
        groupChatsSuggest.push("plauderhöhle@conference."+base);
      } else {
        groupChats.push("whisperingcavern@conference."+base);
        groupChatsSuggest.push("whisperingcavern@conference."+base);
      }

      if (character && character.hasStaffRole('help')) {
        groupChats.push("help@conference."+base, "beginner@conference."+base );
        groupChatsSuggest.push("beginner@conference."+base);
        MINI_5D_NON_CLOSEABLE_GROUPCHATS.push("help@conference."+base);
      }

      if (beginner) {
        groupChats.push("beginner@conference."+base);
        MINI_5D_NON_CLOSEABLE_GROUPCHATS.push("beginner@conference."+base);
      }
      else {
        groupChats.push("global@conference."+base);
      }

      MINI_5D_NO_USERLIST_GROUPCHATS.push("global@conference."+base, "insider@conference."+base);
      if (character && character.hasStaffRole('help')) {
        MINI_5D_NO_USERLIST_GROUPCHATS = [];
      }
      MINI_5D_STAFF_POSTFIXES = ['| 5d', '@mod', '@admin', '@staff']; // lowercase check!

      if ("https:" == document.location.protocol) {
          HOST_BOSH = "https://" + AWE.Config.BOSH_SERVER_BASE + "/http-bind/";
      } else {
          HOST_BOSH = "http://" + AWE.Config.BOSH_SERVER_BASE + "/http-bind/";
      }
      HOST_MUC       = "conference."+base;
      HOST_PUBSUB    = "pubsub."    +base;
      HOST_VJUD      = "vjud."      +base;
      HOST_ANONYMOUS = "anonymous." +base;

      JappixMini.launch({
          connection: {
              user:     identifier,
              password: accessToken,
              domain:   base,
              resource: "WackadooChat" + Math.floor(Math.random()*100000)
          },

          application: {
              network: {
                  autoconnect: true
              },

              interface: {
                  showpane: !firstStart && openPane,
                  animate: true
              },

              user: {
                  random_nickname: true,
                  nickname: (AWE.GS.game.currentCharacter.get('name') || "ChatUser") + (AWE.GS.game.currentCharacter.get('alliance_tag') ? " | "+AWE.GS.game.currentCharacter.get('alliance_tag') : ""),
              },

              chat: {
                  open: [],
              },

              groupchat: {
                  open: groupChats,
                  open_passwords: [],
                  suggest: groupChatsSuggest,
                  suggest_passwords: []
              }
          }
      });
    },

    showStartupDialogs: function() {

      if (AWE.GS.game.getPath('currentCharacter.beginner') === false) { // in case the character is not already set (bug!), show the welcome dialog to make sure, new players always see it.
        this.showAnnouncement();
      }
      else {
        this.showWelcomeDialog();
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

      if (AWE.Facebook.isFbPlayer) {
        AWE.Facebook.init();
      }

      /** does final initialization after loading has finished */
      var postLoading = function() {
        $('#loaddialog-wrapper').remove();

        $('#debug2').html("Initialization done.");

        Ember.Handlebars.bootstrap();                  // Bootstrap Ember a second time to parse the newly loaded templates.

        var tutorialState     = AWE.GS.TutorialStateManager.getTutorialState();
        var hasBase           = !!AWE.GS.CharacterManager.getCurrentCharacter().get('base_node_id');
        var startInSettlement = true ; /*hasBase && AWE.Config.USE_TUTORIAL && (
          tutorialState && tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID) &&
            tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID).get('status') < AWE.GS.QUEST_STATUS_FINISHED);*/
        var identifier        = AWE.GS.CharacterManager.getCurrentCharacter().get('identifier');

        AWE.GS.SettlementManager.updateOwnSettlements();

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

        if (!startInSettlement) {
          self.activateMapController();
          if (hasBase) {
            var node = AWE.GS.CharacterManager.getCurrentCharacter().get('base_node');
            controller.moveTo(node);
          }
        }
        else {
          var locationId = AWE.GS.CharacterManager.getCurrentCharacter().get('base_location_id');
          self.activateBaseController({
            locationId: locationId
          });
        }

        var extras = AWE.Controller.createExtrasController();
        extras.init();
        self.setExtrasController(extras);

        self.startRunloop();
        self.readyToRun();                            // ready to run
        self.showStartupDialogs();

        AWE.Facebook.updateFBCanvasSize();  // updates size of canvas, iff running in canvas
        AWE.Facebook.setDoneLoading();      // track loading time, iff running in canvas

        Sample.setUserId(identifier);

        if (Sample.getPlatform() != Sample.PLATFORM_ANDROID)
        {
          Sample.sessionUpdate();  
          Sample.track('started', 'session');
        }

        if (AWE.Config.CHAT_SHOW) {
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

          _numAssets += 1;  // ok, current character is not really an asset, but it needs to be loaded necessarily as first thing at start
          AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
            if (statusCode === AWE.Net.OK && AWE.GS.CharacterManager.getCurrentCharacter()) {
              AWE.Log.Debug('INFO: playing as character ', entity);
              var currentCharacter = AWE.GS.CharacterManager.getCurrentCharacter();
              if (currentCharacter.get('alliance_id') && currentCharacter.get('alliance_id') > 0) {
                _numAssets +=1;
                AWE.GS.AllianceManager.updateAlliance(currentCharacter.get('alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
                  assetLoaded();
                });
              }

              AWE.Config.Cohort.configFromCharacter(currentCharacter);

              if (currentCharacter.get('base_node_id')) {
                _numAssets +=1;
                AWE.Map.Manager.fetchSingleNodeById(currentCharacter.get('base_node_id'), function(node) {
                  AWE.GS.CharacterManager.getCurrentCharacter().set('base_node', node);
                  assetLoaded();
                });
              }
              else {
                _numAssets +=1;
                AWE.GS.ArmyManager.updateArmiesForCharacter(currentCharacter.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode) {
                  assetLoaded();
                });
              }

              if (AWE.Config.USE_TUTORIAL) {
                _numAssets += 2;
                AWE.GS.TutorialManager.updateTutorial(function(tutorial, statusCode) {
                  if (statusCode === AWE.Net.OK || statusCode === AWE.Net.NOT_MODIFIED) {
                    assetLoaded();

                    AWE.GS.TutorialStateManager.updateTutorialState(function(tutorialState, statusCode) {
                      assetLoaded();
                    });
                  }
                  else {
                    AWE.Log.Debug('CRITICAL ERROR: could not load tutorial from server. Error code: ' + statusCode + '. Terminate App.');
                    throw "ABORT Due to Failure to load tutorial.";
                  }
                });
              }

              _numAssets += 1;
              AWE.GS.ResourcePoolManager.updateResourcePool(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(resourcePool, statusCode) {
                if (statusCode === AWE.Net.OK) {
                  assetLoaded();
                }
                else {
                  AWE.Log.Debug('CRITICAL ERROR: could not load resource pool from server. Error code: ' + statusCode + '. Terminate App.');
                  throw "ABORT Due to Failure to load player's resource pool.";
                }
              });

              _numAssets += 1;
              AWE.GS.RoundInfoManager.updateRoundInfo(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(resourcePool, statusCode) {
                if (statusCode === AWE.Net.OK) {
                  assetLoaded();
                }
                else {
                  AWE.Log.Debug('CRITICAL ERROR: could not load round info from server. Error code: ' + statusCode + '. Terminate App.');
                  throw "ABORT Due to Failure to load game's round info.";
                }
              });

              assetLoaded();
            }
            else {
              alert ('Das Spiel konnte nicht geladen werden. Bitte drücke den Aktualisieren-Knopf Deines Browsers, meist hilft schlichtes Neuladen der Seite und Login. Falls auch das nicht hilft, kontaktiere bitte den Support. Wir unterstützen folgende Browser: Chrome, Firefox, Internet Explorer 9 und Safari; je neuer, desto besser (und schneller).');
              AWE.Log.Debug('CRITICAL ERROR: could not load current character from server. Error code: ' + statusCode + '. Terminate App.');
              throw "ABORT Due to Failure to Load Player's Current Character.";
            }
          });

          assetLoaded();
        }
        else {
          AWE.Log.Debug('CRITICAL ERROR: could not load rules from server. Error code: ' + statusCode + '. Terminate App.');
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
    
    switchMapTypeClicked: function() {
      if (this.get('presentScreenController') === this.get('mapScreenController')) {
        this.get('presentScreenController').switchMapType();        
      }
    },
    
    gamingPieceSelectorClicked: function() {
      if (this.get('presentScreenController') === this.get('mapScreenController')) {
        this.get('presentScreenController').armyListButtonClicked();
      }
    },

    baseButtonDoubleClicked: function() {
      this.activateBaseController();
    },

    characterButtonClicked: function() {
      var dialog = AWE.UI.Ember./*ProfileView*/ProfileNewView.create({
        characterBinding: 'AWE.GS.game.currentCharacter',
        nameChangedBinding: 'AWE.GS.TutorialStateManager.nameChanged'
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
        AWE.Log.Debug('ACTIVATE FORTRESS CONTROLLER');
        this.activateFortressController({ settlementId: settlement.get('id')});        
      }
      else if (settlement.get('type_id') === AWE.GS.SETTLEMENT_TYPE_OUTPOST) {
        AWE.Log.Debug('ACTIVATE OUTPOST CONTROLLER');
        this.activateOutpostController({ settlementId: settlement.get('id')});
      }
      else {
        AWE.Log.Debug('ACTIVATE BASE CONTROLLER');
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
        AWE.Log.Debug('ERROR: no base to enter specified.')
      }
      this.setScreenController(baseController);
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(baseController);
      }

      if(this.get('extrasController'))
      {
        this.get('extrasController').clearPterodactyls();
        this.get('extrasController').enableAutoPterodactylus();
      }
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
        AWE.Log.Debug('ERROR: no fortress to enter specified.')
      }
      this.setScreenController(fortressController);
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(fortressController);
      }
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
        AWE.Log.Debug('ERROR: no outpost to enter specified.')
      }
      this.setScreenController(outpostController);
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(outpostController);
      }
    },

    activateMessagesController: function(args) {
     /* args = args || {};
      var messageCenterController = this.get('messageCenterController');
      if (!messageCenterController) {
        messageCenterController = AWE.Controller.createMessageCenterController('#layers');
        this.set('messageCenterController', messageCenterController);
      }
      this.setScreenController(messageCenterController);
      if (args.recipient !== undefined && args.recipient !== null) {
        messageCenterController.createDraftTo(args.recipient.name);
      }*/
      /*Added from controller start*/
      var character   = AWE.GS.CharacterManager.getCurrentCharacter();
      var allianceId  = character.get('alliance_id');
      var alliance    = allianceId ? AWE.GS.AllianceManager.getAlliance(allianceId) : null;

      args = args || {};
      if (args.recipient !== undefined && args.recipient !== null)
      {
          //New message dialog
          var dialog = AWE.UI.Ember.MessageWriteDialog.create({
            controller: this.get('hudController'),
            recipient: args.recipient.name ,

          });
          WACKADOO.presentModalDialog(dialog);
          this.get('hudController').messageView = dialog;
      }
      else
      {
        /*Added from controller end*/

        messageDialog = AWE.UI.Ember.MessageCenterNewDialog.create({
            controller: this.get('hudController'),    
            character: character,
            alliance:  alliance,
          });

         /*Added from controller start*/
        if (!alliance && allianceId) { // fetch alliance from server if it's not available yet
          AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
            messageDialog.set('alliance', AWE.GS.AllianceManager.getAlliance(allianceId));
          });
        }
         /*Added from controller end*/
         
         WACKADOO.presentModalDialog(messageDialog);
      }
      
      /*var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(messageCenterController);
      }
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(messageCenterController);
      }
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(messageCenterController);
      }
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(messageCenterController);
      }*/
    },

    activateMapController: function(preventZoomingToLastSelection) {
      var controller = this.get('mapScreenController');
      this.setScreenController(controller, preventZoomingToLastSelection);
      
      var hudController = this.get('hudController');
      if (hudController && hudController.notifyAboutNewScreenController !== undefined) {
        hudController.notifyAboutNewScreenController(controller);
      }
      if(this.get('extrasController'))
      {
        this.get('extrasController').disableAutoPterodactylus();
        this.get('extrasController').clearPterodactyls();
      }
      
      return controller;
    },

    mapControllerActive: function() {
      return this.get('presentScreenController') === this.get('mapScreenController');
    },

    showAllianceDialog: function(alliance_id) {
      var self = this;
      //Prepare
      this.get('hudController').activeAlliances.push(alliance_id);
      //this.get('hudController').activeAlliances.push(3);

      var alliance = null;
      AWE.GS.AllianceManager.updateAlliance(alliance_id, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
        alliance = AWE.GS.AllianceManager.getAlliance(alliance_id);
        alliance.getPath('diplomacySourceRelations').forEach(function(relation){
          self.get('hudController').activeAlliances.push(relation.getPath('target_alliance_id'));
        })
        allianceScreen = AWE.UI.Ember.AllianceView.create({
          alliance: alliance,
        });

        WACKADOO.presentModalDialog(allianceScreen);
      });      
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

      var args = null;
      try {
        args = JSON.parse(window.name);
        this.set('startupArguments', window.name);
      }
      catch (e1) {
        try {
          args = JSON.parse(fbArgs);
          this.set('startupArguments', fbArgs);
        }
        catch (e2) {
          if (typeof sessionStorage !== "undefined" && 
              typeof sessionStorage.startupArguments !== "undefined")
          {
            try {
              args = JSON.parse(sessionStorage.startupArguments);
              this.set('startupArguments', sessionStorage.startupArguments);
            }
            catch (e3) {
              
            }
          }
        }
      }
      window.name = "empty";                                 // unset variables
      fbArgs = "empty";

      var accessToken = null;

      /** Set the pisori installtoken, sessiontoken and platform
        * so that events don´t get tracked twice
        */
      var startupArgs = this.get('startupArguments');
      var platform = startupArgs['platform'];
      
      Sample.setEndpoint("/psiori/event")
      Sample.setAppToken("fsRrapvL");

      if (platform == Sample.PLATFORM_ANDROID)
      {
          var sessionToken = startupArgs['session_token'];
          var installToken = startupArgs['install_token'];
          if (sessionToken != "undefined" && sessionToken != null)
          {
              Sampl.setSessionToken(sessionToken);
          }
          if (installToken != "undefined" && installToken != null)
          {
              Sampl.setInstallToken(installToken);
          }
          if (platform != "undefined" && platform != null)
          {
              Sampl.setPlatform(platform);
          }
      }

      if (!args || !args.accessToken) {
        if (Sample.getPlatform() != Sample.PLATFORM_ANDROID)
        {
            Sample.track('start_failed', 'session');
        }

//      alert('FATAL ERROR: Invalid Credentials. Please contact the support staff.');
        document.location.href = AWE.Config.PORTAL_ROOT;
        return ;
      }
      else {
        if (typeof sessionStorage !== "undefined") 
        {
          sessionStorage.startupArguments = this.get('startupArguments');
        }
        accessToken = args.accessToken ;
      }                            // || AWE.Config.DEV_ACCESS_TOKEN || null;


      var expiration  = parseInt(args.expiration || "3600");           // asume one hour validity as default
      AWE.Settings.locale = args.locale || AWE.Config.DEFAULT_LOCALE;
      AWE.Settings.lang = args.locale ? args.locale.substr(0, 2) : AWE.Config.DEFAULT_LANG;
      AWE.Settings.signin_with_client_id = args.client_id || '';
      AWE.Settings.referer = args.referer;
      AWE.Settings.requestUrl = args.requestUrl;
      AWE.Settings.playerInvitation = args.playerInvitation;
      AWE.Settings.allianceInvitation = args.allianceInvitation;
      AWE.Settings.fbRunInCanvas = !!args.fbRunInCanvas;
      var isAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;
      if (isAndroid) {
        AWE.Settings.hudScale = 0.6;
      } else {
        AWE.Settings.hudScale = 1;
      }
      var styleSheets = document.styleSheets;
      
      // TODO: improve the code below. Does it have to be run for hudScale == 1?
      //       can't it read the values for top and marginLeft from the CSS? 
      //       The present code will OVERRIDE any change to the css, without the
      //       developer noticing it.
      for (n in styleSheets)
      {
        var theRules = styleSheets[n].cssRules;
        for (m in theRules)
        {
          if (theRules[m].selectorText === ".modal-dialog-pane-new" 
            || theRules[m].selectorText === ".modal-dialog-pane" 
            || theRules[m].selectorText === ".right-hud" 
            || theRules[m].selectorText === ".settlement-map-button" 
            || theRules[m].selectorText === ".topbar-info-box.settlement" 
            || theRules[m].selectorText === ".shop-dialog-pane"
            || theRules[m].selectorText === ".top-right-hud") {
            theRules[m].style.zoom = AWE.Settings.hudScale;
          }
          if (theRules[m].selectorText === '.topbar-info-box') {
            theRules[m].style.top = 90*AWE.Settings.hudScale+'px';
            theRules[m].style.marginLeft= -170*AWE.Settings.hudScale+'px';
          }
        }       
      }

      AWE.Log.Debug('debug', AWE.Settings.locale, AWE.Settings.lang, args.locale, args.locale.substr(0, 2));

      AWE.Facebook.isRunningInCanvas = AWE.Settings.fbRunInCanvas;
      AWE.Facebook.isFbPlayer = !!args.fbPlayerId;
      
      // make sure the html client uses the same session and install token
      // as the portal. We want "convergence" over all host-names and modules
      // of the HTML game.
      if (args.installToken)
      {
        Sample.setInstallToken(args.installToken);
      }
      if (args.sessionToken)
      {
        Sample.setSessionToken(args.sessionToken);
      }
      
      if (AWE.Facebook.isRunningInCanvas)
      {
        Sample.setFacebookId(args.fbPlayerId || null);
        Sample.setPlatform(Sample.PLATFORM_FACEBOOK);
      }

      /*if(navigator.userAgent.toLowerCase().indexOf("android") >= 0)
      {
        alert('Hi');
        var styleSheet = document.styleSheets[0];
        styleSheet.insertRule(".welcome-dialog { width: 676px; margin-top: -165px; margin-left: -348px; }", styleSheet.rules.length);
        styleSheet.insertRule(".ranking-view { width: 676px; margin-top: 0px; max-height: 500px; min-height: 0; }", styleSheet.rules.length);
        styleSheet.insertRule(".ranking-view .tab-content { overflow: scroll; height: 300px; }", styleSheet.rules.length);
        styleSheet.insertRule(".ranking-view .advisor { left: 634px; top: -26px; }", styleSheet.rules.length);
        styleSheet.insertRule(".ranking-table { width: 676px; }", styleSheet.rules.length);
        styleSheet.insertRule(".army-list-view { width: 676px; height: 500px; min-height: 500px; margin-top: 15px; margin-left: -365px; }", styleSheet.rules.length);
        styleSheet.insertRule(".shop-dialog-pane { height: 500px; margin-top: 100px; overflow: scroll; }", styleSheet.rules.length);
      }*/

      if (Sample.getPlatform() != Sample.PLATFORM_ANDROID)
      {
         Sample.sessionStart();
         Sample.autoPing(30);
      }

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
