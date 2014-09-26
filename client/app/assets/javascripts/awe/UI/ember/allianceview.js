/**
 * @fileOverview 
 * Ember JS views for the alliance screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:marc@5dlab.com">Marc Wißler</a>
 */ 

 var AWE = AWE || {};
 AWE.UI = AWE.UI || {};


 AWE.UI.Ember = (function(module) {

  module.AllianceView = module.PopUpDialog.extend({
    templateName: 'alliance-view',
    classNames: ['alliance-view'],

    alliance: null,
    controller: null,
    
    ownAlliance: function() {
      var allianceId = this.getPath('alliance.id');
      var ownAllyId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      return allianceId && allianceId === ownAllyId;
    }.property('alliance.id', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

    open: function() {
      WACKADOO.presentModalDialog(this);
    }

  });

  AWE.UI.Ember.AlliancePasswordInputField = Ember.TextField.extend({
    alliance: null,
    errorMessage: null,
    valueBinding: Ember.Binding.oneWay("parentView.alliance.password"),

    focusOut: function() {
      this.changePassword();
    },

    changePassword: function() {
      var self     = this;
      var value    = this.get('value');
      var alliance = this.get('alliance');
      var valueRegex = /\s*|§*|\$*/;

      if (value.length === 0 || value.length > 5 || value.match(valueRegex)) {
        debugger;
        this.set('value', this.getPath('alliance.password'));
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
        return ;
      }

      if (value === this.getPath('alliance.password')) { // do nothing, password hasn't changed      
      return;
    }

    var action = AWE.Action.Fundamental.createChangeAlliancePasswordAction(alliance, value);
    AWE.Action.Manager.queueAction(action, function(statusCode) {
      debugger;
      if (statusCode !== 200) {
        self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.failedToSetPassword'));
      }
      self.endAction();
    });       
  },
});

module.AllianceTabView = module.TabViewNew.extend({
  alliance: null,
  controller: null,

  init: function() {

    this.set('tabViews', [
      { key:   "tab1",
      title: AWE.I18n.lookupTranslation('dialogs.alliance.info'), 
      view:  AWE.UI.Ember.AllianceInfoTab.extend({ allianceBinding : "parentView.parentView.alliance", controllerBinding : "parentView.parentView.controller"}),
      buttonClass: "left-menu-button"
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
        title: AWE.I18n.lookupTranslation('dialogs.alliance.members'), 
        view:  AWE.UI.Ember.AllianceMembersTab.extend({ allianceBinding : "parentView.parentView.alliance" }),
        buttonClass: "middle-menu-button"
      },
      { key:   "tab3",
      title: AWE.I18n.lookupTranslation('dialogs.alliance.diplomacy'), 
      view:  AWE.UI.Ember.AllianceDiplomacyTab.extend({ allianceBinding : "parentView.parentView.alliance" }),
      buttonClass: "right-menu-button"
    }
    ]);

    this._super();
  },

});

module.AllianceInfoTab = Ember.View.extend({
  templateName: 'alliance-info-tab',
  classNames: ['alliance-info-tab'],

  alliance: null,
  controller: null,
  //password: this.getPath('alliance.password'),

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

  isNotAllianceMember: function() {
    var currentCharacter = AWE.GS.game.get('currentCharacter');
    return currentCharacter.get('alliance_id') !== this.get('alliance').getId();
  }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

  invitationLinkPressed: function() {

    console.log(this.getPath('alliance'));
  },

  sendAllianceApplication: function() {
    this.set('applicationMessage', null);
    var confirmationDialog = AWE.UI.Ember.Dialog.create({
      templateName: 'info-dialog',

      classNames: ['confirmation-dialog'],
      
      controller: this,

      heading:    AWE.I18n.lookupTranslation('alliance.confirmApplication.heading'), 
      message:    AWE.I18n.lookupTranslation('alliance.confirmApplication.message'),

      cancelText: AWE.I18n.lookupTranslation('alliance.confirmApplication.cancel'),
      okText:     AWE.I18n.lookupTranslation('alliance.confirmApplication.ok'),

      okPressed: function() {
        var controller = this.get('controller');
        if (controller) {
          controller.processSendAllianceApplication();
        }
        this.destroy();
      },

      cancelPressed: function() { this.destroy(); }
    });
    WACKADOO.presentModalDialog(confirmationDialog);
  },

  resetError: function() {
    this.set('errorMessage', null);
  },

  startAction: function() {
    this.set('ongoingAction', true);
  },

  endAction: function() {
    this.set('ongoingAction', false);
  },

  changePassword: function() {
    debugger;
    var self     = this;
    var password = this.getPath('alliance.password');
    var alliance = this.get('alliance');

    if (password.length < 4) {

      this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
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

});

module.AllianceMembersTab = Ember.View.extend({
  templateName: 'alliance-members-tab',
  classNames: ['alliance-members-tab'],

  alliance: null,

  password: null,

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

  isNotAllianceMember: function() {
    var currentCharacter = AWE.GS.game.get('currentCharacter');
    return currentCharacter.get('alliance_id') !== this.get('alliance').getId();
  }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

  invitationLinkPressed: function() {

    console.log(this.getPath('alliance'));
  },

});

module.AllianceDiplomacyTab = Ember.View.extend({
  templateName: 'alliance-diplomacy-tab',
  classNames: ['alliance-diplomacy-tab'],

  alliance: null,

  password: null,


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

  isNotAllianceMember: function() {
    var currentCharacter = AWE.GS.game.get('currentCharacter');
    return currentCharacter.get('alliance_id') !== this.get('alliance').getId();
  }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

  invitationLinkPressed: function() {

    console.log(this.getPath('alliance'));
  },

});
return module;

}(AWE.UI.Ember || {}));


