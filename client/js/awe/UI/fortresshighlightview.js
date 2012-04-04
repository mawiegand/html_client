/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createFortressHighlightView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = "fortressHighlightView";
    
    var _node = null;    
    var _container = null;
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    }

    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      _node = node;
      
      _container = module.createContainer();      
      _container.initWithController(controller, frame);        

      var mouseOverImageView = AWE.UI.createImageView();
      mouseOverImageView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement"), frame);
      mouseOverImageView.setContentMode(module.setContentModeNone);
      _container.addChild(mouseOverImageView);
      
      if (!frame) {
        my.frame.size.width = 64;
        my.frame.size.height = 64;
      }      
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.setFrame(frame);
    }
    
    that.layoutSubviews = function() {
      _needsLayout = false;
      _needsDisplay = true;
    }
    
    that.displayObject = function() {
      return _container.displayObject();
    }
    
    that.node = function() {
      return _node;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




