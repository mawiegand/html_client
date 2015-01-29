/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.PteroView = Ember.View.extend({
    templateName: 'ptero-view',
  
    controller: null,
    status: null,

    animState: function() {
      return "anim-state-" + this.getPath("status");
    }.property("status"),

    setAnimState: function(status) {
      this.set('status', status);
    },

  });
      
  return module;
    
}(AWE.UI.Ember || {}));