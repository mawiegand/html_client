/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createOutpostView = function(spec, my) {
    
    var that;
        
    var _location = null;
    
    var imageView = null;
    var labelView = null;
    var selectShape;
    
    my = my || {};

    that = module.createSettlementView(spec, my);

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
                  
      my.container = new Container();      

      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0,  AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      selectShape = new Shape(selectGraphics);  
      selectShape.alpha = 0;  
      my.container.addChild(selectShape);
      
      var name = AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()];
      var level = location.level();
      
      imageView = AWE.UI.createImageView();
      imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/outpost"));
      imageView.setContentMode(module.ViewContentModeNone);
      imageView.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      imageView.onClick = that.onClick;
      imageView.onMouseOver = that.onMouseOver;
      imageView.onMouseOut = that.onMouseOut;
      my.container.addChild(imageView.displayObject());

      labelView = AWE.UI.createLabelView();
      labelView.initWithControllerAndLabel(controller, _location.name(), true);
      labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, 16));      
      my.container.addChild(labelView.displayObject());
                  
      if (!frame) {
        that.resizeToFit();        
      }
    };
    
    that.resizeToFit = function() {
      my.frame.size.width = AWE.Config.MAPPING_FORTRESS_SIZE;
      my.frame.size.height = AWE.Config.MAPPING_FORTRESS_SIZE + 24;
    };
    
    /** newly intotruced methods */
    
    that.location = function() { return _location; };
    
        
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



