/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};



AWE.MapDebug = AWE.MapDebug || function() {
    
  return {
    showTree: function(rootNode, width, levels) {
      var classStr = '';
          
/*    if (!rootNode) {
        return "<div class='subtree' style='width: " + width + "px; height: "+width+"px; border: solid black "+(levels+1)+"px; margin: -"+(levels+1)+"px; display: inline-block; text-align: center; overflow: visible;'>?</div>"
      }*/
          
      if (rootNode.isLeaf()) {
        classStr = 'class="leaf"';
      }
      else if (levels == 0 || !rootNode.children() || !rootNode.child(0)) {
        classStr = 'class="subtree"';
      }
      
      var c = parseInt(rootNode.path().substring(rootNode.path().length-1));
    
   //   var string = "<div " + classStr + " style='vertical-align=middle; width: " + width + "px; height: "+width+"px; border: solid black "+(levels+1)+"px; margin: -"+(levels+1)+"px; display: inline-block; text-align: center; overflow: visible; " + (rootNode.isLeaf() ? 'font-weight: bold;' : '') + "'>"
      var string = "<div " + classStr + " style='position:absolute; top: "+ (!c || c<2 ? 0 : width ) +"px; left: "+ (!c || c%2 == 0 ? 0 : width) + "px; width: " + width + "px; height: "+width+"px; border: solid black "+(levels+1)+"px; margin: -"+(levels+1)+"px; display: block; text-align: center; overflow: visible; " + (rootNode.isLeaf() ? 'font-weight: bold;' : '') + "'>"

      if (rootNode.isLeaf() || levels == 0 || !rootNode.children() || !rootNode.child(0)) {
        string += rootNode.path();
      }
      else {
        for (var i=0; i < 4; i++) {
          string += AWE.MapDebug.showTree(rootNode.child(i), width/2, levels-1);
        }
      }
      string += "</div>"
      
      return string;
    },
  };
  
}();


$(document).ready(function() {
  
  AWE.Network.init();
  
  if (!AWE.Config.MAP_RUN_TESTS) return ;
  
  AWE.Map.Manager.init(2, function(rootNode) {
    var map = AWE.MapDebug.showTree(rootNode, 1024, 2);
    $('#map').append(map);
  });
  
  $('#map').on("click", ".subtree", function(eventObject) {  // event handler attached at #map (delegate) for all future .subtree elements        
    var path = $(this).text();
    var clickedNode = AWE.Map.Manager.rootNode().traverse(path);
 
    $.getJSON('http://localhost:3000/game_server/map/subtrees/qt'+path+'?levels=1', function(data) {
      clickedNode.parent().insertAsChild(parseInt(path.substring(path.length-1)), AWE.Map.createNode(data));
      var map = AWE.MapDebug.showTree(AWE.Map.Manager.rootNode(), 1024, 7);
      $('#map').empty();
      $('#map').append(map);
    });

  });
  
});
  