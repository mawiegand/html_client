/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState base class, manager and helpers. */
AWE.GS = (function(module) {
  
  module.ENTITY_UPDATE_TYPE_AGGREGATE = 0;  ///< shortest type of update, just the ID and very basic data
  module.ENTITY_UPDATE_TYPE_SHORT = 1;      ///< short type of update, only including the most important fields (e.g. for displaying on map)
  module.ENTITY_UPDATE_TYPE_FULL = 2;       ///< longest type of update, including all fields of the entity
  
  module.ENTITY_CREATE_TYPE = 0;            ///< one and only create type, for use with entity methods

  module.PROPERTY_READ_WRITE = 0;
  module.PROPERTY_READ_ONLY = 1;

  module.PROPERTY_HASHABLE = true;
  
  module.ARRAY_PROPERTY_HASH = {
    active_jobs: 'ActiveJob',
  } 

  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   ENTITY
  //
  // /////////////////////////////////////////////////////////////////////////

  /** Base class of all classes that represent states & entities of the game. */
  module.Entity = Ember.Object.extend({
    
    id: 0,
    typeName: 'Entity',
    updated_at: null,
    created_at: null,
    lastAggregateUpdateAt: new Date(1970), ///< time of last aggregate update received by the client
    lastShortUpdateAt: new Date(1970),     ///< time of last short update received by the client
    lastFullUpdateAt: new Date(1970),      ///< time of last full update received by the client
    
    /** a more convenient way to get the id. */
    getId: function() { return this.get('id'); },
    
    setPropertiesWithHash: function(hash) {
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) {
          
          if (this[key] === undefined) {
            console.log ('ERROR in AWE.GS.Entity.setPropertiesWithHash: unknown property ' + key + '.');
          }
          else {
            var className = module.ARRAY_PROPERTY_HASH[key]
            if (className !== undefined) {
              log('setPropertiesWithHash of active_jobs with hash', hash[key]);
  
              var data = hash[key];
              var result = [];
              if (data && data.length !== undefined) {  //   A) process an array of armies
                for (var i = 0; i < data.length; i++) { 
                  var entityData = data[i];
                  var entity = AWE.GS[className].create({id: entityData['id']});
                  entity.init(entityData);
                  entity.set(this.typeName.toLowerCase(), this)
                  result[entity.get('id')] = entity;
                }          
              }
              else {                                    //   B) process a single army
                var entity = AWE.GS[className].create({id: entityData['id']});              
                result[entity.get('id')] = entity;
              }

              this.get(key).set('content', result);  
            }          
            else {
              this.set(key, hash[key]);
            }
          }
        }
      }
    },
    
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

    init: function(spec) {
      this.setPropertiesWithHash(spec);     
      return this; 
    },
  
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
            if (data && data.length !== undefined) {  //   A) process an array of armies
              result = {};
              for (var i=0; i < data.length; i++) { 
                var entityData = data[i];
                var entity = (my.processUpdateResponse(entityData, updateType, start));
                result[entity.get('id')] = entity;
              }          
            }
            else {                                    //   B) process a single army
              result = my.processUpdateResponse(data, updateType, start);
            };
          }
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          if (callback) {
            callback(result, xhr.status, xhr, start);
          }        
        }); 
      }
      else {          // update on this army is already running -> return false
        return false;
      }
      return true;    // update is underway           
    }
    
    /** create new entity by game server */
    my.createAndFetchNewEntityFromURL = function(url, data, queue, id, updateType, callback) {
      if (my.tryRegisterRequest(queue, id, updateType)) {

        var start = new Date();  // the start of the request is only a bad (but save) approximation; we should use the server time (time of database select) instead!
        
        var options = {
          url: url,
          type: 'POST',
          data: data,
          dataType: 'json',
        };
        
        var jqXHR = $.ajax(options)
        .error(function(jqHXR, textStatus) {          // On failure: 
          my.unregisterRequest(queue, id, 0);//   unregister request 
          callback(null, jqXHR.status, jqXHR);
          log('ERROR CREATING AND FETCHING ENTITY FROM URL', url, textStatus); 
        })
        .success(function(data, statusText, xhr) {   
          var result = null;
          if (xhr.status === 201)  {                   // Just created
            log('SUCCESS CREATING AND FETCHING ENTITY FROM URL', statusText); 
          }
          else {
            log('SUCCESS-ERROR ??? CREATING AND FETCHING ENTITY FROM URL', xhr.status, statusText);           
          }
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          if (callback) {
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
        if (statusCode === 304) { // not modified
          entity = my.entities[id];
          if (entity) {
            entity.setNotModifiedAfter(updateType, serverTime);
          }
          else {
            console.log('ERROR: received a not-modified answer for an entity that is not already downloaded.');
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
        
    return that;
  };

  return module;
  
}(AWE.GS || {}));


