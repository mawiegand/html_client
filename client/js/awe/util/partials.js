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
      obj.isUpdating = function() { return isUpdating; }
    }
    if (!obj.startUpdate) {
      obj.startUpdate = function() { isUpdating = true; }
    }
    if (!obj.endUpdate) {
      obj.endUpdate = function() { isUpdating = false; }
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
  
  
  /** The HashableCollection is meant as a workaround until Ember implements
   * the Collection API for Hashes (presently only for arrays). All objects in
   * the collection are stored twice; once in a hash for easy access and
   * once in an array for working with the whole collection of entries. 
   *
   * Assumes all added objects to have a field "id". */
  module.HashableCollection = Ember.Object.extend({
    hash: null,               ///< for easy access
    collection: null,         ///< to be used as a whole, e.g. to bind to.
    lastUpdateAt: null,       ///< last update with server (used from the update routines in the GameState-Managers to track update requests)
    changedAt: null,          ///< last modification to hash (does not track changes "inside" elements)
    
    init: function(spec) {
      this.set('hash', {});         ///< TODO: should this become an Ember.Object? e.g. simply "Ember.Object.create({});" ?
      this.set('collection', []);
      this.set('lastUpdateAt', new Date(1970));
      this.set('changedAt', new Date());   // created now 
      this._super(spec);
    },
    
    add: function(entry) {
      var hash = this.get('hash');
      var collection = this.get('collection');
      var id = entry.get('id');
      
      if (hash[id] !== undefined && hash[id] !== null) { // object is already known?
        var index = this.indexOfEntryWithId(entry.get('id'));
        if (index >= 0) {
          collection[index] = entry;                     // overwrite existing object
        }
        else {
          console.log('ERROR IN ATTRIBUTE HASHS: already known object is missing in collection.');
          collection.pushObject(entry); // although an error, just add the object
        }
      }
      else {
        collection.pushObject(entry);                    // add the object
      }
      hash[id] = entry;                                  // add (or overwrite) to hash
      this.set('changedAt', new Date());
    },
    
    replaceAll: function(newEntries, timestamp) {
      console.log('REPLACE ALL ENTRIES', newEntries);    // just for debugging purposes, remove

      var now = new Date();
      timestamp = timestamp || now;
      this.set('hash', newEntries);
      this.set('collection', AWE.Ext.hashValues(newEntries));
      this.set('lastUpdatedAt', timestamp);
      this.set('changedAt', now);
    },
      
    /** remove the given object or id from the collection. */
    remove: function(entryOrId) {
      var hash = this.get('hash');
      var collection = this.get('collection');
      var id = entryOrId.get === undefined  ? entryOrId : entryOrId.get('id');     
      
      if (hash[id]) {
        delete hash[id];
        var index = this.indexOfEntryWithId(id)
        if (index >= 0) {
          collection.removeAt(index);
        }
        this.set('changedAt', new Date());
      }
      else {
        console.log('WARNING: object to be removed was not found in HashableCollection.')
      }
    },
    
    // private
    indexOfEntryWithId: function(id) {
      var collection = this.get('collection');
      for (var i=0; i < collection.length; i++) {
        if (collection[i].get('id') === id) {
          return i;
        }
      }
      return -1;
    },
    
  });
  
  
  module.AttributeValueHash = Ember.Object.extend({

    allEntries: null,           ///< a hash from values to lists of objects, will be created in init
    attribute: null,            ///< the attribute, this AttributeValueHash hashes... ;-)
    
    /** initialize an empty hash. */
    init: function(spec) {
      this.set('allEntries', {}); // create an empty hash
      this._super(spec);
    },
    
    /** use with caution (overwrites for example armies that have moved
     * to another region). When fetching all entities for a value of an 
     * attribute from the server, all received entities are added 
     * automatically to the corresponding hash; so there's no need to
     * set its values manually, using this method. */
    setEntriesForValue: function(val, newEntries, timestamp) {
      var hc = this.getHashableCollectionForValue(val);
      hc.replaceAll(newEntries, timestamp);
    },
    
    addEntry: function(entry) {
      var attribute = this.get('attribute');
      var hc = this.getHashableCollectionForValue(entry.get(attribute));
      hc.add(entry);
    },
    removeEntry: function(entry, oldValue) {
      var attribute = this.get('attribute');      
      if (oldValue === undefined) {
        oldValue = entry.get(attribute); // use oldValue, if defined, otherwise assume the object still is unchanged
      }      
      var hc = this.getHashableCollectionForValue(oldValue);
      hc.remove(entry);
    },
    getEntriesForValue: function(val) {
      var hc = this.getHashableCollectionForValue(val);
      return hc.get('hash');
    },
    getEnumerableForValue: function(val) {
      var hc = this.getHashableCollectionForValue(val);
      return hc.get('collection');
    },
    setLastUpdateAtForValue: function(val, timestamp) {
      var hc = this.getHashableCollectionForValue(val);
      timestamp = timestamp || new Date();
      hc.set('lastUpdateAt', timestamp);
    },
    lastUpdateForValue: function(val, timestamp) {
      var hc = this.getHashableCollectionForValue(val);
      return hc.get('lastUpdateAt');
    },
    wasLastUpdateForValueAfter: function(val, timestamp) {
      return this.lastUpdateForValue(val) >= timestamp;
    },
        
    /** returns the hashable collection for the given value. if there's
     * none, it'll be created (empty) on the fly. */
    getHashableCollectionForValue: function(val) {
      var allEntries = this.get('allEntries');
      if (allEntries[val] === undefined || allEntries[val] === null) {
        allEntries[val] = module.HashableCollection.create({});
      }
      return allEntries[val];
    },
  });
  
   
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

        hook.accessHashes[attribute] = module.AttributeValueHash.create({
          attribute: attribute,
        });
        
        
        /** returns the HashableCollection for the given value. The 
         * HashableCollection is an Ember object and has the "collection" 
         * property, that controllers and view objects may bind to. */
        hook['getHashableCollectionFor'+upperCaseAttr] = function(value) {
          return hook.accessHashes[attribute].getHashableCollectionForValue(value);
        }
        
        hook['getEnumerableFor'+upperCaseAttr] = function(value) {
          return hook.accessHashes[attribute].getEnumerableForValue(value);
        }
        
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

    if (!hook.accessHashes || !hook.accessHashes[attribute]) {//   create hash, if not already there
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