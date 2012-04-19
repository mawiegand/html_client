/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createFortressAnnotationView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'FortressAnnotationView';
    
    var _node = null;
    
    var _fortressView = null;

    // selected
    var _button1View = null;    
    var _button2View = null;    

    //  hovered
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _easementImageView = null;


    var that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };

    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);

      _node = view.node();
      _fortressView = view;
      
      _button1View = AWE.UI.createButtonView();
      _button1View.initWithControllerTextAndImage(controller, '', AWE.UI.ImageCache.getImage("map/button1"));
      _button1View.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _button1View.setFrame(AWE.Geometry.createRect(12, 0, 52, 52));
      _button1View.setVisible(false);
      this.addChild(_button1View);

      _button2View = AWE.UI.createButtonView();
      _button2View.initWithControllerTextAndImage(controller, '', AWE.UI.ImageCache.getImage("map/button1"));
      _button2View.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _button2View.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
      _button2View.setEnabled(false);
      _button2View.onClick = function() { that.onAttackButtonClick(); }
      this.addChild(_button2View);
      
      var backgroundGraphics = new Graphics();
      backgroundGraphics.setStrokeStyle(0);
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(0, 0, 64, 44, 8);
      var backgroundShape = AWE.UI.createShapeView();
      backgroundShape.initWithControllerAndGraphics(my.controller, backgroundGraphics);
      backgroundShape.setFrame(AWE.Geometry.createRect(128, 12, 64, 44));
      this.addChildAt(backgroundShape, 0);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(130, 11, 60, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/display/icon");
      _infoText1View.setText('120%');
      this.addChild(_infoText1View);

      _infoText2View = AWE.UI.createLabelView();
      _infoText2View.initWithControllerAndLabel(controller);
      _infoText2View.setFrame(AWE.Geometry.createRect(130, 33, 60, 24));      
      _infoText2View.setTextAlign("left");
      _infoText2View.setIconImage("map/display/icon");
      _infoText2View.setText(AWE.Config.DEV_ALLIANCE_ID ===  _node.region().allianceId() ? 'Neutral' :  'Hostile');
      this.addChild(_infoText2View);
      
      _easementImageView = AWE.UI.createImageView();
      _easementImageView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement/no"));
      _easementImageView.setFrame(AWE.Geometry.createRect(80, 0, 32, 32));
      _easementImageView.setContentMode(module.setContentModeNone);
      this.addChild(_easementImageView);
      
      my.frame.size.width = 192;
      my.frame.size.height = 128;
    }

    that.onAttackButtonClick = function() {};
    
    that.updateView = function() {
      
      // buttons
      if (_node.region().location(0)) {
        _button1View.setVisible(_fortressView.selected());
        if (_node.region().location(0).isOwn()) {
          _button1View.setText('Enter');
          // action verdrahten
        }
        else {
          _button1View.setText('Spy');
          // action verdrahten
        }
        _button1View.updateView();
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(_node.region());
      }

      _button2View.setVisible(_fortressView.selected());
      _button2View.setText('Battle');
      _button2View.updateView();
      
      // waylay image aktualisieren
      _easementImageView.setImage(AWE.UI.ImageCache.getImage(AWE.Config.DEV_ALLIANCE_ID ==  _node.region().allianceId() ? "map/easement/yes" : "map/easement/no"));

      // rank image
      // _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank" + Math.round((_army.get('rank') + 25) / 25)));
// 
      // // info view
      // _container.removeChild(_backgroundShape);
      // var lines = _army.get('battle_id') && _army.get('battle_id') != 0 || _army.get('target_location_id') && _army.get('target_location_id') != 0 ? 3 : 1; 
//       
      // var backgroundGraphics = new Graphics();
      // backgroundGraphics.setStrokeStyle(0);
      // backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      // backgroundGraphics.drawRoundRect(128, 34 - lines * 11, 64, lines * 22, 8);
      // _backgroundShape = new Shape(backgroundGraphics);
      // _container.addChildAt(_backgroundShape, 0);
//       
      // if (_army.get('battle_id') && _army.get('battle_id') != 0 || _army.get('target_location_id') && _army.get('target_location_id') != 0) {
        // _infoText1View.setOrigin(AWE.Geometry.createPoint(130, 0));
        // _infoText2View.setVisible(true);
        // _infoText3View.setVisible(true);
      // }
      // else {
        // _infoText1View.setOrigin(AWE.Geometry.createPoint(130, 22));
        // _infoText2View.setVisible(false);
        // _infoText3View.setVisible(false);
      // }
// 
      // _infoText1View.setText(_army.get('strength'));
      // if (_army.get('battle_id') && _army.get('battle_id') != 0) {
        // _infoText2View.setText('Kampf!');
        // _infoText3View.setText('Dauer');
      // }
      // else if (_army.get('target_location_id') && _army.get('target_location_id') != 0) {
        // _infoText3View.setText(_army.get('target_location_id'));
        // _infoText2View.setText(_army.get('target_reached_at'));
      // }
      
      that.setNeedsDisplay();
      // that.setNeedsLayout();
    }

    that.layoutSubviews = function() {
      _super.layoutSubviews();
    }
        
    that.locationView = function() {
      return _fortressView;
    }
    
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));






