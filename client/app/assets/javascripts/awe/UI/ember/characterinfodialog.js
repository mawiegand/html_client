/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.CharacterInfoDialog = module.PopUpDialog.extend({
    templateName: 'character-info-dialog',
    classNames: ['character-info-dialog'],
    
    characterId: null,
    character: null,
    alliance: null,
    homeSettlement: null,
    historyEvents: null,
    
    loadingHistory: false,
    updatingLikes: false,
    
    ownResourcePool: false,
    
    init: function() {
      this._super();     
      this.setAndUpdateCharacter();
      this.setAndUpdateHistory();
      this.setAndUpdateAlliance(); 
      this.setAndUpdateHomeSettlement(); 

      this.set('ownResourcePool', AWE.GS.ResourcePoolManager.getResourcePool());     
    },

    isOwn: function() {
      return this.get("characterId") === AWE.GS.game.getPath('currentCharacter.id');
    }.property(),

    currentCharacterIsAllianceLeader: function() {
      var currentCharacterId = AWE.GS.game.getPath('currentCharacter.id');
      var currentCharacterAllianceId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      if (!currentCharacterId || !currentCharacterAllianceId) {
        return false;
      }
      var currentCharacterAlliance = AWE.GS.AllianceManager.getAlliance(currentCharacterAllianceId);
      return currentCharacterAlliance && currentCharacterId === currentCharacterAlliance.get('leader_id');
    }.property(),
    
    showDescription: function() {
      return $('<div/>').text(this.getPath('character.description')).html().replace(/\n/g, '<br />');
    }.property('character.description'),

    sendUserContentReport: function() {
      var confirmationDialog = AWE.UI.Ember.InfoDialog.create({

        classNames: ['confirmation-dialog'],
      
        controller: this,
        
        heading:    AWE.I18n.lookupTranslation('profile.customization.confirmReport.heading'), 
        message:    AWE.I18n.lookupTranslation('profile.customization.confirmReport.message'),
        
        cancelText: AWE.I18n.lookupTranslation('profile.customization.confirmReport.cancel'),
        okText:     AWE.I18n.lookupTranslation('profile.customization.confirmReport.ok'),
       
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

    closeDialogAndCenter: function() {
      if(WACKADOO.presentScreenController.typeName !== 'MapController')
      {
        WACKADOO.activateMapController(true);
      }

      var mapController = WACKADOO.presentScreenController;
      var target = this.get('homeSettlement');

      WACKADOO.closeAllModalDialogs();
      mapController.setSelectedSettlement(target);
      mapController.centerSettlement(target);
    },

    processUserContentReport: function() {
      var self = this;
      var action = AWE.Action.Fundamental.createUserContentReportAction(this.get('character').getId(), 'character-description', this.get('character').getId());
      AWE.Action.Manager.queueAction(action, function(status) {
        if (status === AWE.Net.OK) {
          self.set('message', AWE.I18n.lookupTranslation('profile.customization.confirmReport.success'));
        }
        else {
          self.set('message', AWE.I18n.lookupTranslation('profile.customization.confirmReport.error'));
        }
      });        
    },
    
    displayLikeSystemButtons: function() {
      return AWE.GS.CharacterManager.getCurrentCharacter() !== this.get('character');
    }.property('character'),
	
    likeAmountText: function() {
        var amount = Math.floor(this.getPath('ownResourcePool.like_amount') || 0);
        return "Noch " + amount + " Likes zu vergeben";
    }.property('ownResourcePool.like_amount'),
    
    dislikeAmountText: function() {
      var amount = Math.floor(this.getPath('ownResourcePool.dislike_amount') || 0);
      return "Noch " + amount + " Dislikes zu vergeben";
    }.property('ownResourcePool.dislike_amount'),
    
    setAndUpdateCharacter: function() {
      var characterId = this.get('characterId');
      var self = this;
      if (!characterId) {
        return ;
      }
      var character = AWE.GS.CharacterManager.getCharacter(characterId);
      this.set('character', character);
      AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('character', result);
      });
    },

    setAndUpdateHistory: function() {
      var characterId = this.get('characterId');
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

    historyEventsList: function(){
      var list = [];
      var historyTypes = this.get('historyEvents');
      AWE.Ext.applyFunction(historyTypes, function(history) {//historyTypes.forEach(function(history) {
        
        var stringDesc = history.localized_description;
        var replacer = new RegExp("=>","g");
        if(stringDesc)
        {
          //history.localized_description that come from server can be string or object          
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
    
    setAndUpdateHomeSettlement: function() {
      var baseLocationId = this.getPath('character.base_location_id');
      var self = this;
      if (!baseLocationId) {
        return ;
      }
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(baseLocationId);
      this.set('homeSettlement', settlement);
      AWE.GS.SettlementManager.updateSettlementsAtLocation(baseLocationId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        log('U: settlement at character.base_location_id', baseLocationId);
        self.set('homeSettlement', AWE.GS.SettlementManager.getSettlementAtLocation(baseLocationId));
      });
    },    
    
    
    basePressed: function(evt) {
      var entry = evt.context;
      var regionId = this.getPath('character.base_region_id');
      var region = AWE.Map.Manager.getRegion(regionId);
      if (region != null) {
        var mapController = WACKADOO.activateMapController(true);
        WACKADOO.closeAllModalDialogs();
        mapController.centerRegion(region);
      }
      else {
        AWE.Map.Manager.fetchSingleRegionById(regionId, function(region) {
          var mapController = WACKADOO.activateMapController(true);
          WACKADOO.closeAllModalDialogs();
          mapController.centerRegion(region);
        });
      }
    }, 
    
    characterIdObserver: function() {
      this.setAndUpdateCharacter();
      this.setAndUpdateHistory();
    }.observes('characterId'),
    
    allianceIdObserver: function() {
      this.setAndUpdateAlliance();
    }.observes('character.alliance_id'),    
    
    baseLocationIdObserver: function() {
      this.setAndUpdateHomeSettlement();
    }.observes('character.base_location_id'),
    
    okClicked: function() {
      this.destroy();
    },

    openAlliance: function() {
      WACKADOO.showAllianceDialog(this.getPath("alliance.id"));
    },
    
    sendLike: function() {
      var characterId = this.get('characterId');
      var self = this;
      if (!characterId) {
        return ;
      }
      this.set('updatingLikes', true);
      AWE.Action.Fundamental.createSendLikeAction(characterId).send(function(status, data) {
        AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
          self.set('updatingLikes', false);
        });
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
          AWE.GS.ResourcePoolManager.updateResourcePool(); // trigger immediately to update mouse-over          
        }
        else if(status === AWE.Net.CONFLICT)
        {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            message:             AWE.I18n.lookupTranslation('likesystem.alreadyLikedInfo'),
            okText:              AWE.I18n.lookupTranslation('likesystem.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else if (status === AWE.Net.NOT_FOUND) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            message:             AWE.I18n.lookupTranslation('likesystem.notEnoughLikeAmount'),
            okText:              AWE.I18n.lookupTranslation('likesystem.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else // handle unexpected error
        {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
      });
    },
    
    sendDislike: function() {
      var characterId = this.get('characterId');
      var self = this;
      if (!characterId) {
        return ;
      }
      this.set('updatingLikes', true);
      AWE.Action.Fundamental.createSendDislikeAction(characterId).send(function(status, data) {
        AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
          self.set('updatingLikes', false);
        });
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
          AWE.GS.ResourcePoolManager.updateResourcePool(); // trigger immediately to update mouse-over          
        }
        else if(status === AWE.Net.CONFLICT)
        {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            message:             AWE.I18n.lookupTranslation('likesystem.alreadyLikedInfo '),
            okText:              AWE.I18n.lookupTranslation('likesystem.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else if (status === AWE.Net.NOT_FOUND) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            message:             AWE.I18n.lookupTranslation('likesystem.notEnoughDislikeAmount '),
            okText:              AWE.I18n.lookupTranslation('likesystem.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else // handle unexpected error
        {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
        }
      });
    },
    
    sendMessageClicked: function() {
    //alert("Hello Mail click!!!!");
    var character = this.get('character');
    if(!character)
    {
    	return false;
    }
    WACKADOO.closeAllModalDialogs();
    WACKADOO.activateMessagesController({ recipient: character });
    
    return false;// prevent default behavior
    },

    sendAllianceInvitation: function() {
      var confirmationDialog = AWE.UI.Ember.InfoDialog.create({
        classNames: ['confirmation-dialog'],

        controller: this,

        heading:    AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.heading'),
        message:    AWE.I18n.lookupTranslation('alliance.confirmAllianceCharacterInvite.message').format(this.getPath('character.name')),

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

    processSendAllianceCharacterInvite: function() {
      var self = this;
      var characterInviteName = this.getPath('character.name');
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
    
    // settlementPressed: function() {
      // var regionId = this.getPath('character.base_region_id');
      // log('-----> region', regionId);
      // var region = AWE.Map.Manager.getRegion(regionId);
      // if (region != null) {
        // log('-----> region vorhanden');
        // var mapController = WACKADOO.activateMapController(true);
        // WACKADOO.closeAllModalDialogs();
        // mapController.centerRegion(location);
      // }
      // else {
        // log('-----> region nicht vorhanden');
        // AWE.Map.Manager.fetchSingleRegionById(this.getPath('character.base_region_id'), function(region) {
          // log('-----> region geholt');
          // var mapController = WACKADOO.activateMapController(true);
          // WACKADOO.closeAllModalDialogs();
          // mapController.centerRegion(region);
        // });
      // }
    // },    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




