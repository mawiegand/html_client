/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
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
    var _container = module.createContainer();
    _container.initWithController(_view.controller());
    
    var _villiageSpotsShapes = [];
    for (var i = 0; i < 8; i++) {
      var s = new Shape();
      _villiageSpotsShapes.push(s);
      _container.displayObject().addChild(s);
    }

    that.container = function() { return _container; };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(frame);
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
      g.drawEllipse(p.x - AWE.Config.MAP_LOCATION_SPOT_WIDTH/2, p.y - AWE.Config.MAP_LOCATION_SPOT_HEIGHT/2, AWE.Config.MAP_LOCATION_SPOT_WIDTH, AWE.Config.MAP_LOCATION_SPOT_HEIGHT);
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
    that.update = function(hidden) {
      if (_node.isLeaf() && !hidden && _node.region() != null && _node.region().locations() != null) {
        _container.displayObject().visible = true;
        var locations = _node.region().locations();
        for (var i = 1; i < locations.length; i++) {
          if (i > 8) {
            console.error("there were more locations than expected");
          }
          _villiageSpotsShapes[i-1].graphics = _generateGraphics(locations[i], AWE.Config.MAP_LOCATION_SPOT_COLOR);
        }
      } else{
        _container.displayObject().visible = false;
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
    
    var _container = module.createContainer();
    _container.initWithController(_view.controller());
    
    var _regionStreetsContainer = new Container();
    _container.displayObject().addChild(_regionStreetsContainer);
    var _villageStreetsContainer = new Container();
    _container.displayObject().addChild(_villageStreetsContainer);

    var _regionStreets = [];
    var _villageStreets = [];

    that.container = function() { return _container; };
    that.regionStreets = function() {return _regionStreets; };

    var _globalToLocalCooridnates = function(position) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(frame);
      var trans = _view.controller().mc2vc(position);
      return AWE.Geometry.createPoint(
        trans.x - _view.frame().origin.x,
        trans.y - _view.frame().origin.y
      );
    };

    var _updateRegionStreets = function(hidden) {

      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(_node.frame());

      if (_node.isLeaf() && !hidden) {
        _regionStreetsContainer.visible = true;

        var neighbours = _node.getNeighbourNodes();

        var start = AWE.Geometry.createPoint(
          _view.frame().size.width / 2,
          _view.frame().size.height / 2
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
            _regionStreetsContainer.addChild(s.shape);
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
            if (_regionStreets[streetI]) {

              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x + extraDir.x, start.y + dir.y + extraDir.y);
              _regionStreets[streetI].update();
            }
            streetI++;

            if (_regionStreets[streetI]) {
              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x - extraDir.x, start.y + dir.y - extraDir.y);
              _regionStreets[streetI].update();
            }
            streetI++;

          } else {
            if (_regionStreets[streetI]) {
              _regionStreets[streetI].from = start;
              _regionStreets[streetI].to = AWE.Geometry.createPoint(start.x + dir.x, start.y + dir.y);
              _regionStreets[streetI].update();
            }
            streetI++;
          }
        }
      } else {
        _regionStreetsContainer.visible = false;
      }
    };

    var _updateVillageStreets = function(hidden) {
      var frame = _node.frame();
      var transformedFrame = _view.controller().mc2vc(_node.frame());

      if (!hidden && _node.region() != null && _node.region().locations() != null) {
        _villageStreetsContainer.visible = true;

        var locations = _node.region().locations();
        var start = AWE.Geometry.createPoint(
          transformedFrame.size.width / 2,
          transformedFrame.size.height / 2
        );
        
      
        
        //generate new streets if none exist
        if (_villageStreets.length == 0) {
          for (var i = 1; i < locations.length; i++) {
            var s = createStreet(start, start, AWE.Config.MAP_LOCATION_STREETS_COLOR, AWE.Config.MAP_LOCATION_STREETS_WIDTH);
            _villageStreets.push(s);
            _villageStreetsContainer.addChild(s.shape);
          }
        }
        //update the positions of the streets
        for (var i = 1; i < locations.length; i++) {
          _villageStreets[i-1].from = start;
          _villageStreets[i-1].to = _globalToLocalCooridnates(locations[i].position());
          _villageStreets[i-1].update();
        }

      } else {
        _villageStreetsContainer.visible = false;
      }
    };

    that.update = function(streetsHidden, villagesHidden) {
      if (_node.isLeaf()) { 
        _container.visible = true;
        _updateRegionStreets(streetsHidden);
        _updateVillageStreets(villagesHidden);
      } else {
        _container.visible = false;
      }
    };

    return that;
  };

  module.createRegionView = function(spec, my) {
    
    // private attributes and methods ////////////////////////////////////////

    var that;

    var _node = null;
    var _scaledContainer = null;
    var _nonScaledContainer = null;    
    var _backgroundImage = null;  
    var streetsManager = null;
    var villageSpotsManager = null;  
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};

    my.streetsHidden = true;
    my.VillagesHidden = true;

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
      updateView: that.superior('updateView'),
    }
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      _node = node;

      _scaledContainer = module.createContainer();
      _scaledContainer.initWithController(controller, frame);

      _nonScaledContainer = module.createContainer();      
      _nonScaledContainer.initWithController(controller, frame);
        
      _scaledContainer.name = _node.id();
      _scaledContainer.onClick = function (evt) {
        log('klick in container layer0');
      };
      
      this.setAutoscales(true);
      selectBackgroundImage(0);
      
      streetsManager = module.createStreetsManager(_node, this);
      villageSpotsManager = module.createVillageSpotsManager(_node, this);  
      
      _nonScaledContainer.addChild(streetsManager.container());
      _nonScaledContainer.addChild(villageSpotsManager.container()); 
    }

    
    that.node = function() { return _node; }

    that.setFrame = function(frame) { //console.log('set frame');
      _super.setFrame(frame);
      _scaledContainer.setFrame(frame);
      _nonScaledContainer.setFrame(frame);
    }
    
    /** model has changed, need to upate state of view */
    that.updateView = function() {
      _super.updateView();
      this.layoutSubviews();
    };

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
        if (_node.region().terrainId() == 1) {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/forest"+size);      
        }
        else if (_node.region().terrainId() == 2) {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/mountains"+size);      
        }
      /*  else if (_node.region().terrainId() == 3) {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/mud"+size);      
        }*/
        else {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/plain"+size);              
        }
      }
      else {                       // don't know terrain, yet. thus, select base tile
        newImage = AWE.UI.ImageCache.getImage("map/tiles/base"+size);
      }
      
      if (!_backgroundImage) {
        _backgroundImage = module.createImageView();
        _backgroundImage.initWithControllerAndImage(that.controller(), newImage);
        _backgroundImage.setContentMode(module.ViewContentModeNone);
        _scaledContainer.addChild(_backgroundImage);
      }
      else if (_backgroundImage.image() !== newImage) {
        _backgroundImage.setImage(newImage);
        _backgroundImage.setFrame(AWE.Geometry.createRect(0,0,newImage.width, newImage.height));
      }
    };
    


    var _debugText = null;
    var _settlementsIcon = null;
    var _settlementsText = null;
    var _armyStrengthIcon = null;
    var _armyStrengthText = null;
    var _regionNameText = null;

    var updateInformation = function(detail) { 
            
      if (!_debugText && detail > -1 && AWE.Config.MAP_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        _debugText = new Text();
        _debugText.font = "10px Arial";
        _debugText.text = "id " + _node.id().toString() + "\nqt" + _node.path();
        _nonScaledContainer.displayObject().addChild(_debugText);
      }
      if (_debugText && detail < 0) {
        _nonScaledContainer.displayObject().removeChild(_debugText);
        _debugText = null;
      } 
      if (_debugText) {
        _debugText.x = 4;
        _debugText.y = frame.size.height / 2.0;
      }
      
      if (!_settlementsIcon) {
        _settlementsIcon = module.createImageView();
        _settlementsIcon.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScaledContainer.addChild(_settlementsIcon);
        
        _settlementsText = new Text();
        _settlementsText.font = "12px Arial";
        _settlementsText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _settlementsText.text = _node.region() ? _node.region().countSettlements().toString() : _node.countSettlements().toString();
        _nonScaledContainer.displayObject().addChild(_settlementsText);
        
        _armyStrengthIcon =  module.createImageView();
        _armyStrengthIcon.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/region/icon"));
        _nonScaledContainer.addChild(_armyStrengthIcon);
        
        _armyStrengthText = new Text();
        _armyStrengthText.font = "12px Arial";
        _armyStrengthText.textBaseline = "top";

        //_settlementsText.maxWidth = _bgBitmap.image.width-_settlementsIcon.image.width;
        _armyStrengthText.text = _node.totalArmyStrength().toString();
        _nonScaledContainer.displayObject().addChild(_armyStrengthText);
        
      }
      if (_settlementsIcon) {
        if (detail < 1) {
          _settlementsIcon.setOrigin(AWE.Geometry.createPoint(0,0));
          _armyStrengthIcon.setOrigin(AWE.Geometry.createPoint(0,28));
        }
        else {
          _settlementsIcon.setOrigin(AWE.Geometry.createPoint(0,my.frame.size.height - 30));
          _armyStrengthIcon.setOrigin(AWE.Geometry.createPoint(my.frame.size.width / 2.0, my.frame.size.height - 30));                
        }
        
        _settlementsText.x = _settlementsIcon.frame().origin.x + _settlementsIcon.image().width;
        _settlementsText.y = _settlementsIcon.frame().origin.y + _settlementsIcon.image().height/2 - _settlementsText.getMeasuredLineHeight()/2;        
        _armyStrengthText.x = _armyStrengthIcon.frame().origin.x + _armyStrengthIcon.image().width;
        _armyStrengthText.y = _armyStrengthIcon.frame().origin.y + _armyStrengthIcon.image().height/2 - _armyStrengthText.getMeasuredLineHeight()/2;        
      }     
      
      if (!_regionNameText && detail >= 1 && _node.region()) {
        _regionNameText = new Text();
        _regionNameText.font = "12px Arial";
        _regionNameText.text = _node.region().name();
        _regionNameText.textBaseline = "top";
        _nonScaledContainer.displayObject().addChild(_regionNameText);
      }
      if (_regionNameText && detail < 1) {
        _nonScaledContainer.displayObject().removeChild(_regionNameText);
        _regionNameText = null;
      } 
      if (_regionNameText) {
        _regionNameText.x = 4;
        _regionNameText.y = 4;
      } 
    } 
    
    that.hideStreets = function() {
      if (!my.streetsHidden) {
        my.streetsHidden = true; 
        this.setNeedsLayout();
      }
    }
    
    that.showStreets = function() { 
      if (my.streetsHidden) {
        my.streetsHidden = false; 
        this.setNeedsLayout();
      }
    }

    that.hideVillages = function() {
      if (!my.villagesHidden) {
        my.villagesHidden = true; 
        this.setNeedsLayout();
      }
    }
    
    that.showVillages = function() { 
      if (my.villagesHidden) {
        my.villagesHidden = false; 
        this.setNeedsLayout();
      }
    }

    that.detailLevel = function() {
      if (my.frame.size.width < 128) {
        return 0;
      }
      else if (my.frame.size.width < 256) {
        return 1;
      }
      else if (my.frame.size.width < 512) {
        return 2;
      }
      else {
        return 3;
      }
    }

    that.autoscaleIfNeeded = function() {
      if (this.autoscales() && _backgroundImage) {
        _scaledContainer.setScaleX(my.frame.size.width / _backgroundImage.width());
        _scaledContainer.setScaleY(my.frame.size.width / _backgroundImage.width());
      }
    }
    
    that.layoutSubviews = function() {
      selectBackgroundImage(this.detailLevel());
      updateInformation(this.detailLevel());
      streetsManager.update(my.streetsHidden, my.villagesHidden);
      villageSpotsManager.update(my.villagesHidden);

      _super.layoutSubviews();
    }
    
    that.displayObject = function() {
      return  [ _scaledContainer.displayObject(), _nonScaledContainer.displayObject() ] ;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




