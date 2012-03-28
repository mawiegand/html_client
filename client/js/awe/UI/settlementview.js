/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createSettlementView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.selected = false;
    my.container = null;    

    that = module.createView(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
      setAlpha: that.superior("setAlpha"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      my.container = new Container();
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    }
    
    that.setAlpha = function(alpha) {
      _super.setAlpha(alpha);
      my.container.visible = alpha !== 0;
      my.container.alpha = alpha;
    }
    
    that.center = function() {
      return AWE.Geometry.createPoint(my.frame.origin.x + my.frame.size.width / 2, my.frame.origin.y + my.frame.size.height / 2);
    }
    
    that.setCenter = function(center) {
      my.frame.origin.x = center.x - my.frame.size.width / 2;
      my.frame.origin.y = center.y - my.frame.size.height / 2;
      that.setFrame(my.frame);
    }
    
    that.setSelected = function(selected) {
      my.selected = selected;
    };
    
    that.displayObject = function() {
      return my.container;
    };
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



