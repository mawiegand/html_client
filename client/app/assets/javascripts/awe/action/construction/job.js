/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Construction = (function(module) {
  
  module.createJobCreateAction = function(queue, slotId, buildingId, jobType, levelBefore, levelAfter, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.queue = queue;
    my.slotId = slotId;
    my.buildingId = buildingId;
    my.jobType = jobType;
    my.levelBefore = levelBefore;
    my.levelAfter = levelAfter;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        construction_job: {
          queue_id:     my.queue.getId(),
          slot_id:      my.slotId,
          building_id:  my.buildingId,
          job_type:     my.jobType,
          level_before: my.levelBefore,
          level_after:  my.levelAfter,
        }
      };
    }
    
    that.getURL = function() {
      return AWE.Config.CONSTRUCTION_SERVER_BASE + 'jobs';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    that.queue = function() {
      return my.queue;
    }
  
    return that;
    
  };

  module.createJobCancelAction = function(jobId, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.jobId = jobId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return null;
    }
    
    that.getURL = function() {
      return AWE.Config.CONSTRUCTION_SERVER_BASE + 'jobs/' + jobId;
    }
  
    that.getHTTPMethod = function() {
      return 'DELETE';
    }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK || statusCode === AWE.Net.CREATED) {
        AWE.GS.ResourcePoolManager.updateResourcePool();
      }
      AWE.GS.ConstructionJobManager.updateJob(my.jobId);
    }
    
    return that;
  };
  
  module.createJobFinishAction = function(jobId, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.jobId = jobId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'action_construction_finish_job_actions[job_id]=' + my.jobId;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'construction/finish_job_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
      AWE.GS.ResourcePoolManager.updateResourcePool();
      AWE.GS.ConstructionJobManager.updateJob(my.jobId);
    }
    
    return that;
  };
  
  return module;
  
}(AWE.Action.Construction || {}));