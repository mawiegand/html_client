/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
    
  
  module.TrainingQueueView = Ember.View.extend({
    templateName: "training-queue-view",
    
    selectedUnitButton: null,
    number: "1",

    queue: null,

		costs: function() {
		  var unitType = this.getPath('selectedUnitButton.unitType');
		  return unitType && unitType.costs ? AWE.Util.Rules.lookupResourceCosts(unitType.costs) : null;
		}.property('selectedUnitButton.unitType').cacheable(),
		
		totalCosts: function() {
		  return AWE.Util.Rules.multipliedResourceCosts(this.get('costs'), this.get('number') || 0.0);
		}.property('costs', 'number').cacheable(),
		
		productionTime: function() {
		  var unitType = this.getPath('selectedUnitButton.unitType');
		  var speed    = this.getPath('queue.speed') || 1.0;
		  console.log('SPEED', this.getPath('queue.speed'));
		  return unitType ? AWE.Util.Rules.calculateProductionTime(unitType.production_time, speed) : null;
		}.property('queue.speed', 'selectedUnitButton.unitType').cacheable(),   ///< TODO : also update, when queue's speedup changes.

		totalProductionTime: function() {
		  var productionTime  = this.get('productionTime');
		  var number          = this.get('number')
		  return productionTime && number > 0 ? productionTime * number : null;
		}.property('productionTime', 'number').cacheable(),  

    trainableUnitTypes: function() {
      var queueType = this.getPath('queue.queueType');
      var rules     = AWE.GS.RulesManager.getRules();
      if (!queueType || !queueType.produces) {
        return null;
      }
      return AWE.GS.RulesManager.getRules().getUnitTypesWithCategories(queueType.produces);
    }.property('queue.queueType').cacheable(),

    createJobPressed: function(evt) {
      this.get('controller').trainingCreateClicked(this.get('queue'), this.getPath('selectedUnitButton.unitType.id'), this.get('number'));
    },
    
  });
  
  module.TrainingJobView = Ember.View.extend({
    classNameBindings: ['active'],
    
    job: null,
    
    cancelJobPressed: function(evt) {
      this.get('controller').trainingCancelClicked(this.get('job'));
    },
    
    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),    
  });

  return module;
    
}(AWE.UI.Ember || {}));




