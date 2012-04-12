/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArmyActionView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'ArmyActionView';
    
    var _army = null;
    var _armyView = null;
    
    var _container = null;

    // selected
    var _stanceButtonView = null;    
    var _moveButtonView = null;    
    var _attackButtonView = null;    
    var _rankImageView = null;   
    
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _infoText3View = null;    
    var _actionPointsText = null;     

    var that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _armyView = view;
      _army = view.army();
      
      _stanceButtonView = AWE.UI.createButtonView();
      _stanceButtonView.initWithControllerTextAndImage(controller, 'stance', AWE.UI.ImageCache.getImage("map/button1"), frame);
      _stanceButtonView.setFrame(AWE.Geometry.createRect(12, 6, 52, 52));
      _container.addChild(_stanceButtonView.displayObject());

      _moveButtonView = AWE.UI.createButtonView();
      _moveButtonView.initWithControllerTextAndImage(controller, 'move', AWE.UI.ImageCache.getImage("map/button1"));
      _moveButtonView.setFrame(AWE.Geometry.createRect(12, 70, 52, 52));
      _container.addChild(_moveButtonView.displayObject());

      _attackButtonView = AWE.UI.createButtonView();
      _attackButtonView.initWithControllerTextAndImage(controller, 'attack', AWE.UI.ImageCache.getImage("map/button1"));
      _attackButtonView.setFrame(AWE.Geometry.createRect(128, 70, 52, 52));
      _attackButtonView.onClick = function() { that.onAttackButtonClick(); }
      _container.addChild(_attackButtonView.displayObject());
      
      _rankImageView = AWE.UI.createImageView();
      _rankImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/rank1"));
      _rankImageView.setFrame(AWE.Geometry.createRect(86, 0, 20, 20));
      _container.addChild(_rankImageView.displayObject());

      if (_army.isBattling() || _army.isMoving()) {
        var lines = 3;
      }
      else {
        var lines = 1;
      }        

      var backgroundGraphics = new Graphics();
      backgroundGraphics.setStrokeStyle(0);
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(128, 34 - lines * 11, 64, lines * 22, 8);
      var backgroundShape = new Shape(backgroundGraphics);
      _container.addChild(backgroundShape);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(130, 33 - lines * 11, 66, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/display/icon");
      _infoText1View.setText(_army.get('strength'));
      _container.addChild(_infoText1View.displayObject());

      if (lines > 1) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(130, 22, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/display/icon");
        _infoText2View.setText(army.get('strength'));
        _container.addChild(_infoText2View.displayObject());
  
        _infoText3View = AWE.UI.createLabelView();
        _infoText3View.initWithControllerAndLabel(controller);
        _infoText3View.setFrame(AWE.Geometry.createRect(130, 44, 1000, 24));      
        _infoText3View.setTextAlign("left");
        _infoText3View.setIconImage("map/display/icon");
        _infoText3View.setText(army.get('strength'));
        _container.addChild(_infoText3View.displayObject());
      }
      
      var _actionPointsText = new Text(_army.get('ap_present') + " / " + _army.get('ap_max'), "10px Arial", "#000");
      _actionPointsText.textBaseline = "bottom";
      _actionPointsText.textAlign = "center";
      _actionPointsText.x = 96;
      _actionPointsText.y = 119;
      _container.addChild(_actionPointsText);
    
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
    };
    
    that.onAttackButtonClick = function() {};
    that.onBattleButtonClick = function() {};
    
    that.onMoveButtonClick = function() {};
    that.onCancelMoveButtonClick = function() {};
    
    that.onWaylayButtonClick = function() {};
    
    that.army = function() { return _army; }
    
    that.updateView = function() {
      
      // _stanceButtonView.setVisible(true);
      // _moveButtonView.setVisible(_armyView.hovered());
      // _attackButtonView.setVisible(_armyView.selected());
      // _rankImageView.setVisible(that.selected());
      
      _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank1")); // + _army.get('rank')));
      that.setNeedsDisplay();
      that.setNeedsLayout();
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
                
    that.displayObject = function() {
      return _container;
    };
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _infoText1View.layoutIfNeeded();
      if (_infoText2View) _infoText2View.layoutIfNeeded();
      if (_infoText3View) _infoText3View.layoutIfNeeded();
    }
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



