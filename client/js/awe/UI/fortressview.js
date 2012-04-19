/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createFortressView = function(spec, my) {
    
    var that;
        
    var _node = null;
    
    var imageView = null;
    var labelView = null;
    var selectShape = null;
    var _flagView = null;
    var _poleShape = null;
    
    my = my || {};
    
    my.typeName = 'FortressView';
    
    that = module.createSettlementView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setAlpha: AWE.Ext.superior(that, "setAlpha"),
      setSelected: AWE.Ext.superior(that, "setSelected"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      _node = node;
                  
      var fortressImageName = 'map/fortress/small';
      if (_node.region() && _node.region().fortressLevel() > 3) {
        fortressImageName = 'map/fortress/middle';
      }
      if (_node.region() && _node.region().fortressLevel() > 7) {
        fortressImageName = 'map/fortress/large';
      }

      var allianceId = _node.region().allianceId();
/*      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
//      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(27, 51, 9, 1, 0);
      _poleShape = new Shape(_poleGraphics);  
      my.container.addChild(_poleShape);*/
            
      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0, AWE.Config.MAPPING_FORTRESS_SIZE / 2 + 20, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      selectShape = new Shape(selectGraphics);  
      selectShape.visible = false;  
      my.container.addChild(selectShape);
      
      imageView = AWE.UI.createImageView();
      imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(fortressImageName));
      imageView.setContentMode(module.ViewContentModeNone);
      imageView.setFrame(AWE.Geometry.createRect(0, 20, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      imageView.onClick = that.onClick;
      imageView.onMouseOver = that.onMouseOver;
      imageView.onMouseOut = that.onMouseOut;
      my.container.addChild(imageView.displayObject());
      
      _flagView = AWE.UI.createAllianceFlagView();
      _flagView.initWithController(controller);
      _flagView.setFrame(AWE.Geometry.createRect(27, 53, 8, 13));
      _flagView.setAllianceId(allianceId);
      _flagView.setDirection('down');
      _flagView.onClick = that.onClick;
      _flagView.onMouseOver = that.onMouseOver;
      _flagView.onMouseOut = that.onMouseOut;
      my.container.addChild(_flagView.displayObject());
      _flagView.updateView();

      labelView = AWE.UI.createLabelView();
      var ownerName = _node.region().ownerName() + (_node.region().allianceTag() ? " | " +  _node.region().allianceTag() : "");

      labelView.initWithControllerAndLabel(controller, ownerName, true);
      labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE + 20, AWE.Config.MAPPING_FORTRESS_SIZE, 20));      
      labelView.onClick = that.onClick;
      labelView.onMouseOver = that.onMouseOver;
      labelView.onMouseOut = that.onMouseOut;
      my.container.addChild(labelView.displayObject());
      
      my.container.width = my.frame.size.width = AWE.Config.MAPPING_FORTRESS_SIZE;
      my.container.height = my.frame.size.height = AWE.Config.MAPPING_FORTRESS_SIZE + 44;
    };
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    that.setSelected = function(selected) {
      _super.setSelected(selected);
      selectShape.visible = selected;
    };
    
    that.location = function() {
      return _node.region().location(0);
    }
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));



