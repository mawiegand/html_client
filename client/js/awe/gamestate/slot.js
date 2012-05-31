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

	//	buildingIdBinding: 'slot.building_id',  ///< bind the slot's building id to the corresponding property of the building
	//	levelBinding: 'slot.level',     ///< property holding the present level of building 

		/** returns a unique string identifying the building type. This 
		 * is used to associate all images to the building. */
		type: function() {
			var buildingId = this.get('buildingId');
			if (buildingId === undefined || buildingId === null) {
				return null;
			}
			return AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
		}.property('buildingId'),
		
		/** returns the localized name of the building. */
		name: function() {
			var buildingId = this.get('buildingId');
			console.log(buildingId);
			if (buildingId === undefined || buildingId === null) {
			  console.log('building id is missing.');
			  return null;
			}
			return AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['name']['en_US'];  // TODO: correct localization			
		}.property('buildingId'),
	
		/** returns the localized description of the building. */
		description: function() {
			var buildingId = this.get('buildingId');
			return AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['description']['en_US'];  // TODO: correct localization			
		}.property('buildingId'),
		
		nextLevel: function() {
		  var level = this.get('level');
		  if (level) {
		    return parseInt(level) + 1;  // todo: check against max-level!
		  }
		  return null;
		}.property('level', 'buildingId'),
		
		
		canBeUpgraded: function() {
		  
		}.property('level', 'buildingId'),
		

		canBeTornDown: function() {
		  
		}.property('level', 'buildingId'),
		
	
		
	
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

    init: function(spec) {
      this._super(spec);
      this.updateConstructionOptions();
    },

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
		}.property('building_id'),
		
    updateConstructionOptions: function() {
      var options = [];
      console.log('updating options');
      
      if (this.get('building_id') === null || this.get('building_id') === undefined) {
        if (! this.settlement()) {
          return [] ;
        }

        var settlementType = this.settlement().settlementType();
        console.log('settlementType', settlementType, this.buildingOptions());
        
        options = [
          AWE.GS.Building.create({ buildingId: 0, level: 1 }),
          AWE.GS.Building.create({ buildingId: 1, level: 1 }),
          AWE.GS.Building.create({ buildingId: 2, level: 1 }),
          AWE.GS.Building.create({ buildingId: 3, level: 1 }),
        ];
      }
      else {
        options = [ this.get('building') ];
      }
      
      this.set('constructionOptions', options);
      console.log('new options', this.get('constructionOptions'));
      
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
		
		/** returns the building options (catagory ids) of buildings that can be build
		 * at this particular slot. Doesn't really compute something, just eases access 
		 * to the rules. */
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