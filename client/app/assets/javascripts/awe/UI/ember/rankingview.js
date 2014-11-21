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
    
    exchangePressed: function(evt) {
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create();
      WACKADOO.presentModalDialog(dialog);
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
      if (AWE.GS.game.get('characterRanking') == null) {
        this.set('sortOrder', 'overall');
      }
      AWE.GS.CharacterRankingEntryManager.updateCharacterRanking();
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
      var self = this;
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, null, function() {
        self.set('loading', false);
      });
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
    
    sortedByKills: function() {
      return this.get('sortOrder') === 'kills' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByKills: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'kills', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'kills');
    },
    
    sortedByMembers: function() {
      return this.get('sortOrder') === 'members' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByMembers: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'members', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'members');
    },
    
    sortedByFortressMembers: function() {
      return this.get('sortOrder') === 'fortressmembers' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),
    
    sortByFortressMembers: function() {
      var self = this;
      AWE.GS.game.set('allianceRanking', null);
      this.set('loading', true);
      AWE.GS.AllianceRankingEntryManager.updateAllianceRanking(null, 'fortressmembers', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'fortressmembers');
    },
    
    alliancePressed: function(evt) {
      var entry = evt.context;
      //debugger;
      WACKADOO.closeAllModalDialogs();
      WACKADOO.showAllianceDialog(entry.get('alliance_id'));
      return false; // prevent default behavior
    },
  });

  module.FortressRankingView = module.RankingView.extend({
    templateName: 'fortress-ranking-view',

    init: function() {
      AWE.GS.FortressRankingEntryManager.updateFortressRanking();
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
        return Math.ceil(entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
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

    init: function() {
      var self = this;
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, null, function() {
        self.set('loading', false);
      });
      this._super();
    },

    artifactRankingEntries: function() {
      var entries = [];
      var rankingEntries = AWE.GS.game.get('artifactRanking');
      if (rankingEntries) {
        AWE.Ext.applyFunctionToHash(rankingEntries, function(id, rankingEntry) {
          entries.push(rankingEntry);
        });
      }
      entries.sort(function(a, b) {
        return a.get('rank') - b.get('rank');
      });
      return entries;
    }.property('AWE.GS.game.artifactRanking').cacheable(),

    emptyArtifactRankingEntries: function() {
      var entries = this.get('artifactRankingEntries');
      if (entries == null) {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return new Array(AWE.Config.RANKING_LIST_ENTRIES - entries.length);
      }
    }.property('artifactRankingEntries').cacheable(),

    currentPage: function() {
      var entries = this.get('artifactRankingEntries');
      if (entries != null && entries.length > 0) {
        return Math.ceil(entries[0]['rank'] / AWE.Config.RANKING_LIST_ENTRIES);
      }
      else {
        return 1;
      }
    }.property('AWE.GS.game.artifactRanking').cacheable(),

    maxPage: function() {
      return Math.ceil(AWE.GS.game.rankingInfo.artifact_entries_count / AWE.Config.RANKING_LIST_ENTRIES);
    }.property('AWE.GS.game.rankingInfo.artifact_entries_count').cacheable(),

    gotoPage: function(page) {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(page, this.get('sortOrder'), function() {
        self.set('loading', false);
      });
    },

    sortedByName: function() {
      return this.get('sortOrder') === 'name' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByName: function() {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, 'name', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'name');
    },

    sortedByOwner: function() {
      return this.get('sortOrder') === 'owner_name' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByOwner: function() {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, 'owner_name', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'owner_name');
    },

    sortedByRegion: function() {
      return this.get('sortOrder') === 'regionName' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByRegion: function() {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, 'regionName', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'region_name');
    },

    sortedByCapture: function() {
      return this.get('sortOrder') === 'last_captured_at' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByCapture: function() {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, 'last_captured_at', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'last_captured_at');
    },

    sortedByInitiation: function() {
      return this.get('sortOrder') === 'last_initiated_at' ? 'sortOrder' : '';
    }.property('sortOrder').cacheable(),

    sortByInitiation: function() {
      var self = this;
      AWE.GS.game.set('artifactRanking', null);
      this.set('loading', true);
      AWE.GS.ArtifactRankingEntryManager.updateArtifactRanking(null, 'last_initiated_at', function() {
        self.set('loading', false);
      });
      this.set('sortOrder', 'last_initiated_at');
    },

    artifactPressed: function(evt) {
      var entry = evt.context;
      var artifactId = entry.get('id');
      if (artifactId != null) {
        var dialog = AWE.UI.Ember.ArtifactInfoDialog.create({
          closePressed: function () {
            this.destroy();
          },
        });
        var artifact = AWE.GS.ArtifactManager.getArtifact(artifactId);
        if (artifact) {
          dialog.set('artifact', artifact);
        }
        else {
          AWE.GS.ArtifactManager.updateArtifact(artifactId, null, function(newArtifact) {
            if (!dialog.get('isDestroyed')) {
              dialog.set('artifact', newArtifact);
            }
          });
        }
        WACKADOO.presentModalDialog(dialog);
      }
      return false; // prevent default behavior
    },

    characterPressed: function(evt) {
      var entry = evt.context;
      var characterId = entry.getPath('owner_id');
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
      var allianceId = entry.getPath('alliance_id');
      if (allianceId != null) {
        WACKADOO.closeAllModalDialogs();
        WACKADOO.activateAllianceController(allianceId);
      }
      return false; // prevent default behavior
    },

    regionPressed: function(evt) {
      var entry = evt.context;
      var regionId = entry.getPath('region_id');
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
