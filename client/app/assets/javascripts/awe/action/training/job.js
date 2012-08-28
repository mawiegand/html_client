/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Training = (function(module) {
  
  module.createJobCreateAction = function(queue, unitId, quantity, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.queue = queue;
    my.unitId = unitId;
    my.quantity = quantity;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        training_job: {
          queue_id: my.queue.getId(),
          unit_id:  my.unitId,
          quantity: my.quantity,
        }
      };
    }
    
    that.getURL = function() {
      return AWE.Config.TRAINING_SERVER_BASE + 'jobs';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == AWE.Net.OK || statusCode === AWE.Net.CREATED) {
        AWE.GS.ResourcePoolManager.updateResourcePool();
      }
      // update queue in any case: success: jobs gone. failure: old data on client side
      AWE.GS.TrainingQueueManager.updateQueue(my.queue.getId(), null, function() {
        AWE.GS.TrainingJobManager.updateJobsOfQueue(my.queue.getId(), null, function() {
          AWE.GS.TutorialStateManager.checkForRewards();
        });
        console.log('U: training queue, success');
      })
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
      return AWE.Config.TRAINING_SERVER_BASE + 'jobs/' + jobId;
    }
  
    that.getHTTPMethod = function() {
      return 'DELETE';
    }
    
    that.postProcess = function(statusCode, xhr) {
      AWE.GS.ResourcePoolManager.updateResourcePool();
      AWE.GS.TrainingJobManager.updateJob(my.jobId);
    }
    
    return that;
  };
  
  
  module.createJobSpeedupAction = function(jobId, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.jobId = jobId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'action_training_speedup_job_actions[job_id]=' + my.jobId;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'training/speedup_job_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
      AWE.GS.ResourcePoolManager.updateResourcePool();
      AWE.GS.TrainingJobManager.updateJob(my.jobId);
    }
    
    return that;
  };
  
  return module;
  
}(AWE.Action.Training || {}));