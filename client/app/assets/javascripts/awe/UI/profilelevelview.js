/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createProfileLevelView = function(spec, my) {

    var that;
    
    var _frameWidth;
    var _frameHeight;
    
    var _levelText;
    var _levelTextShadow;
    var _levelBackgroundImage;
    var _levelForegroundImage;
    var _levelArcShape;

    var isButtonDown = false;
    
    var _levelProgress = 0;
    var _levelProgressMax = 100;
    
    my = my || {};
    
    my.typeName = "ProfileLevelView";
    
    my.container = null;
    
    that = module.createView(spec, my);
    
    var _super = {       // store references to needed super methods
      setFrame: AWE.Ext.superior(that, 'setFrame'),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndFrame = function(controller, frame) {
      my.container = new Container();
      
      _frameWidth = frame.size.width;
      _frameHeight = frame.size.height;
      
      that.initWithController(controller, frame);
      
      this.recalcView();          
      
      my.container.x = frame.origin.x;
      my.container.y = frame.origin.y;
      my.container.width = frame.size.width;
      my.container.height = frame.size.height;
    }
    
    that.recalcView = function() {          

      if (!_levelBackgroundImage) {
        _levelBackgroundImage = new Bitmap();   
        _levelBackgroundImage.view = that;
        _levelBackgroundImage.onMouseUp = function(){
          that.setNeedsUpdate();
          isButtonDown = false;
          that.recalcView ();
      };
       _levelBackgroundImage.onMouseDown = function(){
          that.setNeedsUpdate();
          isButtonDown = true;
          that.recalcView ();
      };

        _levelBackgroundImage.onClick = function() {
          that.onClick();
        };
        _levelBackgroundImage.image = AWE.UI.ImageCache.getImage("hud/profile/levelbutton/background");
        my.container.addChild(_levelBackgroundImage);
      }
      
      if (!_levelForegroundImage) {
        _levelForegroundImage = new Bitmap();
        _levelForegroundImage.x = 10
        _levelForegroundImage.y = 10;
        _levelForegroundImage.view = that;

        _levelForegroundImage.onClick = function() {
          that.onClick();
        };
        _levelForegroundImage.image = AWE.UI.ImageCache.getImage("hud/profile/levelbutton/foreground");
        my.container.addChild(_levelForegroundImage);
      }                  
      
      if (!_levelTextShadow) {
        _levelTextShadow = new Text("123", "24px hvd_comic_serif_proregular", "#0247a6");
        _levelTextShadow.textAlign = "center";
        _levelTextShadow.textBaseline = "middle";
        _levelTextShadow.x = _frameWidth / 2;
        _levelTextShadow.y = _frameHeight / 2;
        _levelTextShadow.view = that;

        _levelTextShadow.onClick = function() { 
          that.onClick(); 
        }
        my.container.addChild(_levelTextShadow);
      } 

      if (!_levelText) {
        _levelText = new Text("123", "22px hvd_comic_serif_proregular", "#f5f8e3");
        _levelText.textAlign = "center";
        _levelText.textBaseline = "middle";
        _levelText.x = _frameWidth / 2;
        _levelText.y = _frameHeight / 2;
        _levelText.view = that;

        _levelText.onClick = function() { 
          that.onClick(); 
        }
        my.container.addChild(_levelText);
      }
      if(isButtonDown){
        if(_levelBackgroundImage)
          _levelBackgroundImage.alpha = 0.7;
        if(_levelForegroundImage)
          _levelForegroundImage.alpha = 0.7;
        if(_levelTextShadow)
          _levelTextShadow.alpha = 0.7;
        if(_levelText)
          _levelText.alpha = 0.7;
      }else{
        if(_levelBackgroundImage)
          _levelBackgroundImage.alpha = 1.0;
        if(_levelForegroundImage)
          _levelForegroundImage.alpha = 1.0;
        if(_levelTextShadow)
          _levelTextShadow.alpha = 1.0;
        if(_levelText)
          _levelText.alpha = 1.0;
      }
      this.redrawLevelProgress();      
    };  
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);     
    }   
    
    that.redrawLevelProgress = function() {            
      if (_levelProgress > 0) {
        if (!_levelArcShape) {
          _levelArcShape = new Shape();
          _levelArcShape.onClick = function() {
            that.onClick();
          }
          my.container.addChild(_levelArcShape);
        }
      
        var startX = _frameWidth / 2;
        var startY = _frameHeight / 2;
        var innerRadius = 26;
        var outerRadius = 36;
        var startRadians = Math.PI/180.0 - Math.PI/2;
        var endRadians = (_levelProgress / _levelProgressMax) * 2*Math.PI - Math.PI/2;
      
        _levelArcShape.graphics.clear();
        _levelArcShape.graphics.setStrokeStyle(1);    
        _levelArcShape.graphics.beginFill("#9fddf8");
        _levelArcShape.graphics.beginStroke("#9fddf8");    
        _levelArcShape.graphics.arc(startX, startY, outerRadius, startRadians, endRadians);    
        _levelArcShape.graphics.lineTo(startX + Math.cos(endRadians) * innerRadius, startY + Math.sin(endRadians) * innerRadius);
        _levelArcShape.graphics.arc(startX, startY, innerRadius, endRadians, startRadians, true); 
        _levelArcShape.graphics.closePath();
        _levelArcShape.graphics.endFill();
      }
      else {
        if (_levelArcShape) {
          my.container.removeChild(_levelArcShape);
          _levelArcShape = null;
        }
      }
    }   
    
    that.setRankAndProgress = function(rank, progress) {
      _levelProgress = progress;
      _levelText.text = ''+rank;
      _levelTextShadow.text = ''+rank;
      this.redrawLevelProgress();
    }
    
    that.displayObject = function() {
      return my.container;
    }

    that.mouseDownFromDOM = function(){
      that.setNeedsUpdate();
      isButtonDown = true;
      that.recalcView ();
    }

    that.mouseUpFromDOM = function(){
      that.setNeedsUpdate();
      isButtonDown = false;
      that.recalcView ();
    }
     
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


