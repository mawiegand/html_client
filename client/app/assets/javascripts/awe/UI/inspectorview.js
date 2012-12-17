/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox  <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createInspectorBubbleView = function(spec, my) {

    my = my || {};

    var that = module.createButtonView(spec, my);

    my.typeName   = "InspectorBubbleView";
    my.objectView = null;

    var _super = {
    }

    that.initWithControllerAndImage = function(controller, image, frame) {
      this.initWithControllerTextAndImage(controller, null, image, frame);
    }
    
    that.setObjectView = function(objectView) {
      if (my.objectView) {
        my.container.removeChild(my.objectView.displayObject());
      }
      if (objectView) {
        objectView.onClick = function() { 
          if (that.enabled()) {
            that.onClick();
          }
        }; 
        objectView.onDoubleClick = function() { 
          if (that.enabled()) {
            that.onDoubleClick(); 
          }
        };
        objectView.onMouseOver = function(self) { return function() { self.setHovered(true);  }}(this);
        objectView.onMouseOut  = function(self) { return function() { self.setHovered(false); }}(this);        
     
        var index = 0;
        AWE.Ext.applyFunction(objectView.displayObject(), function(obj){
          my.container.addChildAt(obj, index++);
        });
      }
      my.objectView = objectView;
    }
    
    that.getObjectView = function(objectView) {
      return my.objectView;
    }

    return that;
  };          
          
  module.createInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName              = 'InspectorView';
    
    my.backgroundShapeView   = null;   // the translucent - black pull-out rectangle hodling the textual information 
        
    my.inspectorFrame        = null;   // the solid body of the inspector
    my.flagView              = null;
    my.flagFrameView         = null;

    my.infoButtonView        = null;
    my.prevButtonView        = null;
    my.nextButtonView        = null;


    my.inspectedObjectView   = null;   // will hold a reference to the view visualizing the inspected object 
    my.inspectorBubbleView   = null;   // the pressable glass pane that'll consist of solid backgound, the inspectedObjectView and the covering glass view
  
    my.skimButtonsEnabled    = false;  // whether or not to display previous and next button
    
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
    
    that.setInspectedObjectView = function(inspectedObjectView) {
      my.inspectedObjectView = inspectedObjectView;
      if (my.inspectorBubbleView) {
        my.inspectorBubbleView.setObjectView(inspectedObjectView);
      }
    }
    
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
            
   /*   if (!my.backgroundShapeView) {
        var backgroundShapeGraphics = new Graphics();
        backgroundShapeGraphics.setStrokeStyle(0);
        backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
        my.backgroundShapeView = AWE.UI.createShapeView();
        my.backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);
        my.backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 230, 100));
        this.addChildAt(my.backgroundShapeView, 0);
      }  */
      
      if (!my.inspectorFrame) {
        my.inspectorFrame = AWE.UI.createImageView();
        my.inspectorFrame.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/inspector/body"));
        my.inspectorFrame.setFrame(AWE.Geometry.createRect(0, 0, 414, 204));
        this.addChild(my.inspectorFrame);
      }      

      var allianceId = my.allianceId
      if (my.flagView && my.flagView.allianceId() !== allianceId) {      
        this.removeChild(my.flagView);
//      this.removeChild(my.flagFrameView);
        my.flagView = null;
        my.flagFrameView = null;
      }
      if (!my.flagView) {
        // Allicance Flag
        if (allianceId) {
          my.flagView = AWE.UI.createAllianceFlagView();
          my.flagView.initWithController(my.controller);
          my.flagView.setFrame(AWE.Geometry.createRect(299, 146, 48, 46));
          my.flagView.setAllianceId(allianceId);
          my.flagView.setTagVisible(false);
          my.flagView.onClick = function() { 
            if (that.onFlagClicked) {
              that.onFlagClicked(allianceId);
            };
          };
          this.addChildAt(my.flagView, 10);
          
/*        my.flagFrameView = AWE.UI.createImageView();
          my.flagFrameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/banner/small"));
          my.flagFrameView.setFrame(AWE.Geometry.createRect(149, 0, 61, 78));
          my.flagView.onClick = function() { 
            WACKADOO.activateAllianceController(allianceId);   
          }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
          this.addChildAt(my.flagFrameView, 11); */
        } 
        
      }

      // buttons oben
      if (!my.infoButtonView) {
        my.infoButtonView = AWE.UI.createButtonView();
        my.infoButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/inspector/button/info/normal"));
        my.infoButtonView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/button/info/hovered"), module.CONTROL_STATE_HOVERED);
        my.infoButtonView.setFrame(AWE.Geometry.createRect(228, 0, 68, 66));
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
        my.prevButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/inspector/button/prev/normal"));
        my.prevButtonView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/button/prev/hovered"), module.CONTROL_STATE_HOVERED);
        my.prevButtonView.setFrame(AWE.Geometry.createRect(228, 115, 68, 56));
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
        my.nextButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/inspector/button/next/normal"));
        my.nextButtonView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/button/next/hovered"), module.CONTROL_STATE_HOVERED);
        my.nextButtonView.setFrame(AWE.Geometry.createRect(346, 115, 68, 56));
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
      
      if (!my.inspectorBubbleView) {
        my.inspectorBubbleView = AWE.UI.createInspectorBubbleView();
        my.inspectorBubbleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/inspector/glass/normal"));
        my.inspectorBubbleView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/glass/hovered"), module.CONTROL_STATE_HOVERED);
        my.inspectorBubbleView.setFrame(AWE.Geometry.createRect(250, 9, 144, 146));

        my.inspectorBubbleView.onClick = function() { 
          if (that.onCenterButtonClick) {
            that.onCenterButtonClick(my.inspectedObject);
          }
        };
        
        
        if (my.inspectedObjectView) {
          my.inspectorBubbleView.setObjectView(inspectedObjectView);
        }
        
        this.addChild(my.inspectorBubbleView);
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




