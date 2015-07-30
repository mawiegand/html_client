/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.TutorialEndDialog = module.InfoDialog.extend({
    templateName: 'tutorial-end-dialog',
/*
    okPressed: function() {
      var self = this;
      self.set('redeeming', true);
      AWE.GS.TutorialStateManager.redeemTutorialEndRewards(function() {
        self.destroy();
      }, function() {
        self.set('redeeming', false);
        var dialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('tutorial.end.redeemError.header'),
          message: AWE.I18n.lookupTranslation('tutorial.end.redeemError.message'),

          okPressed: function() {
            self.destroy();
            this._super();
          },
        });
        WACKADOO.presentModalDialog(dialog);
      });
    },*/
  });

  module.UIMarker = Ember.View.extend({
    templateName: 'ui-marker',

    animate: function() {
      var self = this;
      var arrow = this.$().find('.ui-marker-image')[0];

      switch(this.get('direction')) {
        case 0:
          $(arrow).animate({top: "+=48px"}, 500, function() {
            $(arrow).animate({top: "-=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 1:
          $(arrow).animate({left: "-=48px"}, 500, function() {
            $(arrow).animate({left: "+=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 2:
          $(arrow).animate({top: "-=48px"}, 500, function() {
            $(arrow).animate({top: "+=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 3:
          $(arrow).animate({left: "+=48px"}, 500, function() {
            $(arrow).animate({left: "-=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        default:
      }
    },

    didInsertElement: function() {
      this.animate();
    },

    top: 0,
    left: 0,

    style: function() {
      return "top: " + this.get('top') + "px; left: " + this.get('left') + "px;";
    }.property('top', 'left').cacheable(),

    direction: 0,

    directionClass: function() {
      switch (this.get('direction')) {
        case 0:
          return 'up';
        case 1:
          return 'right';
        case 2:
          return 'down';
        default:
          return 'left';
      }
    }.property('direction').cacheable(),
  });

  return module;
    
}(AWE.UI.Ember || {}));