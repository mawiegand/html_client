/**
 * @fileOverview 
 * Ember.JS views for displaying details about buildings.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
    
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/buildingdetailviews.html');
  
  /** @class
   * @name AWE.UI.Ember.SelectBuildingDialog */
  module.SelectBuildingDialog = Ember.View.extend( /** @lends AWE.UI.Ember.SelectBuildingDialog# */ {
    templateName: "settlement-dialog-select-building",
    heading: 'Select Building',
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var buildingId = event.view.get('content').get('buildingId');
      var type = event.view.get('content').get('type');
      this.get('controller').constructionOptionClicked(slot, buildingId, type);
      this.get('controller').unselectSlot();
    },         
  });  
  
 
  /** @class
   * @name AWE.UI.Ember.BuildingDetailsDialog */  
  module.BuildingDetailsDialog = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingDetailsDialog# */ {
    templateName: "settlement-dialog-building-details",
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
  }); 
  
  
  /** @class
   * @name AWE.UI.Ember.TrainableUnitButtonView */  
  module.TrainableUnitButtonView = Ember.View.extend( /** @lends AWE.UI.Ember.TrainableUnitButtonView# */ {
    templateName: "trainable-unit-button",
      
    classNameBindings: ['selected'],  
    
      
    click: function(event) {
      this.get('parentView').set('selectedUnitType', this.get('unitType'));
    },     
    
    selected: function() {
      return this.get('unitType') === this.getPath('parentView.selectedUnitType');
    }.property('parentView.selectedUnitType').cacheable(),
    
    
    // TODO: check requirements and costs. should become a mixin somehow
  
    requirementsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    costsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    
  });

  return module;
    
}(AWE.UI.Ember || {}));




