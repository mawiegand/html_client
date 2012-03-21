/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createFortressView = function(_node, _layer) {

    var spec = {
      id: _node.id(),
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: _node.frame(),
      scaled: false,
      layer: _layer
    };
    
    var _view = module.createView(spec);

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
      log('rein');
      _mouseover = true;
      module.Map.updateView();
    };
    _fieldBitmap.onMouseOut = function(evt) {
      log('raus');
      _mouseover = false;
      _view.container().removeChild(_easementBitmap);
      module.Map.updateView();
    };
    
    _fieldBitmap.view = _view;
    
    var _easementBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/easement"));    
    var _buttonBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/button"));
    
    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      container.addChildAt(_fieldBitmap, 0);
      if (_selected) {
        _buttonBitmap.x = -AWE.Config.MAPPING_FORTRESS_SIZE;
        _buttonBitmap.y = +AWE.Config.MAPPING_FORTRESS_SIZE / 2;
        container.addChildAt(_buttonBitmap, 1);
      }
      if (_mouseover) {
        _easementBitmap.y = -AWE.Config.MAPPING_FORTRESS_SIZE;
        container.addChildAt(_easementBitmap, 2);
      }

      var pos = AWE.UI.Map.mc2vc(_view.position());        
      container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 1.4;
      container.alpha = alpha;

      _view.layer().addChild(container);
    };

    _view.select = function() {
      log('select', _view.id());
      if (module.Map.selectedView && module.Map.selectedView.unselect) {
        module.Map.selectedView.unselect();
      }
      _selected = true;
      module.Map.selectedView = _view;
      module.Map.updateView();
    }
    
    _view.unselect = function() {
      log('unselect', _view.id());
      _selected = false;
      module.Map.selectedView = null;
      _view.container().removeChildAt(1);
      module.Map.updateView();
    }
    
    return _view;
  };

    
  return module;
    
}(AWE.UI || {}));



