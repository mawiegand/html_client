/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createVillageSpotsManager = function(_node, _view) {
    var that = {};

    var _node = _node;
    var _view = _view;
    var _container = new Container();

    var _villiageSpotsShapes = [];
    for (var i = 0; i < 8; i++) {
      var s = new Shape();
      _villiageSpotsShapes.push(s);
      _container.addChild(s);
    }

    that.container = function() { return _container; };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(frame);
      return AWE.Geometry.createPoint(
        (position.x - frame.origin.x)*transformedFrame.size.width/frame.size.width,
        (position.y - frame.origin.y)*transformedFrame.size.height/frame.size.height
      );
    };

    /** generates a DisplayObject for a given villageSpot **/
    var _generateGraphics = function(location, color) {
      var p = _globalToLocalCooridnates(location.position());
      var g = new Graphics();
      g.setStrokeStyle(1);
      g.beginFill(color);
      g.drawEllipse(p.x - AWE.Config.MAP_VILLAGE_SPOT_WIDTH/2, p.y - AWE.Config.MAP_VILLAGE_SPOT_HEIGHT/2, AWE.Config.MAP_VILLAGE_SPOT_WIDTH, AWE.Config.MAP_VILLAGE_SPOT_HEIGHT);
      return g;
    };

    var _generateDebugCross = function(spot, color) {
      var length = 10;
      var g = new Graphics()
      g.setStrokeStyle(2);
      g.beginStroke(color);
      g.moveTo(spot.x-length, spot.y);
      g.lineTo(spot.x+length, spot.y);
      g.moveTo(spot.x, spot.y-length);
      g.lineTo(spot.x, spot.y+length);
      return new Shape(g);
    }

    /** Updates all village spot locations and generates new DisplayObjects in the container **/
    that.update = function() {
      if (_node.isLeaf() && _view.detailLevel() >= 2 && _node.region() != null && _node.region().locations() != null) {
        _container.visible = true;
        var locations = _node.region().locations();
        for (var i = 1; i < locations.length; i++) {
          if (i > 8) {
            console.error("there were more locations than expected");
          }
          _villiageSpotsShapes[i-1].graphics = _generateGraphics(locations[i], AWE.Config.MAP_VILLAGE_SPOT_COLOR);
        }
      } else{
        _container.visible = false;
      } 
    };

    return that;
  };

  module.createStreetsManager = function(_node, _view) {

    var that = {};

    var createStreet = function (from, to, color, stroke) {
      var that = {};

      that.from = from;
      that.to = to;
      that.color = color;
      that.stroke = stroke;
      that.shape = new Shape();

      that.getDirectionVector = function() {
        return {x:that.to.x - that.from.x, y:that.to.y - that.from.y};
      };

      that.update = function() {
        that.shape.graphics = new Graphics();
        that.shape.graphics.setStrokeStyle(stroke)
              .beginStroke(color)
              .moveTo(that.from.x, that.from.y)
              .lineTo(that.to.x, that.to.y)
              .endStroke()
              .closePath();
      }
      return that;
    };
    
    var _node = _node;
    var _container = new Container();
    var _view = _view;

    var _regionStreets = [];
    var _villageStreets = [];

    that.container = function() { return _container; };
    that.regionStreets = function() {return _regionStreets; };
    that.villiageSpots = function() { return _villiageSpots };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(frame);
      return AWE.Geometry.createPoint(
        (position.x - frame.origin.x)*transformedFrame.size.width/frame.size.width,
        (position.y - frame.origin.y)*transformedFrame.size.height/frame.size.height
      );
    };

    var _updateRegionStreets = function() {

      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(_node.frame());

      if (_node.isLeaf() && _view.detailLevel() > 0) {
        var neighbours = _node.getNeighbourNodes();

        var start = AWE.Geometry.createPoint(
          transformedFrame.size.width / 2,
          transformedFrame.size.height / 2
        );

        //generate the region streets if the don't exist yet
        if (_regionStreets.length == 0) {
          var numStreets = 0;
          for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i].level() == _node.level() && !neighbours[i].isLeaf()) {
              numStreets++;
            }
            numStreets++;
          }
          for (var i = 0; i < numStreets; i++) {
            var s = createStreet(start, start, AWE.Config.MAP_REGION_STREETS_COLOR, AWE.Config.MAP_REGION_STREETS_WIDTH);
            _regionStreets.push(s);
            _container.addChild(s.shape);
          }
        }

        //update the start and end of the streets
        var streetI = 0;
        for (var i = 0; i < neighbours.length; i++) {
          //get direction
          var iFrame = neighbours[i].frame();
          var dir = {
            x: iFrame.origin.x + iFrame.size.width/2 - frame.origin.x - frame.size.width/2,
            y: iFrame.origin.y + iFrame.size.height/2 - frame.origin.y - frame.size.height/2
          };

          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            if (dir.x > 0) dir.x = transformedFrame.size.width / 2;
            if (dir.x < 0) dir.x = transformedFrame.size.width / -2;
            dir.y = 0;
          } else {
            if (dir.y > 0) dir.y = transformedFrame.size.height / 2;
            if (dir.y < 0) dir.y = transformedFrame.size.height / -2;
            dir.x = 0;
          }

          if (neighbours[i].level() == _node.level() && !neighbours[i].isLeaf()) {
            var extraDir = {
              x: dir.y/2,
              y: dir.x/2
            };
            _regionStreets[streetI].from = start;
            _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x + extraDir.x, start.y + dir.y + extraDir.y);
            _regionStreets[streetI].update();
            streetI++;

            _regionStreets[streetI].from = start;
            _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x - extraDir.x, start.y + dir.y - extraDir.y);
            _regionStreets[streetI].update();
            streetI++;

          } else {
            _regionStreets[streetI].from = start;
            _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x, start.y + dir.y);
            _regionStreets[streetI].update();
            streetI++;
          }
        }
      }
    };

    var _updateVillageStreets = function() {
      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(_node.frame());

      if (_node.isLeaf() && _view.detailLevel() > 0 && _node.region() != null && _node.region().locations() != null) {
        var locations = _node.region().locations();
        var start = AWE.Geometry.createPoint(
          transformedFrame.size.width / 2,
          transformedFrame.size.height / 2
        );
        //generate new streets if none exist
        if (_villageStreets.length == 0) {
          for (var i = 1; i < locations.length; i++) {
            var s = createStreet(start, start, AWE.Config.MAP_VILLAGE_STREETS_COLOR, AWE.Config.MAP_VILLAGE_STREETS_WIDTH);
            _villageStreets.push(s);
            _container.addChild(s.shape);
          }
        }
        //update the positions of the streets
        for (var i = 1; i < locations.length; i++) {
          _villageStreets[i-1].from = start;
          _villageStreets[i-1].to = _globalToLocalCooridnates(locations[i].position());
          _villageStreets[i-1].update();
        }

      }
    };

    that.update = function() {
      if (_node.isLeaf() && _view.detailLevel() > 0) { 
        _container.visible = true;
        _updateRegionStreets();
        _updateVillageStreets();
      } else {
        _container.visible = false;
      }
    };

    return that;
  };

  module.createRegionView = function(_node, _layer) {
    
    var spec = {
      id: _node.id(),
      frame: _node.frame(),
      scaled: true,
      layer: _layer
    };
    
    var _view = module.createView(spec);
    _view.container().name = _view.id();
    _view.container().onClick = function (evt) {
      log('klick in container layer0');
    };

    var image = null;
    var _bgBitmap =null;
    
    //console.log('creating new view for node ' + _node.path());

    var selectBackgroundImage = function(detail) {
      var newImage = null;
      
      var size = '128';
      if (detail > 0) {
          size = '256';
      }
        /*else if (detail > 1) {
          size = '512';
        }*/
      
      if (!_node.isLeaf()) {       // not a leaf node, splits further
        newImage = AWE.UI.ImageCache.getImage("map/tiles/split"+size);
      }
      else if (_node.region()) {   // terrain available, select appropriate tile
        if (_node.region().terrainId() < 2) {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/forest"+size);      
        }
        else {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/plain"+size);              
        }
      }
      else {                       // don't know terrain, yet. thus, select base tile
        newImage = AWE.UI.ImageCache.getImage("map/tiles/base"+size);
      }
      
      if (newImage != image) {
        image = newImage;
        if (_bgBitmap) {
          _view.container().removeChildAt(0);
        }
        _bgBitmap = new Bitmap(image);
        _view.container().addChildAt(_bgBitmap, 0);
      }    
    };
    
    selectBackgroundImage(0);

    var _nonScalingContainer = new Container();


    var _debugText = null;
    var _settlementsIcon = null;
    var _settlementsText = null;
    var _armyStrengthIcon = null;
    var _armyStrengthText = null;
    var _regionNameText = null;

    var updateInformation = function(detail) {
      
      var frame = AWE.UI.Map.mc2vc(_view.frame());      
      
      if (!_debugText && detail > -1 && AWE.Config.MAP_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        _debugText = new Text();
        _debugText.font = "10px Arial";
        _debugText.text = "id " + _node.id().toString() + "\nqt" + _node.path();
        _nonScalingContainer.addChild(_debugText);
      }
      if (_debugText && detail < 0) {
        _nonScalingContainer.removeChild(_debugText);
        _debugText = null;
      } 
      if (_debugText) {
        _debugText.x = 4;
        _debugText.y = frame.size.height / 2.0;
      }
      
      if (!_settlementsIcon) {
        _settlementsIcon = new Bitmap(AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScalingContainer.addChild(_settlementsIcon);
        
        _settlementsText = new Text();
        _settlementsText.font = "12px Arial";
        _settlementsText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _settlementsText.text = _node.region() ? _node.region().countSettlements().toString() : _node.countSettlements().toString();
        _nonScalingContainer.addChild(_settlementsText);
        
        _armyStrengthIcon = new Bitmap(AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScalingContainer.addChild(_armyStrengthIcon);
        
        _armyStrengthText = new Text();
        _armyStrengthText.font = "12px Arial";
        _armyStrengthText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _armyStrengthText.text = _node.totalArmyStrength().toString();
        _nonScalingContainer.addChild(_armyStrengthText);
        
      }
      if (_settlementsIcon) {
        if (detail < 1) {
          _settlementsIcon.x = 0;
          _settlementsIcon.y = 0;       
          _armyStrengthIcon.x = 0;
          _armyStrengthIcon.y = 28; 
        }
        else {
          _settlementsIcon.x = 0;
          _settlementsIcon.y = frame.size.height - 30;                  
          _armyStrengthIcon.x = frame.size.width / 2.0;
          _armyStrengthIcon.y = frame.size.height - 30;                  
        }
        
        _settlementsText.x = _settlementsIcon.x + _settlementsIcon.image.width;
        _settlementsText.y = _settlementsIcon.y + _settlementsIcon.image.height/2 - _settlementsText.getMeasuredLineHeight()/2;        
        _armyStrengthText.x = _armyStrengthIcon.x + _armyStrengthIcon.image.width;
        _armyStrengthText.y = _armyStrengthIcon.y + _armyStrengthIcon.image.height/2 - _armyStrengthText.getMeasuredLineHeight()/2;        
      }     
      
      if (!_regionNameText && detail >= 1 && _node.region()) {
        _regionNameText = new Text();
        _regionNameText.font = "12px Arial";
        _regionNameText.text = _node.region().name();
        _regionNameText.textBaseline = "top";
        _nonScalingContainer.addChild(_regionNameText);
      }
      if (_regionNameText && detail < 1) {
        _nonScalingContainer.removeChild(_regionNameText);
        _regionNameText = null;
      } 
      if (_regionNameText) {
        _regionNameText.x = 4;
        _regionNameText.y = 4;
      } 
    }
    
    //streets
    var streetsManager = module.createStreetsManager(_node, _view);
    _nonScalingContainer.addChild(streetsManager.container());

    //village spots
    var villageSpotsManager = module.createVillageSpotsManager(_node, _view);
    _nonScalingContainer.addChild(villageSpotsManager.container());

    _view.position = function() {
      return _view.frame().origin;
    };
    
    _view.detailLevel = function() {
      var frame = AWE.UI.Map.mc2vc(_view.frame());      
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

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      //check for correct background image
      selectBackgroundImage(_view.detailLevel());
      updateInformation(_view.detailLevel());

      
      //scaling container
      container.scaleX = frame.size.width / _bgBitmap.image.width;
      container.scaleY = frame.size.height / _bgBitmap.image.height;
      container.x = frame.origin.x;
      container.y = frame.origin.y;
      
      container.alpha = alpha;

      //non scaling container
      _nonScalingContainer.x = frame.origin.x;
      _nonScalingContainer.y = frame.origin.y;

      _nonScalingContainer.alpha = alpha;

      //villiagespots
      villageSpotsManager.update();

      //streets
      streetsManager.update();

      //add to layer
      _view.layer().addChild(container);
      _view.layer().addChild(_nonScalingContainer);
    };

    _view.unselect = function() {
      log('unselect');
      _selected = false;
      module.Map.selectedView = null;
      _view.container().removeChildAt(1);
      module.Map.updateView();
    }
            
    return _view;
  };

    
  return module;
    
}(AWE.UI || {}));




