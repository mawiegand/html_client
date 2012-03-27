/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createDetailView = function(spec, my) {

    var that;

    my = my || {};
    
    var ownerLabelView = null;
    var allianceLabelView = null;
    
    that = module.createView2(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      
            log('frame', frame);

      _container = new Container()
      
      var node = controller.selectedView().node();
      var region = node.region();

      var backgroundShapeGraphics = new Graphics();
      backgroundShapeGraphics.setStrokeStyle(0);
      backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundShapeGraphics.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height, 5);
      var backgroundShape = new Shape(backgroundShapeGraphics);    
      _container.addChild(backgroundShape);

      ownerLabelView = AWE.UI.createLabelView();
      ownerLabelView.initWithControllerAndLabel(controller, region.ownerName(), false);
      ownerLabelView.setFrame(AWE.Geometry.createRect(50, 15, 50, 24));      
      _container.addChild(ownerLabelView.displayObject());

      allianceLabelView = AWE.UI.createLabelView();
      allianceLabelView.initWithControllerAndLabel(controller, region.allianceTag(), false);
      allianceLabelView.setFrame(AWE.Geometry.createRect(50, 65, 50, 24));      
      _container.addChild(allianceLabelView.displayObject());

      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
    
    that.displayObject = function() {
      return _container;
    };
    
    /** actions */
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




