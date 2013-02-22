/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Messaging = (function(module) {
  
  module.createDeleteMessageAction = function(boxEntry, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {};
    }
    
    that.getURL = function() {
      if (boxEntry.get('typeName') == 'InboxEntry') {
        var path = 'inbox_entries/';
      }
      else if (boxEntry.get('typeName') == 'OutboxEntry') {
        var path = 'outbox_entries/';
      }
      else {
        var path = 'archive_entries/';
      }
      return AWE.Config.MESSAGING_SERVER_BASE + path + (boxEntry.get('id') || 0);
    }
  
    that.getHTTPMethod = function() {
      return 'DELETE';
    };
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        if (boxEntry.get('typeName') == 'InboxEntry') {
          AWE.GS.InboxEntryManager.updateEntry(boxEntry.get('id'));
        }
        else if (boxEntry.get('typeName') == 'OutboxEntry') {
          AWE.GS.OutboxEntryManager.updateEntry(boxEntry.get('id'));
        }
        else {
          AWE.GS.ArchiveEntryManager.updateEntry(boxEntry.get('id'));
        }
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Messaging || {}));