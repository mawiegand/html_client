/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');
  

	module.FortressView = Ember.View.extend({
		fortress: null,
	});

  module.ToolTipView = Ember.View.extend({
  
    mouseX: 0,
    mouseY: 0,
  
    updatePosition: function() {
      var parent = this.get('parentView');
      var posX = this.get('mouseX') + 10; // - parent.$().offset().left + 10;
      var posY = this.get('mouseY') + 18; // - parent.$().offset().top + 18;
    
      if (posY > 460) {
        posY = this.get('mouseY')- 200;
        posX += 48;
      }
        
      this.$().css({'left': posX, 'top': posY});    
    }.observes('mouseX', 'mouseY'),
  
    didInsertElement: function() {
      this.$().remove();
      this.$().appendTo('.fortress-picture');
      this.updatePosition();
    },
  
  });


  module.BuildingView = Ember.View.extend({
    model: null, 
    hovered: false,

    classNameBindings: ['small:size1', 'middle:size2', 'large:size3', 'hovered'],

    small: function() {
      return this.get('level') > 0 && this.get('level') < 4;
    }.property('level'),
  
    middle: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level'),
  
    large: function() {
      return this.get('level') >= 8;
    }.property('level'),
    
  });

  module.InteractiveBuildingView = module.BuildingView.extend({
    templateName: 'interactive-building',
    tooltip: false,
    mouseX: 0,
    mouseY: 0,
    timeout: 0,    // tooltip timeout in ms
  
    showTooltip: function() {
      this.set('tooltip', true);
    },
  
    mouseEnter: function(event) {
      var self = this;
      this.set('hovered', true);
      setTimeout(function() {
        if (self.get('hovered')) {
          self.showTooltip();
        }
      }, this.get('timeout'));
    },
    mouseMove: function(event) {
      this.set('mouseX', event.pageX);
      this.set('mouseY', event.pageY);
    },
    mouseLeave: function(event) {
      this.set('hovered', false);
      this.set('tooltip', false);
      $().unbind('mousemove');
    },
  
    click: function(event) {
      this.get('model').build();
    },
  
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




