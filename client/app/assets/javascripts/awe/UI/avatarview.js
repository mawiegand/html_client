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

    my.typeName    = "AvatarView";
    my.avatar      = null;
    my.imagePrefix = null;

    /* this is pretty static but we need to ensure a proper order */
    my.layer      = { 
      heads:     0,
      veilchens: 1,
      tattoos:   2,
      eyes:      3,
      hairs:     4,
      mouths:    5,
      beards:    6,
      chains:    7,
    };
    my.controller = null;
    
    var _super = {}

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews:     AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:           AWE.Ext.superior(that, "setFrame"),
      updateView:         AWE.Ext.superior(that, "updateView"),
    };

    /* perhaps the name is a bit too long :S */
    var createAndAddImageToContainerAccordingToFrameSize = function(part) {
      var gender = (my.avatar.getPart('gender') == 'm' ? 'male' : 'female');
      //var layer  = (my.layer[part] ? my.layer[part] : (my.layer[part] = ++my.layer.counter));
      var layer = my.layer[part];
      var partNr = my.avatar.getPart(part);

      /* probably optional. Skip adding element to avoid errors on runtime */
      if(partNr == 0 || isNaN(partNr)) {
        console.log("partNr is either 0 or NaN " + partNr);
        return;
      }

      var image  = Ember.none(my.imagePrefix) ? AWE.UI.ImageCache.getImage("avatar/" + gender + "/" + part + "/" + partNr) : AWE.UI.ImageCache.getImage("avatar/" + my.imagePrefix + "/" + gender + "/" + part + "/" + partNr)
      /* check if image exists in image cache. Abort otherwise */
      if(typeof image === 'undefined') {
        console.log("Tried to access image " + image + " which is not in the image cache");
        return;
      }

      var imageView = module.createImageView();
      imageView.initWithControllerAndImage(my.controller, image);
      imageView.setNewSize(my.frame.size.width, my.frame.size.height);
      imageView.onClick = that.onClick;


      my.container.addChildAt(imageView.displayObject(), layer);
    }

    that.initWithControllerAndAvatar = function(controller, avatar, prefix, frame) {
      _super.initWithController(controller, frame);
      
      my.avatar = avatar;
      my.controller = controller;
      my.imagePrefix = prefix;
    }
    
    that.setAvatar = function(avatar) {
      my.avatar = avatar;
      this.recalcView();
    }
    
    that.recalcView = function() {
      var gender = (my.avatar.getPart('gender') == 'm' ? 'male' : 'female');
      // AWE.GS.RulesManager.getRules().avatar_rules[GENDER]
     /* AWE.GS.RulesManager.getRules().avatar_rules[gender].forEach(function(item) {
        createAndAddImageToContainerAccordingToFrameSize('head');
      });*/

      var parts = AWE.GS.RulesManager.getRules().avatar_config[gender];
      for(part in parts) { 
        createAndAddImageToContainerAccordingToFrameSize(part);
      }
    }
    
    that.updateView = function() {
      this.recalcView();      
      _super.updateView();
    };

    return that;
  };          
  
  return module;
    
}(AWE.UI || {}));




