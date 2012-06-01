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
		building_categories: null,
		building_types: null,
		
		getSettlementType: function(id) {
			var settlementType = this.get('settlement_types')[id];
			if (settlementType === undefined || !settlementType) {
				console.log('ERROR: requested non-existing settlement type ' + settlementType);
			}
			return settlementType;		
		},
		
		getBuildingType: function(id) {
			var buildingType = this.get('building_types')[id];
			if (buildingType === undefined || !buildingType) {
				console.log('ERROR: requested non-existing building type ' + buildingType);
			}
			return buildingType;
		},
		getBuildingCategory: function(id) {
			var buildingCategory = this.get('building_categories')[id];
			if (buildingCategory === undefined || !buildingCategory) {
				console.log('ERROR: requested non-existing building category ' + buildingCategory);
			}
			return buildingCategroy;
		},
		getBuildingIdsWithCategories: function(categoryIds) {
		  var buildings = this.filter(this.get('building_types'), 'category', categoryIds);
		  return this.extractIds(buildings);
		},
		filter: function(hash, attribute, values) {
		  var results = [];
		  AWE.Ext.applyFunctionToHash(hash, function(key, entity) {
		    if (values.indexOf(entity[attribute]) != -1) {
		      results.push(entity);
		    }
		  });
		  return results;
		},
		extractIds: function(hash) {
		  var results = [];
		  AWE.Ext.applyFunctionToHash(hash, function(key, entity) {
		    results.push(entity.id);
	    });
	    return results;
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


