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
    var _hillView = null;
    var _hillImageName = null;
    var _flagBackground = null;
    var _labelView = null;
    var _selectShape = null;
    var _flagView = null;
    var _battleView = null;
    var _suspensionView = null;
    var _fortressImageName = null;
    
    var _frameRect = null;

    
    my = my || {};

    that = module.createSettlementView(spec, my);

    that.recalcView = function() {

      var allianceId = _node.region().allianceId();
      var allianceColor = _node.region().allianceColor();


      // HILL IMAGE /////////////////////////////////////////////////////////
      var terrainId = _node.region().terrainId();
      var newHillImageName = 'map/hill/plain';
      if (terrainId == 1) {
        newHillImageName = 'map/hill/forest';
      }
      else if (terrainId == 2) {
        newHillImageName = 'map/hill/mountains';
      }
      else if (terrainId == 3) {
        newHillImageName = 'map/hill/desert';
      }
      else if (terrainId == 4) {
        newHillImageName = 'map/hill/swamp';
      }

      if (newHillImageName != _hillImageName && _hillView) {
        this.removeChild(_hillView);
        this.removeChild(_flagBackground);
        _hillView = null;
        _flagBackground = null;
      }
      _hillImageName = newHillImageName;

      if (!_hillView) {
        _hillView = AWE.UI.createImageView();
        _hillView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_hillImageName));
        _hillView.setContentMode(module.ViewContentModeFit);
        _hillView.setFrame(AWE.Geometry.createRect((AWE.Config.MAP_FORTRESS_SIZE-AWE.Config.MAP_FORTRESS_HILL_WIDTH)/2.0,
                AWE.Config.MAP_FORTRESS_SIZE-AWE.Config.MAP_FORTRESS_HILL_HEIGHT+20,
            AWE.Config.MAP_FORTRESS_HILL_WIDTH,
            AWE.Config.MAP_FORTRESS_HILL_HEIGHT));
        _hillView.onClick = that.onClick;
        _hillView.onDoubleClick = that.onDoubleClick;
        _hillView.onMouseOver = that.onMouseOver;
        _hillView.onMouseOut = that.onMouseOut;
        this.addChildAt(_hillView, 0);
//
//        _flagBackground = AWE.UI.createImageView();
//        _flagBackground.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/hill/label'));
//        _flagBackground.setContentMode(module.ViewContentModeFit);
//        _flagBackground.setFrame(AWE.Geometry.createRect(AWE.Config.MAP_FORTRESS_SIZE/2.0-9,
//                AWE.Config.MAP_FORTRESS_SIZE-14,
//            26, 18));
//        _flagBackground.onClick = that.onClick;
//        _flagBackground.onDoubleClick = that.onDoubleClick;
//        _flagBackground.onMouseOver = that.onMouseOver;
//        _flagBackground.onMouseOut = that.onMouseOut;
//        this.addChildAt(_flagBackground, 1);
      }


      // FORTRESS IMAGE //////////////////////////////////////////////////////
      var level = AWE.Util.Rules.normalizedLevel(_node.region().fortressLevel(), AWE.GS.SETTLEMENT_TYPE_FORTRESS);
      var imageId = 0; //_node.region().imageId();
      var newFortressImageName;
      var flagFrame;

      if (level > 7) {
        newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/large' : 'map/fortress/large';
        flagFrame = AWE.Geometry.createRect(70, 12, 24, 16);
      }
      else if (level > 3) {
        newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/middle' : 'map/fortress/middle';
        flagFrame = AWE.Geometry.createRect(64, 14, 24, 16);
      }
      else {
        newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/small' : 'map/fortress/small';
        flagFrame = AWE.Geometry.createRect(34, 14, 24, 16);
      }

      if (newFortressImageName != _fortressImageName && _imageView) {
        this.removeChild(_imageView);
        this.removeChild(_flagView);
        _imageView = null;
      }
      _fortressImageName = newFortressImageName;

      if (!_imageView) {
        _imageView = AWE.UI.createImageView();
        _imageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_fortressImageName));
        _imageView.setContentMode(module.ViewContentModeFit);
        _imageView.setFrame(AWE.Geometry.createRect(0, 4, AWE.Config.MAP_FORTRESS_SIZE, AWE.Config.MAP_FORTRESS_SIZE));
        _imageView.onClick = that.onClick;
        _imageView.onDoubleClick = that.onDoubleClick;
        _imageView.onMouseOver = that.onMouseOver;
        _imageView.onMouseOut = that.onMouseOut;
        this.addChildAt(_imageView, 1);
      }

      // FLAG VIEW ///////////////////////////////////////////////////////////
//      if (!_flagView && allianceId) {
      if (!_flagView) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(flagFrame);
        _flagView.setAllianceId(allianceId);
        _flagView.setAllianceColor(allianceColor);
        _flagView.setDirection('right');
        _flagView.onClick = that.onClick;
        _flagView.onDoubleClick = that.onDoubleClick;
        _flagView.onMouseOver = that.onMouseOver;
        _flagView.onMouseOut = that.onMouseOut;
        this.addChildAt(_flagView, 1);
      }

//      if (_flagView && allianceId != _flagView.allianceId()) {
//        _flagView.setAllianceId(allianceId);
//        _flagView.setAllianceColor(allianceColor);
//      }

      // SELECT SHAPE ////////////////////////////////////////////////////////
      if (!_selectShape && (this.selected() || this.hovered())) {
        var selectGraphics = new Graphics();
        selectGraphics.setStrokeStyle(1);
        selectGraphics.beginStroke(Graphics.getRGB(0,0,0));
        selectGraphics.beginFill(Graphics.getRGB(255,0,0));
        selectGraphics.drawEllipse(0, 0, AWE.Config.MAP_FORTRESS_HILL_WIDTH, AWE.Config.MAP_FORTRESS_HILL_WIDTH / 3.0);
        // _selectShape.cache(-AWE.Config.MAPPING_FORTRESS_SIZE/2, +20, 2*AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE);
        _selectShape = AWE.UI.createShapeView();
        _selectShape.initWithControllerAndGraphics(my.controller, selectGraphics);
        _selectShape.setFrame(AWE.Geometry.createRect(-17, AWE.Config.MAP_FORTRESS_SIZE / 2 + 20,
            AWE.Config.MAP_FORTRESS_HILL_WIDTH, AWE.Config.MAP_FORTRESS_HILL_WIDTH / 3.0));
        this.addChildAt(_selectShape, 0);
      }
      else if (_selectShape && !this.selected() && !this.hovered()) {
        this.removeChild(_selectShape);
        _selectShape = null;
      }
      if (_selectShape) {
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }

      // LABEL VIEW ///////////////////////////////////////////////////////////
      if (!_labelView) {
        _labelView = AWE.UI.createLabelView();
        _labelView.initWithControllerAndLabel(my.controller, "owner", true);
        _labelView.setFrame(AWE.Geometry.createRect(0, AWE.Config.MAP_FORTRESS_SIZE + 12, AWE.Config.MAP_FORTRESS_SIZE, 20));
        _labelView.onClick = that.onClick;
        _labelView.onDoubleClick = that.onDoubleClick;
        _labelView.onMouseOver = that.onMouseOver;
        _labelView.onMouseOut = that.onMouseOut;
        this.addChild(_labelView);
      };

      var ownerName = _node.region().ownerName() + (_node.region().allianceTag() ? " | " +  _node.region().allianceTag() : "");
      if (_labelView.text() != ownerName) {
        _labelView.setText(ownerName);
        AWE.GS.game.getPath('currentCharacter.id') == _node.region().ownerId() ? _labelView.setColor('#000') : _labelView.setColor('#FFF');
        AWE.GS.game.getPath('currentCharacter.id') == _node.region().ownerId() ? _labelView.setBackground('rgba(255, 255, 255, 0.5)') : _labelView.setBackground(true);
      }

      if (_node.region().location(0) && _node.region().location(0).garrisonArmy() && _node.region().location(0).garrisonArmy().get('isFighting') && !_battleView) {
        _battleView = AWE.UI.createImageView();
        _battleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/battle'));
        _battleView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _battleView.onClick = that.onClick;
        _battleView.onDoubleClick = that.onDoubleClick;
        _battleView.onMouseOver = that.onMouseOver;
        _battleView.onMouseOut = that.onMouseOut;
        this.addChild(_battleView);
      }
      else if (_battleView && _node.region().location(0) && _node.region().location(0).garrisonArmy() && !_node.region().location(0).garrisonArmy().get('isFighting')) {
        this.removeChild(_battleView);
        _battleView = null;
      }

      if (_node.region().location(0) && _node.region().location(0).garrisonArmy() && _node.region().location(0).garrisonArmy().get('isSuspended') && !_suspensionView) {
        _suspensionView = AWE.UI.createImageView();
        _suspensionView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/suspended'));
        _suspensionView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _suspensionView.onClick = that.onClick;
        _suspensionView.onDoubleClick = that.onDoubleClick;
        _suspensionView.onMouseOver = that.onMouseOver;
        _suspensionView.onMouseOut = that.onMouseOut;
        this.addChild(_suspensionView);
      }
      else if (_suspensionView && _node.region().location(0) && _node.region().location(0).garrisonArmy() && !_node.region().location(0).garrisonArmy().get('isSuspended')) {
        this.removeChild(_suspensionView);
        _suspensionView = null;
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
                                            AWE.Config.MAP_FORTRESS_SIZE,
                                            AWE.Config.MAP_FORTRESS_SIZE+10)); // + label
      that.recalcView();
    };

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
    
    that.onDoubleClick = function() {
      if (AWE.GS.game.getPath('currentCharacter.id') == _node.region().ownerId()) {
        var reference = {};
        if (that.location()) {
          reference.locationId = that.location().id();
        }
        else {
          reference.node = my.node();
        }
        
        WACKADOO.activateFortressController(reference); // TODO: pass fortress id
      }
    };

    return that;
  };
    
  return module;
    
}(AWE.UI || {}));



