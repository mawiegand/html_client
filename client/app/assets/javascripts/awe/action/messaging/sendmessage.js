/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Messaging = (function(module) {
  
  module.createSendMessageAction = function(message, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        message: {
          subject:        (message.subject),
          recipient_name: (message.recipient),
          body:           (message.body),
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.MESSAGING_SERVER_BASE+'/messages/'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.CREATED) {
        var outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
        if (outbox) {
          outbox.fetchEntries();
        }
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Messaging || {}));