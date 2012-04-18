/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createEmptySlotView = function(spec, my) {
    
    var slotShapeView = null;
    var _location = null;
    my = my || {};
    
    my.typeName = "EmptySlotView";

    var that = module.createSettlementView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      frame = frame || AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE);      
      _super.initWithController(controller, frame);
      _location = location;
                  
      var slotGraphics = new Graphics();
      slotGraphics.setStrokeStyle(1);
      slotGraphics.beginFill(AWE.Config.MAP_LOCATION_SPOT_COLOR);
      slotGraphics.drawEllipse(10, AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE - 20, AWE.Config.MAPPING_FORTRESS_SIZE / 2 - 10);

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

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



