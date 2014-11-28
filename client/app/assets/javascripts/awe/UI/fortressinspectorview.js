/* Author: Patrick Fox <patrick@5dlab.com>
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createFortressDetailView = function(spec, my) {

    var that;
    
    my = my || {};

    my.node = null;
        
    that = module.createInspectorView(spec, my);

    that.onFlagClicked = null;
    that.onPreviousSettlementButtonClick = null;
    that.onNextSettlementButtonClick = null;
    that.onNewArmyButtonClick = null;

    var _super = {
      recalcView: AWE.Ext.superior(that, "recalcView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      that.initWithControllerAndAllianceId(controller, node ? node.region() : null, frame);      
      
      my.node            = node;
      my.inspectedObject = node.region();
      

      this.recalcView();
    };
    
    var callWithFortressLocation = function(f, region) {
      if (region && region.location(0)) {
        f(region.location(0));
      }
      else if (region) {
        AWE.Map.Manager.fetchLocationsForRegion(region, function() {
          if (region.location(0)) {
            f(region.location(0));
          }
        });
      }
    }
    
    that.onPreviousButtonClick  = function(region) {
      if (this.onPreviousSettlementButtonClick) {
        callWithFortressLocation(function(self) {  // wrap in function to keep context with this
          return function(location) {
            self.onPreviousSettlementButtonClick(location);
          };
        }(this), region);
      }
    }
    
    that.onNextButtonClick  = function(region) {
      if (this.onNextSettlementButtonClick) {
        callWithFortressLocation(function(self) {  // wrap in function to keep context with this
          return function(location) {
            self.onNextSettlementButtonClick(location);
          };
        }(this), region);
      }
    }    
    
    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.currentCharacter;
      var region           = my.inspectedObject;

      var allianceId       = region ? region.allianceId()  : null;
      var allianceColor    = region ? region.allianceColor()  : null;
      var isOwnRegion      = region.isOwn();

      this.setAllianceId(allianceId);
      this.setAllianceColor(allianceColor);
      
      var location = null;
      AWE.Map.Manager.fetchLocationsForRegion(region, function() {
        if (region.location(0)) {
          location = region.location(0);
        }
      });      
      this.setSkimButtonsEnabled(isOwnRegion && location && location !== AWE.GS.SettlementManager.getPreviousSettlementOfCharacter(location));
      
      _super.recalcView();
      
      var name = region.name();
      that.setText(name);
    }
        
    that.region = function() {
      return my.inspectedObject;
    }
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









