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
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    
    that.content = Ember.Object.create({
      shouts: null,
    });
    
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
    
    that.updateAlliance = function(allianceId) {
      var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
      if ((!alliance && allianceId) ||
          (alliance && alliance.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    }
    
    that.updateMembers = function(allianceId) {
      if (!allianceId) { return ; }
      var members = AWE.GS.CharacterManager.getMembersOfAlliance(allianceId);
      if ((!members || members.length == 0) ||
          (members && AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.CharacterManager.updateMembersOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    }

    that.updateShouts = function(allianceId, forceUpdate) {
      var self = this;
      if (forceUpdate === undefined) { 
        forceUpdate = false;
      }
      if (!allianceId) { return ; }
      var messages = AWE.GS.AllianceShoutManager.getMessagesOfAlliance(allianceId);
      if ((!messages) || forceUpdate ||
          (messages && AWE.GS.AllianceShoutManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 10000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.AllianceShoutManager.updateMessagesOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
          var characterId = AWE.GS.player.getPath('currentCharacter.id');
          var leaderId = AWE.GS.AllianceManager.getAlliance(self.allianceId).get('leader_id');
          var messages = AWE.GS.AllianceShoutAccess.getEnumerableForAlliance_id(allianceId);
          var messageArray =  messages.sort(function(a,b) {
            return Date.parseISODate(a.get('created_at')).getTime() - Date.parseISODate(b.get('created_at')).getTime();
          }).slice(-6).reverse(); // this assumes the ids to be in ascending order (slice the last n, revese order, so the last is on top)
          messageArray.forEach(function(value, key) {
            var character = AWE.GS.CharacterManager.getCharacter(this[key].get('character_id'));
            this[key].set('character', character);
            this[key].set('own', this[key].get('character_id') === characterId)
            this[key].set('leader', this[key].get('character_id') === leaderId);
          }, messageArray);
          self.content.set('shouts', messageArray); 
        });
      }
    }
    
    that.removeView = function() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
    }
    
    
    that.updateModel = function() {
      that.updateAlliance(this.allianceId);
      that.updateMembers(this.allianceId);
      that.updateShouts(this.allianceId);     // side-effect: starts another update, if older than 60s 
    }
    
    that.shout = function(message) {
      log('shout: ', message);
      var action = AWE.Action.Fundamental.createShoutToAllianceAction(message);
      action.send(function(self) {
        return function() {
          self.updateShouts(self.allianceId, true);
        }
      }(this));
    }
    
    that.bannerPane = null;
    
    that.createView = function() {
      
      var allianceScreen = null;
      var alliance = AWE.GS.AllianceManager.getAlliance(that.allianceId);

      if (!alliance) {
        return null;
      }

      allianceScreen = AWE.UI.Ember.AllianceScreenView.create({
        controller: this,
        alliance:   alliance,
      });
      
      return allianceScreen;
    }
    
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      this.view = this.createView();
      if (this.view) {
        this.view.appendTo('#main-screen-controller');  
      }    
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

      if (this.visible && !this.view && this.allianceId) {
        this.updateAlliance(this.allianceId);  // trigger alliance update, if it's not already there.
        this.appendView();         
      }
      
  //    log('ALLIANCE SCREEN', this.visible, this.view, this.allianceId, AWE.GS.AllianceManager.getAlliance(that.allianceId))
      
      if (this.view) {   // make sure the view displays the right settlement.
        // this is executed, in case the settlement is received from the 
        // server for the first time or the settlementId has been changed by 
        // this.setSettlementId(int).
        var alliance = AWE.GS.AllianceManager.getAlliance(that.allianceId);
        
        if (this.view.get('alliance') != alliance) {
          this.view.set('alliance', alliance);
          log('SWITCHED ALLIANCE IN RUNLOOP TO', alliance);
        }
        that.updateModel();
      }
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



