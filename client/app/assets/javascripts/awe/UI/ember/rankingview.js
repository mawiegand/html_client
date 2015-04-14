/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.RankingDialog = module.PopUpDialog.extend({
    templateName: 'ranking-view',    
    sortOrder: null,
    
    init: function() {
      AWE.GS.RankingInfoManager.updateRankingInfo();
      this._super();
    },
  });

  module.RankingTabView = module.TabViewNew.extend({
    
    init: function() {
     
      this.set('tabViews', [
        {
          key:   "tab1",
          title: AWE.I18n.lookupTranslation('ranking.characters'), 
          view:  AWE.UI.Ember.CharacterRankingView.extend(),
          buttonClass: "left-menu-button"
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        {
          key:   "tab2",
          title: AWE.I18n.lookupTranslation('ranking.alliances'), 
          view:  AWE.UI.Ember.AllianceRankingView.extend(),
          buttonClass: "middle-menu-button"
        },
        {
          key:   "tab3",
          title: AWE.I18n.lookupTranslation('ranking.victoryProgress'),
          view:  AWE.UI.Ember.VictoryProgressRankingView.extend(),
          buttonClass: "right-menu-button"
        }
      ]);
      
      this._super();
    },
  });

  module.RankingView = Ember.View.extend({

    loading: null,

    emptyEntriesAheadOfSpinwheel: function() {
      return new Array(Math.ceil(AWE.Config.RANKING_LIST_ENTRIES / 2));
    }.property('AWE.Config.RANKING_LIST_ENTRIES').cacheable(),
    
    emptyEntriesAfterSpinwheel: function() {
      return new Array(Math.floor(AWE.Config.RANKING_LIST_ENTRIES / 2));
    }.property('AWE.Config.RANKING_LIST_ENTRIES').cacheable(),
    
    gotoFirstPage: function() {
      this.gotoPage(1);
    },
    
    gotoPreviousPage: function() {
      this.gotoPage(this.get('currentPage') - 1);
    },
    
    gotoNextPage: function() {
      this.gotoPage(this.get('currentPage') + 1);
    },
    
    gotoMaxPage: function() {
      this.gotoPage(this.get('maxPage'));
    },

    characterPressed: function(evt) {
      var entry = evt.context;
      var characterId = entry.get('character_id');
      if (characterId != null) {
        var currentCharacterId = AWE.GS.game.currentCharacter.get('id');
        if(characterId === currentCharacterId)
        {
          var dialog = AWE.UI.Ember./*ProfileView*/ProfileNewView.create({
             characterBinding: 'AWE.GS.game.currentCharacter',
          });
          WACKADOO.presentModalDialog(dialog);
        }
        else
        {
          var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
            characterId: characterId,
          });
          WACKADOO.presentModalDialog(dialog);
        }      
      }     
      return false; // prevent default behavior
    },

    alliancePressed: function(evt) {
      var entry = evt.context;
      var allianceId = entry.get('alliance_id');
      if (allianceId != null) {
        WACKADOO.closeAllModalDialogs();
        WACKADOO.showAllianceDialog(allianceId);
      }
      return false; // prevent default behavior
    },
  });

  module.CharacterRankingView = module.RankingView.extend({
    templateName: 'character-ranking-view',
    
    init: function() {
      this.sortByResource();
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
      entries.sort(function(a, b) {
        return a.get('rank') - b.get('rank');
      });
      return entries;
    }.property('AWE.GS.game.characterRanking').cacheable(),
    
    emptyCharacterRankingEntries: function() {
      var entries = this.get('characterRankingEntries');
      if (entries == null) {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES - entries.length);
      }
    }.property('characterRankingEntries').cacheable(),
    
    currentPage: function() {
      var entries = this.get('characterRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.characterRanking').cacheable(),

    maxPage: function() {
      if (AWE.GS.game.rankingInfo != null && AWE.GS.game.rankingInfo.character_entries_count != null) {
        return Math.ceil(AWE.GS.game.rankingInfo.character_entries_count / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 0;
      } 
    }.property('AWE.GS.game.rankingInfo.character_entries_count').cacheable(),
    
    gotoPage: function(page) {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(page, this.get('sortOrder'));
    },
    
    sortedByOverall: function() {
      return this.get('sortOrder') === 'overall' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByOverall: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'overall');
      this.set('sortOrder', 'overall');
    },
    
    sortedByVictories: function() {
      return this.get('sortOrder') === 'victories' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByVictories: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'victories');
      this.set('sortOrder', 'victories');
    },
    
    sortedByFortress: function() {
      return this.get('sortOrder') === 'fortress' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByFortress: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'fortress');
      this.set('sortOrder', 'fortress');
    },
    
    sortedByKills: function() {
      return this.get('sortOrder') === 'kills' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByKills: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'kills');
      this.set('sortOrder', 'kills');
    },

    sortedByResource: function() {
      return this.get('sortOrder') === 'resource' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByResource: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'resource');
      this.set('sortOrder', 'resource');
    },
    
    sortedByExperience: function() {
      return this.get('sortOrder') === 'experience' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByExperience: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'experience');
      this.set('sortOrder', 'experience');
    },
  });
  
  module.AllianceRankingView = module.RankingView.extend({
    templateName: 'alliance-ranking-view',
    
    init: function() {
      this.sortByResource();
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
      entries.sort(function(a, b) {
        return a.get('rank') - b.get('rank');
      });
      return entries;
    }.property('AWE.GS.game.allianceRanking').cacheable(),
    
    currentPage: function() {
      var entries = this.get('allianceRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.allianceRanking').cacheable(),
    
    maxPage: function() {
      return Math.ceil(AWE.GS.game.rankingInfo.alliance_entries_count / AWE.Config.RANKING_LIST_ENTRIES); 
    }.property('AWE.GS.game.rankingInfo.alliance_entries_count').cacheable(),
    
    gotoPage: function(page) {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(page, this.get('sortOrder'), function() {
        self.set('loading', false);
      });
    },
    
    sortedByFortress: function() {
      return this.get('sortOrder') === 'fortress' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByFortress: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortress', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'fortress');
    },
    
    sortedByOverall: function() {
      return this.get('sortOrder') === 'overall' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByOverall: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'overall', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'overall');
    },
    
    sortedByResource: function() {
      return this.get('sortOrder') === 'resource' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByResource: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'resource', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'resource');
    },
    
    alliancePressed: function(evt) {
      var entry = evt.context;
      //debugger;
      WACKADOO.closeAllModalDialogs();
      WACKADOO.showAllianceDialog(entry.get('alliance_id'));
      return false; // prevent default behavior
    },
  });

  module.RankingNavigationView = Ember.View.extend({
    templateName: 'ranking-navigation-view',
    classNames: ['ranking-navigation'],
    
    previousPage: function() {
      return this.get('currentPage') - 1; 
    }.property('currentPage').cacheable(),
    
    currentPage: null,
    
    nextPage: function() {
      return this.get('currentPage') + 1;
    }.property('currentPage').cacheable(),
    
    maxPage: null,
    
    isFirstPage: function() {
      return this.get('currentPage') === 1; 
    }.property('currentPage').cacheable(),
    
    isLastPage: function() {
      return this.get('currentPage') === this.get('maxPage'); 
    }.property('currentPage', 'maxPage').cacheable(),

    sortByResource: function() {
      this.get("parentView").sortByResource();
    },

    sortByFortress: function() {
      this.get("parentView").sortByFortress();
    },

    sortByOverall: function() {
      this.get("parentView").sortByOverall();
    },

    sortedByResource: function() {
      return this.getPath("parentView.sortedByResource");
    }.property("parentView.sortedByResource"),

    sortedByFortress: function() {
      return this.getPath("parentView.sortedByFortress");
    }.property("parentView.sortedByFortress"),

    sortedByOverall: function() {
      return this.getPath("parentView.sortedByOverall");
    }.property("parentView.sortedByOverall"),
  });
  
  module.VictoryProgressRankingView = Ember.View.extend({
    templateName: 'victory-progress-ranking-view',
  });
    
  return module;  
    
}(AWE.UI.Ember || {}));
