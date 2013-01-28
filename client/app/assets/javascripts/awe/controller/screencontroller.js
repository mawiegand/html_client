/**
 * @fileOverview 
 * Base class of all screen controllers in the game.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  /**
   * Base class of all screen controllers. Each screen controller is 
   * is responsible for one particular ("full-screen") each displaying
   * a different aspect of the game. Examples for screens controlled by
   * a corresponding screen controller are the map-screen, the alliance
   * screen and the different base and fortess-screens.  
   * @class
   * @name AWE.Controller.ScreenController */
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

    /** Defines the margin that is beeing subtracted from the bottom if the window is resized. 
     * If you wish to change the value use setScreenBottomMargin. */ 
    that.screenBottomMargin = 0;
    /** Allows to change the margin that is beeing subtracted from the bottom if the window is resized 
     * @function
     * @name AWE.Controller.ScreenController#setScreenBottomMargin */
    that.setScreenBottomMargin = function(pixelValue) {
        that.screenBottomMargin = pixelValue;
        that.domRootElement.css("margin-bottom", that.screenBottomMargin);
    };
    
    /** this needs to be implemented, in case the controller implements its own
     * scrolling (e.g. map screen controller). 
     * @function
     * @name AWE.Controller.ScreenController#isScrolling*/
    that.isScrolling = function() { return false; } ;
    
    /** 
     * @function
     * @name AWE.Controller.ScreenController#anchor*/
    that.anchor = function() {
      return _domAnchor;
    };
    
    /** @function
     * @name AWE.Controller.ScreenController#rootElement*/
    that.rootElement = function() {
      return that.domRootElement;
    };
    
    /** @function
     * @name AWE.Controller.ScreenController#init*/
    that.init = function() {
    };
    
    /** @function
     * @name AWE.Controller.ScreenController#getStages*/
    that.getStages = function() {
      return [];
    }
    
    /** @function
     * @name AWE.Controller.ScreenController#viewWillAppear*/
    that.viewWillAppear = function() {};

    /** @function
     * @name AWE.Controller.ScreenController#viewDidAppear*/
    that.viewDidAppear = function() {};
    
    /** @function
     * @name AWE.Controller.ScreenController#viewWillDisappear*/
    that.viewWillDisappear = function() {};

    /** @function
     * @name AWE.Controller.ScreenController#viewDidDisappear*/
    that.viewDidDisappear = function() {};
    
    /** handle a mouse-out event that is sent by the application controller in
     * case the mouse enters a view on a higher-level stage. This is important,
     * because a lower-level-view will not receive a mouse-out event in case
     * the mouse is moved to an overlapping view on a higher-level stage. 
     *
     * @function
     * @name AWE.Controller.ScreenController#handleArtificialMouseOut */
    that.handleArtificialMouseOut = function() {};

    
    that.runloop = function() {
    };

    return that;
  };

  return module;
    
}(AWE.Controller || {}));



