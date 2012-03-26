/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.ViewContentModeNone = 0;
  module.ViewContentModeFit = 1;
  
  module.createImageView = function() {
    
    var _image = null;
    var _bitmap = null;
    var _contentMode = module.ViewContentModeNone;
    
    var that = module.createView2();

    var recalcScale = function() {
      if (_contentMode = module.ViewContentModeFit) { console.log('calculate bitmap scale. ' + that.frame().size.width + " to " + _bitmap.image.width);
        _bitmap.scaleX = that.frame().size.width / _bitmap.image.width;
        _bitmap.scaleY = that.frame().size.height / _bitmap.image.height;
      }
      else if (_contentMode = module.ViewContentModeNone) {
        _bitmap.scaleX = _bitmap.scaleY = 1;
      }
    }
    
    that.superSetFrame = that.setFrame;
    
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
      that.superSetFrame(frame);
      recalcScale();
    }
        
    that.displayObject = function() { return _bitmap; }
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




