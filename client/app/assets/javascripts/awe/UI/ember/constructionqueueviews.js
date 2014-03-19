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
    }.property('capacity').cacheable(),
    
  });

  module.ConstructionJobView = Ember.View.extend({
    classNameBindings: ['active', 'first'],
    
    job: null,
    timer: null,
    
    timeRemaining: null,
    pool: null,

    disableFrogTrade: false,
    elementUnderCursor: this,

    /* returns action info for the queue overlay */
    action: function() {
      var active = this.get('active');
      var first = this.get('first');
      var hint = first ? AWE.I18n.lookupTranslation('settlement.construction.beingBuilt') : AWE.I18n.lookupTranslation('settlement.construction.waitingToBeBuilt');
      var target = this.get('elementUnderCursor');

      if (first && !active) {
        hint = AWE.I18n.lookupTranslation('settlement.construction.cannotBeBuilt');
      } else if($('.cancel').has(target).length > 0) {
        hint = AWE.I18n.lookupTranslation('settlement.construction.cancelTooltip');
      } else if($('.finish-button').has(target).length > 0) {
        hint = AWE.I18n.lookupTranslation('settlement.construction.cashTooltip');
      } else if($('.frog-trade-button-inline').has(target).length > 0) {
        hint = AWE.I18n.lookupTranslation('settlement.construction.frogTradeTooltip');
      }
      
      return hint;
    }.property('mouseX', 'mouseY').cacheable(),
    
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
      
      if (AWE.Config.QUICK_TRADE_ON_JOB_ENABLED === false) {
        return false;
      }

      /* disable fast frog trade button on conversion, see
       * html_client issue #69 */
      if(this.getPath('job.slot.building.underConversion')) {
        return false;
      }

      if (this.get('first') && !this.get('active') && (this.getPath('pool.resource_cash_present') >= AWE.GS.RulesManager.getRules().resource_exchange.amount) && !this.get('disableFrogTrade')) {
        var costs        = this.slotCosts(); /*this.getPath('job.slot.building.costs');*/
        var sum_required = 0;
        var self = this;
        
        for (i = 0; i < costs.length; ++i) {
          /* sum up pool */
          sum_required += costs[i].amount;

          /* check if required resources <= capacity */
          if(costs[i].amount > self.getPath('pool.'+costs[i].resourceType.symbolic_id+'_capacity'))  {
            return false;
          }
        }

        var sum_pool = self.getPath('pool.resource_wood_present') + self.getPath('pool.resource_stone_present') + self.getPath('pool.resource_fur_present');

        /* check if required resources <= capacity */
        if (sum_required > sum_pool) {
          return false;
        }

        return true;
      }
      else {
        return false;
      }
    }.property('job', 'job.active_job', 'active', 'first', 'pool', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present', 'disableFrogTrade').cacheable(),

    /* mouse hover for building details */
    mouseInView: false,
    enableTooltip: false,
    timeout: 800,    // tooltip timeout in ms
    
    showTooltip: function() {
      if (this.get('mouseInView') === true) {  // only show tooltip, if the mouse is still in view
        this.set('enableTooltip', true);
      }
    },
    
    mouseEnter: function(event) {
      var self = this;
      this.set('mouseInView', true);
      setTimeout(function() {
        self.showTooltip();
      }, this.get('timeout'));
      this.set('elementUnderCursor', event.target);
    },  
    mouseMove: function(event) {
      this.set('mouseX', event.pageX-800);
      this.set('mouseY', event.pageY-200);
      this.set('elementUnderCursor', event.target);
    },
    mouseLeave: function(event) {
      this.set('mouseInView', false);
      this.set('enableTooltip', false);
    }, 

    /* return slot costs for conversion or upgrade */
    slotCosts: function() {
      /* TODO: the calculation of costs should be placed at the job object (model!!) */

      /* check if is upgrade or conversion */
      if(this.getPath('job.slot.building.underConversion')) {
        /** this assumes the conversion to be the only job on this slot in the queue.
            presently, this assumption is save, since the client does not allow for a conversion
            if there's already an ongoing job on the same slot. */
        return this.getPath('job.slot.building.conversionCosts');
      }
      if (this.getPath('job.slot.building.underDestruction')) {
        return []; // destructions are free!
      } 
      else {       // upgrade and creation jobs
        return this.getPath('job.slot.building').calcCosts(this.getPath('job.level_after')); // level after should be right...
      }
    },

    requiredResources: function() {
      return this.slotCosts();
    }.property('active', 'first', 'building').cacheable(),

    /* return remaining required resources and it's symbolic id */
    diffResources: function() {
      var costs = this.slotCosts(); /*this.getPath('job.slot.building.costs');*/
      var diff  = [];

      if(this.get('active')) return [];

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
    }.property('building', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present').cacheable(),

    /** the following action must be moved to the settlement controller. 
     * here's the wrong place for it. */
    resourceExchangePressed: function() {
      var self = this;
      var costs = this.slotCosts();

      /* ensure that the frogTradeButton will not be clicked twice */
      if(this.get('disableFrogTrade') == true) {
        log('ERROR: frog trade was clicked twice');
        return false;
      }

      this.set('disableFrogTrade', true);

      /* TODO: re-write createTradeResourcesAction controller to receive an array instead
       * of 3 parameters */
      var action = AWE.Action.Fundamental.createTradeResourcesAction(
          (costs[0] ? costs[0].amount : 0),
          (costs[1] ? costs[1].amount : 0),
          (costs[2] ? costs[2].amount : 0),
          this.job.getId());
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        var parent = self;
        if(statusCode == 200) {
          /* update resources in client */
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
            /* TODO: Perhaps add a notification of success? */
            AWE.GS.ConstructionJobManager.updateJob(self.getPath('job.id'));
            self.get('controller').updateConstructionQueueSlotAndJobs(self.getPath('job.queue_id'));    
            self.set('disableFrogTrade', true); // was successful, keep disabled
          });
        }   
        else if (statusCode == AWE.Net.CONFLICT) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.set('disableFrogTrade', false);          
        }   
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.set('disableFrogTrade', false);
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




