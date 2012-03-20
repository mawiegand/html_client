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

    var _layer = spec.layer || null;
    var _container = new Container();
    
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

    _view.layer = function() {
      return _layer;
    }

    _view.container = function() {
      return _container;
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
    
    AWE.Partials.addChangeTracking(_view);
    
    return _view;
  };

  module.addStreets = function(_view) {

  }

  module.createRegionView = function(_id, _frame, _isLeaf, _layer) {

    var spec = {
      id: _id,
      frame: _frame,
      scaled: true,
      layer: _layer
    };
    
    var _view = module.createView(spec);
    _view.container().name = _view.id();

    var _bgBitmap = new Bitmap(_isLeaf ? AWE.UI.ImageCache.getImage("map/leaf") : AWE.UI.ImageCache.getImage("map/region"));
    _view.container().addChild(_bgBitmap);

    var _nonScalingContainer = new Container();

    //icon demo
    var _iconBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/region/icon"));
    _iconBitmap.x = 0;
    _iconBitmap.y = 0;
    _nonScalingContainer.addChild(_iconBitmap);

    //text demo
    var _text = new Text();
    _text.font = "12px Arial";
    _text.x = _iconBitmap.image.width;
    _text.textBaseline = "top";
    _text.y = _iconBitmap.image.height/2 - _text.getMeasuredLineHeight()/2;

    _text.maxWidth = _bgBitmap.image.width-_iconBitmap.image.width;
    _text.text = _id.toString();
    _nonScalingContainer.addChild(_text);

    //done
    module.addStreets(_view);

    _view.position = function() {
      return _view.frame().origin;
    };

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container()

      //scaling container
      container.scaleX = frame.size.width / AWE.Config.MAPPING_TILE_SIZE;
      container.scaleY = frame.size.height / AWE.Config.MAPPING_TILE_SIZE;
      container.x = frame.origin.x;
      container.y = frame.origin.y;
      
      container.alpha = alpha;

      //non scaling container
      _nonScalingContainer.x = frame.origin.x;
      _nonScalingContainer.y = frame.origin.y;

      _nonScalingContainer.alpha = alpha;

      //add to layer
      _view.layer().addChild(container);
      _view.layer().addChild(_nonScalingContainer);
    };
        
    return _view;
  };
  
  module.createFortressView = function(_id, _frame, _layer) {

    var spec = {
      id: _id,
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: _frame,
      scaled: false,
      layer: _layer
    };
    
    var _view = module.createView(spec);
    _view.container().name = _view.id();

    var _fieldBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/fortress"));
    _view.container().addChild(_fieldBitmap);

    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();

      if (_view.isScaled()) {
        container.scaleX = frame.size.width / AWE.Config.MAPPING_TILE_SIZE;
        container.scaleY = frame.size.height / AWE.Config.MAPPING_TILE_SIZE;
        container.x = frame.origin.x;
        container.y = frame.origin.y;
      }
      else {
        var pos = AWE.UI.Map.mc2vc(_view.position());        
        container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
        container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      } 
      container.alpha = alpha;

      _view.layer().addChild(container);
    };

    return _view;
  };

  /*** ImageCache ***/
  module.ImageCache = (function () {
    var that = {};

    var _images = {};
    var _outstandingImages = {};

    that.init = function() {}

    that.loadImage = function (name, src) {
      if (name in _images) {
        console.warn("tried to load image '"+name+"' from '"+url+"' but there was already an image by that name");
        return;
      }
      _outstandingImages[name] = src;

      var image = new Image();
      _images[name] = image;
      image.src = src;
      image.onload = function(event) {
        delete _outstandingImages[name];
        log("loaded image", name, src);
      };
    };

    that.allImagesLoaded = function () {
      for (key in _outstandingImages) {
        return false;
      }
      return true;
    };

    that.getImage = function(name) {
      if (!(name in _images)) {
        console.error("tried to get the image with the name '"+name+"' that has no cache entry");
      }
      return _images[name];
    }

    return that;
  }());
  
  
  /*** Map ***/
  
  module.Map = (function() {
  
    var that = {};
        
    var windowSize;
    
    var mc2vcScale;
    var mc2vcTrans;
    
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
        
        var view;
        
        if (needRedraw) {
          log('level', level());
       
          // layer0: regions
          // create new viewHash
          var newRegionViews = {};          
          // fill new viewHash with all visible, old an new views
          for (var i = 0; i < nodes.length; i++) {
            // if view is already created and did not change
            view = regionViews[nodes[i].id()];
            if (view && view.lastChange() < nodes[i].lastChange()) {
              newRegionViews[nodes[i].id()] = view;
            }
            else {
              newRegionViews[nodes[i].id()] = module.createRegionView(i, nodes[i].frame(), nodes[i].isLeaf(), _layer0);
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
            else if (nodes[i].isLeaf()) {
              newFortressViews[nodes[i].id()] = module.createFortressView(i, nodes[i].frame(), _layer1);     
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
        window.requestAnimFrame(that.render);
    };
    
    var scrollingStarted = false;
    
    // click-events in layers
    $('#layers').mouseup(function(evt){
      if (!scrollingStarted) {
        if (_layer2.hitTest(evt.pageX, evt.pageY)) {
          log('klick layer2', _layer2.getObjectUnderPoint(evt.pageX, evt.pageY));
          if (_layer2.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo) {
            _layer2.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo();
          }
        }
        else if (_layer1.hitTest(evt.pageX, evt.pageY)) {
          log('klick layer1', _layer1.getObjectUnderPoint(evt.pageX, evt.pageY));
          var obj = _layer1.getObjectUnderPoint(evt.pageX, evt.pageY);
          if (_layer1.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo) {
            _layer1.getObjectUnderPoint(evt.pageX, evt.pageY).showInfo();
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

    AWE.UI.ImageCache.init();
    for (k in AWE.Config.IMAGE_CACHE_LOAD_LIST) {
      if (AWE.Config.IMAGE_CACHE_LOAD_LIST.hasOwnProperty(k)) {
        AWE.UI.ImageCache.loadImage(k, AWE.Config.IMAGE_CACHE_LOAD_LIST[k]);
      }
    }
    
    
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



