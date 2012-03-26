/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.ViewContentModeNone = 0;
  module.ViewContentModeFit = 1;
  
  module.createImageView = function(spec, my) {


    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    var _image = null;
    var _bitmap = null;
    var _contentMode = module.ViewContentModeNone;
    
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};


    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView2(spec, my);
    
    var _super = {       // store references to needed super methods
      setFrame: that.superior('setFrame'),
    };

    var recalcScale = function() {
      if (_contentMode = module.ViewContentModeFit) {
        _bitmap.scaleX = my.frame.size.width / _bitmap.image.width;
        _bitmap.scaleY = my.frame.size.height / _bitmap.image.height;
      }
      else if (_contentMode = module.ViewContentModeNone) {
        _bitmap.scaleX = _bitmap.scaleY = 1;
      }
    }
        
    that.initWithControllerAndImage = function(controller, image, frame) {
      frame = frame || AWE.Geometry.createRect(0,0,image.width, image.height);
      that.initWithController(controller, frame);
      _bitmap = new Bitmap();
      that.setImage(image);
    }
    
    that.setImage = function(image) {
      _image = image;
      _bitmap.image = image;
      recalcScale();
      this.setNeedsDisplay();
    }
    
    that.image = function() {
      return _image;
    }
    
    that.setContentMode = function(mode) {
      _contentMode = mode;
      recalcScale();
      this.setNeedsDisplay();
    }
    
    that.contentMode = function() { return contentMode; }
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      recalcScale();
    }
        
    that.displayObject = function() { return _bitmap; }
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




