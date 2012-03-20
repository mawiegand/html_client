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
    
    _view.click = function(){
      log('View.click()');
    };
    
    _view.redraw = function() {
      log('redraw', _view);
    };
    
    AWE.Partials.addChangeTracking(_view);
    
    return _view;
  };

  module.createStreets = function(_node, _view) {

    var that = {};
    
    var _node = _node;
    var _container = new Container();
    var _view = _view;

    that.container = function() { return _container; }

    that.redraw = function () {
      _container.removeAllChildren();

      var frame = _node.frame();
      var transformedFrame = AWE.UI.Map.mc2vc(_node.frame());

      if (_node.isLeaf() && _view.detailLevel() > 0) {
        var neighbours = _node.getNeighbourNodes();
        var start = {
          x: transformedFrame.size.width / 2,
          y: transformedFrame.size.height / 2
        };

        var _text = new Text();
        _text.font = "12px Arial";
        _text.x = transformedFrame.size.width / 2;
        _text.textBaseline = "top";
        _text.y = transformedFrame.size.height -50;

        _text.text = neighbours.length.toString();
        that.container().addChild(_text);

        for (var i = 0; i < neighbours.length; i++) {
          //get direction
          var iFrame = neighbours[i].frame();
          var dir = {
            x: iFrame.origin.x + iFrame.size.width/2 - frame.origin.x - frame.size.width/2,
            y: iFrame.origin.y + iFrame.size.height/2 - frame.origin.y - frame.size.height/2
          };

          if (Math.abs(dir.x) > Math.abs(dir.y)) {
            if (dir.x > 0) dir.x = transformedFrame.size.width / 2;
            if (dir.x < 0) dir.x = transformedFrame.size.width / -2;
            dir.y = 0;
          } else {
            if (dir.y > 0) dir.y = transformedFrame.size.height / 2;
            if (dir.y < 0) dir.y = transformedFrame.size.height / -2;
            dir.x = 0;
          }

          if (neighbours[i].level() == _node.level() && !neighbours[i].isLeaf()) {
            var extraDir = {x: dir.y/2, y: dir.x/2};

            var shape = new Shape();
            shape.graphics.beginStroke("#444")
              .moveTo(start.x, start.y)
              .lineTo(start.x + dir.x + extraDir.x, start.y + dir.y + extraDir.y)
              .endStroke()
              .closePath();
            that.container().addChild(shape);

            shape = new Shape();
            shape.graphics.beginStroke("#444")
              .moveTo(start.x, start.y)
              .lineTo(start.x + dir.x - extraDir.x, start.y + dir.y - extraDir.y)
              .endStroke()
              .closePath();
            that.container().addChild(shape);

          } else {
            var shape = new Shape();
            shape.graphics.beginStroke("#444")
              .moveTo(start.x, start.y)
              .lineTo(start.x + dir.x, start.y + dir.y)
              .endStroke()
              .closePath();

            that.container().addChild(shape);
          }
        }
      }

    }

    return that;
  }

  module.createRegionView = function(_node, _layer) {
    
    var spec = {
      id: _node.id(),
      frame: _node.frame(),
      scaled: true,
      layer: _layer
    };
    
    var _view = module.createView(spec);
    _view.container().name = _view.id();
    _view.container().onClick = function (evt) {
      log('klick in container layer0');
    };

    var image = null;
    var _bgBitmap =null;
    
    console.log('creating new view for node ' + _node.path());

    var selectBackgroundImage = function(detail) {
      var newImage = null;
      
      var size = '128';
      if (detail > 0) {
          size = '256';
      }
        /*else if (detail > 1) {
          size = '512';
        }*/
      
      if (!_node.isLeaf()) {       // not a leaf node, splits further
        newImage = AWE.UI.ImageCache.getImage("map/tiles/split"+size);
      }
      else if (_node.region()) {   // terrain available, select appropriate tile
        if (_node.region().terrainId() < 2) {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/forest"+size);      
        }
        else {
          newImage = AWE.UI.ImageCache.getImage("map/tiles/plain"+size);              
        }
      }
      else {                       // don't know terrain, yet. thus, select base tile
        newImage = AWE.UI.ImageCache.getImage("map/tiles/base"+size);
      }
      
      if (newImage != image) {
        image = newImage;
        if (_bgBitmap) {
          _view.container().removeChildAt(0);
        }
        _bgBitmap = new Bitmap(image);
        _view.container().addChildAt(_bgBitmap, 0);
      }    
    };
    
    selectBackgroundImage(0);

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
    _text.text = _node.id().toString();
    _nonScalingContainer.addChild(_text);

    //streets
    var streets = module.createStreets(_node, _view);
    _nonScalingContainer.addChild(streets.container());

    _view.position = function() {
      return _view.frame().origin;
    };
    
    _view.detailLevel = function() {
      var frame = AWE.UI.Map.mc2vc(_view.frame());      
      if (frame.size.width < 128) {
        return 0;
      }
      else if (frame.size.width < 256) {
        return 1;
      }
      else if (frame.size.width < 512) {
        return 2;
      }
      else {
        return 3;
      }
    }

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      //check for correct background image
      selectBackgroundImage(_view.detailLevel());

      
      //scaling container
      container.scaleX = frame.size.width / _bgBitmap.image.width;
      container.scaleY = frame.size.height / _bgBitmap.image.height;
      container.x = frame.origin.x;
      container.y = frame.origin.y;
      
      container.alpha = alpha;

      //non scaling container
      _nonScalingContainer.x = frame.origin.x;
      _nonScalingContainer.y = frame.origin.y;

      _nonScalingContainer.alpha = alpha;

      //streets
      streets.redraw();

      //add to layer
      _view.layer().addChild(container);
      _view.layer().addChild(_nonScalingContainer);
    };

    _view.unselect = function() {
      log('unselect');
      _selected = false;
      module.Map.selectedView = null;
      _view.container().removeChildAt(1);
      module.Map.updateView();
    }
            
    return _view;
  };
  
  module.createFortressView = function(_node, _layer) {

    var spec = {
      id: _node.id(),
      alphaMin: AWE.Config.MAPPING_FORTRESS_SIZE + 20,
      alphaMax: AWE.Config.MAPPING_FORTRESS_SIZE * 2,
      frame: _node.frame(),
      scaled: false,
      layer: _layer
    };
    
    var _view = module.createView(spec);

    var _selected = false;
    var _mouseover = false;
    
    
    if (!_node.region()) {
      console.log('ERROR: should create fortress for node ' + _node.path() + ' but region information is missing!');
    }
    
    var fortressImageName = 'map/fortress/small';
    if (_node.region() && _node.region().fortressLevel() > 3) {
      fortressImageName = 'map/fortress/middle';
    }
    if (_node.region() && _node.region().fortressLevel() > 7) {
      fortressImageName = 'map/fortress/large';
    }
    
    _fieldBitmap = new Bitmap(AWE.UI.ImageCache.getImage(fortressImageName));

    _fieldBitmap.onClick = function(evt) {
      log('selected', _selected);
      if (_selected) {
        _view.unselect();
      }
      else {
        _view.select();
      }
    };
    _fieldBitmap.onMouseOver = function(evt) {
      _mouseover = true;
    };
    _fieldBitmap.onMouseOut = function(evt) {
      _mouseover = false;
      // _view.container().removeChildAt(2);
    };
    
    var _easementBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/easement"));
    var _buttonBitmap = new Bitmap(AWE.UI.ImageCache.getImage("map/button"));
    
    _view.position = function() {
      return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    };

    _view.redraw = function() {

      var frame = AWE.UI.Map.mc2vc(_view.frame());
      var alpha = _view.alpha(frame.size.width);
      var container = _view.container();
      
      container.addChildAt(_fieldBitmap, 0);
      if (_selected) {
        _buttonBitmap.x = -AWE.Config.MAPPING_FORTRESS_SIZE;
        _buttonBitmap.y = +AWE.Config.MAPPING_FORTRESS_SIZE / 2;
        container.addChildAt(_buttonBitmap, 1);
      }
      if (_mouseover) {
        _easementBitmap.y = -AWE.Config.MAPPING_FORTRESS_SIZE;
        container.addChildAt(_easementBitmap, 2);
      }

      var pos = AWE.UI.Map.mc2vc(_view.position());        
      container.x = pos.x - AWE.Config.MAPPING_FORTRESS_SIZE / 2;
      container.y = pos.y - AWE.Config.MAPPING_FORTRESS_SIZE / 1.4;
      container.alpha = alpha;

      _view.layer().addChild(container);
    };

    _view.select = function() {
      log('select', _view.id());
      if (module.Map.selectedView && module.Map.selectedView.unselect) {
        module.Map.selectedView.unselect();
      }
      _selected = true;
      module.Map.selectedView = _view;
      module.Map.updateView();
    }
    
    _view.unselect = function() {
      log('unselect', _view.id());
      _selected = false;
      module.Map.selectedView = null;
      _view.container().removeChildAt(1);
      module.Map.updateView();
    }
    
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
    
    var _canvas2 = $('#layer2')[0];
    var _layer2 = new Stage(_canvas2);
        
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
          log('level', level());
       
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
        window.requestAnimFrame(that.render);
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
            log('klick');
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



