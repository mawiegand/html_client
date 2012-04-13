/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createAllianceController = function(anchor) {
      
    var _needsRecreate = false;  
      
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
            _needsRecreate = true;
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
            that.view.set('members', AWE.Ext.hashValues(AWE.GS.CharacterManager.getMembersOfAlliance(allianceId)));
//            _needsRecreate = true;
          }
        });
      }
 //     log('members', allianceId, AWE.GS.CharacterAccess.getAllForAlliance_id(allianceId), AWE.GS.CharacterAccess, AWE.GS.CharacterManager);
      return  AWE.Ext.hashValues(members);      
    }
    
    that.removeView = function() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
    }
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      var alliance = that.getAndUpdateAlliance(this.allianceId);
      var members = that.getAndUpdateMembers(this.allianceId);
      this.view = AWE.UI.Ember.AllianceScreen.create({
        alliance: alliance,
        members: members ? members : [],
      });
      log (members)
      this.view.appendTo('#main-screen-controller');      
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
      if (this.visible && (_needsRecreate || (this.view.get('alliance') &&
          this.view.get('alliance').get('id') != this.allianceId))) {
        this.removeView();
        this.appendView();
        _needsRecreate = false;
      }
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



