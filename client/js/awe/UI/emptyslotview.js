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
    
    my = my || {};
    
    my.typeName = "EmptySlotView";

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

/*    slotGraphics.endFill();   
      slotGraphics.beginStroke('rgb(0, 0, 0)');
      slotGraphics.drawRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);*/
      
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

      if (_selectShape) {
        _selectShape.visible = this.selected() || this.hovered();
        _selectShape.alpha = (this.selected() ? 1. : 0.2);
      }
    }

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



