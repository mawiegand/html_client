/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
    
  
  module.TrainingQueueView = Ember.View.extend({
    templateName: "training-queue-view",
    
    selectedUnitButton: null,
    number: "1",

    queue: null,

		costs: function() {
		  var unitType = this.getPath('selectedUnitButton.unitType');
		  return unitType && unitType.costs ? AWE.Util.Rules.lookupResourceCosts(unitType.costs) : null;
		}.property('selectedUnitButton.unitType').cacheable(),
		
		totalCosts: function() {
		  return AWE.Util.Rules.multipliedResourceCosts(this.get('costs'), this.get('number') || 0.0);
		}.property('costs', 'number').cacheable(),
		
		productionTime: function() {
		  var unitType = this.getPath('selectedUnitButton.unitType');
		  var speed    = this.getPath('queue.speed') || 1.0;
		  log('SPEED', this.getPath('queue.speed'));
		  return unitType ? AWE.Util.Rules.calculateProductionTime(unitType.production_time, speed) : null;
		}.property('queue.speed', 'selectedUnitButton.unitType').cacheable(),   ///< TODO : also update, when queue's speedup changes.

		totalProductionTime: function() {
		  var productionTime  = this.get('productionTime');
		  var number          = this.get('number')
		  return productionTime && number > 0 ? productionTime * number : null;
		}.property('productionTime', 'number').cacheable(),  

    trainableUnitTypes: function() {
      var queueType = this.getPath('queue.queueType');
      var rules     = AWE.GS.RulesManager.getRules();
      if (!queueType || !queueType.produces) {
        return null;
      }
      var options = AWE.GS.RulesManager.getRules().getUnitTypesWithCategories(queueType.produces);
      var self = this;
      var result = options.filter(function(unitType) {
        return !self.impossibleToTrainDueToMaxRequirement(unitType);
      });
      return result && result.length > 0 ? result : null;
    }.property('queue.queueType').cacheable(),
    
    
    impossibleToTrainDueToMaxRequirement: function(unitType) {
      var settlement = this.getPath('queue.settlement');
      var character = settlement ? settlement.owner() : null;
      var reqGroups = unitType.requirementGroups || [];
      var maxFail = true;
      log('RECALC IMPOSSIBLE DUE TO MAX REQUIREMENT');
      reqGroups.forEach(function(group) {
        maxFail = maxFail && AWE.Util.Rules.requirementGroupFailsDueToMaxRequirement(group, settlement, character, null, false); // DO NOT CONSIDER JOBS IN QUEUE
      });
      return maxFail;
    },    

    createJobPressed: function(evt) {
      this.get('controller').trainingCreateClicked(this.get('queue'), this.getPath('selectedUnitButton.unitType.id'), this.get('number'));
    },

    resourceExchangePressed: function() { 
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create(); 
      WACKADOO.presentModalDialog(dialog); 
      return false; 
    },

    trainingButtonUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_TRAINING_DIALOG_FLOW) && this.get('selectedUnitButton') != null;
    }.property('selectedUnitButton', 'queue.jobs_count', 'AWE.GS.TutorialLocalState.lastUpdate').cacheable(),
  });
  
  module.TrainingJobView = Ember.View.extend({
    classNameBindings: ['active', 'first'],
    
    job:           null,
    timeRemaining: null,
    timer:         null,
    
    cancelJobPressed: function(evt) {
      this.get('controller').trainingCancelClicked(this.get('job'));
    },
    
    speedupJobPressed: function(event) {
      this.get('controller').trainingSpeedupClicked(this.get('job'));
    },
    
    
    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),   
    
    first: function() {
      var jobCollection = this.getPath('parentView.queue.hashableJobs.collection');
      return jobCollection && jobCollection[0] && jobCollection[0] === this.get('job')
    }.property('parentView.queue.hashableJobs.changedAt'),    
    
    calcTimeRemaining: function() {
      var finishedAt = this.getPath('job.active_job.finished_total_at');
      if (!finishedAt) {
        return ;
      }
      var finish = Date.parseISODate(finishedAt);
      var now = new Date();
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
    },
    
    isTrainingSpeedupPossible: function() {
      return this.getPath('active') && !this.getPath('job.hurried') && AWE.Util.Rules.isTrainingSpeedupPossible(this.getPath('timeRemaining'));
    }.property('timeRemaining', 'active'),


    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining'),   
    
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
    
    startTimerOnBecommingActive: function() {
      var active = this.get('active');
      if (active && this.get('timer')) {
        this.startTimer();
      }
      return ;
    }.observes('active'),
    
    
    didInsertElement: function() {
      this.startTimer();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },
    
  });

  return module;
    
}(AWE.UI.Ember || {}));




