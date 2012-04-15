/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Partials = (function(module) {
  
  module.PROPERTY_READ_WRITE = 0;
  module.PROPERTY_READ_ONLY = 1;
  module.PROPERTY_HASHABLE = true;
  
  module.addUpdateTracking = function(obj) {
    var isUpdating = false;
    
    if (!obj.isUpdating) {
      obj.isUpdating = function() { return isUpdating; }
    }
    if (!obj.startUpdate) {
      obj.startUpdate = function() { isUpdating = true; }
    }
    if (!obj.endUpdate) {
      obj.endUpdate = function() { isUpdating = false; }
    }
  };
  
  module.addChangeTracking = function(obj) {
    var _lastChange = new Date();
    
    obj.lastChange = function() {
      return _lastChange;
    };
    
    obj.hasChangedSince = function(date) {
      return obj.lastChange() > date;
    };
    
    obj.setChangedNow = function() {
      _lastChange = new Date();
    };
  };
  
  
  
  /** this creates a hash that allows to access instances of GS.Entity and
   * derived sub-types by the value of an attribute. You shouldn't create
   * the hash manually but use the attribute-hash-observer below. */ 
  module.createAttributeValueHash = function(attribute) {

    var hash = {};
    hash.allEntries = [];

    /** use with caution (overwrites for example armies that have moved
     * to another region). When fetching all entities for a value of an 
     * attribute from the server, all received entities are added 
     * automatically to the corresponding hash; so there's no need to
     * set its values manually, using this method. */
    hash.setEntriesForValue = function(val, newEntries, timestamp) {
      timestamp = timestamp || new Date();
      this.allEntries[val] = { entries: newEntries, lastUpdateAt: timestamp };
    };
    hash.addEntry = function(entry) {
      if (!this.allEntries[entry.get(attribute)]) {
        this.allEntries[entry.get(attribute)] = { entries: [], lastUpdateAt: new Date(1970) };
      }
      this.allEntries[entry.get(attribute)].entries[entry.get('id')] = entry;
    };
    hash.removeEntry = function(entry, oldValue) {
      if (oldValue === undefined) {
        oldValue = entry.get(attribute); // use oldValue, if defined, otherwise assume the object still is unchanged
      }
      if (this.allEntries[oldValue] && this.allEntries[oldValue].entries[entry.get('id')]) {
        delete this.allEntries[oldValue].entries[entry.get('id')];
      }
    }
    hash.getEntriesForValue = function(val) {
      if (this.allEntries[val]) {
        return this.allEntries[val].entries;
      }
      else {
        return {};
      }
    }
    hash.setLastUpdateAtForValue = function(val, timestamp) {
      timestamp = timestamp || new Date();
      if (this.allEntries[val]) {
        this.allEntries[val].lastUpdateAt = timestamp;
      }
      else {
        this.allEntries[val] = { entries: [], lastUpdateAt: timestamp };
      }
    }
    hash.lastUpdateForValue = function(val, timestamp) {
      if (this.allEntries[val]) {
        return this.allEntries[val].lastUpdateAt; 
      }
      else {
        return new Date(1970);
      }
    }
    hash.wasLastUpdateForValueAfter = function(val, timestamp) {
      return this.allEntries[val] && this.allEntries[val].lastUpdateAt >= timestamp;
    }

    return hash;
  };
   
  /** this creates an observer function that can be attached to an ember
   * attribute in order to create and update a hash for accessing instances
   * of the class by the value of the attribute. The hash is created on the fly
   * if it's not already there. You just have to provide a hook (class, hash),
   * where to put the hash and generated accessor functions. The hash will be 
   * placed in hook.accessHashes[attribute]. */
  module.attributeHashObserver = function(hook, attribute, oldAttribute) {
        
    /** creates an auto-updated hash for a property. */
    var createAccessHashForAttribute = function() {
      var upperCaseAttr = attribute.charAt(0).toUpperCase() + attribute.slice(1);

      if (hook.accessHashes === undefined) {
        hook.accessHashes = {};
      }

      if (!hook.accessHashes[attribute]) {

        hook.accessHashes[attribute] = module.createAttributeValueHash(attribute);
        
        
        // creates some "global" convenience functions at the hook
        hook['getAllFor'+upperCaseAttr] = function(value) {
          return hook.accessHashes[attribute].getEntriesForValue(value);
        }
        
        hook['lastUpdateFor'+upperCaseAttr] = function(value) {
          return hook.accessHashes[attribute].lastUpdateForValue(value);
        }
        
        hook['wasLastUpdateFor'+upperCaseAttr+'After'] = function(value, timestamp) {
          return hook.accessHashes[attribute].wasLastUpdateForValueAfter(value, timestamp);
        }
        
        hook['accessHashFor'+upperCaseAttr] = function() {
          return hook.accessHashes[attribute];
        }
      }
    }    

    if (!hook.accessHashes || !hook.accessHashes[attribute]) {//   create hash, if not already there
      createAccessHashForAttribute(); 
    }
    
    
    return function() {                       // actually construct and return the observer
      var newValue = this.get(attribute);
      var oldValue = this.get(oldAttribute);
      if (oldValue != newValue) {
        if (oldValue) {
          hook.accessHashes[attribute].removeEntry(this, oldValue);
        }
        if (newValue) {
          hook.accessHashes[attribute].addEntry(this);
        }
        this.set(oldAttribute, newValue);
      };
    }
    
  };

  
  return module;
}(AWE.Partials || {}));