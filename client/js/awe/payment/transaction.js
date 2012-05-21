/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Shop = AWE.Shop || {};

AWE.Shop.Transaction = (function(module) {
  
  module.STATE_CREATED = 1;
  module.STATE_REJECTED = 2;
  module.STATE_CONFIRMED = 3;
  module.STATE_COMMITTED = 4;
  module.STATE_CLOSED = 5;
  module.STATE_ABORTED = 6;
  module.STATE_ERROR = 7;
  
  module.createTransaction = function(my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
  
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.completed = false;
    my.status = 0
    my.data = {};
    
    my.getSanitizedAndEscapedRequestBody = function() {
      return that.getRequestBody();  // TODO SECURITY : sanitize and escape it
    }
    
    // public attributes and methods ///////////////////////////////////////
    that = {};    
  
    /** overwrite and return appropriate information to send to the server. 
     */
    that.getRequestBody = function() {
      return '';
    };
    
    that.send = function(callback) {

      var options = {
        url: this.getURL(),
        type: this.getHTTPMethod(),
        data: my.getSanitizedAndEscapedRequestBody(),
        dataType: 'json',
      };      
      
      var jqXHR = $.ajax(options)
        .error(function(jqXHR, statusText) {           // On failure:
          console.log ('ERROR SENDING TRANSACTION TO URL ' + that.getURL() + ': ' + statusText); 
        })
        .success(function(data, statusText, jqXHR) {   // On success:
          my.data = data;
          console.log ('Successfully sent transaction to url: ' + that.getURL() + ': ' + statusText);
        })
        .complete(function(jqXHR, statusText) {
          my.completed = true;
          my.status = jqXHR.status;
          that.postProcess(jqXHR.status, jqXHR);
          if (callback) {
            callback(jqXHR.status, jqXHR);
          }
        });
      
      return jqXHR; 
    }
    
    /** you need to overwrite this and to return a valid URL on the server. */
    that.getURL = function() {
    }

    /** overwrite this to change the HTTP method to be used for sending the
     * action to the server. Default is POST*/
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    /** overwrite this to implement your post processing after the action
     * completed (either successfully or with an error). */
    that.postProcess = function(statusCode, xhr) {
    }
    
    that.data = function() {
      return my.data;
    }
  
    return that;
  };

  return module;
  
}(AWE.Shop.Transaction || {}));
