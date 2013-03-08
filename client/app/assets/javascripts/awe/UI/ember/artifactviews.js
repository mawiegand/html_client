var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.ArtifactInfoDialog = Ember.View.extend({
    templateName: "artifact-info-view",
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
  });
  
  module.ArtifactInitiationView = Ember.View.extend({
    templateName: "artifact-initiation-view",

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
      // resourcen testen

//      var dialog = AWE.UI.Ember.InfoDialog.create({
//        contentTemplateName: 'server-command-failed-info',
//        cancelText:          AWE.I18n.lookupTranslation('settlement.artifact.notEnoughResources'),
//        okPressed:           null,
//        cancelPressed:       function() { this.destroy(); },
//      });
//      WACKADOO.presentModalDialog(dialog);


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
  });

  module.ArtifactBonusView = Ember.View.extend({
    templateName: "artifact-bonus-view",

    artifact: null,

    allianceBoni: function() {
      var boni = [];

      this.getPath('artifact.artifactType.production_bonus').forEach(function(bonus) {
        if (bonus.domain_id == AWE.GS.DOMAIN_ALLIANCE) {
          boni.push(Ember.Object.create({
            resourceType: AWE.GS.RulesManager.getRules().getResourceType(bonus.resource_id),
            bonus: bonus.bonus,
          }));
        }
      });

      return boni;
    }.property('artifact.type_id').cacheable(),

    characterBoni: function() {
      var boni = [];

      this.getPath('artifact.artifactType.production_bonus').forEach(function(bonus) {
        if (bonus.domain_id == AWE.GS.DOMAIN_CHARACTER) {
          boni.push(Ember.Object.create({
            resourceType: AWE.GS.RulesManager.getRules().getResourceType(bonus.resource_id),
            bonus: bonus.bonus,
          }));
        }
      });

      return boni;
    }.property('artifact.type_id').cacheable(),
  });

  return module;

}(AWE.UI.Ember || {});




