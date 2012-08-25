
var AWE = window.AWE || {};

AWE.Map = (function(module) {

  // creates a singleton object for handling one single map.
  module.Manager = function(my) {
    
    
    
    var that;    
    var _root = null;    
    var _initialized = false;
    
    my = my || {};
    
    my.regions = {};
    my.locations = {};
    
    that = {}
    
    // public interface
    that.init = function(levels, callback) {
      levels = levels || 3;  // default: fetch 3 map levels when starting the client
      
      log ('INIT MAP');
      
       $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/root?levels='+levels, function(data) {
         log('GOT MAP DATA')
         _root = AWE.Map.createNode(data);
         _initialized = true;
         if (callback) callback(_root);
       });
      
    };
    
    that.isInitialized = function() {
      return _initialized;
    }
    
    that.rootNode = function() {
      return _root;
    };
    
    that.getRegion = function(regionId) {
      return my.regions[regionId];
    };
    
    that.getLocation = function(locationId) {
      return my.locations[locationId];
    };

    that.getLocations = function() {
      return my.locations;
    };

    that.addRegion = function(region) {
      if (region.id() !== undefined && region.id() > 0) {
        my.regions[region.id()] = region;
      }
     else {
        console.log('WARNING: tried to add a region without an id to the map manager.')
      }
    };
    
    that.addLocation = function(location) {
      if (location.id() !== undefined && location.id() > 0) {
        return my.locations[location.id()] = location;
      }
      else {
        console.log('WARNING: tried to add a location without an id to the map manager.')
      }
    };
    
    
    /** obtains a subtree starting at the given path position and expanding for the
     * given number of levels. If some nodes between the existing tree and the specified
     * path are missing, these are fetched as well. All the received data is integrated
     * into the existing local tree structure. This method can be used to directly query
     * nodes disconnected from the tree. In that case, the request to the server will also
     * ask for all the ancestors (of course: slower, larger response) and incorporate 
     * the missing branch into the tree. If the given path addresses a node already in the
     * local tree, this method just calls the quicker fetchSubtree method below. */
    that.fetchSubtreeForPath = function(path, levels, callback) {
      
      var node = null;
      
      if (that.isInitialized()) {
        node = _root.traverse(path);  // may set node to zero, if local tree hasn't been expanded up to path
      }
      
      if (!node) {   // the requested node is not available! thus, fetch ancestors.
        $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/qt'+path+'?levels='+levels+'&ancestors=true', function(data) {
          var subtree = AWE.Map.createNode(data);
          if (_root) _root.importSubtree(subtree);
          if (callback) callback(_root);
        });        
      }
      else {
        that.fetchSubtree(node, levels, false, callback);
      }
    };
    
    /** obtains a subtree starting with the given node and expanding for the given
     * number of levels. Incoprorates the obtained data into the existing tree. This call 
     * is quicker and results in a smaller response than using fetchSubtreeForPath for a 
     * path _disconnected_ from the tree. */ 
    that.fetchSubtree = function(node, levels, conditional, callback) {
      
      // TODO: use optional conditional get!
      
      if (node) {
        $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/qt'+node.path()+'?levels='+levels, function(data) {
          var subtree = AWE.Map.createNode(data);
          if (_root) _root.importSubtree(subtree);
          if (callback) callback(_root);
        }); 
      }
    };
    
    /** fetches a single node from the server and passes it to a callback. 
     * Does _not_ automatically include the node in the local subtree. */
    that.fetchSingleNodeById = function(nodeId, callback) {
      $.getJSON(AWE.Config.MAP_SERVER_BASE+'nodes/'+nodeId, function(data) {
        var node = AWE.Map.createNode(data);
        if (callback) callback(node);
      });
    };
    
    /** updates a given node and incorporates the received data into the tree. */
    that.updateNode = function(node, conditional, callback) {
      
      // TODO: use optional conditional get!

      if (node) {
        $.getJSON(AWE.Config.MAP_SERVER_BASE+'nodes/qt'+node.path(), function(data) {
          var newNode = AWE.Map.createNode(data);
          if (_root) _root.importSubtree(newNode);
          if (callback) callback(_root.traverse(node.path())); 
        }); 
      }
    };
    
    /** fetches all nodes that are in the given area. The area is specified as a frame
     * (origin, size). The third boolean argument controls whether only nodes completely inside
     * the area or although interesecting nodes should be fetched. Does not update existing nodes, 
     * only fetches missing nodes from server. This request may create multiple small requser
     * for fetching small subtrees.
     */
    that.fetchMissingNodesForArea = function(node, frame, level, onlyCompletelyInside)  {

      if (! node.frame().intersects(frame)  ) { // Case I: no overlap, stop expansion here!
        return ;
      }

      else if (node.isLeaf()) {                 // Case II: tree ends here
        return ;
      }

      else if (node.level() == level) {         // Case III: should stop querying here
        return ;
      }

      else {                                    // Case IV: decide for each child what to do
 
        for (var i=0; i < 4; i++) {
          if (!node.child(i)) {                 //   A: need to request child
     
            if (frame.contains(node.frame())) { //   A.1: frame completely inside requested area: fetch everything and forget
              that.fetchSubtreeForPath(node.path()+i, level-node.level());
            }
            else {                              //   A.2: intersects: fetch just the next level, and continue there
              that.fetchSubtreeForPath(node.path()+i, 0, (function() {
                var iCopy = i; // need to store this value
                return function() {
                  that.fetchMissingNodesForArea(node.child(iCopy), frame, level, onlyCompletelyInside);
                };
              }())); 
            }
          }
          else {                                 //   B: child is already there, traverse
            that.fetchMissingNodesForArea(node.child(i), frame, level, onlyCompletelyInside);
          }
        }
      }   
    };
    
    /** fetches all nodes that are in the given area. The area is specified as a frame
     * (origin, size). Does also update existing nodes. This request creates just
     * one (large) request to the server resulting in a possibly large answer.
     */
    that.fetchNodesForArea = function(frame, level, callback)  {
      $.getJSON(AWE.Config.MAP_SERVER_BASE+'area?x='+frame.origin.x.extendInteger()+'&y='+frame.origin.y.extendInteger()+
                '&width='+(frame.size.width.extendInteger()+1)+'&height='+(frame.size.height.extendInteger()+1)+'&level='+level, function(data) {
        var node = AWE.Map.createNode(data);
        if (_root) _root.importSubtree(node);
        if (callback) callback(_root);
      }); 
    };
    
    that.updateRegionForNode = function(node, callback) {
      if (!node.isLeaf()) {
        return false;
      }
      if (node.region()) { // update
         if (node.region().isUpdating()) {
          return false ; // presently updating
        }
        else {
          node.region().startUpdate();
          $.getJSON(AWE.Config.MAP_SERVER_BASE+'regions/'+node.region().id(), function(data) {
            var region = AWE.Map.createRegion(data);
            region.setNode(node);
            node.region().updateRegionFrom(region);
            node.region().endUpdate();
            if (callback) callback(node.region());
          });           
        }       
      }
      else { // fetch for the first time
        if (node.isUpdating()) {
          return false ; // presently updating
        }
        else {
          node.startUpdate();
          $.getJSON(AWE.Config.MAP_SERVER_BASE+'nodes/'+node.id()+'/regions', function(data) {
            // TODO: check for error
            var region = AWE.Map.createRegion(data[0]);
            region.setNode(node);
            node.setRegion(region);
            node.endUpdate();
            if (callback) callback(region);
          });           
        }
      }
      return true;
    };
    
    
    that.fetchMissingRegionsForArea = (function() { 
      var numRunningUpdates = 0;
      var recLevel = 0;
      
      return function fetchRegions(node, frame, level, callback) {
        recLevel += 1;
      
        if (! node) {
          recLevel -= 1;
          return ;
        }
      
        else if (! node.frame().intersects(frame)  ) {  // Case I: no overlap, stop expansion here!
          recLevel -= 1;
          return ;
        }

        else if (node.isLeaf() && !node.region()) {// Case II: tree ends here
          numRunningUpdates += 1;
          var retVal = that.updateRegionForNode(node, function() {
            numRunningUpdates -= 1;
            if (recLevel <= 0 && numRunningUpdates == 0) {  // finished everything!!!
              console.log ('finished updating regions in area.');
              if (callback) {
                callback();
              }
            }
          }) ;
          if (retVal == false) {
            numRunningUpdates -= 1;
          }
        }

        else if (node.level() == level) {          // Case III: should stop querying here
          recLevel -= 1;
          return ;
        }

        else {                                     // Case IV: continue for each child 
 
          for (var i=0; i < 4; i++) {
            if (node.child(i)) {              
              fetchRegions(node.child(i), frame, level, callback);
            }
          }
        }
        recLevel -= 1;
      };       
    }());

    that.fetchLocationsForRegion = function(region, callback) {
      if (region.isUpdating()) {
        return false ; // presently updating
      }
      else {
        region.startUpdate();
        //console.log ( 'Fetch locations for ' + region);
        $.getJSON(AWE.Config.MAP_SERVER_BASE+'regions/'+region.id()+'/locations', function(data) {
          if (data && data.length > 0) {
            var locations = new Array(data.length);
            for (var i=0; i < data.length; i++) {
              var location = AWE.Map.createLocation(data[i]);
              location.setRegion(region);
              locations[i] = location;
            }
            region.setLocations(locations);
          }
          region.endUpdate();
          if (callback) callback(region);
        });           
      }
      return true;
    };

    
    return that;
    
  }(); 
  
  

  
  return module;

}(AWE.Map || {}));