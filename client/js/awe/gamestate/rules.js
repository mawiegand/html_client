/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Character class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.RulesAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Rules
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Rules = module.Entity.extend({     // extends Entity to Rules
    typeName: 'Rules',              ///< identifies instances of this type
      
    version: null,
    settlement_types: null,
    unit_types: null,
    unit_categories: null,
		building_types: null,
		building_categories: null,
		resource_types: null,
		queue_types: null,
		queue_categories: null,
		
    getSettlementType: function(id) {
      var settlementType = this.get('settlement_types')[id];
      if (settlementType === undefined || !settlementType) {
        console.log('ERROR: requested non-existing settlement type ' + settlementType);
      }
      return settlementType;    
    },
    
    getUnitType: function(id) {
      var unitType = this.get('unit_types')[id];
      if (unitType === undefined || !unitType) {
        console.log('ERROR: requested non-existing unit type ' + unitType);
      }
      return unitType;    
    },
    
		getUnitTypesWithCategories: function(categoryIds) {
		  var unitTypes = this.get('unit_types').filter(function(item, index, self) {  // "filter" is ember-supplied
		    return categoryIds.indexOf(item['category']) >= 0; // indexOf returns -1 in case the element is not in the array
		  });
		  return unitTypes;
		},
    
		getBuildingType: function(id) {
			var buildingType = this.get('building_types')[id];
			if (buildingType === undefined || !buildingType) {
				console.log('ERROR: requested non-existing building type ' + buildingType);
			}
			return buildingType;
		},
		
		getResourceType: function(id) {
			var resourceType = this.get('resource_types')[id];
			if (resourceType === undefined || !resourceType) {
				console.log('ERROR: requested non-existing resource type ' + resourceType);
			}
			return resourceType;
		},
		
		getBuildingCategory: function(id) {
			var buildingCategory = this.get('building_categories')[id];
			if (buildingCategory === undefined || !buildingCategory) {
				console.log('ERROR: requested non-existing building category ' + id);
				return null;
			}
			return buildingCategory;
		},
		
		getBuildingTypeIdsWithCategories: function(categoryIds) {
		  var buildingTypes = this.get('building_types').filter(function(item, index, self) {  // "filter" is ember-supplied
		    return categoryIds.indexOf(item['category']) >= 0; // indexOf returns -1 in case the element is not in the array
		  });
		  return this.extractIds(buildingTypes);
		},
		
		/** looks-up the queue type for the given (numeric) id. */
		getQueueType: function(queueTypeId) {
		  var queueType = this.get('queue_types')[queueTypeId];
		  if (queueType === undefined || queueType === null) {
				console.log('ERROR: requested non-existing queue type ' + queueTypeId);
		    return null;
		  }
		  return queueType;
		},
		
    getQueueTypeIdWithBuildingCategory: function(categoryId) {
      var queueTypes = this.get('queue_types');
      for (var id = 0; id < queueTypes.length; id++) {
        var queueType = queueTypes[id];
        if (queueType !== undefined &&
            queueType.produces &&
            queueType.category == 'queue_category_construction' &&
            queueType.produces.contains(categoryId)) {
          return id;                                  
        }
      }
      return null;
    },
    
    getQueueTypeIdWithUnitCategory: function(categoryId) {
      var queueTypes = this.get('queue_types');
      for (var id = 0; id < queueTypes.length; id++) {
        var queueType = queueTypes[id];
        if (queueType !== undefined &&
            queueType.produces &&
            queueType.category == 'queue_category_training' &&
            queueType.produces.contains(categoryId)) {
          return id;
        }
      }
      return null;
    },
    
		extractIds: function(collection) {
		  return collection.getEach('id'); // "getEach" is supplied by ember
		},
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   RULES MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.RulesManager = (function(my) {    
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
      
    my.createEntity = function() { return module.Rules.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.getRules = function() { 
      return that.getEntity(0); 
    };
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateRules = function(callback) {
      var url = AWE.Config.RULES_SERVER_BASE+'rules';
      return my.updateEntity(url, 0, module.ENTITY_UPDATE_TYPE_FULL, callback); 
    };
        
    return that;
      
  }());
    
  return module;
  
}(AWE.GS || {}));


