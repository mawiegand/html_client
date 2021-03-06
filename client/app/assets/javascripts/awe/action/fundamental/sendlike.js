/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {

  module.createSendLikeAction = function(receiverId, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};


    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        character: {
          id: receiverId,
        }
      };
  //    return 'character[name]=' + (escape(newName || ""));
    }

    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/send_like_actions'; }

    that.getHTTPMethod = function() { return 'POST'; }

    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
      }
    }

    return that;

  };

  return module;

}(AWE.Action.Fundamental || {}));
