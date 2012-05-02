/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createEmptySlotAnnotationView = function(spec, my) {

    var _emptySlotView = null;
        
    var _infoText1View = null;    
    var _infoText2View = null;    
    
    var _infoContainer = null;  
    
    var _backgroundShapeView = null;
    
    my = my || {};
    
    my.typeName = 'EmptySlotAnnotationView';
 

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      
      _emptySlotView = view;
      
      _infoContainer = AWE.UI.createMultiLineContainer();
      _infoContainer.initWithController(controller, AWE.Geometry.createRect(130,0,66,0));
      this.addChild(_infoContainer);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText1View.setTextAlign("left");
      _infoContainer.addChild(_infoText1View);

      _infoText2View = AWE.UI.createLabelView();
      _infoText2View.initWithControllerAndLabel(controller);
      _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText2View.setTextAlign("left");
      _infoText2View.setIconImage("map/icon/home");
      _infoContainer.addChild(_infoText2View);

      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
    };
    
    that.updateView = function () {
      this.recalcView();
      _super.updateView();
    }
    
    that.recalcView = function() {
      
      _infoText1View.setText('Empty');
      _infoText2View.setText('1234');
      
      _infoContainer.layoutSubviews(); // call this by hand, as only changed visibility

      if (_backgroundShapeView) {
        this.removeChild(_backgroundShapeView);
      }
      
      var backgroundGraphics = new Graphics();
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(0, 0,
                                       _infoContainer.frame().size.width + 12,
                                       _infoContainer.frame().size.height+ 4, 4);
      _backgroundShapeView = AWE.UI.createShapeView();
      _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundGraphics);
      _backgroundShapeView.setFrame(AWE.Geometry.createRect(_infoContainer.frame().origin.x - 6, 
                                                            _infoContainer.frame().origin.y - 2, 
                                                            _infoContainer.frame().size.width + 12, 
                                                            _infoContainer.frame().size.height+ 4));
      this.addChildAt(_backgroundShapeView, 0);      
      
      that.setNeedsDisplay();
    }
                
    that.layoutSubviews = function() {
      that.recalcView();
      _super.layoutSubviews();
    }
    
    that.annotatedView = function() {
      return _emptySlotView;
    }
    
    that.baseView = function() {
      return _emptySlotView;
    }
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



