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
  
  module.PROPERTY_READ_WRITE = 0;
  module.PROPERTY_READ_ONLY = 1;

  /** Base class of all classes that represent states & entities of the game. */
  module.createEntity = function(my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    /** creates a property that gives to a newly created attribute of the my 
     * object. Can be used to create attribute, setter and getter with just
     * one line of code in any derived object. */
    var property = function(attribute, defaultValue, access) {
      if (defaultValue === undefined) {
        defaultValue = null;
      }
      access = access || module.PROPERTY_READ_WRITE;
     
      my[attribute] = defaultValue;
      this[attribute] = function() { return my[attribute]; }
      if (access === module.PROPERTY_READ_WRITE) {
        this['set'+attribute.charAt(0).toUpperCase() + attribute.slice(1)] = function(val) { my[attribute] = val; }
      }
    };
  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
    
    my.setPropertiesWithHash = function(hash) {
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) {
          if (my[key] !== undefined) {
            my[key] = hash[key];
          }
          else {
            console.log ('ERROR in AWE.GS.Entity.setPropertiesWithHash: unknown property ' + key + '.');
          }
        }
      }
    };
    
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    that.property = property;
  
    
    // synthesized properties ////////////////////////////////////////////////

    that.property('id', null, module.PROPERTY_READ_ONLY);
    that.property('updated_at', null, module.PROPERTY_READ_ONLY);
    that.property('created_at', null, module.PROPERTY_READ_ONLY);
    that.property('lastAggregateUpdateAt', new Date(1970), module.PROPERTY_READ_ONLY);  ///< time of last aggregate update received by the client
    that.property('lastShortUpdateAt', new Date(1970), module.PROPERTY_READ_ONLY);      ///< time of last short update received by the client
    that.property('lastFullUpdateAt', new Date(1970), module.PROPERTY_READ_ONLY);       ///< time of last full update received by the client

    that.lastUpdateAt = function(updateType) {
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        return my.lastShortUpdateAt;
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        return my.lastAggregateUpdateAt;
      } 
      else {
        return my.lastFullUpdateAt;
      }
    }

    that.init = function(spec) {
      my.setPropertiesWithHash(spec);      
    }
    
    that.updateWith = function(hash, updateType, timestamp) {
      updateType = updateType || module.ENTITY_UPDATE_TYPE_FULL;     // assume full update, if nothing else specified
      timestamp = timestamp || new Date();                           // given timestamp or now
      my.setPropertiesWithHash(hash);
      
      if (updateType === module.ENTITY_UPDATE_TYPE_FULL) {
        my.lastFullUpdateAt = my.lastShortUpdate = my.lastAggregateUpdate = timestamp; // full update includes the other two update types
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        my.lastShortUpdateAt = my.lastAggregateUpdateAt = timestamp; // short update includes the aggregate update information
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        my.lastAggregateUpdateAt = timestamp;
      }
      else {
        console.log('ERROR in AWE.GS.Entity.updateWith: unknown update type: ' + updateType + '.');
      }
    }

    return that;
  };

  return module;
  
}(AWE.GS || {}));



$(document).ready(function() {
  var entity = AWE.GS.createEntity();
  entity.property('age');
  entity.init({ age: 12 });

  var entity2 = AWE.GS.createEntity(); 
  entity2.property('age');
  entity2.init({ age: 15 });
  
  console.dir(entity);
  entity.setAge(10);

  console.log ('ENTITY DEBUG: value of entity.age() = ' + entity.age());
  console.log ('ENTITY DEBUG: value of entity.lastFullUpdateAt() = ' + entity.lastFullUpdateAt());
  
  entity2.init({ thisInitializerShouldCreateAnError: true }); // should throw an 'unknown property' error
  
});


