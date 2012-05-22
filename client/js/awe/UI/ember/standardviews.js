/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/standardviews.html');  
  module.templates.push('js/awe/UI/ember/templates/alliancescreen.html');  

  module.templates.push('js/awe/UI/ember/templates/messagecenter.html');  
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');  


  
  module.Dialog = Ember.View.extend({
    onClose: null,
    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }
      this._super();
    },
  });
  
  module.TextInputDialog = module.Dialog.extend({
    templateName: 'text-input-dialog',
    heading: 'set a heading',
    input: '',
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    cancelPressed: function() { alert ('Action not connected: okPressed.'); },
  });
  
  
  module.InfoDialog = module.Dialog.extend({
    templateName: 'info-dialog',
    heading: 'Info',
    message: '',
    okPressed: function() { this.destroy(); },
    cancelPressed: null,
  });
  
  
    
  module.ShoutBox = Ember.View.extend({
    templateName: 'shout-box',

    shouts: null,    
    shoutBoxInput: null,
    shoutBoxSendPressed: function() {
      var input = this.get('shoutBoxInput');
      if (input.length > 0) {
        if (this.shout) {
          this.shout(input);
        }
        else {
          console.log('ERROR in ShoutBox: shout not connected.');
        }
        this.set('shoutBoxInput', '');
      }
    },
    shout: null,
  });
    
     
  module.Pane = Ember.View.extend({
    templateName: 'pane',
    
    init: function() {
      this._super();
      this.set('subviews', []);
    },
    
    didInsertElement: function() {
      this._super();
      var canvas = this.$('canvas');
      this.set('canvas', canvas);
      canvas
      .css('width', '200px')
      .css('height', '200px')
      .attr('width', 200)
      .attr('height', 200);

      var stage = new Stage(canvas[0]);

      this.set('stage', stage);
      this.set('inDOM', true);

      AWE.Ext.applyFunction(this.get('subviews'), function(view) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.addChild(obj);
        });
      });
    },

    addChild: function(view) {
      if (this.get('inDOM')) {
        var stage = this.get('stage');
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.addChild(obj);
        });
      }
      this.get('subviews').pushObject(view);
    },
    
    removeChild: function(view) {
      if (this.get('inDOM')) {
        var stage = this.get('stage');
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.removeChild(obj);
        });        
      };
      delete this.get('subviews')[this.get('subviews').indexOf(view)];
    },
    
    update: function() {
      if (this.get('inDOM') && this.get('stage')) {
        this.get('stage').update();
      }
    },
    
    inDOM: false,
    stage: null,
    canvas: null,
    subviews: null,
    setWidth: function() {
    },
  });     
     
      
  return module;  
    
}(AWE.UI.Ember || {}));