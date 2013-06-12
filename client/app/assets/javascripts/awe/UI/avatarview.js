/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Christian Wansart
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createAvatarView = function(spec, my) {

    my = my || {};

    that = module.createContainer(spec, my);

    my.typeName   = "AvatarView";
    my.avatar     = null;
    
    var _super = {}

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews:     AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:           AWE.Ext.superior(that, "setFrame"),
      updateView:         AWE.Ext.superior(that, "updateView"),
    };
    

    that.initWithControllerAndAvatar = function(controller, avatar, frame) {
      _super.initWithController(controller, frame);      
      
      my.avatar = avatar;
      
      // todo: move this to recalcView
      var backgroundImage = AWE.UI.ImageCache.getImage("avatar/male/head/1");
      var bgImageView = module.createImageView();
      bgImageView.initWithControllerAndImage(controller, backgroundImage);
      
      my.container.addChildAt(bgImageView.displayObject(), 0);
      
    }
    
    that.setAvatar = function(avatar) {
      my.avatar = avatar;
      this.recalcView();
    }
    
    that.recalcView = function() {
      // todo: create image views as needed and add them to the container.
    }
    
    that.updateView = function() {
      this.recalcView();      
      _super.updateView();
    };   

    return that;
  };          
  
  return module;
    
}(AWE.UI || {}));




