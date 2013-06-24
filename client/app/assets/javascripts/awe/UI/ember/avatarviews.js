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
    
    avatarString: null,
    shape: null,
    controller: null,
    prefix: null,
    
    init: function() {
      this._super();
    },
    
    avatarUpdate: function() {
      log('AVATAR UPDATE');

      var avatar = null;
      var avatar_string = this.get('avatarString');
      var shape  = this.get('shape');
      var width  = this.get('width')  || 96;
      var height = this.get('height') || 96;
   
      if(shape) {
        this.removeChild(shape);
      }

      if(Ember.none(avatar_string)) {
        this.set('shape', null);
        return ;
      }
      
      avatar = AWE.GS.Avatar.create({ avatar_string: avatar_string });

      if(Ember.none(avatar)) {
        this.set('shape', null);
        return ;
      }

      shape = AWE.UI.createAvatarView();
      shape.initWithControllerAndAvatar(this.get('controller'), avatar, 'ranking');
      shape.setFrame(AWE.Geometry.createRect(0, 0, width, height));
      
      this.addChild(shape);
      this.set('shape', shape);
      shape.updateView();      
      this.update();
    }.observes('avatarString'),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

