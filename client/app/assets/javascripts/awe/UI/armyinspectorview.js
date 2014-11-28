/* Authors: Patrick Fox <patrick@5dlab.com>
 *          Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createArmyInspectorView = function(spec, my) {

    var that;

    my = my || {};
        
    that = module.createInspectorView(spec, my);

    my.typeName = 'ArmyInspectorView';

    var _super = {
      initWithControllerAndAllianceId: AWE.Ext.superior(that, "initWithControllerAndAllianceId"),
      layoutSubviews:                  AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:                        AWE.Ext.superior(that, "setFrame"),
      updateView:                      AWE.Ext.superior(that, "updateView"),
      recalcView:                      AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;
    that.onPreviousArmyButtonClick = null;
    that.onNextArmyButtonClick = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithControllerAndAllianceId(controller, army ? army.get('alliance_id') : null, frame);      
      
      my.inspectedObject = army;  
        
      that.onPreviousButtonClick  = function(army) {
        this.onPreviousArmyButtonClick(army);
      }
      that.onNextButtonClick      = function(army) {
        this.onNextArmyButtonClick(army);
      }
      
      that.recalcView();
    };
    
    that.recalcView = function() {
      
      var army       = my.inspectedObject;

      var allianceId = army ? army.get('alliance_id') : null;
      var allianceColor = army ? army.get('alliance_color') : null;
      var isOwnArmy  = army ? army.isOwn() : false;

      this.setAllianceId(allianceId);
      this.setAllianceColor(allianceColor);
            
      this.setSkimButtonsEnabled(isOwnArmy && army && army !== AWE.GS.ArmyManager.getPreviousArmyOfCharacter(army));
      
      _super.recalcView();            
      
      if (army.get('name') !== that.getText()) {
        that.setText(army.get('name'));
      }      
    };

        
    that.army = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




