/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.TrainingJobAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TrainingJob = module.Entity.extend({     // extends Entity to Job
    typeName: 'TrainingJob',
    name: null, 
    
    queue_id: null, old_queue_id: null, ///< id of the queue the job is a member of
    queueIdObserver: AWE.Partials.attributeHashObserver(module.TrainingJobAccess, 'queue_id', 'old_queue_id').observes('queue_id'),
    
    queue: function(){
      return module.TrainingQueueManager.getQueue(this.get('queue_id'));      
    }.property('queue_id').cacheable(),
    
    unit_id: null,
    unitType: function() {
      return module.RulesManager.getRules().getUnitType(this.get('unit_id'));
    }.property('unit_id').cacheable(),
    
    position: null,
    quantity: null,
    quantity_finished: null,
    
    remaining: function() {
      var quantity = this.get('quantity') || 0;
      var finished = this.get('quantity_finished') || 0;
      return quantity-finished;
    }.property('quantity', 'quantity_finished').cacheable(),
    
    active_job: null,
        
    parsedFinishingTotalDate: function() {
      var active_job = this.get('active_job');
      if (active_job) {
        return AWE.GS.Util.parseDate(active_job.finished_total_at);
      }
      return null;
    }.property('active_job').cacheable(),
    
    parsedFinishingActiveDate: function() {
      var active_job = this.get('active_job');
      if (active_job) {
        return AWE.GS.Util.parseDate(active_job.finished_active_at);
      }
      return null;
    }.property('active_job').cacheable(),
    
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.TrainingJobManager = (function(my) {    // TrainingJob.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastJobUpdates = {};
    var lastJobCreateRequests = {};
    
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerQueue = {};
    
    my.runningCreateRequestsPerQueue = {};
  
    my.createEntity = function() { return module.TrainingJob.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getJob = function(id) {
      return that.getEntity(id);
    }
        
    that.getJobsInQueue = function(queueId) {
      return AWE.GS.TrainingJobAccess.getEnumerableForQueue_id(queueId);
    }
    
    that.getJobsInQueueAsHash = function(queueId) {
      return AWE.GS.TrainingJobAccess.getAllForQueue_id(queueId);
    }
    
    that.lastUpdateForQueue = function(queueId) {
      if (lastJobUpdates[queueId]) {
        return lastJobUpdates[queueId];
      }
      else {
        return new Date(1970);
      }
    }
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateJob = function(id, updateType, callback) {
      var url = AWE.Config.TRAINING_SERVER_BASE + 'job/' + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all jobs for the current queue. Calls the callback with a
     * list of all the updated jobs. */
    that.updateJobsOfQueue = function(queueId, updateType, callback) {
      var url = AWE.Config.TRAINING_SERVER_BASE + 'queues/' + queueId + '/jobs';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerQueue,                     // queue to register this request during execution
        queueId,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForQueue(queueId),                              // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastJobUpdates[queueId] = timestamp;
          }
          // delete old jobs from queue
          if (status === AWE.Net.OK) {
            var jobs = module.TrainingJobAccess.getHashableCollectionForQueue_id(queueId);
            AWE.Ext.applyFunction(jobs.get('collection'), function(job){
              var jobId = job.getId();
              if (!result.hasOwnProperty(jobId)) {
                job.destroy();
              }
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.TrainingJobAccess.getAllForQueue_id(queueId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
  
    return that;
      
  }());
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ACTIVE JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.ActiveTrainingJob = module.Entity.extend({
    typeName: 'ActiveTrainingJob',
    
    queue: null,
    queue_id: null,

    job_id: null,

    quantity_active: null,
    
    started_total_at: null,
    finished_total_at: null,
    progress_total: null,
    progress_total_updated_at: null,
    
    progress_active: null,
    progress_active_updated_at: null,
    started_active_at: null,
    finished_active_at: null,
  });    

  return module;
  
}(AWE.GS || {}));