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
      alliance: null,
      messages: null,
      members: null,
      
      allianceChanged: (function(self) {
        return function() { self.createAllianceBanner(); }
      }(that)).observes('alliance')
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
 
      return  AWE.Ext.hashValues(members);       // assumes ids are in ascending order!
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
      var messageArray =  AWE.Ext.hashValues(messages).slice(-10).reverse(); // this assumes the ids to be in ascending order (slice the last n, revese order, so the last is on top)
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
    
    that.bannerShape = null;
    
    /** content observer: alliance */
    that.createAllianceBanner = function() {
      if (!that.bannerPane) {
        return ;
      }
      if (that.bannerShape) {
        that.bannerPane.removeChild(that.bannerShape);
      }

      that.bannerShape = AWE.UI.createAllianceFlagView();
      that.bannerShape.initWithController(this);
      that.bannerShape.setFrame(AWE.Geometry.createRect(100, 100, 60, 75));
      that.bannerShape.setAllianceId(that.allianceId);
      that.bannerShape.setTagVisible(true);
      that.bannerShape.setDirection('down');
      that.bannerPane.addChild(that.bannerShape);
      that.bannerShape.updateView();
    }
    
    /** update the view in case the OBJECTS (alliance, members) did change. A change
     * of object properties (e.g. alliance.description) is propagated automatically
     * with the help of ember bindings. */
    that.updateView = function() {
      that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
      that.content.set('members', that.getAndUpdateMembers(this.allianceId));
      that.content.set('messages', that.getAndUpdateShouts(this.allianceId));     // side-effect: starts another update, if older than 60s */
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
    
    that.bannerPane = null;
    
    that.createView = function() {
      
      var info = Ember.View.create({
        templateName: 'alliance-infobox',
        controller: that,
        allianceBinding: 'controller.content.alliance',
      });

      var membersList =  Ember.View.create({
        templateName: 'alliance-member-list',
        controller: that,
        membersBinding: 'controller.content.members',
      });
            
      var shoutBox =  AWE.UI.Ember.ShoutBox.create({
        controller: that,
        shoutsBinding: 'controller.content.messages',
        shout: function(self) {
          return function(message) { self.shout(message); };
        }(that),
      });
      
      that.bannerPane = AWE.UI.Ember.Pane.create({
        width: 200,
        height: 200,
      });
      
      that.createAllianceBanner(); // init banner view
  
      var container = Ember.ContainerView.create({        
        controller: that,
      });
      
      var childViews = container.get('childViews');
      childViews.pushObject(that.bannerPane);
      childViews.pushObject(info);
      childViews.pushObject(membersList);
      childViews.pushObject(shoutBox);
      return container;
    }
    
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      this.updateView();
      this.view = this.createView();
      this.view.appendTo('#main-screen-controller');      
      log (this.view, this.view.childViews, this.view.get('childViews'), this.view.get('elementId'), this.view.clearBuffer);
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
        that.bannerPane.update();
        _viewNeedsUpdate = false;
      }
      that.getAndUpdateShouts(this.allianceId);
      
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



