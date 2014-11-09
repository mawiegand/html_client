/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createAllianceFlagView = (function() {
    
    var _flagCache = {}; // maps alliance id to pre-rendered image
    
    return function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'AllianceFlagView';
    my.allianceTag = null;
    my.allianceColor = null;

    var that = module.createContainer(spec, my);
    
    var _allianceId = null;
    var _oldAllianceId = null;
    var _allianceColor = null;
    var _oldAllianceColor = null;
    var _direction = 'down';
    var _tagVisible = false;
    
    var _flagShapeView = null;
    var _allianceTagLabelView = null;
    
    var _shouldCache = false;
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };
    
    /** overwritten view methods */
    
  
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);

      if (!frame) {
        my.frame.size.width = 80;
        my.frame.size.height = 100;
      }
    };
    
    that.setCache = function(value) {
      _shouldCache = value;
    };
    
    
    that.getAllianceTagFromModel = function() {
      var alliance = AWE.GS.AllianceManager.getAlliance(_allianceId);
      if (alliance) {
        my.allianceTag = alliance.get('tag');
        my.allianceColor = alliance.get('color');
      }
      else {
        AWE.GS.AllianceManager.updateAlliance(_allianceId, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function() {
          that.setNeedsUpdate();
        });
      }
    }
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      this.updateView();
    }
        
    that.updateView = function () {
            
      var cacheIt = _shouldCache; 

      if (!_flagShapeView || (my.frame.size.width  !== _flagShapeView.frame().size.width ||
                              my.frame.size.height !== _flagShapeView.frame().size.height) ||
          _allianceId !== _oldAllianceId ||
          _allianceColor !== _oldAllianceColor) { // no view, color changed or -if not cached- size changed

        var color = _allianceId ? AWE.GS.AllianceManager.colorForAlliance(_allianceId, _allianceColor) : { r: 255, g: 255, b: 255 };
                
        if (cacheIt) {
          if (!_flagShapeView || _allianceId !== _oldAllianceId || _allianceColor !== _oldAllianceColor) {
            if (_flagShapeView) {
              this.removeChild(_flagShapeView);
              _flagShapeView = null;
            }

            var image = that.cachedImage(_direction, _allianceId, _allianceColor);

            _flagShapeView = AWE.UI.createImageView();
            _flagShapeView.initWithControllerAndImage(my.controller, image);
            
            if (image.width == 0) { // image seems to be still loading
              var func = image.onload || null;  // wrap it

              image.onload = function() {
                _flagShapeView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
                if (func) {
                  func();
                }
              }
            }
          }
          AWE.Log.Debug('resize flag shape view');
          _flagShapeView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        }
        else {

          if (_flagShapeView) {
            this.removeChild(_flagShapeView);
          }
          
          var _flagShapeGraphics = new Graphics();
//          _flagShapeGraphics.setStrokeStyle(0);
//          _flagShapeGraphics.beginStroke('rgb(0, 0, 0)');
          _flagShapeGraphics.beginFill('rgb('+color.r+','+color.g+','+color.b+')');
          if (_direction === 'down') {
            _flagShapeGraphics.moveTo(0, 0).lineTo(my.frame.size.width, 0).lineTo(my.frame.size.width / 2, my.frame.size.height).lineTo(0, 0);
          }
          else if (_direction === 'left') {
            _flagShapeGraphics.moveTo(my.frame.size.width, 0).lineTo(my.frame.size.width, my.frame.size.height).lineTo(0, my.frame.size.height / 2).lineTo(my.frame.size.width, 0);
          }
          else if (_direction === 'right') {
            _flagShapeGraphics.moveTo(0, 0).lineTo(0, my.frame.size.height).lineTo(my.frame.size.width, my.frame.size.height / 2).lineTo(0, 0);
          }

          _flagShapeView = AWE.UI.createShapeView();
          _flagShapeView.initWithControllerAndGraphics(my.controller, _flagShapeGraphics);
          _flagShapeView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
        }

        _oldAllianceId = _allianceId;
        _oldAllianceColor = _allianceColor;

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
      }
      
      if (_allianceId && !my.allianceTag) {
        that.getAllianceTagFromModel();
      } 
      
      if (!_allianceTagLabelView && my.allianceTag && _tagVisible) {
        _allianceTagLabelView = AWE.UI.createLabelView();
        _allianceTagLabelView.initWithControllerAndLabel(my.controller);
        _allianceTagLabelView.setColor('#000');
        _allianceTagLabelView.setFrame(AWE.Geometry.createRect(0, 0, 20, 20));  
        _allianceTagLabelView.onClick = function() { 
          if (that.onClick) that.onClick();   
        };
        _allianceTagLabelView.onMouseOver = function() {
          if (that.onMouseOver) that.onMouseOver();
        };
        _allianceTagLabelView.onMouseOut = function() {
          if (that.onMouseOut) that.onMouseOut();
        };
        this.addChild(_allianceTagLabelView);
      }
      else if (_allianceTagLabelView && (!my.allianceTag || !_tagVisible)) {
        this.removeChild(_allianceTagLabelView);
        _allianceTagLabelView = null;
      }

      if (_allianceTagLabelView) {
        _allianceTagLabelView.setText(my.allianceTag);
        _allianceTagLabelView.setFrame(AWE.Geometry.createRect(0, my.frame.size.height / 3 - 12, my.frame.size.width, 24));
      }    
            
      _super.updateView();
    }
    
    that.setAllianceId = function(allianceId) {
      if (_allianceId !== allianceId) {
        _allianceId = allianceId;
        this.setNeedsUpdate();
      }
    }
    
    that.allianceId = function() { 
      return _allianceId; 
    }

    that.setAllianceTag = function(allianceTag) {
      if (my.allianceTag !== allianceTag) {
        my.allianceTag = allianceTag;
        this.setNeedsUpdate();
      }
    }

    that.allianceTag = function() {
      return my.allianceTag;
    }

    that.setAllianceColor = function(allianceColor) {
      if (my.allianceColor !== allianceColor) {
        _allianceColor = allianceColor;
        this.setNeedsUpdate();
      }
    }

    that.allianceColor = function() {
      return _allianceColor;
    }

    that.setDirection = function(direction) {
    _direction = direction;
      this.setNeedsUpdate();
    }
    that.direction = function() { return _direction; }

    
    that.setTagVisible = function(tagVisible) {
      if (tagVisible !== _tagVisible) {
        _tagVisible = tagVisible;
        this.setNeedsUpdate();
      }
    }
    
    that.onClick = function() {}
    
    
    
    that.generateFlagImage = function(direction, allianceId, allianceColor) {
      
      var width = 56, height = 20;
      if (direction === "down") {
        width = 20, height = 40;
      }

      var color = allianceId ? AWE.GS.AllianceManager.colorForAlliance(allianceId, allianceColor) : { r: 255, g: 255, b: 255 };
            
      var flagShapeGraphics = new Graphics();
        
//      flagShapeGraphics.setStrokeStyle(1);
      //flagShapeGraphics.beginStroke('rgb(0, 0, 0)');
      flagShapeGraphics.beginFill('rgb('+color.r+','+color.g+','+color.b+')');

      if (direction === 'down') {
        flagShapeGraphics.moveTo(0, 0).lineTo(width, 0).lineTo(width/2, height).lineTo(0, 0);
      }
      else if (_direction === 'left') {
        flagShapeGraphics.moveTo(width, 0).lineTo(width,height).lineTo(0, height / 2).lineTo(width, 0);
      }
      else if (_direction === 'right') {
        flagShapeGraphics.moveTo(0, 0).lineTo(width, height / 2).lineTo(0, height).lineTo(0, 0);
      }

      var flagShapeView = AWE.UI.createShapeView();
      flagShapeView.initWithControllerAndGraphics(my.controller, flagShapeGraphics);
      flagShapeView.setFrame(AWE.Geometry.createRect(0, 0, width, height));
    
      var displayObject = flagShapeView.displayObject();
      displayObject.cache(0, 0, width, height);
      
      var image = new Image();
      image.src = displayObject.cacheCanvas.toDataURL();
      
      return image;
    }
    
    that.cachedImage = function(direction, allianceId, allianceColor) {
      var image = _flagCache[direction + "_" + allianceId + "_" + allianceColor];
      
      if (!image) {
        image = that.generateFlagImage(direction, allianceId, allianceColor);
        _flagCache[direction + "_" + allianceId + "_" + allianceColor] = image;
      }
      return image;
    }
    
    return that;
  }
  }());
      
  return module;
    
}(AWE.UI || {}));



