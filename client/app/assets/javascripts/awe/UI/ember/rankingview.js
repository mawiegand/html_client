/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.RankingView = Ember.View.extend({
    templateName: 'ranking-view',
    
    onClose:   null,
    
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

  module.RankingTabView = module.TabView.extend({
    
    init: function() {
     
      this.set('tabViews', [
        {
          key:   "tab1",
          title: AWE.I18n.lookupTranslation('ranking.characters'), 
          view:  AWE.UI.Ember.CharacterRankingView.extend(),
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        {
          key:   "tab2",
          title: AWE.I18n.lookupTranslation('ranking.alliances'), 
          view:  AWE.UI.Ember.AllianceRankingView.extend(),
        },
        {
          key:   "tab3",
          title: AWE.I18n.lookupTranslation('ranking.fortresses'), 
          view:  AWE.UI.Ember.FortressRankingView.extend(),
        },
        {
          key:   "tab4",
          title: AWE.I18n.lookupTranslation('ranking.victoryProgress'), 
          view:  AWE.UI.Ember.VictoryProgressRankingView.extend(),
        },
      ]);
      
      this._super();
    },
  });

  module.CharacterRankingView = Ember.View.extend({
    templateName: 'character-ranking-view',
    
    init: function() {
      if (AWE.GS.game.get('characterRanking') == null) {
        AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 5, null, function(ranking) {
        });
      }
      this._super();
    },
    
    characterRankingEntries: function() {
      var entries = [];
      var rankingEntries = AWE.GS.game.get('characterRanking');
      if (rankingEntries) {
        AWE.Ext.applyFunctionToHash(rankingEntries, function(id, rankingEntry) {
          entries.push(rankingEntry);
        });
      }
      return entries;
    }.property('AWE.GS.game.characterRanking').cacheable(),
    
    nextPage: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(2, 15, null);
    },
    
    sortByRank: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, null);
    },
    
    sortByOverall: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'overall');
    },
    
    sortByResource: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'resource');
    },
    
    sortByLikes: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'likes');
    },
    
    sortByVictories: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'victories');
    },
    
    sortByVictoryRatio: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'victory_ratio');
    },
    
    sortByKills: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'kills');
    },
    
    sortByExperience: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 15, 'experience');
    },
  });
  
  module.CharacterRankingEntryView = Ember.View.extend({
    entry: null,
  });
  
  module.AllianceRankingView = Ember.View.extend({
    templateName: 'alliance-ranking-view',
  });
  
  module.FortressRankingView = Ember.View.extend({
    templateName: 'fortress-ranking-view',
  });
  
  module.VictoryProgressRankingView = Ember.View.extend({
    templateName: 'victory-progress-ranking-view',
  });
  
  return module;  
    
}(AWE.UI.Ember || {}));
