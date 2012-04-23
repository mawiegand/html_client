/* Author: Patrick Fox <patrick@5dlab.com>
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createFortressDetailView = function(spec, my) {

    var that;


    var _container = null;
    
    var ownerLabelView = null;
    var allianceLabelView = null;
    
    // neu
    var _nameLabelView = null;
    var _ownerLabelView = null;
    var _pathLabelView = null;

    var _apLabelView = null;
    var _locationLabelView = null;
    var _rankLabelView = null;
    var _sizeAllLabelView = null;
    var _sizeType1LabelView = null;
    var _sizeType2LabelView = null;
    var _sizeType3LabelView = null;
    
    var _baseShape = null;
    var infoButtonView = null;
    var _prevButtonView = null;
    var _nextButtonView = null;
    var _circleShape = null;
    
    var _fortressImageName = null;

//  var _stanceView = null;
//  var _moveButtonView = null;


    my = my || {};

    my.region = null;
    my.node = null;
    
    my.backgroundShape = null;
    my.flagView = null;
    my.fortressView = null;
    my.fortressFlagView = null;

    that = module.createContainer(spec, my);

    that.onFlagClicked = null;

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      
      my.node = node;
      my.region = node.region();

      this.recalcView();

      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width  = my.frame.size.height;
      my.container.height = my.frame.size.height;
    };
    
    
    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.currentCharacter;
      
      if (!my.backgroundShape) {
        var backgroundShapeGraphics = new Graphics();
        backgroundShapeGraphics.setStrokeStyle(0);
        backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
        my.backgroundShape = AWE.UI.createShapeView();
        my.backgroundShape.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);    
        this.addChild(my.backgroundShape);
      }

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setFrame(AWE.Geometry.createRect(5, 15, 200, 36));      
        _nameLabelView.setTextAlign("left");
        this.addChild(_nameLabelView);
      }
      var name = my.region.name();
      if (_nameLabelView.text() != name) {
        _nameLabelView.setText(name);
      }
      
      if (!_ownerLabelView) {
        _ownerLabelView = AWE.UI.createLabelView();
        _ownerLabelView.initWithControllerAndLabel(my.controller);
        _ownerLabelView.setFrame(AWE.Geometry.createRect(5, 45, 95, 24));      
        _ownerLabelView.setTextAlign("left");
        this.addChild(_ownerLabelView);
      }
      var owner = my.region.ownerName(); // + (my.region.allianceId() > 0 ? ' | ' + my.region.allianceTag() : '');
      if (_ownerLabelView.text() != owner) {
        _ownerLabelView.setText(owner);
      }
      
      if (!_pathLabelView) {
        _pathLabelView = AWE.UI.createLabelView();
        _pathLabelView.initWithControllerAndLabel(my.controller);
        _pathLabelView.setFrame(AWE.Geometry.createRect(105, 45, 60, 24));      
        _pathLabelView.setTextAlign("right");
        _pathLabelView.setColor('rgb(190,190,190)');
        this.addChild(_pathLabelView);
      }
      if (_pathLabelView.text() != '('+my.node.path()+')') {
        _pathLabelView.setText('('+my.node.path()+')');
      }

      if (!_apLabelView) {
        _apLabelView = AWE.UI.createLabelView();
        _apLabelView.initWithControllerAndLabel(my.controller);
        _apLabelView.setFrame(AWE.Geometry.createRect(5, 64, 100, 24));      
        _apLabelView.setTextAlign("left");
        _apLabelView.setIconImage("map/display/icon");
        this.addChild(_apLabelView);
      }
      _apLabelView.setText('AP: keine');


      if (!_rankLabelView) {
        _rankLabelView = AWE.UI.createLabelView();
        _rankLabelView.initWithControllerAndLabel(my.controller);
        _rankLabelView.setTextAlign("left");
        _rankLabelView.setIconImage("map/display/icon");
        _rankLabelView.setFrame(AWE.Geometry.createRect(5, 84, 100, 24));      
        this.addChild(_rankLabelView);
      }
      _rankLabelView.setText(my.region.fortressLevel());



      
      // Allicance Flag
      if (!my.flagView && my.region.allianceId()) {
        my.flagView = AWE.UI.createAllianceFlagView();
        my.flagView.initWithController(my.controller);
        my.flagView.setFrame(AWE.Geometry.createRect(150, 0, 60, 75));
        my.flagView.setTagVisible(true);
        my.flagView.onClick = function() { 
          if (that.onFlagClicked) {
            that.onFlagClicked(my.region.allianceId());
          };
        };
        this.addChild(my.flagView);
      }
      if (my.flagView && my.flagView.allianceId() !== my.region.allianceId()) {
        my.flagView.setAllianceId(my.region.allianceId());
      }
      if (my.flagView && my.flagView.allianceTag() !== my.region.allianceTag()) {
        my.flagView.setAllianceTag(my.region.allianceTag());
      }      
      
      // circle
      if (!_circleShape) {
        var circleGraphics = new Graphics();
        circleGraphics.setStrokeStyle(1);
        circleGraphics.beginStroke('rgb(0, 0, 0)');
        circleGraphics.beginFill('rgb(255, 255, 255)');
        circleGraphics.drawCircle(248, 64, 64);
        _circleShape = new AWE.UI.createShapeView();
        _circleShape.initWithControllerAndGraphics(my.controller, circleGraphics);    
        this.addChild(_circleShape);
      }
      
      
      // FORTRESS IMAGE //////////////////////////////////////////////////////     
      var newFortressImageName = 'map/fortress/small';        
      if (my.region.fortressLevel() > 3) {
        newFortressImageName = 'map/fortress/middle';
      }
      if (my.region.fortressLevel() > 7) {
        newFortressImageName = 'map/fortress/large';
      }
      
      if (newFortressImageName != _fortressImageName && my.fortressView) {
        my.container.removeChild(my.fortressView);
        my.fortressView = null;
      }
      _fortressImageName = newFortressImageName;

      if (!my.fortressView) {
        my.fortressView = AWE.UI.createImageView();
        my.fortressView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_fortressImageName));
        my.fortressView.setFrame(AWE.Geometry.createRect(202, 20, AWE.Config.MAPPING_FORTRESS_SIZE*1.5, AWE.Config.MAPPING_FORTRESS_SIZE*1.5));
        this.addChild(my.fortressView);
      }
      
      // FORTRESS FLAG ///////////////////////////////////////////////////////////    
      if (!my.fortressFlagView && my.region.allianceId()) {
        my.fortressFlagView = AWE.UI.createAllianceFlagView();
        my.fortressFlagView.initWithController(my.controller);
        my.fortressFlagView.setFrame(AWE.Geometry.createRect(242, 70, 12, 20));
        my.fortressFlagView.setDirection('down');
        this.addChild(my.fortressFlagView);
      }
      
      if (my.fortressFlagView && my.region.allianceId() != my.fortressFlagView.allianceId()) {
        my.fortressFlagView.setAllianceId(my.region.allianceId());
      }

      // buttons oben
      if (!infoButtonView) {
        infoButtonView = AWE.UI.createButtonView();
        infoButtonView.initWithControllerTextAndImage(my.controller, 'Info', AWE.UI.ImageCache.getImage("map/button1"));
        infoButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        infoButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
        infoButtonView.onClick = function() { that.onInfoButtonClick() };
        this.addChild(infoButtonView);
      }

      // button unten
      if (!_prevButtonView && my.region.ownerId() === currentCharacter.getId()) {
        _prevButtonView = AWE.UI.createButtonView();
        _prevButtonView.initWithControllerTextAndImage(my.controller, '<<', AWE.UI.ImageCache.getImage("map/button1"));
        _prevButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        this.addChild(_prevButtonView);
      }

      if (!_nextButtonView && my.region.ownerId() === currentCharacter.getId()) {
        _nextButtonView = AWE.UI.createButtonView();
        _nextButtonView.initWithControllerTextAndImage(my.controller, '>>', AWE.UI.ImageCache.getImage("map/button1"));
        _nextButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        this.addChild(_nextButtonView);
      }
    }
    
    that.onInfoButtonClick = function() { console.log('info button clicked'); }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
      
      /*
      _nameLabelView.setText('name');
      _apLabelView.setText('AP: keine');
      _locationLabelView.setText('Home');
      _rankLabelView.setText('rank');
      _sizeAllLabelView.setText('size_present');
      _sizeType1LabelView.setText('size_present');
      _sizeType2LabelView.setText('size_present');
      _sizeType3LabelView.setText('size_present');
      // _rankLabelView.setText(_army.get('rank'));
      // _sizeAllLabelView.setText(_army.get('size_present'));
      // _sizeType1LabelView.setText(_army.get('size_present'));
      // _sizeType2LabelView.setText(_army.get('size_present'));
      // _sizeType3LabelView.setText(_army.get('size_present')); */
    };   
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









