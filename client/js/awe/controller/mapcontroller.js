/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createMapController = function(anchor) {
    
    var _stages = new Array(3);  ///< three easelJS stages for displaying background, objects and HUD
    var _canvas = new Array(3);  ///< canvas elements for the three stages

    var _selectedView = null;    ///< there can be only one selected view!
    
    var _windowSize = null;      ///< size of window in view coordinates
    var _mc2vcScale;             ///< scaling
    var _mc2vcTrans;             ///< translation

    var _needsLayout;            ///< true, in case e.g. the window has changed, causing a new laoyut of the map
    var _needsDisplay;           ///< true, in case something (data, subwview) has changed causing a need for a redraw
    
    var _scrollingStarted = false;///< user is presently scrolling
    var _scrollingStartedAtVC;
    var _scrollingOriginalTranslationVC;
    
    var that = module.createScreenController(anchor); ///< create base object
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    
    var _loopCounter = 0;        ///< counts every cycle through the loop
    var _frameCounter = 0;       ///< counts every rendered frame
    
    var _modelChanged = false;
    
    var requestingMapNodesFromServer = false;
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** intializes three stages for displaying the map-background,
     * the playing pieces (armies, fortresses, settlements), and 
     * the HUD. */
    that.init = function(initialFrameModelCoordinates) {
      _super.init();
      
      // background layer, displays region tiles
      that.anchor().append('<canvas id="layer0"></canvas>');
      _canvas[0] = $('#layer0')[0];
      _stages[0] = new Stage(_canvas[0]);
      _stages[0].onClick = function() {   // click into background unselects selected object
        if (_selectedView && _selectedView.unselect) {
          _selectedView.unselect();
        }
      };
   
      // selectable gaming pieces layer (fortresses, armies, etc.)
      that.anchor().append('<canvas id="layer1"></canvas>');
      _canvas[1] = $('#layer1')[0];
      _stages[1] = new Stage(_canvas[1]);
      _stages[1].enableMouseOver();
      
      // HUD layer ("static", not zoomable, not moveable)
      that.anchor().append('<canvas id="layer2"></canvas>');
      _canvas[2] = $('#layer2')[0];
      _stages[2] = new Stage(_canvas[2]);
      _stages[2].enableMouseOver();

      // disable onMouseOver for stage1 when onMouseOver on stage2 is active          
      _stages[2].onMouseOver = function() {
        log('onmouseover');
        _stages[1].enableMouseOver(0);     
      };
  
      _stages[2].onMouseOut = function() {
        log('onmouseout');
        _stages[1].enableMouseOver();
      };
      
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setViewport(initialFrameModelCoordinates);
      that.setNeedsLayout();
      
      // register controller to receive window-resize events (from browser window) 
      // in order to adapt it's own window / display area
      $(window).resize(function(){
        that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      });
      
      // register controller to receive click events in screen
      $('#layers').click(function(evt) {
        that.handleClick(evt);
      });
      
      // register controller to receive mouse-down events in screen
      $('#layers').mousedown(function(evt) {
        that.handleMouseDown(evt);
      });
      
      // register controller to receive mouse-wheel events in screen
      $(window).bind('mousewheel', function() {
        that.handleMouseWheel();
      });
    };
        
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Coordinate Transformation
    //
    // ///////////////////////////////////////////////////////////////////////

    /** transform model coordinates to view coordinates. accepts points, 
     * rectangles and size for transformation. */
    that.mc2vc = function(obj) {
      
      // if obj is rect
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

    /** transform view coordinates to model coordinates */
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
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Map: Viewport, Visible area, etc.
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** sets the canvas' width and height, sets-up the internal coordinate
     * systems */
    that.setWindowSize = function(size) {
      if (! _windowSize || _windowSize.width != size.width || _windowSize.height != size.height) {
        _windowSize = size;
        that.setNeedsLayout(); 
      }
    };
    
    /** returns the window size (canvas internal view coordinates). */
    that.windowSize = function() { return _windowSize; };
    
    /** sets the map to display the specified region (in model coordinates).
     */
    that.setViewport = function(visibleRectMC) {
      mc2vcScale = 1. * _windowSize.width / visibleRectMC.size.width;
      mc2vcTrans = AWE.Geometry.createPoint(
        -1. * visibleRectMC.origin.x * _windowSize.width  / visibleRectMC.size.width,
        -1. * visibleRectMC.origin.y * _windowSize.height / visibleRectMC.size.height
      );
    }
    
    /** zoom in and out. */
    that.zoom = function(dScale, zoomin) {
      // TODO: calc max and min zoom value
      var scale = 1 + dScale;
      var center = AWE.Geometry.createPoint(-_windowSize.width / 2, -_windowSize.height / 2);
      var centerInv = AWE.Geometry.createPoint(_windowSize.width / 2, _windowSize.height / 2);
  
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
    
    /** calculate and returns the presently visible map level in dependence of the
     * present scale. Uses memoization to cache result. */
    var level = (function() {
      
      var _level = null;
      var _memRootNodeWidth;
      var _memMc2vcScale;
      
      return function() {
        if (_level && _memRootNodeWidth === AWE.Map.Manager.rootNode().frame().size.width && _memMc2vcScale === mc2vcScale) {
          return _level;
        }
        else {
          _level = 0;
          _memRootNodeWidth = AWE.Map.Manager.rootNode().frame().size.width;
          _memMc2vcScale = mc2vcScale;
          var rootWidthVC = that.mc2vc(_memRootNodeWidth);
      
          while (rootWidthVC > AWE.Config.MAP_MIN_VISIBLE_TILES * 2) {
            _level++;
            rootWidthVC /= 2;
          }
          return _level;
        }
      }      
    }());
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Laying out the Map
    //
    // ///////////////////////////////////////////////////////////////////////   
    
    /** set to true in case the window needs to be layouted again (e.g. after
     * a resize event). */
    that.setNeedsLayout = function() { _needsLayout = true; }    
    
    /** reset the size of the "window" (canvas) in case its dimension has 
     * changed. */
    that.layoutIfNeeded = function() {
      if (_needsLayout) {
        if (_canvas[0].width != _windowSize.width || _canvas[0].height != _windowSize.height) {
          _canvas[0].width  = _windowSize.width;
          _canvas[0].height = _windowSize.height;
    
          _canvas[1].width  = _windowSize.width;
          _canvas[1].height = _windowSize.height;
    
          _canvas[2].width  = _windowSize.width;
          _canvas[2].height = _windowSize.height;             
        };
        that.setNeedsDisplay();
      };
      _needsLayout = false;
    }
    
    /** set to true in case the whole window needs to be repainted. */
    that.setNeedsDisplay = function() { _needsDisplay = true; }
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Over and Object Selection
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    /** returns the single map view that is presently selected by the user. 
     * this can be any of the gaming pieces (armies), markers or settlements.*/
    that.selectedView = function() {
      return _selectedView;
    };
    
    /** sets the selected view */
    that.setSelectedView = function(view) {
      _selectedView = view;
    };
        
    that.handleClick = function(evt) {
      if (!_scrollingStarted) {
        var cObj;
        if (_stages[2].hitTest(evt.pageX, evt.pageY)) {
        //
        }
        else if (_stages[1].hitTest(evt.pageX, evt.pageY)) {
          cObj = _stages[1].getObjectUnderPoint(evt.pageX, evt.pageY);
          if (cObj && cObj.onClick) {
            cObj.onClick();
          }
        }
        else if (_stages[0].hitTest(evt.pageX, evt.pageY)) {
          if (_stages[0].onClick) {
            _stages[0].onClick(evt);
          }         
        }
      }
      else {
        _scrollingStarted = false;
      }
    }
    
    that.handleMouseDown = function(evt) {
             
      _scrollingStartedAtVC = AWE.Geometry.createPoint(evt.pageX, evt.pageY);
      _scrollingOriginalTranslation = mc2vcTrans.copy();
      
      $('#layers').mousemove(function(ev) {
        that.handleMouseMove(ev);
      });
      
      $('body').mouseup(function() {
        $('#layers').unbind('mousemove');
      });      

      $('body').mouseleave(function() {
        $('#layers').unbind('mousemove');
      });      
    };
    
    that.handleMouseMove = function(event) {
      // here we can assume, that the mouse is pressed right now!
      _scrollingStarted = true;
      var pos = AWE.Geometry.createPoint(_scrollingOriginalTranslation.x + event.pageX - _scrollingStartedAtVC.x, 
                                         _scrollingOriginalTranslation.y + event.pageY - _scrollingStartedAtVC.y);        
      mc2vcTrans.moveTo(pos);
      that.setNeedsLayout();
    };
    
    that.handleMouseWheel = function(ev) {
      var event = ev || window.event;
      
      var delta = 0;
      
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
        that.zoom(0.04 * Math.abs(delta), delta > 0);
      }

      /** Prevent default actions caused by mouse wheel.
       * That might be ugly, but we handle scrolls somehow
       * anyway, so don't bother here..
       */
      if (event.preventDefault) {
        event.preventDefault();
      }
      event.returnValue = false;
    };
    

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Serialization, inspection & debugging
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.toString = function() {};


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Remote Data Handling
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    
    that.modelChanged = function() {
      return _modelChanged;
    }
    
    that.setModelChanged = function() {
      _modelChanged = true;
    }
    
    that.updateModel = (function() {
      
      var previousVisibleAreaMC = null;
      
      var viewportHasChanged = function(rect) {
        return (!previousVisibleAreaMC && rect) || !previousVisibleAreaMC.equals(rect);
      };
      
      return function(visibleAreaMC) {
        
        //console.log('update model ' + visibleAreaMC + ' changed: ' + viewportHasChanged(visibleAreaMC) + ' ongoing: ' + requestingMapNodesFromServer);

        // viewport change -> time to check for the need for additional map nodes.
        if (viewportHasChanged(visibleAreaMC) && !requestingMapNodesFromServer &&
            AWE.Map.numMissingNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level()) > 0) {
                        
          requestingMapNodesFromServer = true;
          AWE.Map.Manager.fetchNodesForArea(visibleAreaMC, level(), function() {
            requestingMapNodesFromServer = false;
            that.setModelChanged();
          });
          
          previousVisisbleAreaMC = visibleAreaMC; 
        }
        
        // in case the viewport has changed or the model has changed (more nodes?!) we need to check for missing regions.
        if ((viewportHasChanged(visibleAreaMC) || that.modelChanged()) && ! requestingMapNodesFromServer) {
          
          //requestingMapNodesFromServer = true;
          AWE.Map.Manager.fetchMissingRegionsForArea(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), function() {
            // requestingMapNodesFromServer = false;
            that.setModelChanged();
          });
        }
        
        // in case the viewport has changed or the model has changed (more nodes or regions?!) we need to check for missing locations.
        if ((viewportHasChanged(visibleAreaMC) || that.modelChanged()) && ! requestingMapNodesFromServer) {

          var nodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, that.modelChanged()); // this is memoized, no problem to call it twice in one cycle!

          for (var i=0; i < nodes.length; i++) {
            if (nodes[i].isLeaf() && nodes[i].region() && !nodes[i].region().locations() && nodes[i].level() <= level()-2) {
              AWE.Map.Manager.fetchLocationsForRegion(nodes[i].region(), function() {
                that.setModelChanged();
              });
            }
          }
        }
      };
    }());
    

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Rendering
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    var startTime = 0;
    var numFrames = 0;
    var fps = 60;
    var needRedraw; // TODO: remove this flag.
    
    that.updateView = function() { needRedraw = true; } // TODO: completely remove this method, replaced by setNeedsDisplay
    
    var fortressViews = {};
    var regionViews = {};
    
    that.render = function(nodes) {
      
      // calculate fps
      var now = +new Date();
      var alpha = 0.2; // smoothing factor
      if (startTime > 0) {
        fps = fps * (1.0-alpha) + (1000.0 / (now-startTime)) * alpha;
        $('#debug').text(Math.round(fps));
      }
      startTime = now;        
      _frameCounter++;
        
      // layer0: regions
      // create new viewHash
      var newRegionViews = {};          
      // fill new viewHash with all visible, old an new views
      for (var i = 0; i < nodes.length; i++) {
        // if view is already created and did not change
        view = regionViews[nodes[i].id()];
        if (view) {              
          newRegionViews[nodes[i].id()] = view;
          /*if (view.lastChange() < nodes[i].lastChange()) {
            view.updateView();
          }*/
        }
        else {
          newRegionViews[nodes[i].id()] = view = AWE.UI.createRegionView(nodes[i], _stages[0], that);
                //add to layer
          _stages[0].addChild(view.container());
          _stages[0].addChild(view.nonScalingContainer());
        }
      }
      //console.log( 'num children before remove: ' + _stages[0].getNumChildren() );
      for (var k in regionViews) {
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (regionViews.hasOwnProperty(k) && !newRegionViews[k]) {
          var v = regionViews[k];
          _stages[0].removeChild(v.container(), v.nonScalingContainer());
        }
      }
      //console.log( 'num children after remove: ' + _stages[0].getNumChildren() );
      
      // new hash is old hash
      regionViews = newRegionViews;        
      // clear _stages[0]
      //_stages[0].removeAllChildren();
      // redraw all views in viewHash        
      for (var id in regionViews) {
         regionViews[id].redraw();
      }
      _stages[0].update();
      
      // layer 1: locations
      var newFortressViews = {}
      for (var i = 0; i < nodes.length; i++) {
        if (view = fortressViews[nodes[i].id()]) { // und nicht geändert
          newFortressViews[nodes[i].id()] = view;
        }
        else if (nodes[i].isLeaf() && nodes[i].region()) {
          newFortressViews[nodes[i].id()] = AWE.UI.createFortressView(nodes[i], _stages[1], that);     
        }
      }
      fortressViews = newFortressViews;
      _stages[1].removeAllChildren();
      for (var id in fortressViews) {
         fortressViews[id].redraw();
      }
      //locations
      ///TODO don't recreate
      var newLocationViews = {};
      for (var i = 0; i < nodes.length; i++) {
        newLocationViews[nodes[i].id()] = AWE.UI.createLocationsView(nodes[i], _stages[1], that);
        newLocationViews[nodes[i].id()].redraw();
      }

      _stages[1].update();

      _stages[2].removeAllChildren();          
      AWE.UI.createMaincontrolsView(_windowSize, _stages[2], that).redraw();
      AWE.UI.createDetailView(_windowSize, _stages[2], that).redraw();
      _stages[2].update();
                
    };    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    

    that.runloop = function() {
      if(AWE.Map.Manager.isInitialized()) {
        
        var visibleArea = vc2mc(AWE.Geometry.createRect(0, 0, _windowSize.width,_windowSize.height));
        
        that.updateModel(visibleArea);
        that.layoutIfNeeded();   
        
        if (needRedraw || _needsDisplay || _loopCounter % 30 == 0 || that.modelChanged()) {
          var visibleNodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleArea, level(), false, that.modelChanged());
          that.render(visibleNodes);
        }

        _modelChanged = false;
        needRedraw = false;   // TODO: completely remove this flag and method (replaced by setNeedsDisplay, and setNeedsLayout)
        _needsDisplay = false;
        _needsLayout = false;
      }
      _loopCounter++;
    };
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



