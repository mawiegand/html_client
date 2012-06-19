/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Util = AWE.Util || {};

/** Helpers for working with the game rules. Provides function for looking-up,
 * parsing and evaluating things like costs and requirements. Also provides
 * helpers for checking things to be buildable / researchable according to 
 * the present state (resources available, available buildings and sciences)
 * of the empire (of the current character).
 *
 * Helpers in here should return bindable and observable (Ember) objects as 
 * default, so its easy to use results in Ember views, properties and 
 * bindings. */
AWE.Util.Rules = (function(module) {
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  COSTS
  //
  ////////////////////////////////////////////////////////////////////////////
  
  /** processes a given hash of costs from the rules (e.g. from a building,
   * science or unit) to return an array of objects where each provides 
   *  A) the amount of resources (after evaluating the formula)
   *  B) a link to the resource type from the rules. */ 
  module.evaluateResourceCosts = function(costHash, level, all) {
    return _evaluateResourceCosts(costHash, level, all, true);    
  };
  
  /** does the same as the method before but does NOT evaluate formulas. */ 
  module.lookupResourceCosts = function(costHash, all) {
    return _evaluateResourceCosts(costHash, 0, all, false);      
  };
  
  /** multiplies the costs inside a costs-array that has been created using
   * one of the functions for evaluating / looking-up costs. Returns a 
   * new array and does not change the original cost array. ResourceTypes
   * are copied over. 
   * 
   * This method is quite handy when calculating e.g. the total costs of
   * a bunch of units. */
  module.multipliedResourceCosts = function(costs, scalar) {
  	costs  = costs  || [];
  	scalar = scalar || 0; 

    return costs.map(function(item) {
	    return Ember.Object.create({
        name:         item.get('name'),
        amount:       item.get('amount') * scalar,
        resourceType: item.get('resourceType'),
      });
	  });
	};
	
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  PRODUCTION TIMES
  //
  ////////////////////////////////////////////////////////////////////////////
  
  /** determines production time in seconds by evaluating the given formula
   * with the given level and dividing it by the speed (of the queue). */
  module.calculateAndEvaluateProductionTime = function(baseTimeFormula, level, speed) {
    return _calculateAndEvaluateProductionTime(baseTimeFormula, level, speed, true);
  };
  
  /** does the same as the method before but does NOT evaluate the formula.*/
  module.calculateProductionTime = function(baseTime, speed) {
    return _calculateAndEvaluateProductionTime(baseTime, 0, speed, false);    
  };
  

	
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  REQUIREMENTS
  //
  ////////////////////////////////////////////////////////////////////////////
  
  
  
  
  
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  PRIVATE HELPERS
  //
  ////////////////////////////////////////////////////////////////////////////
  
  var _evaluateResourceCosts = function(costHash, level, all, evaluate) {
    costHash  = costHash || {}
    level     = level || 0;
		var costs = [];

	  AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
      if (costHash.hasOwnProperty(item.id)) {
        var amount = costHash[item.id];
        if (evaluate) {
          amount = Math.ceil(AWE.GS.Util.parseAndEval(amount, level));
        }
        if (all || amount > 0) {
	        costs.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
            amount:       amount,
            resourceType: item,
          }));
        }
      }
	  });
    return costs;
  };
  
  var _calculateAndEvaluateProductionTime = function(baseTime, level, speed, evaluate) {
    baseTime = baseTime || null;
    level    = level || 0;
    speed    = speed || 1.0;
    if (evaluate) {
      baseTime = AWE.GS.Util.parseAndEval(baseTime, level);
    }
    return baseTime / speed;
  }
  

  return module;      

}(AWE.Util.Rules || {}));
