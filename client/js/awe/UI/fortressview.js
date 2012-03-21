/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createFortressView = function(node, _layer, _controller) {

    var spec = {
      id: node.id(),
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: node.frame(),
      scaled: false,
      layer: _layer
    };
    
    var _view = module.createView(spec);
    
    var _node = node;

    var _selected = false;
    var _mouseover = false;
    
    var _fieldBitmap = null;
    
    if (!_node.region()) {
      console.log('ERROR: should create fortress for node ' + _node.path() + ' but region information is missing!');
    }
    
    var fortressImageName = 'map/fortress/small';
    if (_node.region() && _node.region().fortressLevel() > 3) {
      fortressImageName = 'map/fortress/middle';
    }
    if (_node.region() && _node.region().fortressLevel() > 7) {
      fortressImageName = 'map/fortress/large';
    }
    
    _fieldBitmap = new Bitmap(AWE.UI.ImageCache.getImage(fortressImageName));
    

    _fieldBitmap.onClick = function(evt) {
      log('bitmap', _fieldBitmap);
      if (_selected) {
        _view.unselect();
      }
      else {
        _view.select();
      }
    };
    _fieldBitmap.onMouseOver = function(evt) {
      _mouseover = true;
      _controller.updateView();
    };
    _fieldBitmap.onMouseOut = function(evt) {
      _mouseover = false;
      _view.container().removeChild(_easementBitmap);
      _controller.updateView();
    };
    
    _fieldBitmap.view = _view;
    
    var _easementBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/easement"));
    _easementBitmap.y = -AWE.Config.MAPPING_FORTRESS_SIZE;
        
    var _buttonBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/button"));
    _buttonBitmap.x = -AWE.Config.MAPPING_FORTRESS_SIZE;
    _buttonBitmap.y = +AWE.Config.MAPPING_FORTRESS_SIZE / 2;
    _buttonBitmap.onClick = function() {
      log('button onClick');
    };
   
    var _ownerNameText = new Text(_node.region().ownerName(), "12px Arial", "#000");
    _ownerNameText.textAlign = "center";
    _ownerNameText.textBaseline = "top";
    _ownerNameText.x = AWE.Config.MAPPING_FORTRESS_SIZE / 2
    _ownerNameText.y = AWE.Config.MAPPING_FORTRESS_SIZE;
    
    
    // var color;
    // if (node.region())
    
    // 'rgba(0, 0, 0 ,0.5)'
    
    var _g = new Graphics();
    _g.setStrokeStyle(1);
    _g.beginStroke(Graphics.getRGB(0,0,0));
    _g.beginFill(Graphics.getRGB(255,0,0));
    _g.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
    var _selectShape = new Shape(_g);    
    
    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };
    
    _view.node = function(){ return _node};

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      container.addChildAt(_fieldBitmap, 0);
      if (_selected) {
        container.addChildAt(_buttonBitmap, 1);
        container.addChildAt(_selectShape, 0);
      }
      if (_mouseover) {
        container.addChildAt(_easementBitmap, 2);
      }
      container.addChildAt(_ownerNameText);

      var pos = AWE.UI.Map.mc2vc(_view.position());        
      container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 1.4;
      container.alpha = alpha;

      _view.layer().addChild(container);
    };

    _view.select = function() {
      if (_controller.selectedView && _controller.selectedView.unselect) {
        _controller.selectedView.unselect();
      }
      _selected = true;
      _controller.selectedView = _view;
      _controller.updateView();
    }
    
    _view.unselect = function() {
      _selected = false;
      module.Map.selectedView = null;
      _view.container().removeChild(_buttonBitmap);
      _view.container().removeChild(_selectShape);
      _controller.updateView();
    }
    
    return _view;
  };

    
  return module;
    
}(AWE.UI || {}));



