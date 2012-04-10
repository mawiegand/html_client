/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArmySelectionView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'ArmySelectionView';
    
    var _army = null;
    
    var _container = null;

    // selected
    var _stanceButtonView = null;    
    var _moveButtonView = null;    
    var _attackButtonView = null;    
    var _rankImageView = null;    


    var that = module.createView(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _army = army;
      
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

      my.frame.size.width = 192;
      my.frame.size.height = 128;
    };
    
    that.onAttackButtonClick = function() {};
    
    that.updateView = function() {
      _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank" + _army.rank()));
      that.setNeedsDisplay();
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
            
    that.setSelected = function(selected) {
      my.selected = selected;
    };
    
    that.displayObject = function() {
      return _container;
    };
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



