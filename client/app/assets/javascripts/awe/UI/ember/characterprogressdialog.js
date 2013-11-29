/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.CharacterProgressDialog = module.Dialog.extend({
    templateName: 'character-progress-dialog',

    posting: false,
    
    character: null,
        
    okClicked: function() {
      this.destroy();
    },
    
    
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

    userStoriesEnabled: function() {
      return AWE.GS.RulesManager.getRules().app_control.facebook_user_stories == 1;
    }.property(),

    postNextLevelToFacebook: function() {
      var self = this;
      self.set('posting', true);
      AWE.Facebook.postUserStory('user_story_reached_next_level', function() {
        self.set('posting', false);
        AWE.Log.Debug('User Story sent');
        var dialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('facebook.nextLevel.success.header'),
          message: AWE.I18n.lookupTranslation('facebook.nextLevel.success.message'),
        });
        WACKADOO.presentModalDialog(dialog);
      }, function(error) {
        self.set('posting', false);
        AWE.Log.Debug('User Story not sent', error);
        var dialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('facebook.nextLevel.error.header'),
          message: AWE.I18n.lookupTranslation('facebook.nextLevel.error.message'),
        });
        WACKADOO.presentModalDialog(dialog);
      });
    },
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




