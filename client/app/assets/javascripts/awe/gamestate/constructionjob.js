/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.CONSTRUCTION_JOB_TYPE_CREATE    = 'create'; 
  module.CONSTRUCTION_JOB_TYPE_UPGRADE   = 'upgrade';
  module.CONSTRUCTION_JOB_TYPE_DOWNGRADE = 'downgrade';
  module.CONSTRUCTION_JOB_TYPE_DESTROY   = 'destroy';
    
  module.ConstructionJobAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.ConstructionJob = module.Entity.extend({     // extends Entity to Job
    typeName: 'ConstructionJob',
    name: null, 
    
    queue_id: null, old_queue_id: null, ///< id of the queue the job is a member of
    queueIdObserver: AWE.Partials.attributeHashObserver(module.ConstructionJobAccess, 'queue_id', 'old_queue_id').observes('queue_id'),

    queue: function(){
      return module.ConstructionQueueManager.getQueue(this.get('queue_id'));      
    }.property('queue_id').cacheable(),  // assumption: queue is always there before jobs are fetched. Thus, we don't need a connection to the queue (presently, would be too complicated).
    
    slot_id: null, old_slot_id: null, ///< id of the slot the job is a member of
    slotIdObserver: AWE.Partials.attributeHashObserver(module.ConstructionJobAccess, 'slot_id', 'old_slot_id').observes('slot_id'),
    
    building_id: null,
    buildingType: function() {
      return module.RulesManager.getRules().getBuildingType(this.get('building_id'));
    }.property('building_id').cacheable(),
    
    slot: function() {
      return AWE.GS.SlotManager.getSlot(this.get('slot_id'));
    }.property('slot_id', 'level_after').cacheable(),
    
    position: null,
    level_after: null,
    job_type: null,
    
    destroyJob: function(){
      return this.get('job_type') == module.CONSTRUCTION_JOB_TYPE_DESTROY;
    }.property('job_type').cacheable(),
    
    active_job: null,
    
    productionTime: function() { // todo: need more complex functions for tearing down!
      var building = this.getPath('slot.building');
      var level    = this.get('level_after');
      var speed    = this.getPath('queue.speed');
      return building && level ? building.calcProductionTime(level, speed) : null;
    }.property('level_after', 'slot.building', 'queue.speed').cacheable(),
        
    destructionTime: function() { // todo: need more complex functions for tearing down!
      var building = this.getPath('slot.building');
      var level = this.get('level_before');
      if (!building || !level) {
        return null;
      }
      var time = 0;
      for (var l = 1; l <= this.get('level_before'); l++) {
        time += building.calcProductionTime(l);
      }
      return time;
    }.property('level_before', 'buildingType.production_time', 'queue.speed').cacheable(),
        
    parsedFinishingDate: function() {
      var active_job = this.get('active_job');
      if (active_job) {
        return AWE.GS.Util.parseDate(active_job.finished_at);
      }
      return null;
    }.property('active_job').cacheable(),
        
    cancelable: function() {
      // jobs des slots holen
      var jobs = this.getPath('slot.hashableJobs.collection') || [];
      
      var max = jobs.reduce(function(previousValue, item) {  // finds the job with max position (last in queue)
        if (previousValue === undefined || previousValue === null) {
          return item;
        } 
        else {
          return item.get('position') > previousValue.get('position') ? item : previousValue;
        }
      }, null);
      
      // mit this vergleichen      
      return max && this.getId() === max.getId();
    }.property('slot.hashableJobs.changedAt').cacheable(),
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.ConstructionJobManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastJobUpdates = {};
    var lastJobCreateRequests = {};
    
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerQueue = {};
    
    my.runningCreateRequestsPerQueue = {};
  
    my.createEntity = function() { return module.ConstructionJob.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getJob = function(id) {
      return that.getEntity(id);
    }
        
    that.getJobsInQueue = function(queueId) {
      return AWE.GS.ConstructionJobAccess.getEnumerableForQueue_id(queueId);
    }
    
    that.getJobsInQueueAsHash = function(queueId) {
      return AWE.GS.ConstructionJobAccess.getAllForQueue_id(queueId);
    }
    
    that.getJobsInSlot = function(slotId) {
      return AWE.GS.ConstructionJobAccess.getEnumerableForSlot_id(slotId);
    }
    
    that.getJobsInSlotAsHash = function(slotId) {
      return AWE.GS.ConstructionJobAccess.getAllForSlot_id(slotId);
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
      var url = AWE.Config.CONSTRUCTION_SERVER_BASE + 'jobs/'+id;
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
            lastJobUpdates[queueId] = timestamp.add(-1).second();
          }
          // delete old jobs from queue
          if (status === AWE.Net.OK) {           
            var jobs = module.ConstructionJobAccess.getHashableCollectionForQueue_id(queueId);
            that.fetchMissingEntities(result, jobs.get('collection'), that.updateJob); // careful: this breaks "this" inside updateJob
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.ConstructionJobAccess.getAllForQueue_id(queueId);
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
    
  module.ActiveConstructionJob = module.Entity.extend({
    typeName: 'ActiveConstructionJob',
    
    queue: null,
    queue_id: null,
    job_id: null,
    started_at: null,
    finished_at: null,
    progress: null,
  });    

  return module;
  
}(AWE.GS || {}));