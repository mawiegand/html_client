/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createAllianceController = function(anchor) {
      
    var _viewNeedsUpdate = false;  
      
    var that = module.createScreenController(anchor); ///< create base object
    
    that.view = null;
    that.allianceId = null;
    that.visible = false;
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** intializes three stages for displaying the map-background,
     * the playing pieces (armies, fortresses, settlements), and 
     * the HUD. */
    that.init = function(initialFrameModelCoordinates) {
      _super.init();            
    };   
    
    that.getStages = function() { return []; }
    
    that.getAndUpdateAlliance = function(allianceId) {
      var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
      if ((!alliance && allianceId) ||
          (alliance && alliance.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(alliance) {
          if (alliance && that.view && that.view.alliance != alliance) {
            _viewNeedsUpdate = true;
          }
        });
      }
      return alliance;
    }
    
    that.getAndUpdateMembers = function(allianceId) {
      if (!allianceId) { return ; }
      var members = AWE.GS.CharacterManager.getMembersOfAlliance(allianceId);
//      log (AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL), AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime());
      if ((!members || members.length == 0) ||
          (members && AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.CharacterManager.updateMembersOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(members) {
          console.log('received update on members');
          if (members && that.view) {
            _viewNeedsUpdate = true;
          }
        });
      }
 //     log('members', allianceId, AWE.GS.CharacterAccess.getAllForAlliance_id(allianceId), AWE.GS.CharacterAccess, AWE.GS.CharacterManager);
      return  AWE.Ext.hashValues(members);      
    }

    that.getAndUpdateShouts = function(allianceId, forceUpdate) {
      if (forceUpdate === undefined) { 
        forceUpdate = false;
      }
      if (!allianceId) { return ; }
      var messages = AWE.GS.AllianceShoutManager.getMessagesOfAlliance(allianceId);
    //      log (AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL), AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime());
      if ((!messages) || forceUpdate ||
          (messages && AWE.GS.AllianceShoutManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 10000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
          AWE.GS.AllianceShoutManager.updateMessagesOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(messages) {
              console.log('received update on messages');
              if (messages && that.view) {
                  _viewNeedsUpdate = true;
              }
          });
      }
      //     log('members', allianceId, AWE.GS.CharacterAccess.getAllForAlliance_id(allianceId), AWE.GS.CharacterAccess, AWE.GS.CharacterManager);
      var messageArray =  AWE.Ext.hashValues(messages);
      messageArray.forEach(function(value, key) {
        var character = AWE.GS.CharacterManager.getCharacter(this[key].get('character_id'));
        this[key].set('character', character);
      }, messageArray);
      return messageArray;
    }
    
    that.removeView = function() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
    }
    
    /** update the view in case the OBJECTS (alliance, members) did change. A change
     * of object properties (e.g. alliance.description) is propagated automatically
     * with the help of ember bindings. */
    that.updateView = function() {
      var alliance = that.getAndUpdateAlliance(this.allianceId);   // side-effect: starts another update, if older than 60s
      var members = that.getAndUpdateMembers(this.allianceId);     // side-effect: starts another update, if older than 60s
      var messages = that.getAndUpdateShouts(this.allianceId);     // side-effect: starts another update, if older than 60s

      this.view.set('alliance', alliance).set('members', members ? members : []).set('shouts', messages ? messages : []);
    }
    
    that.shout = function(message) {
      console.log('shout: ', message);
      var action = AWE.Action.Fundamental.createShoutToAllianceAction(message);
      action.send(function(self) {
        return function() {
          self.getAndUpdateShouts(self.allianceId, true);
        }
      }(this));
    }
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      var alliance = that.getAndUpdateAlliance(this.allianceId);
      var members = that.getAndUpdateMembers(this.allianceId);
      var messages = that.getAndUpdateShouts(this.allianceId);     // side-effect: starts another update, if older than 60s
      this.view = AWE.UI.Ember.AllianceScreen.create({
        alliance: alliance,
        members: members ? members : [],
        shouts: messages ? messages : [],
        shoutBoxSendPressed: function(self) {
          console.log(self)
          return function() { self.shout(this.get('shoutBoxInput')); };
        }(this),
      });
      log (members)
      this.view.appendTo('#main-screen-controller');      
      
      $('body').click(function() { console.log('click event in body.')});
    }
    
    that.setAllianceId = function(allianceId) {
      this.allianceId = allianceId;
    }
    
    that.viewDidAppear = function() {
      this.visible = true;
      this.appendView();
    };
    
    that.viewWillDisappear = function() {
      this.removeView();
      this.visible = false;
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.updateDebug = function() {
      $("#debug2").html('&nbsp;Alliance Screen Visible.');
    };    

    that.runloop = function() {
      this.updateDebug();
      if (this.visible && (_viewNeedsUpdate || (this.view.get('alliance') &&
          this.view.get('alliance').get('id') != this.allianceId))) {
        this.updateView();
        _viewNeedsUpdate = false;
      }
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



