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
    }.property('alliance', 'alliance.victory_progresses.content').cacheable(),
    
    fulfilled: function() {
      return this.get('fulfillmentRatio') >= 1;
    }.property('fulfillmentRatio').cacheable(),
    
    fulfillmentRatio: function() {
      var allRegions = AWE.GS.game.roundInfo.get('regions_count');
      var allianceRegions = this.getPath('progress.fulfillment_count');
      var reqRegionsRatio = this.getPath('victoryType.condition.required_regions_ratio');
      var fulfillmentRatio = 1.0 * (allianceRegions / allRegions) / reqRegionsRatio;
      return (fulfillmentRatio > 1) ? 1 : fulfillmentRatio;
    }.property('alliance', 'progress.fulfillment_count', 'AWE.GS.game.roundInfo.regions_count', 'victoryType').cacheable(),
    
    requiredRegions: function() {
      var allRegions = AWE.GS.game.roundInfo.get('regions_count');
      var reqRegionsRatio = this.getPath('victoryType.condition.required_regions_ratio');
      return Math.ceil(allRegions * reqRegionsRatio);
    }.property('victoryType.condition.required_regions_ratio', 'AWE.GS.game.roundInfo.regions_count', 'victoryType').cacheable(),
    
    fulfillmentDurationRatio: function() {
      var firstFulfilledAt = this.getPath('progress.first_fulfilled_at');
      var reqDuration = this.getPath('victoryType.condition.duration')
      if (firstFulfilledAt != null) {
        var duration = (new Date().getTime() - Date.parseISODate(firstFulfilledAt).getTime())/(24 * 3600 * 1000);
        return 1.0 * duration / reqDuration;
      }
      else {
        return 0;
      }
    }.property('progress.first_fulfilled_at', 'victoryType').cacheable(),
    
    fulfillmentPercentage: function() {
      if (this.get('fulfillmentRatio') < 1) {
        return Math.floor(this.get('fulfillmentRatio') * 100) + '%';
      }
      else {
        return Math.floor(25 * (1 - this.get('fulfillmentDurationRatio'))) + '%';
      }
    }.property('alliance', 'fulfillmentRatio', 'fulfillmentDurationRatio').cacheable(),
    
    daysRemaining: function() {
      var reqDuration = this.getPath('victoryType.condition.duration');
      return AWE.UI.Util.round(reqDuration * (1 - this.get('fulfillmentDurationRatio')));
    }.property('victoryType', 'fulfillmentDurationRatio').cacheable(),
    
    endDate: function() {
      return this.getPath('progress.first_fulfilled_at');
    }.property('progress.first_fulfilled_at').cacheable(),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

