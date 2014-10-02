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

 AWE.UI.Ember.AlliancePasswordInputField = Ember.TextField.extend({
  alliance: null,
  errorMessage: null,
  valueBinding: Ember.Binding.oneWay("parentView.alliance.password"),

  focusOut: function() {
    this.changePassword();
  },

  keyPress: function(e) {
    if(e.which === 13) {
      this.changePassword();
    }
  },

  changePassword: function() {
    var self     = this;
    var value    = this.get('value');
    var alliance = this.get('alliance');
    var valueRegex = /[^A-Za-z0-9]/;

    if (value.length === 0 || value.length > 5 || value.match(valueRegex)) {
      if(value.length === 0) {
        alert(AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
      }
      else if(value.match(valueRegex)) {
        alert(AWE.I18n.lookupTranslation('alliance.error.specialChars'));
      }

      this.set('value', this.getPath('alliance.password'));
      this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.blankPassword'));
      return;
    }

    if (value === this.getPath('alliance.password')) {
      return;
    }

    var action = AWE.Action.Fundamental.createChangeAlliancePasswordAction(alliance, value);
    AWE.Action.Manager.queueAction(action, function(statusCode) {
      if (statusCode !== 200) {
        self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.failedToSetPassword'));
      }
    });       
  },
});

AWE.UI.Ember = (function(module) {

  module.AllianceView = module.PopUpDialog.extend({
    templateName: 'alliance-view',
    classNames: ['alliance-view'],

    alliance: null,
    
    ownAlliance: function() {
      var allianceId = this.getPath('alliance.id');
      var ownAllyId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      return allianceId && allianceId === ownAllyId;
    }.property('alliance.id', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

    open: function() {
      WACKADOO.presentModalDialog(this);
    },

    onClose: function() {
      //WACKADOO.activateMapController(true);
    }

  });

  //Tab View Controller
  module.AllianceTabView = module.TabViewNew.extend({
    alliance: null,

    init: function() {

      this.set('tabViews', [
        { key:   "tab1",
        title: AWE.I18n.lookupTranslation('dialogs.alliance.info'), 
        view:  AWE.UI.Ember.AllianceInfoTab.extend({ allianceBinding : "parentView.parentView.alliance" }),
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


  //Info View Controller
  module.AllianceInfoTab = Ember.View.extend({
    templateName: 'alliance-info-tab',
    classNames: ['alliance-info-tab'],

    alliance: null,

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

    processSendAllianceApplication: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createSendAllianceApplicationAction(this.get('alliance').getId());
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          var successDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.confirmApplication.success'),
          });
          WACKADOO.presentModalDialog(successDialog);
          //self.set('applicationMessage', AWE.I18n.lookupTranslation('alliance.confirmApplication.success'));
        }
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.confirmApplication.error'),
          });
          WACKADOO.presentModalDialog(errorDialog);
          //self.set('applicationMessage', AWE.I18n.lookupTranslation('alliance.confirmApplication.error'));
        }
      });        
    },


    setAutoJoin: function() {
      //debugger;
      //this.set('alliance.auto_join_disabled', !this.getPath('alliance.auto_join_disabled'));
      var self = this;
      var action = AWE.Action.Fundamental.createChangeAllianceAutoJoinAction(this.getPath('alliance.id'), this.getPath('alliance.auto_join_disabled'));
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.autoJoinFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.autoJoinFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.destroy();
        }
      });
    },


    isToggleOn: function(){
      return this.getPath("alliance.auto_join_disabled");
    }.property("alliance.auto_join_disabled"),

    processNewDescription: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createChangeAllianceDescriptionAction(this.getPath('alliance.description'), this.get('alliance'));
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          self.set('message', null);
        }
        else if (status === AWE.Net.FORBIDDEN) {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionForbidden'));
        }
        else if (status === AWE.Net.CONFLICT) {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionConflict'));
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionError'));
        }
      });        
    },

  });

  //Mermbers View Controller
  module.AllianceMembersTab = Ember.View.extend({
    templateName: 'alliance-members-tab',
    classNames: ['alliance-members-tab'],

    alliance: null,
    noLeader: true,
    candidate: null,

    init: function() {
      this._super();
    },

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

    setLeaderVoteSelection: function(character){
      var characterId = character.id;
      var members = this.getPath("alliance.hashableMembers.hash");
      if (members[characterId]){
        this.set("candidate", members[characterId]);
      }
    },

    changeAllianceLeaderVote: function() {
      if( this.getPath('alliance.vote_candidate_id') === this.getPath('candidate.id') ) { return; }
      var self = this;
      var action = AWE.Action.Fundamental.createAllianceLeaderVoteAction(this.getPath('alliance.id'), this.getPath('candidate.id'));
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.allianceLeaderVoteFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.allianceLeaderVoteFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
      });
    }.observes('candidate'),

    updateView: function() {
      this.rerender();
    }.observes('alliance.leaderId'),

  });

  module.AllianceMember = Ember.View.extend({
    templateName: 'alliance-member',
    classNames: ['alliance-member'],

    character: null,
    alliance:   null,
    controller: null,
    noLeader: false,
    
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
      return false; //prevent default action!
    },

    setLeaderVoteSelection: function() {
      var parentView = this.get('parentView');
      if(parentView) {
        parentView.setLeaderVoteSelection(this.get('character'));
      }
    },

    showCurrentCharacter: function() {
      if(this.get('noLeader') && this.get('isLeader'))
      {
        return false;
      }
      return true;
    }.property('isLeader', 'noLeader'),

    currentCharacterVote: function() {
      if(this.getPath('character.id') === this.getPath('alliance.vote_candidate_id'))
      {
        return true;
      }
      return false;
    }.property('alliance.vote_candidate_id', 'character.id'),


  });

  //Diplomacy View Controller
  module.AllianceDiplomacyTab = Ember.View.extend({
    templateName: 'alliance-diplomacy-tab',
    classNames: ['alliance-diplomacy-tab'],

    alliance: null

  });
  return module;

}(AWE.UI.Ember || {}));


