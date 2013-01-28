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
      if (that.view) {
        that.view.destroy();
        that.view = null;
      }
    }
    
    /** Allows to change the margin that is beeing subtracted from the bottom if the window is resized 
     * @function
     * @name AWE.Controller.ScreenController#setScreenBottomMargin */
    that.setScreenBottomMargin = function(pixelValue) {
        that.screenBottomMargin = pixelValue;
        $(".message-center .list").css("bottom", that.screenBottomMargin+"px");
        $(".message-center .detail").css("bottom", that.screenBottomMargin+"px");
    };
    
    /** update the view in case the OBJECTS (alliance, members) did change. A change
     * of object properties (e.g. alliance.description) is propagated automatically
     * with the help of ember bindings. */
    that.updateView = function() {
      //that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
    }
    
    
    
    that.createView = function() {
      
      var character   = AWE.GS.CharacterManager.getCurrentCharacter();
      var allianceId  = character.get('alliance_id');
      var alliance    = allianceId ? AWE.GS.AllianceManager.getAlliance(allianceId) : null;
      
      var center = AWE.UI.Ember.MessageCenterView.create({
        controller: that,    
        character: character,
        alliance:  alliance,
      });
       
      if (!alliance && allianceId) { // fetch alliance from server if it's not available yet
        AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
          center.set('alliance', AWE.GS.AllianceManager.getAlliance(allianceId));
        });
      }
      
      return center;
    }
    
    that.inboxClicked = function() {
      that.view.hideForm(); // make sure, form is hidden
      that.view.switchTo('inbox');
    };
    that.outboxClicked = function() {
      that.view.hideForm(); // make sure, form is hidden
      that.view.switchTo('outbox');
    };
    that.archiveClicked = function() {
      that.view.hideForm(); // make sure, form is hidden
      that.view.switchTo('archive');
    };
    that.newClicked = function() {
      that.view.showForm();
    };
    that.newAllianceMessageClicked = function() {
      that.view.showAllianceMessageForm();
    };
    that.createDraftTo = function(recipientName) {
      that.view.showForm();
      that.view.setPath('newMessage.recipient', recipientName);
    };
    that.discardDraft = function() {
      that.view.set('newMessage', null);
      that.view.hideForm();
    };
    
    
    that.sendMessage = function(message) {
      var self = that;
      action = AWE.Action.Messaging.createSendMessageAction(message);
      action.send(function(status, jqXHR) {
        log('SENT MESSAGE, STATUS', status);
        if (status === AWE.Net.CREATED || status === AWE.Net.OK) {
          self.discardDraft();
        }
        else if (status === AWE.Net.NOT_FOUND) {
          self.view.setRecipientIsUnknown(true);
        }
        else {
          log(status, "ERROR: The server did not accept the message.");
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'server-command-failed-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
        }
      });
    };
    
    that.appendView = function() {
      if (that.view) {
        that.removeView();
      }
      log('append MESSAGE CENTER');
      that.updateView();
      that.view = that.createView();
      that.view.didInsertElement = function() {
        that.view.$(".message-center .list").css("bottom", that.screenBottomMargin+"px");
        that.view.$(".message-center .detail").css("bottom", that.screenBottomMargin+"px");
      };
      that.view.appendTo('#main-screen-controller');
    }
    
    
    that.viewDidAppear = function() {
      that.visible = true;
      that.appendView();
    };
    
    that.viewWillDisappear = function() {
      that.removeView();
      that.visible = false;
    };
    
    that.updateModel = function() {
      if (that.view) {
        var display = that.view.get('display');
        
        if (display === "outbox") {

          var outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
          if (!outbox) {
            AWE.GS.CharacterManager.getCurrentCharacter().fetchOutbox(function(outboxes, status) {
              if (status === AWE.Net.NOT_FOUND || !outboxes) {
                log('ERROR: outboxes of current character not found on server.');
              } 
              else { 
                outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
                if (outbox) {
                  outbox.fetchEntries();
                }
                else {
                  log('ERROR: no outbox found.');
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
          AWE.GS.InboxManager.triggerInboxAutoUpdate();
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
      that.updateDebug();
      if (that.visible && (_viewNeedsUpdate)) {
        that.updateView();
        _viewNeedsUpdate = false;
      }
      
      if (that.visible) {
        that.updateModel();
      }
      
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



