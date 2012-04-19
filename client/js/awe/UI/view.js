/* Authors: Patrick Fox <patrick@5dlab.com>,
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
  
  module.CONTROL_STATE_NORMAL   = 0;
  module.CONTROL_STATE_HOVERED  = 1 << 0;
  module.CONTROL_STATE_DISABLED = 1 << 1;
  module.CONTROL_STATE_SELECTED = 1 << 2;

          
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

    my.superview = null;
    my.controller = null;      ///< view controller that has controll of this view.
    
    my.frame = null;           ///< frame of the view.
    my.state = module.CONTROL_STATE_NORMAL;
  
    /** setting bits in bitfields (flags) */
    my.setBit = function(flags, mask) {
      return flags | mask;
    }
    /** unsetting bits in bitfields (flags) */
    my.unsetBit = function(flags, mask) {
      return flags & ~mask; 
    }
    /** testing bits in bitfields (flags) */
    my.testBit = function(flags, mask) {
      return (flags & mask) == mask;
    }
    /** convenience funciton for either setting or unsetting bits in bitfields
     * (flags) */
    my.setUnsetBit = function(flags, mask, set) {
      return my[set ? 'setBit' : 'unsetBit'](flags, mask);
    }    
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    AWE.Partials.addChangeTracking(that);
    
    /** intializes the view and sets its frame and controller. The fram is an
     * optional argument. */
    that.initWithController = function(controller, frame)
    {
      my.controller = controller;
      my.frame = frame || AWE.Geometry.createRect(0, 0, 100, 100);
      _originalSize = my.frame.size.copy(); // just to be sure...
      _needsLayout = _needsUpdate = _needsDisplay = true;
    }
    
    /** returns the class name of the view */
    that.typeName = function() { return my.typeName; }
    
    /** returns the view controller controlling the view */
    that.controller = function() { return my.controller; }
    
    /** return the superview */
    that.superview = function() { return my.superview; }
    
    /** sets the superview */
    that.setSuperview = function(superview) { my.superview = superview; }
    
    that.removeFromSuperview = function() {
      if (my.superview) {
        my.superview.removeChild(this);
      }
    }
    
    /** returns the view's frame. */
    that.frame = function() { return my.frame; }
    
    /** sets the view's frame. */
    that.setFrame = function(frame) {
      if (!my.frame || !my.frame.size.equals( frame.size )) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { // may return null, a DisplayObject or an Array
          obj.width = frame.size.width;
          obj.height = frame.size.height;   
        });
        this.setNeedsDisplay();
        this.setNeedsLayout();
      }
      if (!my.frame || !my.frame.origin.equals(frame.origin)) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { // may return null, a DisplayObject or an Array
          obj.x = frame.origin.x;
          obj.y = frame.origin.y;   
        });
        this.setNeedsDisplay();
      }
      my.frame = frame;
    }
    
    that.setOrigin = function(origin) {
      this.setFrame(AWE.Geometry.createRect(origin.x, origin.y, my.frame.size.width, my.frame.size.height));
    }
    
    that.setCenter = function(center) {
      this.setOrigin(AWE.Geometry.createPoint(center.x - my.frame.size.width / 2, center.y - my.frame.size.height / 2));
    }
    
    that.center = function() {
      return AWE.Geometry.createPoint(my.frame.origin.x + my.frame.size.width / 2, my.frame.origin.y + my.frame.size.height / 2);
    }
    
    /** returns the present width of the view. Please note, the view may draw
     * outside its frame. */
    that.width = function() { return my.frame.size.width; }
    
    /** returns the present height of the view. Plese note, the view may draw
     * outside its frame. */
    that.height = function() { return my.frame.size.height; }
    
    that.autoscales = function() { return _autoscales; }
    that.setAutoscales = function(flag) { _autoscales = flag; }
    
  
    that.displayObject = function() { return null; }
    
    /** sets that the view needs to re-layout itself and possible subviews. The
     * actual layout will be triggered during the next cycle of the controller's
     * runloop. */
    that.setNeedsLayout = function() { 
      if (!_needsLayout) {
        _needsLayout = true; 
        if (my.superview) {  // TODO: propagate this upwards?
          my.superview.setNeedsLayout();
        }
      }
    }    
    /** true, in case the view needs to re-layout itself and possible subviews. */
    that.needsLayout = function() { return _needsLayout; }
    /** sets that the view needs to update itself (and possible subviews) due to
     * a change in the associated model. The udpate is then triggered by the 
     * view controller during the next cycle of the runloop. */
    that.setNeedsUpdate = function() {
      if (!_needsUpdate) {
        _needsUpdate = true; 
        if (my.superview) {  // TODO: really needs to propagate upwards?
          my.superview.setNeedsUpdate();
        }
      }
    }
    /** true, in case this view needs to be updated because of a change of the 
     * associated model. */
    that.needsUpdate = function() { return _needsUpdate; }

    /** sets the view to need re-display. You should never set this directly, 
     * use setNeedsLayout or setNeedsUpdate instead. */
    that.setNeedsDisplay = function() { 
      if (!_needsDisplay) {
        _needsDisplay = true; 
        if (my.superview) {  // propagate upwards
          my.superview.setNeedsDisplay();
        }
      }
    }
    /** true, in case the view needs to be displayed because it has changed.
     * Is read-out by view controller and used to trigger a canvas-repaint 
     * when needed. */
    that.needsDisplay = function() { return _needsDisplay; } // TOOD: someone needs to set needsDisplay back to false after painting!
    
    /** informs the view that it has been redrawn. Must be called by a view
     * controller after updating the stage this view is attached to. */
    that.notifyRedraw = function() { _needsDisplay = false; }
    
    that.scaleX = function() { return that.displayObject().length !== undefined ? that.displayObject()[0].scaleY : that.displayObject().scaleY; }
    that.scaleY = function() { return that.displayObject().length !== undefined ? that.displayObject()[0].scaleY : that.displayObject().scaleY; }

    that.setScaleX = function(scale) { return AWE.Ext.applyFunction(this.displayObject(), function(obj) { obj.scaleX = scale; }) }
    that.setScaleY = function(scale) { return AWE.Ext.applyFunction(this.displayObject(), function(obj) { obj.scaleY = scale; }) }
    
    that.layoutIfNeeded = function() {
      if (_needsLayout) {
        this.setChangedNow();
        
        this.layoutSubviews();
      
        _needsLayout = false;
        this.setNeedsDisplay();
      };
    };
    
    that.updateIfNeeded = function() {
      if (_needsUpdate) {
        this.updateView();
        _needsUpdate = false;
        this.setNeedsDisplay();
        
        if (my.typeName == "ButtonView") {
          console.log('update in button view. _needsUpdate = ' + _needsUpdate);
        }

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

    that.setVisible = function(visible) {
      _visible = visible;
      this.setNeedsDisplay();
    }
    
    that.visible = function() {
      return _visible;
    }

    that.layoutSubviews = function() {
      this.autoscaleIfNeeded();
    }
    
    that.updateView = function() {
    }
    
    
    // ////////////// STATE TRACKING /////////////////
    
    /** returns the present control states of the UI element. */
    that.state = function() {
      return my.state;
    }
    
    /** sets the UI's control state to the given flags. You OR the following 
     * control states together: CONTROL_STATE_HOVERED, CONTROL_STATE_SELECTED,
     * CONTROL_STATE_DISABLED. If not a bit is set, the control state is
     * CONTROL_STATE_NORMAL. */
    that.setState = function(controlState) {
      my.state = controlState;
      console.log('changed control state in view to ' + my.state);
      this.setNeedsUpdate();    // trigger repainting of view
    }
    
    /** sets the present selection state to either true or false. Internally
     * sets / unsets the appropriate bit on the state-flags. */
    that.setSelected = function(selected) {
      this.setState(my.setUnsetBit(my.state, module.CONTROL_STATE_SELECTED, selected));
    }
    that.selected = function() {
      return my.testBit(my.state, module.CONTROL_STATE_SELECTED);
    }
    
    that.setHovered = function(hovered) {
      this.setState(my.setUnsetBit(my.state, module.CONTROL_STATE_HOVERED, hovered));
    }
    that.hovered = function() {
      return my.testBit(my.state, module.CONTROL_STATE_HOVERED);
    }
    
    that.setEnabled = function(enabled) {
      this.setState(my.setUnsetBit(my.state, module.CONTROL_STATE_DISABLED, !enabled)); // "!" -> copied inconsistent naming scheme from iOS UI in order to be consistent ;-) 
    }
    that.enabled = function() {
      return !my.testBit(my.state, module.CONTROL_STATE_DISABLED);                      // "!" -> copied inconsistent naming scheme from iOS UI in order to be consistent ;-) 
    } 
    
    return that;
  };       

  return module;
    
}(AWE.UI || {}));




