/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {  

  module.ArmyListDialog = module.PopUpDialog.extend({
    templateName: "army-list-dialog",
  });

  module.ArmyListTabView = module.TabViewNew.extend({

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: AWE.I18n.lookupTranslation('army.list.armies'), 
         view:  module.ArmyListView.extend(),
         isTitelTab: false,
         buttonClass: "left-menu-button-subtab"
       },
       { key:   "tab2",
         title: AWE.I18n.lookupTranslation('army.list.settlements'), 
         view:  module.SettlementListView.extend(),
         isTitelTab: false,
         buttonClass: "right-menu-button-subtab"
       }
     ]);

     this._super();
   },
  });

  module.ArmyListView = Ember.View.extend({
    templateName: "army-list-view",
    classNames: ["army-list-view"],

    init: function() {
      AWE.GS.ArmyManager.updateArmiesForCharacter(AWE.GS.game.getPath('currentCharacter.id'),
        AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {});

      this._super();
    },
    armies: function() {
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
      var list   = [];
      var self   = this;
      
      for (id in armies) {
        var army = armies[id];

        // We need to put them into an ember object to iterate over them in the template
        if (!army.isGarrison()) {
          list.push(army);
        }
      }

      for (var i = 0; i < list.length; ++i) {
        for (var j = 0; j < list.length; ++j) {
          var _army = list[i];
          if (list[i].get('exp') > list[j].get('exp')) {
            list[i] = list[j];
            list[j] = _army;
          }
        }
      }

      return list;
    }.property('controller')
  });

  module.SettlementListView = Ember.View.extend({
    templateName: "settlement-list-view",
    classNames: ["settlement-list-view"],

    settlements: function() {
      var settlementsHash = AWE.GS.SettlementManager.getOwnSettlements();    

      var settlementArray = [];

      for(var key in settlementsHash) {
        if (settlementsHash.hasOwnProperty(key)) {
          var settlement = settlementsHash[key]
          settlementArray.push(settlement);
        }
      }
      return settlementArray;
    }.property()
  });

  module.ArmyListItem = Ember.View.extend({
    templateName: "army-list-item",
    army: null,
    regionName: null,

    infoPressed: function() {
      var army = this.getPath('army');
      if (!army) {
        return ;
      }

      var mapController = WACKADOO.activateMapController(true);
      WACKADOO.closeAllModalDialogs();
      mapController.centerLocationAndMarkArmy(army);

      return false; // prevent default behavior
    }
  });

  module.SettlementListItem = Ember.View.extend({
    templateName: "settlement-list-item",
    settlement: null,

    infoPressed: function() {
      var settlement = this.getPath('settlement');
      if (!settlement) {
        return ;
      }
      var mapController = WACKADOO.activateMapController(true);
      WACKADOO.closeAllModalDialogs();
      mapController.centerSettlement(settlement);
      mapController.setSelectedSettlement(settlement);

      return false; // prevent default behavior
    }
  });

  return module;
    
}(AWE.UI.Ember || {}));

