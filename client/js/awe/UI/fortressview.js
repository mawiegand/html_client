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
  
  module.createLocationsView2 = function(spec, my) {
    
    var that;
        
    var _node = null;
    var _selected = false;
    var _container = null;
    
    var imageView = null;
    var labelView = null;
    var selectShape = null;
    
    var _locationCache = [];
    
    my = my || {};
    
    that = module.createView2(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, frame, node) {
      _super.initWithController(controller, frame);
      _node = node;
      
      _container = new Container();      

      // var fortressImageName = 'map/fortress/small';
      // if (_node.region() && _node.region().fortressLevel() > 3) {
        // fortressImageName = 'map/fortress/middle';
      // }
      // if (_node.region() && _node.region().fortressLevel() > 7) {
        // fortressImageName = 'map/fortress/large';
      // }
//             
      // var selectGraphics = new Graphics();
      // selectGraphics.setStrokeStyle(1);
      // selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      // selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      // selectGraphics.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      // selectShape = new Shape(selectGraphics);  
      // selectShape.alpha = 0;  
      // _container.addChild(selectShape);
//       
      // imageView = AWE.UI.createImageView();
      // imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(fortressImageName), AWE.Geometry.createRect(
          // (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // AWE.Config.MAPPING_FORTRESS_SIZE,
          // AWE.Config.MAPPING_FORTRESS_SIZE
        // )
      // );
      // imageView.setContentMode(module.ViewContentModeNone);
      // imageView.onClick = that.onClick;
      // imageView.onMouseOver = that.onMouseOver;
      // imageView.onMouseOut = that.onMouseOut;
      // _container.addChild(imageView.displayObject());
// 
      // labelView = AWE.UI.createLabelView();
      // labelView.initWithControllerAndLabel(controller, AWE.Geometry.createRect(
          // frame.size.width / 2,
          // (frame.size.height + AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // AWE.Config.MAPPING_FORTRESS_SIZE,
          // AWE.Config.MAPPING_FORTRESS_SIZE
        // ), _node.region().ownerName(), true);
      // _container.addChild(labelView.displayObject());
      
      if (
        _node.isLeaf() && 
        detailLevel() >= AWE.Config.MAP_LOCATION_MIN_DETAIL_LEVEL &&
        _node.region() != null &&
        _node.region().locations() != null
      ) {
        //get locations
        var locations = _node.region().locations();
        
        //generate bitmaps for the new locations
        for (var i = _locationCache.length; i < locations.length; i++) {
          _locationCache[i] = { typeId: 0, bitmap: null };
        }
        
        _locationCache[0].typeId = locations[0].typeId();
        log('_locationCache', _locationCache);

        //replace the bitmaps if needed (check for type and level)
        for (var i = 0; i < _locationCache.length; i++) {
          if (locations[i].typeId() != _locationCache[i].typeId) {
            
            _locationCache[i].typeId = locations[i].typeId();
            var name = AWE.Config.MAP_LOCATION_TYPE_CODES[locations[i].typeId()];
            var level = locations[i].level();
            var modifier;
            
            if (level < 4) {
              modifier = "small";
            }
            else if (level < 8) {
              modifier = "middle";
            }
            else if (level < 11) {
              modifier = "big";
            }
            else {
              console.error("unknown level",level);
            }
            
            if (locations[i].typeId() == 0) {
              _locationCache[i].bitmap = null;
            }
            else if (name == "fortress") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/fortress/"+modifier));
            }
            else if (name == "settlement") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/colony/"+modifier));
            }
            else if (name == "outpost") {
              _locationCache[i].bitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/outpost"));
            }
            else {
              console.error("unknown location type");
            }
            
            if (_locationCache[i].bitmap != null) {
              var bitmap = _locationCache[i].bitmap;
              // bitmap.regX = bitmap.image.width/2;
              // bitmap.regY = bitmap.image.height*0.9;
              // bitmap.scaleX = 0.8;
              // bitmap.scaleY = 0.8;
            }
          }
        }
        
        //add bitmaps to container + position update
        for (var i = 1; i < _locationCache.length; i++) {
          if (_locationCache[i].bitmap != null) {
            var frame = _node.frame(); 
            var rel = AWE.Geometry.createPoint(
              locations[i].position().x - frame.origin.x - frame.size.width / 2,
              locations[i].position().y - frame.origin.y - frame.size.height / 2
            );
            
            var point = my.controller.mc2vc(rel);
            log('point', rel);
            _locationCache[i].bitmap.x = point.x;
            _locationCache[i].bitmap.y = point.y;
            _container.addChild(_locationCache[i].bitmap);
          }
        }
      } else {
        // _container.visible = false;
      }

      _container.x = my.frame.origin.x + my.frame.size.width / 2;
      _container.y = my.frame.origin.y + my.frame.size.height / 2;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      // imageView.setFrame(
        // AWE.Geometry.createRect(
          // (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // AWE.Config.MAPPING_FORTRESS_SIZE,
          // AWE.Config.MAPPING_FORTRESS_SIZE
        // )
      // );
      // labelView.setFrame(
        // AWE.Geometry.createRect(
          // frame.size.width / 2,
          // (frame.size.height + AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          // AWE.Config.MAPPING_FORTRESS_SIZE,
          // AWE.Config.MAPPING_FORTRESS_SIZE
        // )
      // );
      // selectShape.x = (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2;
      // selectShape.y = (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2;

      _container.x = frame.origin.x + frame.size.width / 2;
      _container.y = frame.origin.y + frame.size.height / 2;
    }
    
    var _globalToLocalCoordinates = function(position) {
      var trans = my.controller.mc2vc(position);
      return AWE.Geometry.createPoint(
        trans.x - my.frame.origin.x,
        trans.y - my.frame.origin.y
      );
    };

    that.displayObject = function() {
      return _container;
    };
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    // that.setSelected = function(selected) {
      // _selected = selected;
      // selectShape.alpha = _selected ? 1 : 0;
    // };
//     
    that.center = function() {
      return AWE.Geometry.createPoint(
        my.frame.origin.x + (my.frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
        my.frame.origin.y + (my.frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2
      );
    };
    
    var detailLevel = function() {
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
    };
    
    
    /** actions */
   
    // that.onClick = function() {
      // my.controller.viewClicked(that);
    // };
//     
    // that.onMouseOver = function(evt){
      // my.controller.fortressMouseOver(that);
    // };
// 
    // that.onMouseOut = function(evt){
      // my.controller.fortressMouseOut(that);
    // };

    return that;
  };

  module.createFortressView = function(spec, my) {
    
    var that;
        
    var _node = null;
    var _selected = false;
    var _container = null;
    
    var imageView = null;
    var labelView = null;
    var selectShape;
    
    my = my || {};
    
    that = module.createView2(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, frame, node) {
      _super.initWithController(controller, frame);
      _node = node;
      
      _container = new Container();      

      var fortressImageName = 'map/fortress/small';
      if (_node.region() && _node.region().fortressLevel() > 3) {
        fortressImageName = 'map/fortress/middle';
      }
      if (_node.region() && _node.region().fortressLevel() > 7) {
        fortressImageName = 'map/fortress/large';
      }
            
      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      selectShape = new Shape(selectGraphics);  
      selectShape.alpha = 0;  
      _container.addChild(selectShape);
      
      imageView = AWE.UI.createImageView();
      imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(fortressImageName), AWE.Geometry.createRect(
          (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        )
      );
      imageView.setContentMode(module.ViewContentModeNone);
      imageView.onClick = that.onClick;
      imageView.onMouseOver = that.onMouseOver;
      imageView.onMouseOut = that.onMouseOut;
      _container.addChild(imageView.displayObject());

      labelView = AWE.UI.createLabelView();
      labelView.initWithControllerAndLabel(controller, AWE.Geometry.createRect(
          frame.size.width / 2,
          (frame.size.height + AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        ), _node.region().ownerName(), true);
      _container.addChild(labelView.displayObject());
      
      _container.x = that.center().x;
      _container.y = that.center().y;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      imageView.setFrame(
        AWE.Geometry.createRect(
          (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        )
      );
      labelView.setFrame(
        AWE.Geometry.createRect(
          frame.size.width / 2,
          (frame.size.height + AWE.Config.MAPPING_FORTRESS_SIZE) / 2,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        )
      );
      selectShape.x = (frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2;
      selectShape.y = (frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2;
    }
    
    that.displayObject = function() {
      return _container;
    };
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    that.setSelected = function(selected) {
      _selected = selected;
      selectShape.alpha = _selected ? 1 : 0;
    };
    
    that.center = function() {
      return AWE.Geometry.createPoint(my.frame.origin.x + (my.frame.size.width - AWE.Config.MAPPING_FORTRESS_SIZE) / 2, my.frame.origin.y + (my.frame.size.height - AWE.Config.MAPPING_FORTRESS_SIZE) / 2);
    };
    
    /** actions */
   
    that.onClick = function() {
      my.controller.viewClicked(that);
    };
    
    that.onMouseOver = function(evt){
      my.controller.fortressMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.fortressMouseOut(that);
    };

    return that;
  };
    
  return module;
    
}(AWE.UI || {}));



