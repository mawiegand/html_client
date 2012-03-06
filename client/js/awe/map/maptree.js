/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Map = AWE.Map || function() {
  
  return {
    
    /** creates a node-object from the given spec, or, if no specs given, sets
     * all values to defaults appropriate for a root node. Spec could be JSON
     * data send by the game_server and could contain the spec for a complete
     * subtree. In this case, this method creates child-nodes as needed and
     * returns a complete subtree matching the spec. */
    node: function(spec) {
      spec = spec || {};    // default value for spec: empty spec
      
      var that = {};
      
      var _id = spec.id || 0;
      
      var _updated_at = spec.updated_at || null;
      var _created_at = spec.created_at || null;
      
      var _leaf = true;
      if (spec.leaf === false) {
        _leaf = false;
      }
      var _level = spec.level || 0;
      var _parent = null;
      
      var _children = null;

      
      /** true, in case the node is a leaf-node (has no children) */
      that.isLeaf = function() {
        return _leaf;
      };
      
      /** returns the parent (next ancestor) of this node or null for a root
       * node. */
      that.parent = function () {
        return _parent;
      };
      
      /** sets the parent of the node. Should be used with caution; you need
       * to insert the node to the parent's children manually, when using this
       * method. */
      that.setParent = function(newParent) {
        _parent = newParent;
      };
      
      that.children = function() {
        return _children;
      };
      
      that.child = function(qtPath) {
        if (!_children) return null;
        return _children[qtPath];
      };
      
      that.setChild = function(qtPath, childNode) {
        if (!_children) {
          _children = [ null, null, null, null ];
          _leaf = false;
        }
        _children[qtPath] = childNode;
      };
      
      /** use this method to hook a node into an existing tree. Replaces any
       * previously set child, makes the node to a non-leaf node, if it was
       * a leaf node up to inserting this childNode. */
      that.insertAsChild = function(qtPath, childNode) {
        that.setChild(qtPath, childNode);
        childNode.setParaent(that);
      };
      
      that.toString = function (traverse) {
        var string = "Node with id " + _id + " at level " + _level + " isLeaf: " + (_leaf ? 'true' : 'false');
        if (traverse && _children) {
          string += "\n" + _children[0].toString(true);
          string += "\n" + _children[1].toString(true);
          string += "\n" + _children[2].toString(true);
          string += "\n" + _children[3].toString(true);
        }
        return string;
      }
      
      /** further initialize the node from the spec (set and expand children) */
      if (spec.c0 || spec.c1 || spec.c2 || spec.c3) {
        if (spec.c0) {
          that.setChild(0, AWE.Map.node(spec.c0));
        }
        if (spec.c1) {
          that.setChild(1, AWE.Map.node(spec.c1));
        }
        if (spec.c2) {
          that.setChild(2, AWE.Map.node(spec.c2));
        }
        if (spec.c3) {
          that.setChild(3, AWE.Map.node(spec.c3));
        }
      }
      
      return that;
    },
  };
  
}();


// embedded tests below here (delete or comment-out in production environment).

var node = AWE.Map.node();
console.log('Created node: ' + node);

$.getJSON('http://localhost:3000/game_server/map/subtrees/root.json?levels=2', function(data) {
  var root = AWE.Map.node(data);
  console.log('Obtained node from server: ' + root.toString(true));
});



