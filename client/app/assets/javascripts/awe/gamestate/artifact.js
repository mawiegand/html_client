/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = function (module) {

  module.ArtifactAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Artifact
  //
  // ///////////////////////////////////////////////////////////////////////

  module.Artifact = module.Entity.extend({     // extends Entity to Army
    typeName: 'Artifact',

    type_id: null,

    location_id: null, old_location_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.ArtifactAccess, 'location_id', 'old_location_id').observes('location_id'),

    location: function () {
      return AWE.Map.Manager.getLocation(this.get('location_id'));
    }.property('location_id').cacheable(),

    region_id: null, old_region_id: null,
    regionIdObserver:AWE.Partials.attributeHashObserver(module.ArtifactAccess, 'region_id', 'old_region_id').observes('region_id'),

    owner_id: null, old_owner_id: null,
    ownerIdObserver:AWE.Partials.attributeHashObserver(module.ArtifactAccess, 'owner_id', 'old_owner_id').observes('owner_id'),

    settlement_id: null, old_settlement_id: null,
    settlementIdObserver:AWE.Partials.attributeHashObserver(module.ArtifactAccess, 'settlement_id', 'old_settlement_id').observes('settlement_id'),

    settlement: function () {
      return AWE.GS.SettlementManager.getSettlement(this.get('settlement_id'));
    }.property('settlement_id').cacheable(),

    initiated: false,
    initiating: function() {
      return !this.get('initiated') && this.get('initiation') != null;
    }.property('initiation', 'initiated').cacheable(),

    initiation: null,

    last_initiated_at: null,
    last_captured_at: null,

    artifactType: function () {
      var artifactId = this.get('type_id');
      if (artifactId === undefined || artifactId === null) {
        return null;
      }
      return AWE.GS.RulesManager.getRules().getArtifactType(artifactId);
    }.property('type_id').cacheable(),

    name: function () {
      var type = this.get('artifactType');
      if (type != null) {
        return AWE.Util.Rules.lookupTranslation(type.name);
      }
    }.property('artifactType').cacheable(),
  });

  module.ArtifactInitiation = module.Entity.extend({
    typeName: 'ArtifactInitiation',

    started_at: null,
    finished_at: null,
  });

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ARMY MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////

  module.ArtifactManager = function (my) {    // Army.Manager    -> manager singleton

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};

    my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for locations, using the location.id as key.

    my.createEntity = function () {
      return module.Artifact.create();
    };


    // public attributes and methods ///////////////////////////////////////

    that = module.createEntityManager(my);

    that.getArtifact = function (id) {
      return that.getEntity(id);
    }

    that.getArtifactsInRegion = function (id) {
      return AWE.GS.ArtifactAccess.getAllForRegion_id(id)
    }

    that.getArtifactsAtLocation = function (id) {
      return AWE.GS.ArtifactAccess.getAllForLocation_id(id)
    }

    /** returns true, if update is executed, returns false, if request did
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateArtifact = function (id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'artifacts/' + id;
      return my.updateEntity(url, id, updateType, callback);
    };

    /** updates all armies in a given region. Calls the callback with a
     * list of all the updated armies. */
    that.updateArtifactsInRegion = function (regionId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE + 'regions/' + regionId + '/artifacts';
      return my.fetchEntitiesFromURL(
        url, // url to fetch from
        my.runningUpdatesPerRegion, // queue to register this request during execution
        regionId, // regionId to fetch -> is used to register the request
        updateType, // type of update (aggregate, short, full)
        module.ArtifactAccess.lastUpdateForRegion_id(regionId), // modified after
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.ArtifactAccess.accessHashForRegion_id().setLastUpdateAtForValue(regionId, timestamp.add(-1).second());
          }
          if (status === AWE.Net.OK) {
            var artifacts = module.ArtifactAccess.getHashableCollectionForRegion_id(regionId);
            that.fetchMissingEntities(result, artifacts.get('collection'), that.updateArtifact); // careful: this breaks "this" inside updateArmy
            artifacts.get('collection').forEach(function(artifact) {
              if (artifact.get('owner_id') === AWE.GS.game.getPath('currentCharacter.id')) {
                AWE.GS.game.set('currentArtifact', artifact);
              }
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.ArtifactAccess.getAllForRegion_id(regionId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    that.updateArtifactsAtLocation = function (locationId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE + 'locations/' + locationId + '/artifacts';
      return my.fetchEntitiesFromURL(
        url,
        my.runningUpdatesPerLocation,
        locationId,
        updateType,
        module.ArtifactAccess.lastUpdateForLocation_id(locationId),
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.ArtifactAccess.accessHashForLocation_id().setLastUpdateAtForValue(locationId, timestamp.add(-1).second());
          }
          // remove deleted artifacts from location
          if (status === AWE.Net.OK) {
            var artifacts = module.ArtifactAccess.getHashableCollectionForLocation_id(locationId);
            that.fetchMissingEntities(result, artifacts.get('collection'), that.updateArtifact); // careful: this breaks "this" inside updateArmy
            artifacts.get('collection').forEach(function(artifact) {
              if (artifact.get('owner_id') === AWE.GS.game.getPath('currentCharacter.id')) {
                AWE.GS.game.set('currentArtifact', artifact);
              }
            });
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.ArtifactAccess.getAllForLocation_id(locationId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      );
    }

    that.updateArtifactOfCharacter = function (characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/artifact';
      return my.fetchEntitiesFromURL(
        url,
        my.runningUpdatesPerCharacter,
        characterId,
        updateType,
        module.ArtifactAccess.lastUpdateForOwner_id(characterId),
        function (result, status, xhr, timestamp) {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK) {
            var artifacts = module.ArtifactAccess.getHashableCollectionForOwner_id(characterId);
            that.fetchMissingEntities(result, artifacts.get('collection'), that.updateArtifact); // careful: this breaks "this" inside updateArmy
            artifacts.get('collection').forEach(function(artifact) {
              if (artifact.get('owner_id') === AWE.GS.game.getPath('currentCharacter.id')) {
                AWE.GS.game.set('currentArtifact', artifact);
              }
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




