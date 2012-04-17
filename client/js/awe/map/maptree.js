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
      


      var _id = spec.id || 0;
      var _path = spec.path || '';
      
      var _updated_at = spec.updated_at || null;
      var _created_at = spec.created_at || null;
      
      var _leaf = true;
      if (spec.leaf === false) {
        _leaf = false;
      }
      var _level = spec.level || 0;
      var _parent = null;
      
      var _children = null;
      var _region = null;
      
      var _countSettlements = spec.count_settlements || 0;
      var _total_army_strength = spec.total_army_strength || 0;
      
      var _frame = AWE.Geometry.createRect(parseFloat(spec.min_x), parseFloat(spec.min_y), 
                                           parseFloat(spec.max_x) - parseFloat(spec.min_x), 
                                           parseFloat(spec.max_y) - parseFloat(spec.min_y));
                                           
        
      var that = {};
      AWE.Partials.addUpdateTracking(that);   // adds methods for update tracking.  
      AWE.Partials.addChangeTracking(that);   // basic change tracking.
      
      var superLastChange = that.lastChange;  // copy of original method
      that.lastChange = function() {          // also check for a change of the region.
        if (_region && _region.lastChange() > superLastChange()) {
          return _region.lastChange();
        }
        else {
          return superLastChange();
        }
      };
                                           
      /** returns the quad-tree path of the node */
      that.path = function() {
        return _path;
      };
      
      that.id = function() {
        return _id;
      }
      
      that.updatedAt = function() { return _updated_at; }
      that.createdAt = function() { return _created_at; }
      
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
      
      that.countSettlements = function() {
        return _countSettlements;
      }

      that.totalArmyStrength = function() {      
        return _total_army_strength;
      }
      
      /** true, in case the node is a leaf-node (has no children) */
      that.isLeaf = function() {
        return _leaf;
      };
      
      /** returns the parent (next ancestor) of this node or null for a root
       * node. */
      that.parent = function () {
        return _parent;
      };
      
      that.region = function() {
        return _region;
      };
      
      that.setRegion = function(region) {
        if (_region != region &&
            (!_region || !region || _region.updatedAt() != region.updatedAt())) {
          that.setChangedNow();  // need to set change manually, as the region property has changed by this assignement    
        }
            
        _region = region;
      };
      
      /** sets the parent of the node. Should be used with caution; you need
       * to insert the node to the parent's children manually, when using this
       * method. */
      that.setParent = function(newParent) {
        _parent = newParent;
        that.setChangedNow();
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
        that.setChangedNow();
      };
      
      /** prunes a given child (and its subtree) from the tree and returns it afterwards. */
      that.pruneChild = function(qtPath) {
        var node = that.child(qtPath);
        if (node) {
          node.setParent(null);
          _children[qtPath] = null;
        }
        that.setChangedNow();
        return node;
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
      
      that.traverse = function(qtPath, returnLast) {
        if (!qtPath || qtPath == "") {
          return that;
        }
        var p = parseInt(qtPath[0]);
        if (that.isLeaf() || !that.child(p)) {
          if (returnLast) {
            return that;
          }
          return null;
        }
        return that.child(p).traverse(qtPath.substring(1), returnLast);
      }
      
      /** this method updates the data stored at the local node from the given node. 
       * This only concerns the 'local' data, that is level, path, etc. Children
       * are _not_ touched and will not be imported from the given node. */
      that.updateNodeFrom = function(node) {
        //console.log('Updating node at '+_path+'.');

        if (node.path() != _path) {
          console.log('WARNING: updating data at node ' + _path + ' from a node with different path '+ node.path() + '.');
        }
        
        _id = node.id();
        _path = node.path();
      
        _updated_at = node.updatedAt();
        _created_at = node.createdAt();
      
        _leaf = node.isLeaf();
        _level = node.level();
      
        _frame = AWE.Geometry.createRect(node.origin().x, node.origin().y, node.size().width, node.size().height);
        
        
        if (node.region() && _region) {
          _region.updateRegionFrom(node.region());
        }
        
        that.setChangedNow();
      };
      
      /** method to import the given subtree into the tree. Attention: this may modify the 
       * subtree by 'pruning' whole branches from the subtree and incorporating them into
       * the tree. Other parts of the subtree, that are already available in the tree, 
       * are not touched and may be re-used or discarded afterwards. But please note:
       * most likely the given subtree is not complete anymore after a call to this method. 
       *
       * Returns true on suceess and false if nothing or not the complete subtree could
       * incorporated. */
      that.importSubtree = function(subtree) {
        
        // implementation is recursive. 
        // three cases to distinguish:
        
        if (!subtree) return true;          // Case I: nothing (left) to import
        
        else if (_path == subtree.path()) { // Case II: at the right place for import
        
          // Step A: update local node
          that.updateNodeFrom(subtree);   
          
          var result = true;
          
          // Step B: continue with child nodes (if necessary)
          if (!subtree.children()) {
            return result ;
          }
          
          for (var i=0; i < 4; i++) {
            if (!subtree.child(i)) continue ;         // that particular child is not in the new subtree
            
            if (!that.children() || !that.child(i)) { // this child is not yet in the tree
              var node = subtree.pruneChild(i);       // prune child from one tree (subtree)
              that.insertAsChild(i, node);            // and add it to the other tree (node at hand)
              
              //console.log('Importing child '+i+' into node at '+_path+'.');
            }
            else {
              result = result && that.child(i).importSubtree(subtree.child(i));
            }            
          }
          
          return result;
        }
        
        else {                              // Case III: must walk to the right place in the tree (might occur initially)
          
          var node = null;
          
          if (subtree.path().length >= _path.length &&
              (subtree.path().substr(0,_path.length) == _path)
              ) {
            var node = that.traverse(subtree.path().substr(_path.length));
          }
          
          if (!node) {
            console.log('Faild to incorporate subtree with path ' + subtree.path() + ' into tree from path ' + _path + '.' );
            return false ;      
          }
          else {
            return node.importSubtree(subtree); 
          }
        }
      }

      /** Returns the neighbour nodes */
      that.getNeighbourNodes = function () {

        var nodes = [];
        //log("getNeighbourNodes for ",that);
        var addNeighbour = function (tms, level) {
          var path = AWE.Mapping.GlobalMercator.TMSToQuadTreeTileCode(tms.x, tms.y, level);
          //console.log(path);
          var rootNode = AWE.Map.Manager.rootNode();
          var node = rootNode.traverse(path, true);
          if (node) {
            nodes.push(node);
          } else {
            console.warn("no node found for path", path);
          }
        }

        var tms = AWE.Mapping.GlobalMercator.QuadTreeToTMSTileCode(that.path());
        if (tms.x > 0) {
          addNeighbour({ x: tms.x-1, y: tms.y, zoom:tms.zoom }, that.level());
        }
        if (tms.y > 0) {
          addNeighbour({ x: tms.x, y: tms.y-1, zoom:tms.zoom }, that.level()); 
        }
        if (tms.y < Math.pow(4,that.level())-1) {
          addNeighbour({ x: tms.x, y: tms.y+1, zoom:tms.zoom }, that.level()); 
        }
        if (tms.x < Math.pow(4,that.level())-1) {
          addNeighbour({ x: tms.x+1, y: tms.y, zoom:tms.zoom }, that.level());
        }
        return nodes;
      }
      
      /** Returns the neighbour nodes */
      that.getNeighbourLeaves = function () {

        var nodes = [];
        
        var addNeighbours = function (tms, level, orientation) {
          var path = AWE.Mapping.GlobalMercator.TMSToQuadTreeTileCode(tms.x, tms.y, level);
          var rootNode = AWE.Map.Manager.rootNode();
          var node = rootNode.traverse(path, true);
          if (node) {
            if (node.isLeaf()) {
              nodes.push(node);
            }
            else {
              switch (orientation) {
                case 0:
                  nodes.push(node.traverse('0', true));
                  nodes.push(node.traverse('1', true));
                  break;
                case 1:
                  nodes.push(node.traverse('0', true));
                  nodes.push(node.traverse('2', true));
                  break;
                case 2:
                  nodes.push(node.traverse('2', true));
                  nodes.push(node.traverse('3', true));
                  break;
                case 3:
                  nodes.push(node.traverse('1', true));
                  nodes.push(node.traverse('3', true));
                  break;
                default:
              }              
            }
          } else {
            console.warn("no node found for path", path);
          }
        }

        var tms = AWE.Mapping.GlobalMercator.QuadTreeToTMSTileCode(that.path());
        if (tms.x > 0) {
          addNeighbours({ x: tms.x-1, y: tms.y, zoom:tms.zoom }, that.level(), 3);
        }
        if (tms.y > 0) {
          addNeighbours({ x: tms.x, y: tms.y-1, zoom:tms.zoom }, that.level(), 0); 
        }
        if (tms.y < Math.pow(4,that.level())-1) {
          addNeighbours({ x: tms.x, y: tms.y+1, zoom:tms.zoom }, that.level(), 2); 
        }
        if (tms.x < Math.pow(4,that.level())-1) {
          addNeighbours({ x: tms.x+1, y: tms.y, zoom:tms.zoom }, that.level(), 1);
        }
        return nodes;
      }

      // further initialize the node from the spec (set region and expand children) 
      if (spec.region) {
        that.setRegion(module.createRegion(spec.region));
        that.region().setNode(that);
      }
      
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
  
  /** returns an estimate of the number of missing nodes in a given area and level. */
  module.numMissingNodesInAreaAtLevel = function(startNode, frame, level) {
    
    var count = 0;
    
    (function countMissingNodes(node) {
            
      if (!node.frame().intersects(frame)) {
        return ;
      }
      else if (node.isLeaf() || node.level() == level) {
        return ;
      }
      else if (!node.children()) {
        count += Math.pow(4, level - node.level());
      }
      else {
        for (var i=0; i < 4; i++) {
          if (node.child(i)) {
            countMissingNodes(node.child(i));
          }
          else {
            count += 1;
            if (node.level()+1 < level) {
               Math.pow(4, level - (node.level()+1));

             }
          }
        }
      }
      
    }(startNode));
    
    return count;
  };
  
  /** returns all nodes that are in the given area. The area is specified as a frame
   * (origin, size). The third boolean argument controls whether only nodes completely inside
   * the area or although interesecting nodes are returned. */
  module.getNodesInAreaAtLevel = (function()  {
    
    var memoizer = AWE.Memoization.createMemoizer(10);
    
    return function(rootNode, frame, level, onlyCompletelyInside, forceRecalc) {
    
      var argument = {
        rootNode: rootNode,
        frame: frame,
        level: level,
        onlyCompletelyInside: onlyCompletelyInside,
        equals: function(other) {
          return this.rootNode === other.rootNode && this.frame.equals(other.frame) && this.level === other.level &&
                 this.onlyCompletelyInside === other.onlyCompletelyInside;
        },
      };
      
      var result = memoizer.getResult(argument);

      if (!result || forceRecalc) {

        var collectNodes = function collectNodes(nodes, presentNode) {
          
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
        result = [];
        collectNodes(result, rootNode);
        
        memoizer.storeResult(argument, result);
      }
    
      return result;  
    }  
  }());

  module.getNodeThatContainsPoint = function(rootNode, point, maxLevel) {
    var node = rootNode;
    //outside of world
    if (!node.frame().contains(point)) {
      return null;
    }
    while (
      !node.isLeaf() && 
      node.children() !== null && 
      node.children().length > 0 &&
      node.level() < maxLevel
    ) {
      var children = node.children();
      var found = false;
      for (var i = 0; i < children.length && !found; i++) {
        var frame = children[i].frame();
        if (frame.contains(point)) {
          node = children[i];
          found = true;
          break;
        }
      }
      if (!found) {
        return node;
      }
    }
    return node;   
  };
  
  return module;
    
}(AWE.Map || {}));



