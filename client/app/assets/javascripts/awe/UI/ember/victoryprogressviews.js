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

  module.AllianceVictoryView = Ember.View.extend({
    templateName: 'alliance-victory-view',
    
    alliance:     null,
    controller:   null,
  });
  
  module.AllianceVictoryProgressView = Ember.View.extend({
    alliance:     null,
    controller:   null,
    victoryType:  null,
  });
  
  module.AllianceVictoryProgressDominationView = module.AllianceVictoryProgressView.extend({
    templateName: 'alliance-victory-progress-domination-view',
    
    victoryType: function() {
      return AWE.GS.RulesManager.getRules().getVictoryTypeWithSymbolicId('victory_domination');
    }.property('AWE.GS.Rules.victory_types').cacheable(),
    
    progress: function() {
      var progresses = this.getPath('alliance.victory_progresses.content');
      if (progresses != null) {
        for (var i = 0; i < progresses.length; i++) {
          var progress = progresses[i];
          if (progress['victory_type'] === this.getPath('victoryType.id')) {
            return progress;
          }
        }
      }
      log('ERROR: no victory progress found');
      return null;
    }.property('alliance', 'alliance.victory_progresses.content', 'victoryType').cacheable(),
    
    requiredRegions: function() {
      var allRegions = AWE.GS.game.roundInfo.get('regions_count');
      var reqRegionsRatio = this.getPath('victoryType.condition.required_regions_ratio');
      return Math.ceil(allRegions * reqRegionsRatio);
    }.property('victoryType.condition.required_regions_ratio', 'AWE.GS.game.roundInfo.regions_count', 'victoryType').cacheable(),
    
    fulfillmentPercentage: function() {
      if (this.getPath('progress.fulfillmentRatio') < 1) {
        return Math.floor(this.getPath('progress.fulfillmentRatio') * 100) + '%';
      }
      else {
        return Math.floor(25 * (1 - this.getPath('progress.fulfillmentDurationRatio'))) + '%';
      }
    }.property('alliance', 'progress.fulfillmentRatio', 'progress.fulfillmentDurationRatio').cacheable(),
    
    allianceFirst: 'alliance',
    allianceSecond: 'alliance',
    allianceThird: 'alliance',
  });
  
  module.AllianceVictoryProgressOtherAllianceView = Ember.View.extend({
    templateName: "alliance-victory-progress-other-alliance-view",
    
    alliance:     null,
    controller:   null,
    
    pos: 1,
    
    progress: function() {
      var progresses = this.getPath('alliance.victory_progresses.content');
      if (progresses != null) {
        for (var i = 0; i < progresses.length; i++) {
          var progress = progresses[i];
          if (progress['victory_type'] === this.getPath('parentView.victoryType.id')) {
            return progress;
          }
        }
      }
      log('ERROR: no victory progress found');
      return null;
    }.property('alliance', 'alliance.victory_progresses.content').cacheable(),
    
    marginTop: function() {
      return (this.get('pos') - 1) * 12;
    }.property('pos').cacheable(),
    
    height: function() {
      return this.get('pos') * 12 + 1;
    }.property('pos').cacheable(),
    
    position: function() {
      if (this.getPath('progress.fulfillmentRatio') < 1) {
        return Math.floor(this.getPath('progress.fulfillmentRatio') * 100) + '%';
      }
      else {
        return Math.floor(25 * (1 - this.getPath('progress.fulfillmentDurationRatio'))) + '%';
      }
    }.property('alliance', 'progress.fulfillmentRatio', 'progress.fulfillmentDurationRatio').cacheable(),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

