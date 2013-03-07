/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArtifactAnnotationView = function(spec, my) {
        
    var that;
        
    var _artifact = null;
    var _artifactView = null;
    
    var _backgroundShapeView = null;
    var _infoText1View = null;    
    var _infoText2View = null;    

    var infoContainer = null;  
    
    my = my || {};
    
    my.typeName = 'ArtifactAnnotationView';
 

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
      _artifactView = view;
      _artifact = view.artifact();
      
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
      
      this.updateButtonVisibility();
      this.updateButtonState();
    };

    that.updateView = function () {
      this.recalcView();
      _super.updateView();
    }
    
    that.updateButtonVisibility = function() {
//      if (!_armyView.selected()) {
//        _moveButtonView.setVisible(false);
//        _attackButtonView.setVisible(false);
//        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(false);
//        _foundButtonView.setVisible(false);
//      }
//      else if (_army.isOwn() && (_army.get('mode') === null || _army.get('mode') === AWE.Config.ARMY_MODE_IDLE)) { // 0 -> idle or null -> unkown
//        _moveButtonView.setVisible(true);
//        _attackButtonView.setVisible(true);
//        _foundButtonView.setVisible(_army.get('hasSettlementFounder'));
//        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(false);
//      }
//      else if (_army.isOwn() && _army.get('mode') === AWE.Config.ARMY_MODE_MOVING) {
//        _moveButtonView.setVisible(false);
//        _attackButtonView.setVisible(false);
//        _foundButtonView.setVisible(false);
//        _cancelButtonView.setVisible(true);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(false);
//      }
//      else if (_army.isOwn() && _army.get('isFighting')) {
//        _moveButtonView.setVisible(false);
//        _attackButtonView.setVisible(false);
//        _cancelButtonView.setVisible(false);
//        _foundButtonView.setVisible(false);
//        // _retreatButtonView.setVisible(true);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(true);
//      }
//      else if (_army.get('isFighting')) {
//        _moveButtonView.setVisible(false);
//        _attackButtonView.setVisible(false);
//        _foundButtonView.setVisible(false);
//        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(true);
//      }
//      else {
//        _moveButtonView.setVisible(false);
//        _attackButtonView.setVisible(false);
//        _foundButtonView.setVisible(false);
//        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
//        _battleInfoButtonView.setVisible(false);
//      }
    }
    
    that.updateButtonState = function() {
//      _moveButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting'));
//      _attackButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting'));
//      _foundButtonView.setEnabled(
//        _army.canFoundSettlementAtPresentLocationNow()
//      );
//      _retreatButtonView.setEnabled(_army.get('isFighting'));
//
//      _moveButtonView.setSelected(_actionMode === 'moveTargetSelection');
//      _attackButtonView.setSelected(_actionMode === 'attackTargetSelection');
//      _foundButtonView.setSelected(_actionMode === 'foundSettlement');
//      _retreatButtonView.setSelected(_army.get('battle_retreat'));
    }
    
    that.recalcView = function() {
      
      // buttons
//      _stanceButtonView.setVisible(false); // NO third button at present
//      this.updateButtonVisibility();
//      if (_army.isOwn() && _armyView.selected()) {
//        this.updateButtonState();
//      }
//
//      // rank image
//      _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank" + Math.min(4, Math.floor((_army.get('rank') || 0) / 5 + 1))));
//
      // info view
      if (_backgroundShapeView) {
        this.removeChild(_backgroundShapeView);
      }
//
      _infoText1View.setText(_artifact.get('name'));

      if (!_infoText2View && _artifact.get('initiated')) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(my.controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/icon/rank");
        _infoText2View.setText(AWE.I18n.lookupTranslation('settlement.artifact.initiated'));
        infoContainer.addChild(_infoText2View);
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
      return _artifactView;
    }
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



