/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createBaseView = function(spec, my) {
    
    var that;
        
    var _location = null;
    var _container = null;
    
    var imageView = null;
    var labelView = null;
    var _selectShape = null;
    var _poleFlag = null;
    var _poleShape = null;
    
    my = my || {};
   
    my.typeName = "BaseView";
    
    that = module.createSettlementView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      _super.initWithController(controller, frame);
      _location = location;
                  
      var selectGraphics = new Graphics();
      selectGraphics.setStrokeStyle(1);
      selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
      selectGraphics.beginFill(Graphics.getRGB(255,0,0));
      selectGraphics.drawEllipse(0, AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
      _selectShape = new Shape(selectGraphics);  
      _selectShape.visible = false;  
      my.container.addChild(_selectShape);
      
      var allianceId = _location.allianceId();
      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(44, 0, 2, 48, 0);
      _poleShape = new Shape(_poleGraphics);  
      my.container.addChild(_poleShape);

      var level = location.level();
      
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
      
      var imageName = "map/colony/" + modifier;
              
      imageView = AWE.UI.createImageView();
      imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(imageName));
      imageView.setContentMode(module.ViewContentModeNone);
      imageView.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      imageView.onClick = that.onClick;
      imageView.onMouseOver = that.onMouseOver;
      imageView.onMouseOut = that.onMouseOut;
      my.container.addChild(imageView.displayObject());

      labelView = AWE.UI.createLabelView();
      var ownerName = _location.ownerName() + (_location.allianceTag() ? " | " +  _location.allianceTag() : "");
      labelView.initWithControllerAndLabel(controller, ownerName, true);
      labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, 16));      
      my.container.addChild(labelView.displayObject());
      
      _flagView = AWE.UI.createAllianceFlagView();
      _flagView.initWithController(controller);
      _flagView.setFrame(AWE.Geometry.createRect(16, 0, 28, 16));
      _flagView.setAllianceId(allianceId);
      _flagView.setDirection('left');
      my.container.addChild(_flagView.displayObject());
      _flagView.updateView();

      if (!frame) {
        that.resizeToFit();        
      }
      
      my.container.width = my.frame.size.width;
      my.container.height = my.frame.size.height;

    };
    
    that.resizeToFit = function() {
      my.frame.size.width = AWE.Config.MAPPING_FORTRESS_SIZE;
      my.frame.size.height = AWE.Config.MAPPING_FORTRESS_SIZE + 24;
    };
    
    that.updateView = function() {
      _super.updateView();
      
      if (_selectShape) {
        _selectShape.visible = this.selected() || this.hovered();
        _selectShape.alpha = (this.selected() ? 1. : 0.2);
      }
    }
        
    /** newly intotruced methods */
    
    that.location = function() {
      return _location;
    };
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



