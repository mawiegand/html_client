/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = AWE || {};

AWE.UI = (function(module) {
          
  /*** map ***/
 
  module.rootNode = null;
  
  module.Map = (function() {
  
    var that = {};
    
    var windowSize;
    
    var mc2vcScale;
    var mc2vcTrans;
    
    var mc2vc = function(obj) {
      
      // if obj os rect
      if (obj.origin !== undefined && obj.size !== undefined) {
        var rect = obj.copy();
        rect.origin.scale(mc2vcScale);
        rect.origin.moveBy(mc2vcTrans);
        rect.size.scale(mc2vcScale);
        return rect;
      }
      // if obj is point
      else if (obj.x !== undefined && obj.y !== undefined) {
        var point = obj.copy();
        point.scale(mc2vcScale);
        point.moveBy(mc2vcTrans);
        return point;
      }
      // if obj is size
      else if (obj.width !== undefined && obj.height !== undefined) {
        var size = obj.copy();
        size.scale(mc2vcScale);
        return size;
      }
      else {
        return obj * mc2vcScale;
      }
    }

    var vc2mc = function(obj) {
      
      // if obj os rect
      if (obj.origin !== undefined && obj.size !== undefined) {
        var rect = obj.copy();
        rect.origin.moveBy(AWE.Geometry.createPoint(-mc2vcTrans.x, -mc2vcTrans.y));
        rect.origin.scale(1/mc2vcScale);
        rect.size.scale(1/mc2vcScale);
        return rect;
      }
      // if obj is point
      else if (obj.x !== undefined && obj.y !== undefined) {
        var point = obj.copy();
        point.moveBy(n(mc2vcTrans));
        point.scale(1/mc2vcScale);
        return point;
      }
      // if obj is size
      else if (obj.width !== undefined && obj.height !== undefined) {
        var size = obj.copy();
        size.scale(1/mc2vcScale);
        return size;
      }
      else {
        return obj / mc2vcScale;
      }
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
      that.update();
    };
    
    var _armyImage = new Image();
    _armyImage.src = "images/army.png";
    _armyImage.onload = function() {
      that.update();
    };
    

    var date = 0;

    that.addRegion = function(node) {
            
      var frame = node.frame();
      var frameVC = mc2vc(frame);
      
      var bitmap = new Bitmap(_regionImage);
      bitmap.name = 'region' + node.path();
      bitmap.x = frameVC.origin.x;
      bitmap.y = frameVC.origin.y;
      bitmap.scaleX = frame.size.width * mc2vcScale / 128;
      bitmap.scaleY = frame.size.height * mc2vcScale / 128;
      _layer0.addChild(bitmap);
            
      // for (var i = 0; i < 100; i++) {
        // bitmap = new Bitmap(_armyImage);
        // bitmap.name = 'army' + i;
        // bitmap.x = i ;
        // bitmap.y = i ;
        // bitmap.scaleX = 1;
        // bitmap.scaleY = 1;
        // _layer0.addChild(bitmap);
      // }
    };

    that.toString = function() {
    };
      
    that.update = function() {
      _layer0.update();
      _layer1.update();
    };
    
    that.init = function(startRectMC) {
      windowSize = AWE.Geometry.createSize($(window).width(), $(window).height());
      
      _canvas0.width = windowSize.width;
      _canvas0.height = windowSize.height;
    
      mc2vcScale = 1. * windowSize.width / startRectMC.size.width;
      mc2vcTrans = AWE.Geometry.createPoint(
        -1. * startRectMC.origin.x * windowSize.width / startRectMC.size.width,
        -1. * startRectMC.origin.y * windowSize.height / startRectMC.size.height
      );
    };
    
    that.zoom = function(dScale, zoomin) {
      
      var scale = 1 + dScale;
      var center = AWE.Geometry.createPoint(-windowSize.width / 2, -windowSize.height / 2);
      var centerInv = AWE.Geometry.createPoint(windowSize.width / 2, windowSize.height / 2);

      mc2vcTrans.moveBy(center);      
      if (zoomin) {
        mc2vcScale *= scale;
        mc2vcTrans.scale(scale);
      }
      else {
        mc2vcScale /= scale;
        mc2vcTrans.scale(1 / scale);
      }
      mc2vcTrans.moveBy(centerInv);
    };
      
    
    that.render = function() {
      
      // fps
      var now = +new Date();
      $('#debug').text(Math.round(1000 / (now - date)));
      date = now;
      
      // Adjust canvas sizes, if window size cghanges
      newWindowSize = AWE.Geometry.createSize($(window).width(), $(window).height());
       
      if (windowSize.width !== newWindowSize.width) {
        _canvas0.width = newWindowSize.width;
        _canvas1.width = newWindowSize.width;
        windowSize.width = newWindowSize.width;
       }
       
       if (windowSize.height !== newWindowSize.height) {
        _canvas0.height = newWindowSize.height;
        _canvas1.height = newWindowSize.height;
        windowSize.height = newWindowSize.height; 
      }     
      
      // reload regions
      _layer0.removeAllChildren();
      _layer1.removeAllChildren();
      _layer2.removeAllChildren();
      
      if(AWE.Map.Manager.isInitialized()) {
        
        var rect = AWE.Geometry.createRect(0, 0, windowSize.width, windowSize.height);
        
        $('#debug2').text(vc2mc(rect).toString());
        
        var nodes = AWE.Map.getNodesInAreaAtLevel(rootNode, vc2mc(rect), 3, false);
        
        // log('count', nodes.length);

        for(var i = 0; i < nodes.length; i++) {
          that.addRegion(nodes[i]);
        }
      }

      // update region canvas to repaint
      that.update();
            
      // and repeat from beginning
      // if(!AWE.Map.Manager.isInitialized()) 
        window.requestAnimFrame(that.render);
    };

    _layer0.onPress = function(evt) {
             
      var clickPosVC = AWE.Geometry.createPoint(evt.stageX, evt.stageY);
      var vcStart = mc2vcTrans.copy();
      
      evt.onMouseMove = function(ev) {
        
        var pos = AWE.Geometry.createPoint(vcStart.x + ev.stageX - clickPosVC.x, vcStart.y + ev.stageY - clickPosVC.y);        
        mc2vcTrans.moveTo(pos);
      };
      
      evt.onMouseUp = function(ev) {
      };
    }
    
    $(window).bind('mousewheel', function() {
      var delta = 0;
      
      if (!event) { /* For IE. */
        event = window.event;
      }
            
      if (event.wheelDelta) { /* IE/Opera. */
        delta = event.wheelDelta/120;
      }
      else if (event.detail) { /** Mozilla case. */

        /** In Mozilla, sign of delta is different than in IE.
         * Also, delta is multiple of 3.
         */
        delta = -event.detail/3;
      }

      /** If delta is nonzero, handle it.
       * Basically, delta is now positive if wheel was scrolled up,
       * and negative, if wheel was scrolled down.
       */
      if (delta) {
        that.zoom(0.02, delta > 0);
      }

      /** Prevent default actions caused by mouse wheel.
       * That might be ugly, but we handle scrolls somehow
       * anyway, so don't bother here..
       */
      if (event.preventDefault) {
        event.preventDefault();
      }
      event.returnValue = false;
    });
    
    return that;
  }());  
  

  /*** initializer ***/
    
  module.init = function() {
          
    AWE.Network.init();
    AWE.Map.Manager.init(3, function(){
      rootNode = AWE.Map.Manager.rootNode();
    });
    
    AWE.UI.Map.init(AWE.Geometry.createRect(-1000000,-1000000,10000000,10000000));
    AWE.UI.Map.render();
  };
    
  return module;
    
}(AWE.UI || {}));


$(function(){
  AWE.UI.init();
  $('#zoomin').click(function(){AWE.UI.Map.zoom(.1, true)});
  $('#zoomout').click(function(){AWE.UI.Map.zoom(.1, false)});
});



