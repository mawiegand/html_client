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
    
    isNotAllianceMember: function() {
      var currentCharacter = AWE.GS.game.get('currentCharacter');
      return currentCharacter.get('alliance_id') !== this.get('alliance').getId();
    }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),    
  });
  
  module.AllianceInfoBoxView = Ember.View.extend({
    templateName: 'alliance-infobox',
    
    controller: null,
    alliance:   null,
    candidate:  null,
    
    ownAlliance: function() {
      var allianceId = this.getPath('alliance.id');
      var ownAllyId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      return allianceId && allianceId === ownAllyId;
    }.property('alliance.id', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),
    
    creation: function() {
      return AWE.Util.createTimeString(this.getPath('alliance.created_at'));
    }.property('alliance.created_at').cacheable(),

    setLeaderVoteSelection: function(){
      var vote_candidate_id = this.getPath('alliance.vote_candidate_id');
      var members = this.getPath("alliance.hashableMembers.hash");
      if (members[vote_candidate_id]){
        this.set("candidate", members[vote_candidate_id]);
      }
    }.observes("alliance.members"),
    
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
        inputMaxLength: AWE.Config.DESCRIPTION_MAX_LENGTH,

        classNames: ['alliance-description'],
        
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
      return $('<div/>').text(this.getPath('alliance.description')).html().replace(/\n/g, '<br />');
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
        else if (status === AWE.Net.CONFLICT) {
          self.set('message', AWE.I18n.lookupTranslation('alliance.error.changeDescriptionConflict'));
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
          self.set('applicationMessage', AWE.I18n.lookupTranslation('alliance.confirmApplication.success'));
        }
        else {
          self.set('applicationMessage', AWE.I18n.lookupTranslation('alliance.confirmApplication.error'));
        }
      });        
    },
  });

  module.AllianceMembersView = Ember.View.extend({
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
      return false; //prevent default action!
    },
    
  });

  module.AllianceAutoJoinView = Ember.View.extend({
    templateName: 'alliance-auto-join',
    controller:    null,
    alliance:      null,

    ongoingAction: null,
    
    startAction: function() {
      this.set('ongoingAction', true);
    },

    endAction: function() {
      this.set('ongoingAction', false);
    },

    /**
     * @return returns "activated" or "deactivated" as string
     */
    currentState: function() {
      if(this.getPath('alliance.auto_join_disabled')) {
        return AWE.I18n.lookupTranslation('alliance.autoJoinDeactivated');
      } else {
        return AWE.I18n.lookupTranslation('alliance.autoJoinActivated');
      }
    }.property('alliance.auto_join_disabled'),

    changeStatePressed: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createChangeAllianceAutoJoinAction(this.getPath('alliance.id'), this.getPath('alliance.auto_join_disabled'));
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.autoJoinFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.autoJoinFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.destroy();
        }
        self.endAction();
      });
    },
  });

  module.AllianceMemberListView = Ember.View.extend({
    templateName: 'alliance-member-list',
    
    controller: null,
    alliance:   null,

    maxMembers: function() {
      return AWE.GS.RulesManager.getRules().get('alliance_max_members') + this.getPath('alliance.size_bonus');
    }.property('controller').cacheable(),

    hasBonus: function() {
      return this.getPath('alliance.additional_members') > 0;
    }.property('alliance.additional_members').cacheable(),

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
  
  module.DiplomacyRelationListView = Ember.View.extend({
    templateName: 'diplomacy-relation-list',
    
    controller:     null,
    alliance:       null,
    relationFound:  null,

    isAllianceLeaderOfDifferentAlliance: function() {
      var currentCharacter = AWE.GS.game.get('currentCharacter');
      var currentCharacterId = AWE.GS.game.getPath('currentCharacter.id');
      var currentCharacterAllianceId = currentCharacter.get('alliance_id');
      if (currentCharacterAllianceId) {
        var currentCharacterAlliance = AWE.GS.AllianceManager.getAlliance(currentCharacterAllianceId);
        if (currentCharacterAlliance) {
          return currentCharacterAlliance.getPath('leader_id') === currentCharacterId;
        }
        else {
          AWE.GS.AllianceManager.updateAlliance(currentCharacterAllianceId, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(result) {
            currentCharacterAlliance = result;
            return currentCharacterAlliance.getPath('leader_id') === currentCharacterId;
          });
        }
      }
      else {
        return false;
      }
    }.property('alliance', 'AWE.GS.game.currentCharacter.alliance_id', 'currentCharacterAlliance.leader_id').cacheable(),
    
    noRelationExists: function() {
      var self = this;
      var relations = this.getPath('alliance.diplomacySourceRelations');
      var found = false;
      
      relations.forEach(function(item) {
        if (item.getPath('target_alliance_id') === AWE.GS.game.getPath('currentCharacter.alliance_id')) {
          found = true;
        }
      });
      self.set('relationFound', found);
      return !self.get('relationFound');
    }.property('relationFound', 'alliance', 'alliance.diplomacySourceRelations', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),
    
    createDiplomacyRelationWithAlliance: function() {
      this.set('diplomacyRelationMessage', null);
      var confirmationDialog = AWE.UI.Ember.Dialog.create({
        templateName: 'info-dialog',

        classNames: ['confirmation-dialog'],
      
        controller: this,
        
        heading:    AWE.I18n.lookupTranslation('alliance.confirmDiplomacyRelation.heading'), 
        message:    AWE.I18n.lookupTranslation('alliance.confirmDiplomacyRelation.message'),
        
        cancelText: AWE.I18n.lookupTranslation('alliance.confirmDiplomacyRelation.cancel'),
        okText:     AWE.I18n.lookupTranslation('alliance.confirmDiplomacyRelation.ok'),
       
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processCreateDiplomacyRelationWithAlliance();
          }
          this.destroy();
        },
        
        cancelPressed: function() { this.destroy(); }
      });
      WACKADOO.presentModalDialog(confirmationDialog);
    },

    processCreateDiplomacyRelationWithAlliance: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createDiplomacyRelationAction(AWE.GS.game.getPath('currentCharacter.alliance_id'), self.getPath('alliance.name'), true);
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === AWE.Net.OK) {
        }
        else if (statusCode === AWE.Net.CONFLICT) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedRelationAlreadyExists'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
        else if (statusCode === AWE.Net.NOT_FOUND) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedTargetAllianceNotFoundText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
      });
    },
  });
  
  module.DiplomacyRelationView = Ember.View.extend({
    templateName: 'diplomacy-relation',
    
    diplomacySourceRelation:  null,
    alliance:                 null,
    targetAlliance:           null,
    controller:               null,
    
    targetAllianceName: function() {
      var self = this;
      var targetAllianceId = this.getPath('diplomacySourceRelation.target_alliance_id');
      var targetAlliance = AWE.GS.AllianceManager.getAlliance(targetAllianceId);
      if (targetAlliance) {
        return targetAlliance.getPath('name');
      }
      else {
        AWE.GS.AllianceManager.updateAlliance(targetAllianceId, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(result) {
          self.set('targetAlliance', result)
        });
      }
      
    }.property('diplomacySourceRelation.target_alliance_id', 'targetAlliance').cacheable(),
    
    allianceClicked: function() {
      WACKADOO.activateAllianceController(this.getPath('diplomacySourceRelation.target_alliance_id'));
      WACKADOO.closeAllModalDialogs();
      return false; // prevent default behavior
    },
    
    status: function() {
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).name);
    }.property('diplomacySourceRelation.diplomacy_status').cacheable(),
    
    ends: function() {
      var createdAt = Date.parseISODate(this.getPath('diplomacySourceRelation.created_at'));
      var duration = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).duration;
      
      if (this.getPath('diplomacySourceRelation.diplomacy_status') == 2) {
        var victim = !(this.getPath('diplomacySourceRelation.initiator'));
        var victimDecrease = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).decrease_duration_for_victim;
        if (victim && victimDecrease) {
          duration = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).victim_duration;
        }
        
        return AWE.I18n.lookupTranslation('alliance.diplomacyRelationEndsWar1') + createdAt.add({seconds: duration}).toLocaleString(); + AWE.I18n.lookupTranslation('alliance.diplomacyRelationEndsWar2');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.diplomacyRelationEnds') + createdAt.add({seconds: duration}).toLocaleString();
      }
    }.property('diplomacySourceRelation.diplomacy_status').cacheable(),
    
    enableNextStatusButton: function() {
      var manual = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).min;
      
      var duration = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).duration;
      var ends = Date.parseISODate(this.getPath('diplomacySourceRelation.created_at')).add({seconds: duration});
      var durationReached = manual && (ends <= new Date());
      
      var victim = !(this.getPath('diplomacySourceRelation.initiator'));
      var victimDecrease = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).decrease_duration_for_victim;
      var victimDuration = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).victim_duration;
      var victimEnds = Date.parseISODate(this.getPath('diplomacySourceRelation.created_at')).add({seconds: victimDuration});
      
      var victimDurationReached = manual && victim && victimDecrease && (victimEnds <= new Date());
      
      return durationReached || victimDurationReached;
    }.property('diplomacySourceRelation.diplomacy_status').cacheable(),
    
    nextStatus: function() {
      var nextRelationId = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('diplomacySourceRelation.diplomacy_status')).next_relations[0];
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getDiplomacyRelationType(nextRelationId).name);
    }.property('diplomacySourceRelation.diplomacy_status').cacheable(),
        
    nextDiplomacyRelation: function() {
      var self = this;
      var targetAllianceName = this.get('targetAllianceName');
      var action = AWE.Action.Fundamental.createDiplomacyRelationAction(this.getPath('diplomacySourceRelation.source_alliance_id'), targetAllianceName, false);
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode !== 200) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
      });
    },
  });
  
  module.CreateDiplomacyRelationView = Ember.View.extend({
    templateName: 'create-diplomacy-relation',

    controller:     null,
    alliance:       null,
    newTargetAllianceName: null,
    
    ultimatumEnds: function() {
      var duration = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(1).duration;
      var now = new Date();
      return now.add({seconds: duration}).toLocaleString();
    }.property().cacheable(),
    
    createDiplomacyRelation: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createDiplomacyRelationAction(this.getPath('alliance.id'), this.getPath('newTargetAllianceName'), true);
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === AWE.Net.OK) {
        }
        else if (statusCode === AWE.Net.CONFLICT) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedRelationAlreadyExists'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
        else if (statusCode === AWE.Net.NOT_FOUND) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedTargetAllianceNotFoundText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.diplomacyFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.diplomacyFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
      });
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
    width: 120,
    height: 150,
    
    alliance: null,
    shape: null,
    controller: null,
    
    init: function() {
      this._super();
    },
    
    bannerUpdate: function() {   // BUG: presently, if the alliance is set after the creation of the banner view, it sometimes doesn't display the alliance banner: example: on game server open the settlement dialog for another alliance, that you haven't looked-at before (client has not loaded that alliance)
      log('BANNER UPDATE');
      var allianceId = this.getPath('alliance.id');
      var allianceColor = this.getPath('alliance.color');
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
      shape.setAllianceColor(allianceColor);
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

