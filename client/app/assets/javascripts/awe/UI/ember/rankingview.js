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
    
    sortOrder: null,
    
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
        AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, null, function(ranking) {
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
    
    currentPage: function() {
      var entries = this.get('characterRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.characterRanking').cacheable(),
    
    nextPage: function() {
      var nextPage = this.get('currentPage') + 1;
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(nextPage, this.get('sortOrder'));
    },
    
    previousPage: function() {
      var previousPage = this.get('currentPage') - 1;
      if (this.get('currentPage') > 1) {
        AWE.GS.game.set('characterRanking', null);
        AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(previousPage, this.get('sortOrder'));
      }
    },
    
    sortByRank: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking();
      this.set('sortOrder', null);
    },
    
    sortByOverall: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'overall');
      this.set('sortOrder', 'overall');
    },
    
    sortByResource: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'resource');
      this.set('sortOrder', 'resource');
    },
    
    sortByLikes: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'likes');
      this.set('sortOrder', 'likes');
    },
    
    sortByVictories: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'victories');
      this.set('sortOrder', 'victories');
    },
    
    sortByVictoryRatio: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'victory_ratio');
      this.set('sortOrder', 'victory_ratio');
    },
    
    sortByKills: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'kills');
      this.set('sortOrder', 'kills');
    },
    
    sortByExperience: function() {
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'experience');
      this.set('sortOrder', 'experience');
    },
  });
  
  module.AllianceRankingView = Ember.View.extend({
    templateName: 'alliance-ranking-view',
    
    init: function() {
      if (AWE.GS.game.get('allianceRanking') == null) {
        AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, null, function(ranking) {
        });
      }
      this._super();
    },
    
    allianceRankingEntries: function() {
      var entries = [];
      var rankingEntries = AWE.GS.game.get('allianceRanking');
      if (rankingEntries) {
        AWE.Ext.applyFunctionToHash(rankingEntries, function(id, rankingEntry) {
          entries.push(rankingEntry);
        });
      }
      return entries;
    }.property('AWE.GS.game.allianceRanking').cacheable(),

    currentPage: function() {
      var entries = this.get('allianceRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.allianceRanking').cacheable(),
    
    nextPage: function() {
      var nextPage = this.get('currentPage') + 1;
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(nextPage, this.get('sortOrder'));
    },
    
    previousPage: function() {
      var previousPage = this.get('currentPage') - 1;
      if (this.get('currentPage') > 1) {
        AWE.GS.game.set('allianceRanking', null);
        AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(previousPage, this.get('sortOrder'));
      }
    },
        
    sortByRank: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking();
    },
    
    sortByFortress: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortress');
    },
    
    sortByOverall: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'overall');
    },
    
    sortByResource: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'resource');
    },
    
    sortByKills: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'kill');
    },
    
    sortByMembers: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'members');
    },
    
    sortByFortressMembers: function() {
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortressmembers');
    },
    
    alliancePressed: function(evt) {
      var entry = evt.context;
      WACKADOO.activateAllianceController(entry.get('alliance_id'));
      WACKADOO.closeAllModalDialogs();
      return false; // prevent default behavior
    },
  });
  
  module.FortressRankingView = Ember.View.extend({
    templateName: 'fortress-ranking-view',

    init: function() {
      if (AWE.GS.game.get('fortressRanking') == null) {
        AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, null, function(ranking) {
        });
      }
      this._super();
    },
    
    fortressRankingEntries: function() {
      var entries = [];
      var rankingEntries = AWE.GS.game.get('fortressRanking');
      if (rankingEntries) {
        AWE.Ext.applyFunctionToHash(rankingEntries, function(id, rankingEntry) {
          entries.push(rankingEntry);
        });
      }
      return entries;
    }.property('AWE.GS.game.fortressRanking').cacheable(),
    
    currentPage: function() {
      var entries = this.get('fortressRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.fortressRanking').cacheable(),
    
    nextPage: function() {
      var nextPage = this.get('currentPage') + 1;
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(nextPage, this.get('sortOrder'));
    },
    
    previousPage: function() {
      var previousPage = this.get('currentPage') - 1;
      if (this.get('currentPage') > 1) {
        AWE.GS.game.set('fortressRanking', null);
        AWE.GS.FortressRankingEntryManager.updateFortressRanking(previousPage, this.get('sortOrder'));
      }
    },
    
    sortByTaxRate: function() {
      AWE.GS.FortressRankingEntryManager.updateFortressRanking();
    },
    
    sortByIncome: function() {
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, 'income');
    },
    
    sortByDefense: function() {
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, 'defense');
    },
  });
  
  module.VictoryProgressRankingView = Ember.View.extend({
    templateName: 'victory-progress-ranking-view',
  });
  
  return module;  
    
}(AWE.UI.Ember || {}));
