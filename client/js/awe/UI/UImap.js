/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = AWE || {};

AWE.UI = (function(module) {
          
  /*** map ***/
  
  var _map = (function() {
  
    var that = {};
    
    var baseRect;
    var windowSize;
    var mapPosMC;
    var vc2mcFactor;
    
    // TODO: Umrechnung für Punkte und Rechtecke hinzufügen
    var mc2vc = function(val) {
      return val / vc2mcFactor;
    }

    // TODO: Umrechnung für Punkte und Rechtecke hinzufügen
    var vc2mc = function(val) {
      return val * vc2mcFactor;
    }
        
    var _canvas0 = $('#layer0')[0];
    var _layer0 = new Stage(_canvas0);
    
    var _canvas1 = $('#layer1')[0];
    var _layer1 = new Stage(_canvas1);
    
    var _canvas2 = $('#layer2')[0];
    var _layer2 = new Stage(_canvas2);
        
    var _regionImage = new Image();
    _regionImage.src = "images/region.png";
    _regionImage.onload = function() {
      _map.update();
    };
    
    var _armyImage = new Image();
    _armyImage.src = "images/army.png";
    _armyImage.onload = function() {
      _map.update();
    };
    

    var date = 0;

    that.addRegion = function(node) {
            
      var frame = node.frame();

      var bitmap = new Bitmap(_regionImage);
      bitmap.name = 'region' + node.path();
      bitmap.x = mc2vc(frame.origin.x);
      bitmap.y = mc2vc(frame.origin.y);
      bitmap.scaleX = mc2vc(frame.size.width / 128);
      bitmap.scaleY = mc2vc(frame.size.height / 128);
      _layer0.addChild(bitmap);
            
      for (var i = 0; i < 1000; i++) {
        bitmap = new Bitmap(_armyImage);
        bitmap.name = 'army' + i;
        bitmap.x = i - 444;
        bitmap.y = i - 444;
        bitmap.scaleX = 1;
        bitmap.scaleY = 1;
        _layer1.addChild(bitmap);
      }
    };

    that.toString = function() {
    };
      
    that.update = function() {
      _layer0.update();
      _layer1.update();
    };
    
    that.init = function() {
      baseRect = AWE.Geometry.createRect(-500000,-500000,1000000,1000000);
      windowSize = AWE.Geometry.createSize(1000, 1000);
      mapPosMC = AWE.Geometry.createPoint(-500000,-500000);
    
      vc2mcFactor = Math.round(baseRect.size.width / windowSize.width);    
      _layer0.x = mc2vc(-baseRect.origin.x);
      _layer0.y = mc2vc(-baseRect.origin.y);      
      _layer1.x = mc2vc(-baseRect.origin.x);
      _layer1.y = mc2vc(-baseRect.origin.y);      
    };
      
    that.render = function() {
      
      // fps
      var now = +new Date();
      $('#debug').text(Math.round(1000 / (now - date)));
      date = now;
      
      // Adjust
      newWindowSize = AWE.Geometry.createSize($(window).width(), $(window).height());
      
      if (windowSize.width !== newWindowSize.width) {
        _canvas0.width = newWindowSize.width;
        _canvas1.width = newWindowSize.width;
        baseRect.size.width *= newWindowSize.width / windowSize.width;
        windowSize.width = newWindowSize.width;
      }
      
      if (windowSize.height !== newWindowSize.height) {
        _canvas0.height = newWindowSize.height;
        _canvas1.height = newWindowSize.height;
        baseRect.size.height *= newWindowSize.height / windowSize.height;
        windowSize.height = newWindowSize.height; 
      }
      
      vc2mcFactor = Math.round(baseRect.size.width / windowSize.width);
      
      
      // reload regions
      _layer0.removeAllChildren();
      _layer1.removeAllChildren();
      _layer2.removeAllChildren();
      
      if(AWE.Map.Manager.isInitialized()) {
        
        var viewRect = AWE.Geometry.createRect(mapPosMC.x, mapPosMC.y, baseRect.size.width, baseRect.size.height);
        $('#debug2').text('(' + mapPosMC.x + ';' + mapPosMC.y + '|' + baseRect.size.width + ';' + baseRect.size.height + ')');
        var nodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), viewRect, 3, false);

        for(var i = 0; i < nodes.length; i++) {
          // log('Node:', nodes[i]);
          _map.addRegion(nodes[i]);
        }
      }

      // update region canvas to repaint
      _map.update();
            
      // and repeat from beginning
      window.requestAnimFrame(_map.render);
    };

    _layer1.onPress = function(evt) {
        
      var clickPosVC = AWE.Geometry.createPoint(evt.stageX, evt.stageY);
      var startMapPosVC = AWE.Geometry.createPoint(_layer1.x, _layer1.y);
      var startMapPosMC = AWE.Geometry.createPoint(mapPosMC.x, mapPosMC.y);

      evt.onMouseMove = function(ev) {
        
        _layer0.x = _layer1.x = _layer2.x = startMapPosVC.x + ev.stageX - clickPosVC.x;
        _layer0.y = _layer1.y = _layer2.y = startMapPosVC.y + ev.stageY - clickPosVC.y;
        
        mapPosMC.x = (clickPosVC.x - ev.stageX) * baseRect.size.width / windowSize.width + startMapPosMC.x;
        mapPosMC.y = (clickPosVC.y - ev.stageY) * baseRect.size.height / windowSize.height + startMapPosMC.y;
      };
      
      evt.onMouseUp = function(ev) {
      };
    }
    
    return that;
  }());  
  

  /*** initializer ***/
    
  module.init = function() {
      
    var rootNode;    
    
    AWE.Network.init();
    AWE.Map.Manager.init(3, function(){
      rootNode = AWE.Map.Manager.rootNode();
    });
    
    _map.init();
    _map.render();
  };
  
  return module;
    
}(AWE.UI || {}));


$(function(){
  AWE.UI.init();
  $('#update').click(function(){});
});



