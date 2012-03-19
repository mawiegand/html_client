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
    
    var _pos = spec.pos;
    var _alphaMin = spec.alphaMin;
    var _alphaMax = spec.alphaMax;
        
    var _image = new Image();
    _image.src = spec.imageSrc;
    // _fortressImage.onload = function() {
      // that.updateView();
    // };
    
    _view.alpha = function(val) {
      var alpha = (val - _alphaMin ) / (_alphaMax - _alphaMin);
      
      if (alpha > 1) alpha = 1;
      if (alpha < 0) alpha = 0;
      
      return alpha;      
    };
    
    _view.image = function() {
      return _image;
    };
    
    _view.position = function() {
      return _pos;
    };
    
    return _view;
  };
  
  module.createFortressView = function(frame) {

    var spec = {
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      imageSrc: AWE.Config.MAP_FORTRESS_IMAGE_URL,
      pos: frame.origin
    };
       
    return module.createView(spec);
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
        
    var _regionImage = new Image();
    _regionImage.src = "images/region.png";
    _regionImage.onload = function() {
      that.updateView();
    };
    
    var _leafImage = new Image();
    _leafImage.src = "images/leaf.png";
    _leafImage.onload = function() {
      that.updateView();
    };
    
    var _fortressImage = new Image();
    _fortressImage.src = "images/fortress.png";
    _fortressImage.onload = function() {
      that.updateView();
    };
    
    var _armyImage = new Image();
    _armyImage.src = "images/army.png";
    _armyImage.onload = function() {
      that.updateView();
    };
    

    var date = 0;
    var frame =0;
    var requestingMapNodesFromServer = false;
    var needRedraw;
    
    /*
     * calculates an alpha value between 0 and 1 according to val between min and max
     */
    var locationAlpha = function(min, max, val) {
      var alpha = (val - min ) / (max - min);
      
      if (alpha > 1) {
        alpha = 1;
      }
      
      if (alpha < 0) {
        alpha = 0;
      }
      
      return alpha;      
    };
    
    that.updateView = function() {
      needRedraw = true;
    }

    that.addRegion = function(node) {
            
      var frame = node.frame();
      var frameVC = mc2vc(frame);
      
      var bitmap = new Bitmap(node.isLeaf() ? _leafImage : _regionImage);
      bitmap.name = 'region' + node.path();
      bitmap.x = frameVC.origin.x;
      bitmap.y = frameVC.origin.y;
      bitmap.scaleX = frameVC.size.width / AWE.Config.MAPPING_TILE_SIZE;
      bitmap.scaleY = frameVC.size.height / AWE.Config.MAPPING_TILE_SIZE;
      _layer0.addChild(bitmap);
    };

    that.addFortress = function(node) {
            
      var frame = node.frame();
      var frameVC = mc2vc(frame);
      
      var bitmap = new Bitmap(_armyImage);
      bitmap.name = 'fortress' + node.path();
      bitmap.x = frameVC.origin.x + frameVC.size.width / 2 - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      bitmap.y = frameVC.origin.y + frameVC.size.height / 2 - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      // TODO evtl. Scale anhand des Scale der Region anpassen

      // TODO Alpha-Wert berechnen, um je nach Größe ausblenden zu können      
      var alpha = locationAlpha(AWE.Config.MAPPING_FORTRESS_SIZE + 20, AWE.Config.MAPPING_FORTRESS_SIZE * 2, frameVC.size.width);
      if (alpha > 0) {
        bitmap.alpha = alpha;
        _layer1.addChild(bitmap);
      }
    };
    
    that.addView = function(view, layer) {
      var alpha = 1; //view.alpha();
      
      if (alpha > 0) {
        var bitmap = new Bitmap(view.image());
        var pos = mc2vc(view.position());
        log('position', view.position());
        log('pos', pos);
        bitmap.x = pos.x;
        bitmap.y = pos.y;
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
    
    that.zoom = function(dScale, zoomin) {
      
      // if (zoomin && mc2vcScale < 0.02 || !zoomin && 1 < mc2vcScale) {  // TODO: calc value from maptree
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
      // }
    };
      
    var level = function() {
      // var rootLevel = module.rootNode.frame().size.width * AWE.Config.MAP_MIN_VISIBLE_TILES / windowSize.width;
      var level = 0;
      var rootWidthVC = mc2vc(module.rootNode.frame().size.width);
      
      while (rootWidthVC > AWE.Config.MAP_MIN_VISIBLE_TILES * 2) {
        level++;
        rootWidthVC /= 2;
      }
      
      //log('test', rootWidthVC);
      
      
      return level;
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
        
        // log('count', nodes.length);
        if (needRedraw) {
          // reload regions
          _layer0.removeAllChildren();
          _layer1.removeAllChildren();
          _layer2.removeAllChildren();


          for(var i = 0; i < nodes.length; i++) {
            that.addRegion(nodes[i]);
            if (nodes[i].isLeaf()) {              
              // that.addFortress(nodes[i]);
              that.addView(module.createFortressView(nodes[i].frame()), _layer1);
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

    
    // scrolling
    $('#layers').mousedown(function(evt) {
             
      var clickPosVC = AWE.Geometry.createPoint(evt.pageX, evt.pageY);
      var vcStart = mc2vcTrans.copy();
      
      $('#layers').mousemove(function(ev) {
        
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



