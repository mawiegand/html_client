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
    },

    allianceCharacterInvitePlaceholder: function(){
      return AWE.I18n.lookupTranslation('dialogs.alliance.allianceInfo.allianceCharacterInvitePlaceholder');
    }.property(),

    sendAllianceCharacterInvite: function() {
      var confirmationDialog = AWE.UI.Ember.InfoDialog.create({
        classNames: ['confirmation-dialog'],

        controller: this,

        heading:    AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.heading'),
        message:    AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.message').format(this.get('characterInviteName')),

        cancelText: AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.cancel'),
        okText:     AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.ok'),

        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processSendAllianceCharacterInvite();
          }
          this.destroy();
        },

        cancelPressed: function() { this.destroy(); }
      });
      WACKADOO.presentModalDialog(confirmationDialog);
    },

    sendAllianceApplication: function() {
      this.set('applicationMessage', null);
      var confirmationDialog = AWE.UI.Ember.InfoDialog.create({
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

    processSendAllianceCharacterInvite: function() {
      var self = this;
      var characterInviteName = this.get('characterInviteName');
      var action = AWE.Action.Fundamental.createSendAllianceCharacterInviteAction(characterInviteName);
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          var successDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.success'),
          });
          WACKADOO.presentModalDialog(successDialog);
        }
        else if (status === AWE.Net.NOT_FOUND) {
          var successDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.characterNotFound').format(characterInviteName),
          });
          WACKADOO.presentModalDialog(successDialog);
        }
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.error'),
          });
          WACKADOO.presentModalDialog(errorDialog);
        }
      });
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
      return !this.getPath("alliance.auto_join_disabled");
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

        var dialog = AWE.UI.Ember.InfoDialog.create({          
          heading:             AWE.I18n.lookupTranslation('error.genericClientHeading'),
          message:             AWE.I18n.lookupTranslation('error.genericClientMessage'),
          
          okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
        });          
        WACKADOO.presentModalDialog(dialog);

      }
      else if (character.get('alliance_id')        !== allianceId ||
               currentCharacter.get('alliance_id') !== allianceId ||
               currentCharacter.get('id')          !== alliance.get('leader_id') ||
               character.get('id')                 === alliance.get('leader_id')) {

        var dialog = AWE.UI.Ember.InfoDialog.create({          
          heading:             AWE.I18n.lookupTranslation('alliance.error.kickHeading'),
          message:             AWE.I18n.lookupTranslation('alliance.error.kickMessage'),
          
          okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
        });          
        WACKADOO.presentModalDialog(dialog);

      }
      else {
        var confirmationDialog = AWE.UI.Ember.InfoDialog.create({

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
                  heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
                  message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
                  okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
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

    sendMessageClicked: function() {
      //alert("Hello Mail click!!!!");
      var alliance = this.get('alliance');
      if(!alliance)
      {
        return false;
      }
      WACKADOO.closeAllModalDialogs();
      WACKADOO.activateMessagesController({ alliance_recipient: alliance });

      return false;// prevent default behavior
    },

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

  module.AllianceDiplomacyRow = Ember.View.extend({
    templateName: 'alliance-diplomacy-row',
    classNames: 'alliance-row',
    ultimatum: null,
    alliance: null,
    targetAlliance: null,

    init: function() {
      //WACKADOO.get('hudController').activeAlliances.push(3);
      this._super();
    },

    targetAllianceTag: function() {
      var self = this;
      var targetAllianceId = this.getPath('ultimatum.target_alliance_id');
      var targetAlliance = AWE.GS.AllianceManager.getAlliance(targetAllianceId);
      if (targetAlliance) {
        return targetAlliance.getPath('tag');
      }
      else {
        AWE.GS.AllianceManager.updateAlliance(targetAllianceId, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(result) {
          self.set('targetAlliance', result)
        });
        return "Loading";
      }
      
    }.property('diplomacySourceRelation.target_alliance_id', 'targetAlliance').cacheable(),

    allianceClicked: function() {
      WACKADOO.closeAllModalDialogs();
      WACKADOO.showAllianceDialog(this.getPath('ultimatum.target_alliance_id'));
      return false; // prevent default behavior
    },

    calcUltimatumTime: function() {
      var ultimatumCreation = AWE.GS.TimeManager.serverToLocalTime(new Date(this.getPath('ultimatum.created_at')));
      var currentStateTimeInSeconds = Math.round(Math.abs(new Date() - ultimatumCreation)/1000);
      if (this.getPath('ultimatum.diplomacy_status')) {
        var diplomacyType = AWE.GS.RulesManager.getRules().getDiplomacyRelationType(this.getPath('ultimatum.diplomacy_status'));
        var initiator = this.getPath('ultimatum.initiator');
        var not_initiator_and_decreased_victim_duration = initiator !== undefined && initiator !== null && !initiator && diplomacyType.decrease_duration_for_victim;

        var currentStateRulesDuration = (not_initiator_and_decreased_victim_duration) ? diplomacyType.victim_duration : diplomacyType.duration;
        if (this.getPath('diplomacy_status') === 2) {
            var currentOpponentSurrenderRulesDuration = (not_initiator_and_decreased_victim_duration) ? diplomacyType.duration : diplomacyType.victim_duration;
            var opponentStateDuration = AWE.Util.secondsToDuration(currentOpponentSurrenderRulesDuration - currentStateTimeInSeconds);
            this.set('opponentSurrenderTime', opponentStateDuration);
        }

        var currentStateDuration = AWE.Util.secondsToDuration(currentStateRulesDuration - currentStateTimeInSeconds);
        this.set('ultimatumTime', currentStateDuration);
      }
      else {
        this.set('ultimatumTime', {h: 0, m: 0, s: 0});
        this.set('opponentSurrenderTime', {h: 0, m: 0, s: 0});
      }
    },

    ultimatumTime: {h: 0, m: 0, s: 0},

    opponentSurrenderTime: {h: 0, m: 0, s: 0},

    timeString: function(duration) {
      var time = {}
      time.h = duration.h + "h ";
      time.m = duration.m + "min ";
      if(duration.m <= 0) {
        time.s = duration.s + "s";
      } else {
        time.s = "";
      }

      if(duration.h <= 0) {
        time.h = "";
      }

      if(duration.m < 10) {
        time.m = "0" + time.m;
        if(duration.m < 0)
        {
          time.m = "";
        }
      }

      if(duration.m <= 0) {
        time.m = "";
      }

      if(duration.m <= 0 && duration.s < 10) {
        time.s = "0" + time.s;
        if(duration.s < 0)
        {
          time.s = "";
        }
      }

      var timeString = time.h + time.m + time.s;
      return timeString;
    },

    ultimatumTimeString: function() {
      var duration = this.get('ultimatumTime');
      return this.timeString(duration);
    }.property('ultimatumTime'),

    opponentSurrenderTimeString: function() {
      var duration = this.get('opponentSurrenderTime');
      return this.timeString(duration);
    }.property('opponentSurrenderTime'),

    opponentSurrenderString: function() {
      return AWE.I18n.lookupTranslation('dialogs.alliance.allianceDiplomacy.opponentSurrender').format(this.get('targetAllianceTag'), this.get('opponentSurrenderTimeString'));
    }.property('opponentSurrenderTimeString'),

    warGiveUp: function() {
      if(this.getPath('ultimatum.diplomacy_status') === 2 && this.get('ultimatumTimeString') === "")
      {
        return true;
      }
      return false;
    }.property('ultimatumTimeString', 'ultimatum.diplomacy_status'),

    canCancelAllianceRequest: function() {
      if (this.getPath('ultimatum.diplomacy_status') === 5)
      {
        var initiator = this.getPath('ultimatum.initiator');
        return initiator !== undefined && initiator !== null && initiator;
      }
      return false;
    }.property('ultimatum.diplomacy_status', 'ultimatum.initiator'),

    canAcceptAllianceRequest: function() {
      if (this.getPath('ultimatum.diplomacy_status') === 5)
      {
        var initiator = this.getPath('ultimatum.initiator');
        return initiator !== undefined && initiator !== null && !initiator;
      }
      return false;
    }.property('ultimatum.diplomacy_status', 'ultimatum.initiator'),

    canCancelAlliance: function() {
      return this.getPath('ultimatum.diplomacy_status') === 6
    }.property('ultimatum.diplomacy_status'),

    giveUp: function() {
      this.nextDiplomacyRelation();
    },

    cancelAllianceRequest: function() {
      this.nextDiplomacyRelation();
    },

    acceptAllianceRequest: function() {
      this.nextDiplomacyRelation();
    },

    cancelAlliance: function() {
      this.nextDiplomacyRelation();
    },

    nextDiplomacyRelation: function() {
      var self = this;
      var targetAllianceTag = this.get('targetAllianceTag');
      var action = AWE.Action.Fundamental.createDiplomacyRelationAction(self.getPath('alliance.id'), targetAllianceTag, false, self.getPath('ultimatum.id'));
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

    timer: null,

    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcUltimatumTime();
          };
        }(this)), 10000);
        this.set('timer', timer);
      }
    },

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    didInsertElement: function() {
      this.calcUltimatumTime();
      this.startTimer();
    },

    willDestroyElement: function() {
      this.stopTimer();
    },
  })

  //Diplomacy View Controller
  module.AllianceDiplomacyTab = Ember.View.extend({
    templateName: 'alliance-diplomacy-tab',
    classNames: ['alliance-diplomacy-tab'],

    alliance: null,
    targetAlliance: "",

    didInsertElement: function() {
      AWE.GS.DiplomacyRelationManager.updateAllDiplomacyRelationsOfAlliance(AWE.GS.game.getPath('currentCharacter.alliance_id'));
    },

    isAllianceLeader: function() {
      var leaderId = this.getPath('alliance.leader_id');
      var characterId = AWE.GS.game.getPath('currentCharacter.id');
      return leaderId && leaderId === characterId;
    }.property('alliance.leader_id', 'AWE.GS.game.currentCharacter.id').cacheable(),

    ultimatumDuration: function() {
      return (AWE.GS.RulesManager.getRules().getDiplomacyRelationType(1).duration / 60 / 60) + "h";
    }.property(),

    createDiplomacyRelation: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createDiplomacyRelationAction(this.getPath('alliance.id'), this.getPath('targetAlliance'), true, null);
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

    infoClicked: function() {
      var dialog = AWE.UI.Ember.AllianceDiplomacyInfoView.create();
      WACKADOO.presentModalDialog(dialog);
    },

    relationsFound: function() {
      var self = this;
      var relations = this.getPath('alliance.diplomacySourceRelations');
      var found = false;
      
      relations.forEach(function(item) {
        if (item.getPath('source_alliance_id') === self.getPath('alliance.id')) {
          found = true;
        }
      });
      return found;
    }.property('relationFound', 'alliance', 'alliance.diplomacySourceRelations', 'AWE.GS.game.currentCharacter.alliance_id').cacheable(),

    relationsAtUltimatum: function() {
      var self = this;
      var ultimatumRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 1) {
          ultimatumRelations.push(item);
        }
      });
      return ultimatumRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtWar: function() {
      var self = this;
      var warRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 2) {
          warRelations.push(item);
        }
      });
      return warRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtCapitulation: function() {
      var self = this;
      var capitulationRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 3) {
          capitulationRelations.push(item);
        }
      });
      return capitulationRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtOccupation: function() {
      var self = this;
      var occupationRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 4) {
          occupationRelations.push(item);
        }
      });
      return occupationRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtAllianceRequest: function() {
      var self = this;
      var allianceRequestRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 5) {
          allianceRequestRelations.push(item);
        }
      });
      return allianceRequestRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtAlliance: function() {
      var self = this;
      var allianceRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 6) {
          allianceRelations.push(item);
        }
      });
      return allianceRelations;
    }.property('alliance.diplomacySourceRelations'),

    relationsAtAllianceConclusion: function() {
      var self = this;
      var allianceConclusionRelations = [];
      var relations = this.getPath('alliance.diplomacySourceRelations');

      relations.forEach(function(item) {
        //TODO
        if (item.getPath('diplomacy_status') === 7) {
          allianceConclusionRelations.push(item);
        }
      });
      return allianceConclusionRelations;
      }.property('alliance.diplomacySourceRelations'),

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

  module.AllianceDiplomacyInfoView = module.PopUpDialog.extend({
    templateName: 'alliance-diplomacy-info',
    classNames: ['alliance-diplomacy-info-view'],

  });
  return module;

}(AWE.UI.Ember || {}));


