/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Messaging = (function(module) {
  
  module.createMoveToArchiveMessageAction = function(boxEntry, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {};
    }
    
    that.getRequestBody = function() {
      return {
          message_id: boxEntry.message_id,
      };
    }
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE + '/messaging/archive_entries_actions/'; }
    
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        if (boxEntry.get('typeName') == 'InboxEntry') {
          AWE.GS.InboxEntryManager.updateEntry(boxEntry.get('id'));
        }
        else {
          AWE.GS.OutboxEntryManager.updateEntry(boxEntry.get('id'));
        }
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Messaging || {}));