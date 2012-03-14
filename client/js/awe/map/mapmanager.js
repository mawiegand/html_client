
var AWE = window.AWE || {};

AWE.Map = (function(module) {

  // creates a singleton object for handling one single map.
  module.Manager = function() {
    
    var that = {};    
    var _root = null;
    
    var _initialized = false;
    
    // public interface
    that.init = function(levels, callback) {
      levels = levels || 3;  // default: fetch 3 map levels when starting the client
      
       $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/root?levels='+levels, function(data) {
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
      if (node) {
        $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/qt'+node.path()+'?levels='+levels, function(data) {
          var subtree = AWE.Map.createNode(data);
          if (_root) _root.importSubtree(subtree);
          if (callback) callback(_root);
        }); 
      }
    };
    
    /** updates a given node and incorporates the received data into the tree. */
    that.updateNode = function(node, conditional, callback) {
      
    };
    
    return that;
    
  }(); 
  
  return module;

}(AWE.Map || {}));