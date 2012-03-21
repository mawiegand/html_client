/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createVillageSpotsManager = function(_node, _view, _streets) {
    var that = {};

    var _node = _node;
    var _view = _view;
    var _container = new Container();
    var _streets = _streets;
    var _villiageSpots = [];

    that.container = function() { return _container; };
    that.villageSpots = function() { return _villiageSpots; };

    /** Returns the offset vector that is needed form the border for the village spots.
     *  Based on AWE.Config.MAP_VILLAGE_SPOT_BORDER_MARGIN and the direction of a street. **/
    var _getBorderOffset = function(dir) {
      if (Math.abs(dir.x) > Math.abs(dir.y)) {
        return { x: -1*AWE.Config.MAP_VILLAGE_SPOT_BORDER_MARGIN*dir.x, y: 0};
      } else {
        return {x:0,  y: -1*AWE.Config.MAP_VILLAGE_SPOT_BORDER_MARGIN*dir.y};
      }
    };

    var _getDirOffset = function(street, streetDir, offsetPoint) {
      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(_node.frame());

      var p;
      if (Math.abs(streetDir.x) > Math.abs(streetDir.y)) {
        p = { x: street.to.x, y: transformedFrame.size.height*3/4 };
      } else {
        p = { x: transformedFrame.size.width*3/4, y: street.to.y };
      }
      _container.addChild(_generateDebugCross(p, "#F0F"));
      var v = {
        x: street.from.x - p.x,
        y: street.from.y - p.y
      };

      var alpha = 0.0;
      if (Math.abs(streetDir.x) > Math.abs(streetDir.y)) {
        alpha = (offsetPoint.x - p.x)/v.x;
      } else {
        alpha = (offsetPoint.y - p.y)/v.y;
      }

      return {
        x: (p.x + v.x*alpha - offsetPoint.x)*2/3,
        y: (p.y + v.y*alpha - offsetPoint.y)*2/3
      }

    };
    /** generates a DisplayObject for a given villageSpot **/
    var _generateDisplayObject = function(spot, color) {
      var g = new Graphics();
      g.setStrokeStyle(1);
      g.beginFill(color);
      g.drawEllipse(spot.x - AWE.Config.MAP_VILLAGE_SPOT_WIDTH/2, spot.y - AWE.Config.MAP_VILLAGE_SPOT_HEIGHT/2, AWE.Config.MAP_VILLAGE_SPOT_WIDTH, AWE.Config.MAP_VILLAGE_SPOT_HEIGHT);
      return new Shape(g);
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

      _villiageSpots = [];
      that.container().removeAllChildren();
      if (_node.isLeaf() && _view.detailLevel() >= 2) {
        //update the spots
        for (var i = 0; i < _streets.regionStreets().length; i++) {
          var curStreets = _streets.regionStreets()[i];
          if (curStreets.length > 2 || curStreets.length < 1) {
            console.error("not suported number of connecting streets");
          } else {
            var street = curStreets[0];
            var directionVector = street.getDirectionVector();
            var offsetPoint = _getBorderOffset(directionVector);
            if (curStreets.length < 2) {
              offsetPoint.x += street.to.x;
              offsetPoint.y += street.to.y;
            } else {
              var sumTo = {x: 0, y:0 };
              for (var i2 = 0; i2 < curStreets.length; i2++) {
                sumTo.x += curStreets[i2].to.x;
                sumTo.y += curStreets[i2].to.y;
              }
              sumTo.x /= curStreets.length;
              sumTo.y /= curStreets.length;
              offsetPoint.x += sumTo.x;
              offsetPoint.y += sumTo.y;

              _container.addChild(_generateDebugCross(sumTo, "#0FF"));
            }

            _container.addChild(_generateDebugCross(offsetPoint, "#00F"));

            var dirOffset = _getDirOffset(street, directionVector, offsetPoint);
            //generate two village spots
            var spot = AWE.Geometry.createPoint(
              offsetPoint.x + dirOffset.x,
              offsetPoint.y + dirOffset.y
            );
            _villiageSpots.push(spot);
            spot = AWE.Geometry.createPoint(
              offsetPoint.x - dirOffset.x,
              offsetPoint.y - dirOffset.y
            );
            _villiageSpots.push(spot);
          }
        }
        //generate the needed DisplayObject
        for (var i = 0; i < _villiageSpots.length; i++) {
          _container.addChild(_generateDisplayObject(_villiageSpots[i], AWE.Config.MAP_VILLAGE_SPOT_COLOR));
        }
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

      that.getDirectionVector = function() {
        return {x:that.to.x - that.from.x, y:that.to.y - that.from.y};
      };

      that.generateGraphicObject = function() {
        var shape = new Shape();
            shape.graphics.setStrokeStyle(stroke)
              .beginStroke(color)
              .moveTo(from.x, from.y)
              .lineTo(to.x, to.y)
              .endStroke()
              .closePath();
        return shape;
      };
      return that;
    };
    
    var _node = _node;
    var _container = new Container();
    var _view = _view;

    var _regionStreets = [];

    that.container = function() { return _container; };
    that.regionStreets = function() {return _regionStreets; };
    that.villiageSpots = function() { return _villiageSpots };

    that.updateRegionStreets = function() {

      _regionStreets = [];
      _container.removeAllChildren();

      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(_node.frame());

      if (_node.isLeaf() && _view.detailLevel() > 0) {
        var neighbours = _node.getNeighbourNodes();
        var start = AWE.Geometry.createPoint(
          transformedFrame.size.width / 2,
          transformedFrame.size.height / 2
        );

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

            var street0 = createStreet(
              start, 
              AWE.Geometry.createPoint(start.x + dir.x + extraDir.x, start.y + dir.y + extraDir.y),
              AWE.Config.MAP_REGION_STREETS_COLOR,
              AWE.Config.MAP_REGION_STREETS_WIDTH
            );
            that.container().addChild(street0.generateGraphicObject());
            var street1 = createStreet(
              start, 
              AWE.Geometry.createPoint(start.x + dir.x - extraDir.x, start.y + dir.y - extraDir.y),
              AWE.Config.MAP_REGION_STREETS_COLOR,
              AWE.Config.MAP_REGION_STREETS_WIDTH
            );
            that.container().addChild(street1.generateGraphicObject());

            _regionStreets.push([street0, street1]);

          } else {
            var street = createStreet(
              start, 
              AWE.Geometry.createPoint(start.x + dir.x, start.y + dir.y),
              AWE.Config.MAP_REGION_STREETS_COLOR,
              AWE.Config.MAP_REGION_STREETS_WIDTH
            );
            _regionStreets.push([street]);
            that.container().addChild(street.generateGraphicObject());
          }
        }
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
    var villageSpotsManager = module.createVillageSpotsManager(_node, _view, streetsManager);
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

      //streets
      streetsManager.updateRegionStreets();

      //villiagespots
      villageSpotsManager.update();

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




