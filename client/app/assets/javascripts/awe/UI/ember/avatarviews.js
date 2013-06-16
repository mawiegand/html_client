/**
 * Ember JS  views for avatar
 *
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:christian@5dlab.com">Christian Wansart</a>
 */ 

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {

  module.AvatarView = AWE.UI.Ember.Pane.extend({
    width: 96,
    height: 96,
    
    character: null,
    shape: null,
    controller: null,
    
    init: function() {
      this._super();
    },
    
    avatarUpdate: function() {
      log('AVATAR UPDATE');
      var character = this.get('character');
      var shape  = this.get('shape');
      var width  = this.get('width')  || 96;
      var height = this.get('height') || 96;
   
      if(shape) {
        this.removeChild(shape);
      }
      if(typeof character === 'undefined') {
        this.set('shape', null);
        return ;
      }

      console.log("AVATAR VIEW: " + width + ", " + width);
      
      shape = AWE.UI.createAvatarView();
      shape.initWithControllerAndAvatar(this.get('controller'), character.get('avatar'));
      shape.setFrame(AWE.Geometry.createRect(0, 0, width, height));
      
      this.addChild(shape);
      this.set('shape', shape);
      shape.updateView();      
      this.update();
    }.observes('character'),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

