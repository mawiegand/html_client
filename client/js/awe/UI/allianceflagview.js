/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createAllianceFlagView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'AllianceFlagView';
    
    var that = module.createContainer(spec, my);
    
    var _allianceId = null;
    var _direction = 'down';
    var _tagVisible = false;
    
    var _flagShapeView = null;
    var _allianceTagLabelView = null;

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      _allianceTagLabelView = AWE.UI.createLabelView();
      _allianceTagLabelView.initWithControllerAndLabel(my.controller);
      _allianceTagLabelView.setColor('#000');
      _allianceTagLabelView.setFrame(AWE.Geometry.createRect(0, 0, 20, 20));      
      this.addChild(_allianceTagLabelView);

      if (!frame) {
        my.frame.size.width = 80;
        my.frame.size.height = 100;
      }
    };
        
    that.updateView = function () {
            
      var color = _allianceId ? AWE.GS.AllianceManager.colorForNumber(_allianceId) : { r: 255, g: 255, b: 255 };

      if (_flagShapeView) {
        this.removeChild(_flagShapeView);
      }
            
      var _flagShapeGraphics = new Graphics();
      _flagShapeGraphics.setStrokeStyle(1);
      _flagShapeGraphics.beginStroke('rgb(0, 0, 0)');
      _flagShapeGraphics.beginFill('rgb('+color.r+','+color.g+','+color.b+')');
      if (_direction === 'down') {
        _flagShapeGraphics.moveTo(0, 0).lineTo(my.frame.size.width, 0).lineTo(my.frame.size.width / 2, my.frame.size.height).lineTo(0, 0);
      }
      else if (_direction === 'left') {
        _flagShapeGraphics.moveTo(my.frame.size.width, 0).lineTo(my.frame.size.width, my.frame.size.height).lineTo(0, my.frame.size.height / 2).lineTo(my.frame.size.width, 0);
      }
      
      _flagShapeView = AWE.UI.createShapeView();
      _flagShapeView.initWithControllerAndGraphics(my.controller, _flagShapeGraphics);
      _flagShapeView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
      _flagShapeView.onClick = function() { 
        if (that.onClick) that.onClick();   
      };
      _flagShapeView.onMouseOver = function() {
        if (that.onMouseOver) that.onMouseOver();
      };
      _flagShapeView.onMouseOut = function() {
        if (that.onMouseOut) that.onMouseOut();
      };
      this.addChildAt(_flagShapeView, 0);

      if (_tagVisible && _allianceId) {
        var alliance = AWE.GS.AllianceManager.getAlliance(_allianceId);
        if (alliance) {
          _allianceTagLabelView.setText(AWE.GS.AllianceManager.getAlliance(_allianceId).tag);
          _allianceTagLabelView.setFrame(AWE.Geometry.createRect(0, my.frame.size.height / 3 - 12, my.frame.size.width, 24));
        }
        else {
          AWE.GS.AllianceManager.updateAlliance(_allianceId, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setNeedsUpdate(); 
          });
        }
      }
            
      _super.updateView();
    }
    
    that.setAllianceId = function(allianceId) {
      _allianceId = allianceId;
      this.setNeedsUpdate();
    }
    
    that.allianceId = function() { return _allianceId; }
    
    that.setDirection = function(direction) {
      _direction = direction;
      this.setNeedsUpdate();
    }
    that.direction = function() { return _direction; }

    
    that.setTagVisible = function(tagVisible) {
      _tagVisible = tagVisible;
      this.setNeedsUpdate();
    }
    
    that.onClick = function() {}
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



