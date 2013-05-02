/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
  
  module.ConstructionQueueView = Ember.View.extend({
    templateName: 'construction-queue-view',
    queues: null,
  });
  
  module.SingleConstructionQueueView = Ember.View.extend({
    queue:      null,
    controller: null,
        
    capacityBinding: "queue.max_length",
    lengthBinding: "queue.jobs_count",  
    
    lengthClassName: function() {
      var capacity = this.get('capacity') || 0;
      return 'capacity-' + capacity;
    }.property('capacity'),
    
  });

  module.ConstructionJobView = Ember.View.extend({
    classNameBindings: ['active', 'first'],
    
    attributeBindings: ['title'],
    
    job: null,
    timer: null,
    
    timeRemaining: null,
    pool: null,
    
    title: function() {
      var active = this.get('active');
      var first = this.get('first');
      var hint = first ? AWE.I18n.lookupTranslation('settlement.construction.beingBuilt') : AWE.I18n.lookupTranslation('settlement.construction.waitingToBeBuilt');
      if (first && !active) {
        hint = AWE.I18n.lookupTranslation('settlement.construction.cannotBeBuilt')
      }
      return hint;
    }.property('active', 'first'),
    
    isConstructionSpeedupPossible: function() {
      return this.getPath('job.active_job') && this.getPath('job.buildingType.buyable') && AWE.Util.Rules.isConstructionSpeedupPossible(this.get('timeRemaining'));
    }.property('timeRemaining', 'job.active_job'),

    /* button should be available if
     *  - insufficient resources
     *  - sum required resources <= sum user resources
     *  - if required resources <= capacity
     */
    isFrogTradePossible: function() {
      if(this.get('first') && !this.get('active'))
        return true;
      else return false;
      /*return !this.get('active') && !this.get('first');*/
    }.property('job.active_job', 'active', 'first'),

    /* mouse hover for building details */
    mouseInView: false,
    mouseEnter: function(event) {
      this.set('mouseInView', true);
    },  
    mouseMove: function(event) {
      /*this.set('mouseX', event.pageX-1140);*/
      /*this.set('mouseY', this.get('mouseY')-200);*/
    },
    mouseLeave: function(event) {
      this.set('mouseInView', false);
    }, 

    requiredResources: function() {
      return this.getPath('job.slot.building.costs');
      /*
      var building = this.getPath('job.slot.building');
      var level    = this.getPath('job.level_after');
      var costs    = this.getPath('job.buildingType.costs');
      */

      /* for some reason I cannot access building.costs. I always get an error when accessing.
       * So I get the costs formulas via getBuildingTypes and evaluate them on the next line */
      /*return costs ? AWE.Util.Rules.evaluateResourceCosts(costs, level, 0, true) : [0,0,0];*/
    }.property('active', 'first', 'building'),

    /* return difference */
    diffResources: function() {
      var costs = this.getPath('job.slot.building.costs');
      var diff  = [];

      for(i = 0; i < costs.length; ++i) {
        var symbolic_id = AWE.GS.RulesManager.getRules().getResourceType(i).symbolic_id;
        var remaining   = parseInt(costs[i].amount) - this.getPath('pool.'+symbolic_id+'_present');

        if(remaining > 0)
          diff.push(Ember.Object.create({
            remaining:   remaining,
            symbolic_id: symbolic_id,
          }));
      }
      return diff;
    }.property('active', 'first', 'building', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present'),

    /*hasInsufficientResources: function() {

    }*/
    
    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining'),
    
    cancelJobPressed: function(event) {
      this.get('controller').constructionCancelClicked(this.get('job'));
    },
    
    finishJobPressed: function(event) {
      this.get('controller').constructionFinishClicked(this.get('job'));
    },
    
    active: function() {
      return this.getPath('job.active_job') !== null;
    }.property('job.active_job'),    
    
    first: function() {
      var jobCollection = this.getPath('parentView.queue.hashableJobs.collection');
      return jobCollection && jobCollection[0] && jobCollection[0] === this.get('job')
    }.property('parentView.queue.hashableJobs.changedAt'),    
    
    waitingForResources: function() {
      var active = this.get('active');
      var first  = this.get('first');
      return !active && first;
    }.property('active', 'first'),
    
    calcTimeRemaining: function() {
      var finishedAt = this.getPath('job.active_job.finished_at');
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
    
    startTimerOnBecommingActive: function() {
      var active = this.get('active');
      if (active && this.get('timer')) {
        this.startTimer();
      }
      return ;
    }.observes('active'),
    
    
    didInsertElement: function() {
      this.startTimer();
      this.set('pool', AWE.GS.ResourcePoolManager.getResourcePool());
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },
    
    progressBarWidth: function(){
      var remaining = this.get('timeRemaining') || 999999999;
      var total = this.getPath('job.productionTime') || 1;
      var ratio = 1.0 - (remaining / (1.0*total));
      ratio = ratio < 0 ? 0 : (ratio > 1 ? 1 : ratio);
      return 'width: ' + Math.ceil(100 * ratio) + 'px;';
    }.property('timeRemaining', 'job.productionTime'),    
    
    building: function() {
      if (this.getPath('job.job_type') == AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT) {
        return this.getPath('job.slot.building.converted');
      }
      else {
        return this.getPath('job.slot.building');
      } 
    }.property('id').cacheable(),  
  });

  return module;
    
}(AWE.UI.Ember || {}));




