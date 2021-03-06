/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createEmptySlotView = function(spec, my) {
    
    var slotShapeView = null;
    var _location = null;
    var _selectShape = null;
    
    var _frameRectShape = null;
    
    my = my || {};

    my.typeName = "EmptySlotView";
    my.locationType = "empty";

    var that = module.createSettlementView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      frame = frame || AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);      
      _super.initWithController(controller, frame);
      _location = location;
      
      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      _selectShape = new Shape(selectGraphics);  
      _selectShape.visible = false;  
      my.container.addChild(_selectShape);
                  
      var slotGraphics = new Graphics();
      slotGraphics.setStrokeStyle(1);
      slotGraphics.beginFill(AWE.Config.MAP_LOCATION_SPOT_COLOR);
      slotGraphics.drawEllipse(10, 5, AWE.Config.MAPPING_FORTRESS_SIZE - 20, AWE.Config.MAPPING_FORTRESS_SIZE / 2 - 10);

      slotGraphics.endFill();   
      slotGraphics.beginFill('rgba(255,255,255,0.01)');
      if (AWE.Config.MAP_DEBUG_FRAMES){
      slotGraphics.beginStroke('rgb(1,1,1)');
      }
      slotGraphics.drawEllipse(5-AWE.Config.MAPPING_FORTRESS_SIZE*0.325, (10-AWE.Config.MAPPING_FORTRESS_SIZE)/4, AWE.Config.MAPPING_FORTRESS_SIZE*1.5, AWE.Config.MAPPING_FORTRESS_SIZE);
      
      slotShapeView = AWE.UI.createShapeView();
      slotShapeView.initWithControllerAndGraphics(that, slotGraphics, frame);
      slotShapeView.onClick = that.onClick;
      slotShapeView.onMouseOver = that.onMouseOver;
      slotShapeView.onMouseOut = that.onMouseOut;
      
      my.container.width = my.frame.size.width;
      my.container.height = my.frame.size.height;
      
      my.container.addChild(slotShapeView.displayObject());
    };
    
    that.location = function() {
      return _location;
    };
    
    that.updateView = function() {
      _super.updateView();

      if (!_frameRectShape && AWE.Config.MAP_DEBUG_FRAMES) {
        var _frameRectGraphics = new Graphics();
        _frameRectGraphics.setStrokeStyle(1);
        _frameRectGraphics.beginStroke('rgb(255,255,255)');
        _frameRectGraphics.beginFill('rgba(255,255,255,0.2)');
        _frameRectGraphics.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height, 0);
        _frameRectShape = AWE.UI.createShapeView();
        _frameRectShape.initWithControllerAndGraphics(my.controller, _frameRectGraphics);
        _frameRectShape.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        that.addChildAt(_frameRectShape, 0);    
      }  

      if (_selectShape) {
        _selectShape.visible = this.selected() || this.hovered();
        _selectShape.alpha = (this.selected() ? 1. : 0.2);
      }
    }

    that.locationType = function() {
      return my.locationType;
    }

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



