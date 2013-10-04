/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 *          Marcel Wiegand <marcel@5dlab.com>
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
          title: AWE.I18n.lookupTranslation('profile.progressTab'), 
          view:  AWE.UI.Ember.ProfileInfoView.extend({ 
            characterBinding: "parentView.parentView.character", 
            allianceBinding:  "parentView.parentView.alliance", 
          })
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
          title: AWE.I18n.lookupTranslation('profile.customizationTab'), 
          view:  AWE.UI.Ember.CharacterCustomizationView.extend({ 
            characterBinding: "parentView.parentView.character"
          })
        },
        { key:   "tab3",
          title: AWE.I18n.lookupTranslation('profile.optionsTab'), 
          view:  AWE.UI.Ember.SettingsView.extend({ 
            characterBinding: "parentView.parentView.character"
          })
        },
        { key:   "tab4",
          title: AWE.I18n.lookupTranslation('profile.movingTab'),
          view:  AWE.UI.Ember.MovingView.extend({
            characterBinding: "parentView.parentView.character"
          })
        }
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
    allianceMember: null,

    onClose:   null,
    
    // FIXME hack for users that have already changed their name before reached the appropriate quest 
    characterObserver: function() {
      var characterId = this.getPath('character.id') || null;
      if (characterId && this.getPath('character.name_change_count') > 0) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_profile');
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
    
    changeAvatarPressed: function() {
      /* AWE.Action is just too damn complex for just a simple
       * GET-Action... */
      this.set('message', null);

      var changeDialog = AWE.UI.Ember.ChangeAvatarDialog.create({
        classNames: ['change-avatar-dialog'],
        heading: AWE.I18n.lookupTranslation('profile.customization.changeAvatarDialogCaption'),
        controller: this,
        newAvatarString: null,

        getNewAvatarString: function() {
          var self = this;
          var action = AWE.Action.Fundamental.getNewAvatarAction();

          AWE.Action.Manager.queueAction(action, function(statusCode, jqXHR) {
            var parent = self;
            if(statusCode == 200) {
              var response = jQuery.parseJSON(jqXHR.responseText);
              self.set('newAvatarString', response.avatar_string);
            } 
            else {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.text'),
              });
              WACKADOO.presentModalDialog(errorDialog);
              self.destroy();
            }
          });
        },

        init: function() {
          this._super();
          this.getNewAvatarString();
        },

        okPressed: function() {
          var self = this;
          var action = AWE.Action.Fundamental.createChangeAvatarAction(self.get('newAvatarString'));

          AWE.Action.Manager.queueAction(action, function(statusCode) {
            if(statusCode == 200) {
              AWE.GS.CharacterManager.updateCurrentCharacter();
              self.destroy();
            }
            else {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.text'),
              });
              WACKADOO.presentModalDialog(errorDialog);
            }
          });
        },
        
        shufflePressed: function() {
          this.getNewAvatarString();
        },

        cancelPressed: function() {
          this.destroy();
        },
      });
      WACKADOO.presentModalDialog(changeDialog);

      //
      //----------------------------
      //

    },

    changeDescriptionPressed: function() {
      var changeDialog = AWE.UI.Ember.TextAreaInputDialog.create({
        heading: AWE.I18n.lookupTranslation('profile.customization.changeDescriptionDialogCaption'),
        placeholderText: AWE.I18n.lookupTranslation('profile.customization.description'),
        input: this.getPath('character.description'),
        rowsSize: 10,
        colsSize: 82,
        inputMaxLength: AWE.Config.DESCRIPTION_MAX_LENGTH,
        controller: this,
        classNames: ['character-description'],

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
      return $('<div/>').text(this.getPath('character.description')).html().replace(/\n/g, '<br />');
    }.property('character.description'),

    processNewDescription: function(newDescription) {
      var self = this;
      var action = AWE.Action.Fundamental.createChangeCharacterDescriptionAction(newDescription);
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          self.set('message', null);
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.changeDescriptionError'));
        }
      });        
		},

    nameChangeCosts: function() {
      return AWE.GS.RulesManager.getRules().change_character_name.amount;
    }.property().cacheable(),
    
    nameChangeResource: function() {
      var resourceId = AWE.GS.RulesManager.getRules().change_character_name.resource_id;
      return AWE.GS.RulesManager.getRules().getResourceType(resourceId).symbolic_id;
    }.property().cacheable(),
    
    firstTwoNameChange: function() { 
      var count = this.getPath('character.name_change_count');
      return count === undefined || count === null || count < AWE.GS.RulesManager.getRules().change_character_name.free_changes;
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
            AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_profile');
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

    genderChangeCosts: function() {
      return AWE.GS.RulesManager.getRules().change_character_gender.amount;
    }.property().cacheable(),

    genderChangeResource: function() {
      var resourceId = AWE.GS.RulesManager.getRules().change_character_gender.resource_id;
      return AWE.GS.RulesManager.getRules().getResourceType(resourceId).symbolic_id;
    }.property().cacheable(),

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
    
    character:           null,
    historyEvents: null,
    
    loadingHistory: false,
    
    showProgressBar: function() {
      var exp = this.getPath('character.exp');
      return exp && exp > 1000; // hack to prevent layout errors. number must go to config
    }.property('character.exp').cacheable(),
    
    characterObserver: function() {
      var characterId = this.getPath('character.id') || null;
      if (characterId && this.getPath('character.name_change_count') > 0) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_profile');
      }       
      this.setAndUpdateHistory();
    }.observes('character.id'),
    
    setAndUpdateHistory: function() {
      var characterId = this.getPath('character.id');
      var self = this;
      if (!characterId) {
        return ;
      }
      this.set('loadingHistory', true);
      AWE.GS.HistoryEventManager.updateHistoryEventsOfCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('loadingHistory', false);
        self.set('historyEvents', AWE.GS.HistoryEventManager.getHistoryEventsOfCharacter(characterId));
      });
    },
  });
  
  module.SettingsView = Ember.View.extend({    
    templateName: 'settings-view',
    
    character: null,

    changingPassword: false,
    changingSameIP: false,
    
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
            
    changeSameIPPressed: function() {
      var self = this;
      self.set('changingSameIP', true);
      var action = AWE.Action.Fundamental.createChangeCharacterSameIPAction(this.getPath('character.same_ip'));
      AWE.Action.Manager.queueAction(action, function(status) {
        self.set('changingSameIP', false);
        if (status === AWE.Net.OK) {
          self.set('changeSameIPMessage', AWE.I18n.lookupTranslation('profile.customization.changeSameIIPChanged'))
        }
        else {
          self.set('changeSameIPMessage', AWE.I18n.lookupTranslation('profile.customization.errors.changeSameIIUnknown'));
        }
      });
    },    

    changePasswordPressed: function() {
      this.set('changePasswordMessage', '');
      this.set('changingPassword', true);
      
      if (this.get('password') != this.get('passwordConfirmation')) {
        this.set('changingPassword', false);
        this.set('changePasswordMessage', AWE.I18n.lookupTranslation('profile.customization.errors.changePasswordNoMatch'));
      }
      else {
        var self = this;
        var action = AWE.Action.Fundamental.createChangePasswordAction(this.get('password'));
        AWE.Action.Manager.queueAction(action, function(status) {
          self.set('changingPassword', false);
          if (status === AWE.Net.OK) {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', AWE.I18n.lookupTranslation('profile.customization.changePasswordChanged'))
          }
          else if (status === AWE.Net.CONFLICT) {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', AWE.I18n.lookupTranslation('profile.customization.errors.changePasswordInvalid'))
          }
          else {
            self.set('password', '');
            self.set('passwordConfirmation', '');
            self.set('changePasswordMessage', AWE.I18n.lookupTranslation('profile.customization.errors.changePasswordUnknown'));
          }
        });
      }        
    },
    
    connectFacebookPressed: function() {
      AWE.Log.Debug('FACEBOOK: connect to fb pressed');
      AWE.Facebook.connnectCharacter(AWE.GS.game.getPath('currentCharacter'));
    },   
  });

  /** 
   * @class
   * @name AWE.UI.Ember.ChangeAvatarDialog
   */
  module.ChangeAvatarDialog = module.Dialog.extend({
    templateName: 'avatar-change-dialog',
    heading: 'set a heading',
    inputMaxLength: null,
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    shufflePressed: function() { alert ('Action not connected: shufflePressed.'); },
    cancelPressed: function() { alert ('Action not connected: cancelPressed.'); },
  }); 

  
  module.CharacterProgressBarView = Ember.View.extend({    
    templateName: 'character-progress-bar-view',
    
    character:           null,
    allianceMembers:     null,
    
    progressBarPosition: null,
    
    maxExp:              null,
        
    nextMundaneRanks: function() {
      var ranks   = AWE.GS.RulesManager.getRules().character_ranks.mundane;
      var present = this.getPath('character.mundane_rank');
      
      if (present === undefined || present === null) {
        return [];
      }
      
      var infos = [];
      for (var i=Math.max(present,1); i < ranks.length; i++) { // don't display first rank (Zero Experience)
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
      
      this.set('maxExp', maxExp);
      
      return infos;
    }.property('character.exp').cacheable(),
    
    friendProgress: function() {
      var maxExp      = this.get('maxExp');
      var members     = this.get('allianceMembers');
      var characterId = this.getPath('character.id');
      
      if (!maxExp || !members) {
        return null;
      }
      
      var infos = [];
      var prevPos  = null;
      var prevLine = null;
      members.filter(function(character) {
        return character.get('exp') > 1000.0 && character.get('id') !== characterId;
      }).sort(function(a,b) {
        return a.get('exp') - b.get('exp');
      }).forEach(function(character) {
        var exp = character.get('exp') || 0;
        var position = Math.max(0, 1.0 - exp / (1.0*maxExp));
        var line = 0;
        
        if (prevPos && Math.abs(position-prevPos) < 0.10) {
          line = (prevLine + 1) % 7;
        }

        infos.push({
          name:     character.get('name'),
          position: position * 100 + "%",
          height:   11 * (line+1),
          margin:   11 * line,
        });
        prevPos  = position;
        prevLine = line;
      });
            
      return infos;
    }.property('allianceMembers.@each.exp', 'maxExp').cacheable(),
    
    allianceObserver: function() {

      var allianceId = this.getPath('alliance.id');

      if (!allianceId) { 
        this.set('allianceMembers', null);
        return ; 
      }
      var members = AWE.GS.CharacterManager.getEnumerableMembersOfAlliance(allianceId);
      if ((!members || members.length == 0) ||
          (members && AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime())) { // have alliance id, but no corresponding alliance
        var self = this;
        AWE.GS.CharacterManager.updateMembersOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
          var members = AWE.GS.CharacterManager.getEnumerableMembersOfAlliance(allianceId);
          self.set('allianceMembers', members);
        });
      }
      else {
        this.set('allianceMembers', members);   
      }
    }.observes('alliance.id'),  
        
  });  
  
  module.MovingView = Ember.View.extend({
    templateName: 'moving-view',
    
    character: null,
    homeRegion: null,
    newRegionName: null,
    
    moving: false,

    alreadyMoved: function() {
      return AWE.GS.game.getPath('currentCharacter.moved_at') != null;
    }.property('AWE.GS.game.currentCharacter.moved_at').cacheable(),
    
    init: function() {
      this._super();
      this.setAndUpdateHomeRegion();
    },
    
    setAndUpdateHomeRegion: function() {
      var regionId = this.getPath('character.base_region_id');
      var region = AWE.Map.Manager.getRegion(regionId);
      this.set('homeRegion', region);
    },
    
    baseRegionIdObserver: function() {
      this.setAndUpdateHomeRegion();
    }.observes('character.base_region_id'),
    
    homeRegionName: function() {
      return this.homeRegion.name();
    }.property(),
    
    displayRegion: function(regionName, callback) {
      var self = this;
      AWE.Map.Manager.fetchSingleRegionById(regionName, function(region) {
        if (region.id() == 0) {
          self.set('moving', false);
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingNoTargetFoundHeading'),
            message: AWE.I18n.lookupTranslation('profile.moving.movingNoTargetFoundMessage'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else {
          var mapController = WACKADOO.activateMapController(true);
          WACKADOO.closeAllModalDialogs();
          mapController.centerRegion(region);
          if (callback) callback(region);
        }
      });
    },
    
    moveToRegion: function(oldRegion, newRegion, password) {
      var action = AWE.Action.Settlement.createMoveSettlementToRegionAction(newRegion.name(), password);
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          // aktualisieren
          AWE.Map.Manager.updateNode(oldRegion.node(), true, function(node) {
            AWE.Map.Manager.updateRegionForNode(node, function (region) {
              AWE.Map.Manager.fetchLocationsForRegion(region, function() {
                WACKADOO.mapScreenController.setModelChanged();
                WACKADOO.mapScreenController.setMaptreeChanged();
              });
            });
          });
          // character
          AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
            var region = AWE.Map.Manager.getRegion(newRegion.id());
            AWE.Map.Manager.updateNode(region.node(), true, function(node) {
              var currentCharacter = AWE.GS.game.get('currentCharacter');
              currentCharacter.set('base_node', node);
              AWE.Map.Manager.updateRegionForNode(node, function (region) {
                AWE.Map.Manager.fetchLocationsForRegion(region, function() {
                  WACKADOO.mapScreenController.setModelChanged();
                  WACKADOO.mapScreenController.setMaptreeChanged();
                });
              });
            });
          });
          // ggf. artefakt
          // garrison army
          AWE.GS.ArmyManager.updateArmiesInRegion(newRegion.id(), null, function() {
            WACKADOO.mapScreenController.setModelChanged();
          });
        }
        else if (status === AWE.Net.CONFLICT) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingErrorHeading'),
            message: AWE.I18n.lookupTranslation('profile.moving.movingConflictMessage'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingErrorHeading'),
            message: AWE.I18n.lookupTranslation('profile.moving.movingForbiddenMessage'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else if (status === AWE.Net.NOT_FOUND) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingErrorHeading'),
            message: AWE.I18n.lookupTranslation('profile.moving.movingNotFoundMessage'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingErrorHeading'),
            message: AWE.I18n.lookupTranslation('profile.moving.movingError'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
      });
    },
    
    moveToRegionClicked: function() {
      var self = this;
      self.set('message', null);
      self.set('moving', true);
      var newRegionName = self.get('newRegionName');
      var oldRegion = self.getPath('character.baseRegion');
      self.displayRegion(newRegionName, function(newRegion) {
        var password = '';
        if (!newRegion.isOwnedByNpc() && self.getPath('character.alliance_id') !== newRegion.allianceId()) {
          var passwordDialog = AWE.UI.Ember.TextInputDialog.create({
            heading: AWE.I18n.lookupTranslation('profile.moving.movingPasswordCaption'),
            controller: self,
            okPressed: function() {
              password = this.getPath('input');
              self.moveToRegion(oldRegion, newRegion, password);
              this.destroy();
            },
            cancelPressed: function() {
              this.destroy();
            },
          });
          WACKADOO.presentModalDialog(passwordDialog);
        }
        else {
          var confirmationDialog = AWE.UI.Ember.Dialog.create({
            templateName: 'info-dialog',
            classNames: ['confirmation-dialog'],
            heading: AWE.I18n.lookupTranslation('profile.moving.confirmation.caption'),
            message: AWE.I18n.lookupTranslation('profile.moving.confirmation.message1') + newRegion.name() + AWE.I18n.lookupTranslation('profile.moving.confirmation.message2'),
            cancelText: AWE.I18n.lookupTranslation('profile.moving.confirmation.cancel'),
            okText: AWE.I18n.lookupTranslation('profile.moving.confirmation.ok'),
            okPressed: function() {
              self.moveToRegion(oldRegion, newRegion, '');
              this.destroy();
            },
            cancelPressed: function() {
              this.destroy();
            }
          });
          WACKADOO.presentModalDialog(confirmationDialog);
        }
      });
    },
  });
      
  return module;  
    
}(AWE.UI.Ember || {}));
