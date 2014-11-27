/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox  <patrick@5dlab.com>,
 *          Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2012-2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {                     
          
  module.createInspectorView = function(spec, my) {

    var that;
    
    my = my || {};
    
    my.typeName              = 'InspectorView';
    
    my.backgroundAndLabelButton = null;
        
    my.infoButtonView        = null;
    my.centerButtonView      = null;
    my.prevButtonView        = null;
    my.nextButtonView        = null;
    
  
    my.skimButtonsEnabled    = false;  // whether or not to display previous and next button
    
    my.inspectedObject       = null;
    my.allianceId            = null;
    my.allianceColor         = null;
    
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
      
      my.backgroundAndLabelButton = AWE.UI.createButtonView();
      my.backgroundAndLabelButton.initWithControllerTextAndImage(my.controller, "", 
        AWE.UI.ImageCache.getImage("hud/top/background"), AWE.Geometry.createRect(0, 0, 340, 60), 
        "18px hvd_comic_serif_proregular");
      my.backgroundAndLabelButton.setTextPos(140, null);
     // if (that.onFlagClicked) {
        my.backgroundAndLabelButton.onClick = function() {    
        if (that.onInventoryButtonClick) {
            that.onInventoryButtonClick(my.inspectedObject);
          }     
          //that.onFlagClicked(my.inspectedObject);
        };
      //}
      this.addChild(my.backgroundAndLabelButton);            
    };
    
    that.setText = function(text) {
      if (my.backgroundAndLabelButton) {
        my.backgroundAndLabelButton.setText(text);      
      }
    }
    
    that.getText = function() {
      if (my.backgroundAndLabelButton) return my.backgroundAndLabelButton.text();
      return null;
    }
    
    that.setAllianceId = function(allianceId) {
      if (my.allianceId !== allianceId) {
        my.allianceId = allianceId;
        this.setNeedsDisplay();
      }
    }

    that.setAllianceColor = function(allianceColor) {
      if (my.allianceColor !== allianceColor) {
        my.allianceColor = allianceColor;
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
      
      if (!my.centerButtonView) {
        my.centerButtonView = AWE.UI.createButtonView();
        my.centerButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/top/center"));
        my.centerButtonView.setFrame(AWE.Geometry.createRect(265, 16, 28, 28));//(228, 16, 28, 28));
        my.centerButtonView.onClick = function() {
          if (that.onCenterButtonClick) {
            that.onCenterButtonClick(my.inspectedObject);
          }
        };
        this.addChild(my.centerButtonView);
      }

      if (!my.infoButtonView) {
        my.infoButtonView = AWE.UI.createButtonView();
        my.infoButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/top/info"));
        my.infoButtonView.setFrame(AWE.Geometry.createRect(228, 16, 28, 28));//(265, 16, 28, 28));
        my.infoButtonView.onClick = function() {
          if (that.onInventoryButtonClick) {
            that.onInventoryButtonClick(my.inspectedObject);
          }
        };
        this.addChild(my.infoButtonView);
      }            

      if (!my.prevButtonView && my.skimButtonsEnabled) {
        my.prevButtonView = AWE.UI.createButtonView();
        my.prevButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/top/arrow/left"));
        my.prevButtonView.setFrame(AWE.Geometry.createRect(15, 14, 32, 32));
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
        my.nextButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/top/arrow/right"));
        my.nextButtonView.setFrame(AWE.Geometry.createRect(303, 14, 32, 32));
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




