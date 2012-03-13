
var AWE = window.AWE || {};

AWE.MapManager = AWE.MapManager || function() {

  // creates a singleton object for handling one single map.
  return function() {
    
    var that = {};    
    var _root = null;
    
    // public interface
    that.init = function(levels, callback) {
      levels = levels || 3;  // default: fetch 3 map levels when starting the client
      
       $.getJSON(AWE.Config.MAP_SERVER_BASE+'subtrees/root.json?levels='+levels, function(data) {
         _root = AWE.Map.node(data);
         if (callback) callback(_root);
       });
      
    };
    
    that.rootNode = function() {
      return _root;
    };
    
    
    /** obtains a subtree starting at the given path position and expanding for the
     * given number of levels. If some nodes between the existing tree and the specified
     * path are missing, these are fetched as well. All the received data is integrated
     * into the existing local tree structure. */
    that.fetchSubtreeForPath = function(path, levels, callback) {
      
    };
    
    /** obtains a subtree starting with the given node and expanding for the given
     * number of levels. Incoprorates the obtained data into the existing tree. */ 
    that.fetchSubtree = function(node, levels, conditional, callback) {
      
    };
    
    /** updates a given node and incorporates the received data into the tree. */
    that.updateNode = function(node, conditional, callback) {
      
    };
    
    return that;
    
  }(); 

}();