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
    var _windowChanged=false;    ///< true, in case the size of the map screen has changed.
    
    var _scrollingStarted = false;///< user is presently scrolling
    var _scrollingStartedAtVC;
    var _scrollingOriginalTranslationVC;
    var _scrollingLastVCPosition;
    
    var _animations = [];

    var _camera; ///< camera for handeling camera panning
    
    var that = module.createScreenController(anchor); ///< create base object
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append); 
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    var _loopCounter = 0;        ///< counts every cycle through the loop
    var _frameCounter = 0;       ///< counts every rendered frame
    
    var _modelChanged = false;   ///< true, if anything in the model changed
    var _maptreeChanged = false; ///< true, if anything in the maptree (just nodes!) changed. _maptreeChanged = true implies modelChanged = true
    
    var _inspectorChanged = false; ///< true, if a detailView has been added, removed or changed
    
    var requestingMapNodesFromServer = false;
    
    var regionViews = {};
    var fortressViews = {};
    var armyViews = {};
    var movementArrowViews = {};
    var locationViews = {};
    var actionViews = {};
    var targetViews = {};
    var inspectorViews = {};

    var zoomSlider = undefined;
    
    var armyUpdates = {};

    var currentAction = null;
    
    var mapMode = false; //  display game graphics
    
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
      root.append('<canvas id="map-tile-canvas"></canvas>');
      _canvas[0] = root.find('#map-tile-canvas')[0];
      _stages[0] = new Stage(_canvas[0]);
      _stages[0].onClick = function() {};   // we generate our own clicks

            
      // selectable gaming pieces layer (fortresses, armies, etc.)
      root.append('<canvas id="gaming-pieces-canvas"></canvas>');
      _canvas[1] = root.find('#gaming-pieces-canvas')[0];
      _stages[1] = new Stage(_canvas[1]);
      _stages[1].onClick = function() {};   // we generate our own clicks
      
      // layer for mouseover and selection objects
      root.append('<canvas id="annotation-canvas"></canvas>');
      _canvas[2] = root.find('#annotation-canvas')[0];
      _stages[2] = new Stage(_canvas[2]);
      _stages[2].onClick = function() {};   // we generate our own clicks


      // layer for the object inspector
      root.append('<canvas id="inspector-canvas"></canvas>');
      _canvas[3] = root.find('#inspector-canvas')[0];
      _stages[3] = new Stage(_canvas[3]);
      _stages[3].onClick = function() {};   // we generate our own clicks

      //zoom slider
      $("body").append('<div class="zoom_slider"><div class="slider_container"><img src="images/ui/slider.png" class="slider_slider"><div class="slider_bar"></div><div>');
      $("body").find(".zoom_slider").each(function(i, value) {
        if (zoomSlider !== undefined) {
          console.error("found more than one zoom slider");
        }
        zoomSlider = AWE.UI.createSlider(value, true, true, that.handleZoomSliderValueUpdate);
        $(zoomSlider.getContainer()).remove();
      });
      
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setViewport(initialFrameModelCoordinates);
      that.setNeedsLayout();

      //create the camera with the initial values
      _camera = AWE.UI.createCamera({
        rootController: that,
        windowSize: that.windowSize(),
        viewport: initialFrameModelCoordinates
      });

      inspectorViews.tempToggleButtonView = AWE.UI.createTempToggleButtonView();
      inspectorViews.tempToggleButtonView.initWithController(that, AWE.Geometry.createRect(0, 0, 48, 48));
      _stages[3].addChild(inspectorViews.tempToggleButtonView.displayObject());
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
      $("body").append(zoomSlider.getContainer());
      window.WACKADOO.addDomElement(zoomSlider.getContainer(), true);
      zoomSlider.subscribeToDOMEvents();
    }     
    
    that.viewWillDisappear = function() {
      $(zoomSlider.getContainer()).remove(); 
      window.WACKADOO.removeDomElement(zoomSlider.getContainer());
      zoomSlider.unsubscribeDOMEvents();
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
        point.moveBy(AWE.Geometry.createPoint(-mc2vcTrans.x, -mc2vcTrans.y));
        //point.moveBy(n(mc2vcTrans));
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
      if (! _windowSize || _windowSize.width != size.width || _windowSize.height != size.height) {
        _windowSize = size;
        _windowChanged = true;
        that.setNeedsLayout();
        if (_camera !== undefined) {
          _camera.windowSize(size);
        }
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
      //
      if (zoomSlider !== undefined) {
        that.updateZoomSliderValue();
      }
    };

    /** returns the currently visible viewport in model coordinates **/
    that.viewport = function() {
      var w = _windowSize.width/mc2vcScale;
      var h = _windowSize.height/mc2vcScale;
      return AWE.Geometry.createRect(
        -1. * mc2vcTrans.x * w / _windowSize.width,
        -1. * mc2vcTrans.y * h / _windowSize.height,
        w,
        h
      );
    };
    
    /** zoom in and out. */
    that.zoom = function(dScale, zoomin) {
      // TODO: calc max and min zoom value
      _camera.zoom(dScale, zoomin);
    };
    /**
      * Moves the camera to the given value.
      * @param value the value can be a array of nodes, a node, a frame, a location, a region or a point. In case it is a point the viewport center will be moved there.
      * @param animated default:true. if false 
      * @param addBorder default:true. if true there will be. If a point is given, addBroder should probably be set to false.
     **/
    that.moveTo = function(value, addBorder, animated) {
      if (_camera.isMoving()) {
        console.log("The camera cannot be moved while it is already moving");
        return;
      }
      _camera.moveTo(value, addBorder, animated);
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
    that.level = level;
    
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
    //   Slider
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.handleZoomSliderValueUpdate = function(value) {
      value = -1*value*(value-2);
      value = 1 - value;
      //create a target frame
      var viewport = that.viewport();
      var middle = viewport.middle();
      var width = (AWE.Config.MAP_CAMERA_MAX_VIEWFRAME_SIZE.width - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.width)*value + AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.width;
      var height = (AWE.Config.MAP_CAMERA_MAX_VIEWFRAME_SIZE.height - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.height)*value + AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.height;
      _camera.moveTo(
        AWE.Geometry.createRect(
          middle.x - width/2,
          middle.y - height/2,
          width,
          height
        ),
        false,
        false,
        true
      );
    };

    that.updateZoomSliderValue = function() {
      var viewport = that.viewport();
      var valueW = (viewport.size.width - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.width)/(AWE.Config.MAP_CAMERA_MAX_VIEWFRAME_SIZE.width - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.width);
      valueW = Math.max(0,Math.min(valueW, 1));
      valueW = 1 -  Math.sqrt(valueW);
      var valueH = (viewport.size.height - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.height)/(AWE.Config.MAP_CAMERA_MAX_VIEWFRAME_SIZE.height - AWE.Config.MAP_CAMERA_MIN_VIEWFRAME_SIZE.height);
      valueH = Math.max(0,Math.min(valueH, 1));
      valueH = 1 - Math.sqrt(valueH);
      if (valueH > valueW) {
        zoomSlider.setValue(valueH);
      } else {
        zoomSlider.setValue(valueW);
      }
    };
    
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
    
    /** receives an event in case the size of the screen changes. On change
     * of dimensions will cause a needs-layout-event. */
    that.onResize = function() {
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
    }
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Scrolling
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    // starting
    
    that.prepareScrolling = function(posX, posY) {
      _scrollingStartedAtVC = AWE.Geometry.createPoint(posX, posY);
      _scrollingLastVCPosition = _scrollingStartedAtVC.copy();
      _scrollingOriginalTranslationVC = mc2vcTrans.copy();
        
      this.anchor().mousemove(function(ev) {
        that.onMouseMove(ev);
      });
    } 
    
    that.startScrolling = function() {
      _scrollingStarted = true;
    } 
    
    that.onMouseDown = function(evt) {
    //if (!_stages[2].hitTest(evt.pageX, evt.pageY)) {  // removed, for the moment, it's ok to scroll everywhere
      that.prepareScrolling(evt.pageX, evt.pageY);
    };    

    // scrolling
    
    that.onMouseMove = function(event) {
      // here we can assume, that the mouse is pressed right now!
      if (! that.isScrolling() && (Math.abs(event.pageX - _scrollingStartedAtVC.x) > 5 || Math.abs(event.pageY - _scrollingStartedAtVC.y > 5)))  {
        that.startScrolling();
      }
      if (that.isScrolling()) {
        /*var pos = AWE.Geometry.createPoint(_scrollingOriginalTranslationVC.x + event.pageX - _scrollingStartedAtVC.x, 
                                           _scrollingOriginalTranslationVC.y + event.pageY - _scrollingStartedAtVC.y);        
        //mc2vcTrans.moveTo(pos);*/
        
        var p1 = that.vc2mc(AWE.Geometry.createPoint(event.pageX, event.pageY));
        var p2 = that.vc2mc(_scrollingLastVCPosition);

        _camera.moveBy(
          AWE.Geometry.createPoint(
            p2.x - p1.x,
            p2.y - p1.y
          )
        );

        _scrollingLastVCPosition = AWE.Geometry.createPoint(event.pageX, event.pageY);
        
        //that.setNeedsLayout();
      }
    };
      
    // ending
    
    that.endScrolling = function() {
      this.anchor().unbind('mousemove');
      _scrollingStarted = false;
    }
    
    that.isScrolling = function() {
      return _scrollingStarted;
    }

    that.onMouseUp = function(evt) {
      that.endScrolling();
      _camera.onMouseUp(evt);
    }
    
    that.onMouseLeave = function(evt) {
      that.endScrolling();
    }
  

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Zooming
    //
    // ///////////////////////////////////////////////////////////////////////     
    
    that.onMouseWheel = function(ev) {
      
      // var evt = window.event;
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
    //   Mouse-Click
    //
    // ///////////////////////////////////////////////////////////////////////     
    
    /** received in case no view is hit by a click. used to unselect object on
     * click into background. */
    that.onClick = function() {
      
      if (currentAction) {
        currentAction = null;
        if (_selectedView) {
          _selectedView.annotationView().setActionMode(null);
        }
        _actionViewChanged = true;
      }
      else if (_selectedView) {
        _unselectView();
      }
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Actions
    //
    // ///////////////////////////////////////////////////////////////////////
    
		that.switchMapMode = function(realMap) {
			console.log("SWITCH MAP MODE", realMap);
			mapMode = realMap;
			AWE.Ext.applyFunctionToElements(regionViews, function(view) {
        view.setMapMode(realMap);
      });			
		}

    that.armyInfoButtonClicked = function(army) {
      if (!army) {
        return ;
      }
      
      var dialog = AWE.UI.Ember.ArmyInfoDialog.create({
        army: army,
        changeNamePressed: function(event) {
              
          var changeDialog = AWE.UI.Ember.TextInputDialog.create({
            heading: 'Enter the new name of this army.',
            input: this.get('army').get('name'),
            okPressed: function() {
              var action = AWE.Action.Military.createChangeArmyNameAction(army, this.get('input'));
              AWE.Action.Manager.queueAction(action);  
              this.destroy();            
            },
            cancelPressed: function() { this.destroy(); }
          });
          that.applicationController.presentModalDialog(changeDialog);
        },
        closePressed: function(event) {
          this.destroy();
        }
      });
      
      that.applicationController.presentModalDialog(dialog);
    }; 
    
    that.armyMoveButtonClicked = function(armyAnnotationView) {
      // actionObjekt erstellen      
      currentAction = {
        typeName: 'moveAction',
        army: armyAnnotationView.army(),
        clickedView: armyAnnotationView.annotatedView(),
        // armyAnnotationView: armyAnnotationView,
      }
      
      armyAnnotationView.setActionMode('moveTargetSelection');
      _actionViewChanged = true;
    };
    
    that.armyAttackButtonClicked = function(armyAnnotationView) {
      // actionObjekt erstellen      
      currentAction = {
        typeName: 'attackAction',
        army: armyAnnotationView.army(),
        clickedView: armyAnnotationView.annotatedView(),
        // armyAnnotationView: armyAnnotationView,
      }
      
      armyAnnotationView.setActionMode('attackTargetSelection');
      _actionViewChanged = true;
    };
    
    that.settlementAttackButtonClicked = function(settlementAnnotationView) {
      
      log('settlementAnnotationView', settlementAnnotationView);
      
      // actionObjekt erstellen      
      currentAction = {
        typeName: 'attackAction',
        army: settlementAnnotationView.annotatedView().army(),
        clickedView: settlementAnnotationView.annotatedView(),
      }
      
      settlementAnnotationView.setActionMode('attackTargetSelection');
      _actionViewChanged = true;
    };
    
    that.handleError = function(errorCode, errorDesc) { 
      console.log('ERROR ' + errorCode + ': ' + errorDesc);     
      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading: 'Failure',
        message: errorDesc,
      });      
      that.applicationController.presentModalDialog(dialog);
    }
    
    var armyMoveTargetClicked = function(army, targetLocation, armyView, targetView) {
      log('armyMoveTargetClicked', army, targetLocation, AWE.Map.locationTypes[targetLocation.id()]);
      var moveAction = AWE.Action.Military.createMoveArmyAction(army, targetLocation.id());
      moveAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setModelChanged();
            that.addDisappearingAnnotationLabel(targetView, 'ETA ' + army.get('target_reached_at'), 1500);
            that.addDisappearingAnnotationLabel(armyView, '-1 AP', 1000);
          });
        }
        else {
          that.handleError(status, "The server did not accept the movement comannd.");
        }
      });
    }
    
    that.armyCancelMoveButtonClicked = function(armyAnnotationView) {
      log('cancel move');
      var cancelAction = AWE.Action.Military.createCancelMoveArmyAction(armyAnnotationView.army());
      cancelAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK #
          AWE.GS.ArmyManager.updateArmy(armyAnnotationView.army().getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setModelChanged(); 
            that.addDisappearingAnnotationLabel(armyAnnotationView.annotatedView(), 'Cancelled.', 1000);
          });
        }
        else {
          that.handleError(status, "The server did not accept the cancel comannd.");
        }
      });     
    };

    var armyAttackTargetClicked = function(army, targetArmy, armyView) {
      log('armyAttackTargetClicked', army, targetArmy, armyView);
      var attackAction = AWE.Action.Military.createAttackArmyAction(army, targetArmy.getId());
      attackAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setModelChanged();
            that.addDisappearingAnnotationLabel(armyView, 'Attack started', 1000);
          });
        }
        else {
          that.handleError(status, "The server did not accept the attack comannd.");
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setModelChanged();
          });
          AWE.GS.ArmyManager.updateArmy(targetArmy.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            that.setModelChanged();
          });
        }
      });
    }
    
    var createArmyCreateAction = function(location, units, callback) {
      log('createArmyCreateAction', location, units);
      
      // TODO auf leere units testen
      
      
      var armyCreateAction = AWE.Action.Military.createCreateArmyAction(location, units);
      armyCreateAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArmyManager.updateArmiesAtLocation(location.id(), null, function(armies) {
            log('armies updated at location', armies, location);
            that.setModelChanged();
            if (callback) {
              callback();
            }
          }); 
        }
        else {
          that.handleError(status, "The server did not accept the movement comannd.");
        }
      });
    }
    
    that.newArmyButtonClicked = function(location) {
      if (!location) {
        return;
      }
      
      var dialog = AWE.UI.Ember.ArmyCreateDialog.create({
        locationId: location.id(),
        createPressed: function(evt) {
          createArmyCreateAction(location, this.unitQuantities(), (function(self){
            return function() {
              self.destroy();
            }
          })(this));           
          this.set('loading', true);
        },
        cancelPressed: function(evt) {
          this.destroy();
        },
        loading: false,
      });
      // garrisonArmy is set after create to trigger observer in view
      dialog.set('garrisonArmy', location.garrisonArmy()),
      
      that.applicationController.presentModalDialog(dialog);
    }
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   User Input Handling
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    /** returns the single map view that is presently selected by the user. 
     * this can be any of the gaming pieces (armies), markers or settlements.*/
    that.selectedView = function() { return _selectedView; };
    
    /** sets the selected view */
    that.setSelectedView = function(view) {
      // when selected view is set from outside, the view type has to determined
      // and the viewport has to be transformed to show the view. 
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
        
    var _actionViewChanged = false;

    that.buttonClicked = function(button) {
      log('button', button.text());
    };
    
    that.viewClicked = function(view) {
      
      var actionCompleted = false;
      
      // nach action unterscheiden
     
      if (currentAction) {
        if (currentAction.typeName === 'moveAction') {
          var targetLocations = getVisibleTargetLocations(currentAction.army);
          for (var key in targetLocations) {
            if (targetLocations.hasOwnProperty(key)) {
              var targetLocation = targetLocations[key];
              if (view.location && view.location() === targetLocation) {
                actionCompleted = true;
                break;
              }
            }
          }
        
          if (actionCompleted) {
            armyMoveTargetClicked(currentAction.army, targetLocation, currentAction.clickedView, view);
          }
          _actionViewChanged = true;
          currentAction = null;
          _selectedView.annotationView().setActionMode(null);
        }
        else if (currentAction.typeName === 'attackAction') {
          var targetArmies = getTargetArmies(currentAction.army);

          for (var key in targetArmies) {
            if (targetArmies.hasOwnProperty(key)) {
              var targetArmy = targetArmies[key];
              
              if (view.army && view.army() === targetArmy
                  || view.location && view.location().garrisonArmy() === targetArmy) {
                actionCompleted = true;
                break;
              }
            }
          }
        
          if (actionCompleted) {
            armyAttackTargetClicked(currentAction.army, targetArmy, currentAction.clickedView);
          }
          _actionViewChanged = true;
          currentAction = null;
          _selectedView.annotationView().setActionMode(null);
        }
      }
      else {
        that.setSelectedView(view);
      }
    };

    that.viewMouseOver = function(view) { // console.log('view mouse over: ' + view.typeName())
      if (view.typeName() === 'FortressView'
          || view.typeName() === 'ArmyView'
          || view.typeName() === 'BaseView'
          || view.typeName() === 'OutpostView'
          || view.typeName() === 'EmptySlotView') {
        _hoverView(view);
      }
      else if (view.typeName() === 'TargetView') {
        _hoverView(view.targetedView());
      }
      else if (view.typeName() === 'hudView') { // typeof view == 'hud'  (evtl. eigene methode)
        // _unhoverView();
      }
    };

    that.viewMouseOut = function(view) {
      if (view.typeName() === 'FortressView'
          || view.typeName() === 'ArmyView'
          || view.typeName() === 'BaseView'
          || view.typeName() === 'OutpostView'
          || view.typeName() === 'EmptySlotView') {
        _unhoverView(view);
      }
      else if (view.typeName() === 'TargetView') {
        _unhoverView(view.targetedView());
      }
    };
    
    /* view selection */
    
    var _selectView = function(view) {      
      _selectedView = view;
      _selectedView.setSelected(true);
      _showInspectorWith(_selectedView);
      _actionViewChanged = true;
    };
    
    var _unselectView = function(view) {
      _selectedView.setSelected(false);
      _selectedView = null;
      _hideInspector();
      currentAction = null;
      _actionViewChanged = true;
    };

    /* view highlighting */

    var _hoverView = function(view) {
      if (view !== _hoveredView) {
        _hoveredView = view;
        _hoveredView.setHovered(true);
        _actionViewChanged = true;
      }
    };

    var _unhoverView = function(view) {
      if (view.hovered()) {
        _hoveredView.setHovered(false);
        _hoveredView = null;
        _actionViewChanged = true;
      }
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Inspector (show / hide)
    //
    // /////////////////////////////////////////////////////////////////////// 

    var _showInspectorWith = function(view) { 
      if (inspectorViews.inspector) {
        _hideInspector();
      }
      
      if (view.typeName() === 'FortressView') {      
        inspectorViews.inspector = AWE.UI.createFortressDetailView();
        inspectorViews.inspector.initWithControllerAndNode(that, view.node());
        
        inspectorViews.inspector.onFlagClicked = function(allianceId) {
          WACKADOO.activateAllianceController(allianceId);
        }
        
        inspectorViews.inspector.onNewArmyButtonClick = function(location) {
          that.newArmyButtonClicked(location);
        };
      }
      else if (view.typeName() === 'ArmyView') {
        inspectorViews.inspector = AWE.UI.createArmyInspectorView();
        inspectorViews.inspector.initWithControllerAndArmy(that, view.army());
        
        inspectorViews.inspector.onInventoryButtonClick = (function(self) {
          return function(army) { self.armyInfoButtonClicked(army); }
        })(that);
        
        inspectorViews.inspector.onFlagClicked = function(allianceId) {
          WACKADOO.activateAllianceController(allianceId);
        }
      }
      else if (view.typeName() === 'BaseView') { 
        inspectorViews.inspector = AWE.UI.createBaseInspectorView();
        inspectorViews.inspector.initWithControllerAndLocation(that, view.location());

        inspectorViews.inspector.onNewArmyButtonClick = function(location) {
          that.newArmyButtonClicked(location);
        };
      }
      else if (view.typeName() === 'OutpostView') {
        inspectorViews.inspector = AWE.UI.createOutpostInspectorView();
        inspectorViews.inspector.initWithControllerAndLocation(that, view.location());

        inspectorViews.inspector.onNewArmyButtonClick = function(location) {
          that.newArmyButtonClicked(location);
        };
      }
      
      if (inspectorViews.inspector) {
        _stages[3].addChild(inspectorViews.inspector.displayObject());
        _inspectorChanged = true;
      }
    };

    var _hideInspector = function() {
      if (inspectorViews.inspector) {
        _stages[3].removeChild(inspectorViews.inspector.displayObject());
        delete inspectorViews.inspector;
      }
      _inspectorChanged = true;
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Animations
    //
    // ///////////////////////////////////////////////////////////////////////  
    
    that.addAnimation = function(animation) {
      _animations.push(animation);
    }
    
    /*
    that.removeAnimation = function(animation) {
      animation.cancel();
    }*/


    that.addTransientAnnotationView = function(annotatedView, annotation, duration, offset) {
      duration = duration || 1000;
      offset = offset || AWE.Geometry.createPoint(100,50);
      
      _stages[2].addChild(annotation.displayObject());
      console.log('added transient view.')

      
      var animation = AWE.UI.createTimedAnimation({
        view: annotation,
        duration: duration,
        
        updateView: function() {
          return function(view) {
            view.setOrigin(annotatedView.frame().origin.copy());  
          };
        }(),
        
        onAnimationEnd: function(viewToRemove) {
          return function() {
            _stages[2].removeChild(viewToRemove.displayObject());
            console.log('removed animated label on animation end');
          };
        }(annotation),
      });
      
      that.addAnimation(animation);
    }
    
    that.addTransientAnnotationLabel = function(annotatedView, message, duration, offset, frame) {
      var label = AWE.UI.createLabelView();
      label.initWithControllerAndLabel(this, message, true, frame);
      this.addTransientAnnotationView(annotatedView, label, duration, offset);
    }
    
    
    that.addDisappearingAnnotationLabel = function(annotatedView, message, duration, font, offset, frame) {
      duration = duration || 1000;
      offset = offset || AWE.Geometry.createPoint(100,50);
      font = font || '20px "Helvetica Neue", Helvetica, Arial';
      
      var label = AWE.UI.createLabelView();
      label.initWithControllerAndLabel(this, message, true, frame);  
      label.setFont(font);    
      label.setPadding(10);
      
      _stages[2].addChild(label.displayObject());
      console.log('added disappearing view.');
      
      var animation = AWE.UI.createTimedAnimation({
        view: label,
        duration: duration,
        
        updateView: function() {
          return function(view, elapsed) {
            view.setOrigin(AWE.Geometry.createPoint(annotatedView.frame().origin.x, 
                                                    annotatedView.frame().origin.y - (150.0*elapsed)));  
            view.setAlpha(1.0-Math.max(elapsed-0.5, 0.0)*2);
          };
        }(),
        
        onAnimationEnd: function(viewToRemove) {
          return function() {
            _stages[2].removeChild(viewToRemove.displayObject());
            console.log('removed animated label on animation end');
          };
        }(label),
      });
      
      that.addAnimation(animation);
    }
    

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
        
        // STOP HERE, in case the user is presently scrolling (depends on config).
        if (AWE.Config.MAPVIEW_DONT_UPDATE_MODEL_WHILE_SCROLLING && that.isScrolling()) return ;
        
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

            var armiesInRegion = AWE.GS.ArmyManager.getArmiesInRegion(nodes[i].region().id());
            
            
            AWE.Ext.applyFunctionToElements(armiesInRegion, function(army) {
              if (!isUpdateRunning('movingArmy') && army.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 20000 < new Date().getTime()) {
                if (army.get('mode') === 1 && army.get('target_reached_at') && Date.parseISODate(army.get('target_reached_at')).getTime() + 4000 < new Date().getTime()) { // wait four seconds before posting update request
                  console.log('start update of moving army');
                  startUpdate('movingArmy');
                  AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
                    stopUpdate('movingArmy');
                    that.setModelChanged();
                  });
                }
              }
            }); 
            
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
        
        if (!isUpdateRunning('armies') && AWE.Util.hashCount(armyUpdates)) { // check for needed armies once per second
          
          for (var armyId in armyUpdates) {
            if (armyUpdates.hasOwnProperty(armyId)) {
              var army = armyUpdates[armyId];
              delete armyUpdates[armyId];                           // process this event, remove it from queue
              
              if (army.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime()) {
                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmy(armyId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
                  stopUpdate('armies');
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
					view.setMapMode(mapMode);
          AWE.Ext.applyFunction(view.displayObject(), function(obj) {
//            obj.alpha = 0.3;
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
//            view.displayObject().alpha=0.3;
            _stages[1].addChild(view.displayObject()); // add view's displayObject to stage
          }
          if (view) {
            setFortressPosition(view, frame);
            newFortressViews[nodes[i].id()] = view;  
          }                    
        }
      }
      
      if (_selectedView
          && (_selectedView.typeName() === 'FortressView')
          && that.isFortressVisible(that.mc2vc(_selectedView.node().frame()))) {
        newFortressViews[_selectedView.node().id()] = _selectedView;
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
                if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()] === "base") {
                  view = AWE.UI.createBaseView();
                }             
                else if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()] === "outpost") {
                  view = AWE.UI.createOutpostView();
                }
                else if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()] === "empty") {
                  view = AWE.UI.createEmptySlotView();
                }
                if (view) {   // if base, outpost or empty slot on location, init the view
                  view.initWithControllerAndLocation(that, location);
//                  view.displayObject().alpha=0.3;
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
      
      if (_selectedView
          && (_selectedView.typeName() === 'BaseView' || _selectedView.typeName() === 'OutpostView')
          && that.isSettlementVisible(that.mc2vc(_selectedView.location().node().frame()))) {
        newLocationViews[_selectedView.location().id()] = _selectedView;
      }
      
      var removedSomething = purgeDispensableViewsFromStage(locationViews, newLocationViews, _stages[1]);
      locationViews = newLocationViews;      
      return removedSomething;
    }
    
    
    /** update the army views. */
    that.updateArmies = function(nodes) {
  
      var newArmyViews = {};
      var newMovementArrowViews = {};
      
      var processArmiesAtPos = function(armies, pos) {
        for (var key in armies) {
          if (armies.hasOwnProperty(key) && !armies[key].isGarrison()) {
            var army = armies[key];
            var view = armyViews[army.getId()];
            
            if (view) {       
              if (view.lastChange !== undefined && view.lastChange() < army.lastChange()) {
                view.setNeedsUpdate(); 
              }             
            }
            else {  // if view for army doesn't exists
              view = AWE.UI.createArmyView();
              view.initWithControllerAndArmy(that, army);
//              view.displayObject().alpha=0.3;
              _stages[1].addChild(view.displayObject());
            }                                  
            setArmyPosition(view, pos, army.getId(), frame);
            newArmyViews[army.getId()] = view;
            
            if (army.get('mode') === AWE.Config.ARMY_MODE_MOVING) {
              
              var targetRegionId = army.get('target_region_id');
              var targetLocationId = army.get('target_location_id');
              var regionId = army.get('region_id');
              var targetPos = null;
              
              if (targetRegionId != regionId) {
                var targetRegion = AWE.Map.Manager.getRegion(targetRegionId);
                if (targetRegion) {
                  var tframe = that.mc2vc(targetRegion.node().frame()); 
                  targetPos = AWE.Geometry.createPoint(
                    tframe.origin.x + tframe.size.width / 2 ,
                    tframe.origin.y + tframe.size.height / 2 - 60         
                  );  
                }
              }    
              else if (targetLocationId && targetRegionId) { // target location in same region as starting region -> this region must be available locally
                var targetLocation = AWE.Map.Manager.getLocation(targetLocationId);
                if (!targetLocation) {
                  AWE.Map.Manager.fetchLocationsForRegion(AWE.Map.Manager.getRegion(targetRegionId), function() {
                    view.setNeedsUpdate();
                  });
                }
                else {
                  targetPos = that.mc2vc(targetLocation.position());
                  targetPos.y -= 60;
                }
              }          
              
              if (targetPos) {
                
                var movementArrow = movementArrowViews[army.getId()];
              
                if (!movementArrow) {
                  movementArrow = AWE.UI.createMovementArrowView();
                  movementArrow.initWithControllerAndArmy(that, army);
                  _stages[1].addChild(movementArrow.displayObject());
                }

                movementArrow.setHovered(_hoveredView === view);
                movementArrow.setSelected(_selectedView === view);
              
                movementArrow.setStart(AWE.Geometry.createPoint(view.frame().origin.x+24, view.frame().origin.y+10));
                movementArrow.setEnd(AWE.Geometry.createPoint(targetPos.x, targetPos.y));
                newMovementArrowViews[army.getId()] = movementArrow;
              }
            }
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
      removedSomething = purgeDispensableViewsFromStage(movementArrowViews, newMovementArrowViews, _stages[1]) || removedSomething;
      armyViews = newArmyViews;      
      movementArrowViews = newMovementArrowViews;      
      return removedSomething;          
    }
    
    that.updateGamingPieces = function(nodes) {
      var removedSomething = false;
      
      removedSomething = that.updateFortresses(nodes)  || removedSomething;
      removedSomething = that.updateSettlements(nodes) || removedSomething;
      removedSomething = that.updateArmies(nodes)      || removedSomething;

      return removedSomething;
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Stage
    //
    // /////////////////////////////////////////////////////////////////////// 

    var getVisibleTargetLocations = function(army) {
      
      var targetLocations = [];
      var armyRegion = AWE.Map.Manager.getRegion(army.get('region_id'));
      var armyLocation = AWE.Map.Manager.getLocation(army.get('location_id'));
      
      if (armyLocation) {
        // get all possible target locations      
        if (AWE.Config.MAP_LOCATION_TYPE_CODES[armyLocation.settlementTypeId()] === 'fortress') {           // if armyLocation is fortress
          var regionLocations = armyRegion.locations();
          
          // add all location in same region
          for (var i = 1; i < regionLocations.length; i++) {
            targetLocations.push(regionLocations[i]);        
          }
          
          // add fortresses in bordering regions
          var neighbourNodes = armyRegion.node().getNeighbourLeaves();
          for (var i = 0; i < neighbourNodes.length; i++) {
            var region = neighbourNodes[i].region();
            if (region) {
              var location = region.location(0);             
              if (location) {
                targetLocations.push(location);
              }
              else {
                AWE.Map.Manager.fetchLocationsForRegion(region);
              }
            }
            else {
              AWE.Map.Manager.updateRegionForNode(neighbourNodes[i]);
            }
          }
        }
        else {
          targetLocations.push(armyLocation.region().location(0));
        }
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(armyRegion);
      }
      
      return targetLocations;
    }
    
    var getTargetArmies = function(army) {

      var targetArmies = [];
      var armyRegion = AWE.Map.Manager.getRegion(army.get('region_id'));
      var armyLocation = AWE.Map.Manager.getLocation(army.get('location_id'));

      if (armyLocation) {
        var armiesAtLocation = armyLocation.getArmies();
        
        AWE.Ext.applyFunctionToElements(armiesAtLocation, function(army) {
          if (!army.isOwn()) {
            targetArmies.push(army);
          }        
        });
        
        // var garrisonArmy = armyLocation.getGarrisonArmy();
//         
        // if (!garrisonArmy.isOwn()) {
          // targetArmies.push(garrisonArmy);
        // }        
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(armyRegion);
      }
      
      return targetArmies;
    }

    that.updateActionViews = function() {
      
      // helper method for creating the appropriate annotation view
      var createAnnotationView = function(annotatedView) {
        var annotationView = null;
        if (annotatedView.typeName() === 'FortressView') {
          annotationView = AWE.UI.createFortressAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onAttackButtonClick = (function(self) {
            return function(view) { self.settlementAttackButtonClicked(view); }
          })(that);
        }
        else if (annotatedView.typeName() === 'ArmyView') {
          annotationView = AWE.UI.createArmyAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onMoveButtonClick = (function(self) {
            return function(view) { self.armyMoveButtonClicked(view); }
          })(that);
          
          annotationView.onCancelMoveButtonClick = (function(self) {
            return function(view) { self.armyCancelMoveButtonClicked(view); }
          })(that);
                    
          annotationView.onAttackButtonClick = (function(self) {
            return function(view) { self.armyAttackButtonClicked(view); }
          })(that);
          
          armyUpdates[annotatedView.army().getId()] = annotatedView.army();
        }
        else if (annotatedView.typeName() === 'BaseView') {
          annotationView = AWE.UI.createBaseAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onAttackButtonClick = (function(self) {
            return function(view) { self.settlementAttackButtonClicked(view); }
          })(that);
        }
        else if (annotatedView.typeName() === 'OutpostView') {
          annotationView = AWE.UI.createOutpostAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onAttackButtonClick = (function(self) {
            return function(view) { self.settlementAttackButtonClicked(view); }
          })(that);
        }
        else if (annotatedView.typeName() === 'EmptySlotView') {
          annotationView = AWE.UI.createEmptySlotAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);
        }
    
        annotatedView.setAnnotationView(annotationView);
        
        return annotationView;
      }
      
      // delete hovered view if necessary
      if ((!_hoveredView && actionViews.hovered
          || _hoveredView && actionViews.hovered && actionViews.hovered.annotatedView() !== _hoveredView)
          && actionViews.hovered !== actionViews.selected) {
        _stages[2].removeChild(actionViews.hovered.displayObject());
      }            

      // create new hovered view if necessary               
      if ((_hoveredView && !actionViews.hovered)
          || (_hoveredView && actionViews.hovered
            && actionViews.hovered.annotatedView() !== _hoveredView)) {
        if (actionViews.selected && _hoveredView === actionViews.selected.annotatedView()) {
          actionViews.hovered = actionViews.selected;
        }
        else {
          var annotationView = createAnnotationView(_hoveredView);
          if (annotationView) {
            actionViews.hovered = annotationView;
            _stages[2].addChild(actionViews.hovered.displayObject());
          }
        }
      }         
               
      // move hovered view if existing
      if (_hoveredView && actionViews.hovered) {
        if (actionViews.hovered.lastChange !== undefined && _hoveredView.model && actionViews.hovered.lastChange() < _hoveredView.lastChange()) {  // should better test the model
          actionViews.hovered.setNeedsUpdate();
        }             
        actionViews.hovered.setCenter(AWE.Geometry.createPoint(
            _hoveredView.center().x,
            _hoveredView.center().y
        ));
        actionViews.hovered.setNeedsUpdate();
      }
      else {
        if (actionViews.hovered) {
          delete actionViews.hovered;        
        }
      }
      
      // delete selected view if necessary
      if ((!_selectedView && actionViews.selected
          || _selectedView && actionViews.selected && actionViews.selected.annotatedView() !== _selectedView)
          && actionViews.selected !== actionViews.hovered) {
        _stages[2].removeChild(actionViews.selected.displayObject());
      }            

      // create new selected view if necessary               
      if ((_selectedView && !actionViews.selected)
          || (_selectedView && actionViews.selected
            && actionViews.selected.annotatedView() !== _selectedView)) {
        if (actionViews.hovered && _selectedView === actionViews.hovered.annotatedView()) {
          actionViews.selected = actionViews.hovered;
        }
        else {
          var annotationView = createAnnotationView(_selectedView);
          if (annotationView) {
            actionViews.selected = annotationView;
            _stages[2].addChild(actionViews.selected.displayObject());
          }
        }
      }         
               
      // move selected view if existing
      if (_selectedView && actionViews.selected) {
        if (actionViews.selected.lastChange !== undefined && _selectedView.model && actionViews.selected.lastChange() < _selectedView.lastChange()) {  // should better test the model
          actionViews.selected.setNeedsUpdate();
        }   
        actionViews.selected.setCenter(AWE.Geometry.createPoint(
            _selectedView.center().x,
            _selectedView.center().y
        ));
        actionViews.selected.setNeedsUpdate();
      }
      else {
        if (actionViews.selected) {
          delete actionViews.selected;        
        }
      }
      
      // helper method
      var setTargetPosition = function(view, pos) {
        view.setCenter(AWE.Geometry.createPoint(
          pos.x,
          pos.y - 48
        ));
      }
      
      var newTargetViews = {};

      if (currentAction) {
        if (currentAction.typeName === 'moveAction') {
          var targetLocations = getVisibleTargetLocations(currentAction.army);
          AWE.Ext.applyFunctionToElements(targetLocations, function(location) {
            var targetView = targetViews[location.id()];
            
            if (AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()] === 'fortress') {
              var visible = that.isFortressVisible(that.mc2vc(location.node().frame()));
              var locationView = fortressViews[location.node().id()];
            }
            else {   
              var visible = that.isSettlementVisible(that.mc2vc(location.node().frame()));
              var locationView = locationViews[location.id()];
            }
            
            if (visible && locationView) {
              if (!targetView) {       
                targetView = AWE.UI.createTargetView();
                targetView.initWithControllerAndTargetedView(that, locationView);
                _stages[2].addChild(targetView.displayObject());
                locationView.setTargetView(targetView);
              }                                  
              setTargetPosition(targetView, locationView.center());
              newTargetViews[location.id()] = targetView;
            }
          });
        }
        else if (currentAction.typeName === 'attackAction') {
          // target views entsprechend der sichtbarkeit der armeen verschieben
          var targetArmies = getTargetArmies(currentAction.army);
          AWE.Ext.applyFunctionToElements(targetArmies, function(army) {
            var targetView = targetViews[army.getId()];
            var armyLocation = AWE.Map.Manager.getLocation(army.get('location_id'));
            var targetedView = army.isGarrison() ? locationViews[armyLocation.id()] : armyViews[army.getId()];
            
            if (AWE.Config.MAP_LOCATION_TYPE_CODES[armyLocation.settlementTypeId()] === 'fortress') {
              var visible = that.areArmiesAtFortressVisible(that.mc2vc(armyLocation.node().frame()));
            }
            else {
              var visible = that.areArmiesAtSettlementsVisible(that.mc2vc(armyLocation.node().frame())); 
            }
            
            if (visible && targetedView) {
              if (!targetView) {       
                targetView = AWE.UI.createTargetView();
                targetView.initWithControllerAndTargetedView(that, targetedView);
                _stages[2].addChild(targetView.displayObject());
                // locationView.setTargetView(targetView);
              }                                  
              setTargetPosition(targetView, targetedView.center());
              newTargetViews[army.getId()] = targetView;
            }
          });
        }
      }
      
      var removedSomething = purgeDispensableViewsFromStage(targetViews, newTargetViews, _stages[2]);
      targetViews = newTargetViews; 
           
      return removedSomething || _actionViewChanged;
    };
    


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Inspector Stage
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateInspectorViews = function() {
      if (inspectorViews.inspector) {
        inspectorViews.inspector.setOrigin(AWE.Geometry.createPoint(_windowSize.width-345, _windowSize.height-155));
      }
      if (inspectorViews.tempToggleButtonView) {
        inspectorViews.tempToggleButtonView.setOrigin(AWE.Geometry.createPoint(20, _windowSize.height - 68));
      }
      return _inspectorChanged || _windowChanged;
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
        
        var stagesNeedUpdate = [false, false, false, false]; // replace true with false as soon as stage 1 and 2 are implemented correctly.
        
        // rebuild individual hieararchies
        if (_windowChanged || this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[0] = this.rebuildMapHierarchy(nodes) || stagesNeedUpdate[0];
        }
        
        if (_windowChanged || this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea)) || _actionViewChanged ) {
          stagesNeedUpdate[1] = this.updateGamingPieces(nodes) || stagesNeedUpdate[1];
        };
        
        if (_windowChanged || this.modelChanged() || _actionViewChanged || currentAction || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[2] = that.updateActionViews();
        }
        
        if (_windowChanged || _actionViewChanged || !inspectorViews.inspector || _inspectorChanged) { // TODO: only update at start and when something might have changed (object selected, etc.)
          stagesNeedUpdate[3] = that.updateInspectorViews() || stagesNeedUpdate[3]; 
        }
        
        // log('Update:                   ', stagesNeedUpdate[0], stagesNeedUpdate[1], stagesNeedUpdate[2], stagesNeedUpdate[3])

        // console.log('propagate update');


        // update hierarchies and check which stages need to be redrawn
        stagesNeedUpdate[0] = propUpdates(regionViews) || stagesNeedUpdate[0];
        stagesNeedUpdate[1] = propUpdates(fortressViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(locationViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(armyViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(movementArrowViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[2] = propUpdates(actionViews) || stagesNeedUpdate[2];
        stagesNeedUpdate[3] = propUpdates(inspectorViews) || stagesNeedUpdate[3];

        // log('Update after propagation: ', stagesNeedUpdate[0], stagesNeedUpdate[1], stagesNeedUpdate[2], stagesNeedUpdate[3])

        
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
        // STEP 0: update the camera, in case that it is currently moving
        if (_camera.hasChanged()) {
          _camera.update();
          var newViewport = _camera.viewport();
          //console.log("newViewport="+newViewport.toString());
          if (newViewport !== null && newViewport !== undefined) {
            that.setViewport(newViewport);
            that.setNeedsLayout();
          } else {
            console.error("the camera needed an update, but did not return a new viewport");
          }
        }
        
        // STEP 1: determine visible area (may have changed through user interaction)
        var visibleArea = that.vc2mc(AWE.Geometry.createRect(0, 0, _windowSize.width,_windowSize.height));
        
        // STEP 2: trigger update of model as needed, fetch new data from server
        that.updateModel(visibleArea);
        
        // STEP 3: layout canvas & stages according to possibly changed window size (TODO: clean this!)
        that.layoutIfNeeded();   
        
        // STEP 3b: animations
        var animating = false;
        AWE.Ext.applyFunction(_animations, function(animation) {
          if (animation.animating()) {
            animating = true;
          }
        });
  
        
        // STEP 4: update views and repaint view hierarchies as needed
        if (_windowChanged || _needsDisplay || _loopCounter % 30 == 0 || that.modelChanged() || _actionViewChanged || animating) {
          // STEP 4a: get all visible nodes from the model
          var visibleNodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleArea, level(), false, that.modelChanged());    
          
          // STEP 4b: create, remove and update all views according to visible parts of model      
          var stageUpdateNeeded = that.updateViewHierarchy(visibleNodes, visibleArea);
    
          if (animating) {
            var runningAnimations = [];
            AWE.Ext.applyFunction(_animations, function(animation) {
              animation.update();
              if (!animation.ended()) {
                runningAnimations.push(animation);
              }
            });
            _animations = runningAnimations;
          }
          
          stageUpdateNeeded[2] = stageUpdateNeeded[2] || animating; ///< ANIMATION HACK (all animations on layer 2)
          
          // STEP 4c: update (repaint) those stages, that have changed (one view that needsDisplay triggers repaint of whole stage)
          var viewsInStages = [
            regionViews,
            [fortressViews, armyViews, locationViews, movementArrowViews],
            [actionViews, targetViews],
            inspectorViews,
          ];          
          
          for (var i=0; i < _stages.length; i++) {
            if (stageUpdateNeeded[i] || _windowChanged) {
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
        _actionViewChanged = false;
        _inspectorChanged = false;
        _windowChanged = false;
      }
      _loopCounter++;
    };
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



