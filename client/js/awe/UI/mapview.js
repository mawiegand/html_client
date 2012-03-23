/* Author: Patrick Fox <patrick@5dlab.com>
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
    
    // NOCH UNKLAR: wohin mit diesem zeugs? Teilweise (layout) nur subviews?
  
    that.displayObject = function() { return null; }
    
    that.setNeedsDisplay = function() { _needsDisplay = true; }
    that.needsDisplay = function() { return _needsDisplay; }
    that.setNeedsLayout = function() { _needsLayout = true; }
    that.needsLayout = function() { return _needsLayout; }
    
    that.layoutIfNeeded = function() {
      if (_needsLayout) {
        this.layoutSubviews();
      };
    };
    
    that.autoscaleIfNeeded = function() {
      if (_autoscales) {
        AWE.Ext.applyFunction(this.displayObject(), function(obj) { // may return null, a DisplayObject or an Array
          obj.scaleX = _frame.size.width / _originalSize.width;
          obj.scaleY = _frame.size.height / _originalSize.height;
        });   
      }
    }
    
    that.layoutSubviews = function() {
      this.autoscaleIfNeeded();
      
      _needsLayout = false;
      _needsDisplay = true;
    }
    
    /** implement only, if you really have to do custom drawing! */
    that.draw = function () {
      _needsDisplay = false;    
    };
    
    return that;
  };       
  
  module.createContainer = function () {

    var _container = null;
    var _subviews = Array();
    
    var that = module.createView2();
    var _super = {
      initWithController: that.initWithController,
    };
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    };
    
    that.displayObject = function() { return _container; }
    
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
    
    return that;
  };
  
  module.createImageView = function() {
    
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




