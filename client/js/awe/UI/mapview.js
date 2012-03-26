/* Authors: Patrick Fox <patrick@5dlab.com>,
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  
  module.createView2 = function () {
    
    var _controller;
    var _frame;
    var _originalSize;
    var _needsLayout = false;
    var _needsDisplay = false;
    var _needsUpdate = false;
    
    var _autoscales = false;
    var _alpha = 1.;
    
    var that = {};
    
    that.initWithController = function(controller, frame)
    {
      _frame = frame || AWE.Geometry.createRect(0,0, 100, 100);
      _originalSize = frame.size.copy(); // just to be sure...
      _controller = controller || _controller;
      _needsLayout = _needsUpdate = _needsDisplay = true;
    }
    
    that.controller = function() { return _controller; }
    that.frame = function() { return _frame; }
    that.setFrame = function(frame) {
      if (!_frame || !_frame.size.equals( frame.size )) {
        _needsLayout = _needsDisplay = true;
      }
      if (!_frame || !_frame.origin.equals(frame.origin)) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { // may return null, a DisplayObject or an Array
          obj.x = frame.origin.x;
          obj.y = frame.origin.y;   
        });
        _needsDisplay = true;
      }
      _frame = frame;
    }
    
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

    
    that.layoutIfNeeded = function() {
      if (_needsLayout) {
        this.layoutSubviews();
      };
    };
    
    that.autoscaleIfNeeded = function() {
      if (_autoscales) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { console.log(' SCALE CONTAINER ')  // may return null, a DisplayObject or an Array
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
  
  module.createContainer = function () {

    var _container = null;
    var _subviews = Array();
    
    var that = module.createView2();
    var _super = {
      initWithController: that.initWithController,
    };
    that.superLayoutSubviews = that.layoutSubviews;
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    };
    
    
    that.addChild = function(view) { 
      _subviews.push(view);
      AWE.Ext.applyFunction(view.displayObject(), function(obj){
        _container.addChild(obj);
      });
    };
    
    that.removeChild = function(view) {
      var index = _subviews.indexOf(view);     
      if (index >= 0) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj){
          _container.removeChild(obj);
        });
        _subviews.splice(index,1);
      }
    }
    
    that.layoutSubviews = function() {
      that.superLayoutSubviews();
      AWE.Ext.applyFunction(_subviews, function(obj) {
        obj.layoutIfNeeded();
      });
    }
    
    that.displayObject = function() { return _container; }

    
    return that;
  };
  
  module.ViewContentModeNone = 0;
  module.ViewContentModeFit = 1;
  
  module.createImageView = function() {
    
    var _image = null;
    var _bitmap = null;
    var _contentMode = module.ViewContentModeNone;
    
    var that = module.createView2();

    var recalcScale = function() {
      if (_contentMode = module.ViewContentModeFit) { console.log('calculate bitmap scale. ' + that.frame().size.width + " to " + _bitmap.image.width);
        _bitmap.scaleX = that.frame().size.width / _bitmap.image.width;
        _bitmap.scaleY = that.frame().size.height / _bitmap.image.height;
      }
      else if (_contentMode = module.ViewContentModeNone) {
        _bitmap.scaleX = _bitmap.scaleY = 1;
      }
    }
    
    that.superSetFrame = that.setFrame;
    
    that.initWithControllerAndImage = function(controller, image, frame) {
      frame = frame || AWE.Geometry.createRect(0,0,image.width, image.height);
      that.initWithController(controller, frame);
      _bitmap = new Bitmap();
      that.setImage(image);
    }
    
    that.setImage = function(image) {
      _image = image;
      _bitmap.image = image;
      recalcScale();
      this.setNeedsDisplay();
    }
    
    that.image = function() {
      return _image;
    }
    
    that.setContentMode = function(mode) {
      _contentMode = mode;
      recalcScale();
      this.setNeedsDisplay();
    }
    
    that.contentMode = function() { return contentMode; }
    
    that.setFrame = function(frame) {
      that.superSetFrame(frame);
      recalcScale();
    }
        
    that.displayObject = function() { return _bitmap; }
    
    return that;
    
  };
          
  
  /*** AWE.UI.View ***/
  module.createView = function(spec) {
    var _view = {};
    
    var _id = spec.id || 0;
    var _frame = spec.frame || null;
    var _alphaMin = spec.alphaMin || 0;
    var _alphaMax = spec.alphaMax || 0;
    var _scaled = spec.scaled || false;

    var _layer = spec.layer || null;
    var _container = new Container();
    
    var _controller = spec.controller || null;
    
    _view.initWithController = function(controller, frame) {
      _frame = frame || _frame;
      _controller = controller || _controller;
    };
    
    _view.controller = function() {
      return _controller;
    }
    
    _view.setController = function(controller) {
      _controller = controller;
    }
    
    _view.alpha = function(width) {  
      
      if (_alphaMax === _alphaMin) {
        return 1;
      }
      else {      
        var alpha = (width - _alphaMin ) / (_alphaMax - _alphaMin);
        
        if (alpha > 1) alpha = 1;
        if (alpha < 0) alpha = 0;
        
        return alpha;
      }      
    };
    
    _view.id = function() {
      return _id;
    };

    _view.layer = function() {
      return _layer;
    }

    _view.container = function() {
      return _container;
    };
    
    _view.frame = function() {
      return _frame;
    };
    
    _view.setFrame = function(frame) {
      _frame = frame;
    };
    
    _view.isScaled = function() {
      return _scaled;
    };
    
    _view.redraw = function() {
      log('redraw', _view);
    };
    
    AWE.Partials.addChangeTracking(_view);
    
    return _view;
  };
    
  return module;
    
}(AWE.UI || {}));




