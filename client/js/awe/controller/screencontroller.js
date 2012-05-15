/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createScreenController = function(anchor) {
    
    var _domAnchor = $(anchor);
    
    var that = {};

    that.applicationController = null;

    that.domRootElement = $('<div id="main-screen-controller" class="screen-controller"></div>');
    that.onMouseWheel = null;
    that.onMouseDown = null;
    that.onResize = null;
    that.onClick = null;
    that.onMouseUp = null;
    that.onMouseLeave = null;
    
    /** this needs to be implemented, in case the controller implements its own
     * scrolling (e.g. map screen controller). */
    that.isScrolling = function() { return false; } 
    
    that.anchor = function() {
      return _domAnchor;
    };
    
    that.rootElement = function() {
      return that.domRootElement;
    };
    
    that.init = function() {
    };
    
    that.getStages = function() {
      return [];
    }
    
    that.viewWillAppear = function() {};

    that.viewDidAppear = function() {};

    that.viewWillDisappear = function() {};

    that.viewDidDisappear = function() {};
    
    /** handle a mouse-out event that is sent by the application controller in
     * case the mouse enters a view on a higher-level stage. This is important,
     * because a lower-level-view will not receive a mouse-out event in case
     * the mouse is moved to an overlapping view on a higher-level stage. */
    that.handleArtificialMouseOut = function() {};

    
    that.runloop = function() {
    };

    that.shopButtonClicked = function() {
      
      $('#paymenthelper').html(
        '<form id="paymentstarter" action="' + AWE.Config.PAYMENT_PROVIDER_BASE + 'auth/sessions/" method="POST" target="_blank">' +
        '  <input type="hidden" name="access_token" value="' + AWE.Net.currentUserCredentials.get('access_token') + '" />' +
        '</form>'      
      );
      $('#paymentstarter').submit();
      $('#paymenthelper').html('');
    }; 
    
    return that;
  };

  return module;
    
}(AWE.Controller || {}));



