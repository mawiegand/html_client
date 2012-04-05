/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

///// DEPRECATED; Already deprecated, we'll be using Ember.JS for all DOM-inserted views.

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/domview.html');
  
  var _html = 
    '<div class="domdialog-background"></div>\
     <div class="domdialog-pane">\
     </div>';  
          
  /** creates the base class of the DOM view hierarchy. The spec object is an 
   * optional argument that can be used to initialize the intrinsics of the
   * view. The view hooks itself into the DOM inside the provided anchor and
   * uses absolute positioning.
   */
  module.createDOMDialog = function (spec, my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;

    var domelements = null;

  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
  
    my.html = my.html || _html;///< use subclass specific html or generic view html
    my.frame = spec.frame   || AWE.Geometry.createRect(100,100,300,150);  ///< frame of the view
    my.anchor = spec.anchor || null;
    my.wrapper = null;
    my.controller = null;     ///< view controller that has controll of this view.
    my.alpha = 1.;            ///< alpha value (transparency) of the view. Continuous value from 0 to 1. 0: transparent, 1: opaque.
    my.visible = false;
    my.uid = 0;
    my.zIndex = 1;
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    
    that.anchor = function() {
      return my.anchor;
    }
    
    that.setAnchor = function(anchor) {
      this.anchor = anchor;
      if (my.visible) {
        this.hide();    // remove from previous anchor
        this.show();    // attach to new anchor
      }  
    }
    
    that.anchor = function() {
      return anchor;
    }
    
    that.show = function() {
      if (my.visible) return ;
      $(my.anchor).append(my.wrapper);
      my.visible = true;
    }
    
    /** hides the view, but does not destroy the DOM-construct representing this 
     * view. Should be called in case the view will be shown again later. */
    that.hide = function() {
      if (!my.visible) return ;
      
      my.wrapper.remove();
      my.visible = false;
    }
        
    that.setFrame = function(frame) {
      my.frame = frame;
      var pane = my.wrapper.find('.domdialog-pane');
      pane.css('top', Math.floor(my.frame.origin.y));
      pane.css('left', Math.floor(my.frame.origin.x));
      pane.css('width', my.frame.size.width);
      pane.css('height', my.frame.size.height);
    }
    
    that.setOrigin = function(origin) {
      this.setFrame(AWE.Geometry.createRect(origin.x, origin.y, my.frame.size.width, my.frame.size.height));
    }
    
    that.setCenter = function(center) {
      this.setOrigin(AWE.Geometry.createPoint(center.x - my.frame.size.width / 2, center.y - my.frame.size.height / 2));
    }
    
    that.center = function() {
      return AWE.Geometry.createPoint(my.frame.origin.x + my.frame.size.width / 2, my.frame.origin.y + my.frame.size.height / 2);
    }
    
    /** returns the present width of the view. Please note, the view may draw
     * outside its frame. */
    that.width = function() { return my.frame.size.width; }
    
    /** returns the present height of the view. Plese note, the view may draw
     * outside its frame. */
    that.height = function() { return my.frame.size.height; }      
    
    that.alpha = function() {
      return my.alpha;
    }
    
    that.setAlpha = function(alpha) {
      my.alpha = alpha;
    }
    
    that.setZIndex = function(zIndex) {
      my.zIndex = 1;
    }
    
    that.zIndex = function() { return my.zIndex; }
    
    // initialization ////////////////////////////////////////////////////////

    do { 
      my.uid = 'dv'+(Math.floor(Math.random()*10000000)+1);
    } while ($('#'+my.uid).length > 0);
        
    my.wrapper = $('<div id="'+my.uid+'" class="domdialog"></div>');
    my.wrapper.append(my.html);

    that.setFrame(my.frame);
        
    return that;
  };       

  return module;
    
}(AWE.UI.Ember || {}));




