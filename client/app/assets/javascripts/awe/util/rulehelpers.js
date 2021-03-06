/**
 * @fileOverview 
 * Namespace for providing small helpers for better handling the game rules.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
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
 * bindings. 
 *
 * @namespace */
AWE.Util.Rules = (function(module) /** @lends AWE.Util.Rules */ {
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  TRANSLATION AND LOCALIZATION
  //
  ////////////////////////////////////////////////////////////////////////////  
  
  /** 
   * looks up a localized description / name / flavour from the rules.
   *
   * @function
   * @name AWE.Util.Rules.lookupTranslation */ 
  module.lookupTranslation = function(hash) {
    return hash[AWE.Settings.locale] ? hash[AWE.Settings.locale] : hash[AWE.Config.DEFAULT_LOCALE];
  };
  
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  RESOURCES
  //
  ////////////////////////////////////////////////////////////////////////////
  
  module.roundProductionRate = function(value) {
    if (value < 0) {
      return value;
    }
    if (value < 10) {
      return Math.floor(value*100)/100.0;
    }
    return Math.floor(value);
  }
  
  /** 
   * processes a given array of resource productions. 
   *
   * @param definitions an array of resource productions extracted from the 
   *        game rules
   * @param level the level of the building or science to use in the evaluation
   *        of the cost formula
   *
   * @return {Array} returns an array of productions where each entry has an 
   *         attribute "amount" and an attribute "resourceType" linking
   *         to the corresponding entry in the rules.
   *
   * @function
   * @name AWE.Util.Rules.evaluateResourceProduction */ 
  module.evaluateResourceProduction = function(definitions, level, boni, evaluate) {
    return _evaluateResourceProduction(definitions, level, boni);
  };    
  
  /** 
   * processes a given hash of costs from the rules (e.g. from a building,
   * science or unit) to return an array of objects where each provides 
   *  A) the amount of resources (after evaluating the formula)
   *  B) a link to the resource type from the rules. 
   *
   * @param costHash a hash of resource costs extracted from the game rules
   * @param level the level of the building or science to use in the evaluation
   *        of the cost formula
   * @param all all boolean indicating whether to return all costs from the array,
   *        even if they evaluate to zero.
   *
   * @return {Array} returns an array of costs where each entry has an 
   *         attribute "amount" and an attribute "resourceType" linking
   *         to the corresponding entry in the rules.
   *
   * @function
   * @name AWE.Util.Rules.evaluateResourceCosts */ 
  module.evaluateResourceCosts = function(costHash, level, boni, all) {
    return _evaluateResourceCosts(costHash, level, all, true);    
  };


  /** ==== MARC ==== */

  module.evaluateGarrisonBoni = function(definitions, level, all) {
    return _evaluateGarrisonBoni(definitions, level, all);
  };

  module.evaluateArmyBoni = function(definitions, level, all) {
    return _evaluateArmyBoni(definitions, level, all);
  };

  module.evaluateDefenseBonus = function(definitions, level, all) {
    return _evaluateDefenseBonus(definitions, level, all);
  };


  /* ================ */
  
  /** does the same as the method before but does NOT evaluate formulas.    
   * @function
   * @name AWE.Util.Rules.lookupResourceCosts */ 
  module.lookupResourceCosts = function(costHash, all) {
    return _evaluateResourceCosts(costHash, 0, all, false);      
  };
  
  module.evaluateResourceCapacity = function(capacities, level, all) {
    return _evaluateResourceCapacity(capacities, level, all, true);    
  };  
  
  module.evaluateResourceProductionBoni = function(boni, level, all) {
    return _evaluateResourceProductionBoni(boni, level, all, true);    
  };    
  
  /** multiplies the costs inside a costs-array that has been created using
   * one of the functions for evaluating / looking-up costs. Returns a 
   * new array and does not change the original cost array. ResourceTypes
   * are copied over. 
   * 
   * This method is quite handy when calculating e.g. the total costs of
   * a bunch of units. 
   * @function
   * @name AWE.Util.Rules.multipliedResourceCosts */ 
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
	
  module.addedResourceCosts = function(costsA, costsB) {
  	costsA  = costsA || [];
  	costsB  = costsB || [];
  	var costSum = [];
  	var helper = [];
  	
  	for (var i = 0; i < costsA.length; i++) {
  	  helper[costsA[i].getPath('resourceType.id')] = (helper[costsA[i].getPath('resourceType.id')] || 0) + costsA[i].get('amount');
  	}
  	
  	for (var i = 0; i < costsB.length; i++) {
  	  helper[costsB[i].getPath('resourceType.id')] = (helper[costsB[i].getPath('resourceType.id')] || 0) + costsB[i].get('amount');
  	}
  	
  	for (var i = 0; i < helper.length; i++) {
      costSum.push(Ember.Object.create({
        amount:       helper[i],
        resourceType: AWE.GS.RulesManager.getRules().getResourceType(i),
      }));        
  	}
  	
    return costSum;
	};
	
  
  module.resourceCostsWithResourceId = function(costs, resourceId) {
  	costs  = costs || [];
  	
  	for (var i = 0; i < costs.length; i++) {
  	  if (costs[i].getPath('resourceType.id') === resourceId) {
  	    return costs[i].get('amount');
  	  }
  	}
  	
    return 0;
	};
	
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  PRODUCTION TIMES
  //
  ////////////////////////////////////////////////////////////////////////////
  
  /** determines production time in seconds by evaluating the given formula
   * with the given level and dividing it by the speed (of the queue). 
   * @function
   * @name AWE.Util.Rules.calculateAndEvaluateProductionTime */ 
  module.calculateAndEvaluateProductionTime = function(baseTimeFormula, level, speed) {
    return _calculateAndEvaluateProductionTime(baseTimeFormula, level, speed, true);
  };
  
  /** does the same as the method before but does NOT evaluate the formula.
   * @function
   * @name AWE.Util.Rules.calculateProductionTime */ 
  module.calculateProductionTime = function(baseTime, speed) {
    return _calculateAndEvaluateProductionTime(baseTime, 0, speed, false);    
  };
  
  module.lookupConstructionSpeedupCost = function(duration) {
    if (duration === undefined || duration === null) {
      return null;
    }
	  var costs = AWE.GS.RulesManager.getRules().construction_speedup;
	  var entry = null;
	  costs.forEach(function(item) {
	    if (!entry && duration < item.hours * 3600) { // hours to seconds
	      entry = item;
	    }
	  });
	  return entry;
  };

  module.isConstructionSpeedupPossible = function(duration) {
    return module.lookupConstructionSpeedupCost(duration) !== null ;
  };
	
	
  module.lookupTrainingSpeedupCost = function(duration) {
    if (duration === undefined || duration === null) {
      return null;
    }
	  var costs = AWE.GS.RulesManager.getRules().training_speedup;
	  var entry = null;
	  costs.forEach(function(item) {
	    if (!entry && duration < item.hours * 3600) { // hours to seconds
	      entry = item;
	    }
	  });
	  return entry;
  };

  module.isTrainingSpeedupPossible = function(duration) {
    return module.lookupTrainingSpeedupCost(duration) !== null ;
  };	
	
  module.lookupArtifactInitiationSpeedupCost = function(duration) {
    if (duration === undefined || duration === null) {
      return null;
    }
	  var costs = AWE.GS.RulesManager.getRules().artifact_initiation_speedup;
	  var entry = null;
	  costs.forEach(function(item) {
	    if (!entry && duration < item.hours * 3600) { // hours to seconds
	      entry = item;
	    }
	  });
	  return entry;
  };

  module.isArtifactInitiationSpeedupPossible = function(duration) {
    return module.lookupArtifactInitiationSpeedupCost(duration) !== null ;
  };

  ////////////////////////////////////////////////////////////////////////////
  //
  //  REQUIREMENTS
  //
  ////////////////////////////////////////////////////////////////////////////


  module.meetRequirements = function(requirementGroups, settlement, character, slotToExclude, considerJobs) {
    var unmetGroups = module.failedRequirementGroups(requirementGroups, settlement, character, slotToEclude, considerJobs);
    return unmetGroups === null || unmetGroups.length === 0;
  };


  /** checks the given array of requirements for those requirements that are
   * not met in the given settlement and for the given character. 
   * @returns an array of all non-met requiremnts or null, if all
   *          checks passed positive.
   * @function
   * @name AWE.Util.Rules.failedRequirementGroups */
  module.failedRequirementGroups = function(requirementGroups, settlement, character, slotToExclude, considerJobs) {
    considerJobs       = considerJobs       || false;
    settlement         = settlement         || null;
    requirementGroups  = requirementGroups  || [];
    slotToExclude      = slotToExclude      || null;
    
    var requirementsMet = false;
    
    var failedRequirementGroups = requirementGroups.map(function(item) {
      var failedInsideGroup = module.failedRequirements(item, settlement, character, slotToExclude, considerJobs);
      requirementsMet = requirementsMet || (failedInsideGroup === null || failedInsideGroup.length === 0);
      return failedInsideGroup;
    });
    
    return requirementsMet ? null : failedRequirementGroups.compact();
  }; 
  
  module.requirementGroupFailsDueToMaxRequirement = function(requirementGroup, settlement, character, slotToExclude, considerJobs) {
    considerJobs       = considerJobs       || false;
    settlement         = settlement         || null;
    slotToExclude      = slotToExclude      || null;
    
    var failedReqs = module.failedRequirements(requirementGroup, settlement, character, slotToExclude, considerJobs, true); // consider only max reqs
    return failedReqs && failedReqs.length > 0;    
  };

  /** checks the given array of requirements for those requirements that are
   * not met in the given settlement and for the given character. 
   * @returns an array of all non-met requiremnts or null, if all
   *          checks passed positive.
   * @function
   * @name AWE.Util.Rules.failedRequirements */
  module.failedRequirements = function(requirements, settlement, character, slotToExclude, considerJobs, onlyMax) {
    considerJobs = considerJobs  || false;
    settlement   = settlement    || null;
    requirements = requirements  || [];
    slotToExclude= slotToExclude || null;
    onlyMax      = onlyMax       || false;
    
    var failedRequirements = requirements.filter(function(item) {
      return !module.meetsRequirement(item, settlement, character, slotToExclude, considerJobs, onlyMax);
    });
    
    return failedRequirements.length > 0 ? failedRequirements : null;
  }; 

  /** checks one requirement for the given settlement and character. Presently,
   * this method handles requirements regarding buildings as well as sciences.
   *
   * @returns true, iff the requirement is met.
   * @function
   * @name AWE.Util.Rules.meetsRequirement */
  module.meetsRequirement = function(requirement, settlement, character, slotToExclude, considerJobs, onlyMax) {
    if (requirement.type === 'building') {
      return module.meetsBuildingRequirement(requirement, settlement, slotToExclude, considerJobs, onlyMax);
    }
    else if (requirement.type === 'science') {
      return module.meetsScienceRequirement(requirement, character, considerJobs, onlyMax);
    }
    else {
      //log('ERROR: Requirement of unknown type ', requirement.type);
    }
    return true ;
  };
  
  
  /** checks one requirement of the building type for the given settlement
   * and character. A building requirement can come in two flavours:
   * A max-level-requirement is met, when there's not a single building
   * of the particular type in the settlement that has a larger level.
   * A min-level-requirement is met, when there's at least one building
   * of the particular type in the settlement that has at least the
   * specified level.
   *
   * Min-level-requirements are used to specify prerequisits (e.g.
   * first have a construction yard before building a house). Max-level-
   * requirements are used to specify exculsions (e.g. build either 
   * a nuclear power plant or a nature preservation area).
   *
   * @returns true, iff the requirement is met.
   * @function
   * @name AWE.Util.Rules.meetsBuildingRequirement */
  module.meetsBuildingRequirement = function(requirement, settlement, slotToExclude, considerJobs, onlyMax) {
    if (!settlement) {
      return false;
    }
    if (!requirement) {
      return true;
    }
    var slots = settlement.get('enumerableSlots') || [];
    var maxMet = !(requirement.max_level !== undefined && requirement.max_level !== null && requirement.max_level < 0) ; // cannot bet true, when smaller than zero.
    var minMet = onlyMax || requirement.min_level === undefined || requirement.min_level === null || requirement.min_level <= 0; // it's always true, if it's not specified or less equal 0
    var excludeSlotNum = slotToExclude ? slotToExclude.get('slot_num') : -1;
    
    slots.forEach(function(item) {
      if (excludeSlotNum !== item.get('slot_num')) {

        var buildingId = item.get('building_id'); 
        buildingId = buildingId === undefined || buildingId === null ? -1 : buildingId; //protect against undefined and null, wheras id 0 is ok!
        if (requirement.id === buildingId && requirement.max_level !== undefined && requirement.max_level !== null) {
          maxMet = maxMet && requirement.max_level >= (considerJobs ? item.getPath('building.levelAfterJobs') : item.get('level'));    // all buildings must not be larger than the max level. may consider ongoing jobs in order to prevent queueing two mutually exclusive buildings
        }
        if (requirement.id === buildingId && requirement.min_level && !onlyMax) {
          minMet = minMet || requirement.min_level <= item.get('level');    // one building must be larger than or equal to the min level; no not consider ongoing jobs; building must be finished to allow queueing of a dependent building
        }
      }
    });
    
    return maxMet && minMet;
  };
  
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  SETTLEMENT LEVELS
  //
  ////////////////////////////////////////////////////////////////////////////  
  
  module.normalizedLevel = function(level, settlementTypeId) {
    level = level || 0;
    settlementTypeId = settlementTypeId || 0;
    if (AWE.Config.MAP_LOCATION_TYPE_CODES[settlementTypeId]  === 'base') {
      return Math.floor(level / AWE.Config.BASE_LEVEL_DIVISOR);
    }
    else if (AWE.Config.MAP_LOCATION_TYPE_CODES[settlementTypeId] === 'fortress') {
      return Math.floor(level / AWE.Config.FORTRESS_LEVEL_DIVISOR);
    }
    if (AWE.Config.MAP_LOCATION_TYPE_CODES[settlementTypeId] === 'outpost') {
      return Math.floor(level / AWE.Config.OUTPOST_LEVEL_DIVISOR);
    }
    return level;
  }
  
  ////////////////////////////////////////////////////////////////////////////
  // 
  //  PRIVATE HELPERS
  //
  ////////////////////////////////////////////////////////////////////////////
  
  var _formatFractionsFloor = function(frac) {
    return frac >= 1.0 || frac < 0.01 ? Math.floor(frac) : ( frac >= 0.1 ? Math.floor(frac*10.0) / 10.0 : Math.floor(frac*100.0) / 100.0);
  }

  var _evaluateResourceProduction = function(definitions, level, boni) {
    definitions     = definitions || {}
    level           = level || 0;
    boni            = boni || {};
		var productions = [];

	  definitions.forEach(function(item) {
	    var resourceType = AWE.GS.RulesManager.getRules().resource_types[item.id]
      var base  = AWE.GS.Util.parseAndEval(item.formula, level);
      var bonus = boni[resourceType.id] ? boni[resourceType.id].bonus : 0.0;
      if (base > 0) {
        productions.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          baseProduction: _formatFractionsFloor(base),
          bonusRelative:  _formatFractionsFloor(bonus*1000.0)/10.0,
          bonusAbsolute:  _formatFractionsFloor(bonus*base*10.0)/10.0,
          rate:           _formatFractionsFloor(base*(1.0+bonus)*10.0)/10.0,
          resourceType:   resourceType,
          localizedDesc:  function() {
            return "bonus: +" + this.get('bonusRelative') + "%";
          }.property('bonusRelative'),
        }));
      }
	  });
    return productions;
  };
  
  var _evaluateResourceCapacity = function(definitions, level, all, evaluate) {
    definitions    = definitions || {}
    level          = level || 0;
		var capacities = [];

	  definitions.forEach(function(item) {
	    var resourceType = AWE.GS.RulesManager.getRules().resource_types[item.id]
      var capacity  = AWE.GS.Util.parseAndEval(item.formula, level);
      if (all || capacity > 0) {
        capacities.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          capacity:     capacity,
          resourceType: resourceType,
        }));
      }
	  });
    return capacities;
  };
  
  var _evaluateResourceProductionBoni = function(definitions, level, all, evaluate) {
    definitions  = definitions || {}
    level        = level || 0;
		var boni     = [];

	  definitions.forEach(function(item) {
	    var resourceType = AWE.GS.RulesManager.getRules().resource_types[item.id]
      var bonus        = AWE.GS.Util.parseAndEval(item.formula, level);
      if (all || bonus > 0) {
        boni.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          bonus:        Math.floor(bonus*1000)/10.0,
          resourceType: resourceType,
        }));
      }
	  });
    return boni;
  };  
  
  var _evaluateResourceCosts = function(costHash, level, all, evaluate) {
    costHash  = costHash || {}
    level     = level || 0;
		var costs = [];

	  AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
      if (costHash.hasOwnProperty(item.id)) {
        var amount = costHash[item.id];
        if (evaluate) {
          amount = AWE.GS.Util.parseAndEval(amount, level);
          if(amount < 1.0)
          {
            amount = Math.round(amount * 100)/100
          }
          else if(amount < 10.0)
          {
            amount = Math.round(amount * 10)/10
          }
          amount = Math.ceil(amount);
        }
        if (all || amount > 0) {
	        costs.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
            amount:       amount,
            resourceType: item,
          }));
        }
      }
      else if (all) {
	      costs.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          amount:       0,
          resourceType: item,
        }));        
      }
	  });
    return costs;
  };



// ==== MARC =====
  var _evaluateGarrisonBoni = function(definition, level, all, evaluate) {
    definition  = definition || {}
    level        = level || 0;
    var bonus;

    bonus = AWE.GS.Util.parseAndEval(definition, level);
    
    return bonus;
  };

  var _evaluateArmyBoni = function(definition, level, all, evaluate) {
    definition  = definition || {}
    level        = level || 0;
    var bonus;

    bonus = AWE.GS.Util.parseAndEval(definition, level);
    
    return bonus;
  };

  var _evaluateDefenseBonus = function(definition, level, all, evaluate) {
    definition  = definition || {}
    level        = level || 0;
    var bonus;

    bonus = AWE.GS.Util.parseAndEval(definition, level);
    
    return bonus;
  };
  
//============


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
