/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createPoacherTreasureAnnotationView = function(spec, my) {
        
    var that;
        
    var _poacherTreasure = null;
    var _poacherTreasureView = null;
    
    var _backgroundShapeView = null;
    var _infoText1View = null;    
    var _stoneRewardView = null;
    var _woodRewardView = null;
    var _furRewardView = null;
    var _cashRewardView = null;

    var infoContainer = null;  
    
    my = my || {};
    
    my.typeName = 'PoacherTreasureAnnotationView';
 

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
      _poacherTreasureView = view;
      _poacherTreasure = view.poacherTreasure();
      
      infoContainer = AWE.UI.createMultiLineContainer();
      infoContainer.initWithController(controller, AWE.Geometry.createRect(145,-6,130,0));
      this.addChild(infoContainer);

      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
      _infoText1View.setTextAlign("left");
      //_infoText1View.setIconImage("map/icon/owner");
      infoContainer.addChild(_infoText1View);

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
      
      // info view
      if (_backgroundShapeView) {
        this.removeChild(_backgroundShapeView);
      }

      _infoText1View.setText(AWE.I18n.lookupTranslation('map.treasure'));

      if (!_stoneRewardView) {
        _stoneRewardView = AWE.UI.createLabelView();
        _stoneRewardView.initWithControllerAndLabel(my.controller);
        _stoneRewardView.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
        _stoneRewardView.setTextAlign("left");
        _stoneRewardView.setIconImage("dialogs/items/item_stone_xs");
        _stoneRewardView.setText(Math.floor(_poacherTreasure.get('resource_stone_reward')).toString());
        infoContainer.addChild(_stoneRewardView);
      }

      if (!_woodRewardView) {
        _woodRewardView = AWE.UI.createLabelView();
        _woodRewardView.initWithControllerAndLabel(my.controller);
        _woodRewardView.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
        _woodRewardView.setTextAlign("left");
        _woodRewardView.setIconImage("dialogs/items/item_wood_xs");
        _woodRewardView.setText(Math.floor(_poacherTreasure.get('resource_wood_reward')).toString());
        infoContainer.addChild(_woodRewardView);
      }

      if (!_furRewardView) {
        _furRewardView = AWE.UI.createLabelView();
        _furRewardView.initWithControllerAndLabel(my.controller);
        _furRewardView.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
        _furRewardView.setTextAlign("left");
        _furRewardView.setIconImage("dialogs/items/item_fur_xs");
        _furRewardView.setText(Math.floor(_poacherTreasure.get('resource_fur_reward')).toString());
        infoContainer.addChild(_furRewardView);
      }

      if (!_cashRewardView) {
        _cashRewardView = AWE.UI.createLabelView();
        _cashRewardView.initWithControllerAndLabel(my.controller);
        _cashRewardView.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
        _cashRewardView.setTextAlign("left");
        _cashRewardView.setIconImage("dialogs/items/item_toads_xs");
        _cashRewardView.setText(Math.floor(_poacherTreasure.get('resource_cash_reward')).toString());
        infoContainer.addChild(_cashRewardView);
      }

      infoContainer.layoutSubviews(); // call this by hand, as only changed visibility

      var backgroundGraphics = new Graphics();
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(0, 0,
                                       infoContainer.frame().size.width + 12,
                                       infoContainer.frame().size.height+ 4, 4);
      _backgroundShapeView = AWE.UI.createShapeView();
      _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundGraphics);
      _backgroundShapeView.setFrame(AWE.Geometry.createRect(infoContainer.frame().origin.x - 6,
                                                            infoContainer.frame().origin.y - 2,
                                                            infoContainer.frame().size.width + 12,
                                                            infoContainer.frame().size.height+ 4));
      this.addChildAt(_backgroundShapeView, 0);

      that.setNeedsDisplay();
    }
                
    that.layoutSubviews = function() {
      that.recalcView();
      _super.layoutSubviews();
    }
    
    that.annotatedView = function() {
      return _poacherTreasureView;
    }
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



