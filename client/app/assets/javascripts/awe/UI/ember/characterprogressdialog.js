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
    
    didInsertElement: function() {
    
      var popupAnimations2 = this.get('popupAnimations');
      //var compressedVersion = $(window).width() < 1024; // that's not a good option! may run in window / frame / div
      var self = this;
      
      console.log("meh");
      
      //if (popupAnimations2) {
          
          console.log("mehhh");
          
          if($(window).width() < 1024){
            self.$(".level-up-dialog-bg").delay(0).animate({
              width: '460px',
              height: '304px',    
              left: '-198px',
              top: '-140px'
            },{
              duration: 700,
              easing: 'easeOutElastic'
            });
            
            self.$(".level-up-dialog-bg-text").delay(700).animate({
              fontSize: '65%',
              top: '18%',
            },{
              duration: 0
            });
            
          }
          else{
            self.$(".level-up-dialog-bg").delay(0).animate({
              width: '800px',
              height: '524px',
              left: '-350px',
              top: '-229px'
            },{
              duration: 700,
              easing: 'easeOutElastic'
            });
          };
          
          
          //Text wird sichtbar
          self.$(".level-up-dialog-bg-text").delay(700).animate({
            opacity: 1
          },{
            duration: 50
          });
          
          
          //Amazone springt
          self.$(".level-up-girl").delay(700).animate({
              opacity: 1,
              top: '-84%'
          },{
            duration: 300,
            easing: 'easeOutSine'
          });
          
          self.$(".level-up-girl").delay(0).animate({
              top: '-66%'
          },{
            duration: 250,
            easing: 'easeInQuart'
          });
          
          //Scip Button pops up
          self.$(".level-up-scip-button").delay(1400).animate({
            width: '21.5%',
            height: '24.4%',
            left: '74%',
            top: '80%'
          },{
            duration: 100,
            easing: 'easeOutBack'
          });
     // } 
      
    }
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




