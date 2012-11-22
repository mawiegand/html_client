/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.redeemretentionreward = function(retentionCode, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.retentionCode = retentionCode;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {};
    }
    
    that.getURL = function() { return AWE.Config.FUNDAMENTAL_SERVER_BASE + '/retentions_mails/' + retentionCode; }
  
    that.getHTTPMethod = function() { return 'PUT'; }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));