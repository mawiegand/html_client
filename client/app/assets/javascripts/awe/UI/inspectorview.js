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
    
    var _textLabel;
    
    my = my || {};
    
    my.typeName              = 'InspectorView';
    
    my.backgroundBitmap      = null;   // the translucent - black pull-out rectangle hodling the textual information 
        
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
      
      _backgroundBitmap = AWE.UI.createImageView();
      _backgroundBitmap.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("hud/top/background"));
      _backgroundBitmap.setFrame(AWE.Geometry.createRect(0, 0, 340, 60));
      this.addChild(_backgroundBitmap);    
      
      //_textLabel = new Text("", "bold 16px HVDComicSerifPro", "#fff");
      _textLabel = AWE.UI.createLabelView();
      _textLabel.initWithControllerAndLabel(my.controller);
      _textLabel.setTextAlign("center");
      _textLabel.setFrame(AWE.Geometry.createRect(42, 10, 218, 50));
      _textLabel.onClick = function() { 
        if (that.onFlagClicked) that.onFlagClicked(); 
      }            
      this.addChild(_textLabel);      
    };
    
    that.setText = function(text) {
      if (_textLabel) {
        _textLabel.setText(text);      
      }
    }
    
    that.getText = function() {
      if (_textLabel) return _textLabel.text();
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

/*
      var allianceId = my.allianceId
      var allianceColor = my.allianceColor
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
          my.flagView.setAllianceColor(allianceColor);
          my.flagView.setTagVisible(false);
          my.flagView.onClick = function() { 
            if (that.onFlagClicked) {
              that.onFlagClicked(allianceId);
            };
          };
          this.addChildAt(my.flagView, 10);          
        } 
        
      }
*/            
      
      if (!my.centerButtonView) {
        my.centerButtonView = AWE.UI.createButtonView();
        my.centerButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/top/center"));
        my.centerButtonView.setFrame(AWE.Geometry.createRect(228, 16, 28, 28));
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
        my.infoButtonView.setFrame(AWE.Geometry.createRect(265, 16, 28, 28));
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
        my.prevButtonView.setFrame(AWE.Geometry.createRect(5, 14, 32, 32));
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




