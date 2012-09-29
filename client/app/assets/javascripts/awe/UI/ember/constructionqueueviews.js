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
  });

  module.ConstructionJobView = Ember.View.extend({
    classNameBindings: ['active', 'first'],
    
    job: null,
    timer: null,
    
    timeReamining: null,
    
    isConstructionSpeedupPossible: function() {
      return this.getPath('job.active_job') && AWE.Util.Rules.isConstructionSpeedupPossible(this.get('timeRemaining'));
    }.property('timeRemaining', 'job.active_job'),
    
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




