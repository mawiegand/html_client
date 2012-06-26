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
    
    
    
    that.createView = function() {
      
      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      
      var center = AWE.UI.Ember.MessageCenterView.create({
        controller: this,    
        character: character,
        
      });
      console.log(center, center.get('character'), center.get('character').get('inbox'));
      
      return center;
    }
    
    that.inboxClicked = function() {
      this.view.hideForm(); // make sure, form is hidden
      this.view.switchTo('inbox');
    };
    that.outboxClicked = function() {
      this.view.hideForm(); // make sure, form is hidden
      this.view.switchTo('outbox');
    };
    that.archiveClicked = function() {
      this.view.hideForm(); // make sure, form is hidden
      this.view.switchTo('archive');
    };
    that.newClicked = function() {
      this.view.showForm();
    };
    that.discardDraft = function() {
      this.view.set('newMessage', null);
      this.view.hideForm();
    };
    that.sendMessage = function(message) {
      action = AWE.Action.Messaging.createSendMessageAction(message);
      action.send();
      this.discardDraft();
    };
    
    
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
      if (this.view) {
        var display = this.view.get('display');
        
        if (display === "outbox") {

          var outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
          if (!outbox) {
            AWE.GS.CharacterManager.getCurrentCharacter().fetchOutbox(function(outboxes, status) {
              if (status === AWE.Net.NOT_FOUND || !outboxes) {
                console.log('ERROR: outboxes of current character not found on server.');
              } 
              else { 
                outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
                if (outbox) {
                  outbox.fetchEntries();
                }
                else {
                  console.log('ERROR: no outbox found.');
                }
              }
            });
          }
          else if (outbox && outbox.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime()) { // timeout
            AWE.GS.OutboxManager.updateMessageBox(outbox.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(outbox, status) {
          
    					if (outbox && outbox.getId() && status !== AWE.Net.NOT_MODIFIED) {
                outbox.fetchEntries()
    					}
            });
          }
          
        }
        else if (display === "archive") {
          
        }
        else {
      
          var inbox = AWE.GS.CharacterManager.getCurrentCharacter().get('inbox');
          if (!inbox) {
            AWE.GS.CharacterManager.getCurrentCharacter().fetchInbox(function(inboxes, status) {
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
            AWE.GS.InboxManager.updateMessageBox(inbox.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(inbox, status) {
    					if (inbox && inbox.getId() && status !== AWE.Net.NOT_MODIFIED) {
                inbox.fetchEntries()
    					}
            });
          }
          
        }
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



