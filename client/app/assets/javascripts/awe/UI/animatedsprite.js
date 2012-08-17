/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createAnimatedSpriteView = function(spec, my) {

    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    var _image       = null;
    var _spriteSheet = null;
    var _animation   = null;
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};

    my.typeName = 'AnimatedSpriteView';

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);
    
    var _super = {       // store references to needed super methods
      setFrame: AWE.Ext.superior(that, 'setFrame'),
    };
        
    that.initWithControllerAndSpriteSheet = function(controller, spriteSheet, frame) {
      frame = frame || AWE.Geometry.createRect(0, 0, 256, 256); //spriteSheet.frameWidth, spriteSheet.frameHeight);
      that.initWithController(controller, frame);

      _spriteSheet = spriteSheet;
      _animation   = new BitmapAnimation(spriteSheet);
      
      var lastFrame = new Date().getTime();
      
      _animation._tick = function(data) {
		    var f = this._animation ? this._animation.frequency : 1;
		    if (!this.paused && new Date().getTime() - lastFrame > 90) { // 10Hz (10ms tolerance if called to early)
		      lastFrame = new Date().getTime();
		      if (((++this._advanceCount)+this.offset)%f == 0) {
			      this.advance();
		      }
		    }
		    if (this.onTick) { this.onTick(data); }
	    }
      
      _animation.view = that;
      _animation.onMouseOver = function(evt){
        if (_animation.view.onMouseOver) {
          _animation.view.onMouseOver(evt);
        }
      };
      _animation.onMouseOut = function(evt){
        if (_animation.view.onMouseOut) {
          _animation.view.onMouseOut(evt);
        }
      };
    }
       
    that.animation = function() {
      return _animation;
    }
    
    that.spriteSheet = function() {
      return _spriteSheet;
    }
        
        
    that.displayObject = function() { return _animation; }
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




