/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createFortressView = function(spec, my) {
    
    var that;
        
    var _node = null;
    
    var _imageView = null;
    var _labelView = null;
    var _selectShape = null;
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
      updateView: AWE.Ext.superior(that, "updateView"),
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
      _selectShape = new Shape(selectGraphics);  
      _selectShape.visible = false;  
      my.container.addChild(_selectShape);
      
      _imageView = AWE.UI.createImageView();
      _imageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(fortressImageName));
      _imageView.setContentMode(module.ViewContentModeNone);
      _imageView.setFrame(AWE.Geometry.createRect(0, 20, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      _imageView.onClick = that.onClick;
      _imageView.onMouseOver = that.onMouseOver;
      _imageView.onMouseOut = that.onMouseOut;
      my.container.addChild(_imageView.displayObject());
      
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

      _labelView = AWE.UI.createLabelView();
      var ownerName = _node.region().ownerName() + (_node.region().allianceTag() ? " | " +  _node.region().allianceTag() : "");

      _labelView.initWithControllerAndLabel(controller, ownerName, true);
      _labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE + 20, AWE.Config.MAPPING_FORTRESS_SIZE, 20));      
      _labelView.onClick = that.onClick;
      _labelView.onMouseOver = that.onMouseOver;
      _labelView.onMouseOut = that.onMouseOut;
      my.container.addChild(_labelView.displayObject());
      
      my.container.width = my.frame.size.width = AWE.Config.MAPPING_FORTRESS_SIZE;
      my.container.height = my.frame.size.height = AWE.Config.MAPPING_FORTRESS_SIZE + 44;
    };
    
    that.updateView = function() {
      _super.updateView();
      if (_selectShape) {
        _selectShape.visible = this.selected() || this.hovered();
        _selectShape.alpha = (this.selected() ? 1. : 0.2);
      }
    }
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    that.location = function() {
      return _node.region().location(0);
    }
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));



