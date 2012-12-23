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
    
    init: function() {
      this._super();
      AWE.GS.VictoryProgressManager.updateLeaders(function() {
        log('---> Leaders', AWE.GS.game.get('victoryProgressLeaders'));
      });
    },
    
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
  });
  
  module.AllianceVictoryProgressOtherAllianceView = Ember.View.extend({
    templateName: "alliance-victory-progress-other-alliance-view",
    
    progress:     null,
    controller:   null,
    
    marginTop: function() {
      return (this.getPath('progress.pos') - 1) * 12;
    }.property('progress.pos').cacheable(),
    
    height: function() {
      return this.getPath('progress.pos') * 12 + 1;
    }.property('progress.pos').cacheable(),
    
    position: function() {
      if (this.getPath('progress.fulfillmentRatio') < 1) {
        return Math.floor(this.getPath('progress.fulfillmentRatio') * 100) + '%';
      }
      else {
        return Math.floor(25 * (1 - this.getPath('progress.fulfillmentDurationRatio'))) + '%';
      }
    }.property('progress', 'progress.fulfillmentRatio', 'progress.fulfillmentDurationRatio').cacheable(),
    
    styleFulfilled1: function() {
      return "position:absolute; top: 20px; right: " + this.get('position') + "; width: 200px; height: " + this.get('height') + "px; margin-top: 0; border-right: 1px solid #888; margin-right: -1px; text-align:right; font-size: 11px; color: #888;";
    }.property('position', 'height').cacheable(),
    
    styleNotFulfilled1: function() {
      return "position:absolute; top: 20px; left: " + this.get('position') + "; width: 200px; height: " + this.get('height') + "px; margin-top: 0; border-left: 1px solid #888; margin-left: -1px; font-size: 11px; color: #888;";
    }.property('position', 'height').cacheable(),
    
    styleFulfilled2: function() {
      return "height: 11px; margin-top: " + this.get('marginTop') + "px; padding-left: 3px;";
    }.property('marginTop').cacheable(),
    
    styleNotFulfilled2: function() {
      return "height: 11px; margin-top: " + this.get('marginTop') + "px; padding-right: 3px;";
    }.property('marginTop').cacheable(),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

