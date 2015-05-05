/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Assignment = (function(module) {

  module.createStartStandardAssignmentAction = function(typeId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.type_id = typeId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        assignment_standard_assignment: {
          type_id:  my.type_id,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/start_standard_assignment_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };

  module.createSpeedupStandardAssignmentAction = function(standardAssignmentId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.standardAssignmentId = standardAssignmentId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        speedup_standard_assignment: {
          standard_assignment_id:  my.standardAssignmentId,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/speedup_standard_assignment_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };

  module.createRedeemStandardAssignmentRewardAction = function(standardAssignmentId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.standardAssignmentId = standardAssignmentId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        redeem_standard_assignment: {
          standard_assignment_id:  my.standardAssignmentId,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/redeem_standard_assignment_reward_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };
  
  module.createStartSpecialAssignmentAction = function(typeId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.type_id = typeId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        assignment_special_assignment: {
          special_assignment_id:  my.type_id,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/start_special_assignment_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };

  module.createSpeedupSpecialAssignmentAction = function(specialAssignmentId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.specialAssignmentId = specialAssignmentId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        speedup_special_assignment: {
          special_assignment_id:  my.specialAssignmentId,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/speedup_special_assignment_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };

  module.createRedeemSpecialAssignmentRewardAction = function(specialAssignmentId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.specialAssignmentId = specialAssignmentId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        redeem_special_assignment: {
          special_assignment_id:  my.specialAssignmentId,
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'assignment/redeem_special_assignment_reward_actions';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };
  
  return module;
  
}(AWE.Action.Construction || {}));
