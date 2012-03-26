/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createLocationsView = function(_node, _layer, _controller) {
    var that = {};

    var spec = {
      id: _node.id(),
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: _node.frame(),
      scaled: false,
      layer: _layer,
      controller: _controller,
    };

    var _node = _node;
    var _view = module.createView(spec);
    _view.detailLevel = function() {
      var frame = _view.controller().mc2vc(_view.frame());      
      if (frame.size.width < 128) {
        return 0;
      }
      else if (frame.size.width < 256) {
        return 1;
      }
      else if (frame.size.width < 512) {
        return 2;
      }
      else {
        return 3;
      }
    }

    var _locationCache = [];

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(frame);
      return AWE.Geometry.createPoint(
        (position.x - frame.origin.x)*transformedFrame.size.width/frame.size.width,
        (position.y - frame.origin.y)*transformedFrame.size.height/frame.size.height
      );
    };

  	that.setSelected = function(selected) {
  	  _selected = selected;
  	}

    that.redraw = function() {
      var frame = _view.controller().mc2vc(_view.frame());
      var container = _view.container();
      container.x = frame.origin.x;
      container.y = frame.origin.y;
      if (
        _node.isLeaf() && 
        _view.detailLevel() >= AWE.Config.MAP_LOCATION_MIN_DETAIL_LEVEL &&
        _node.region() != null &&
        _node.region().locations() != null
      ) {
        //
        container.removeAllChildren();
        //get locations
        var locations = _node.region().locations();
        //set up the container
        container.visible = true;
        //generate bitmaps for the new locations
        for (var i = _locationCache.length; i < locations.length; i++) {
          _locationCache[i]= { typeId: 0, bitmap: null };
        }
        _locationCache[0].typeId = locations[0].typeId();

        //replace the bitmaps if needed (check for type and level)
        for (var i = 0; i < _locationCache.length; i++) {
          if (locations[i].typeId() != _locationCache[i].typeId) {
            _locationCache[i].typeId = locations[i].typeId();
            var name = AWE.Config.MAP_LOCATION_TYPE_CODES[locations[i].typeId()];
            var level = locations[i].level();
            var modifier;
            if (level < 4) {
              modifier = "small";
            } else if (level < 8) {
              modifier = "middle";
            } else if (level < 11) {
              modifier = "big";
            } else {
              console.error("unknown level",level);
            }
            if (locations[i].typeId() == 0) {
              _locationCache[i].bitmap = null;
            } else if (name == "fortress") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/fortress/"+modifier));
            } else if (name == "settlement") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/colony/"+modifier));
            } else if (name == "outpost") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/outpost"));
            } else {
              console.error("unknown location type");
            }
            if (_locationCache[i].bitmap != null) {
              var bitmap = _locationCache[i].bitmap;
              bitmap.regX = bitmap.image.width/2;
              bitmap.regY = bitmap.image.height*0.9;
              bitmap.scaleX = 0.8;
              bitmap.scaleY = 0.8;
            }
          }
        }
        //add bitmaps to container + position update
        for (var i = 0; i < _locationCache.length; i++) {
          if (_locationCache[i].bitmap != null) {
            var pos = _globalToLocalCooridnates(locations[i].position());
            _locationCache[i].bitmap.x = pos.x;
            _locationCache[i].bitmap.y = pos.y;
            container.addChild(_locationCache[i].bitmap);
          }
        }
        //add container
        _view.layer().addChild(container);
      } else {
        container.visible = false;
      }
    }

    return that;
  }
          
  module.createFortressView = function(node, _layer, _controller) {

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

    var _selected = false;
    var _highlighted = false;
    
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

      _controller.viewClicked(_view);
    };

    _fieldBitmap.onMouseOver = function(evt) {
      _controller.viewMouseOver(_view);
      // _highlighted = true;
      // _view.controller().updateView();
    };
    _fieldBitmap.onMouseOut = function(evt) {
      _controller.viewMouseOut(_view);
      // _highlighted = false;
      // _view.container().removeChild(_easementBitmap);
      // _view.controller().updateView();
    };
    
    _fieldBitmap.view = _view;
    
    var _easementBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/easement"));
    _easementBitmap.y = -AWE.Config.MAPPING_FORTRESS_SIZE;
        
    var _ownerNameText = new Text(_node.region().ownerName(), "12px Arial", "#FFF");
    _ownerNameText.textAlign = "center";
    _ownerNameText.textBaseline = "top";
    _ownerNameText.x = AWE.Config.MAPPING_FORTRESS_SIZE / 2
    _ownerNameText.y = AWE.Config.MAPPING_FORTRESS_SIZE;
    
    //log('_ownerNameText', _ownerNameText.getMeasuredWidth());
    
    var _ownerNameGraphics = new Graphics();
    _ownerNameGraphics.setStrokeStyle(0);
    _ownerNameGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
    _ownerNameGraphics.drawRoundRect((AWE.Config.MAPPING_FORTRESS_SIZE - _ownerNameText.getMeasuredWidth()) / 2 - 5, AWE.Config.MAPPING_FORTRESS_SIZE - 4, _ownerNameText.getMeasuredWidth() + 10, _ownerNameText.getMeasuredLineHeight() + 10, 3);
    var _ownerNameShape = new Shape(_ownerNameGraphics);

    var _selectGraphics = new Graphics();
    _selectGraphics.setStrokeStyle(1);
    _selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
    _selectGraphics.beginFill(Graphics.getRGB(255,0,0));
    _selectGraphics.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
    var _selectShape = new Shape(_selectGraphics);    
    
    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };
    
    _view.node = function(){ return _node};

    _view.redraw = function() {

      var frame = _view.controller().mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      container.addChild(_fieldBitmap);
      // if (_selected) {
        // container.addChild(_enterButtonBitmap);
        // container.addChildAt(_selectShape, 0);
      // }
      if (_highlighted) {
        container.addChild(_easementBitmap);
      }
      container.addChildAt(_ownerNameText);
      container.addChildAt(_ownerNameShape);
      
      var pos = _view.controller().mc2vc(_view.position());        
      container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 1.4;
      container.alpha = alpha;

      _view.layer().addChild(container);
    };

    _view.select = function() {
      if (_view.controller().selectedView() && _view.controller().selectedView().unselect) {
        _view.controller().selectedView().unselect();
      }
      _selected = true;
      _view.controller().setSelectedView(_view);
      _view.controller().updateView();
    }
    
    _view.unselect = function() {
      _selected = false;
      _view.controller().setSelectedView(null);
      _view.container().removeChild(_enterButtonBitmap);
      _view.container().removeChild(_enterButtonText);
      _view.container().removeChild(_attackButtonBitmap);
      _view.container().removeChild(_attackButtonText);
      _view.container().removeChild(_selectShape);
      _view.controller().updateView();
    }
    
    return _view;
  };

    
  return module;
    
}(AWE.UI || {}));



