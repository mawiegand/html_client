/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.TrainingQueueAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   QUEUE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TrainingQueue = module.Queue.extend({     // extends Queue to TrainingQueue
    typeName: 'TrainingQueue',

    settlementIdObserver: AWE.Partials.attributeHashObserver(module.TrainingQueueAccess, 'settlement_id', 'old_settlement_id').observes('settlement_id'),
    
    init: function(spec) {
      log('INIT training queue');
      this._super(spec);
      
      if (this.get('id')) {
        var hashableJobs = AWE.GS.TrainingJobAccess.getHashableCollectionForQueue_id(this.get('id'));
        this.set('hashableJobs', hashableJobs);
      }
    },

    sendCreateJobAction: function(unitId, quantity, callback) {
      var trainingAction = AWE.Action.Training.createJobCreateAction(this, unitId, quantity);
      trainingAction.send(callback);      
    },

    sendCancelJobAction: function(jobId, callback) {
      var cancelJobAction = AWE.Action.Training.createJobCancelAction(jobId);
      cancelJobAction.send(callback);
    },    
    
    sendSpeedupJobAction: function(jobId, callback) {
      var action = AWE.Action.Training.createJobSpeedupAction(jobId);
      action.send(callback);
    },  
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   QUEUE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.TrainingQueueManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastQueueUpdates = {};
    
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerSettlement = {};
  
    my.createEntity = function() {
      return module.TrainingQueue.create({
        active_jobs: Ember.ArrayProxy.create({
          baseTypeName: 'ActiveTrainingJob',
          content: Ember.A([]),
        }),
        jobs: Ember.ArrayProxy.create({
          baseTypeName: 'Job',
          content: Ember.A([]),
        }),
      });        
    }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getQueue = function(id) {
      return that.getEntity(id);
    }
        
    that.getQueuesOfSettlement = function(settlementId) {
      return AWE.GS.TrainingQueueAccess.getEnumerableForSettlement_id(settlementId);
    }
    
    that.getQueuesOfSettlementAsHash = function(settlementId) {
      return AWE.GS.TrainingQueueAccess.getAllForSettlement_id(settlementId);
    }
    
    that.getQueueForUnitCategoryInSettlement = function(unitCategoryId, settlementId) {
      var queues = that.getQueuesOfSettlement(settlementId);
      var rules = AWE.GS.RulesManager.getRules();
      var queueTypeId = rules.getQueueTypeIdWithUnitCategory(unitCategoryId);
      
      var found = null;
      queues.forEach(function(queue) {
        if (queue.get('type_id') == queueTypeId) {
          found = queue;
        }
      });
      return found;
    }   
    
    that.getQueueOfSettlementWithType = function(settlementId, queueType) {
      var queues = that.getQueuesOfSettlement(settlementId);
      var found = null;
      queues.forEach(function(queue) {
        if (queue.get('type_id') == queueType) {
          found = queue;
        }
      });
      return found;
    }
    
    that.lastUpdateForSettlement = function(settlementId) {
      if (lastQueueUpdates[settlementId]) {
        return lastQueueUpdates[settlementId];
      }
      else {
        return new Date(1970);
      }
    }
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateQueue = function(id, updateType, callback) {
      var url = AWE.Config.TRAINING_SERVER_BASE + 'queues/' + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.updateQueuesOfSettlement = function(settlementId, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements/' + settlementId + '/training_queues';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerSettlement,                     // queue to register this request during execution
        settlementId,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForSettlement(settlementId),                              // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastQueueUpdates[settlementId] = timestamp.add(-1).second();
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
  
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));