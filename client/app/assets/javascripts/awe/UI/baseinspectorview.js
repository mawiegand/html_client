/* Authors: Patrick Fox <patrick@5dlab.com>,
 *          Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createBaseInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName = 'BaseInspectorView';
    my.settlementType = null;
            
    that = module.createInspectorView(spec, my);

    var _super = {
      recalcView: AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;
    that.onPreviousSettlementButtonClick = null;
    that.onNextSettlementButtonClick = null;
    that.onNewArmyButtonClick = null;        
        
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      that.initWithControllerAndAllianceId(controller, location ? location.allianceId() : null, frame);      

      my.inspectedObject = location;         
      my.settlementType = AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId() || 2];
      
      that.recalcView();
    };
    
    that.onPreviousButtonClick  = function(location) {
      this.onPreviousSettlementButtonClick(location);
    }
    that.onNextButtonClick      = function(location) {
      this.onNextSettlementButtonClick(location);
    }
    
    that.recalcView = function() {
      
      var location      = my.inspectedObject;

      var allianceId    = location ? location.allianceId()  : null;
      var allianceColor = location ? location.allianceColor()  : null;
      var isOwnLocation = location.isOwn();
      var settlement    = location.settlement();

      this.setAllianceId(allianceId);
      this.setAllianceColor(allianceColor);
      this.setSkimButtonsEnabled(isOwnLocation && settlement && settlement !== AWE.GS.SettlementManager.getPreviousSettlementOfCharacter(settlement));
      
      _super.recalcView();
      
      if (location.name() !== that.getText()) {
        that.setText(location.settlement() ? location.settlement().get('name') : location.name());
      }
    };
    
    
    that.location = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));





