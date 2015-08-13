/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = function (module) {

  module.PoacherTreasureAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Poacher Treasure
  //
  // ///////////////////////////////////////////////////////////////////////

  module.PoacherTreasure = module.Entity.extend({     // extends Entity to Army
    typeName: 'PoacherTreasure',

    type_id: null,

    location_id: null, old_location_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.PoacherTreasureAccess, 'location_id', 'old_location_id').observes('location_id'),

    location: function () {
      return AWE.Map.Manager.getLocation(this.get('location_id'));
    }.property('location_id').cacheable(),

    region_id: null, old_region_id: null,
    regionIdObserver: AWE.Partials.attributeHashObserver(module.PoacherTreasureAccess, 'region_id', 'old_region_id').observes('region_id'),
    region: null,
    regionObserver: function() {
      var regionId = this.get('region_id');
      var self = this;
      if (regionId) {
        var region = AWE.Map.Manager.getRegion(regionId);
        this.set('region', region);
        if (!region) {
          AWE.Map.Manager.fetchSingleRegionById(regionId, function(region) {
            self.set('region', region);
          });
        }
      }
    }.observes('region_id'),

    specific_character_id: null, old_specific_character_id: null,
    specificCharacterIdObserver:AWE.Partials.attributeHashObserver(module.PoacherTreasureAccess, 'specific_character_id', 'old_specific_character_id').observes('specific_character_id'),

    regionName: function() {
      if (this.get('region') != null) {
        return this.get('region').name();
      }
      else {
        return null;
      }
    }.property('region_id').cacheable(),

    isOwn: function() {
      return this.get('specific_character_id') == AWE.GS.game.getPath('currentCharacter.id');
    },

    isOwnProp: function() {
      return this.isOwn();
    }.property('specific_character_id', 'AWE.GS.game.currentCharacter.id'),
  });

  // ///////////////////////////////////////////////////////////////////////
  //
  //   POACHER TREASURE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////

  module.PoacherTreasureManager = function (my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};

    my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for locations, using the location.id as key.

    my.createEntity = function () {
      return module.PoacherTreasure.create();
    };


    // public attributes and methods ///////////////////////////////////////

    that = module.createEntityManager(my);

    that.getPoacherTreasure = function (id) {
      return that.getEntity(id);
    }

    that.getPoacherTreasuresInRegion = function (id) {
      return AWE.GS.PoacherTreasureAccess.getAllForRegion_id(id)
    }

    that.getPoacherTreasuresAtLocation = function (id) {
      return AWE.GS.PoacherTreasureAccess.getAllForLocation_id(id)
    }

    /** returns true, if update is executed, returns false, if request did
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updatePoacherTreasure = function (id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'treasures/' + id;
      return my.updateEntity(url, id, updateType, callback);
    };

    that.updatePoacherTreasures = function (updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'treasures';
      return my.fetchEntitiesFromURL(
        url, // url to fetch from
        my.runningUpdatesPerId, // queue to register this request during execution
        1, // regionId to fetch -> is used to register the request
        updateType, // type of update (aggregate, short, full)
        null,
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (callback) {
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    that.updatePoacherTreasuresInRegion = function (regionId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE + 'regions/' + regionId + '/treasures';
      return my.fetchEntitiesFromURL(
        url, // url to fetch from
        my.runningUpdatesPerRegion, // queue to register this request during execution
        regionId, // regionId to fetch -> is used to register the request
        updateType, // type of update (aggregate, short, full)
        module.PoacherTreasureAccess.lastUpdateForRegion_id(regionId), // modified after
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.PoacherTreasureAccess.accessHashForRegion_id().setLastUpdateAtForValue(regionId, timestamp.add(-1).second());
          }
          if (status === AWE.Net.OK) {
            var poacherTreasures = module.PoacherTreasureAccess.getHashableCollectionForRegion_id(regionId);
            that.fetchMissingEntities(result, poacherTreasures.get('collection'), that.updatePoacherTreasure); // careful: this breaks "this" inside updateArmy
            poacherTreasures.get('collection').forEach(function(poacherTreasure) {
                // TODO is loop needed?
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.PoacherTreasureAccess.getAllForRegion_id(regionId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    that.updatePoacherTreasuresAtLocation = function (locationId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE + 'locations/' + locationId + '/treasures';
      return my.fetchEntitiesFromURL(
        url,
        my.runningUpdatesPerLocation,
        locationId,
        updateType,
        module.PoacherTreasureAccess.lastUpdateForLocation_id(locationId),
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.PoacherTreasureAccess.accessHashForLocation_id().setLastUpdateAtForValue(locationId, timestamp.add(-1).second());
          }
          // remove deleted poacher treasures from location
          if (status === AWE.Net.OK) {
            var poacherTreasures = module.PoacherTreasureAccess.getHashableCollectionForLocation_id(locationId);
            that.fetchMissingEntities(result, poacherTreasures.get('collection'), that.updatePoacherTreasure); // careful: this breaks "this" inside updateArmy
            poacherTreasures.get('collection').forEach(function(poacherTreasure) {
              // TODO is loop needed?
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.PoacherTreasureAccess.getAllForLocation_id(locationId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    that.updatePoacherTreasuresOfCharacter = function (characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/treasures';
      return my.fetchEntitiesFromURL(
        url,
        my.runningUpdatesPerCharacter,
        characterId,
        updateType,
        module.PoacherTreasureAccess.lastUpdateForSpecific_character_id(characterId),
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK) {
            var poacherTreasures = module.PoacherTreasureAccess.getHashableCollectionForSpecific_character_id(characterId);
            that.fetchMissingEntities(result, poacherTreasures.get('collection'), that.updatePoacherTreasure); // careful: this breaks "this" inside updateArmy
            poacherTreasures.get('collection').forEach(function(poacherTreasure) {
              // TODO is loop needed?
            });
          }
          if (callback) {
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    return that;

  }();

  return module;

}(AWE.GS || {});




