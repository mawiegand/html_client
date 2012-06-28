/**
 * @fileOverview 
 * Base class of all objects representing the game state.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 
 
var AWE = window.AWE || {};

/** State, manager and helpers for representing the game state in the client. 
 * @namespace
 * @name AWE.GS */
AWE.GS = (
  function(module) /** @lends AWE.GS */ {
  
  /** shortest type of update, just the ID and very basic data
   * @name AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE */ 
  module.ENTITY_UPDATE_TYPE_AGGREGATE = 0;  
  /** short type of update, only including the most important fields (e.g. 
   * for displaying on map)
   * @name AWE.GS.ENTITY_UPDATE_TYPE_SHORT */ 
  module.ENTITY_UPDATE_TYPE_SHORT = 1;     
  /** longest type of update, including all fields of the entity
   * @name AWE.GS.ENTITY_UPDATE_TYPE_FULL */ 
  module.ENTITY_UPDATE_TYPE_FULL = 2;     

  /** one and only create type, for use with entity methods
   * @name AWE.GS.ENTITY_CREATE_TYPE */ 
  module.ENTITY_CREATE_TYPE = 0;            

  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   ENTITY
  //
  // /////////////////////////////////////////////////////////////////////////

  /** 
   * Base class of all objects representing the present game state on the 
   * client's side. Provides general methods for fetching and updating 
   * entities from the game server as well as change and update tracking.
   *
   * As default, all entities of the same type can be looked-up by their
   * unique id. 
   *
   * @class
   * @name AWE.GS.Entity */
  module.Entity = Ember.Object.extend(/** @lends AWE.GS.Entity# */{
    
    /** unique id of the entity. @property */
    id: 0,       
    /** name of the type for runtime evaluation */                          
    typeName:  'Entity',
    /** flags entities that have been destroyed and should be ignored. This
     * can be triggered either by the server sending an entity with 
     * an attribute destroyed==true or by the client, when receiving a 
     * 404 on an update from the server. */
    destroyed:  null,
    /** timestamp of last update (on server)  */
    updated_at: null,
    /** timestamp of the creation (on server) */
    created_at: null,
    /** time of last aggregate update received by the client */
    lastAggregateUpdateAt: new Date(1970), 
    /** time of last short update received by the client */
    lastShortUpdateAt: new Date(1970),     
    /** time of last full update received by the client */
    lastFullUpdateAt: new Date(1970),     
    
    /** slightly more convenient way to get the id other than using 
     * this.get('id').  */
    getId: function() { return this.get('id'); },
    
    /** sets all properties of this entity to the values of the given
     * hash.
     * @param {Object} hash holding key - value pairs to apply to this 
     *                 entity. */
    setPropertiesWithHash: function(hash) {
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) {
          
   /*       if (this[key] === undefined) {
            console.log ('ERROR in AWE.GS.Entity.setPropertiesWithHash: unknown property ' + key + '.');
          }
          else {*/
            if (AWE.Ext.isArrayProxy(this[key])) {
              log('setPropertiesWithHash with hash', hash[key]);
              var baseTypeName = this[key].get('baseTypeName');
              var data = hash[key];
              var result = [];
              if (data && data.length !== undefined) {  //   A) process an array of armies
                for (var i = 0; i < data.length; i++) { 
                  var entityData = data[i];
                  var entity = AWE.GS[baseTypeName].create({id: entityData['id']});
                  entity.init(entityData);
                  entity.set(this.typeName.toLowerCase(), this)
                  result[entity.get('id')] = entity;
                }          
              }
              else {                                    //   B) process a single army
                var entity = AWE.GS[baseTypeName].create({id: entityData['id']});              
                result[entity.get('id')] = entity;
              }

              this.get(key).set('content', result);  
            }          
            else {
              this.set(key, hash[key]);
            }
    //      }
        }
      }
    },
    
    /** return the timestamp of the last update in the client that at least
     * contained as many data as the specified update type. 
     * @param kind of update to query for. If nothing is specified, a full 
     *        update is assumed. */
    lastUpdateAt: function(updateType) {
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        return this.get('lastShortUpdateAt');
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        return this.get('lastAggregateUpdateAt');
      } 
      else {
        return this.get('lastFullUpdateAt');
      }
    },
    
    /** returns the timestamp of the last change to this object. */
    lastChange: function() {
      return this.lastUpdateAt(module.ENTITY_UPDATE_TYPE_AGGREGATE); // last update of whatever type
    },

    /** 
     * initializes the entity with the values of the given hash.
     * @param {Object} spec optional specification of the initial values
     *                      of all or some properties. */
    init: function(spec) {
      this.setPropertiesWithHash(spec);     
      return this; 
    },
    
    /** 
     * destroys the entity and removes it from all access hashes in the
     * client side. If the entity is presently referenced somehwere, it 
     * can still be used, but it's not longer possible to access / look-up
     * this entity using the AccessManager or GameStateManager. */
    destroy: function() {
      
      var access = AWE.GS[this.get('typeName') + 'Access'];
      var self = this;
      
      this.set('destroyed', true);
      
      if (access) {
        AWE.Ext.applyFunctionToHash(access.accessHashes, function(key, accessHash) {
          accessHash.removeEntry(self);
        });
      }
      else {
        log('ERROR in AWE.GS.Entity.destroy: no access object given for entity ' + this.get('typeName'));
      }
    },
  
    /** 
     * updates the properties of the entity with the values in the given hash
     * and also sets the last-update timestamps appropriately.
     *
     * @param {Object} hash key-value pairs to updat the properties with
     * @param updateType type of update, ENTITY_UPDATE_TYPE_FULL for default
     * @param {Date} timestamp to use for setting the lastUpdate property.
     *               new Date() is used as default. */
    updateWith: function(hash, updateType, timestamp) {
      updateType = updateType || module.ENTITY_UPDATE_TYPE_FULL;     // assume full update, if nothing else specified
      timestamp = timestamp || new Date();                           // given timestamp or now
      if (hash) {
        this.setPropertiesWithHash(hash);
      }
    
      if (updateType === module.ENTITY_UPDATE_TYPE_FULL) {
        this.set('lastFullUpdateAt', timestamp);
        this.set('lastShortUpdate', timestamp);
        this.set('lastAggregateUpdate', timestamp);                  // full update includes the other two update types
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        this.set('lastShortUpdateAt', timestamp);
        this.set('lastAggregateUpdateAt', timestamp);                // short update includes the aggregate update information
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        this.set('lastAggregateUpdateAt', timestamp);
      }
      else {
        console.log('ERROR in AWE.GS.Entity.updateWith: unknown update type: ' + updateType + '.');
      }
    },
  
    /** convenience method for directly setting the last update timestamp for
     * the specified update type to the given timestamp. Does not change any 
     * properties. 
     * @param updateType type of update, ENTITY_UPDATE_TYPE_FULL for default
     * @param {Date} timestamp to use for setting the lastUpdate property.
     *               new Date() is used as default. */
    setNotModifiedAfter: function(updateType, timestamp) {
      this.updateWith(null, updateType, timestamp);
    }
  });
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   ENTITY MANAGER
  //
  // /////////////////////////////////////////////////////////////////////////
  
  module.createEntityManager = function(my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;

  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
        
    my.entities = [];                 ///< holds all available information about armies
    my.runningUpdatesPerId = [];      ///< hash that contains all running update requests, using the entity.id as key.

    my.createEntity = my.createEntity || function(spec) { return module.Entity.create(spec); };
    
    my.processUpdateResponse = my.processUpdateResponse || function(data, updateType, start) {
      
      var entity = my.entities[data.id];

      if (entity) {
        entity.updateWith(data, updateType, start);
      }
      else {
        entity = my.createEntity({ id: data['id'] });  // need to always set id before a hash-observer is triggered
        // log(entity, entity.id, entity.get('id'), data);
        entity.init(data);
        entity.setNotModifiedAfter(updateType, start); // set the last-update timestamp appropriately
        my.entities[entity.get('id')] = entity;
      }
      return entity;
    };
    
    my.fetchEntitiesFromURL = function(url, queue, id, updateType, modifiedSince, callback) {
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      
      if (my.tryRegisterRequest(queue, id, updateType)) {

        var start = new Date();  // the start of the request is only a bad (but save) approximation; we should use the server time (time of database select) instead!
        
        if (url.indexOf("?") < 0) { // no ? 
          url = url + "?";
        }
        else if (url.charAt(url.length-1) != "&") { // it has a query part, make sure there's an & at the end to be able to attach more
          url = url + "&"; 
        }
        
        var options = {
          url: (url+my.updateTypeQueryToken(updateType)),
          dataType: 'json',
        };
        if (modifiedSince) {
          options.headers = { 'If-Modified-Since': modifiedSince.toUTCString() };
        }
        var jqXHR = $.ajax(options)
        .error(function(jqHXR, textStatus) {          // On failure: 
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          callback(null, jqXHR.status, jqXHR);
          console.log ('ERROR FETCHING ENTITIES FROM URL ' + url + ': ' + textStatus); 
        })
        .success(function(data, statusText, xhr) {
          var result = null;
          if (xhr.status === 304)  {                   // Not modified
            // not modified, let the caller process this event
          }
          else {                                      // On success:
            if (data && data.length !== undefined) {  //   A) process an array of entities
              result = {};
              for (var i=0; i < data.length; i++) { 
                var entityData = data[i];
                var entity = (my.processUpdateResponse(entityData, updateType, start));
                result[entity.get('id')] = entity;
              }         
            }
            else {                                    //   B) process a single entity
              result = my.processUpdateResponse(data, updateType, start);
            };
          }
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          if (callback) {
            var start = new Date();
            Ember.run.sync(); // sync the bindings now, before continuing with the execution (e.g. calling callbacks)
            console.log('Manual Sync in GameStateManager Elapsed (ms): ',  (new Date().getTime() - start.getTime()));
            callback(result, xhr.status, xhr, start);
          }        
        }); 
      }
      else {          // update on this army is already running -> return false
        return false;
      }
      return true;    // update is underway           
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     *
     * TODO: INSERT HERE: automatically update, if data to old or missing!!!!
     */
    my.updateEntity = function(url, id, updateType, callback) {
      var lastUpdateAt = null;
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      var entity = my.entities[id];
      if (entity && entity.lastUpdateAt(updateType)) {
        lastUpdateAt = entity.lastUpdateAt(updateType);
      }
      return my.fetchEntitiesFromURL(url, my.runningUpdatesPerId, id, updateType, lastUpdateAt, function(entity, statusCode, xhr, serverTime) {
        if (statusCode === AWE.Net.NOT_MODIFIED) { // not modified
          entity = my.entities[id];
          if (entity) {
            entity.setNotModifiedAfter(updateType, serverTime);
          }
          else {
            console.log('ERROR: received a not-modified answer for an entity that is not already downloaded.');
          }
        }
        else if (statusCode === AWE.Net.NOT_FOUND) {
          console.log('ENTITY NOT FOUND ON SERVER.');
          if (my.entities[id]) {
            console.log('CORRESPONDING ENTITY IS GONE ON SERVER. Destroy local entity.', entity);
            my.entities[id].destroy();
          }
        }
        if (callback) {
          callback(entity, statusCode, xhr, serverTime);
        }
      }); 
    };
    
    
    my.updateTypeQueryToken = function(updateType) {
      if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        return "short=1";
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        return "aggregate=1";
      }
      else {
        return "";
      }
    }
    
    my.tryRegisterRequest = function(queue, id, updateType) {
      if (queue[id] && queue[id].updateType >= updateType) { // same (or higher) type of update is already running
        return false;                                        // could not register this update; thus, should not be executed
      }
      queue[id] = { started: new Date(), updateType: updateType };
      return true;
    }
    
    my.unregisterRequest = function(queue, id, updateType) {
      if (queue[id] && queue[id].updateType === updateType) { // check that same type of update (a higher-level update may have overwritten a lower-level update)
        delete queue[id];
      }
    }
    
  
    
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    
    that.getEntity = function(id) {
      return my.entities[id];
    }
    
    that.getEntities = function() {
      return my.entities;
    }
    
    /** takes an enumerable and a resultHash from a query for entities, then
     * checks for entities that are in the enumberable but NOT in the result
     * Hash. Then riggers an individual update for each missing entity.
     * This will finally lead to the deletion of entities that are gone on 
     * the server (response of 404 leads to deleton from collection). 
     * if a callback is given, it is called for all missing entities with
     * the result of the individual update. */
    that.fetchMissingEntities = function(resultHash, collection, updateFunction, callback) {
      AWE.Ext.applyFunction(collection, function(entity) {
        var id = entity.getId();
        if (!resultHash.hasOwnProperty(id)) {
          updateFunction(id, module.ENTITY_UPDATE_TYPE_FULL, function(entity, statusCode, xhr, serverTime) {
            if (callback) {
              callback(entity, statusCode, xhr, serverTime);
            }
          });
        }
      });
    }
    
    /**
     * removes an entity from an entity manager. first look for all observed attributes with
     * ending '_id' an set them to undefined in order to remove the entity from all 
     * access hashes. then remove entity from entity manager. 
     */
     /* DEPRECATED
    that.removeEntity = function(id) {
      var entity = my.entities[id];
      for (var property in entity) {
        if (entity.hasOwnProperty(property) && property.match(/_id$/)) {
          var newProperty = property.replace(/old_/, '');
          entity.set(newProperty, undefined);
        }
      }
      delete my.entities[id];
    } */
            
    return that;
  };
  
  return module;
  
}(AWE.GS || {}));


