/* Author: Patrick Fox <patrick@5dlab.com>,
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArmyView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = 'ArmyView';
    
    var _army = null;
    
    var _annotationView = null;

    var _battleView = null;
    var _stanceView = null;  
    var _baseImage = null;  
    var _baseShape = null;    
    var _poleShape = null;    
    var _flagView = null;
    var _selectShape = null;    
    var _healthShape = null;    
    var _healthBGShape = null;   
    var _movementView = null; 
    var _movementArrow = null; 
    var _movementETA = null; 
    var _actionPointsLabelView = null;
    
    var _frameRectShape = null;
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setSelected: AWE.Ext.superior(that, "setSelected"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _army = army;
      
      var _selectGraphics = new Graphics();
      _selectGraphics.setStrokeStyle(1);
      _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
      _selectGraphics.drawEllipse(0, 0, 72, 36);
      _selectShape = AWE.UI.createShapeView();
      _selectShape.initWithControllerAndGraphics(my.controller, _selectGraphics);
      _selectShape.setFrame(AWE.Geometry.createRect(-6, 74, 72, 36));
      this.addChild(_selectShape);      
      
            
/*      var _baseGraphics = new Graphics();
      _baseGraphics.setStrokeStyle(1);
      if (_army.isOwn()) {
        _baseGraphics.beginStroke(Graphics.getRGB(222, 222, 232)).setStrokeStyle(3).beginFill(Graphics.getRGB(242, 242, 255));
      } else {
        _baseGraphics.beginStroke(Graphics.getRGB(48, 48, 48)).setStrokeStyle(3).beginFill(Graphics.getRGB(72, 72, 72));
      }
      _baseGraphics.drawEllipse(0, 0, 52, 24);
      _baseShape = AWE.UI.createShapeView();
      _baseShape.initWithControllerAndGraphics(my.controller, _baseGraphics);
      _baseShape.setFrame(AWE.Geometry.createRect(6, 84, 52, 24));
      _baseShape.onClick = that.onClick;
      _baseShape.onMouseOver = that.onMouseOver;
      _baseShape.onMouseOut = that.onMouseOut;
      this.addChild(_baseShape);      

      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(0, 0, 2, 64, 0);
      _poleShape = AWE.UI.createShapeView();
      _poleShape.initWithControllerAndGraphics(my.controller, _poleGraphics);
      _poleShape.setFrame(AWE.Geometry.createRect(46, 12, 2, 84));
      this.addChild(_poleShape);       */
      
      _baseImage = AWE.UI.createImageView();
      _baseImage.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage('map/army/base'));
      _baseImage.setFrame(AWE.Geometry.createRect(-16, 9, 96, 96));
      _baseImage.onClick = that.onClick;
      _baseImage.onMouseOver = that.onMouseOver;
      _baseImage.onMouseOut = that.onMouseOut;
      this.addChild(_baseImage);      

      _stanceView = AWE.UI.createImageView();
      _stanceView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[1]));
      _stanceView.setFrame(AWE.Geometry.createRect(-22, -7, 96, 96));
      _stanceView.onClick = that.onClick;
      _stanceView.onMouseOver = that.onMouseOver;
      _stanceView.onMouseOut = that.onMouseOut;
      this.addChild(_stanceView);
      
      var healthBGGraphics = new Graphics();
      healthBGGraphics.setStrokeStyle(1);
      healthBGGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      healthBGGraphics.beginFill('rgb(127, 127, 127)');
      healthBGGraphics.drawRoundRect(0, 0, 64, 12, 4);
      _healthBGShape = AWE.UI.createShapeView();
      _healthBGShape.initWithControllerAndGraphics(my.controller, healthBGGraphics);
      _healthBGShape.setFrame(AWE.Geometry.createRect(0, 108, 64, 12));
      this.addChild(_healthBGShape);      

      if (army.get('ap_present') / army.get('ap_max') > 0) {
        if(army.get('ap_present') / army.get('ap_max') > .75) {
          var fillColor = '#bfb';
        }
        else if(army.get('ap_present') / army.get('ap_max') > .5) {
          var fillColor = '#ffb';
        }
        else {
          var fillColor = '#fbb';
        }
        
        var healthGraphics = new Graphics();
        healthGraphics.setStrokeStyle(1);
        healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
        healthGraphics.beginFill(fillColor);
        healthGraphics.drawRoundRect(0, 0, 64 * (army.get('ap_present') / army.get('ap_max')), 12, 4);
        _healthShape = AWE.UI.createShapeView();
        _healthShape.initWithControllerAndGraphics(my.controller, healthGraphics);
        _healthShape.setFrame(AWE.Geometry.createRect(0, 108, 64 * (army.get('ap_present') / army.get('ap_max')), 12));
        this.addChild(_healthShape);      
      }
      _healthBGShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      if (_healthShape) {
        _healthShape.visible = _healthBGShape.visible;
      }
      
      _actionPointsLabelView = AWE.UI.createLabelView();
      _actionPointsLabelView.initWithControllerAndLabel(controller);
      _actionPointsLabelView.setColor('#000');
      _actionPointsLabelView.setFrame(AWE.Geometry.createRect(0, 102, 64, 24));      
      that.addChild(_actionPointsLabelView);      

      if (!frame) {
        that.resizeToFit();        
      }
      
      that.recalcView();
    };
    
    that.resizeToFit = function() {
      this.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAP_ARMY_WIDTH, AWE.Config.MAP_ARMY_HEIGHT - 16));
    }; 

    that.updateView = function() {
      that.recalcView();
      if (my.targetView) {
        my.targetView.setHovered(this.hovered());
      }
      _super.updateView();
    }
        
    that.recalcView = function() {
      
      // BUG: since the stance-view is not recreated and there is no "addChildBelow" used, after one update
      //      of the army the pole will be in front of the figure, although it should be behind.
      
      if (_flagView) {
        that.removeChild(_flagView);
      }
      
      var flagLength = 8 + Math.round(Math.min(_army.get('size_present') / _army.get('size_max'), 1) * 48);
      _flagView = AWE.UI.createAllianceFlagView();
      _flagView.initWithController(my.controller);
      _flagView.setFrame(AWE.Geometry.createRect(50 - flagLength, 11, flagLength, 20));
      _flagView.setAllianceId(_army.get('alliance_id'));
      _flagView.setDirection('left');
      that.addChildAt(_flagView, 0);

      if (!_frameRectShape && AWE.Config.MAP_DEBUG_FRAMES) {
        var _frameRectGraphics = new Graphics();
        _frameRectGraphics.setStrokeStyle(1);
        _frameRectGraphics.beginStroke('rgb(255,255,255)');
        _frameRectGraphics.beginFill('rgba(255,255,255,0.2)');
        _frameRectGraphics.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height, 0);
        _frameRectShape = AWE.UI.createShapeView();
        _frameRectShape.initWithControllerAndGraphics(my.controller, _frameRectGraphics);
        _frameRectShape.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        that.addChildAt(_frameRectShape, 0);    
      }  
                  
      _stanceView.setImage(AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[_army.get('stance')]));

      if (_healthShape) {
        that.removeChild(_healthShape);
        _healthShape = null;
      }
      
      if (_army.get('ap_present') / _army.get('ap_max') > 0.1) {
        if(_army.get('ap_present') / _army.get('ap_max') > .75) {
          var fillColor = '#6d6';
        }
        else if(_army.get('ap_present') / _army.get('ap_max') > .5) {
          var fillColor = '#dd6';
        }
        else {
          var fillColor = '#d66';
        }
        
        var healthGraphics = new Graphics();
        healthGraphics.setStrokeStyle(1);
        healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
        healthGraphics.beginFill(fillColor);
        healthGraphics.drawRoundRect(0, 0, 64 * (_army.get('ap_present') / _army.get('ap_max')), 12, 4);
        _healthShape = AWE.UI.createShapeView();
        _healthShape.initWithControllerAndGraphics(my.controller, healthGraphics);
        _healthShape.setFrame(AWE.Geometry.createRect(0, 108, 64 * (_army.get('ap_present') / _army.get('ap_max')), 12));
        that.addChild(_healthShape);      
        if (_actionPointsLabelView) { // move label to top
          that.removeChild(_actionPointsLabelView);
          that.addChild(_actionPointsLabelView);
        }
      }
      if (_healthShape) {
        _healthShape.setVisible(that.selected() || that.hovered() || (_army && _army.isOwn()));
      }
      if (_healthBGShape) {
        _healthBGShape.setVisible(that.selected() || that.hovered() || (_army && _army.isOwn()));
      }
      
      if (_selectShape) {
        _selectShape.setVisible(this.selected() || this.hovered());
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }
      
      if (_actionPointsLabelView) {
        _actionPointsLabelView.setVisible(that.selected() || that.hovered() || (_army && _army.isOwn()));
        _actionPointsLabelView.setText(_army.get('ap_present') + " / " + _army.get('ap_max'));
      }
      
      if (_army.get('isFighting') && !_battleView) {
        _battleView = AWE.UI.createImageView();
        _battleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/battle'));
        _battleView.setFrame(AWE.Geometry.createRect(0, -50, 65, 65));
        _battleView.onClick = that.onClick;
        _battleView.onMouseOver = that.onMouseOver;
        _battleView.onMouseOut = that.onMouseOut;
        this.addChild(_battleView);
      }      
    }
    
    that.setAnnotationView = function(annotationView) {
      _annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return _annotationView;
    }
    
    that.army = function() {
      return _army;
    };
    
    /** actions */
   
    that.onClick = function(evt) {
      my.controller.viewClicked(that);
    };
    
    that.onMouseOver = function(evt){ 
      my.controller.viewMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.viewMouseOut(that);
    };    
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



