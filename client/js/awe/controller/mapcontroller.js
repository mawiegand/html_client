/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createMapController = function(anchor) {
    
    var _stages = new Array(4);  ///< four easelJS stages for displaying background, objects and HUD
    var _sortStages = [];
    var _canvas = new Array(4);  ///< canvas elements for the four stages

    var _selectedView = null;    ///< there can be only one selected view!
    var _hoveredView = null;
    
    var _windowSize = null;      ///< size of window in view coordinates
    var mc2vcScale;              ///< scaling
    var mc2vcTrans;              ///< translation

    var _needsLayout;            ///< true, in case e.g. the window has changed, causing a new layuot of the map
    var _needsDisplay;           ///< true, in case something (data, subwview) has changed causing a need for a redraw
    
    var _scrollingStarted = false;///< user is presently scrolling
    var _scrollingStartedAtVC;
    var _scrollingOriginalTranslationVC;
  
    var that = module.createScreenController(anchor); ///< create base object
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    var _loopCounter = 0;        ///< counts every cycle through the loop
    var _frameCounter = 0;       ///< counts every rendered frame
    
    var _modelChanged = false;   ///< true, if anything in the model changed
    var _maptreeChanged = false; ///< true, if anything in the maptree (just nodes!) changed. _maptreeChanged = true implies modelChanged = true
    
    var _detailViewChanged = false; ///< true, if a detailView has been added, removed or changed
    
    var requestingMapNodesFromServer = false;
    
    var regionViews = {};
    var fortressViews = {};
    var armyViews = {};
    var locationViews = {};
    var actionViews = {};
    var HUDViews = {};
    
    var armyUpdates = {};

    
    
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
      
      _sortStages = [false, true, false, false];  // which stages to y-sort? -> presently, only the gaming pieces need to be sorted.
      
      var root = that.rootElement();
      
      // background layer, displays region tiles
      root.append('<canvas id="layer0"></canvas>');
      _canvas[0] = root.find('#layer0')[0];
      _stages[0] = new Stage(_canvas[0]);
      
   
      // selectable gaming pieces layer (fortresses, armies, etc.)
      root.append('<canvas id="layer1"></canvas>');
      _canvas[1] = root.find('#layer1')[0];
      _stages[1] = new Stage(_canvas[1]);
      
      // layer for mouseover and selection objects
      root.append('<canvas id="layer2"></canvas>');
      _canvas[2] = root.find('#layer2')[0];
      _stages[2] = new Stage(_canvas[2]);
      
      // HUD layer ("static", not zoomable, not moveable)
      root.append('<canvas id="layer3"></canvas>');
      _canvas[3] = root.find('#layer3')[0];
      _stages[3] = new Stage(_canvas[3]);
      //_stages[3].enableMouseOver();

      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setViewport(initialFrameModelCoordinates);
      that.setNeedsLayout();

    };   
        
    that.getStages = function() {
      return [
        { stage: _stages[0], mouseOverEvents: false, transparent: true},
        { stage: _stages[1], mouseOverEvents: true },
        { stage: _stages[2], mouseOverEvents: true },
        { stage: _stages[3], mouseOverEvents: true },
      ];
    };
    
    that.viewDidAppear = function() {
  /*    var root = that.rootElement();
      
      
      // register controller to receive mouse-down events in screen
      root.mousedown(function(evt) {
        that.handleMouseDown(evt);
      });
      
      // register controller to receive window-resize events (from browser window) 
      // in order to adapt it's own window / display area
      $(window).resize(function(){
        console.log('Resize event in map controller.');
        that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      });
      
      // register controller to receive mouse-wheel events in screen
      $(window).bind('mousewheel', function() {
        that.handleMouseWheel();
      });
      // register controller to receive mouse-wheel events in screen (mozilla)
      $(window).bind('DOMMouseScroll', function(evt) {
        that.handleMouseWheel(evt);
      });*/
    }     
    
    that.viewWillDisappear = function() { 
    //  $(window).unbind('mousewheel');     // remove all event handlers that were bound to the window.
    //  $(window).unbind('DOMMouseScroll');   
    //  $(window).unbind('resize'); 
    }
    
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
    
    /** calculates the alpha value of location objects as a linear function
     *  between min and max depending on its width
     */
    that.alpha = function(width, min, max) {
      
      if (min >= max || max < width) return 1;
      if (width < min) return 0;

      var alpha = (width - min ) / (max - min);
      
      return alpha;
    }
    
    
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
    
    
    that.prepareScrolling = function(posX, posY) {
      console.log('prepare scrolling');
      _scrollingStartedAtVC = AWE.Geometry.createPoint(posX, posY);
      _scrollingOriginalTranslationVC = mc2vcTrans.copy();
        
      $('#layers').mousemove(function(ev) {
        that.onMouseMove(ev);
      });
    } 
    
    that.startScrolling = function() {
      console.log('start scrolling');
      _scrollingStarted = true;
    } 
    
    that.endScrolling = function() {
      console.log('end scrolling');
      $('#layers').unbind('mousemove');
      _scrollingStarted = false;
    }       
    
    that.isScrolling = function() {
      return _scrollingStarted;
    }

    that.onMouseUp = function(evt) {
      that.endScrolling();
      console.log('up');
    }
    
    that.onMouseLeave = function(evt) {
      that.endScrolling();
      console.log('leave');
    }
    
    that.onMouseDown = function(evt) {
//    if (!_stages[2].hitTest(evt.pageX, evt.pageY)) {  // removed, for the moment, it's ok to scroll everywhere
      that.prepareScrolling(evt.pageX, evt.pageY);
    };
    
    that.onMouseMove = function(event) {
      // here we can assume, that the mouse is pressed right now!
      if (! that.isScrolling() && (Math.abs(event.pageX - _scrollingStartedAtVC.x) > 5 || Math.abs(event.pageY - _scrollingStartedAtVC.y > 5)))  {
        that.startScrolling();
      }
      if (that.isScrolling()) {
        var pos = AWE.Geometry.createPoint(_scrollingOriginalTranslationVC.x + event.pageX - _scrollingStartedAtVC.x, 
                                           _scrollingOriginalTranslationVC.y + event.pageY - _scrollingStartedAtVC.y);        
        mc2vcTrans.moveTo(pos);
        that.setNeedsLayout();
      }
    };
    
    that.onMouseWheel = function(ev) {
      
      var evt = window.event;
      if (ev && ev.originalEvent) {
        evt = ev.originalEvent
      }
      
      var delta = 0;
      
      if (evt.wheelDelta) { /* IE/Opera. */
        delta = evt.wheelDelta/120;
      }
      else if (evt.detail) { /** Mozilla case. */
        /** In Mozilla, sign of delta is different than in IE.
         * Also, delta is multiple of 3.
         */
        delta = -evt.detail/3;
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
      if (evt.preventDefault) {
        evt.preventDefault();
      }
      evt.returnValue = false;
    };
    
    
    that.onResize = function() {
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
    }
    
    /** received in case no view is hit by a click. used to unselect object on
     * click into background. */
    that.onClick = function() {   
      if (_selectedView) {
        _unselectView();
      }
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Handling
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    /** returns the single map view that is presently selected by the user. 
     * this can be any of the gaming pieces (armies), markers or settlements.*/
    that.selectedView = function() { return _selectedView; };
    
    /** sets the selected view */
    that.setSelectedView = function(view) {
      // when selected view is set from outside, the view type has to determined
      // and the viewport has to be transformed to show the view.  
      _selectedView = view;
    };
        
    var _action = false;

    that.buttonClicked = function(button) {
      log('button', button.text());
    };
    
    that.viewClicked = function(view) {    
      if (_selectedView === view) {
        _unselectView(_selectedView);
      }
      else if (_selectedView) {
        _unselectView(_selectedView);
        _selectView(view);        
      }
      else {
        _selectView(view);
      }
    };

    that.viewMouseOver = function(view) { // console.log('view mouse over: ' + view.typeName())
      if (view.typeName() === 'FortressView') {
        _hoverView(view);
      }
      else if (view.typeName() === 'ArmyView') {
        _hoverView(view);
      }
      else if (view.typeName() === 'hudView') { // typeof view == 'hud'  (evtl. eigene methode)
        // _unhoverView();
      }
    };

    that.viewMouseOut = function(view) {
      if (view.typeName() === 'FortressView') {
        _unhoverView();
      }
      else if (view.typeName() === 'ArmyView') {
        _unhoverView();
      }
    };
    
    /* view selection */
    
    var _selectView = function(view) {
      
      _selectedView = view;
      _selectedView.setSelected(true);
      actionViews.selected = actionViews.hovered;
      actionViews.selected.setNeedsUpdate();
      _showDetailView(_selectedView);
      _action = true;
    };
    
    var _unselectView = function(view) {
      
      if (!_selectedView.hovered()) {
        _stages[2].removeChild(actionViews.selected.displayObject());
      }
      else {
        actionViews.selected.setNeedsUpdate();        
      }

      delete actionViews.selected;
      _selectedView.setSelected(false);
      _selectedView = null;
      
      _hideDetailView();

      _action = true;
    };

    /* view highlighting */

    var _hoverView = function(view) {
      
      if (view !== _hoveredView) {
        _hoveredView = view;
        _hoveredView.setHovered(true);
          
        if (view !== _selectedView) {
          
          var center = view.center();
          if (view.typeName() === 'FortressView') {
            actionViews.hovered = AWE.UI.createFortressActionView();
            actionViews.hovered.initWithControllerAndView(that, view);
          }
          else if (view.typeName() === 'ArmyView') {
            actionViews.hovered = AWE.UI.createArmyActionView();
            actionViews.hovered.initWithControllerAndView(that, view);
            armyUpdates[view.army().get('id')] = view.army();
          }

          actionViews.hovered.setCenter(center.x, center.y);
          _stages[2].addChild(actionViews.hovered.displayObject());
          
        }
        else {
          actionViews.hovered = actionViews.selected;
          actionViews.hovered.setNeedsUpdate();
        }
        
        _action = true;
      }
    };

    var _unhoverView = function() {
      
      if (actionViews.hovered) {
        if (_hoveredView !== _selectedView) {
          _stages[2].removeChild(actionViews.hovered.displayObject());
        }
        else {
          actionViews.hovered.setNeedsUpdate();
        }
        delete actionViews.hovered;
        _hoveredView.setHovered(false);
        _hoveredView = null;
        _action = true;
      }
    };

    /* Detail View */

    var _showDetailView = function(view) {
      if (HUDViews.detailView) {
        hideDetailView(HUDViews.detailView);
      }
      
      if (view.typeName() === 'FortressView') {      
        HUDViews.detailView = AWE.UI.createFortressDetailView();
        HUDViews.detailView.initWithControllerAndNode(that, view.node());
      }
      else if (view.typeName() === 'ArmyView') {
        HUDViews.detailView = AWE.UI.createArmyDetailView();
        HUDViews.detailView.initWithControllerAndArmy(that, view.army());
      }
      _stages[3].addChild(HUDViews.detailView.displayObject());
      _detailViewChanged = true;
    };

    var _hideDetailView = function() {
      if (HUDViews.detailView) {
        _stages[3].removeChild(HUDViews.detailView.displayObject());
        delete HUDViews.detailView;
      }
      _detailViewChanged = true;
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
    
    that.maptreeChanged = function() { return _maptreeChanged; }
    
    that.setMaptreeChanged = function() { _maptreeChanged = true; _modelChanged = true; }
    
    that.updateModel = (function() {
            
      var lastArmyCheck = new Date(1970);
      
      var viewports = {};  ///< stores the viewport at the time of an update for each of the different update types 
      
      var runningUpdate = {};
      
      var isUpdateRunning = function(type) {
        return runningUpdate[type];
      }
      
      var startUpdate = function(type) {
        runningUpdate[type] = new Date();
       // console.log('MapController: starting update for ' + type + '.' );
      }
      
      var stopUpdate = function(type) {
        if (runningUpdate[type]) {
          delete runningUpdate[type];
        }
      }
      
      var viewportHasChanged = function(type, rect) {
        return (!viewports[type] && rect) || (viewports[type] && !viewports[type].equals(rect));
      };
      
      var setViewport = function(type, rect) {
        viewports[type] = rect;
      };
      
      
      return function(visibleAreaMC) {
        
        //console.log('update model ' + visibleAreaMC + ' changed: ' + viewportHasChanged(visibleAreaMC) + ' ongoing: ' + requestingMapNodesFromServer);

        // viewport change -> time to check for the need for additional map nodes.
        if (viewportHasChanged('nodes', visibleAreaMC) && !isUpdateRunning('nodes')) {
          if (AWE.Map.numMissingNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level()) > 0) {         
            startUpdate('nodes');
            AWE.Map.Manager.fetchNodesForArea(visibleAreaMC, level(), function() {
              stopUpdate('nodes');
              that.setMaptreeChanged();
            }); 
          }
          setViewport('nodes', visibleAreaMC); ///< remember viewport, because data for this port has been fetched (or isn't needed) 
        }
        
        // in case the viewport has changed or the model has changed (more nodes?!) we need to check for missing regions.
        if ((viewportHasChanged('regions', visibleAreaMC) || that.maptreeChanged()) && !isUpdateRunning('nodes')) {
          
          startUpdate('regions');
          AWE.Map.Manager.fetchMissingRegionsForArea(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), function() {
            stopUpdate('regions'); // TODO: is not stopped properly in case there's no response!!!
            that.setModelChanged();
          });
          
          setViewport('regions', visibleAreaMC); ///< remember viewport, because data for this port has been fetched (or isn't needed) 
        }
        
        // in case the viewport has changed or the model has changed (more nodes or regions?!) we need to check for missing locations.
        if ((viewportHasChanged('locations', visibleAreaMC) || that.modelChanged()) && ! isUpdateRunning('nodes')) {

          var nodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, that.maptreeChanged()); // this is memoized, no problem to call it twice in one cycle!

          for (var i=0; i < nodes.length; i++) {
            //startUpdate('locations');
            if (nodes[i].isLeaf() && nodes[i].region() && !nodes[i].region().locations() && nodes[i].level() <= level()-2) {
              AWE.Map.Manager.fetchLocationsForRegion(nodes[i].region(), function() {
                that.setModelChanged();
              });
            }
            //stopUpdate('locations'); // TODO: start / stop this properly! (many parallel requests)
          }
          setViewport('locations', visibleAreaMC);
        }

        
        if (lastArmyCheck.getTime() + 400 < new Date().getTime() && !isUpdateRunning('armies')) { // check for needed armies once per second
          
          var nodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, false); // this is memoized, no problem to call it twice in one cycle!
          
          for (var i=0; i < nodes.length; i++) {
            
            if (!nodes[i].isLeaf() || !nodes[i].region()) continue; // no need to fetch army information for this node
            
            var frame = that.mc2vc(nodes[i].frame());
            
            if (!that.areArmiesAtFortressVisible(frame)) continue ; // no update necessary, region is to small (perhaps fetch aggregate info)
                        
            if (!that.areArmiesAtSettlementsVisible(frame)) {
              if(AWE.GS.ArmyManager.lastUpdateForFortress(nodes[i].region().id()).getTime() + 60000 < new Date().getTime() && // haven't fetched armies for fortess within last 60s
                nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < new Date().getTime()) {        // haven't fetched armies for region within last 60s
                
                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmiesAtFortress(nodes[i].region().id(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!
              }
            }
            else {
              if (nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < new Date().getTime()) {
                
                startUpdate('armies');
                nodes[i].region().updateArmies(AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!        
              }      
            }
          }
          lastArmyCheck = new Date();
        }
        
        if (!isUpdateRunning('armyDetails') && AWE.Util.hashCount(armyUpdates)) { // check for needed armies once per second
          
          for (var armyId in armyUpdates) {
            if (armyUpdates.hasOwnProperty(armyId)) {
              var army = armyUpdates[armyId];
              delete armyUpdates[armyId];                           // process this event, remove it from queue
              
              if (army.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime()) {
                startUpdate('armyDetails');
                AWE.GS.ArmyManager.updateArmy(armyId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
                  stopUpdate('armyDetails');
                  that.setModelChanged();
                });
                break ;                                             // end, just one request at a time
              }
            }
          }
          
          var nodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, false); // this is memoized, no problem to call it twice in one cycle!
          
          for (var i=0; i < nodes.length; i++) {
            
            if (!nodes[i].isLeaf() || !nodes[i].region()) continue; // no need to fetch army information for this node
            
            var frame = that.mc2vc(nodes[i].frame());
            
            if (!that.areArmiesAtFortressVisible(frame)) continue ; // no update necessary, region is to small (perhaps fetch aggregate info)
                        
            if (!that.areArmiesAtSettlementsVisible(frame)) {
              if(AWE.GS.ArmyManager.lastUpdateForFortress(nodes[i].region().id()).getTime() + 60000 < new Date().getTime() && // haven't fetched armies for fortess within last 60s
                nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < new Date().getTime()) {        // haven't fetched armies for region within last 60s
                
                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmiesAtFortress(nodes[i].region().id(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!
              }
            }
            else {
              if (nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < new Date().getTime()) {
                
                startUpdate('armies');
                nodes[i].region().updateArmies(AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!        
              }      
            }
          }
          lastArmyCheck = new Date();
        }
      };
    }());
    

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Map Views
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    /** helper function that purges views from a stage when they are not 
     * needed (e.g. scrolled out of the viewport). */
    var purgeDispensableViewsFromStage = function(presentViews, neededViews, stage) {
      var removedSomething = false;
      var toRemove = AWE.Util.hashSubtraction(presentViews, neededViews);
      AWE.Ext.applyFunctionToElements(toRemove, function(view) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj) {
          stage.removeChild(obj);
          removedSomething = true;          
        });
        if (view === _selectedView) {
          _unselectView(view);
        }
        if (view === _hoveredView) {
          _unhoverView(view);
        }
      }); 
      return removedSomething;     
    }
    
    that.rebuildMapHierarchy = function(nodes) {

      var newRegionViews = {};  

      for (var i = 0; i < nodes.length; i++) {
        var view = regionViews[nodes[i].id()];
        var frame = that.mc2vc(nodes[i].frame());
        
        if (view) {                            // view already exists         
          if (view.lastChange !== undefined && 
              (view.lastChange() < nodes[i].lastChange() || 
               (nodes[i].region() && view.lastChange() < nodes[i].region().lastChange()))) { // somehow determine when to update roads (change of locations?)
            view.setNeedsUpdate();
          }
          view.setFrame(frame);
        }
        else {                                 // view needs to be created
          view = AWE.UI.createRegionView();
          view.initWithControllerAndNode(that, nodes[i], frame);
          AWE.Ext.applyFunction(view.displayObject(), function(obj) {
            _stages[0].addChild(obj);
          });
        }
        if (this.isSettlementVisible(frame)) {
          view.showVillages();
        }
        else {
          view.hideVillages();
        }
        if (this.isFortressVisible(frame)) {
          view.showStreets();
        }
        else {
          view.hideStreets();
        }
        newRegionViews[nodes[i].id()] = view;
      }
      
      var removedSomething = purgeDispensableViewsFromStage(regionViews, newRegionViews, _stages[0]);
      regionViews = newRegionViews;  
      return removedSomething;     
    }
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Gaming pieces
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.isSettlementVisible = function(frame) {
      return frame.size.width > 420;
    };
    
    that.isFortressVisible = function(frame) {
      return frame.size.width > 128;
    };
    
    that.areArmiesAtFortressVisible = function(frame) {
      return frame.size.width > 140;
    }
    
    that.areArmiesAtSettlementsVisible = function(frame) {
      return frame.size.width > 420;
    }
    
    var setFortressPosition = function(view, frame) {
      view.setCenter(AWE.Geometry.createPoint(
        frame.origin.x + frame.size.width / 2,
        frame.origin.y + frame.size.height / 2 - 5         
      ));
    }
    
    var setBasePosition = function(view, pos, frame) {
      view.setCenter(AWE.Geometry.createPoint(
        pos.x,
        pos.y - 10        
      ));
    }
    
    var setArmyPosition = function(view, pos, armyId, frame) {
      var frac = ((armyId % 8) / 8.0) * 2*Math.PI;
      var dir = AWE.Geometry.createPoint(Math.sin(frac), Math.cos(frac));
      dir.scale(40+frame.size.width/20.0); 
      
      view.setCenter(AWE.Geometry.createPoint(
        (pos.x) + dir.x,
        (pos.y - view.frame().size.height/2 + 30) + dir.y        
      ));
    }
        
    
    /** update the fortress views. */
    that.updateFortresses = function(nodes) {     // view for slot 0

      var newFortressViews = {};

      for (var i = 0; i < nodes.length; i++) { 
        var frame = that.mc2vc(nodes[i].frame()); // frame for node        

        if (that.isFortressVisible(frame) &&      // if node is big enough for displaying the fortress
            nodes[i].isLeaf() && nodes[i].region()) {      
          var view = fortressViews[nodes[i].id()];// get existing view for node 

          if (view) {                             // if view exists already   
            if (view.lastChange !== undefined &&  // if model of view updated
                nodes[i].region() && view.lastChange() < nodes[i].region().lastChange()) {
              view.setNeedsUpdate();
            }                     
          }
          else if (nodes[i].isLeaf() && nodes[i].region()) { // if view for node doesn't exists and node is a leaf node
            view = AWE.UI.createFortressView();
            view.initWithControllerAndNode(that, nodes[i]);
            _stages[1].addChild(view.displayObject()); // add view's displayObject to stage
          }
          if (view) {
            setFortressPosition(view, frame);
            newFortressViews[nodes[i].id()] = view;  
          }                    
        }
      }
      
      var removedSomething = purgeDispensableViewsFromStage(fortressViews, newFortressViews, _stages[1]);
      fortressViews = newFortressViews;      
      return removedSomething;
    }
    
    
    /** update settlements at location 1 to 8. */
    that.updateSettlements = function(nodes) {     // views for slot 1-8
      
      var newLocationViews = {};
      
      for (var i = 0; i < nodes.length; i++) {       
        var frame = that.mc2vc(nodes[i].frame()); 
        
        if (that.isSettlementVisible(frame) && nodes[i].isLeaf() && 
            nodes[i].region() && nodes[i].region().locations()) {
              
          var locations = nodes[i].region().locations();

          for (var l = 1; l <= 8; l++) {
            var location = locations[l];
            if (location) {
              var view = locationViews[location.id()];
              
              if (view) {      
                if (view.lastChange !== undefined &&  // if model of view updated
                    view.lastChange() < location.lastChange()) {
                  view.setNeedsUpdate();
                }                                     
              }
              else {                                        
                if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()] === "base") {
                  view = AWE.UI.createBaseView();
                }             
                else if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()] === "outpost") {
                  view = AWE.UI.createOutpostView();
                }
                if (view) {   // if base or outpost on location init the view
                  view.initWithControllerAndLocation(that, location);
                 _stages[1].addChild(view.displayObject());                  
                }
              }
              
              if (view) {
                setBasePosition(view, that.mc2vc(location.position()), frame);
                newLocationViews[location.id()] = view;
              }
            }
          }
        }
      }
      
      var removedSomething = purgeDispensableViewsFromStage(locationViews, newLocationViews, _stages[1]);
      locationViews = newLocationViews;      
      return removedSomething;
    }
    
    
    /** update the army views. */
    that.updateArmies = function(nodes) {
  
      var newArmyViews = {};
      
      var processArmiesAtPos = function(armies, pos) {
        for (var key in armies) {
          if (armies.hasOwnProperty(key)) {
            var army = armies[key];
            var view = armyViews[army.get('id')];
          
            if (view) {       
              if (view.lastChange !== undefined && view.lastChange() < army.lastChange()) {
                view.setNeedsUpdate();
              }             
            }
            else {  // if view for army doesn't exists
              view = AWE.UI.createArmyView();
              view.initWithControllerAndArmy(that, army);
              _stages[1].addChild(view.displayObject());
            }                                  
            setArmyPosition(view, pos, army.get('id'), frame);
            newArmyViews[army.get('id')] = view;
          }
        }
      };
      
      for (var i = 0; i < nodes.length; i++) {       
        var frame = that.mc2vc(nodes[i].frame()); 

        if (that.areArmiesAtFortressVisible(frame) && nodes[i].isLeaf() && nodes[i].region()) {
          var armies = nodes[i].region().getArmiesAtFortress();       // armies at fortress
          var center = AWE.Geometry.createPoint(
            frame.origin.x + frame.size.width / 2 ,
            frame.origin.y + frame.size.height / 2         
          );  
          processArmiesAtPos(armies, center);    
        }      
        
        if (that.areArmiesAtSettlementsVisible(frame) && 
            nodes[i].isLeaf() && nodes[i].region() && nodes[i].region().locations()) {
          for (var loc=1; loc <= 8; loc++) {
            var location = nodes[i].region().location(loc);      
            if (!location || !location.position()) continue ; 
            var armies = location.getArmies();       // armies at location
            var position = that.mc2vc(location.position());           
            processArmiesAtPos(armies, position);
          }
        }
      }
          
      var removedSomething = purgeDispensableViewsFromStage(armyViews, newArmyViews, _stages[1]);
      armyViews = newArmyViews;      
      return removedSomething;          
    }
    
    that.updateGamingPieces = function(nodes) {
      var removedSomething = false;
      
      removedSomething = that.updateFortresses(nodes)  || removedSomething;
      removedSomething = that.updateSettlements(nodes) || removedSomething;
      removedSomething = that.updateArmies(nodes)      || removedSomething;

      return removedSomething;
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Stage
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateActionViews = function() {
      
      if (actionViews.hovered
          && (actionViews.hovered.typeName() === 'FortressActionView'
          || actionViews.hovered.typeName() === 'ArmyActionView')) {
        actionViews.hovered.setCenter(AWE.Geometry.createPoint(
            _hoveredView.center().x,
            _hoveredView.center().y
        ));
      }

      if (actionViews.selected
          && (actionViews.selected.typeName() === 'FortressActionView'
          || actionViews.selected.typeName() === 'ArmyActionView')) {
        actionViews.selected.setCenter(AWE.Geometry.createPoint(
            _selectedView.center().x,
            _selectedView.center().y
        ));
      }
    };
    
        
    // ///////////////////////////////////////////////////////////////////////
    //
    //   HUD
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateHUD = function() {
      
      if (!HUDViews.mainControlsView) {
        HUDViews.mainControlsView = AWE.UI.createMainControlsView();
        HUDViews.mainControlsView.initWithController(that);
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 470, 20));
        _stages[3].addChild(HUDViews.mainControlsView.displayObject());
      }
      else {
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 470, 20));
      }

      var detailView = HUDViews.detailView;
      if (detailView) {        
        detailView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 332, _windowSize.height - 148));
        
        if (detailView.typeName() === 'ArmyDetailView' && detailView.lastChange() < detailView.army().lastChange()) {
          detailView.setNeedsUpdate();
        }
        
        if (detailView.typeName() === 'FortressDetailView' && detailView.lastChange() < detailView.node().lastChange()) {
          detailView.setNeedsUpdate();
        }
      }
      
      return _detailViewChanged;
    };
    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Update Map View
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateViewHierarchy = (function() {
      var oldVisibleArea = null;
      var oldWindowSize = null;
      
      var propUpdates = function(viewHash) {
        var needsDisplay = false;
        
        for (var id in viewHash) {
          if (viewHash.hasOwnProperty(id)) {
            var view = viewHash[id];
            view.updateIfNeeded();
            view.layoutIfNeeded();
            needsDisplay = needsDisplay || view.needsDisplay();
          }
        }
        
        return needsDisplay;
      }
      
      return function(nodes, visibleArea) {
        
        var stagesNeedUpdate = [false, false, true, false]; // replace true with false as soon as stage 1 and 2 are implemented correctly.
        
        // rebuild individual hieararchies
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[0] = this.rebuildMapHierarchy(nodes) || stagesNeedUpdate[0];
        }
        
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea)) || _action ) {
          stagesNeedUpdate[1] = this.updateGamingPieces(nodes) || stagesNeedUpdate[1];
        };
        
        if (this.modelChanged() || _action || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          that.updateActionViews();
        }
        
        if ((oldWindowSize && !oldWindowSize.equals(_windowSize)) || _action || !HUDViews.mainControlsView) { // TODO: only update at start and when something might have changed (object selected, etc.)
          // log('MapController: update hud.', _action);
          stagesNeedUpdate[3] = that.updateHUD() || stagesNeedUpdate[3]; 
        }
        
        //log('Update:                   ', stagesNeedUpdate[0], stagesNeedUpdate[1], stagesNeedUpdate[2], stagesNeedUpdate[3])

        // update hierarchies and check which stages need to be redrawn
        stagesNeedUpdate[0] = propUpdates(regionViews) || stagesNeedUpdate[0];
        stagesNeedUpdate[1] = propUpdates(fortressViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(locationViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(armyViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[2] = propUpdates(actionViews) || stagesNeedUpdate[2];
        stagesNeedUpdate[3] = propUpdates(HUDViews) || stagesNeedUpdate[3];

        //log('Update after propagation: ', stagesNeedUpdate[0], stagesNeedUpdate[1], stagesNeedUpdate[2], stagesNeedUpdate[3])

        
        oldVisibleArea = visibleArea;
        oldWindowSize = _windowSize.copy();
      
        return stagesNeedUpdate;
      };
    }());
    
    var startTime = 0;
    var numFrames = 0;
    var fps = 60;
    var needRedraw; // TODO: remove this flag.
    
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
    
    that.updateDebug = function() {
      var numRegionViews = AWE.Util.hashCount(regionViews);
      var numFortressViews = AWE.Util.hashCount(fortressViews);
      var numArmyViews = AWE.Util.hashCount(armyViews);
      var numLocationViews = AWE.Util.hashCount(locationViews);
      
      $("#debug2").html('&nbsp; Number of visible views: ' + numRegionViews + '/' + numFortressViews + 
                        '/' + numLocationViews + '/' + numArmyViews + '/' + ' (regions, fortresses, locations, armies)');
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
        if (_needsDisplay || _loopCounter % 30 == 0 || that.modelChanged() || _action) {
          // STEP 4a: get all visible nodes from the model
          var visibleNodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleArea, level(), false, that.modelChanged());    
          
          // STEP 4b: create, remove and update all views according to visible parts of model      
          var stageUpdateNeeded = that.updateViewHierarchy(visibleNodes, visibleArea);
          
          // STEP 4c: update (repaint) those stages, that have changed (one view that needsDisplay triggers repaint of whole stage)
          var viewsInStages = [
            regionViews,
            [fortressViews, armyViews, locationViews],
            actionViews,
            HUDViews
          ];          
          
          for (var i=0; i < 4; i++) {
            if (stageUpdateNeeded[i]) {
              if (_sortStages[i]) {  // TODO: add configuration: stage needs sorting
                _stages[i].sortChildren(function(a, b) {
                  var az = a.y + a.height;
                  var bz = b.y + b.height;
                  return az - bz;
                });
              }
              _stages[i].update();
              //log(viewsInStages, regionViews);
              AWE.Ext.applyFunction(viewsInStages[i], function(viewHash) {
                // log (viewHash);
                AWE.Ext.applyFunctionToElements(viewHash, function(view) {
                  view.notifyRedraw();
                });
              });
            }
          }
          
          //_stages[3].update();
          // STEP 4d: register this frame, recalc and display present framerate (rendered frames per second)
          this.updateFPS();
          this.updateDebug();
        }


        // STEP 5: cleanup & prepare for next loop: everything has been processed and changed...
        _modelChanged = false;
        _maptreeChanged = false;
        _needsDisplay = false;
        _needsLayout = false;
        _action = false;
        _detailViewChanged = false;
      }
      _loopCounter++;
    };
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



