/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Map = (function(module) {
  
    
  /** creates a node-object from the given spec, or, if no specs given, sets
   * all values to defaults appropriate for a root node. Spec could be JSON
   * data send by the game_server and could contain the spec for a complete
   * subtree. In this case, this method creates child-nodes as needed and
   * returns a complete subtree matching the spec. */
  module.createNode = function(spec) {
      spec = spec || {};    // default value for spec: empty spec
      
      var that = {};
      
      var _id = spec.id || 0;
      var _path = spec.path || '';
      
      var _updated_at = spec.updated_at || null;
      var _created_at = spec.created_at || null;
      
      var _leaf = true;
      if (spec.leaf === false) {
        _leaf = false;
      }
      var _level = spec.level || 0;
      var _parent = null;
      
      var _children = null;
      
      var _frame = AWE.Geometry.createRect(parseFloat(spec.min_x), parseFloat(spec.min_y), 
                                           parseFloat(spec.max_x) - parseFloat(spec.min_x), 
                                           parseFloat(spec.max_y) - parseFloat(spec.min_y));

      /** returns the quad-tree path of the node */
      that.path = function() {
        return _path;
      };
      
      that.origin = function() {
        return _frame.origin;
      };
  
      that.size = function() {
        return _frame.size;
      };
            
      that.frame = function () {
        return _frame;
      };
      
      that.level = function() {
        return _level;
      };
      
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
        childNode.setParent(that);
      };
      
      that.toString = function (traverse) {
        var string = "" + _path + "\t Node with id " + _id + " at level " + _level + " isLeaf: " + (_leaf ? 'true' : 'false') + " frame: " + _frame;
        if (traverse && _children) {
          string += "\n" + _children[0].toString(true);
          string += "\n" + _children[1].toString(true);
          string += "\n" + _children[2].toString(true);
          string += "\n" + _children[3].toString(true);
        }
        return string;
      }
      
      that.traverse = function(qtPath) {
        if (!qtPath || qtPath == "") {
          return that;
        }
        var p = parseInt(qtPath[0]);
        if (!that.child(p)) {
          return null;
        }
        return that.child(p).traverse(qtPath.substring(1));
      }
      
      /** further initialize the node from the spec (set and expand children) */
      if (spec.c0 || spec.c1 || spec.c2 || spec.c3) {
        if (spec.c0) {
          that.insertAsChild(0, AWE.Map.createNode(spec.c0));
        }
        if (spec.c1) {
          that.insertAsChild(1, AWE.Map.createNode(spec.c1));
        }
        if (spec.c2) {
          that.insertAsChild(2, AWE.Map.createNode(spec.c2));
        }
        if (spec.c3) {
          that.insertAsChild(3, AWE.Map.createNode(spec.c3));
        }
      }
      
      return that;
  };
  
  /** returns all nodes that are in the given area. The area is specified as a frame
   * (origin, size). The third boolean argument controls whether only nodes completely inside
   * the area or although interesecting nodes are returned. */
  module.getNodesInAreaAtLevel = function(rootNode, frame, level, onlyCompletelyInside)  {
    
    var collectNodes = function(nodes, presentNode) {
      if (! presentNode.frame().intersects(frame)  ) { // no overlap, stop expansion here!
        return ;
      }
      else if (presentNode.isLeaf() ||            // this is a leaf node
               presentNode.level() == level ||    // this is a node at the desired level of complexity
               !presentNode.children()) {         // there is no more information (e.g. due to incomplete tree)
         
        // handle the optional completely-inside-flag          
        if (!onlyCompletelyInside || frame.contains(presentNode.frame())) {        
          nodes.push(presentNode);
        }
        return  ;
      }
      else {  // continue traversal and expand the child nodes
        for (var i=0; i < 4; i++) {
          collectNodes(nodes, presentNode.child(i));
        }
        return ;
      }
    };
    
    var result = [];
    collectNodes(result, rootNode);
    
    return result;    
  };
  
  return module;
    
}(AWE.Map || {}));


// embedded tests below here (delete in production environment).

$(document).ready(function() {

  if (!AWE.Config.MAP_RUN_TESTS) return ;

  var node = AWE.Map.createNode();
  console.log('Created node: ' + node);

  $.getJSON('http://localhost:3000/game_server/map/subtrees/root.json?levels=3', function(data) {
    var root = AWE.Map.createNode(data);
    console.log('Obtained node(s) from server:\n' + root.toString(true));

    // lookup nodes in 1000-km tile centered at 0,0 (somewhere on aequator in africa), this touches at least 4 nodes
    var nodesInArea = AWE.Map.getNodesInAreaAtLevel(root, AWE.Geometry.createRect(-500000,-500000,1000000,1000000), 2, false);
    
    for (var i=0; i < nodesInArea.length; i++) {
      console.log('Node ' + i + ': ' + nodesInArea[i]);
    }
    
  });
  

});



