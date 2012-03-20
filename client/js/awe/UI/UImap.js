/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/
 
  module.createView = function(spec) {
    var _view = {};
    
    var _id = spec.id || 0;
    var _frame = spec.frame || null;
    var _alphaMin = spec.alphaMin || 0;
    var _alphaMax = spec.alphaMax || 0;
    var _scaled = spec.scaled || false;
        
    var _image = new Image();
    _image.src = spec.imageSrc;
    _image.onload = function() {
      module.Map.updateView();
    };
    
    _view.alpha = function(width) {
      
      if (_alphaMax === _alphaMin) {
        return 1;
      }
      else {      
        var alpha = (width - _alphaMin ) / (_alphaMax - _alphaMin);
        
        if (alpha > 1) alpha = 1;
        if (alpha < 0) alpha = 0;
        
        return alpha;
      }      
    };
    
    _view.id = function() {
      return _id;
    };
    
    _view.image = function() {
      return _image;
    };
    
    _view.frame = function() {
      return _frame;
    };
    
    _view.isScaled = function() {
      return _scaled;
    };
    
    _view.showInfo = function(){
      log('show info', _view);
    };
    
    _view.redraw = function() {
      log('redraw', _view);
    };
    
    return _view;
  };

  module.createRegionView = function(_id, _frame, _isLeaf) {

    var spec = {
      id: _id,
      imageSrc: _isLeaf ? AWE.Config.MAP_LEAF_IMAGE_URL : AWE.Config.MAP_REGION_IMAGE_URL,
      frame: _frame,
      scaled: true
    };
    
    var _view = module.createView(spec);
    
    _view.position = function() {
      return _view.frame().origin;
    };
        
    return _view;
  };
  
  module.createFortressView = function(_id, _frame) {

    var spec = {
      id: _id,
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      imageSrc: AWE.Config.MAP_FORTRESS_IMAGE_URL,
      frame: _frame,
      scaled: false
    };
    
    var _view = module.createView(spec);
        
    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };
    
    return _view;
  };
  
  
  /*** Map ***/
  
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
        
    var date = 0;
    var frame = 0;
    var requestingMapNodesFromServer = false;
    var needRedraw;
    
    that.updateView = function() {
      needRedraw = true;
    }
    
    that.addView = function(view, layer) {
      var frame = mc2vc(view.frame());
      var alpha = view.alpha(frame.size.width);
      
      if (alpha > 0) {
        var bitmap = new Bitmap(view.image());
        bitmap.name = view.id();
        if (view.isScaled()) {
          bitmap.scaleX = frame.size.width / AWE.Config.MAPPING_TILE_SIZE;
          bitmap.scaleY = frame.size.height / AWE.Config.MAPPING_TILE_SIZE;
          bitmap.x = frame.origin.x;
          bitmap.y = frame.origin.y;
        }
        else {
          var pos = mc2vc(view.position());        
          bitmap.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
          bitmap.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
        }        
        bitmap.alpha = alpha;
        layer.addChild(bitmap);
      }
    }

    that.toString = function() {
    };
      
    that.update = function() {
      _layer0.update();
      _layer1.update();
      _layer2.update();
    };
    
    that.init = function(startRectMC) {
      windowSize = AWE.Geometry.createSize($(window).width(), $(window).height());
      
      _canvas0.width = windowSize.width;
      _canvas0.height = windowSize.height;
    
      _canvas1.width = windowSize.width;
      _canvas1.height = windowSize.height;
    
      _canvas2.width = windowSize.width;
      _canvas2.height = windowSize.height;    

      mc2vcScale = 1. * windowSize.width / startRectMC.size.width;
      mc2vcTrans = AWE.Geometry.createPoint(
        -1. * startRectMC.origin.x * windowSize.width / startRectMC.size.width,
        -1. * startRectMC.origin.y * windowSize.height / startRectMC.size.height
      );
    };
    
    var level = function() {
      var level = 0;
      var rootWidthVC = mc2vc(module.rootNode.frame().size.width);
      
      while (rootWidthVC > AWE.Config.MAP_MIN_VISIBLE_TILES * 2) {
        level++;
        rootWidthVC /= 2;
      }      
      
      return level;
    };
    
    var fortressViews = {};
    var regionViews = {};
    
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
            
      if(AWE.Map.Manager.isInitialized()) {
        
        frame++;
        
        var rect = AWE.Geometry.createRect(0, 0, windowSize.width, windowSize.height);
        
        $('#debug2').text('mc2vcScale: ' + mc2vcScale);
               
        var nodes = AWE.Map.getNodesInAreaAtLevel(module.rootNode, vc2mc(rect), level(), false, needRedraw);
        
        if (frame % 30 == 0) {
          if (! requestingMapNodesFromServer &&
              AWE.Map.numMissingNodesInAreaAtLevel(module.rootNode, vc2mc(rect), level()) > 0) {
                
            requestingMapNodesFromServer = true;
            log('requesting more nodes for level: ' + level());
            AWE.Map.Manager.fetchNodesForArea(vc2mc(rect), level(), function() {
              requestingMapNodesFromServer = false;
              that.updateView();
            })
          }
        };
        
        if ((frame+15) % 30 == 0) {
          if (! requestingMapNodesFromServer) {
            AWE.Map.Manager.fetchMissingRegionsForArea(module.rootNode, vc2mc(rect), level(), function() {
              that.updateView();
            })
          }
        };
        
        // render layer0
        for (var i = 0; i < nodes.length; i++) {
          if (!fortressViews[nodes[i].id()] || fortressViews[nodes[i].id()].isUpdated()) {            
            fortressViews[nodes[i].id()] = createRegionView(i, nodes[i].frame(), nodes[i].isLeaf(), _layer0);
          }
        }
        
        _layer0.removeAllChildren();
        
        for (var i = 0; i < fortressViews.length; i++) {
          fortressView


        
        
        
        
        
        
                
        // log('count', nodes.length);
        if (needRedraw) {
          // reload regions
          _layer1.removeAllChildren();
          _layer2.removeAllChildren();

          regionViews = [];
          fortressViews = [];

          for(var i = 0; i < nodes.length; i++) {
            
            // regionViews[i]  = module.createRegionView(i, nodes[i].frame(), nodes[i].isLeaf(), _layer0);
            // regionViews[i].redraw();
//             
            // if (nodes[i].isLeaf()) {
//               
              // // voruebergehend zum Testen 
              // fortressViews[i] = module.createFortressView(i, nodes[i].frame(), _layer1);                           
              // fortressViews[i].redraw();
            // }

            regionViews[i]  = module.createRegionView(i, nodes[i].frame(), nodes[i].isLeaf());
            that.addView(regionViews[i], _layer0);
            
            if (nodes[i].isLeaf()) {
              
              // voruebergehend zum Testen 
              fortressViews[i] = module.createFortressView(i, nodes[i].frame());                           
              that.addView(fortressViews[i], _layer1);
            }            
          }
        
          needRedraw = false;
        }
      }

      // update region canvas to repaint
      that.update();
            
      // and repeat from beginning
      // if(!AWE.Map.Manager.isInitialized()) 
        window.requestAnimFrame(that.render);
    };
    
    var scrollingStarted = false;
    
    $('#layers').mouseup(function(evt){
      if (!scrollingStarted) {
        if (_layer2.hitTest(evt.pageX, evt.pageY)) {
          log('klick layer2', _layer2.getObjectUnderPoint(evt.pageX, evt.pageY));
          if (_layer2.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo) {
            _layer2.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo();
          }
          // View finden und feuern
        }
        else if (_layer1.hitTest(evt.pageX, evt.pageY)) {
          log('klick layer1', _layer1.getObjectUnderPoint(evt.pageX, evt.pageY));
          var obj = _layer1.getObjectUnderPoint(evt.pageX, evt.pageY);
          if (obj) {
            fortressViews[obj.name].showInfo();
          }
        }
        else if (_layer0.hitTest(evt.pageX, evt.pageY)) {
          log('klick layer0', _layer0.getObjectUnderPoint(evt.pageX, evt.pageY));
          if (_layer0.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo) {
            _layer0.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo();
          }
        }
      }
      else {
        scrollingStarted = false;
      }
    });

    
    // scrolling
    $('#layers').mousedown(function(evt) {
             
      var clickPosVC = AWE.Geometry.createPoint(evt.pageX, evt.pageY);
      var vcStart = mc2vcTrans.copy();
      
      $('#layers').mousemove(function(ev) {
        
        scrollingStarted = true;
        
        var pos = AWE.Geometry.createPoint(vcStart.x + ev.pageX - clickPosVC.x, vcStart.y + ev.pageY - clickPosVC.y);        
        mc2vcTrans.moveTo(pos);

        that.updateView();
      });
      
      $('body').mouseup(function(ev) {
        $('#layers').unbind('mousemove');
      });      

      $('body').mouseleave(function(ev) {
        $('#layers').unbind('mousemove');
      });      
    });
    
    // zooming with mousewheel
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
    
    that.zoom = function(dScale, zoomin) {
      
      // TODO: calc max and min zoom value
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
        
        that.updateView();
    };      

    
    $(window).resize(function(){
      that.updateView();
    });
    
    return that;
  }());  
  

  /*** initializer ***/
    
  module.init = function() {
          
    AWE.Network.init();
    AWE.Map.Manager.init(2, function(){
      module.rootNode = AWE.Map.Manager.rootNode();
      log('rootNode', module.rootNode.toString());      
    });    
    
    AWE.UI.Map.init(AWE.Geometry.createRect(-30000000,-30000000,60000000,60000000));
    AWE.UI.Map.render();
  };
    
  return module;
    
}(AWE.UI || {}));


$(function(){
  AWE.UI.init();
  $('#zoomin').click(function(){AWE.UI.Map.zoom(.1, true)});
  $('#zoomout').click(function(){AWE.UI.Map.zoom(.1, false)});
});



