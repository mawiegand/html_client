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
AWE.GS = (function(module) /** @lends AWE.GS */ {

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
    
    updatedOnServerAt: function() {
      var updatedAt = this.get('updated_at');
      return updatedAt ? Date.parseISODate(updatedAt) : null;
    },
    createdOnServerAt: function() {
      var createdAt = this.get('created_at');
      return createdAt ? Date.parseISODate(createdAt) : null;
    },

    /** sets all properties of this entity to the values of the given
     * hash.
     * @param {Object} hash holding key - value pairs to apply to this 
     *                 entity. */
    setPropertiesWithHash: function(hash) {
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) {
          if (AWE.Ext.isArrayProxy(this[key])) {
            log('setPropertiesWithHash with hash', hash[key]);
            var baseTypeName = this[key].get('baseTypeName');
            var data = hash[key];
            var result = [];
            if (data) {
              if (data.length === undefined) { 
                data = [ data ];  //   B) process a single entity (remaining from old version, assumption: presently not used!)
              }
              for (var i = 0; i < data.length; i++) { 
                var entityData = data[i];
                var entity = null;
                if (AWE.GS[baseTypeName + 'Manager']) {
                  entity = AWE.GS[baseTypeName + 'Manager'].getEntity(entityData['id']);
                }
                if (entity) {
                  entity.updateWith(entityData);
                }
                else {
                  entity = AWE.GS[baseTypeName].create({id: entityData['id']});
                  entity.init(entityData);
                  entity.set(this.typeName.toLowerCase(), this)
                }
                result.push(entity); // cqn't use ids; because that assumes sparse arrays.
              }          
            }
            this.get(key).set('content', result);  
          }          
          else {
//            log('-----> davor', key, hash, hash[key]);
            this.set(key, hash[key]);
//            log('-----> danach');
          }
        }
      }
    },
    
    /** return the timestamp of the last update in the client that at least
     * contained as many data as the specified update type. 
     * ATTENTION: IN MOST CASES THIS REPORTS THE SERVER TIME, NOT THE 
     *            LOCAL CLIENT'S TIME OF THE LAST UPDATE REQUEST!
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
        log('ERROR in AWE.GS.Entity.updateWith: unknown update type: ' + updateType + '.');
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
        
    my.entities = {};                 ///< holds all available information about armies
    my.runningUpdatesPerId = {};      ///< hash that contains all running update requests, using the entity.id as key.

    my.createEntity = my.createEntity || function(spec) { return module.Entity.create(spec); };
    
    
    my.processUpdateResponse = my.processUpdateResponse || function(data, updateType, start) {
      
      if (data === null) {
        log("PROCESS UPDATE WITH NULL DATA:", data, updateType, start);
        log("ENTITY: ", my.createEntity({id:"null"}))
        return null;
      }
      
      var entity = my.entities[data.id];

      //data = data || {}; // TODO: this is only a hack to prevent an error

      if (entity) {
        entity.updateWith(data, updateType, start);
      }
      else {
        entity = my.createEntity({'id': data.id });  // need to always set id before a hash-observer is triggered
        entity.init(data);
        entity.setNotModifiedAfter(updateType, start); // set the last-update timestamp appropriately
        my.entities[entity.get('id')] = entity;
      }

      return entity;
    };
    
    my.extractDateFromXHR = function(xhr) {
      if (!xhr) {
        return null;
      }
      var date = xhr.getResponseHeader('Date');
//      log('RESPONSE HEADER DATE (string, parsed)', date, new Date(date));
      return date ? new Date(date) : null;
    };
    
    my.fetchEntitiesFromURL = function(url, queue, id, updateType, modifiedSince, callback, beforeSend) {
      if (updateType === undefined || updateType === null) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      
      if (my.tryRegisterRequest(queue, id, updateType)) {

        var start = new Date();  // the start of the request is only a bad (only save if local clock is ok or behind) approximation; we should use the server time (time of database select) instead!
        
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
        if (beforeSend) {
          options.beforeSend = beforeSend;
        }
        var jqXHR = $.ajax(options)
        .error(function(jqHXR, textStatus) {          // On failure: 
          callback(null, jqXHR.status, jqXHR, my.extractDateFromXHR(jqXHR) || start);
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          log ('ERROR FETCHING ENTITIES FROM URL ' + url + ': ' + textStatus); 
        })
        .success(function(data, statusText, xhr) {
          var result = null;
          var end = new Date();
          var requestServerTime = my.extractDateFromXHR(xhr);
          
          if (requestServerTime) {
            module.TimeManager.registerMeasurement(requestServerTime, start, end);
          }
          
          if (xhr.status === 304)  {                   // Not modified
            // not modified, let the caller process this event
          }
          else {                                      // On success:
            if (data && data.length !== undefined) {  //   A) process an array of entities
              result = {};
              for (var i=0; i < data.length; i++) {
                var entityData = data[i];
                var entity = (my.processUpdateResponse(entityData, updateType, requestServerTime || start));
                result[entity.get('id')] = entity;
              }
            }
            else {                                    //   B) process a single entity
              result = my.processUpdateResponse(data, updateType, requestServerTime || start);
            }
            if (callback) {      
              var s = new Date();
              Ember.run.sync(); // sync the bindings now, before continuing with the execution (e.g. calling callbacks)
              log('Manual Sync in GameStateManager Elapsed (ms): ',  (new Date().getTime() - s.getTime()));
            }
          }
          if (callback) {
            callback(result, xhr.status, xhr, my.extractDateFromXHR(jqXHR) || start);
          }        
          my.unregisterRequest(queue, id, updateType);//   unregister request 
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
      var modifiedSince = null;
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      var entity = my.entities[id];
      if (entity && entity.lastUpdateAt(updateType)) {
        // the logic here:
        // always use the timestamp updated_at from the server for the modified-since query
        // BUT only for one case: when the lastUpdateAt-timestamp for the given update-type is
        // earlier, THAN use that lastUpdateAt timestamp as modified-since. Why?
        // because if we would use updated_at in this instance, than we would not refetch
        // the data for that particular update type, also some data might be missing for that
        // update type.
        
        var serverUpdate = entity.updatedOnServerAt();     // last change on server (the client knows of)
        var lastUpdate = entity.lastUpdateAt(updateType);  // last update (requested from server) for this particular type
        if (serverUpdate.getTime() > lastUpdate.getTime()) {
          modifiedSince = lastUpdate;
//          log('>> GAMESTATE UPDATE: Using LOCAL UPDATE timestamp (loc/sever):', lastUpdate, serverUpdate);
        }
        else {
          modifiedSince = serverUpdate;
//          log('>> GAMESTATE UPDATE: Using SERVER UPDATED AT timestamp (loc/server):', lastUpdate, serverUpdate);          
        }
      }
      var newRequest = my.fetchEntitiesFromURL(url, my.runningUpdatesPerId, id, updateType, modifiedSince, function(entity, statusCode, xhr, serverTime) {
        if (statusCode === AWE.Net.NOT_MODIFIED) { // not modified
          entity = my.entities[id];
          if (entity) {
            entity.setNotModifiedAfter(updateType, serverTime); // this sets the LOCAL update time-stamp to the server time, so the client knows it has tried to fetch this data recently.
          }
          else {
            log('ERROR: received a not-modified answer for an entity that is not already downloaded.');
          }
        }
        else if (statusCode === AWE.Net.NOT_FOUND) {
//          log('ENTITY NOT FOUND ON SERVER.');
          if (my.entities[id]) {
//            log('CORRESPONDING ENTITY IS GONE ON SERVER. Destroy local entity.', entity);
            my.entities[id].destroy();
          }
        }
        if (callback) {
          callback(entity, statusCode, xhr, serverTime);
        }
        if (my.runningUpdatesPerId[id] && my.runningUpdatesPerId[id].callbacks) {
          my.runningUpdatesPerId[id].callbacks.forEach(function(item) {
            item(entity, statusCode, xhr, serverTime);
          });
        }
      }); 
      
      if (!newRequest) {  // theres already a request running
        this.registerAdditionalCallback(my.runningUpdatesPerId, id, updateType, callback);
      }
      return newRequest ;
    };
    
    my.registerAdditionalCallback = function(queue, id, updateType, callback) {
      if (!queue[id] || !callback) {
        return ;
      }
      if (queue[id].callbacks) {
        queue[id].callbacks.push(callback)
      } 
      else {
        queue[id].callbacks = [callback] ;
      }
    }
    
    
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
    
    that.removeAllEntities = function() {
      my.entities = {};
    }
    
    that.removeEntity = function(entity) {
      delete my.entities[entity.get('id')];
      entity.destroy();
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
            
    return that;
  };
  
  return module;
  
}(AWE.GS || {}));


