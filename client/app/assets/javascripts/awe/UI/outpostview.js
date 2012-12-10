/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createOutpostView = function(spec, my) {
    
    var that;
        
    var _location = null;
    
    var _imageView = null;
    var _labelView = null;
    var _selectShape = null;
    var _poleShape = null;
    var _battleView = null;
    var _suspensionView = null;
    var _flagView = null;
    
    var _frameRect = null;
    
    my = my || {};
   
    that = module.createSettlementView(spec, my);

    my.typeName = "OutpostView";
    
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
      
      this.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE -5 ));
      that.recalcView();            
    };
    
    that.recalcView = function() {

      var allianceId = _location.allianceId();
      
      if (!_selectShape && (this.selected() || this.hovered())) {
        var selectGraphics = new Graphics();
        selectGraphics.setStrokeStyle(1);
        selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
        selectGraphics.beginFill(Graphics.getRGB(255,0,0));
        selectGraphics.drawEllipse(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
        _selectShape = AWE.UI.createShapeView();
        _selectShape.initWithControllerAndGraphics(my.controller, selectGraphics);
        _selectShape.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE / 2, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2));
        this.addChildAt(_selectShape, 0);
      }
      else if (_selectShape && !this.selected() && !this.hovered()) {
        that.removeChild(_selectShape);
        _selectShape = null;
      }
      if (_selectShape) {
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
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
        _imageView = AWE.UI.createImageView();
        _imageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/outpost"));
        _imageView.setContentMode(module.ViewContentModeNone);
        _imageView.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
        _imageView.onClick = that.onClick;
        _imageView.onDoubleClick = that.onDoubleClick;
        _imageView.onMouseOver = that.onMouseOver;
        _imageView.onMouseOut = that.onMouseOut;
        that.addChild(_imageView);
      }

      if (!_labelView) {
        _labelView = AWE.UI.createLabelView();
        _labelView.initWithControllerAndLabel(my.controller, "owner", true);
        _labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, 16));      
        that.addChild(_labelView);
      }
      var ownerName = _location.ownerName() + (_location.allianceTag() ? " | " +  _location.allianceTag() : "");
      if (_labelView.text() != ownerName) {
        _labelView.setText(ownerName);
        AWE.GS.player.getPath('currentCharacter.id') == _location.ownerId() ? _labelView.setColor('#000') : _labelView.setColor('#FFF');
        AWE.GS.player.getPath('currentCharacter.id') == _location.ownerId() ? _labelView.setBackground('rgba(255, 255, 255, 0.5)') : _labelView.setBackground(true);
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

      if (_location.garrisonArmy() && _location.garrisonArmy().get('isFighting') && !_battleView) {
        _battleView = AWE.UI.createImageView();
        _battleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/battle'));
        _battleView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _battleView.onClick = that.onClick;
        _battleView.onDoubleClick = that.onDoubleClick;
        _battleView.onMouseOver = that.onMouseOver;
        _battleView.onMouseOut = that.onMouseOut;
        this.addChild(_battleView);
      }    
      else if (_battleView && _location.garrisonArmy() && !_location.garrisonArmy().get('isFighting')) {
        this.removeChild(_battleView);
        _battleView = null;
      }

      if (_location.garrisonArmy() && _location.garrisonArmy().get('isSuspended') && !_suspensionView) {
        _suspensionView = AWE.UI.createImageView();
        _suspensionView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/suspended'));
        _suspensionView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _suspensionView.onClick = that.onClick;
        _suspensionView.onDoubleClick = that.onDoubleClick;
        _suspensionView.onMouseOver = that.onMouseOver;
        _suspensionView.onMouseOut = that.onMouseOut;
        this.addChild(_suspensionView);
      }    
      else if (_suspensionView && _location.garrisonArmy() && !_location.garrisonArmy().get('isSuspended')) {
        this.removeChild(_suspensionView);
        _suspensionView = null;
      }


      // FRAME RECT //////////////////////////////////////////////////////////     
      if (!_frameRect && AWE.Config.MAP_DEBUG_FRAMES) {
        var _frameRectGraphics = new Graphics();
        _frameRectGraphics.setStrokeStyle(1);
        _frameRectGraphics.beginStroke(Graphics.getRGB(0,0,0));
        _frameRectGraphics.beginFill('rgba(0,0,0,0.2)');
        _frameRectGraphics.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height,0);
        _frameRect = AWE.UI.createShapeView();
        _frameRect.initWithControllerAndGraphics(my.controller, _frameRectGraphics);
        _frameRect.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        this.addChild(_frameRect);
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
    
    that.army = function() {
      return _location.garrisonArmy();
    };
        
    that.onDoubleClick = function() {
      if (AWE.GS.player.getPath('currentCharacter.id') == _location.ownerId()) {
        WACKADOO.activateBaseController({
          locationId: _location.id()
        });
      }
    };

    return that;
  };
      
  return module;
    
}(AWE.UI || {}));





