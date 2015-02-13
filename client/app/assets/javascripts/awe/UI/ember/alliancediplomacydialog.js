/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>,
 *          David Unger <david@5dlab.com>,
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.AllianceDiplomacyDialog = module.PopUpDialog.extend({
    templateName: 'alliance-diplomacy-dialog',
    classNames: ['alliance-diplomacy-dialog'],

    characterBinding: 'AWE.GS.game.currentCharacter',

    joinAllianceTag:      null,   // input bindings
    joinAlliancePassword: null,

    newAllianceName:  null,
    newAllianceTag:   null,

    ongoingAction:    false,
    ongoingActionCreate: false,
    ongoingActionJoin:   false,
    ongoingActionLeave:  false,
    ongoingActionRandom: false,

    joinAllianceNotAllowedText: function(){
      var string = AWE.I18n.lookupTranslation('alliance.joinAllianceNotAllowedText');
      return string.format(Date.parse(this.getPath("character.cannot_join_alliance_until")).toLocaleString());
    }.property("character.cannot_join_alliance_until"),

    startAction: function(action) {
      this.set('ongoingAction', true);

      if (action === 'create') {
        this.set('ongoingActionCreate', true);
      } else if (action === 'join') {
        this.set('ongoingActionJoin', true);
      } else if (action === 'leave') {
        this.set('ongoingActionLeave', true);
      } else if (action === 'random') {
        this.set('ongoingActionRandom', true);
      }
    },

    endAction: function(action) {
      this.set('ongoingAction', false);

      if (action === 'create') {
        this.set('ongoingActionCreate', false);
      } else if (action === 'join') {
        this.set('ongoingActionJoin', false);
      } else if (action === 'leave') {
        this.set('ongoingActionLeave', false);
      } else if (action === 'random') {
        this.set('ongoingActionRandom', false);
      }
    },

    hasAction: function () {
      return this.get('ongoingAction');
    },

    joinAlliance: function() {
      if (this.get('ongoingAction')) return;

      var self     = this;
      var tag      = this.get('joinAllianceTag');
      var password = this.get('joinAlliancePassword');

      if (!tag || tag.length < 2) {
        this.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.invalidTag'));
        return ;
      }
      if (!password) {
        this.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.invalidPassword'));
        return ;
      }

      var action = AWE.Action.Fundamental.createJoinAllianceAction(tag, password);
      this.startAction('join');
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === 404) {
          self.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.tagNotTaken'));
        }
        else if (statusCode === 403) {
          self.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.wrongPassword'));
        }
        else if (statusCode === AWE.Net.CONFLICT) {
          self.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.memberLimitReached'));
        }
        else if (statusCode !== 200) {
          self.joinAllianceError(AWE.I18n.lookupTranslation('alliance.error.unknownJoin'));
        }
        self.endAction('join');
      });
    },

    joinRandomAlliance: function () {
      if (this.get('ongoingAction')) return;

      var self = this;
      var characterId = AWE.GS.game.getPath('currentCharacter.id');

      var action = AWE.Action.Fundamental.createAutoJoinAllianceAction(characterId);
      this.startAction('random');
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if(statusCode !== 200) {
          self.joinAllianceError(AWE.I18n.lookupTranslation('alliance.joinRandomAllianceFailedText'));
        }
        self.endAction('random');
      });
    },

    joinAllianceError: function(message) {
      errorDialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('alliance.joinRandomAllianceFailedHead'),
        message: message
      });
      WACKADOO.presentModalDialog(errorDialog);
    },

    createAlliance: function () {
      if (this.get('ongoingAction')) return;

      var self     = this;
      var tag      = this.get('newAllianceTag');
      var name     = this.get('newAllianceName');

      if (!tag || tag.length < 2 || tag.length > 5 || tag.match(/[^A-Za-z0-9]/)) {
        this.createAllianceError(AWE.I18n.lookupTranslation('alliance.error.enterValidTag'));
        return ;
      }
      if (!name || name.length < 2) {
        this.createAllianceError(AWE.I18n.lookupTranslation('alliance.error.enterValidName'));
        return ;
      }

      var action = AWE.Action.Fundamental.createCreateAllianceAction(tag, name);
      this.startAction('create');
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === AWE.Net.CONFLICT) {
          self.createAllianceError(AWE.I18n.lookupTranslation('alliance.error.tagTaken'));
        }
        else if (statusCode === AWE.Net.FORBIDDEN) {
          self.createAllianceError(AWE.I18n.lookupTranslation('alliance.error.noPermissionCreate'));
        }
        else if (statusCode !== AWE.Net.CREATED) {
          self.createAllianceError(AWE.I18n.lookupTranslation('alliance.error.unknownCreate'));
        }
        self.endAction('create');
      });
    },

    createAllianceError: function(message) {
      errorDialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('alliance.createAllianceFailedHead'),
        message: message
      });
      WACKADOO.presentModalDialog(errorDialog);
    },

    leaveAlliance: function() {
      if (this.get('ongoingAction')) return;

      var self = this;
      var message = AWE.I18n.lookupTranslation('alliance.confirmLeave.message');
      var hours = this.getPath("character.hoursUntilAllianceRejoinAllowed");
      if(hours !== 0){
        var string = AWE.I18n.lookupTranslation('alliance.confirmLeave.message2');
        message += string.format(hours);
      }

      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading:    AWE.I18n.lookupTranslation('alliance.confirmLeave.heading'),
        message:    message,

        okText: AWE.I18n.lookupTranslation('general.yes'),
        cancelText: AWE.I18n.lookupTranslation('general.cancel'),

        allianceId: this.getPath('character.alliance_id'),

        okPressed: function() {
          var action = AWE.Action.Fundamental.createLeaveAllianceAction(this.get('allianceId'));
          if (!action) {
            this.leaveAllianceError(AWE.I18n.lookupTranslation('alliance.error.leaveFailedClient'));
          }
          else {
            self.startAction('leave');
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode !== 200) {
                self.leaveAllianceError(AWE.I18n.lookupTranslation('alliance.error.leaveFailed'));
              }
              self.endAction('leave');
            });
          }
          this.destroy();
        },
        cancelPressed: function() {
          this.destroy();
        },
      });
      WACKADOO.presentModalDialog(dialog);
    },

    leaveAllianceError: function(message) {
      errorDialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('alliance.leaveAllianceFailedHead'),
        message: message
      });
      WACKADOO.presentModalDialog(errorDialog);
    }
  });

  return module;

}(AWE.UI.Ember || {}));