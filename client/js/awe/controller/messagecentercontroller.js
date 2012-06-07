/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createMessageCenterController = function(anchor) {
      
    var _viewNeedsUpdate = false;  
          
    var that = module.createScreenController(anchor); ///< create base object
    
    that.view = null;
    that.baseId = null;
    that.visible = false;
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    
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
      //that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
    }
    
    that.messageCenterView = Ember.View.extend({
      templateName: 'message-center',
      
      character: null,
      messageBoxBinding: "character.inbox",

    });
    
    
    that.createView = function() {
      
      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      
      var center = that.messageCenterView.create({
        controller: this,    
        character: character,
        
      });
      console.log(center, center.get('character'), center.get('character').get('inbox'));
      
      return center;
    }
    
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      console.log('append MESSAGE CENTER')
      this.updateView();
      this.view = this.createView();
      this.view.appendTo('#main-screen-controller');      
    }
    
    
    that.viewDidAppear = function() {
      this.visible = true;
      this.appendView();
    };
    
    that.viewWillDisappear = function() {
      this.removeView();
      this.visible = false;
    };
    
    that.updateModel = function() {
      
      var inbox = AWE.GS.CharacterManager.getCurrentCharacter().get('inbox');
      if (!inbox) {
        AWE.GS.CharacterManager.getCurrentCharacter().fetchInbox(function(inboxes, status) {
          console.log('FETCHED INBOX FOR FIRST TIME, STATUS', status, status === AWE.Net.NOT_MODIFIED);
          if (status === AWE.Net.NOT_FOUND || !inboxes) {
            console.log('ERROR: inbox of current character not found on server.');
          } 
          else { 
            inbox = AWE.GS.CharacterManager.getCurrentCharacter().get('inbox');
            if (inbox) {
              inbox.fetchEntries();
            }
            else {
              console.log('ERROR: inbox could not be fetched from server.');
            }
          }
        });
      }
      else if (inbox && inbox.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 10000 < new Date().getTime()) { // timeout

        console.log("CHAR:", this.view, this.view.get('character'), this.view.get('character').get('inbox'));


        AWE.GS.InboxManager.updateInbox(inbox.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(inbox, status) {
          
          console.log('UPDATED INBOX, STATUS', status, 'NOT_MODIFIED:', status === AWE.Net.NOT_MODIFIED);
          
					if (inbox && inbox.getId() && status !== AWE.Net.NOT_MODIFIED) {
            inbox.fetchEntries()
					}
        });
      }
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.updateDebug = function() {
      $("#debug2").html('&nbsp;Message Center Visible.');
    };    

    that.runloop = function() {
      this.updateDebug();
      if (this.visible && (_viewNeedsUpdate)) {
        this.updateView();
        _viewNeedsUpdate = false;
      }
      
      if (this.visible) {
        this.updateModel();
      }
      
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



