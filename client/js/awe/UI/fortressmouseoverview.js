/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createMouseoverView = function() {
    
    var _node = null;
    
    var _container = null;
        
    var that = module.createView2();
    
    var _super = {
      initWithController: function(controller, frame) { that.initWithController(controller, frame); },
    }
    that.superLayoutSubviews = that.layoutSubviews;
    that.superSetFrame = that.setFrame;
    
    that.initWithControllerAndFrame = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      _container = module.createContainer();      
      _container.initWithController(controller, frame);        

      var mouseOverImage = AWE.UI.createImageView();
      mouseOverImage.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/button3"), frame);
      mouseOverImage.setContentMode(0);  // TODO HACK
      _container.addChild(mouseOverImage);
    }

    that.setFrame = function(frame) {
      that.superSetFrame(frame);
      _container.setFrame(frame);
    }
    
    that.layoutSubviews = function() {
      // that.superLayoutSubviews();
    }
    
    that.displayObject = function() {
      return _container.displayObject();
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




