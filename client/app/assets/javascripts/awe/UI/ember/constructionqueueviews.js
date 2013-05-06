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
     *  - is first and not active
     *  - user has enough cash for frog trade
     */
    isFrogTradePossible: function() {
      if(this.get('first') && !this.get('active') && (this.getPath('pool.resource_cash_present') >= AWE.GS.RulesManager.getRules().resource_exchange.amount)) {
        var costs        = this.slotCosts(); /*this.getPath('job.slot.building.costs');*/
        var sum_pool     = 0;
        var sum_required = 0;
        var self = this;
        
        for(i = 0; i < costs.length; ++i) {
          /* sum up pool */
          sum_pool += self.getPath('pool.'+costs[i].resourceType.symbolic_id+'_present');
          sum_required += costs[i].amount;

          /* check if required resources <= capacity */
          if(costs[i].amount > self.getPath('pool.'+costs[i].resourceType.symbolic_id+'_capacity')) 
            return false;
        }

        /* check if required resources <= capacity */
        if(sum_required > sum_pool)
          return false;

        return true;
      }
      else return false;
    }.property('job.active_job', 'active', 'first', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present'),

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

    /* return slot costs for conversion or upgrade */
    slotCosts: function() {
      /* check if is upgrade or conversion */
      if(this.getPath('job.slot.building.underConversion')) {
        return this.getPath('job.slot.building.conversionCosts');
      } else {
        return this.getPath('job.slot.building.costs');
      }
    },

    requiredResources: function() {
      return this.slotCosts();
    }.property('active', 'first', 'building'),

    /* return remaining required resources and it's symbolic id */
    diffResources: function() {
      var costs = this.slotCosts(); /*this.getPath('job.slot.building.costs');*/
      var diff  = [];

      for(i = 0; i < costs.length; ++i) {
        var symbolic_id = costs[i].resourceType.symbolic_id; /*AWE.GS.RulesManager.getRules().getResourceType(i).symbolic_id;*/
        var remaining   = parseInt(costs[i].amount) - this.getPath('pool.'+symbolic_id+'_present');

        if(remaining > 0)
          diff.push(Ember.Object.create({
            remaining:   remaining,
            symbolic_id: symbolic_id,
          }));
      }
      return diff;
    }.property('building', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present'),

    resourceExchangePressed: function() {
      var self = this;
      var costs = this.slotCosts();

      /* fill up to 3 items :) */
      for(i = costs.length; i < 3; ++i) {
        costs.push(Ember.Object.create({
          amount: 0,
        }));
      }

      var action = AWE.Action.Fundamental.createTradeResourcesAction((costs[0].amount|0),
          (costs[1].amount|0),
          (costs[2].amount|0));
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        var parent = self;
        if(statusCode == 200) {
          /* update resources in client */
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
            /* TODO: Perhaps add a notification of success? */
            alert("Umrköten erfolgreich!");
          }); 
        }   
        else if (statusCode == AWE.Net.CONFLICT) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }   
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }   
      }); 
    },
    
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
      this.initPool();
    },

    initPool: function() {
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




