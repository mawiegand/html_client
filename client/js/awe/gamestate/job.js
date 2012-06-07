/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Job class, manager and helpers. */
AWE.GS = (function(module) {
  
  module.JOB_TYPE_CREATE    = 'create'; 
  module.JOB_TYPE_UPGRADE   = 'upgrade';
  module.JOB_TYPE_DOWNGRADE = 'downgrade';
  module.JOB_TYPE_DESTROY   = 'destroy';
    
  module.JobAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Job = module.Entity.extend({     // extends Entity to Job
    typeName: 'Job',
    name: null, 
    
    queue_id: null, old_queue_id: null, ///< id of the queue the job is a member of
    queueIdObserver: AWE.Partials.attributeHashObserver(module.JobAccess, 'queue_id', 'old_queue_id').observes('queue_id'),
    
    slot_id: null, old_slot_id: null, ///< id of the slot the job is a member of
    slotIdObserver: AWE.Partials.attributeHashObserver(module.JobAccess, 'slot_id', 'old_slot_id').observes('slot_id'),
    
    building_id: null,
    buildingType: function() {
      return module.RulesManager.getRules().getBuildingType(this.get('building_id'));
    }.property('building_id'),
    
    slot: function() {
      return AWE.GS.SlotManager.getSlot(this.get('slot_id'));
    }.property('slot_id', 'level_after'),
    
    position: null,
    level_after: null,
    job_type: null,
    
    active_job: null,
        
    parsedFinishingDate: function() {
      var active_job = this.get('active_job');
      if (active_job) {
        return AWE.GS.Util.parseDate(active_job.finished_at);
      }
      return null;
    }.property('active_job'),
    
    cancelable: function() {
      
      // jobs des slots holen
      var jobs = AWE.GS.SlotManager.getSlot(this.get('slot_id')).get('hashableJobs').get('collection');
      log('---> jobs', jobs);
      
      // max suchen
      jobs.sort(function(a, b) {return b.get('position') - a.get('position')});
      log('---> jobs', jobs);

      // mit this vergleichen      
      return this.getId() == jobs[0].getId();
    }.property(),
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.JobManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastJobUpdates = {};
    var lastJobCreateRequests = {};
    
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerQueue = {};
    
    my.runningCreateRequestsPerQueue = {};
  
    my.createEntity = function() { return module.Job.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getJob = function(id) {
      return that.getEntity(id);
    }
        
    that.getJobsInQueue = function(queueId) {
      return AWE.GS.JobAccess.getEnumerableForQueue_id(queueId);
    }
    
    that.getJobsInQueueAsHash = function(queueId) {
      return AWE.GS.JobAccess.getAllForQueue_id(queueId);
    }
    
    that.getJobsInSlot = function(slotId) {
      return AWE.GS.JobAccess.getEnumerableForSlot_id(slotId);
    }
    
    that.getJobsInSlotAsHash = function(slotId) {
      return AWE.GS.JobAccess.getAllForSlot_id(slotId);
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
      var url = AWE.Config.CONSTRUCTION_SERVER_BASE + 'job/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all jobs for the current queue. Calls the callback with a
     * list of all the updated jobs. */
    that.updateJobsOfQueue = function(queueId, updateType, callback) {
      var url = AWE.Config.CONSTRUCTION_SERVER_BASE + 'queues/' + queueId + '/jobs';
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
            var jobs = module.JobAccess.getHashableCollectionForQueue_id(queueId);
            AWE.Ext.applyFunction(jobs.get('collection'), function(job){
              var jobId = job.getId();
              if (!result.hasOwnProperty(jobId)) {
                jobs.remove(jobId);
              }
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.JobAccess.getAllForQueue_id(queueId);
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
    
  module.ActiveJob = module.Entity.extend({
    typeName: 'ActiveJob',
    
    queue: null,
    queue_id: null,
    job_id: null,
    started_at: null,
    finished_at: null,
    progress: null,
  });    

  return module;
  
}(AWE.GS || {}));