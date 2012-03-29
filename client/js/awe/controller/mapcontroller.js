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
      // register controller to receive mouse-wheel events in screen (mozilla)
      $(window).bind('DOMMouseScroll', function(evt) {
        that.handleMouseWheel(evt);
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
    

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Handling
    //
    // /////////////////////////////////////////////////////////////////////// 

    var _selectedView = null;
    var _highlightedView = null;
    
    // for actionView see below 
        
    var _action = false;
    
    var _selectFortress = function(view) {
      var pos = view.center();
      _selectedView = view;
      _selectedNode = view.node();
      view.setSelected(true);
      _actionViews.fortressControls = AWE.UI.createLabelView();
      _actionViews.fortressControls.initWithControllerAndLabel(that, 'Label', true, AWE.Geometry.createRect(pos.x, pos.y, AWE.Config.MAPPING_FORTRESS_SIZE, AWE.Config.MAPPING_FORTRESS_SIZE));
      _stages[2].addChild(_actionViews.fortressControls.displayObject());
      _showDetailView(view);
      _action = true;
    };
    
    var _unselectFortress = function(view) {
      _hideDetailView(view);
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
    
    var _showDetailView = function(view) {
      if (HUDViews.detailView) {
        hideDetailView(HUDViews.detailView);
      }
      
      HUDViews.detailView = AWE.UI.createDetailView();
      HUDViews.detailView.initWithControllerAndNode(that, view.node(), AWE.Geometry.createRect(100, 100, 350, 100));
      _stages[3].addChild(HUDViews.detailView.displayObject());
    };

    var _hideDetailView = function(view) {
      if (HUDViews.detailView) {
        _stages[3].removeChild(HUDViews.detailView.displayObject());
        HUDViews.detailView = null;
      }
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
      
      var lastArmyCheck = new Date(1970);
      
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
          
          lastRegionCheck = new Date();
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
        if (lastArmyCheck.getTime() + 1000 < new Date().getTime()) { // check for needed armies once per second
          
          

          lastArmyCheck = new Date();
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
      var removedSomething = false;        

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
            removedSomething = true;
          });        
        }
      }
      regionViews = newRegionViews;  
       
      return removedSomething;     
    }
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Gaming pieces
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.isSettlementVisible = function(frame) {
      return frame.size.width > 256;
    };
    
    that.isFortressVisible = function(frame) {
      return frame.size.width > 128;
    };
    
    that.updateGamingPieces = function(nodes) {
      
      // update fortresses
      var newFortressViews = {};
      var removedSomething = false;

      for (var i = 0; i < nodes.length; i++) { 
        // frame for node      
        var frame = that.mc2vc(nodes[i].frame());
        // var alpha = that.alpha(frame.size.width, 128, 192);
        // if node is big enough for displaying a the fortress
        if (that.isFortressVisible(frame)) {
          // get view for node 
          var view = fortressViews[nodes[i].id()];
          // if view exists already
          if (view) {       
            // if model of view updated
            if (view.lastChange !== undefined && view.lastChange() < nodes[i].lastChange()) {
              view.setNeedsUpdate();
            }                     
            // set new center
            view.setCenter(AWE.Geometry.createPoint(
              frame.origin.x + frame.size.width / 2,
              frame.origin.y + frame.size.height / 2
            ));
            // set alpha
            // view.setAlpha(alpha);
            // save view in newViews Array
            newFortressViews[nodes[i].id()] = view;
          }
          // if view for node doesn't exists and node is leaf
          else if (nodes[i].isLeaf() && nodes[i].region()) {
            // create and initialize new view, set center
            var newView = AWE.UI.createFortressView();
            newView.initWithControllerAndNode(that, nodes[i]);
            newView.setCenter(AWE.Geometry.createPoint(
              frame.origin.x + frame.size.width / 2,
              frame.origin.y + frame.size.height / 2            
            ));
            // set alpha
            // newView.setAlpha(alpha);
            // add views displayObject to stage
            _stages[1].addChild(newView.displayObject());
            // add view to newViews Array
            newFortressViews[nodes[i].id()] = newView;
          }
        }
      }
      
      // purge stage
      for (var k in fortressViews) {
        // use hasOwnProperty to filter out keys from the Object.prototype
        // if old view is not in newViews array
        if (fortressViews.hasOwnProperty(k) && !newFortressViews[k]) {
          // get view
          var view = fortressViews[k];
          // log('entfernen');
          // remove views displayObject from stage
          AWE.Ext.applyFunction(view.displayObject(), function(obj) {
            _stages[1].removeChild(obj);
            removedSomething = true;
          });        
        }
      }
      
      // remember newViews array
      fortressViews = newFortressViews;


      // update other locations
      var newLocationViews = {};
      
      for (var i = 0; i < nodes.length; i++) {       
        var frame = that.mc2vc(nodes[i].frame()); 
        // var alpha = that.alpha(frame.size.width, 256, 384);
        // var locations = locationViews[nodes[i].id()];
        if (that.isSettlementVisible(frame) && nodes[i].isLeaf() && nodes[i].region() && nodes[i].region().locations()) {
          var locations = nodes[i].region().locations();
          for (var l = 1; l < 9; l++) {
            var location = locations[l];
            var view = locationViews[location.id()];
            if (view) {                                      
              view.setCenter(that.mc2vc(location.position()));
              // view.setAlpha(alpha);
              newLocationViews[location.id()] = view;
            }
            else {                                        
              if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()] === "base") {
                view = AWE.UI.createBaseView();
              }             
              if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.typeId()] === "outpost") {
                view = AWE.UI.createOutpostView();
              }
              
              if (view) {
                view.initWithControllerAndLocation(that, location);
                view.setCenter(that.mc2vc(location.position()));
                // view.setAlpha(alpha);
                _stages[1].addChild(view.displayObject());
                newLocationViews[location.id()] = view;
              }
            }
          }
        }
      }
      
      for (var k in locationViews) {             // remove view from layer
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (locationViews.hasOwnProperty(k) && !newLocationViews[k]) {
          var view = locationViews[k];
          AWE.Ext.applyFunction(view.displayObject(), function(obj) {
            _stages[1].removeChild(obj);
            removedSomething = true;
          });        
        }
      }
      locationViews = newLocationViews;
      
      return removedSomething;
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
    //   HUD
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateHUD = function() {
      
      if (HUDViews.detailView) {
        HUDViews.detailView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 370, _windowSize.height - 120));
      }

      if (!HUDViews.mainControlsView) {
        HUDViews.mainControlsView = AWE.UI.createMainControlsView();
        HUDViews.mainControlsView.initWithController(that);
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 470, 20));
        _stages[3].addChild(HUDViews.mainControlsView.displayObject());
      }
      else {
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 470, 20));
      }
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
        
        var stagesNeedUpdate = [true, false, true, true]; // replace true with false as soon as stage 1 and 2 are implemented correctly.
        
        // rebuild individual hieararchies
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[0] = this.rebuildMapHierarchy(nodes) || stagesNeedUpdate[0];
        }
        if (this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea)) || _action) {
          stagesNeedUpdate[1] = stagesNeedUpdate[1] || that.updateGamingPieces(nodes);
        };
        
        if (1) {
          that.updateActionViews();
        }
        if ((oldVisibleArea && !visibleArea.equals(oldVisibleArea)) || _action) { // TODO: only update at start and when something might have changed (object selected, etc.)
          that.updateHUD();
        }

        // update hierarchies and check which stages need to be redrawn
        stagesNeedUpdate[0] = propUpdates(regionViews) || stagesNeedUpdate[0];
        stagesNeedUpdate[1] = propUpdates(fortressViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(locationViews) || stagesNeedUpdate[1];
        // stagesNeedUpdate[2] = propUpdates(actionViews);
        // stagesNeedUpdate[3] = propUpdates(HUDViews);
        
        oldVisibleArea = visibleArea;
      
        return stagesNeedUpdate;
      };
    }());
    
    var startTime = 0;
    var numFrames = 0;
    var fps = 60;
    var needRedraw; // TODO: remove this flag.
    
    that.updateView = function() { needRedraw = true; } // TODO: completely remove this method, replaced by setNeedsDisplay
    
    var regionViews = {};
    var fortressViews = {};
    var locationViews = {};
    var _actionViews = {};
    var HUDViews = {};
    
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
        if (_needsDisplay || _loopCounter % 30 == 0 || that.modelChanged() || _action) {
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



