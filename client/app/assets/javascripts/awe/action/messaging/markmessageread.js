/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Messaging = (function(module) {
  
  module.createMarkMessageReadAction = function(inboxEntry, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        messaging_inbox_entry: {
          read: true
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.MESSAGING_SERVER_BASE+'/inbox_entries/' + (inboxEntry.get('id') || "0"); }
  
    that.getHTTPMethod = function() { return 'PUT'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        AWE.GS.InboxManager.triggerInboxAutoUpdate(true);
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Messaging || {}));