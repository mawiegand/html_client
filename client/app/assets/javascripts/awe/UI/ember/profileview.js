/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 *          Marcel Wiegand <marcel@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
//NEW DIALOGS START
/**
   * @class
   *
   * View that allows the user to edit his profile.
   *   
   * @name AWE.UI.Ember.ProfileView 
   */
  module.ProfileNewView = module.PopUpDialog.extend( /** @lends AWE.UI.Ember.ProfileView# */ {
    templateName: 'character-new-profile-view',
    
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

    closeDialogAndCenter: function() {

      if(WACKADOO.presentScreenController.typeName === 'MapController')
      {
        var mapController = WACKADOO.presentScreenController;
        var locationID = this.getPath('character.base_location_id');
        mapController.centerLocation(AWE.Map.Manager.getLocation(locationID));
      }

      var self = this;
          var action = AWE.Action.Fundamental.createChangeAvatarAction(self.getPath('character.avatar_string'));

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

    closeDialog: function() {

      var self = this;
          var action = AWE.Action.Fundamental.createChangeAvatarAction(self.getPath('character.avatar_string'));

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
      this._super();
    },
  });

module.ProfileNewTabView = module.TabViewNew.extend({

    character: null,
    alliance:  null,
    allianceMember: null,

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: "Info", 
         view:  module.ProfileNewInfoView.extend({ 
            characterBinding: "parentView.parentView.character", 
            allianceBinding:  "parentView.parentView.alliance", 
          }),
         buttonClass: "left-menu-button"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: "Rank", 
         view:  module.ProfileNewRangView.extend({ 
            characterBinding: "parentView.parentView.character", 
            allianceBinding:  "parentView.parentView.alliance", 
          }),
         buttonClass: "middle-menu-button"
       },
       { key:   "tab3",
         title: "Customize", 
         view: module.ProfileNewCustomizeView.extend({ 
            characterBinding: "parentView.parentView.character", 
            allianceBinding:  "parentView.parentView.alliance", 
          }),
         buttonClass: "right-menu-button"
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

module.ProfileNewInfoView  = Ember.View.extend ({
   
    templateName: 'profile-info-tab1-view',
    
    character: null,
    alliance:  null,

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

    changeDescriptionPressed: function() {
      //debugger
     // this.setPath('character.avatar_string', 'f1010101100002');
      this.processNewDescription(this.getPath('character.description'));
    },

    historyEvents: null,
    
    loadingHistory: false,
    
    characterObserver: function() {   
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
    test: function(){
      //"{"de_DE"=>"ertewrzt", "en_US"=>"wetzewzwe"}"
     return /*this.get('historyEvents')[0].get('localized_description');*/{
      de_DE : "ertewrzt",
      en_US : "wetzewzwe"
      }
    }.property().cacheable(),


    historyEventsList: function(){
      var list = [];
      var historyTypes = this.get('historyEvents');
      AWE.Ext.applyFunction(historyTypes, function(history) {//historyTypes.forEach(function(history) {
        
        var stringDesc = history.localized_description;
        var replacer = new RegExp("=>","g");
        if(stringDesc)
        {

          if (typeof stringDesc == 'string' || stringDesc instanceof String)
          {
            var stringJson = stringDesc.replace(replacer, ":");
            var jsonObj = JSON.parse(stringJson);
          }
          else
          {
             var jsonObj = stringDesc;
          }
          

          list.push(Ember.Object.create({
                desc: jsonObj,
                
              }));
        }
      });
      return list;
    }.property().cacheable(),

    //tutorial
    customizeButtonUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_PROFILE);
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

   });
   
module.ProfileNewRangView  = Ember.View.extend  ({
   
    templateName: 'profile-rank-tab2-view',

    character: null,
    alliance:  null,

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
      var minExp = infos[0].position;

      if(minExp > this.getPath('character.exp'))//prevent wrong progress on lvl 1
        minExp = 0;

      infos.forEach(function(item) {
        item.position = (1.0 - item.position/(1.0*maxExp)) * 100 + "%";
      });
      
      var ownPosition = (((this.getPath('character.exp') - minExp)*100)/(maxExp - minExp));

      if(ownPosition < 0)//prevent negative progress
        ownPosition = 0;

      var ownCustomOwnProgress =  parseInt(ownPosition) + "%";
      //(1.0 - (this.getPath('character.exp') || 0)/(1.0*maxExp))*100 + "%";
      this.set('progressBarPosition', ownCustomOwnProgress);
      
      this.set('maxExp', maxExp);
      return infos;
    }.property('character.exp').cacheable(),

    currentMundaneRank: function(){
      var rank = this.getPath('character.mundane_rank');
      if(rank < 1)
        return 1;
      else
        return rank + 1;
    }.property('character.exp').cacheable(),

    nextMundaneRank: function(){
      var ranks = this.get('nextMundaneRanks');
      return ranks[ranks.length - 1];
    }.property('character.exp').cacheable(),

    nextDisplayRank: function(){
      return (this.get("nextMundaneRank").rule.id + 1);
    }.property('nextMundaneRank'),

    barWidth: function(){
      this.get('nextMundaneRanks');
      return "background-size: "+ this.get('progressBarPosition') + " 100%";
    }.property().cacheable(),

   });

  
   
module.ProfileNewCustomizeView  = Ember.View.extend  ({
   
    templateName: 'profile-customize-tab3-view',

    character: null,
    alliance:  null,
    changedInput: null,

    changingName:     false,
    changingGender:   false,

    dirArrow: 1,
    topArrow: 60,
    leftArrow: 220,

    //isGenderM: true,
    changeGenderPressed: function() {
        if(this.get('firstTwoGenderChange'))
        {
          this.changeGenderPressedOld();
        }
        else
        {
            var that = this;
              var confirmationDialog = AWE.UI.Ember.InfoDialog.create({

              classNames: ['confirmation-dialog'],

              //change gender on OK
              genderChangeCosts: that.get("genderChangeCosts"),

              character: that.get("character"),
              heading:    AWE.I18n.lookupTranslation('profile.customization.changeGender'), 
              message:    AWE.I18n.lookupTranslation('profile.customization.changeGenderCaption') + " " + this.get('genderChangeCosts') + " " + AWE.I18n.lookupTranslation('profile.customization.customToads'),
              
              cancelText: AWE.I18n.lookupTranslation('alliance.confirmReport.cancel'),
              okText:     AWE.I18n.lookupTranslation('alliance.confirmReport.ok'),
             
              changeGenderPressedOld: that.get("changeGenderPressedOld"),

              okPressed: function() {
                this.changeGenderPressedOld();
                this.destroy();
              },
              
              cancelPressed: function() { this.destroy(); },
              
            });
            WACKADOO.presentModalDialog(confirmationDialog);
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
    
    changeGenderPressedOld: function() {

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

    toggleTopStyle: function(){

      if(this.getPath('character.gender') === "male")
      {
        return "toggle-on";
      }
      else
      {
        return "toggle-off";
      }

    }.property('character.gender').cacheable(),

    toggleBottomStyle: function(){

      if(this.getPath('character.gender') === "male")
      {
        return "toggle-off";
      }
      else
      {
        return "toggle-on";
      }

    }.property('character.gender').cacheable(),

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
      this.processNewName(this.getPath('changedInput'));      
    },
    

    processNewName: function(newName) {
      
      if (!newName || newName.length < 3) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameTooShort'));
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: this.get("message"),
              });
        WACKADOO.presentModalDialog(errorDialog);
      }
      else if (!newName || newName.length > 12) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameTooLong'));
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: this.get("message"),
              });
        WACKADOO.presentModalDialog(errorDialog);
      }
      else if (newName === this.getPath('character.name')) {
        this.set('message', AWE.I18n.lookupTranslation('profile.customization.errors.nameNoChange'));
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: this.get("message"),
              });
        WACKADOO.presentModalDialog(errorDialog);
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
            return;  
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
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('profile.customization.errors.changeFailed.heading'),
                message: self.get("message"),
              });
          WACKADOO.presentModalDialog(errorDialog);
        });     
      }
    },

     customizeButtonUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_PROFILE);
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

   });

module.ProfileNewCustomizeSettingsView  = Ember.View.extend  ({
   
    templateName: 'profile-customize-settings-view',

    character: null,
    alliance:  null,
    isMale: function()
    {
      if(this.getPath('character.gender') === "male")
        return true;
      else
        return false;
    }.property('character.gender'),

    changeAvatarString: function(avatarPart, isNext){
      var avatarString = this.getPath('character.avatar_string');
      var gender = (avatarString.charAt(0) == 'm' ? 'male' : 'female');
      var parts = AWE.GS.RulesManager.getRules().avatar_config[gender];
      var currentPart = null;
      var maxCount = null;
      var numChars = null;
      var charOffset = null;
      var isOptional = null;

      for(part in parts) { 
        if(part === avatarPart)
        {
          currentPart = parts[part];
          maxCount = parts[part].max + 1;
          numChars = parts[part].num_chars;
          isOptional = parts[part].optional;
          charOffset = this.getPath('character.avatar_obj.avatar_rules.offset')[part];
        }
      }

      var partValue = parseInt(avatarString.substring(charOffset, charOffset + numChars));

      if(isNext)//check next or previous
      {
        partValue = (partValue + 1)%maxCount;
        //check if optional, don't show 0 part if optional false
        if(!isOptional && partValue === 0)
        {
          partValue = (partValue + 1)%maxCount;
        }
      }
      else
      {
        partValue = (partValue - 1)%maxCount;
        if(partValue < 0)//don't use negative
          partValue = maxCount - 1;
        //check if optional, don't show 0 part if optional false
        if(!isOptional && partValue === 0)
        {
          partValue = (partValue - 1)%maxCount;
          if(partValue < 0)//don't use negative
            partValue = maxCount - 1;
        }
      }

      var newAvatarString = avatarString.substring(0, charOffset) + this.numString(partValue, numChars) + avatarString.substring(charOffset+numChars);
      this.setPath('character.avatar_string', newAvatarString);
      //debugger
    },

    numString: function(n,numC){
      if(numC > 1)
        return n > 9 ? "" + n: "0" + n;
      else
        return "" + n;
},

    changeEyesPressedLeft: function() {
      
      this.changeAvatarString("eyes", false);
    },

    changeEyesPressedRight: function() {
      
      this.changeAvatarString("eyes", true);
    },

    changeMouthPressedLeft: function() {
      
      this.changeAvatarString("mouths", false);
    },

    changeMouthPressedRight: function() {
      
      this.changeAvatarString("mouths", true);
    },

    changeTattoosPressedLeft: function() {
      
      this.changeAvatarString("tattoos", false);
    },

    changeTattoosPressedRight: function() {
      
      this.changeAvatarString("tattoos", true);
    },

    changeHairPressedLeft: function() {
      
      this.changeAvatarString("hairs", false);
    },

    changeHairPressedRight: function() {
      
      this.changeAvatarString("hairs", true);
    },

    changeBeardPressedLeft: function() {
      if(this.get('isMale'))
        this.changeAvatarString("beards", false);
      else
        this.changeAvatarString("chains", false);
    },

    changeBeardPressedRight: function() {
      
      if(this.get('isMale'))
        this.changeAvatarString("beards", true);
      else
        this.changeAvatarString("chains", true);

    },

    changeSymbolsPressedLeft: function() {
      
      this.changeAvatarString("veilchens", false);
    },

    changeSymbolsPressedRight: function() {
      
      this.changeAvatarString("veilchens", true);
    },

   });

module.ProfileDescriptionTextarea = Ember.TextArea.extend({

  character: null,
  placeholder : function () {
      if(this.getPath('character.discription'))
      {
        return $('<div/>').text(this.getPath('character.description')).html().replace(/\n/g, '<br />');
      }
      else
      {
        return AWE.I18n.lookupTranslation('profile.customization.missingDescription');
      }
    }.property('character.description'),

  });

module.UserNameTextfield = Ember.TextField.extend({
    //classNames: ["create-army-dialog-name"],
    valueBinding: Ember.Binding.oneWay("parentView.character.name"),
    changedInput: null,
    updateChangedInput: function()
    {

      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_PROFILE))
      {
        if(this.getPath('parentView.character.name') != this.get('value'))
        {
          this.setPath('parentView.dirArrow', 0);
          this.setPath('parentView.topArrow', 182);
          this.setPath('parentView.leftArrow', 390); 
        }
        else
        {
          this.setPath('parentView.dirArrow', 1);
          this.setPath('parentView.topArrow', 60);
          this.setPath('parentView.leftArrow', 220);
        }
      }
      //return tutorialState.isUIMarkerActive(AWE.GS.MARK_PROFILE);

      this.set('changedInput', this.get('value'));
    }.observes('value'),
  });

//NEW DIALOGS END


  
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
      var self = this;
      this.set('connectFacebookMessage', '');
      
      AWE.Log.Debug('FACEBOOK: connect to fb pressed');
      AWE.Facebook.connnectCharacter(AWE.GS.game.getPath('currentCharacter'), function()
      {
        AWE.Log.Debug('FACEBOOK: connected to fb.');
      },
      function(status) {
        if (status == 'loginBreak') {
          AWE.Log.Debug('FACEBOOK: could not sign in to facebook.');
        }
        else if (status == AWE.Net.CONFLICT) {
          AWE.Log.Debug('FACEBOOK: facebook user is already connected to another character.');
          self.set('connectFacebookMessage', AWE.I18n.lookupTranslation('profile.settings.fbUserIdAlreadyInUse'));
        }
        else if (status == AWE.Net.FORBIDDEN) {
          AWE.Log.Debug('FACEBOOK: character is already connected to another facebook user.');
          self.set('connectFacebookMessage', AWE.I18n.lookupTranslation('profile.settings.characterAlreadyConnected'));
        }
        else {
          AWE.Log.Debug('FACEBOOK: unkown error.');
          self.set('connectFacebookMessage', AWE.I18n.lookupTranslation('profile.settings.connectionDidFail'));
        }
      });
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
  
  module.MovingView = module.PopUpDialog.extend({
    classNames: ['moving-dialog'],
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

    presentRegionNotFoundMessage: function(){
      this.set('moving', false);
      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('profile.moving.movingNoTargetFoundHeading'),
        message: AWE.I18n.lookupTranslation('profile.moving.movingNoTargetFoundMessage'),
      });
      WACKADOO.closeAllModalDialogs(); // HACK, REMOVE! bring new dialog to front!
      WACKADOO.presentModalDialog(dialog);
    },
    
    displayRegion: function(regionName, callback) {
      var self = this;
      if(regionName){
        AWE.Map.Manager.fetchSingleRegionById(regionName, function(region) {
          if (region.id() == 0) {
            self.set('moving', false);
            self.presentRegionNotFoundMessage();
          }
          else {
            var mapController = WACKADOO.activateMapController(true);
            WACKADOO.closeAllModalDialogs();
            mapController.centerRegion(region);
            if (callback) callback(region);
          }
        });
      }else{
        self.presentRegionNotFoundMessage();
      }
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
          var passwordDialog = AWE.UI.Ember.InfoDialog.create({
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
