/**
 * @fileOverview 
 * Ember JS views for the settlement screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {

  module.AllianceScreenView = Ember.View.extend({
    templateName: 'alliance-screen',
    
    controller: null,
    alliance:   null,
    
    isAllianceLeader: function() {
      var leaderId = this.getPath('alliance.leader_id');
      var characterId = AWE.GS.game.getPath('currentCharacter.id');
      return leaderId && leaderId === characterId;
    }.property('alliance.leader_id', 'AWE.GS.game.currentCharacter.id').cacheable(),

    ownAlliance: function() {
      var allianceId = this.getPath('alliance.id');
      var ownAllyId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      return allianceId && allianceId === ownAllyId;
    }.property('alliance.id', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),
    
  });
  
  module.AllianceInfoBoxView = Ember.View.extend({
    templateName: 'alliance-infobox',
    
    controller: null,
    alliance:   null,
    
    creation: function() {
      return AWE.Util.createTimeString(this.getPath('alliance.created_at'));
    }.property('alliance.created_at').cacheable(),
    
    
    invitationLinkPressed: function() {
      
      var mailWindow = window.open('mailto:?' +
        encodeURI('subject=Einladung zu Wack-A-Doo von der Allianz'+ this.getPath('alliance.name') +'&') + 
        encodeURI('body=Fange jetzt an Wack-A-Doo zu spielen und ziehe über diesen Einladungslink direkt in das Gebiet der Allianz '+ this.getPath("alliance.name") +':\n\n' + AWE.Config.ALLIANCE_INVITATION_BASE + this.getPath('alliance.invitation_code')));
      mailWindow.close();
      
      event.preventDefault();
      return false;
    },

    changeDescriptionPressed: function() {
      var changeDialog = AWE.UI.Ember.TextAreaInputDialog.create({
        heading: AWE.I18n.lookupTranslation('alliance.changeDescriptionDialogCaption'),
        input: this.getPath('alliance.description'),
        rowsSize: 10,
        colsSize: 82,
        controller: this,
        
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processNewDescription(this.getPath('input'));
          }
          this.destroy();            
        },
        
        cancelPressed: function() { this.destroy(); },
      });
      WACKADOO.presentModalDialog(changeDialog);
    },

    showDescription: function() {
      return $('<div/>').text(this.getPath('alliance.description')).html().replace(/\n/, '<br />');
    }.property('alliance.description'),

    processNewDescription: function(newDescription) {
      var self = this;
      var action = AWE.Action.Fundamental.createChangeAllianceDescriptionAction(newDescription, this.get('alliance'));
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          self.set('message', null);
        }
        else if (status === AWE.Net.FORBIDDEN) {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionForbidden'));
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionError'));
        }
      });        
		},

    sendUserContentReport: function() {
      var confirmationDialog = AWE.UI.Ember.Dialog.create({
        templateName: 'info-dialog',

        classNames: ['confirmation-dialog'],
      
        controller: this,
        
        heading:    AWE.I18n.lookupTranslation('alliance.confirmReport.heading'), 
        message:    AWE.I18n.lookupTranslation('alliance.confirmReport.message'),
        
        cancelText: AWE.I18n.lookupTranslation('alliance.confirmReport.cancel'),
        okText:     AWE.I18n.lookupTranslation('alliance.confirmReport.ok'),
       
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processUserContentReport();
          }
          this.destroy();
        },
        
        cancelPressed: function() { this.destroy(); }
      });
      WACKADOO.presentModalDialog(confirmationDialog);
    },

    processUserContentReport: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createUserContentReportAction(this.getPath('alliance.leader_id'), 'alliance-description', this.get('alliance').getId());
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          self.set('message', AWE.I18n.lookupTranslation('alliance.confirmReport.success'));
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('alliance.confirmReport.error'));
        }
      });        
    },
  });

  module.AllianceMemberView = Ember.View.extend({
    templateName: 'alliance-member',
    
    character:  null,
    alliance:   null,
    controller: null,
    
    isLeader: function() {
      var cid      = this.getPath('character.id');
      var leaderId = this.getPath('alliance.leader_id');
      return cid !== undefined && cid !== null && cid === leaderId;
    }.property('character.id', 'alliance.leader_id'),
    
    kickMember: function() {
      var parentView = this.get('parentView');
      if (parentView) {
        parentView.kickMember(this.get('character'));
      }
      return false; // prevent default action!
    },
    
  });

  module.AllianceMemberListView = Ember.View.extend({
    templateName: 'alliance-member-list',
    
    controller: null,
    alliance:   null,
    
    maxMembers: function() {
      return AWE.GS.RulesManager.getRules().get('alliance_max_members') + this.getPath('alliance.size_bonus');
    }.property('controller').cacheable(),
    
    kickMember: function(character) {
      var currentCharacter = AWE.GS.game.get('currentCharacter');
      var alliance         = this.get('alliance');
      var allianceId       = this.getPath('alliance.id');

      if (character        === undefined || character        === null ||
          alliance         === undefined || alliance         === null ||
          currentCharacter === undefined || currentCharacter === null) {

        var dialog = AWE.UI.Ember.Dialog.create({
          contentTemplateName: 'info-dialog',
          
          heading:             AWE.I18n.lookupTranslation('error.genericClientHeading'),
          message:             AWE.I18n.lookupTranslation('error.genericClientMessage'),
          
          cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);

      }
      else if (character.get('alliance_id')        !== allianceId ||
               currentCharacter.get('alliance_id') !== allianceId ||
               currentCharacter.get('id')          !== alliance.get('leader_id') ||
               character.get('id')                 === alliance.get('leader_id')) {

        var dialog = AWE.UI.Ember.Dialog.create({
          contentTemplateName: 'info-dialog',
          
          heading:             AWE.I18n.lookupTranslation('alliance.error.kickHeading'),
          message:             AWE.I18n.lookupTranslation('alliance.error.kickMessage'),
          
          cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);

      }
      else {
        var confirmationDialog = AWE.UI.Ember.Dialog.create({
          templateName: 'info-dialog',

          classNames: ['confirmation-dialog'],
        
          heading:    AWE.I18n.lookupTranslation('alliance.confirmKick.heading'), 
          message:    AWE.I18n.lookupTranslation('alliance.confirmKick.message1')  + character.get('name') + AWE.I18n.lookupTranslation('alliance.confirmKick.message2'),
          
          cancelText: AWE.I18n.lookupTranslation('alliance.confirmKick.cancel'),
          okText:     AWE.I18n.lookupTranslation('alliance.confirmKick.ok'),
        
          okPressed:  function() {
            var self = this;
            var action = AWE.Action.Fundamental.createKickAllianceMemberAction(character.get('id'), allianceId);
            action.send(function(status) {
              self.destroy();      
              if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
                log(status, "Member kicked.");
              }
              else {
                log(status, "The server did not accept the kick member command.");
                var dialog = AWE.UI.Ember.InfoDialog.create({
                  contentTemplateName: 'server-command-failed-info',
                  cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
                  okPressed:           null,
                  cancelPressed:       function() { this.destroy(); },
                });          
                WACKADOO.presentModalDialog(dialog);
              } 
            });     
          },
          cancelPressed: function() { this.destroy(); }
        });
        WACKADOO.presentModalDialog(confirmationDialog);
      }
      return false; // prevent default behavior
    },    
  });
  
  module.AllianceManagementView = Ember.View.extend({
    templateName: 'alliance-management',
    controller:    null,
    alliance:      null,
    
    password:      null,
    
    errorMessage:  null,
    ongoingAction: null,
    
    resetError: function() {
      this.set('errorMessage', null);
    },
    
    startAction: function() {
      this.set('ongoingAction', true);
    },
    endAction: function() {
      this.set('ongoingAction', false);
    },
    
    displayPresentPassword: function() {
      this.set('password', this.getPath('alliance.password'));
    }.observes('alliance.password'),
    
    changePassword: function() {
      var self     = this;
      var password = this.get('password');
      var alliance = this.get('alliance');
      
      this.resetError();
      
      if (!password) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
        this.displayPresentPassword();
        return ;
      }
      
      if (password === this.getPath('alliance.password')) { // do nothing, password hasn't changed
        return ;
      }
      
      var action = AWE.Action.Fundamental.createChangeAlliancePasswordAction(alliance, password);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.failedToSetPassword'));
        }
        self.endAction();
      });       
    }, 
    
    modifiedPassword: function() {
      return this.get('password') !== this.getPath('alliance.password');
    }.property('alliance.password', 'password').cacheable(),
       
  });
  
  module.AllianceReservationView = Ember.View.extend({
    templateName: 'alliance-reservation',
    controller:    null,
    alliance:      null,
    reservation:   null,

    password:      null,

    errorMessage:  null,
    ongoingAction: null,

    init: function() {
      this.loadReservation();
      this._super();
    },

    allianceObserver: function() {
      this.loadReservation();
    }.observes('alliance'),

    loadReservation: function() {
      var allianceId = this.getPath('alliance.id');
      if (allianceId != null) {
        var self = this;
        var oldReservation = AWE.GS.AllianceReservationManager.getReservationOfAlliance(allianceId);
        if (oldReservation != null) {
          self.set('reservation', oldReservation);
        }
        else {
          this.set('ongoingAction', true);
        }
        AWE.GS.AllianceReservationManager.updateReservationsOfAlliance(allianceId, null, function(reservations) {
          var newReservation = AWE.GS.AllianceReservationManager.getReservationOfAlliance(allianceId);
          if (newReservation != null) {
            self.set('reservation', newReservation);
          }
          self.set('ongoingAction', false);
        });
      }
    },

    resetError: function() {
      this.set('errorMessage', null);
    },

    startAction: function() {
      this.set('ongoingAction', true);
    },
    endAction: function() {
      this.set('ongoingAction', false);
      this.loadReservation();
    },

    displayPresentPassword: function() {
      this.set('password', this.getPath('reservation.password'));
    }.observes('reservation', 'reservation.password'),

    changePassword: function() {
      var self     = this;
      var password = this.get('password');
      var allianceId = this.getPath('alliance.id');
      var allianceReservationId = this.getPath('reservation.id');

      this.resetError();

      if (!password) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
        this.displayPresentPassword();
        return;
      }

      if (password === this.getPath('reservation.password')) { // do nothing, password hasn't changed
        return;
      }

      if (this.get('reservation') == null) {
        var action = AWE.Action.Fundamental.createCreateAllianceReservationAction(allianceId, password);
        this.startAction();
        AWE.Action.Manager.queueAction(action, function(statusCode) {
          if (statusCode !== 201) {
            self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.failedToSetPassword'));
          }
          else {
            self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.success.reservationSaved'));
          }
          self.endAction();
        });
        }
      else {
        var action = AWE.Action.Fundamental.createUpdateAllianceReservationAction(allianceReservationId, password);
        this.startAction();
        AWE.Action.Manager.queueAction(action, function(statusCode) {
          if (statusCode !== 200) {
            self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.failedToSetPassword'));
          }
          else {
            self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.success.passwordSet'));
          }
          self.endAction();
        });
      }
    },

    modifiedPassword: function() {
      return this.get('password') !== this.getPath('reservation.password');
    }.property('reservation.password', 'password').cacheable(),

  });

  module.AllianceBannerView = AWE.UI.Ember.Pane.extend({
    width: 200,
    height: 200,
    
    alliance: null,
    shape: null,
    controller: null,
    
    init: function() {
      this._super();
    },
    
    bannerUpdate: function() {   // BUG: presently, if the alliance is set after the creation of the banner view, it sometimes doesn't display the alliance banner: example: on game server open the settlement dialog for another alliance, that you haven't looked-at before (client has not loaded that alliance)
      log('BANNER UPDATE');
      var allianceId = this.getPath('alliance.id');
      var shape  = this.get('shape');
      var width  = this.get('width')  || 200;
      var height = this.get('height') || 200;
      
      if (width * 5 / 4 < height) {
        height = width * 5 / 4; 
      }
      else {
        width = height * 4 / 5;
      }
      if (shape) {
        this.removeChild(shape);
      }
      if (!allianceId) {
        this.set('shape', null);
        return ;
      }
      log('SHAPE', width, height, allianceId);
      shape = AWE.UI.createAllianceFlagView();
      shape.initWithController(this.get('controller'));
      shape.setFrame(AWE.Geometry.createRect(0, 0, width, height));
      shape.setAllianceId(allianceId);
      shape.setTagVisible(true);
      shape.setDirection('down');
      this.addChild(shape);
      this.set('shape', shape);
      shape.updateView();      
      this.update();
    }.observes('alliance.id'),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

