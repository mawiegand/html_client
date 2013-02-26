/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.RankingDialog = Ember.View.extend({
    templateName: 'ranking-view',
    
    onClose:   null,
    
    sortOrder: null,
    
    init: function() {
      AWE.GS.RankingInfoManager.updateRankingInfo();
      this._super();
    },
    
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
          title: AWE.I18n.lookupTranslation('ranking.artifacts'),
          view:  AWE.UI.Ember.ArtifactRankingView.extend(),
        },
        {
          key:   "tab5",
          title: AWE.I18n.lookupTranslation('ranking.victoryProgress'),
          view:  AWE.UI.Ember.VictoryProgressRankingView.extend(),
        }
      ]);
      
      this._super();
    },
  });

  module.RankingView = Ember.View.extend({

    emptyEntriesAheadOfSpinwheel: function() {
      return new Array(Math.ceil(AWE.Config.RANKING_LIST_ENTRIES / 2));
    }.property('AWE.Config.RANKING_LIST_ENTRIES').cacheable(),
    
    emptyEntriesAfterSpinwheel: function() {
      return new Array(Math.floor(AWE.Config.RANKING_LIST_ENTRIES / 2));
    }.property('AWE.Config.RANKING_LIST_ENTRIES').cacheable(),
    
    gotoFirstPage: function() {
      this.gotoPage(1);
    },
    
    gotoSecondPage: function() {
      this.gotoPage(2);
    },
    
    gotoPreviousPreviousPage: function() {
      this.gotoPage(this.get('currentPage') - 2);
    },
    
    gotoPreviousPage: function() {
      this.gotoPage(this.get('currentPage') - 1);
    },
    
    gotoNextPage: function() {
      this.gotoPage(this.get('currentPage') + 1);
    },
    
    gotoNextNextPage: function() {
      this.gotoPage(this.get('currentPage') + 2);
    },
    
    gotoMaxPreviousPage: function() {
      this.gotoPage(this.get('maxPage') - 1);
    },
    
    gotoMaxPage: function() {
      this.gotoPage(this.get('maxPage'));
    },

    characterPressed: function(evt) {
      var entry = evt.context;
      var characterId = entry.get('character_id');
      if (characterId != null) {
        var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
          characterId: characterId,
        });
        WACKADOO.presentModalDialog(dialog);      
      }     
      return false; // prevent default behavior
    },
    
    alliancePressed: function(evt) {
      var entry = evt.context;
      var allianceId = entry.get('alliance_id');
      if (allianceId != null) {
        WACKADOO.activateAllianceController(allianceId);
        WACKADOO.closeAllModalDialogs();
      }
      return false; // prevent default behavior
    },
  });

  module.CharacterRankingView = module.RankingView.extend({
    templateName: 'character-ranking-view',
    
    init: function() {
      if (AWE.GS.game.get('characterRanking') == null) {
        AWE.GS.CharacterRankingEntryManager.updateCharacterRanking();
        this.set('sortOrder', 'overall');
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
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
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
    
    sortedByResource: function() {
      return this.get('sortOrder') === 'resource' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByResource: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'resource');
      this.set('sortOrder', 'resource');
    },
    
    sortedByLikes: function() {
      return this.get('sortOrder') === 'likes' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByLikes: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'likes');
      this.set('sortOrder', 'likes');
    },
    
    sortedByVictories: function() {
      return this.get('sortOrder') === 'victories' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByVictories: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'victories');
      this.set('sortOrder', 'victories');
    },
    
    sortedByVictoryRatio: function() {
      return this.get('sortOrder') === 'victory_ratio' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByVictoryRatio: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'victory_ratio');
      this.set('sortOrder', 'victory_ratio');
    },
    
    sortedByKills: function() {
      return this.get('sortOrder') === 'kills' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByKills: function() {
      AWE.GS.game.set('characterRanking', null);
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking(null, 'kills');
      this.set('sortOrder', 'kills');
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
      entries.sort(function(a, b) {
        return a.get('rank') - b.get('rank');
      });
      return entries;
    }.property('AWE.GS.game.allianceRanking').cacheable(),

    emptyAllianceRankingEntries: function() {
      var entries = this.get('allianceRankingEntries');
      if (entries == null) {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES - entries.length);
      }
    }.property('allianceRankingEntries').cacheable(),
    
    currentPage: function() {
      var entries = this.get('allianceRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.allianceRanking').cacheable(),
    
    maxPage: function() {
      return Math.ceil(AWE.GS.game.rankingInfo.alliance_entries_count / AWE.Config.RANKING_LIST_ENTRIES); 
    }.property('AWE.GS.game.rankingInfo.alliance_entries_count').cacheable(),
    
    gotoPage: function(page) {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(page, this.get('sortOrder'));
    },
    
    sortedByFortress: function() {
      return this.get('sortOrder') === 'fortress' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByFortress: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortress');
      this.set('sortOrder', 'fortress');
    },
    
    sortedByOverall: function() {
      return this.get('sortOrder') === 'overall' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByOverall: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'overall');
      this.set('sortOrder', 'overall');
    },
    
    sortedByResource: function() {
      return this.get('sortOrder') === 'resource' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByResource: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'resource');
      this.set('sortOrder', 'resource');
    },
    
    sortedByKills: function() {
      return this.get('sortOrder') === 'kills' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByKills: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'kills');
      this.set('sortOrder', 'kills');
    },
    
    sortedByMembers: function() {
      return this.get('sortOrder') === 'members' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByMembers: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'members');
      this.set('sortOrder', 'members');
    },
    
    sortedByFortressMembers: function() {
      return this.get('sortOrder') === 'fortressmembers' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByFortressMembers: function() {
      AWE.GS.game.set('allianceRanking', null);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortressmembers');
      this.set('sortOrder', 'fortressmembers');
    },
    
    alliancePressed: function(evt) {
      var entry = evt.context;
      WACKADOO.activateAllianceController(entry.get('alliance_id'));
      WACKADOO.closeAllModalDialogs();
      return false; // prevent default behavior
    },
  });

  module.FortressRankingView = module.RankingView.extend({
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
      entries.sort(function(a, b) {
        return a.get('rank') - b.get('rank');
      });
      return entries;
    }.property('AWE.GS.game.fortressRanking').cacheable(),

    emptyFortressRankingEntries: function() {
      var entries = this.get('fortressRankingEntries');
      if (entries == null) {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES - entries.length);
      }
    }.property('fortressRankingEntries').cacheable(),

    currentPage: function() {
      var entries = this.get('fortressRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.fortressRanking').cacheable(),

    maxPage: function() {
      return Math.ceil(AWE.GS.game.rankingInfo.fortress_entries_count / AWE.Config.RANKING_LIST_ENTRIES);
    }.property('AWE.GS.game.rankingInfo.fortress_entries_count').cacheable(),

    gotoPage: function(page) {
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(page, this.get('sortOrder'));
    },

    sortedByName: function() {
      return this.get('sortOrder') === 'name' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByName: function() {
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, 'name');
      this.set('sortOrder', 'name');
    },

    sortedByTaxRate: function() {
      return this.get('sortOrder') === 'taxRate' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByTaxRate: function() {
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking();
      this.set('sortOrder', 'taxRate');
    },

    sortedByIncome: function() {
      return this.get('sortOrder') === 'income' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByIncome: function() {
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, 'income');
      this.set('sortOrder', 'income');
    },

    sortedByDefense: function() {
      return this.get('sortOrder') === 'defense' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByDefense: function() {
      AWE.GS.game.set('fortressRanking', null);
      AWE.GS.FortressRankingEntryManager.updateFortressRanking(null, 'defense');
      this.set('sortOrder', 'defense');
    },

    regionPressed: function(evt) {
      var entry = evt.context;
      var regionId = entry.get('region_id');
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
  });

  module.ArtifactRankingView = module.RankingView.extend({
    templateName: 'artifact-ranking-view',

    sortOrder: 'id',

    init: function() {
      var self = this;
      self.set('artifactCount', AWE.GS.ArtifactManager.getArtifactCount());
      if (AWE.GS.game.get('artifacts') == null) {
        AWE.GS.ArtifactManager.updateArtifacts(null, function() {
          AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(1, self.get('sortOrder')));
          self.set('artifactCount', AWE.GS.ArtifactManager.getArtifactCount());
        });
      }
      this._super();
    },

    artifactCount: null,

    artifactRankingEntriesBinding: 'AWE.GS.game.artifactRanking',

    emptyArtifactRankingEntries: function() {
      var entries = this.get('artifactRankingEntries');
      if (entries == null) {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES - AWE.Util.arrayCount(entries));
      }
    }.property('artifactRankingEntries').cacheable(),

    currentPage: function() {
      var entries = this.get('artifactRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('artifactRankingEntries').cacheable(),

    maxPage: function() {
      var entries = this.get('artifactRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(1.0 * this.get('artifactCount') / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('artifactRankingEntries').cacheable(),

    gotoPage: function(page) {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(page, this.get('sortOrder')));
    },

    sortedByName: function() {
      return this.get('sortOrder') === 'name' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByName: function() {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(this.get('currentPage'), 'name'));
      this.set('sortOrder', 'name');
    },

    sortedByOwner: function() {
      return this.get('sortOrder') === 'ownerName' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByOwner: function() {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(this.get('currentPage'), 'ownerName'));
      this.set('sortOrder', 'ownerName');
    },

    sortedByRegion: function() {
      return this.get('sortOrder') === 'regionName' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByRegion: function() {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(this.get('currentPage'), 'regionName'));
      this.set('sortOrder', 'regionName');
    },

    sortedByCapture: function() {
      return this.get('sortOrder') === 'last_captured_at' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByCapture: function() {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(this.get('currentPage'), 'last_captured_at'));
      this.set('sortOrder', 'last_captured_at');
    },

    sortedByInitiation: function() {
      return this.get('sortOrder') === 'initiationTime' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByInitiation: function() {
      AWE.GS.game.set('artifactRanking', AWE.GS.ArtifactManager.getArtifactRankingPage(this.get('currentPage'), 'initiationTime'));
      this.set('sortOrder', 'initiationTime');
    },

    artifactPressed: function(evt) {
      var entry = evt.context;
      var artifact = entry.get('artifact');
      if (artifact != null) {
        var dialog = AWE.UI.Ember.ArtifactInfoDialog.create({
          closePressed: function () {
            this.destroy();
          },
        });
        dialog.set('artifact', artifact);
        WACKADOO.presentModalDialog(dialog);
      }
      return false; // prevent default behavior
    },

    characterPressed: function(evt) {
      var entry = evt.context;
      var characterId = entry.getPath('artifact.owner_id');
      if (characterId != null) {
        var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
          characterId: characterId,
        });
        WACKADOO.presentModalDialog(dialog);
      }
      return false; // prevent default behavior
    },

    alliancePressed: function(evt) {
      var entry = evt.context;
      var allianceId = entry.getPath('artifact.alliance_id');
      if (allianceId != null) {
        WACKADOO.activateAllianceController(allianceId);
        WACKADOO.closeAllModalDialogs();
      }
      return false; // prevent default behavior
    },

    regionPressed: function(evt) {
      var entry = evt.context;
      var regionId = entry.getPath('artifact.region_id');
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
  });

  module.RankingNavigationView = Ember.View.extend({
    templateName: 'ranking-navigation-view',
    
    previousPreviousPage: function() {
      return this.get('currentPage') - 2; 
    }.property('currentPage').cacheable(),
    
    previousPage: function() {
      return this.get('currentPage') - 1; 
    }.property('currentPage').cacheable(),
    
    currentPage: null,
    
    nextPage: function() {
      log('---> currentPage', this.get('currentPage'));
      return this.get('currentPage') + 1; 
    }.property('currentPage').cacheable(),
    
    nextNextPage: function() {
      return this.get('currentPage') + 2; 
    }.property('currentPage').cacheable(),
    
    maxPreviousPage: function() {
      return this.get('maxPage') - 1; 
    }.property('maxPage').cacheable(),
    
    maxPage: null,
    
    pageGreater1: function() {
      return this.get('currentPage') > 1; 
    }.property('currentPage').cacheable(),
    
    pageGreater2: function() {
      return this.get('currentPage') > 2; 
    }.property('currentPage').cacheable(),
    
    pageGreater3: function() {
      return this.get('currentPage') > 3; 
    }.property('currentPage').cacheable(),
    
    pageGreater4: function() {
      return this.get('currentPage') > 4; 
    }.property('currentPage').cacheable(),
    
    pageGreater5: function() {
      return this.get('currentPage') > 5; 
    }.property('currentPage').cacheable(),
    
    pageLessMax1: function() {
      return this.get('currentPage') < this.get('maxPage'); 
    }.property('currentPage', 'maxPage').cacheable(),
    
    pageLessMax2: function() {
      return this.get('currentPage') < this.get('maxPage') - 1; 
    }.property('currentPage', 'maxPage').cacheable(),
    
    pageLessMax3: function() {
      return this.get('currentPage') < this.get('maxPage') - 2; 
    }.property('currentPage', 'maxPage').cacheable(),
    
    pageLessMax4: function() {
      return this.get('currentPage') < this.get('maxPage') - 3; 
    }.property('currentPage', 'maxPage').cacheable(),
    
    pageLessMax5: function() {
      return this.get('currentPage') < this.get('maxPage') - 4; 
    }.property('currentPage', 'maxPage').cacheable(),
  });
  
  module.VictoryProgressRankingView = Ember.View.extend({
    templateName: 'victory-progress-ranking-view',
  });
    
  return module;  
    
}(AWE.UI.Ember || {}));
