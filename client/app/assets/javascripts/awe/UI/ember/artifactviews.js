var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

/*New artifact dialogs and views START*/
  module.ArtifactInitiationDialog = module.PopUpDialog.extend({
    templateName: 'artifact-initiation-dialog',

    settlement: null,
    controller: null,
    artifactBinding: 'AWE.GS.game.currentArtifact',
  });

  module.ArtifactInitiationView = Ember.View.extend({
    templateName: 'artifact-initiation-view',

    artifact: null,

    owner: null,

    settlement: null,
    controller: null,
    artifactBinding: 'AWE.GS.game.currentArtifact',

    timer: null,
    timeRemaining: null,

    init: function() {
      var self = this;
      AWE.GS.ArtifactManager.updateArtifactOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
      });
      this.set('sending', false);
      this.set('errorMessage', null);
      this._super();
    },

    startInitiationPressed: function() {

      var self = this;
      // TODO: resourcen testen
      this.set('sending', true);

      this.get('controller').startArtifactInitiation(this.get('artifact'), function() {
        self.set('sending', false);
      });
      return false;
    },

    speedupInitiationPressed: function() {
      var self = this;
      this.set('sending', true);
      this.get('controller').artifactInitiationSpeedupPressed(this.get('artifact'), function() {
        self.set('sending', false);
      });
    },

    calcTimeRemaining: function() {
      var finishedAt = this.getPath('artifact.initiation.finished_at');
      if (!finishedAt) {
        return ;
      }
      var finish = Date.parseISODate(finishedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
    },

    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('artifact.initiation.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('artifact.initiation.ended_at')).getTime() - Date.parseISODate(this.getPath('artifact.initiation.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(250 * progression) + 'px;';
    }.property('timeRemaining').cacheable(),

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    startTimerOnStartingInitiation: function() {
      var initiating = this.getPath('artifact.initiating');
      if (initiating && !this.get('timer')) {
        this.startTimer();
      }
    }.observes('artifact.initiating'),
    
    description: function() {
      var artifact = this.get('artifact');
      if (artifact != null) {
        var type = artifact.get('artifactType');
      }
      if (type != null) {
        if (artifact.initiated) {
          return AWE.Util.Rules.lookupTranslation(type.description_initiated);
        }
        else {
          return AWE.Util.Rules.lookupTranslation(type.description);
        }
      }
    }.property('artifact').cacheable(),
    
    ownerObserver: function() {
      var owner = AWE.GS.CharacterManager.getCharacter(this.getPath('artifact.owner_id'));
      var self = this;
      this.set('owner', owner);
      if (!owner) {
        AWE.GS.CharacterManager.updateCharacter(this.getPath('artifact.owner_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          self.set('owner', character);
        });
      }
    }.observes('artifact', 'artifact.owner_id'),

    isActive: function() {
      return this.getPath('artifact.initiated')
    }.property('artifact.initiated'),

  });

  module.ArtifactBonusView = Ember.View.extend({
    templateName: 'artifact-bonus-view',
    classNames: ['artifact-bonus-view'],

    artifact: null,

    allianceProductionBonuses: function() {
      var bonuses = [];
      var productionBonuses = this.getPath('artifact.artifactType.production_bonus');

      if (productionBonuses != null) {
        productionBonuses.forEach(function(bonus) {
          if (bonus.domain_id == AWE.GS.DOMAIN_ALLIANCE) {
            bonuses.push(Ember.Object.create({
              resourceType: AWE.GS.RulesManager.getRules().getResourceType(bonus.resource_id),
              bonus: bonus.bonus,
            }));
          }
        });
      }

      return bonuses;
    }.property('artifact.type_id').cacheable(),

    characterProductionBonuses: function() {
      var bonuses = [];
      var productionBonuses = this.getPath('artifact.artifactType.production_bonus');

      if (productionBonuses != null) {
        productionBonuses.forEach(function(bonus) {
          if (bonus.domain_id == AWE.GS.DOMAIN_CHARACTER) {
            bonuses.push(Ember.Object.create({
              resourceType: AWE.GS.RulesManager.getRules().getResourceType(bonus.resource_id),
              bonus: bonus.bonus,
            }));
          }
        });
      }

      return bonuses;
    }.property('artifact.type_id').cacheable(),

    allianceConstructionBonuses: function() {
      var bonuses = [];
      var productionBonuses = this.getPath('artifact.artifactType.construction_bonus');

      if (productionBonuses != null) {
        productionBonuses.forEach(function(bonus) {
          if (bonus.domain_id == AWE.GS.DOMAIN_ALLIANCE) {
            bonuses.push(Ember.Object.create({
              bonus: bonus.bonus,
            }));
          }
        });
      }

      return bonuses;
    }.property('artifact.type_id').cacheable(),

    characterConstructionBonuses: function() {
      var bonuses = [];
      var productionBonuses = this.getPath('artifact.artifactType.construction_bonus');

      if (productionBonuses != null) {
        productionBonuses.forEach(function(bonus) {
          if (bonus.domain_id == AWE.GS.DOMAIN_CHARACTER) {
            bonuses.push(Ember.Object.create({
              bonus: bonus.bonus,
            }));
          }
        });
      }

      return bonuses;
    }.property('artifact.type_id').cacheable(),

  });

//Info dialog
  module.ArtifactInfoNewDialog = module.PopUpDialog.extend({
    templateName: 'artifact-info-new-dialog',

  });

  module.ArtifactInfoNewView = Ember.View.extend({
    templateName: 'artifact-info-new-view',
    artifact: null,

    owner: null,
    
    description: function() {
      var artifact = this.get('artifact');
      if (artifact != null) {
        var type = artifact.get('artifactType');
      }
      if (type != null) {
        if (artifact.initiated) {
          return AWE.Util.Rules.lookupTranslation(type.description_initiated);
        }
        else {
          return AWE.Util.Rules.lookupTranslation(type.description);
        }
      }
    }.property('artifact').cacheable(),
    
    ownerObserver: function() {
      var owner = AWE.GS.CharacterManager.getCharacter(this.getPath('artifact.owner_id'));
      var self = this;
      this.set('owner', owner);
      if (!owner) {
        AWE.GS.CharacterManager.updateCharacter(this.getPath('artifact.owner_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          self.set('owner', character);
        });
      }
    }.observes('artifact', 'artifact.owner_id'),

    onClose: null,

    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }
      this._super();
    },

    nameClicked: function() {
      var character = this.get('owner');
      var characterId = character ? character.get('id') : null;
      if (!characterId) {
        return false;
      }
      var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
        characterId: characterId,
      });
      WACKADOO.presentModalDialog(dialog);
      return false; // prevent default behavior
    },

    openAlliance: function() {
      var character = this.get('owner');
      if(!character)
        return false;

      var alliance = character.getAlliance();

      if(!alliance)
        return false;
      
      WACKADOO.showAllianceDialog(alliance.id);
    }
  });

  module.ArtifactBonusInfoNewView = module.ArtifactBonusView.extend({
    templateName: 'artifact-bonus-info-new-view',

  });

  return module;

}(AWE.UI.Ember || {});




