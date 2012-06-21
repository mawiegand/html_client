/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createBaseInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName = 'BaseInspectorView';
    
    var _location = null;
    
    var _backgroundShapeView = null;

    var _nameLabelView = null;
    var _levelLabelView = null;

    var _circleShape = null;
    var _baseShape = null;
    var _imageView = null;
    var _flagView = null;

    var _infoButtonView = null;
    var _newArmyButtonView = null;
    var _prevButtonView = null;
    var _nextButtonView = null;
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.onFlagClicked = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      _super.initWithController(controller, frame);      
      _location = location;      
      that.recalcView();
    };
    
    that.recalcView = function() {
      
      var isOwnLocation = _location.isOwn();
      
      if (!_backgroundShapeView) {
        var backgroundShapeGraphics = new Graphics();
        backgroundShapeGraphics.setStrokeStyle(0);
        backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        backgroundShapeGraphics.drawRoundRect(0, 26, 230, 75, 6);
        _backgroundShapeView = AWE.UI.createShapeView();
        _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);
        _backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 230, 100));
        this.addChildAt(_backgroundShapeView, 0);
      }      

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(5, 27, 100, 36));      
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        // _nameLabelView.setIconImage("map/icon/heads");
        this.addChild(_nameLabelView);
      }
      
      if (_location.name() !== _nameLabelView.text()) {
        _nameLabelView.setText(_location.name());
      }


      if (!_levelLabelView) {
        _levelLabelView = AWE.UI.createLabelView();
        _levelLabelView.initWithControllerAndLabel(my.controller);
        _levelLabelView.setFrame(AWE.Geometry.createRect(5, 68, 100, 24));      
        _levelLabelView.setTextAlign("left");
        _levelLabelView.setIconImage("map/icon/actionpoints");
        this.addChild(_levelLabelView);
      }
      if (_location.settlementLevel() != _levelLabelView.text()) {
        _levelLabelView.setText(_location.settlementLevel());
      }
      
      if (!_circleShape) {
      // kreis drum
        var circleGraphics = new Graphics();
        circleGraphics.setStrokeStyle(1);
        circleGraphics.beginStroke('rgb(0, 0, 0)');
        circleGraphics.beginFill('rgb(255, 255, 255)');
        circleGraphics.drawCircle(64, 64, 64);
        _circleShape = AWE.UI.createShapeView();
        _circleShape.initWithControllerAndGraphics(my.controller, circleGraphics);
        _circleShape.setFrame(AWE.Geometry.createRect(184, 0, 64, 64));
        _circleShape.onClick = function() { my.controller.moveTo(_location); };
        this.addChild(_circleShape);
      }      
      
      if (!_imageView) {
        var level = _location.settlementLevel();
        
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
        _imageView.setFrame(AWE.Geometry.createRect(200, 16, 96, 96));
        //_imageView.onClick = that.onClick;
        _imageView.onClick = function() { my.controller.moveTo(_location); };
        _imageView.onMouseOver = that.onMouseOver;
        _imageView.onMouseOut = that.onMouseOut;
        this.addChild(_imageView);
      }

      var allianceId = _location.allianceId()
      if (_flagView && _flagView.allianceId() !== allianceId) {      
        this.removeChild(_flagView);
        _flagView = null;
      }
      if (!_flagView && allianceId) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(150, 0, 60, 75));
        _flagView.setAllianceId(allianceId);
        _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          if (that.onFlagClicked) {
            that.onFlagClicked(allianceId);
          };
        };
        this.addChildAt(_flagView, 10);
      }

      // buttons oben
      if (!_infoButtonView && isOwnLocation) {
        _infoButtonView = AWE.UI.createButtonView();
        _infoButtonView.initWithControllerTextAndImage(my.controller, 'Info', AWE.UI.ImageCache.getImage("map/button1"));
        _infoButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
        _infoButtonView.onClick = function() {
           that.onInfoButtonClick(_location) 
        };
        this.addChild(_infoButtonView);
      }
  
      if (!_newArmyButtonView && isOwnLocation) {
        _newArmyButtonView = AWE.UI.createButtonView();
        _newArmyButtonView.initWithControllerTextAndImage(my.controller, 'New Army', AWE.UI.ImageCache.getImage("map/button1"));
        _newArmyButtonView.setFrame(AWE.Geometry.createRect(280, 0, 48, 48));
        _newArmyButtonView.onClick = function() {
           that.onNewArmyButtonClick(_location) 
        };
        this.addChild(_newArmyButtonView);
      }
  
      if (!_prevButtonView && isOwnLocation) {
        // button unten
        _prevButtonView = AWE.UI.createButtonView();
        _prevButtonView.initWithControllerTextAndImage(my.controller, '<<', AWE.UI.ImageCache.getImage("map/button1"));
        _prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        this.addChild(_prevButtonView);
      }
  
      if (!_nextButtonView && isOwnLocation) {
        _nextButtonView = AWE.UI.createButtonView();
        _nextButtonView.initWithControllerTextAndImage(my.controller, '>>', AWE.UI.ImageCache.getImage("map/button1"));
        _nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        this.addChild(_nextButtonView);
      }
    }
    
    that.onInfoButtonClick = function() { console.log('info button clicked'); }
    that.onNewArmyButtonClick = function() { console.log('new army button clicked'); }

    that.updateView = function() {
      that.recalcView();      
      _super.updateView();
    };   
    
    that.location = function() {
      return _location;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));





