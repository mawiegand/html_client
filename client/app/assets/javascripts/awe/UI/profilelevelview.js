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
        _levelForegroundImage.x = 0
        _levelForegroundImage.y = 80;
        _levelForegroundImage.view = that;

        _levelForegroundImage.onClick = function() {
          that.onClick();
        };
        _levelForegroundImage.image = AWE.UI.ImageCache.getImage("hud/profile/levelbutton/foreground");
        my.container.addChild(_levelForegroundImage);        
      }                        

      if (!_levelText) {
        _levelText = new Text("123", "20px hvd_comic_serif_proregular", "#f5f8e3");
        _levelText.textAlign = "center";
        _levelText.textBaseline = "middle";
        _levelText.shadow = new Shadow("#000000", 2, 2, 0);
        _levelText.x = 19;
        _levelText.y = _frameHeight - 17;
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
        if(_levelText)
          _levelText.alpha = 0.7;
      }else{
        if(_levelBackgroundImage)
          _levelBackgroundImage.alpha = 1.0;
        if(_levelForegroundImage)
          _levelForegroundImage.alpha = 1.0;
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
          my.container.addChildAt(_levelArcShape, 0);          
        }
      
        var startX = _frameWidth / 2;
        var startY = _frameHeight / 2;
        var innerRadius = 46;
        var outerRadius = 56;
        var startRadians = Math.PI/180.0 - Math.PI/2;
        var endRadians = (_levelProgress / _levelProgressMax) * 2*Math.PI - Math.PI/2;
        
        _levelArcShape.graphics.clear();
        _levelArcShape.graphics.setStrokeStyle(1);    
        _levelArcShape.graphics.beginFill("#1d83c1");
        _levelArcShape.graphics.beginStroke("#1d83c1");    
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


