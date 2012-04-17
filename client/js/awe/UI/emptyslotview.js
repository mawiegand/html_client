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
      slotGraphics.beginStroke(Graphics.getRGB(0,0,0));
      slotGraphics.beginFill(Graphics.getRGB(255,255,222));
      slotGraphics.drawEllipse(10, AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE - 20, AWE.Config.MAPPING_FORTRESS_SIZE / 2 - 10);
      slotShapeView = AWE.UI.createShapeView();
      slotShapeView.initWithControllerAndGraphics(that, slotGraphics, frame);
      slotShapeView.onClick = that.onClick;
      slotShapeView.onMouseOver = that.onMouseOver;
      slotShapeView.onMouseOut = that.onMouseOut;
      my.container.addChild(slotShapeView.displayObject());
    };
    
    that.location = function() {
      return _location;
    };

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



