/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  /*** Map ***/  
  module.Map = (function() {
  
    var that = {};
        
    var windowSize;
    
    var mc2vcScale;
    var mc2vcTrans;
    
    that.selectedView = false;
    
    that.mc2vc = function(obj) {
      
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
    _layer0.onClick = function() {
      if (that.selectedView && that.selectedView.unselect) {
        that.selectedView.unselect();
      }
    };
   
    var _canvas1 = $('#layer1')[0];
    var _layer1 = new Stage(_canvas1);
    _layer1.enableMouseOver()
    
    var _canvas2 = $('#layer2')[0];
    var _layer2 = new Stage(_canvas2);
    _layer2.enableMouseOver()
        
    var startTime = 0;
    var numFrames = 0;
    var fps = 60;
    var frame = 0;
    var requestingMapNodesFromServer = false;
    var needRedraw;
    
    that.updateView = function() {
      needRedraw = true;
    }
    
    that.toString = function() {
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
      var rootWidthVC = AWE.UI.Map.mc2vc(module.rootNode.frame().size.width);
      
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
      var alpha = 0.05; // smoothing factor
      if (startTime > 0) {
        fps = fps * (1.0-alpha) + (1000.0 / (now-startTime)) * alpha;
        $('#debug').text(Math.round(fps));
      }
      startTime = now;
      
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
            // log('requesting more nodes for level: ' + level());
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
        
        if ((frame % 30 == 0)) {
          if (! requestingMapNodesFromServer) {

            for (var i=0; i < nodes.length; i++) {
              if (nodes[i].isLeaf() && nodes[i].region() && !nodes[i].region().locations() && nodes[i].level() <= level()-2) {
                AWE.Map.Manager.fetchLocationsForRegion(nodes[i].region(), function() {
                  that.updateView();
                });
              }
            }
          }
        };
        
        var view;
        
        if (needRedraw) {
          //log('level', level());
       
          // layer0: regions
          // create new viewHash
          var newRegionViews = {};          
          // fill new viewHash with all visible, old an new views
          for (var i = 0; i < nodes.length; i++) {
            // if view is already created and did not change
            view = regionViews[nodes[i].id()];
            if (view && view.lastChange() >= nodes[i].lastChange()) {              
              newRegionViews[nodes[i].id()] = view;
            }
            else {
              newRegionViews[nodes[i].id()] = module.createRegionView(nodes[i], _layer0);
            }
          }
          // new hash is old hash
          regionViews = newRegionViews;        
          // clear layer0
          _layer0.removeAllChildren();
          // redraw all views in viewHash        
          for (var id in regionViews) {
             regionViews[id].redraw();
          }
          _layer0.update();
          
          // layer 1: locations
          var newFortressViews = {}
          for (var i = 0; i < nodes.length; i++) {
            if (view = fortressViews[nodes[i].id()]) { // und nicht geändert
              newFortressViews[nodes[i].id()] = view;
            }
            else if (nodes[i].isLeaf() && nodes[i].region()) {
              newFortressViews[nodes[i].id()] = module.createFortressView(nodes[i], _layer1);     
            }
          }
          fortressViews = newFortressViews;
          _layer1.removeAllChildren();
          for (var id in fortressViews) {
             fortressViews[id].redraw();
          }
          _layer1.update();
          
          
          // old flag, TODO remove?
          needRedraw = false;
        }
      }

      // and repeat from beginning
      // if(!AWE.Map.Manager.isInitialized()) 
    };
    
    var scrollingStarted = false;
    
    // click-events in layers
    $('#layers').mouseup(function(evt){
      if (!scrollingStarted) {
        var cObj;
        if (_layer2.hitTest(evt.pageX, evt.pageY)) {
          //
        }
        else if (_layer1.hitTest(evt.pageX, evt.pageY)) {
          cObj = _layer1.getObjectUnderPoint(evt.pageX, evt.pageY);
          if (cObj && cObj.onClick) {
            cObj.onClick();
          }
        }
        else if (_layer0.hitTest(evt.pageX, evt.pageY)) {
          if (_layer0.onClick) {
            _layer0.onClick(evt);
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
      
  return module;
    
}(AWE.UI || {}));




