/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.RulesAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Rules
  //
  // ///////////////////////////////////////////////////////////////////////

  module.DOMAIN_CHARACTER = 0;
  module.DOMAIN_SETTLEMENT = 1;
  module.DOMAIN_ALLIANCE = 2;

  module.Rules = module.Entity.extend({     // extends Entity to Rules
    typeName: 'Rules',              ///< identifies instances of this type
      
    version: null,
    settlement_types: null,
		victory_types: null,
    unit_types: null,
    unit_categories: null,
		building_types: null,
		building_categories: null,
		resource_types: null,
		queue_types: null,
		queue_categories: null,
		alliance_max_members: 0,
		artifact_types: null,
		
    getArtifactType: function(id) {
      var artifactType = this.get('artifact_types')[id];
      if (artifactType === undefined || !artifactType) {
        log('ERROR: requested non-existing artifact type ' + artifactType);
      }
      return artifactType;    
    },
    
    getVictoryType: function(id) {
      var victoryType = this.get('victory_types')[id];
      if (victoryType === undefined || !victoryType) {
        log('ERROR: requested non-existing victory type ' + victoryType);
      }
      return victoryType;    
    },
    
    getVictoryTypeWithSymbolicId: function(symbolicId) {
      var victoryTypes = this.get('victory_types');
      
      for (var i = 0; i < victoryTypes.length; i++) {
        var victoryType = victoryTypes[i];
        if (victoryType['symbolic_id'] === symbolicId) {
          return victoryType;
        }
      }
      log('ERROR: requested non-existing victory type ' + symbolicId);
    },

    getSettlementType: function(id) {
      var settlementType = this.get('settlement_types')[id];
      if (settlementType === undefined || !settlementType) {
        log('ERROR: requested non-existing settlement type ' + settlementType);
      }
      return settlementType;    
    },
    
    getUnitType: function(id) {
      var unitType = this.get('unit_types')[id];
      if (unitType === undefined || !unitType) {
        log('ERROR: requested non-existing unit type ' + unitType);
      }
      return unitType;    
    },
    
		getUnitTypesWithCategories: function(categoryIds, includeUntrainable) {
		  var unitTypes = this.get('unit_types').filter(function(item, index, self) {  // "filter" is ember-supplied
		    return (includeUntrainable || item['trainable']) && categoryIds.indexOf(item['category']) >= 0; // indexOf returns -1 in case the element is not in the array
		  });
		  return unitTypes;
		},
		
		getUniTypeWithSymbolicId: function(symbolicId) {
      var unitTypes = this.get('unit_types');
      
      for (var i = 0; i < unitTypes.length; i++) {
        var unitType = unitTypes[i];
        if (unitType['db_field'] === symbolicId) {
          return unitType;
        }
      }
      log('ERROR: requested non-existing unit type ' + symbolicId);
      return null;
    },

    getBuildingType: function(id) {
      var buildingType = this.get('building_types')[id];
      if (buildingType === undefined || !buildingType) {
        log('ERROR: requested non-existing building type ' + buildingType);
      }
      return buildingType;
    },

    getAssignmentType: function(id) {

      log('-----> get type', id);

      var assignmentType = this.get('assignment_types')[id];

      log('-----> get type2', assignmentType);

      if (assignmentType === undefined || !assignmentType) {
        log('ERROR: requested non-existing assignment type ' + assignmentType);
      }
      return assignmentType;
    },

    getResourceType: function(id) {
			var resourceType = this.get('resource_types')[id];
			if (resourceType === undefined || !resourceType) {
				log('ERROR: requested non-existing resource type ' + resourceType);
			}
			return resourceType;
		},
		
		getResourceTypeWithSymbolicId: function(symbolicId) {
			var resourceTypes = this.get('resource_types');
			
      for (var i = 0; i < resourceTypes.length; i++) {
        var resourceType = resourceTypes[i];
  			if (resourceType['symbolic_id'] === symbolicId) {
    			return resourceType;
			  }
      }
 			log('ERROR: requested non-existing resource type ' + symbolicId);
		},
		
		getBuildingCategory: function(id) {
			var buildingCategory = this.get('building_categories')[id];
			if (buildingCategory === undefined || !buildingCategory) {
				log('ERROR: requested non-existing building category ' + id);
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
		
		getBuildingTypeWithSymbolicId: function(symbolicId) {
      var buildingTypes = this.get('building_types');
      
      for (var i = 0; i < buildingTypes.length; i++) {
        var buildingType = buildingTypes[i];
        if (buildingType['symbolic_id'] === symbolicId) {
          return buildingType;
        }
      }
      log('ERROR: requested non-existing building type ' + symbolicId);

      return null;
		},
		
		getSettlementTypeWithSymbolicId: function(symbolicId) {
      var settlementTypes = this.get('settlement_types');
      
      for (var i = 0; i < settlementTypes.length; i++) {
        var settlementType = settlementTypes[i];
        if (settlementType['symbolic_id'] === symbolicId) {
          return settlementType;
        }
      }
      log('ERROR: requested non-existing settlement type ' + symbolicId);

      return null;
		},
		
		/** looks-up the queue type for the given (numeric) id. */
		getQueueType: function(queueTypeId) {
		  var queueType = this.get('queue_types')[queueTypeId];
		  if (queueType === undefined || queueType === null) {
				log('ERROR: requested non-existing queue type ' + queueTypeId);
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

    getAssignmentTypesOfLevel: function(level) {
      log('-----> getAssignmentTypesOfLevel', this.get('assignment_types'));
      var assignmentTypes = this.get('assignment_types').filter(function(item, index, self) {
        return true; // item['level'] <= level;
      });
      return assignmentTypes;
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


