/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Settlement class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.SlotAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   BUILDING
  //
  // ///////////////////////////////////////////////////////////////////////


	/** Building stores all information associated with a specific building
	 * standing at a specific building site. Actually, there's no Resource
	 * 'Building' in the database. For giving easy access to everything 
	 * related to buildings, this object connects information from the
	 * Resource 'Slot' (a building site in a settlement) with information 
	 * stored in the Game Rules. */
  module.Building = Ember.Object.extend({
		typename: 'Building',

		slot: null,         ///< points to the slot this building is situated at. Needs to be set during creation.
		hashableJobsBinding: "slot.hashableJobs",

	//	buildingIdBinding: 'slot.building_id',  ///< bind the slot's building id to the corresponding property of the building
	//	levelBinding: 'slot.level',     ///< property holding the present level of building 

    /** return the building type from the rules, that describes this
     * building. */
    rule: function() {
			var buildingId = this.get('buildingId');
			if (buildingId === undefined || buildingId === null) {
				return null;
			}
			return AWE.GS.RulesManager.getRules().getBuildingType(buildingId);
    }.property('buildingId').cacheable(),

		/** returns a unique string identifying the building type. This 
		 * is used to associate all images to the building. */
		type: function() {
		  var rule = this.get('rule');
			return rule ? rule['symbolic_id'] : null;
		}.property('buildingId').cacheable(),
		
		/** returns the localized name of the building. */
		name: function() {
			var rule = this.get('rule');
			return rule ? rule['name']['en_US'] : null;  // TODO: correct localization			
		}.property('buildingId').cacheable(),
	
		/** returns the localized description of the building. */
		description: function() {
			var rule = this.get('rule');
			return rule ? rule['description']['en_US'] : null;  // TODO: correct localization			
		}.property('buildingId'),
		
		nextLevel: function() {
		  var level = this.get('level');
		  var nextLevel = level ? parseInt(level) + 1 : 1;
		  
		  var jobs = this.get('hashableJobs').get('collection');
		  if (jobs && jobs.length > 0) {
		    var lastJob = jobs[jobs.length-1];
		    nextLevel = lastJob.get('level_after')+1;
		  }
		  
		  console.log('CALCULATE NEXT LEVEL FOR JOBS: ', this.get('slot').get('jobs'), nextLevel);
		  return nextLevel;
		}.property('level', 'buildingId', 'hashableJobs.changedAt').cacheable(),
		
		logChange: function() {
		  console.log('CHANGE JOBS', this.get('hashableJobs') ? this.get('hashableJobs').get('changedAt') : 'NO HASHABLE JOBS', this);
		  
		}.observes('hashableJobs.changedAt'),
		
		canBeUpgraded: function() {
		  
		}.property('level', 'buildingId').cacheable(),
		
		
		
		// // Abilities //////////////////////////////////////////////////////////		
		
		calculateUnlockedQueues: function(level) {
		  level = level || this.get('level');
		  var rule = this.get('rule');
		  if (!rule || !rule.abilities || ! rule.abilities.unlock_queue) {
		    return [];
		  }
		  else {
		    var that = this;
		    return rule.abilities.unlock_queue.filter(function(item, index, self) {             // filter the abilities for relevance (level)
		      return item.level <= level; 
		    }).map(function(item, index, self) {                                                // generate a description for the ability
		      var queueType = AWE.GS.RulesManager.getRules().getQueueType(item.queue_type_id);
		      if (!queueType) {
		        return null;
		      }
		      return {
		        name: queueType.name['en_US'],
		      };
		    });
		  }
		},
		
		unlockedQueues: function() {
		  return this.calculateUnlockedQueues();
		}.property('buildingId', 'level').cacheable(),
		
		unlockedQueuesNextLevel: function() {
		  return this.calculateUnlockedQueues(this.get('nextLevel'));
		}.property('buildingId', 'nextLevel').cacheable(),
	
	
		/** returns a description of all the present queue-speedups this building causes. */
		calculateSpeedupQueues: function(level) {
		  var rule = this.get('rule');
		  level = level || this.get('level');
		  if (!rule || !rule.abilities || ! rule.abilities.speedup_queue) {
		    return [];
		  }
		  else {
		    return rule.abilities.speedup_queue.map(function(item, index, self) {
		      var queueType = AWE.GS.RulesManager.getRules().getQueueType(item.queue_type_id);
		      if (!queueType) {
		        return null;
		      }
		      return {
		        name: queueType.name['en_US'],
		        speedup: Math.floor(AWE.GS.Util.evalFormula(AWE.GS.Util.parseFormula(item.speedup_formula), level)*100*10)/10.,
		      };
		    });
		  }
		},		
		
		speedupQueues: function() {
		  return this.calculateSpeedupQueues();
		}.property('buildingId', 'level').cacheable(),		

		speedupQueuesNextLevel: function() {
		  return this.calculateSpeedupQueues(this.get('nextLevel'));
		}.property('buildingId', 'nextLevel').cacheable(),		

    // ///////////////////////////////////////////////////////////////////////
    

		canBeTornDown: function() {
		  
		}.property('level', 'buildingId'),
		
/*		nextLevelCopy: function() {
		  var copy = Ember.copy(this);
		  copy.set('level', this.get('nextLevel'));
		  return copy;
		}.property('buildingId', 'level'), */
		
  });    


  // ///////////////////////////////////////////////////////////////////////
  //
  //   (BUILDING) SLOT
  //
  // ///////////////////////////////////////////////////////////////////////    



  module.Slot = module.Entity.extend({     // extends Entity to Settlement
    typeName: 'Slot',
    
    settlement_id: null, old_settlement_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.SlotAccess, 'settlement_id', 'old_settlement_id').observes('settlement_id'),
    
		level: null,
    building_id: null,
    construction_id: null,
    slot_num: null,
    constructionOptions: null,
		
		_buildingInstance: null,      ///< private method holding the instance of the corresponding building, if needed.
		hashableJobs: null,
    jobs: null,
    
    bindings: null,

    init: function(spec) {
      this._super(spec);
      
      if (this.get('id')) {
        var hashableJobs = AWE.GS.JobAccess.getHashableCollectionForSlot_id(this.get('id'));
        this.set('hashableJobs', hashableJobs);
        var binding = Ember.Binding.from('this.hashableJobs.collection').to('jobs');
        binding.connect(this);
        
        var bindings = [ binding ];
        this.set('bindings', binding);
      }
      
      this.updateConstructionOptions();
    },
    
/*    updateJobs: function() {
      var jobs = AWE.GS.JobAccess.getEnumerableForSlot_id(this.getId());
      this.set('jobs', jobs);     // TODO: set only, if array really changed!
    }.observes('level'),          // TODO: observe the right thing...
  */
    
		/** return the building standing at this slot. Returns NULL, in case this
		 * slot is empty. */
		building: function() {
			var buildingId = this.get('building_id');
			if (buildingId === undefined || buildingId === null) {
				return null;
			}
			else {
				var building = this.get('_buildingInstance');
				if (!building) {
					console.log('CREATED NEW BUILDING OBJECT');
					building = module.Building.create({
						slot: this,
						buildingIdBinding: 'slot.building_id',
						levelBinding: 'slot.level',
					});
					this.set('_buildingInstance', building);				
				}
				return building;
			}
		}.property('building_id').cacheable(),
		
    updateConstructionOptions: function() {
      var options = [];
      console.log('updating options');
      
      if (this.get('building_id') === null || this.get('building_id') === undefined) {
        if (! this.settlement()) {
          return [] ;
        }

        var buildingOptions = this.buildingOptions();
        console.log('building options', buildingOptions);
        
        var buildingTypes = AWE.GS.RulesManager.getRules().getBuildingTypeIdsWithCategories(buildingOptions)
        
        AWE.Ext.applyFunctionToHash(buildingTypes, function(key, buildingId) {
          options.push(AWE.GS.Building.create({ buildingId: buildingId, level: 1 }));
        });        
      }
      else {
        options = [ this.get('building') ];
      }
      
      this.set('constructionOptions', options);
      console.log('new construction options', this.get('constructionOptions'));
      
    }.observes('building_id'),


		settlement: function() {
      var sid = this.get('settlement_id');
      if (sid === undefined || sid === null) {
        return sid;
      }
      else {
			  return module.SettlementManager.getSettlement(this.get('settlement_id'));
		  }
		},
		
		/** fetches the slot type from the rules. returns the slot-hash, that holds all
		 * informations from the rules about the type of this praticular slot. */
		slotType: function() {
		  var settlementId = this.get('settlement_id');
		  if (settlementId === undefined || settlementId === null) {
		    return null;
		  }
		  var settlementType = this.settlement().settlementType();
		  if (settlementType === undefined || settlementType === null) {
		    return null;
		  }
		  return settlementType.building_slots[this.get('slot_num')];
		},
		
		/** returns an array of the building options (catagory ids) of buildings that 
		 * can be build at this particular slot. Doesn't really compute something, 
		 * just eases access to the rules. */
		buildingOptions: function() {
		  var slotType = this.slotType();
		  if (!slotType || slotType.options === undefined || slotType.options === null) {
		    return [];
		  }
		  return slotType.options;
		},
		
		
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   BUILDING SLOT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SlotManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastSlotUpdate = new Date(1970);
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdates = {};
  
    my.runningUpdatesPerSettlement = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    // my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    
    my.createEntity = function() { return module.Slot.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getSlot = function(id) {
      return that.getEntity(id);
    }
    
    that.getSlotsAtSettlement = function(id) { 
      return AWE.GS.SlotAccess.getAllForSettlement_id(id);
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateSlot = function(id, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE +  'slots/' + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all armies in a given region. Calls the callback with a
     * list of all the updated armies. */
    that.updateSlotsAtSettlement = function(settlementId, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements/' + settlementId + '/slots';
      return my.fetchEntitiesFromURL(
        url,                                  // url to fetch from
        my.runningUpdatesPerSettlement,           // queue to register this request during execution
        settlementId,                             // regionId to fetch -> is used to register the request
        updateType,                           // type of update (aggregate, short, full)
        module.SlotAccess.lastUpdateForSettlement_id(settlementId), // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.SlotAccess.accessHashForSettlement_id().setLastUpdateAtForValue(settlementId, timestamp);
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.SlotAccess.getAllForSettlement_id(settlementId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
  
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));