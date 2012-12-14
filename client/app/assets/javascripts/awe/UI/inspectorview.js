/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox  <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName              = 'InspectorView';
    
    my.backgroundShapeView   = null;
        
    my.inspectorFrame        = null;
    my.objectView            = null;
    my.flagView              = null;
    my.flagFrameView         = null;

    my.infoButtonView        = null;
    my.prevButtonView        = null;
    my.nextButtonView        = null;
  
    my.skimButtonsEnabled    = false; // whether or not to display previous and next button
    
    my.inspectedObject       = null;
    my.allianceId            = null;
  
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews:     AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:           AWE.Ext.superior(that, "setFrame"),
      updateView:         AWE.Ext.superior(that, "updateView"),
    };
    
    // actions to be connected from the outside
    
    that.onFlagClicked          = null;
    that.onInventoryButtonClick = null;
    that.onPreviousButtonClick  = null;
    that.onNextButtonClick      = null;
    that.onCenterButtonClick    = null;

    
    /** overwritten view methods */
    
    that.initWithControllerAndAllianceId = function(controller, allianceId, frame) {
      _super.initWithController(controller, frame);      
      my.allianceId = allianceId;
    };
    
    that.setAllianceId = function(allianceId) {
      if (my.allianceId !== allianceId) {
        my.allianceId = allianceId; 
        this.setNeedsDisplay();
      }
    }
    
    /** sets whether or not to display the previous and next
      * buttons */
    that.setSkimButtonsEnabled = function(state) {
      state = state || false;
      my.skimButtonsEnabled = state;
    }
    
    that.recalcView = function() {
            
      if (!my.backgroundShapeView) {
        var backgroundShapeGraphics = new Graphics();
        backgroundShapeGraphics.setStrokeStyle(0);
        backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
        my.backgroundShapeView = AWE.UI.createShapeView();
        my.backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);
        my.backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 230, 100));
        this.addChildAt(my.backgroundShapeView, 0);
      }  
      
      if (!my.inspectorFrame) {
        my.inspectorFrame = AWE.UI.createImageView();
        my.inspectorFrame.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/inspector/frame"));
        my.inspectorFrame.setFrame(AWE.Geometry.createRect(184, 0, 128, 128));
        my.inspectorFrame.onClick = function() { 
          if (that.onCenterButtonClick) {
            that.onCenterButtonClick();
          }
        };
        this.addChild(my.inspectorFrame);
      }      

      var allianceId = my.allianceId
      if (my.flagView && my.flagView.allianceId() !== allianceId) {      
        this.removeChild(my.flagView);
        this.removeChild(my.flagFrameView);
        my.flagView = null;
        my.flagFrameView = null;
      }
      if (!my.flagView) {
        // Allicance Flag
        if (allianceId) {
          my.flagView = AWE.UI.createAllianceFlagView();
          my.flagView.initWithController(my.controller);
          my.flagView.setFrame(AWE.Geometry.createRect(152, 3, 56, 74));
          my.flagView.setAllianceId(allianceId);
          my.flagView.setTagVisible(true);
          my.flagView.onClick = function() { 
            if (that.onFlagClicked) {
              that.onFlagClicked(allianceId);
            };
          };
          this.addChildAt(my.flagView, 10);
          
          my.flagFrameView = AWE.UI.createImageView();
          my.flagFrameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/banner/small"));
          my.flagFrameView.setFrame(AWE.Geometry.createRect(149, 0, 61, 78));
          my.flagView.onClick = function() { 
            WACKADOO.activateAllianceController(allianceId);   
          }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
          this.addChildAt(my.flagFrameView, 11);
        }
      }

      // buttons oben
      if (!my.infoButtonView) {
        my.infoButtonView = AWE.UI.createButtonView();
        my.infoButtonView.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.info'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.infoButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.infoButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
        my.infoButtonView.onClick = function() {
          if (that.onInventoryButtonClick) {
            that.onInventoryButtonClick(my.inspectedObject);
          }
        };
        this.addChild(my.infoButtonView);
      }

      if (!my.prevButtonView && my.skimButtonsEnabled) {
        // button unten
        my.prevButtonView = AWE.UI.createButtonView();
        my.prevButtonView.initWithControllerTextAndImage(my.controller, '<<', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.prevButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        my.prevButtonView.onClick = function() {
          if (that.onPreviousButtonClick) {
            that.onPreviousButtonClick(my.inspectedObject) 
          }
        };
        this.addChild(my.prevButtonView);
      }
      else if (my.prevButtonView && !my.skimButtonsEnabled) {
        this.removeChild(my.prevButtonView);
        my.prevButtonView = null;
      }
  
      if (!my.nextButtonView && my.skimButtonsEnabled) {
        my.nextButtonView = AWE.UI.createButtonView();
        my.nextButtonView.initWithControllerTextAndImage(my.controller, '>>', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.nextButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        my.nextButtonView.onClick = function() {
          if (that.onNextButtonClick) {
            that.onNextButtonClick(my.inspectedObject) 
          }
        };
        this.addChild(my.nextButtonView);
      }
      else if (my.nextButtonView && !my.skimButtonsEnabled) {
        this.removeChild(my.nextButtonView);
        my.nextButtonView = null;
      }   
    }
        
    that.updateView = function() {
      that.recalcView();      
      _super.updateView();
    };   
    
    that.army = function() {
      return _army;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




