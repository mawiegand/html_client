/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createMapController = function(anchor) {
    
    var _stages = new Array(4);  ///< four easelJS stages for displaying background, objects and HUD
    var _canvas = new Array(4);  ///< canvas elements for the four stages

    var _selectedView = null;    ///< there can be only one selected view!
    
    var _windowSize = null;      ///< size of window in view coordinates
    var mc2vcScale;             ///< scaling
    var mc2vcTrans;             ///< translation

    var _needsLayout;            ///< true, in case e.g. the window has changed, causing a new layuot of the map
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
        if (_selectedView) {
          _unselectFortress();
        }
      };
   
      // selectable gaming pieces layer (fortresses, armies, etc.)
      that.anchor().append('<canvas id="layer1"></canvas>');
      _canvas[1] = $('#layer1')[0];
      _stages[1] = new Stage(_canvas[1]);
      _stages[1].enableMouseOver();
      
      // layer for mouseover and selection objects
      that.anchor().append('<canvas id="layer2"></canvas>');
      _canvas[2] = $('#layer2')[0];
      _stages[2] = new Stage(_canvas[2]);
      
      // HUD layer ("static", not zoomable, not moveable)
      that.anchor().append('<canvas id="layer3"></canvas>');
      _canvas[3] = $('#layer3')[0];
      _stages[3] = new Stage(_canvas[3]);
      _stages[3].enableMouseOver();

      // disable onMouseOver for stage1 when onMouseOver on stage3 (HUD) is active          
      _stages[3].onMouseOver = function() {
        _stages[1].enableMouseOver(0);
        _unhighlightFortress();
      };
  
      _stages[3].onMouseOut = function() {
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
    that.vc2mc = function(obj) {
      
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
        
      that.setNeedsLayout(); 
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
      if (_needsLayout) {   ///// WRONG: no _needsLayout after zooming!!!
        if (_canvas[0].width != _windowSize.width || _canvas[0].height != _windowSize.height) {
          _canvas[0].width  = _windowSize.width;
          _canvas[0].height = _windowSize.height;
    
          _canvas[1].width  = _windowSize.width;
          _canvas[1].height = _windowSize.height;
    
          _canvas[2].width  = _windowSize.width;
          _canvas[2].height = _windowSize.height;             

          _canvas[3].width  = _windowSize.width;
          _canvas[3].height = _windowSize.height;             
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
    that.selectedView = function() { return _selectedView; };
    
    /** sets the selected view */
    that.setSelectedView = function(view) { _selectedView = view; };
        
    that.handleClick = function(evt) {
      if (!_scrollingStarted) {
        var cObj;
        if (_stages[3].hitTest(evt.pageX, evt.pageY)) {
        //
        }
        else if (_stages[2].hitTest(evt.pageX, evt.pageY)) {
        //
        }
        else if (_stages[1].hitTest(evt.pageX, evt.pageY)) {
          cObj = _stages[1].getObjectUnderPoint(evt.pageX, evt.pageY);
          if (cObj && cObj.view && cObj.view.onClick) {
            cObj.view.onClick(evt);
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
             
      if (!_stages[2].hitTest(evt.pageX, evt.pageY)) {
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
      }      
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
    //   Action Handling
    //
    // /////////////////////////////////////////////////////////////////////// 

    var _selectedView = null;
    var _highlightedView = null;
    
    var _actionViews = {};
    
    var _action = false;
    
    var _selectFortress = function(view) {
      var pos = view.center();
      _selectedView = view;
      _selectedNode = view.node();
      view.setSelected(true);
      _actionViews.fortressControls = AWE.UI.createLabelView();
      log('_actionViews',_actionViews);
      _actionViews.fortressControls.initWithControllerAndLabel(that, AWE.Geometry.createRect(pos.x, pos.y, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE), 'Label', true);
      _stages[2].addChild(_actionViews.fortressControls.displayObject());
      _action = true;
    };
    
    var _unselectFortress = function(view) {
      log('view', _selectedView);
      _stages[2].removeChild(_actionViews.fortressControls.displayObject());
      _selectedView.setSelected(false);
      _selectedView = null;
      _actionViews.fortressControls = null;
      _action = true;
    };

    that.viewClicked = function(view) {
      if (_selectedView === view) {
        _unselectFortress(_selectedView);
      }
      else if (_selectedView) {
        _unselectFortress(_selectedView);
        _selectFortress(view);        
      }
      else {
        _selectFortress(view);
      }
    };

    var _highlightFortress = function(view) {
      var pos = view.center();
      _highlightedView = view;
      _actionViews.fortressHighlightImage = AWE.UI.createMouseoverView();
      _actionViews.fortressHighlightImage.initWithControllerAndNode(that, AWE.Geometry.createRect(pos.x, pos.y - AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      _stages[2].addChild(_actionViews.fortressHighlightImage.displayObject());
      _action = true;
    };

    var _unhighlightFortress = function() {
      if (_actionViews.fortressHighlightImage) {
        _stages[2].removeChild(_actionViews.fortressHighlightImage.displayObject());
        _actionViews.fortressHighlightImage = null;
        _highlightedView = null;
        _action = true;
      }
    };

    that.fortressMouseOver = function(view) {
      _highlightFortress(view);
    };

    that.fortressMouseOut = function(view) {
      _unhighlightFortress();
    };

    that.HUDMouseOver = function() {
      _unhighlightFortress();
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
    
    
    that.modelChanged = function() { return _modelChanged; }
    
    that.setModelChanged = function() { _modelChanged = true; }
    
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
    //   Map Views
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.rebuildMapHierarchy = function(nodes) {

      var newRegionViews = {};          

      for (var i = 0; i < nodes.length; i++) {
        var view = regionViews[nodes[i].id()];
        var frame = that.mc2vc(nodes[i].frame());
        if (view) {                            // view already exists         
          newRegionViews[nodes[i].id()] = view;
          if (view.lastChange !== undefined && view.lastChange() < nodes[i].lastChange()) {
            view.setNeedsUpdate();
          }
          view.setFrame(frame);
        }
        else {                                 // view needs to be created
          view = AWE.UI.createRegionView();
          view.initWithControllerAndNode(that, nodes[i], frame);
          newRegionViews[nodes[i].id()] = view;
          AWE.Ext.applyFunction(view.displayObject(), function(obj) {
            _stages[0].addChild(obj);
          });
        }
      }
      for (var k in regionViews) {             // remove view from layer
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (regionViews.hasOwnProperty(k) && !newRegionViews[k]) {
          var v = regionViews[k];
          AWE.Ext.applyFunction(v.displayObject(), function(obj) {
            _stages[0].removeChild(obj);
          });        
        }
      }
      regionViews = newRegionViews;        
    }
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Gaming pieces
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateGamingPieces = function(nodes) {
      
      var newFortressViews = {};
      
      for (var i = 0; i < nodes.length; i++) {       
        var frame = that.mc2vc(nodes[i].frame()); 
        var view = fortressViews[nodes[i].id()];
        if (view) {                                      
          view.setFrame(frame);
          newFortressViews[nodes[i].id()] = view;
        }
        else if (nodes[i].isLeaf() && nodes[i].region()) {
          var newView = AWE.UI.createFortressView();
          newView.initWithControllerAndNode(that, frame, nodes[i]);
          _stages[1].addChild(newView.displayObject());
          newFortressViews[nodes[i].id()] = newView;
        }
      }
      for (var k in fortressViews) {             // remove view from layer
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (fortressViews.hasOwnProperty(k) && !newFortressViews[k]) {
          var v = fortressViews[k];
          AWE.Ext.applyFunction(v.displayObject(), function(obj) {
            _stages[1].removeChild(obj);
          });        
        }
      }
      fortressViews = newFortressViews;

      var newLocationViews = {};
      
      for (var i = 0; i < nodes.length; i++) {       
        var frame = that.mc2vc(nodes[i].frame()); 
        var view = locationViews[nodes[i].id()];
        if (view) {                                      
          view.setFrame(frame);
          newLocationViews[nodes[i].id()] = view;
        }
        else if (nodes[i].isLeaf() && nodes[i].region() && nodes[i].region().locations()) {
          var newView = AWE.UI.createLocationsView2();
          newView.initWithControllerAndNode(that, frame, nodes[i]);
          _stages[1].addChild(newView.displayObject());
          newLocationViews[nodes[i].id()] = newView;
        }
      }
      for (var k in locationViews) {             // remove view from layer
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (locationViews.hasOwnProperty(k) && !newLocationViews[k]) {
          var v = locationViews[k];
          AWE.Ext.applyFunction(v.displayObject(), function(obj) {
            _stages[1].removeChild(obj);
          });        
        }
      }
      locationViews = newLocationViews;
    };
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Stage
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateActionViews = function(nodes) {

      if (_actionViews.fortressHighlightImage) { 
        _actionViews.fortressHighlightImage.setFrame(AWE.Geometry.createRect(
          _highlightedView.center().x,
          _highlightedView.center().y,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        )); 
      }

      if (_actionViews.fortressControls) { 
        _actionViews.fortressControls.setFrame(AWE.Geometry.createRect(
          _selectedView.center().x,
          _selectedView.center().y,
          AWE.Config.MAPPING_FORTRESS_SIZE,
          AWE.Config.MAPPING_FORTRESS_SIZE
        ));
      }
   };
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Interactive Buttons, Mouse-Over, Notifications
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   HUD
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateHUD = function() {
      
      _stages[3].removeAllChildren();          
      AWE.UI.createMaincontrolsView(_windowSize, _stages[3], that).redraw();
      AWE.UI.createDetailView(_windowSize, _stages[3], that).redraw();
      
    };
    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Update Map View
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateViewHierarchy = (function() {
      var oldVisibleArea = null;
      
      var propUpdates = function(viewHash) {
        var needsDisplay = false;
        
        for (var id in viewHash) {
          if (viewHash.hasOwnProperty(id)) {
            var view = viewHash[id];
            //view.updateIfNeeded();
            view.layoutIfNeeded();
            needsDisplay = needsDisplay || view.needsDisplay();
          }
        }
        
        return needsDisplay;
      }
      
      return function(nodes, visibleArea) {
        
        var stagesNeedUpdate = [false, true, true, true]; // replace true with false as soon as stage 1 and 2 are implemented correctly.
        
        // rebuild individual hieararchies
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          this.rebuildMapHierarchy(nodes);
        }
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea)) || _action) {
          that.updateGamingPieces(nodes);
        };
        
        if (1) {
          that.updateActionViews();
        }
        if (1) { // TODO: only update at start and when something might have changed (object selected, etc.)
          that.updateHUD();
        }

        // update hierarchies and check which stages need to be redrawn
        stagesNeedUpdate[0] = propUpdates(regionViews);
        stagesNeedUpdate[1] = propUpdates(fortressViews) || propUpdates(locationViews);
        // stagesNeedUpdate[2] = propUpdates(actionViews);
        //stagesNeedUpdate[3] = propUpdates(HUDViews);
        
        oldVisibleArea = visibleArea;
      
        return stagesNeedUpdate;
      };
    }());
    
    var startTime = 0;
    var numFrames = 0;
    var fps = 60;
    var needRedraw; // TODO: remove this flag.
    
    that.updateView = function() { needRedraw = true; } // TODO: completely remove this method, replaced by setNeedsDisplay
    
    var fortressViews = {};
    var locationViews = {};
    var regionViews = {};
    
    that.updateFPS = function() {
      
      // calculate fps
      var now = +new Date();
      var alpha = 0.2; // smoothing factor
      if (startTime > 0) {
        fps = fps * (1.0-alpha) + (1000.0 / (now-startTime)) * alpha;
        $('#debug').text(Math.round(fps));
      }
      startTime = now;        
      _frameCounter++;
    };    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    

    that.runloop = function() {
      // only do something after the Map.Manager has been initialized (connected to server and received initial data)
      if(AWE.Map.Manager.isInitialized()) { 
        
        // STEP 1: determine visible area (may have changed through user interaction)
        var visibleArea = that.vc2mc(AWE.Geometry.createRect(0, 0, _windowSize.width,_windowSize.height));
        
        // STEP 2: trigger update of model as needed, fetch new data from server
        that.updateModel(visibleArea);
        
        // STEP 3: layout canvas & stages according to possibly changed window size (TODO: clean this!)
        that.layoutIfNeeded();   
        
        // STEP 4: update views and repaint view hierarchies as needed
        if (needRedraw || _needsDisplay || _loopCounter % 30 == 0 || that.modelChanged() || _action) {
          // STEP 4a: get all visible nodes from the model (TODO: armies etc.)
          var visibleNodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleArea, level(), false, that.modelChanged());    
          
          // STEP 4b: create, remove and update all views according to visible parts of model      
          var stageUpdateNeeded = that.updateViewHierarchy(visibleNodes, visibleArea);
          
          // STEP 4c: update (repaint) those stages, that have changed (one view that needsDisplay triggers repaint of whole stage)
          for (var i=0; i < 4; i++) {
            if (stageUpdateNeeded[i]) {
              _stages[i].update();
            }
          }
          // STEP 4d: register this frame, recalc and display present framerate (rendered frames per second)
          this.updateFPS();
        }


        // STEP 5: cleanup & prepare for next loop: everything has been processed and changed...
        _modelChanged = false;
        needRedraw = false;   // TODO: completely remove this flag and method (replaced by setNeedsDisplay, and setNeedsLayout)
        _needsDisplay = false;
        _needsLayout = false;
        _action = false;
      }
      _loopCounter++;
    };
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



