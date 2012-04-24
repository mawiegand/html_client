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
    
    var _imageView = null;
    var _labelView = null;
    var _selectShape = null;
    var _poleShape = null;
    var _flagView = null;
    
    my = my || {};
   
    that = module.createSettlementView(spec, my);
    
    my.typeName = "BaseView";

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
      
      this.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE + 24));
      that.recalcView();            
    };
    
    that.recalcView = function() {

      var allianceId = _location.allianceId();
      
      if (!_selectShape && (that.selected() || that.hovered())) {
        var selectGraphics = new Graphics();
        selectGraphics.setStrokeStyle(1);
        selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
        selectGraphics.beginFill(Graphics.getRGB(255,0,0));
        selectGraphics.drawEllipse(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
        _selectShape = AWE.UI.createShapeView();
        _selectShape.initWithControllerAndGraphics(my.controller, selectGraphics);
        _selectShape.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2));
        that.addChildAt(_selectShape, 0);
      }
      else if (_selectShape && !that.selected() && !that.hovered()) {
        that.removeChild(_selectShape);
        _selectShape = null;
      }
      if (_selectShape) {
        _selectShape.setAlpha(that.selected() ? 1. : 0.2);
      }
      

      if (!_poleShape) {      
        var _poleGraphics = new Graphics();
        _poleGraphics.setStrokeStyle(1);
        _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
        _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
        _poleGraphics.drawRoundRect(0, 0, 2, 48, 0);
        _poleShape = AWE.UI.createShapeView();
        _poleShape.initWithControllerAndGraphics(my.controller, _poleGraphics);
        _poleShape.setFrame(AWE.Geometry.createRect(44, 0, 2, 48));
        this.addChildAt(_poleShape, 0);
      }

      if (!_imageView) {
        var level = _location.level();
        
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
                
        _imageView = AWE.UI.createImageView();
        _imageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(imageName));
        _imageView.setContentMode(module.ViewContentModeNone);
        _imageView.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
        _imageView.onClick = that.onClick;
        _imageView.onMouseOver = that.onMouseOver;
        _imageView.onMouseOut = that.onMouseOut;
        that.addChild(_imageView);
      }

      if (!_labelView) {
        _labelView = AWE.UI.createLabelView();
        var ownerName = _location.ownerName() + (_location.allianceTag() ? " | " +  _location.allianceTag() : "");
        _labelView.initWithControllerAndLabel(my.controller, ownerName, true);
        _labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, 16));      
        that.addChild(_labelView);
      }
      
      if (!_flagView) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(16, 0, 28, 16));
        _flagView.setAllianceId(allianceId);
        _flagView.setDirection('left');
        that.addChild(_flagView);
      }
      
      if (allianceId != _flagView.allianceId()) {
        _flagView.setAllianceId(allianceId);
      }
    }
    
    that.updateView = function() {
      that.recalcView();    
      _super.updateView();
    }
        
    /** newly intotruced methods */
    
    that.location = function() {
      return _location;
    };
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



