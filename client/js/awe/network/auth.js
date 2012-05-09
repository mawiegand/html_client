/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

/** This file provides authentication and authorization for the communication
  with the game server. */
AWE.Net = (function(module) {

  module.currentUserCredentials = null;

  /** Object holding user credentials of a particular user. */
  module.UserCredentials = Ember.Object.extend({
    access_token: null,
    expires: null,
    refresh_token: null,
    
    /** returns true in case the present access_token has been expired. */
    expired: function() {
      /** \todo IMPLEMENT */
      return false; 
    },
    
    /** obtains a new access token using the refresh-token (if set). */
    refresh: function() {
      /** \todo IMPLEMENT */
    },
  });

  return module ;
  
}(AWE.Net || {}))






