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
    var _battleView = null;
    var _poleShape = null;
    var _fortressImageName = null;
    
    var _frameRect = null;

    
    my = my || {};
    
    that = module.createSettlementView(spec, my);

    my.typeName = 'FortressView';
    
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
      
      this.setFrame(AWE.Geometry.createRect(0,0,
                                            AWE.Config.MAPPING_FORTRESS_SIZE,
                                            AWE.Config.MAPPING_FORTRESS_SIZE + 5));
      that.recalcView();
    };
    
    that.recalcView = function() {
      
    //console.log('update fortress for region id ' + _node.region().id());

      var allianceId = _node.region().allianceId();


      // FORTRESS IMAGE //////////////////////////////////////////////////////     
      var newFortressImageName = 'map/fortress/small';        
      if (_node.region() && _node.region().fortressLevel() > 3) {
        newFortressImageName = 'map/fortress/middle';
      }
      if (_node.region() && _node.region().fortressLevel() > 7) {
        newFortressImageName = 'map/fortress/large';
      }
      
      if (newFortressImageName != _fortressImageName && _imageView) {
        this.removeChild(_imageView);
        _imageView = null;
      }
      _fortressImageName = newFortressImageName;

      if (!_imageView) {
        _imageView = AWE.UI.createImageView();
        _imageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_fortressImageName));
        _imageView.setContentMode(module.ViewContentModeNone);
        _imageView.setFrame(AWE.Geometry.createRect(0, 4, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
        _imageView.onClick = that.onClick;
        _imageView.onMouseOver = that.onMouseOver;
        _imageView.onMouseOut = that.onMouseOut;
        this.addChildAt(_imageView, 0);
      }


      // SELECT SHAPE ////////////////////////////////////////////////////////     
      if (!_selectShape && (this.selected() || this.hovered())) {
        var selectGraphics = new Graphics();
        selectGraphics.setStrokeStyle(1);
        selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
        selectGraphics.beginFill(Graphics.getRGB(255,0,0));
        selectGraphics.drawEllipse(0, 0, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2);
        // _selectShape.cache(-AWE.Config.MAPPING_FORTRESS_SIZE/2, +20, 2*AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE);
        _selectShape = AWE.UI.createShapeView();
        _selectShape.initWithControllerAndGraphics(my.controller, selectGraphics);
        _selectShape.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE / 2 + 6, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE / 2));
        this.addChildAt(_selectShape, 0);
      }     
      else if (_selectShape && !this.selected() && !this.hovered()) {
        this.removeChild(_selectShape);
        _selectShape = null;
      }
      if (_selectShape) {
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }
      
      
      // FLAG VIEW ///////////////////////////////////////////////////////////    
      if (!_flagView && allianceId) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(27, 39, 8, 13));
        _flagView.setAllianceId(allianceId);
        _flagView.setDirection('down');
        _flagView.onClick = that.onClick;
        _flagView.onMouseOver = that.onMouseOver;
        _flagView.onMouseOut = that.onMouseOut;
        this.addChild(_flagView);
      }
      
      if (_flagView && allianceId != _flagView.allianceId()) {
        _flagView.setAllianceId(allianceId);
      }
      
      
      // LABEL VIEW ///////////////////////////////////////////////////////////    
      if (!_labelView) {
        _labelView = AWE.UI.createLabelView();
        _labelView.initWithControllerAndLabel(my.controller, "owner", true);
        _labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAPPING_FORTRESS_SIZE + 6, AWE.Config.MAPPING_FORTRESS_SIZE, 20));      
        _labelView.onClick = that.onClick;
        _labelView.onMouseOver = that.onMouseOver;
        _labelView.onMouseOut = that.onMouseOut;
        this.addChild(_labelView);
      };
      
      var ownerName = _node.region().ownerName() + (_node.region().allianceTag() ? " | " +  _node.region().allianceTag() : "");
      if (_labelView.text() != ownerName) {
        _labelView.setText(ownerName);
        AWE.GS.player.getPath('currentCharacter.id') == _node.region().ownerId() ? _labelView.setColor('#000') : _labelView.setColor('#FFF');
        AWE.GS.player.getPath('currentCharacter.id') == _node.region().ownerId() ? _labelView.setBackground('rgba(255, 255, 255, 0.5)') : _labelView.setBackground(true);
      }
      
      if (_node.region().location(0) && _node.region().location(0).garrisonArmy() && _node.region().location(0).garrisonArmy().get('isFighting') && !_battleView) {
        _battleView = AWE.UI.createImageView();
        _battleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/battle'));
        _battleView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _battleView.onClick = that.onClick;
        _battleView.onMouseOver = that.onMouseOver;
        _battleView.onMouseOut = that.onMouseOut;
        this.addChild(_battleView);
      }    
      else if (_battleView && _node.region().location(0) && _node.region().location(0).garrisonArmy() && !_node.region().location(0).garrisonArmy().get('isFighting')) {
        this.removeChild(_battleView);
        _battleView = null;
      }
      
      // FRAME RECT //////////////////////////////////////////////////////////     
      if (!_frameRect && AWE.Config.MAP_DEBUG_FRAMES) {
        log(my.frame.size.width, my.frame.size.height);
        var frame = new Graphics();
        frame.setStrokeStyle(1);
        frame.beginStroke(Graphics.getRGB(0,0,0));
        frame.beginFill('rgba(0,0,0,0.2)');
        frame.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height,0);
        _frameRect = AWE.UI.createShapeView();
        _frameRect.initWithControllerAndGraphics(my.controller, frame);
        _frameRect.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        this.addChild(_frameRect);
      }     
    }
    
    that.updateView = function() {
      this.recalcView();
      _super.updateView();
    }
    
    /** newly intotruced methods */
    
    that.node = function() { return _node; };
    
    that.location = function() {
      var region = _node.region();
      return region ? region.location(0) : null;
    }
    
    that.army = function() {
      var location = this.location();
      return location ? location.garrisonArmy() : null;
    }
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));



