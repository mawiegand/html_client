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
    
    var _container = null;
    
    var _annotationView = null;

    var _stanceView = null;    
    var _baseShape = null;    
    var _poleShape = null;    
    var _flagShape = null;
    var _selectShape = null;    
    var _healthShape = null;    
    var _healthBGShape = null;    
    
    that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setSelected: AWE.Ext.superior(that, "setSelected"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _army = army;
      
      var _selectGraphics = new Graphics();
      _selectGraphics.setStrokeStyle(1);
      _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
      _selectGraphics.drawEllipse(0, 80, 64, 32);
      _selectShape = new Shape(_selectGraphics);  
      _selectShape.visible = false;  
      _container.addChild(_selectShape);
            
      var _baseGraphics = new Graphics();
      _baseGraphics.setStrokeStyle(1);
      _baseGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _baseGraphics.beginFill(Graphics.getRGB(0, 0, 0));
      _baseGraphics.drawEllipse(6, 84, 52, 24);
      _baseShape = new Shape(_baseGraphics);  
      _container.addChild(_baseShape);

      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(56, 12, 2, 84, 0);
      _poleShape = new Shape(_poleGraphics);  
      _container.addChild(_poleShape);

      var color = { r: 200, g: 200, b: 200 }; // gray for neutral armies
      if (_army.get('alliance_id')) {
        color = AWE.GS.AllianceManager.colorForNumber(_army.get('alliance_id'));
      }
      var _flagGraphics = new Graphics();
      _flagGraphics.setStrokeStyle(1);
      _flagGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _flagGraphics.beginFill('rgb('+color.r+','+color.g+','+color.b+')');
      _flagGraphics.moveTo(56, 12).lineTo(56, 32).lineTo(8 + 32 * army.get('size_present') / 1200, 22).lineTo(56, 12);
      _flagShape = new Shape(_flagGraphics);  
      _container.addChild(_flagShape);

      _stanceView = AWE.UI.createImageView();
      _stanceView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[1]));
      _stanceView.setFrame(AWE.Geometry.createRect(0, 8, 64, 96));
      _stanceView.onClick = that.onClick;
      _stanceView.onMouseOver = that.onMouseOver;
      _stanceView.onMouseOut = that.onMouseOut;
      _container.addChild(_stanceView.displayObject());
      
      var healthBGGraphics = new Graphics();
      healthBGGraphics.setStrokeStyle(1);
      healthBGGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      healthBGGraphics.beginFill('rgb(127, 127, 127)');
      healthBGGraphics.drawRoundRect(0, 108, 64, 12, 4);
      
      _healthBGShape = new Shape(healthBGGraphics);
      _container.addChild(_healthBGShape);

      if (army.get('ap_present') / army.get('ap_max') > 0) {
        if(army.get('ap_present') / army.get('ap_max') > .75) {
          var fillColor = 'rgb(64, 255, 64)';
        }
        else if(army.get('ap_present') / army.get('ap_max') > .5) {
          var fillColor = 'rgb(255, 255, 64)';
        }
        else {
          var fillColor = 'rgb(255, 64, 64)';
        }
  
        var healthGraphics = new Graphics();
        healthGraphics.setStrokeStyle(1);
        healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
        healthGraphics.beginFill(fillColor);
        healthGraphics.drawRoundRect(0, 108, 64 * (army.get('ap_present') / army.get('ap_max')), 12, 4);
        _healthShape = new Shape(healthGraphics);
        _container.addChild(_healthShape);
      }
      if (_healthShape) {
        _healthShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      }
      _healthBGShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());

      if (!frame) {
        that.resizeToFit();        
      }

      _container.width = my.frame.size.width;
      _container.height = my.frame.size.height;
    };
    
        
    that.updateView = function() {
      
      // TODO, IMPORTANT: DON'T recreate objects everytime this view is updated. This may be expensive... 
      //                  should better check, which values have really been changed. In most cases, only
      //                  the location, target or arrival time will have changed.
      
      // BUG: since the stance-view is not recreated and there is no "addChildBelow" used, after one update
      //      of the army the pole will be in front of the figure, although it should be behind.
      
      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(56, 12, 2, 84, 0);
      _poleShape = new Shape(_poleGraphics);  
      _container.addChild(_poleShape);

      _container.removeChild(_flagShape);
      var color = { r: 200, g: 200, b: 200 }; // gray for neutral armies
      if (_army.get('alliance_id')) {
        color = AWE.GS.AllianceManager.colorForNumber(_army.get('alliance_id'));
      }
      var _flagGraphics = new Graphics();
      _flagGraphics.setStrokeStyle(1);
      _flagGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _flagGraphics.beginFill('rgb('+color.r+','+color.g+','+color.b+')');
      _flagGraphics.moveTo(56, 12).lineTo(56, 32).lineTo(8 + 32 * _army.get('size_present') / 1200, 22).lineTo(56, 12);
      _flagShape = new Shape(_flagGraphics);  
      _container.addChild(_flagShape);
            
      _stanceView.setImage(AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[_army.get('stance')]));
      
      if (_army.get('ap_present') / _army.get('ap_max') > 0) {
        _container.removeChild(_healthShape);
        if(_army.get('ap_present') / _army.get('ap_max') > .75) {
          var fillColor = 'rgb(64, 255, 64)';
        }
        else if(_army.get('ap_present') / _army.get('ap_max') > .5) {
          var fillColor = 'rgb(255, 255, 64)';
        }
        else {
          var fillColor = 'rgb(255, 64, 64)';
        }
  
        var healthGraphics = new Graphics();
        healthGraphics.setStrokeStyle(1);
        healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
        healthGraphics.beginFill(fillColor);
        healthGraphics.drawRoundRect(0, 108, 64 * (_army.get('ap_present') / _army.get('ap_max')), 12, 4);
        _healthShape = new Shape(healthGraphics);
        _container.addChild(_healthShape);
        
      }
      if (_healthShape) {
        _healthShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      }
      _healthBGShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
    }
    
    that.resizeToFit = function() {
      my.frame.size.width = AWE.Config.MAP_ARMY_WIDTH;
      my.frame.size.height = AWE.Config.MAP_ARMY_HEIGHT;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      //_container.x = my.frame.origin.x;
      //_container.y = my.frame.origin.y;
    }
    
    that.setSelected = function(selected) {
      _super.setSelected(selected);
      _selectShape.visible = that.selected();
      if (_healthShape) {
        _healthShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      }
      _healthBGShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      this.setNeedsDisplay();
    };
    
    that.setHovered = function(hovered) {
      _super.setHovered(hovered);
      if (_healthShape) {
        _healthShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      }
      _healthBGShape.visible = this.selected() || this.hovered() || (_army && _army.isOwn());
      this.setNeedsDisplay();      
    }
    
    that.displayObject = function() {
      return _container;
    };
    
    that.setAnnotationView = function(annotationView) {
      _annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return _annotationView;
    }
    
    that.army = function() { return _army; };
    
    // that.updateStance = function() {
      // _stanceView.image = AWE.UI.ImageCache.getImage(_stanseImages[_army.get('stance')]);
      // that.setNeedsDisplay();
    // };
    
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



