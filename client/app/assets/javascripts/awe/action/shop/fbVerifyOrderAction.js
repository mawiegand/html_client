/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Shop = (function(module) {
  
  module.createFbVerifyOrderAction = function(paymentId, signedRequest, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};


    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        fb_verify_order_action: {
          payment_id: paymentId,
          signed_request: signedRequest,
        }
      }
    };

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + '/shop/fb_verify_order_actions';
    }

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode, xhr) {
    }

    return that;
  };

  return module;
  
}(AWE.Action.Shop || {}));