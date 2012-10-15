/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {


  module.TabButtonView = Ember.View.extend({
    tagName:    'li',
    classNames: ['tab-button-view'],
    classNameBindings: ['current'],
    key:        null,
    
    click: function() {
      this.get('parentView').selectTabByKey(this.get('key'));
    },
    
    current: function() {
      return this.get('key') === this.getPath('parentView.presentTab.key');
    }.property('key', 'parentView.presentTab.key'),
    
  });

  module.TabView = Ember.View.extend({
    templateName: 'tab-view',
    classNames:   'tab-view',

    tabViews:      null,
    currentView:   null,
    presentTab:    null,
    
    
    init: function() {
      var tabViews = this.get('tabViews');
      this.selectTabByNumber(0);
      this._super();
    },
    
    selectTabByKey: function(key) {
      var tabViews = this.get('tabViews');
      var tab = tabViews ? tabViews.findProperty('key', key) : null;
      if (tab) {
        this.setTab(tab);
      }
    },

    selectTabByNumber: function(n) {
      var tabViews = this.get('tabViews');
      if (tabViews && tabViews.length > n) {
        this.setTab(tabViews[n]);
      };
    },
    
    setTab: function(tab) {
      var presentTab = this.get('presentTab');
      var oldView    = this.get('currentView');
      if (presentTab !== tab) {
        this.set('presentTab',  tab);
        this.set('currentView', tab.view.create());
        if (oldView) {
          oldView.destroy();
        }
      }
    },
    
  });
  
  module.ProfileTabView = module.TabView.extend({
    
    character: null,   // must be bound to the character
    
    init: function() {
     
      this.set('tabViews', [
        { key:   "tab1",
          title: "Info", 
          view:  AWE.UI.Ember.ProfileInfoView.extend({ 
            characterBinding: "parentView.parentView.character" 
          })
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
          title: "Anpassung", 
          view:  AWE.UI.Ember.CharacterCustomizationView.extend({ 
            characterBinding: "parentView.parentView.character"
          })
        },
        { key:   "tab3",
          title: "Einstellungen", 
          view:  AWE.UI.Ember.SettingsView.extend({ 
            characterBinding: "parentView.parentView.character"
          })
        },
      ]);
      
      this._super();
    },
    
    characterObserver: function() {
      var characterId = this.getPath('character.id') || null;
      if (characterId) {
        AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }       
    }.observes('character.id'),
  });


  /**
   * @class
   *
   * View that allows the user to edit his profile.
   *   
   * @name AWE.UI.Ember.ProfileView 
   */
  module.ProfileView = Ember.View.extend( /** @lends AWE.UI.Ember.ProfileView# */ {
    templateName: 'character-profile-view',
    
    character: null,
    alliance:  null,

    onClose:   null,
    
    // FIXME hack for users that have already changed their name before reached the appropriate quest 
    characterObserver: function() {
      var characterId = this.getPath('character.id') || null;
      if (characterId && this.getPath('character.name_change_count') > 0) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('quest_profile');
      }       
    }.observes('character.id'),
    
    setAndUpdateAlliance: function() {
      var allianceId = this.getPath('character.alliance_id');
      var self = this;
      if (!allianceId) {
        return ;
      }
      var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
      this.set('alliance', alliance);
      AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('alliance', result);
      });
    },     
    
    allianceIdObserver: function() {
      this.setAndUpdateAlliance();
    }.observes('character.alliance_id'),
    
    closePressed: function() {
      this.destroy();
    },
    
    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }
      this._super();      
    },
  });
  
  
  module.CharacterCustomizationView = Ember.View.extend({    
    templateName: 'character-customization-view',
    
    character: null,
    
    changingName:     false,
    changingGender:   false,

    firstTwoNameChange: function() { 
      var count = this.getPath('character.name_change_count');
      return count === undefined || count === null || count < 2;
    }.property('character.name_change_count'), 
    
    changeNamePressed: function() {
      this.set('message', null);
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        heading: AWE.I18n.lookupTranslation('profile.customization.changeNameDialogCaption'),
        input: this.getPath('character.name'),
        controller: this,
        
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processNewName(this.getPath('input'));
          }
          this.destroy();            
        },
        
        cancelPressed: function() { this.destroy(); },
      });
      WACKADOO.presentModalDialog(changeDialog);
    },
    
    processNewName: function(newName) {
      
      if (!newName || newName.length < 3) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameTooShort'));
      }
      else if (!newName || newName.length > 12) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameTooLong'));
      }
      else if (newName === this.getPath('character.name')) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameNoChange'));
      }      
      else {  // now, really send the name
        var self = this;
        var changeCounter = this.getPath('character.name_change_count');
        this.set('changingName', true);
        var action = AWE.Action.Fundamental.createChangeCharacterNameAction(newName);
        AWE.Action.Manager.queueAction(action, function(status) {
          self.set('changingName', false);
          if (status === AWE.Net.OK) {
            AWE.GS.TutorialStateManager.checkForCustomTestRewards('quest_profile');
            if (changeCounter > 0) {
              AWE.GS.ResourcePoolManager.updateResourcePool();
            }
          }
          else if (status === AWE.Net.CONFLICT) {
            self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameTaken'))
          }
          else if (status === AWE.Net.FORBIDDEN) {
            self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.changeNameCost'))
          }
          else {
            self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.changeNameError'));
          }
        });        
      }
    },
    
    
    firstTwoGenderChange: function() {
      var count = this.getPath('character.gender_change_count');
      return count === undefined || count === null || count < 2;
    }.property('character.gender_change_count'), 
    
    changeGenderPressed: function() {
      var female = this.getPath('character.female');
      var newGender = female ? "male" : "female";
      var self = this;
      var changeCounter = this.getPath('character.gender_change_count');

      this.set('message', null);  
      this.set('changingGender', true);
      
      var action = AWE.Action.Fundamental.createChangeCharacterGenderAction(newGender);
      AWE.Action.Manager.queueAction(action, function(status) {
        self.set('changingGender', false);
        if (status === AWE.Net.OK) {
          if (changeCounter > 0) {
            AWE.GS.ResourcePoolManager.updateResourcePool();
          }
        }
        else if (status === AWE.Net.FORBIDDEN) {
          self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.changeGenderCost'))
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.changeGenderError'));
        }
      });        
    },        
  });  

  module.ProfileInfoView = Ember.View.extend({    
    templateName: 'character-profile-info-view',
    
    character: null,
    
    progressBarPosition: null,
    
    nextMundaneRanks: function() {
      var ranks   = AWE.GS.RulesManager.getRules().character_ranks.mundane;
      var present = this.getPath('character.mundane_rank');
      
      if (present === undefined || present === null) {
        return [];
      }
      
      var infos = [];
      for (var i=present; i < ranks.length; i++) {
        infos.push({
          rule:        ranks[i],
          position:    ranks[i].exp,
          presentRank: i === present,
        });
        if (i !== present && ranks[i].settlement_points > 0) {
          break ;
        }
      }
      
      var maxExp = infos[infos.length-1].position;
      infos.forEach(function(item) {
        item.position = (1.0 - item.position/(1.0*maxExp)) * 100 + "%";
      });
      
      var ownPosition = (1.0 - (this.getPath('character.exp') || 0)/(1.0*maxExp))*100 + "%";
      this.set('progressBarPosition', ownPosition);
      
      return infos;
    }.property('character.mundane_rank').cacheable(),
    
    
  });
  
  module.SettingsView = Ember.View.extend({    
    templateName: 'settings-view',
    
    character: null,

    changingPassword: false,
    
    password:             null,
    passwordConfirmation: null,
    
    time: null,
    
    localTime: null,
    serverTime: null,
    timeLag: null,
    
    
    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.updateClock();
          };
        }(this)), 5000);
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
      this.updateClock();
      this.startTimer();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },
    
    updateClock: function() {
      var now    = new Date();
      var lag    = AWE.GS.TimeManager.estimatedLag();
      var server = AWE.GS.TimeManager.estimatedServerTime();
      
      this.set('localTime', now);
      this.set('serverTime', server);
      this.set('timeLag', Math.floor(lag / 100.0) / 10.0);
    },
    
    isLagTolerable: function() {
      var lag = this.get('timeLag') || 0.0;
      return Math.abs(lag) < 5;
    }.property('timeLag'),
    
    isLagZero: function() {
      return Math.abs(this.get('timeLag') || 0.0) < 0.8;
    }.property('timeLag'),
    
    passwordObserver: function() {
      this.set('changePasswordMessage', '');
    }.observes('password', 'passwordConfirmation'),
            
    changePasswordPressed: function() {
      this.set('changePasswordMessage', '');
      this.set('changingPassword', true);
      
      if (this.get('password') != this.get('passwordConfirmation')) {
        this.set('changingPassword', false);
        this.set('changePasswordMessage', "The two passwords doesn't match. Try again.");
      }
      else {
        var self = this;
        var action = AWE.Action.Fundamental.createChangePasswordAction(this.get('password'));
        AWE.Action.Manager.queueAction(action, function(status) {
          self.set('changingPassword', false);
          if (status === AWE.Net.OK) {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', "Password changed.")
          }
          else if (status === AWE.Net.CONFLICT) {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', "The password doesn't meet the requirements. Please choose a appropriate password.")
          }
          else {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', 'Your password could not be changed for unknown reasons. Please try again later.');
          }
        });
      }        
    },    
  });
      
  return module;  
    
}(AWE.UI.Ember || {}));