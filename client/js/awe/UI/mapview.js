/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  
  module.createView2 = function () {
    
    var _controller;
    var _frame;
    
    var that = {};
    
    that.initWithController = function(controller, frame)
    {
      _frame = frame || _frame;
      _controller = controller || _controller;
    }
    
    that.controller = function() { return _controller; }
    that.frame = function() { return _frame; }
    that.setFrame = function(frame) { _frame = frame; }
    
    that.displayObject = function() { return null; }
    
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
    };
    
    that.displayObject = function() { return _container; }
    
    that.addChild = function(view) { 
      _subviews.push(view);
      _container.addChild(view.displayObject());
    };
    
    that.removeChild = function(view) {
      var index = _subviews.indexOf(view);     
      if (index >= 0) {
        _container.removeChild(view.displayObject());
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




