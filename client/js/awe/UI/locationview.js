/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createLocationView = function(spec, my) {
    
    var that;
        
    var _location = null;
    var _selected = false;
    var _container = null;
    
    var imageView = null;
    var labelView = null;
    var selectShape;
    
    my = my || {};
    
    that = module.createView(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
      setAlpha: that.superior("setAlpha"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      _super.initWithController(controller, frame);
      _location = location;
                  
      _container = new Container();      

      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      selectShape = new Shape(selectGraphics);  
      selectShape.alpha = 0;  
      _container.addChild(selectShape);
      
      var name = AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()];
      var level = location.level();
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
      
      if (location.typeId() != 0) {
        
        if (name == "fortress") {
          imageName = "map/fortress/";
        }
        else if (name == "settlement") {
          imageName = "map/colony/" + modifier;
        }
        else if (name == "outpost") {
          imageName = "map/outpost";
        }
        else {
          console.error("unknown location type");
        }
              
        imageView = AWE.UI.createImageView();
        imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(imageName));
        imageView.setContentMode(module.ViewContentModeNone);
        imageView.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
        imageView.onClick = that.onClick;
        imageView.onMouseOver = that.onMouseOver;
        imageView.onMouseOut = that.onMouseOut;
        _container.addChild(imageView.displayObject());

        labelView = AWE.UI.createLabelView();
        labelView.initWithControllerAndLabel(controller, _location.name(), true);
        labelView.setFrame(AWE.Geometry.createRect(AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, 24));      
        _container.addChild(labelView.displayObject());
      }
                  
      if (!frame) {
        that.resizeToFit();        
      }
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
    
    that.setAlpha = function(alpha) {
      _super.setAlpha(alpha);
      _container.visible = (alpha !== 0);
      _container.alpha = alpha;
    }
   
    that.setCenter = function(center) {
      my.frame.origin.x = center.x - my.frame.size.width / 2;
      my.frame.origin.y = center.y - my.frame.size.height / 2;
      that.setFrame(my.frame);
    }
    
    that.resizeToFit = function() {
      my.frame.size.width = AWE.Config.MAPPING_FORTRESS_SIZE;
      my.frame.size.height = AWE.Config.MAPPING_FORTRESS_SIZE + 24;
    };
    
    that.displayObject = function() {
      return _container;
    };
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    that.setSelected = function(selected) {
      _selected = selected;
      selectShape.alpha = _selected ? 1 : 0;
    };
        
    /** actions */
   
    that.onClick = function() {
      // my.controller.viewClicked(that);
    };
    
    that.onMouseOver = function(evt){
      // my.controller.fortressMouseOver(that);
    };

    that.onMouseOut = function(evt){
      // my.controller.fortressMouseOut(that);
    };

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



