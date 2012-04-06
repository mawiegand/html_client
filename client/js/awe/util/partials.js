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
  
  
  module.mixinProperties = function(emClass, hook) {
        
    /** creates an auto-updated hash for a property of the entity type. */
    var createAccessHashForAttribute = function(attribute) {
      var upperCaseAttr = attribute.charAt(0).toUpperCase() + attribute.slice(1);

      if (hook.accessHashes === undefined) {
        hook.accessHashes = {};
      }

      if (!hook.accessHashes[attribute]) {

        hook.accessHashes[attribute] = (function() {
          var hash = {};
      
          hash.allEntries = {};
      
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
            if (!this.allEntries[entry[attribute]]) {
              this.allEntries[entry[attribute]] = { entries: {}, lastUpdateAt: new Date(1970) };
            }
            this.allEntries[entry[attribute]].entries[entry.get('id')] = entry;
          };
          hash.removeEntry = function(entry) {
            if (this.allEntries[entry[attribute]] && this.allEntries[entry[attribute]].entries[entry.get('id')]) {
              delete this.allEntries[entry[attribute]].entries[entry.get('id')];
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
              this.allEntries[val] = { entries: {}, lastUpdateAt: timestamp };
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
        }());
        
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
    
  
    /** creates a property that gives to a newly created attribute of the my 
     * object. Can be used to create attribute, setter and getter with just
     * one line of code in any derived object. */
    emClass.reopenClass({
      addProperty: function(attribute, defaultValue, hashable) {
    
        // set a few default values first.
        if (defaultValue === undefined) {
          defaultValue = null;
        }
        hashable = hashable || false;
    
        // now customize a mixin with one single attribute, setter and getter
        var mixin = {};
        mixin[attribute] = defaultValue;

        var setterString = 'set'+attribute.charAt(0).toUpperCase() + attribute.slice(1);
        var getterString = 'get'+attribute.charAt(0).toUpperCase() + attribute.slice(1);
  
        if (!hashable) {                                       // simple setter
          mixin[setterString] = function(val) { this.set(attribute, val); }
        }
        else {                                               // setter, that also updates the hash
          if (!hook.accessHashes || !hook.accessHashes[attribute]) {//   create hash, if not already there
            createAccessHashForAttribute(attribute); 
          }
        
          mixin[setterString] = function(val) {     
            if (this.get(attribute) != val) {
              if (this.get(attribute)) {
                hook.accessHashes[attribute].removeEntry(this);
              }
              this.set(attribute, val); 
              if (val) {
                hook.accessHashes[attribute].addEntry(this);
              }
            }
          }        
        }
        mixin[getterString] = function() {                     // getter
          return this.get(attribute); 
        } 
    
        // finally apply the mixin
        emClass.reopen(mixin);
      }
    });
    
  }
  

  
  return module;
}(AWE.Partials || {}));