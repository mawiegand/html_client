/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createShapeView = function(spec, my) {


    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    var _shape = null;
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};

    my.typeName = 'ShapeView';

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);
    
    var _super = {       // store references to needed super methods
      setFrame: AWE.Ext.superior(that, 'setFrame'),
    };
            
    that.initWithControllerAndGraphics = function(controller, graphics, frame) {
      _shape = new Shape(graphics);
      _shape.view = that;
      that.initWithController(controller, frame);
      _shape.onMouseOver = function(evt){
        if (_shape.view.onMouseOver) {
          _shape.view.onMouseOver(evt);
        }
      };
      _shape.onMouseOut = function(evt){
        if (_shape.view.onMouseOut) {
          _shape.view.onMouseOut(evt);
        }
      };
      
      this.setNeedsDisplay();
    }
            
    that.displayObject = function() { return _shape; }
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




