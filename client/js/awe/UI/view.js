/* Authors: Patrick Fox <patrick@5dlab.com>,
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  /** creates the base class of the view hierarchy. The spec object is an 
   * optional argument that can be used to initialize the intrinsics of the
   * view. Nevertheless, each view offers a spereat initializer (initWith...)
   * that MUST be called before drawing the view or accessing its properties.
   *
   * The my object is another optional argument that is mainly intended for
   * internal use of the view hierarchy. Ancestors SHOULD pass this object 
   * when creating the parent "class", in order to get access to attributes
   * and methods that are protected within the view hierarchy.
   *
   * Subclassing notes:
   * - How to write your own initializer?
   * - How to overwrite existing methods?
   * - How to access a super method within a overwritten method?
   * - How to call another method from within a method of the view?
   */
  module.createView = function (spec, my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    var _originalSize;         ///< stores the original size of the view during initialization. may be user for scaling.
    var _needsLayout = false;  ///< true, in case this view has changed its size and therefore needs to be layouted again.
    var _needsDisplay = false; ///< true, in case this view has changed somehow and thus needs to be redrawn during the next cycle.
    var _needsUpdate = false;  ///< true, in case the underlying model has changed and thus the view needs to update itself.
    
    var _autoscales = false;   ///< whether the view automatically adapts its internal scale when being resized.
    var _alpha = 1.;           ///< alpha value (transparency) of the view. Continuous value from 0 to 1. 0: transparent, 1: opaque.
  
  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
    
    my.frame = null;           ///< frame of the view.
    my.controller = null;      ///< view controller that has controll of this view.
  
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    
    /** intializes the view and sets its frame and controller. The fram is an
     * optional argument. */
    that.initWithController = function(controller, frame)
    {
      my.controller = controller;
      my.frame = frame || AWE.Geometry.createRect(0, 0, 100, 100);
      _originalSize = my.frame.size.copy(); // just to be sure...
      _needsLayout = _needsUpdate = _needsDisplay = true;
    }
    
    /** returns the view controller controlling the view */
    that.controller = function() { return my.controller; }
    
    /** returns the view's frame. */
    that.frame = function() { return my.frame; }
    
    /** sets the view's frame. */
    that.setFrame = function(frame) {
      if (!my.frame || !my.frame.size.equals( frame.size )) {
        _needsLayout = _needsDisplay = true;
      }
      if (!my.frame || !my.frame.origin.equals(frame.origin)) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { // may return null, a DisplayObject or an Array
          obj.x = frame.origin.x;
          obj.y = frame.origin.y;   
        });
        _needsDisplay = true;
      }
      my.frame = frame;
    }
    
    that.setOrigin = function(origin) {
      this.setFrame(AWE.Geometry.createRect(origin.x, origin.y, my.frame.size.width, my.frame.size.height));
    }
    
    that.setCenter = function(center) {
      this.setFrame(AWE.Geometry.createRect(origin.x, origin.y, my.frame.size.width, my.frame.size.height));
    }
    
    /** returns the present width of the view. Please note, the view may draw
     * outside its frame. */
    that.width = function() { return my.frame.size.width; }
    
    /** returns the present height of the view. Plese note, the view may draw
     * outside its frame. */
    that.height = function() { return my.frame.size.height; }
    
    that.autoscales = function() { return _autoscales; }
    that.setAutoscales = function(flag) { _autoscales = flag; }
    
  
    that.displayObject = function() { return null; }
    
    /** sets that the view needs to re-layout itself and possible subviews. The
     * actual layout will be triggered during the next cycle of the controller's
     * runloop. */
    that.setNeedsLayout = function() { _needsLayout = true; }    
    /** true, in case the view needs to re-layout itself and possible subviews. */
    that.needsLayout = function() { return _needsLayout; }
    /** sets that the view needs to update itself (and possible subviews) due to
     * a change in the associated model. The udpate is then triggered by the 
     * view controller during the next cycle of the runloop. */
    that.setNeedsUpdate = function() { _needsUpdate = true;}
    /** true, in case this view needs to be updated because of a change of the 
     * associated model. */
    that.needsUpdate = function() { return _needsUpdate; }

    /** sets the view to need re-display. You should never set this directly, 
     * use setNeedsLayout or setNeedsUpdate instead. */
    that.setNeedsDisplay = function() { _needsDisplay = true; }
    /** true, in case the view needs to be displayed because it has changed.
     * Is read-out by view controller and used to trigger a canvas-repaint 
     * when needed. */
    that.needsDisplay = function() { return _needsDisplay; } // TOOD: someone needs to set needsDisplay back to false after painting!
    
    that.scaleX = function() { return that.displayObject().length !== undefined ? that.displayObject()[0].scaleY : that.displayObject().scaleY; }
    that.scaleY = function() { return that.displayObject().length !== undefined ? that.displayObject()[0].scaleY : that.displayObject().scaleY; }

    that.setScaleX = function(scale) { return AWE.Ext.applyFunction(this.displayObject(), function(obj) { obj.scaleX = scale; }) }
    that.setScaleY = function(scale) { return AWE.Ext.applyFunction(this.displayObject(), function(obj) { obj.scaleY = scale; }) }
    
    that.layoutIfNeeded = function() {
      if (_needsLayout) {
        this.layoutSubviews();
      };
    };
    
    that.autoscaleIfNeeded = function() {
      if (_autoscales) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) {  // may return null, a DisplayObject or an Array
          obj.scaleX = _frame.size.width / _originalSize.width;
          obj.scaleY = _frame.size.height / _originalSize.height;
        });   
      }
    }
    
    that.alpha = function() {
      return _alpha;
    }
    
    that.setAlpha = function(alpha) {
      _alpha = alpha;
    }

    that.layoutSubviews = function() {
      this.autoscaleIfNeeded();
      
      _needsLayout = false;
      _needsDisplay = true;
    }
    
    return that;
  };       

  return module;
    
}(AWE.UI || {}));




