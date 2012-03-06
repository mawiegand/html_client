/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Config = AWE.Config || {};

AWE.Config.MAP_RUN_TESTS = true;


AWE.MapDebug = AWE.MapDebug || function() {
    
  return {
    showTree: function(rootNode, width, levels) {
      var classStr = '';
          
      if (!rootNode) {
       return "<div class='subtree' style='width: " + width + "px; height: "+width+"px; border: solid black "+(levels+1)+"px; margin: -"+(levels+1)+"px; display: inline-block; text-align: center; overflow: visible;'>?</div>"
      }
          
      if (rootNode.isLeaf()) {
        classStr = 'class="leaf"';
      }
      else if (levels == 0) {
        classStr = 'class="subtree"';
      }
    
      var string = "<div " + classStr + " style='width: " + width + "px; height: "+width+"px; border: solid black "+(levels+1)+"px; margin: -"+(levels+1)+"px; display: inline-block; text-align: center; overflow: visible; " + (rootNode.isLeaf() ? 'font-weight: bold;' : '') + "'>"
      if (rootNode.isLeaf() || levels == 0) {
        string += rootNode.path();
      }
      else {
        for (var i=0; i < 4; i++) {
          string += AWE.MapDebug.showTree(rootNode.child(i), width/2, levels-1)
        }
      }
      string += "</div>"
      
      return string;
    },
  };
  
}();


$(document).ready(function() {
 
  if (!AWE.Config.MAP_RUN_TESTS) return ;
  
  $.getJSON('http://localhost:3000/game_server/map/subtrees/root.json?levels=3', function(data) {
    var root = AWE.Map.node(data);
    
    var map = AWE.MapDebug.showTree(root, 1024, 3);
    $('#map').append(map);
  });
  
});
  