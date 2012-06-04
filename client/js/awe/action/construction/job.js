/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Construction = (function(module) {
  
  module.createJobAction = function(queue, slotId, buildingId, jobType, levelBefore, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.queue = queue;
    my.slotId = slotId;
    my.buildingId = buildingId;
    my.jobType = jobType;
    my.levelBefore = levelBefore;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'construction_job[queue_id]=' + my.queue.getId() +
        '&construction_job[slot_id]=' + my.slotId +
        '&construction_job[building_id]=' + my.buildingId +
        '&construction_job[job_type]=' + my.jobType +
        '&construction_job[level_before]=' + my.levelBefore   
    }
    
    that.getURL = function() {
      return AWE.Config.CONSTRUCTION_SERVER_BASE + 'jobs';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.QueueManager.updateQueue(my.queue.getId(), null, function() {
          AWE.GS.JobManager.updateJobsInQueue(my.queue.getId());
          log('fettich!');
        });
      }
    }
    
    that.queue = function() {
      return my.queue;
    }
  
    return that;
    
  };
  
  return module;
  
}(AWE.Action.Military || {}));