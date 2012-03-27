/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createFortressControlsView = function(node, _layer, _controller) {

    var spec = {
      id: node.id(),
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: node.frame(),
      scaled: false,
      layer: _layer,
      controller: _controller,
    };
    
    var _view = module.createView(spec);
    
    var _node = node;
    
    var _enterButtonBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/button1"));
    _enterButtonBitmap.x = -AWE.Config.MAPPING_FORTRESS_SIZE;
    _enterButtonBitmap.y = +AWE.Config.MAPPING_FORTRESS_SIZE / 2;
    _enterButtonBitmap.onClick = function() {
      log('_enterButtonBitmap onClick');
    };
    
    var _enterButtonText = new Text('Enter', "12px Arial", "#000");
    _enterButtonText.textAlign = "center";
    _enterButtonText.textBaseline = "middle";
    _enterButtonText.x = -AWE.Config.MAPPING_FORTRESS_SIZE / 2
    _enterButtonText.y = AWE.Config.MAPPING_FORTRESS_SIZE;

    var _attackButtonBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/button2"));
    _attackButtonBitmap.x = AWE.Config.MAPPING_FORTRESS_SIZE;
    _attackButtonBitmap.y = AWE.Config.MAPPING_FORTRESS_SIZE / 2;
    _attackButtonBitmap.onClick = function() {
      log('_attackButtonBitmap onClick');
    };
   
    var _attackButtonText = new Text('Attack', "12px Arial", "#000");
    _attackButtonText.textAlign = "center";
    _attackButtonText.textBaseline = "middle";
    _attackButtonText.x = AWE.Config.MAPPING_FORTRESS_SIZE * 3 / 2
    _attackButtonText.y = AWE.Config.MAPPING_FORTRESS_SIZE;

    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };
    
    _view.node = function(){ return _node };

    _view.redraw = function() {

      var frame = _view.controller().mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      container.addChild(_enterButtonBitmap);
      container.addChild(_enterButtonText);
      container.addChild(_attackButtonBitmap);
      container.addChild(_attackButtonText);
      
      var pos = _view.controller().mc2vc(_view.position());        
      container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 1.4;
      container.alpha = alpha;

      _view.layer().addChild(container);
    };
    
    return _view;
  };

    
  return module;
    
}(AWE.UI || {}));




/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createFortressControlsView = function() {
        
    var _container = null;
        
    var that = module.createView2();
    
    var _super = {
      initWithController: function(controller, frame) { that.initWithController(controller, frame); },
    }
    that.superLayoutSubviews = that.layoutSubviews;
    that.superSetFrame = that.setFrame;
    
    that.initWithControllerAndFrame = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      _container = module.createContainer();      
      _container.initWithController(controller, frame);        

      var mouseOverImageView = AWE.UI.createImageView();
      mouseOverImageView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement"), frame);
      mouseOverImageView.setContentMode(0);  // TODO HACK
      _container.addChild(mouseOverImageView);
    }

    that.setFrame = function(frame) {
      that.superSetFrame(frame);
      _container.setFrame(frame);
    }
    
    that.layoutSubviews = function() {
      _needsLayout = true;
      _needsDisplay = true;
    }
    
    that.displayObject = function() {
      return _container.displayObject();
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));






