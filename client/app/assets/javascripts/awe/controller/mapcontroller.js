/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = function (module) {

  module.createMapController = function (anchor) {

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
    var _windowChanged = false;    ///< true, in case the size of the map screen has changed.

    var _scrollingStarted = false;///< user is pres ently scrolling
    var _scrollingStartedAtVC;
    var _scrollingOriginalTranslationVC;
    var _scrollingLastVCPosition;
    var _disableArmies = false;
    var _viewPortChanged = false;
    var _timeout = false;

    var _animations = [];

    var _camera; ///< camera for handeling camera panning

    var that = module.createScreenController(anchor); ///< create base object

    that.typeName = 'MapController';

    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init;
    _super.runloop = that.runloop;
    _super.append = function (f) {
      return function () {
        f.apply(that);
      };
    }(that.append);
    _super.remove = function (f) {
      return function () {
        f.apply(that);
      };
    }(that.remove);

    var _loopCounter = 0;        ///< counts every cycle through the loop
    var _frameCounter = 0;       ///< counts every rendered frame

    var _modelChanged = false;   ///< true, if anything in the model changed
    var _maptreeChanged = false; ///< true, if anything in the maptree (just nodes!) changed. _maptreeChanged = true implies modelChanged = true

    var _inspectorChanged = false; ///< true, if a detailView has been added, removed or changed

    that.requestingMapNodesFromServer = false;

    var regionViews = {};
    var fortressViews = {};
    var artifactViews = {};
    var armyViews = {};
    var movementArrowViews = {};
    var locationViews = {};
    var actionViews = {};
    var targetViews = {};
    var inspectorViews = {};
    that.ownBaseMarkerAnimation = null;
    that.ownArmyMarkerAnimation = null;

    var zoomSlider = undefined;

    var armyUpdates = {};

    var currentAction = null;

    var mapMode = AWE.UI.MAP_MODE_TERRAIN; //  display game graphics
    
    var hideOtherArmies = !AWE.GS.game.getPath('currentCharacter.finishedTutorial');

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////

    /** intializes three stages for displaying the map-background,
     * the playing pieces (armies, fortresses, settlements), and
     * the HUD. */
    that.init = function (initialFrameModelCoordinates) {
      _super.init();

      _sortStages = [false, true, false, false];  // which stages to y-sort? -> presently, only the gaming pieces need to be sorted.

      var root = that.rootElement();

      // background layer, displays region tiles
      root.append('<canvas id="map-tile-canvas"></canvas>');
      _canvas[0] = root.find('#map-tile-canvas')[0];
      _stages[0] = new Stage(_canvas[0]);
      _stages[0].onClick = function () {
      };   // we generate our own clicks


      // selectable gaming pieces layer (fortresses, armies, etc.)
      root.append('<canvas id="gaming-pieces-canvas"></canvas>');
      _canvas[1] = root.find('#gaming-pieces-canvas')[0];
      _stages[1] = new Stage(_canvas[1]);
      _stages[1].onClick = function () {
      };   // we generate our own clicks

      // layer for mouseover and selection objects
      root.append('<canvas id="annotation-canvas"></canvas>');
      _canvas[2] = root.find('#annotation-canvas')[0];
      _stages[2] = new Stage(_canvas[2]);
      _stages[2].onClick = function () {
      };   // we generate our own clicks


      // layer for the object inspector
      root.append('<canvas id="inspector-canvas"></canvas>');
      _canvas[3] = root.find('#inspector-canvas')[0];
      _stages[3] = new Stage(_canvas[3]);
      _stages[3].onClick = function () {
      };   // we generate our own clicks

//      root.append('<div style="position:abolute; left:0; top:20px; width:50px; height:50px; background-color:#F00;">A</div>');

      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setViewport(initialFrameModelCoordinates);
      that.setNeedsLayout();

      //create the camera with the initial values
      _camera = AWE.UI.createCamera({
        rootController:that,
        windowSize:that.windowSize(),
        viewport:initialFrameModelCoordinates
      });

      //zoom slider
      $("body").append('<div class="zoom_slider"><div class="slider_container"><img src="' + AWE.Config.RAILS_ASSET_PATH + 'ui/slider.png" class="slider_slider"><div class="slider_bar"></div><div>');
      $("body").find(".zoom_slider").each(function (i, value) {
        if (zoomSlider !== undefined) {
          console.error("found more than one zoom slider");
        }
        zoomSlider = AWE.UI.createSlider(value, true, true, that.handleZoomSliderValueUpdate);
        $(zoomSlider.getContainer()).remove();
      });


      if (AWE.Config.MAP_USE_GOOGLE || AWE.Config.MAP_USE_OSM) {
        inspectorViews.tempToggleButtonView = AWE.UI.createTempToggleButtonView();
        inspectorViews.tempToggleButtonView.initWithController(that, AWE.Geometry.createRect(0, 0, 48, 48));
        _stages[3].addChild(inspectorViews.tempToggleButtonView.displayObject());
      }

      inspectorViews.mapButtonsBackgroundView = AWE.UI.createImageView();
      inspectorViews.mapButtonsBackgroundView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage('ui/button/map/background'));
      inspectorViews.mapButtonsBackgroundView.setFrame(AWE.Geometry.createRect(0, 0, 190, 150));
      _stages[3].addChild(inspectorViews.mapButtonsBackgroundView.displayObject());

      inspectorViews.mapTypeToggleButtonView = AWE.UI.createMapTypeToggleButtonView();
      inspectorViews.mapTypeToggleButtonView.initWithController(that, AWE.Geometry.createRect(0, 0, 68, 70));
      _stages[3].addChild(inspectorViews.mapTypeToggleButtonView.displayObject());

      inspectorViews.encyclopediaButtonView = AWE.UI.createEncyclopediaButtonView();
      inspectorViews.encyclopediaButtonView.initWithController(that, AWE.Geometry.createRect(0, 0, 68, 70));
      _stages[3].addChild(inspectorViews.encyclopediaButtonView.displayObject());

    };
    

    that.getStages = function () {
      return [
        { stage:_stages[0], mouseOverEvents:false, transparent:true},
        { stage:_stages[1], mouseOverEvents:true },
        { stage:_stages[2], mouseOverEvents:true },
        { stage:_stages[3], mouseOverEvents:true }
      ];
    };

    that.viewDidAppear = function () {
      $("body").append(zoomSlider.getContainer());
      $("body").append('<div class="link-pane"><a href="' + AWE.Config.EXTERNAL_FACEBOOK_URL + '" target="_blank"><img class="fb-icon" src="' + AWE.Config.RAILS_ASSET_PATH + 'icons/fb.png" /></a> &nbsp; ' +
        '                       <a href="' + AWE.Config.EXTERNAL_FORUM_URL + '" target="_blank">Forum</a> &nbsp; ' +
        '                       <a href="' + AWE.Config.EXTERNAL_MANUAL_URL + '" target="_blank">Manual</a> &nbsp; ' +
        '                       <a href="#" onClick="WACKADOO.reload()">Reload</a></div>');
      window.WACKADOO.addDomElement($('.link-pane'), false);
      window.WACKADOO.addDomElement(zoomSlider.getContainer(), true);
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height())); // prevents distortion in case window has resized while displaying another screen
      zoomSlider.subscribeToDOMEvents();
    }

    that.viewWillDisappear = function () {
      $(zoomSlider.getContainer()).remove();
      $('.link-pane').remove();
      window.WACKADOO.removeDomElement($('.link-pane'));
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
    that.mc2vc = function (obj) {

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
    that.vc2mc = function (obj) {

      // if obj os rect
      if (obj.origin !== undefined && obj.size !== undefined) {
        var rect = obj.copy();
        rect.origin.moveBy(AWE.Geometry.createPoint(-mc2vcTrans.x, -mc2vcTrans.y));
        rect.origin.scale(1 / mc2vcScale);
        rect.size.scale(1 / mc2vcScale);
        return rect;
      }
      // if obj is point
      else if (obj.x !== undefined && obj.y !== undefined) {
        var point = obj.copy();
        point.moveBy(AWE.Geometry.createPoint(-mc2vcTrans.x, -mc2vcTrans.y));
        //point.moveBy(n(mc2vcTrans));
        point.scale(1 / mc2vcScale);
        return point;
      }
      // if obj is size
      else if (obj.width !== undefined && obj.height !== undefined) {
        var size = obj.copy();
        size.scale(1 / mc2vcScale);
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
    that.setWindowSize = function (size) {
      if (!_windowSize || _windowSize.width != size.width || _windowSize.height != size.height) {
        _windowSize = size;
        _windowChanged = true;
        that.setNeedsLayout();
        if (_camera !== undefined) {
          _camera.windowSize(size);
        }
      }
    };

    /** returns the window size (canvas internal view coordinates). */
    that.windowSize = function () {
      return _windowSize;
    };

    /** sets the map to display the specified region (in model coordinates).
     */
    that.setViewport = function (visibleRectMC) {
      mc2vcScale = 1. * _windowSize.width / visibleRectMC.size.width;
      mc2vcTrans = AWE.Geometry.createPoint(
        -1. * visibleRectMC.origin.x * _windowSize.width / visibleRectMC.size.width,
        -1. * visibleRectMC.origin.y * _windowSize.height / visibleRectMC.size.height
      );
      //
      if (zoomSlider !== undefined) {
        that.updateZoomSliderValue();
      }
    };

    /** returns the currently visible viewport in model coordinates **/
    that.viewport = function () {
      var w = _windowSize.width / mc2vcScale;
      var h = _windowSize.height / mc2vcScale;
      return AWE.Geometry.createRect(
        -1. * mc2vcTrans.x * w / _windowSize.width,
        -1. * mc2vcTrans.y * h / _windowSize.height,
        w,
        h
      );
    };

    /** zoom in and out. */
    that.zoom = function (dScale, zoomin) {
      // TODO: calc max and min zoom value
      _camera.zoom(dScale, zoomin);
    };
    /**
     * Moves the camera to the given value.
     * @param value the value can be a array of nodes, a node, a frame, a location, a region or a point. In case it is a point the viewport center will be moved there.
     * @param animated default:true. if false
     * @param addBorder default:true. if true there will be. If a point is given, addBroder should probably be set to false.
     **/
    that.moveTo = function (value, addBorder, animated) {
      if (_camera.isMoving()) {
        log("The camera cannot be moved while it is already moving");
        return;
      }
      _camera.moveTo(value, addBorder, animated);
    };

    /** calculate and returns the presently visible map level in dependence of the
     * present scale. Uses memoization to cache result. */
    var level = (function () {

      var _level = null;
      var _memRootNodeWidth;
      var _memMc2vcScale;

      return function () {
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
    that.alpha = function (width, min, max) {

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

    that.handleZoomSliderValueUpdate = function (value) {
      /*value = -1*value*(value-2);
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
       );*/
      value = value * (value - 2) + 1;
      var minZoomFactor = AWE.Config.MAP_CAMERA_MIN_ZOOMFACTOR;
      var maxZoomFactor = AWE.Config.MAP_CAMERA_MAX_ZOOMFACTOR;
      _camera.moveTo(((maxZoomFactor - minZoomFactor) * value) + minZoomFactor, false, false, true);
    };

    that.updateZoomSliderValue = function () {
      var minZoomFactor = AWE.Config.MAP_CAMERA_MIN_ZOOMFACTOR;
      var maxZoomFactor = AWE.Config.MAP_CAMERA_MAX_ZOOMFACTOR;

      var zoomFactor = _camera.getZoomFactor();
      var v = zoomFactor - minZoomFactor;
      if (v < 0) {
        zoomSlider.setValue(1);
        return;
      }
      v = v / (maxZoomFactor - minZoomFactor);
      //v = 1 - v;
      v = 1 - Math.sqrt(v);
      //v = 1 - v;
      v = Math.max(0, Math.min(v, 1));
      log("setting value to ");
      zoomSlider.setValue(v);
      /*var viewport = that.viewport();
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
       }*/
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Laying out the Map
    //
    // ///////////////////////////////////////////////////////////////////////

    /** set to true in case the window needs to be layouted again (e.g. after
     * a resize event). */
    that.setNeedsLayout = function () {
      _needsLayout = true;
    }

    /** reset the size of the "window" (canvas) in case its dimension has
     * changed. */
    that.layoutIfNeeded = function () {
      if (_needsLayout) {   ///// WRONG: no _needsLayout after zooming!!!
        if (_canvas[0].width != _windowSize.width || _canvas[0].height != _windowSize.height) {
          _canvas[0].width = _windowSize.width;
          _canvas[0].height = _windowSize.height;

          _canvas[1].width = _windowSize.width;
          _canvas[1].height = _windowSize.height;

          _canvas[2].width = _windowSize.width;
          _canvas[2].height = _windowSize.height;

          _canvas[3].width = _windowSize.width;
          _canvas[3].height = _windowSize.height;
        }
        ;
        that.setNeedsDisplay();
      }
      ;
      _needsLayout = false;
    }

    /** set to true in case the whole window needs to be repainted. */
    that.setNeedsDisplay = function () {
      _needsDisplay = true;
    }

    /** receives an event in case the size of the screen changes. On change
     * of dimensions will cause a needs-layout-event. */
    that.onResize = function () {
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
    }

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Scrolling
    //
    // ///////////////////////////////////////////////////////////////////////

    // starting

    that.prepareScrolling = function (posX, posY) {
      _scrollingStartedAtVC = AWE.Geometry.createPoint(posX, posY);
      _scrollingLastVCPosition = _scrollingStartedAtVC.copy();
      _scrollingOriginalTranslationVC = mc2vcTrans.copy();

      this.anchor().mousemove(function (ev) {
        that.onMouseMove(ev);
      });
    }

    that.startScrolling = function () {
      _scrollingStarted = true;
    }

    that.onMouseDown = function (evt) {
      //if (!_stages[2].hitTest(evt.pageX, evt.pageY)) {  // removed, for the moment, it's ok to scroll everywhere
      that.prepareScrolling(evt.pageX, evt.pageY);
    };

    // scrolling

    that.onMouseMove = function (event) {
      // here we can assume, that the mouse is pressed right now!
      if (!that.isScrolling() && (Math.abs(event.pageX - _scrollingStartedAtVC.x) > 5 || Math.abs(event.pageY - _scrollingStartedAtVC.y > 5))) {
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

    that.endScrolling = function () {
      this.anchor().unbind('mousemove');
      _scrollingStarted = false;
    }

    that.isScrolling = function () {
      return _scrollingStarted;
    }

    that.onMouseUp = function (evt) {
      that.endScrolling();
    }

    that.onDoubleClick = function (evt) {
      _camera.onDoubleClick(evt);
    }

    that.onMouseLeave = function (evt) {
      that.endScrolling();
    }


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Zooming
    //
    // ///////////////////////////////////////////////////////////////////////

    that.onMouseWheel = function (ev) {

      // var evt = window.event;
      if (ev && ev.originalEvent) {
        evt = ev.originalEvent
      }

      var delta = 0;

      if (evt.wheelDelta) { /* IE/Opera. */
        delta = evt.wheelDelta / 120;
      }
      else if (evt.detail) { /** Mozilla case. */
        /** In Mozilla, sign of delta is different than in IE.
         * Also, delta is multiple of 3.
         */
        delta = -evt.detail / 3;
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
    that.onClick = function () {

      if (currentAction) {
        currentAction = null;
        if (_selectedView && _selectedView.annotationView()) {
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

    that.switchMapMode = function (realMap) {
      log("SWITCH MAP MODE", realMap);
      mapMode = realMap ? AWE.UI.MAP_MODE_REAL : AWE.UI.MAP_MODE_TERRAIN;
      AWE.Ext.applyFunctionToElements(regionViews, function (view) {
        view.setMapMode(mapMode);
      });
    }

    that.switchMapType = function (mapTypeIndex) {
      log("SWITCH MAP TYPE", hideOtherArmies);

      if(mapTypeIndex == 0) {
        mapMode = AWE.UI.MAP_MODE_TERRAIN;
        hideOtherArmies = false;
      } else if(mapTypeIndex == 1) {
        mapMode = AWE.UI.MAP_MODE_TERRAIN;
        hideOtherArmies = true;
      } else if(mapTypeIndex == 2) {
        mapMode = AWE.UI.MAP_MODE_STRATEGIC;
        hideOtherArmies = false;
      } else {
        mapMode = AWE.UI.MAP_MODE_STRATEGIC;
        hideOtherArmies = true;
      }

      AWE.Ext.applyFunctionToElements(regionViews, function (view) {
        view.setMapMode(mapMode);
      });
    }
    
    that.toggleArmyVisibility = function() {
      hideOtherArmies = !hideOtherArmies;
    }

    that.armyInfoButtonClicked = function (army) {
      if (!army) {
        return;
      }

      var dialog = AWE.UI.Ember.ArmyInfoDialog.create({
        army:army,

        changeStanceCallback:function () {
          if (inspectorViews.inspector) {
            inspectorViews.inspector.updateView();
          }
        },
      });
      dialog.showModal();
    };

    that.armyMoveButtonClicked = function (armyAnnotationView) {
      // actionObjekt erstellen
      currentAction = {
        typeName:'moveAction',
        army:armyAnnotationView.army(),
        clickedView:armyAnnotationView.annotatedView(),
        // armyAnnotationView: armyAnnotationView,
      }

      armyAnnotationView.setActionMode('moveTargetSelection');
      _actionViewChanged = true;
    };

    that.armyAttackButtonClicked = function (armyAnnotationView) {
      // actionObjekt erstellen
      currentAction = {
        typeName:'attackAction',
        army:armyAnnotationView.army(),
        clickedView:armyAnnotationView.annotatedView(),
        // armyAnnotationView: armyAnnotationView,
      }

      armyAnnotationView.setActionMode('attackTargetSelection');
      _actionViewChanged = true;
    };


    that.settlementAttackButtonClicked = function (settlementAnnotationView) {

      log('settlementAnnotationView', settlementAnnotationView);

      // actionObjekt erstellen
      currentAction = {
        typeName:'attackAction',
        army:settlementAnnotationView.annotatedView().army(),
        clickedView:settlementAnnotationView.annotatedView(),
      }

      settlementAnnotationView.setActionMode('attackTargetSelection');
      _actionViewChanged = true;
    };

    that.handleError = function (errorCode, errorDesc) {
      log('ERROR ' + errorCode + ': ' + errorDesc);
      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading:'Failure',
        message:errorDesc,
      });
      that.applicationController.presentModalDialog(dialog);
    }

    var armyMoveTargetClicked = function (army, targetLocation, armyView, targetView) {
      log('armyMoveTargetClicked', army, targetLocation, AWE.Map.locationTypes[targetLocation.id()]);
      var moveAction = AWE.Action.Military.createMoveArmyAction(army, targetLocation.id());
      moveAction.send(function (status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
            that.addDisappearingAnnotationLabel(targetView, 'ETA ' + Date.parseISODate(army.get('target_reached_at')).toString('HH:mm:ss'), 1500);
            that.addDisappearingAnnotationLabel(armyView, '-1 AP', 1000);
          });
        }
        else {
          that.handleError(status, "The server did not accept the movement comannd.");
        }
      });
    }

    that.armyCancelMoveButtonClicked = function (armyAnnotationView) {
      log('cancel move');
      var cancelAction = AWE.Action.Military.createCancelMoveArmyAction(armyAnnotationView.army());
      cancelAction.send(function (status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK #
          AWE.GS.ArmyManager.updateArmy(armyAnnotationView.army().getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
            that.addDisappearingAnnotationLabel(armyAnnotationView.annotatedView(), 'Cancelled.', 1000);
          });
        }
        else {
          that.handleError(status, "The server did not accept the cancel comannd.");
        }
      });
    };

    var armyAttackTargetClicked = function (army, targetArmy, armyView) {
      log('armyAttackTargetClicked', army, targetArmy, armyView);

      var dialog = AWE.UI.Ember.AttackDialog.create({
        army:army,
        targetArmy:targetArmy,

        friendlyArmies:[],
        enemyArmies:[],

        cancelPressed:function (evt) {
          // armyAnnotationView.setActionMode('');
          this.destroy();
        },
        attackPressed:function (evt) {
          createArmyAttackAction(army, targetArmy, armyView);
          this.destroy();
        },
      });
      that.applicationController.presentModalDialog(dialog);
    }

    var createArmyAttackAction = function (army, targetArmy, armyView) {
      log('createArmyAttackAction', army, targetArmy, armyView);
      var attackAction = AWE.Action.Military.createAttackArmyAction(army, targetArmy.getId());
      attackAction.send(function (status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
            that.addDisappearingAnnotationLabel(armyView, 'Attack started', 1000);
          });
          AWE.GS.ArmyManager.updateArmy(targetArmy.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
          });
        }
        else {
          that.handleError(status, "The server did not accept the attack comannd.");
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
          });
          AWE.GS.ArmyManager.updateArmy(targetArmy.getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
            that.setModelChanged();
          });
        }
      });
    }

    that.armyFoundSettlementButtonClicked = function (armyAnnotationView) {
      armyAnnotationView.setActionMode('foundSettlement');
      _actionViewChanged = true;

      var dialog = AWE.UI.Ember.FoundSettlementDialog.create({
        army:armyAnnotationView.army(),

        foundPressed:function (evt) {
          var army = this.get('army');
          var location = AWE.Map.Manager.getLocation(this.getPath('army.location_id'));

          if (!army || !location) {
            that.handleError("ClientError", "Der Außenposten konnte leider nicht gegründet werden. Die Daten in Deinem Client sind veraltet. Bitte versuch es gleich noch mal oder kontaktiere den Support, wenn es sich um einen Fehler handelt.");
            armyAnnotationView.setActionMode('');
            return;
          }

          var action = AWE.Action.Military.createFoundOutpostAction(army, location);
          action.send(function (status) {
            armyAnnotationView.setActionMode('');
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
              AWE.Map.Manager.fetchLocationsForRegion(location.region(), function () {
                that.setModelChanged();
                log('LOCATION UPDATED', location, 'IN REGION', location.region());
              });
              AWE.GS.SettlementManager.updateSettlementsAtLocation(location.id());
            }
            else {
              that.handleError(status, "Der Außenposten konnte leider nicht gegründet werden. Bitte versuch es gleich noch mal oder kontaktiere den Support, wenn es sich um einen Fehler handelt.");
            }
          });
          this.destroy();
        },
        cancelPressed:function (evt) {
          armyAnnotationView.setActionMode('');
          this.destroy();
        },
      });
      that.applicationController.presentModalDialog(dialog);
    };


    var createArmyCreateAction = function (location, units, armyName, callback) {
      log('createArmyCreateAction', location, units, armyName);

      var armyCreateAction = AWE.Action.Military.createCreateArmyAction(location, units, armyName);
      armyCreateAction.send(function (status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArmyManager.updateArmiesAtLocation(location.id(), null, function (armies) {
            log('armies updated at location', armies, location);
            that.setModelChanged();
          });
          AWE.GS.SettlementManager.updateSettlementsAtLocation(location.id(), null, function (settlements) {
            log('settlements updated at location', settlements, location);
            that.setModelChanged();
          });
          if (callback) {
            callback();
          }
        }
        else {
          that.handleError(status, "The server did not accept the create army comannd.");
        }
      });
    }

    that.artifactInfoButtonClicked = function (artifact) {
      if (!artifact) return;

      var dialog = AWE.UI.Ember.ArtifactInfoDialog.create({
        closePressed:function (evt) {
          this.destroy();
        },
      });

      dialog.set('artifact', artifact);

      that.applicationController.presentModalDialog(dialog);
    };

    that.settlementInfoButtonClicked = function (location) {
      if (!location) return;

      var dialog = AWE.UI.Ember.SettlementInfoDialog.create({
        locationId: location.id(),
        closePressed:function (evt) {
          this.destroy();
        },
      });

      that.applicationController.presentModalDialog(dialog);
    }

    that.newArmyButtonClicked = function (location) {
      if (!location) return;

      var dialog = AWE.UI.Ember.ArmyCreateDialog.create({
        locationId: location.id(),
        createPressed: function (evt) {
          if (this.get('garrisonOverfull')) {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading:AWE.I18n.lookupTranslation('army.form.errors.garrison'),
              message:AWE.I18n.lookupTranslation('army.form.errors.message'),
            });
            that.applicationController.presentModalDialog(errorDialog);
          }
          else if (this.get('otherOverfull')) {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading:AWE.I18n.lookupTranslation('army.form.errors.new'),
              message:AWE.I18n.lookupTranslation('army.form.errors.message'),
            });
            that.applicationController.presentModalDialog(errorDialog);
          }
          else {
            var unitQuantities = this.unitQuantities();
            var armyName = this.get('armyName');
            if (!AWE.Util.hashEmpty(unitQuantities)) {
              createArmyCreateAction(location, unitQuantities, armyName, (function (self) {
                return function () {
                  self.destroy();
                }
              })(this));
              this.set('loading', true);
            }
            else {
              this.destroy();
            }
          }
        },
        cancelPressed:function (evt) {
          this.destroy();
        },
        loading:false,
      });
      // garrisonArmy is set after create to trigger observer in view
      dialog.set('garrisonArmy', location.garrisonArmy()),

        that.applicationController.presentModalDialog(dialog);
    }

    var createArmyChangeAction = function (location, visibleArmy, units, callback) {
      log('changeArmyCreateAction', location, visibleArmy, units);

      var armyChangeAction = AWE.Action.Military.createChangeArmyAction(location, visibleArmy, units);
      armyChangeAction.send(function (status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArmyManager.updateArmiesAtLocation(location.id(), null, function (armies) {
            log('armies updated at location', armies, location);
            that.setModelChanged();
            if (callback) {
              callback();
            }
          });
        }
        else {
          that.handleError(status, "The server did not accept the change army comannd.");
        }
      });
    }

    that.centerLocation = function (location) {
      that.moveTo(location, true);
    }

    that.centerRegion = function (region) {
      var nodeId = region.nodeId() || 0;
      var node = region.node() || AWE.Map.Manager.getNode(nodeId);
      if (node) {
        that.moveTo(node, true);
      }
      else {
        AWE.Map.Manager.fetchSingleNodeById(nodeId, function (node) {
          that.moveTo(node, true);
        });
      }
    }

    that.centerGamingPiece = function (gp) {
      if (!gp) {
        return;
      }
      var regionId = gp.get('region_id');
      var region = AWE.Map.Manager.getRegion(regionId);
      if (region) {
        that.centerRegion(region);
      }
      else {
        AWE.Map.Manager.fetchSingleRegionById(regionId, function (region) {
          that.centerRegion(region);
        });
      }
    }

    that.centerSettlement = function (settlement) {
      this.centerGamingPiece(settlement);
    }

    that.centerArmy = function (army) {
      this.centerGamingPiece(army);
    }


    that.switchToPreviousSettlement = function (settlement) {
      if (!settlement) {
        return;
      }
      var previous = AWE.GS.SettlementManager.getPreviousSettlementOfCharacter(settlement);
      if (previous) {
        that.setSelectedSettlement(previous);
        that.centerSettlement(previous);
      }
    }

    that.switchToNextSettlement = function (settlement) {
      if (!settlement) {
        return;
      }
      var next = AWE.GS.SettlementManager.getNextSettlementOfCharacter(settlement);
      if (next) {
        that.setSelectedSettlement(next);
        that.centerSettlement(next);
      }
    }

    that.previousSettlementButtonClicked = function (location) {
      log('switch to previous settlement');
      var settlement = location.settlement();
      if (!settlement) {
        AWE.GS.SettlementManager.updateSettlementsAtLocation(location.id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
          settlement = location.settlement();
          that.switchToPreviousSettlement(settlement);
        });
      }
      else {
        that.switchToPreviousSettlement(settlement);
      }
    };

    that.nextSettlementButtonClicked = function (location) {
      log('switch to next settlement');
      var settlement = location.settlement();
      if (!settlement) {
        AWE.GS.SettlementManager.updateSettlementsAtLocation(location.id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
          settlement = location.settlement();
          that.switchToNextSettlement(settlement);
        });
      }
      else {
        that.switchToNextSettlement(settlement);
      }
    }

    that.previousArmyButtonClicked = function (army) {
      log('switch to previous army');
      var previousArmy = AWE.GS.ArmyManager.getPreviousArmyOfCharacter(army);
      if (previousArmy) {
        that.setSelectedArmy(previousArmy);
        that.centerArmy(previousArmy);
      }
    }

    that.nextArmyButtonClicked = function (army) {
      log('switch to next army');
      var nextArmy = AWE.GS.ArmyManager.getNextArmyOfCharacter(army);
      if (nextArmy) {
        that.setSelectedArmy(nextArmy);
        that.centerArmy(nextArmy);
      }
    }


    that.changeArmyButtonClicked = function (army) {
      if (!army) return;

      var location = army.get('location');
      if (!location) return;

      var dialog = AWE.UI.Ember.ArmyChangeDialog.create({
        locationId:location.id(),
        changePressed:function (evt) {
          if (this.get('garrisonOverfull')) {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading:AWE.I18n.lookupTranslation('army.form.errors.garrison'),
              message:AWE.I18n.lookupTranslation('army.form.errors.message'),
            });
            that.applicationController.presentModalDialog(errorDialog);
          }
          else if (this.get('otherOverfull')) {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading:AWE.I18n.lookupTranslation('army.form.errors.other'),
              message:AWE.I18n.lookupTranslation('army.form.errors.message'),
            });
            that.applicationController.presentModalDialog(errorDialog);
          }
          else {
            var unitDifferences = this.unitDifferences();
            if (!AWE.Util.hashEmpty(unitDifferences)) {
              createArmyChangeAction(location, army, unitDifferences, (function (self) {
                return function () {
                  self.destroy();
                }
              })(this));
              this.set('loading', true);
            }
            else {
              this.destroy();
            }
          }
        },
        cancelPressed:function (evt) {
          this.destroy();
        },
        loading:false,
      });
      // armies are set after create to trigger observer in view
      dialog.set('garrisonArmy', location.garrisonArmy()),
        dialog.set('otherArmy', army),

        that.applicationController.presentModalDialog(dialog);
    }

    var runningRetreatAction = false;

    that.armyRetreatButtonClicked = function (army) {
      if (!runningRetreatAction) {
        runningRetreatAction = true;
        var retreatAction = AWE.Action.Military.createRetreatArmyAction(army);
        retreatAction.send(function (status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK #
            AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function (army) {
              that.setModelChanged();
            });
          }
          else {
            that.handleError(status, "The server did not accept the retreat comannd.");
          }
          runningRetreatAction = false;
        });
      }
    };

    var runningStanceAction = false;

    that.stanceButtonClicked = function(army) {
      if (!runningStanceAction) {
        runningStanceAction = true;

        var newStance = army.get('stance') === 0 ? 1 : 0;
        var action = AWE.Action.Military.createChangeArmyStanceAction(army, newStance);
        AWE.Action.Manager.queueAction(action, function() {
          AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function (army) {
            that.setModelChanged();
          });
          runningStanceAction = false;
        });
      }
    };

    that.battleInfoButtonClicked = function (army) {
      var battle_id = army.get('battle_id');
      var battle = army.battle();

      var dialog = AWE.UI.Ember.BattleDialog.create({
        battle:battle,

        closePressed:function (evt) {
          this.destroy();
        },
        retreatPressed:function (evt) {
          that.armyRetreatButtonClicked(evt.view.army);
        },
        cancelRetreatPressed:function (evt) {
          that.armyRetreatButtonClicked(evt.view.army);
        },
      });

      AWE.GS.BattleManager.updateBattle(battle_id, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function (battle) {
        dialog.set('battle', battle);
      });

      that.applicationController.presentModalDialog(dialog);
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   User Input Handling
    //
    // ///////////////////////////////////////////////////////////////////////

    /** returns the single map view that is presently selected by the user.
     * this can be any of the gaming pieces (armies), markers or settlements.*/
    that.selectedView = function () {
      return _selectedView;
    };

    /** sets the selected view */
    that.setSelectedView = function (view) {

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

    var preselectedFortressNodeId = null;
    var preselectedLocationId = null;
    var preselectedArmyId = null;
    var preselectedArtifactId = null;


    that.setSelectedArmy = function (army) {
      var armyId = army.get('id');
      var view = armyViews[armyId];
      if (view) {
        if (_selectedView) {
          _unselectView(_selectedView);
        }
        that.setSelectedView(view);
      }
      else {
        preselectedArmyId = army.get('id'); // TOOD -> improve!
      }
    }

    that.setSelectedArtifact = function (artifact) {
      var artifactId = artifact.get('id');
      var view = artifactViews[artifactId];
      if (view) {
        if (_selectedView) {
          _unselectView(_selectedView);
        }
        that.setSelectedView(view);
      }
      else {
        preselectedArtifactId = artifact.get('id'); // TOOD -> improve!
      }
    }

    that.setSelectedSettlement = function (settlement) {
      if (settlement.get('type_id') == AWE.GS.SETTLEMENT_TYPE_FORTRESS) {
        var nodeId = settlement.get('node_id');

        var view = fortressViews[nodeId];
        if (view) {
          if (_selectedView) {
            _unselectView(_selectedView);
          }
          that.setSelectedView(view);
        }
        else {
          preselectedFortressNodeId = nodeId;
        }
      }
      else {
        var locationId = settlement.get('location_id');
        var view = locationViews[locationId];
        if (view) {
          if (_selectedView) {
            _unselectView(_selectedView);
          }
          that.setSelectedView(view);
        }
        else {
          preselectedLocationId = locationId;
        }
      }
    }

    var _actionViewChanged = false;

    that.buttonClicked = function (button) {
      log('button', button.text());
    };

    that.viewClicked = function (view) {

      var actionCompleted = false;

      // nach action unterscheiden

      if (currentAction) {
        if (currentAction.typeName === 'moveAction') {
          var targetLocations = getVisibleTargetLocations(currentAction.army);
          for (var key in targetLocations) {
            if (targetLocations.hasOwnProperty(key)) {
              var targetLocation = targetLocations[key];
              if (view.location && view.location().id() == targetLocation.id()) {
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
          if (_selectedView && _selectedView.annotationView()) {
            _selectedView.annotationView().setActionMode(null);
          }
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
          if (_selectedView && _selectedView.annotationView()) {
            _selectedView.annotationView().setActionMode(null);
          }
        }
      }
      else {
        that.setSelectedView(view);
      }
    };

    that.viewMouseOver = function (view) { // log('view mouse over: ' + view.typeName())
      if (view.typeName() === 'FortressView'
        || view.typeName() === 'ArtifactView'
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

    that.viewMouseOut = function (view) {
      if (view.typeName() === 'FortressView'
        || view.typeName() === 'ArmyView'
        || view.typeName() === 'ArtifactView'
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

    var _selectView = function (view) {
      _selectedView = view;
      _selectedView.setSelected(true);
      _showInspectorWith(_selectedView);
      _actionViewChanged = true;
    };

    var _unselectView = function (view) {
      _selectedView.setSelected(false);
      _selectedView = null;
      _hideInspector();
      currentAction = null;
      _actionViewChanged = true;
    };

    /* view highlighting */

    var _hoverView = function (view) {
      if (view !== _hoveredView) {
        _hoveredView = view;
        _hoveredView.setHovered(true);
        _actionViewChanged = true;
      }
    };

    var _unhoverView = function (view) {
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

    var _showInspectorWith = function (view) {
      if (inspectorViews.inspector) {
        _hideInspector();
      }

      if (view.typeName() === 'FortressView') {
        inspectorViews.inspector = AWE.UI.createFortressDetailView();
        inspectorViews.inspector.initWithControllerAndNode(that, view.node());

        inspectorViews.inspector.onFlagClicked = function (allianceId) {
          WACKADOO.activateAllianceController(allianceId);
        };
        inspectorViews.inspector.onNewArmyButtonClick = function (region) {
          that.newArmyButtonClicked(region.location(0));
        };
        inspectorViews.inspector.onCenterButtonClick = function (region) {
          that.centerRegion(region);
        };
        inspectorViews.inspector.onInventoryButtonClick = function (region) {
          that.settlementInfoButtonClicked(region.location(0));
        };
        inspectorViews.inspector.onPreviousSettlementButtonClick = function (location) {
          that.previousSettlementButtonClicked(location);
        };
        inspectorViews.inspector.onNextSettlementButtonClick = function (location) {
          that.nextSettlementButtonClicked(location);
        };
      }
      else if (view.typeName() === 'ArmyView') {
        inspectorViews.inspector = AWE.UI.createArmyInspectorView();
        inspectorViews.inspector.initWithControllerAndArmy(that, view.army());

        inspectorViews.inspector.onInventoryButtonClick = (function (self) {
          return function (army) {
            self.armyInfoButtonClicked(army);
          }
        })(that);

        inspectorViews.inspector.onFlagClicked = function (allianceId) {
          WACKADOO.activateAllianceController(allianceId);
        };
        inspectorViews.inspector.onCenterButtonClick = function (army) {
          that.centerArmy(view.army());
        };
        inspectorViews.inspector.onChangeArmyButtonClick = function (army) {
          that.changeArmyButtonClicked(view.army());
        };
        inspectorViews.inspector.onPreviousArmyButtonClick = function (army) {
          that.previousArmyButtonClicked(view.army());
        };
        inspectorViews.inspector.onNextArmyButtonClick = function (army) {
          that.nextArmyButtonClicked(view.army());
        };

      }
      else if (view.typeName() === 'ArtifactView') {
        inspectorViews.inspector = AWE.UI.createArtifactInspectorView();
        inspectorViews.inspector.initWithControllerAndArtifact(that, view.artifact());

        inspectorViews.inspector.onInventoryButtonClick = (function (self) {
          return function (artifact) {
            self.artifactInfoButtonClicked(artifact);
          }
        })(that);
      }
      else if (view.typeName() === 'BaseView' || view.typeName() === 'OutpostView') {
        inspectorViews.inspector = AWE.UI.createBaseInspectorView();
        inspectorViews.inspector.initWithControllerAndLocation(that, view.location());

        inspectorViews.inspector.onNewArmyButtonClick = function (location) {
          that.newArmyButtonClicked(location);
        };
        inspectorViews.inspector.onFlagClicked = function (allianceId) {
          WACKADOO.activateAllianceController(allianceId);
        };
        inspectorViews.inspector.onCenterButtonClick = function (location) {
          that.centerLocation(location);
        };
        inspectorViews.inspector.onInventoryButtonClick = function (location) {
          that.settlementInfoButtonClicked(location);
        };
        inspectorViews.inspector.onPreviousSettlementButtonClick = function (location) {
          that.previousSettlementButtonClicked(location);
        };
        inspectorViews.inspector.onNextSettlementButtonClick = function (location) {
          that.nextSettlementButtonClicked(location);
        };

      }

      if (inspectorViews.inspector) {
        _stages[3].addChild(inspectorViews.inspector.displayObject());
        _inspectorChanged = true;
      }
    };

    var _hideInspector = function () {
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

    that.addAnimation = function (animation) {
      _animations.push(animation);
    }

    /*
     that.removeAnimation = function(animation) {
     animation.cancel();
     }*/


    that.addTransientAnnotationView = function (annotatedView, annotation, duration, offset) {
      duration = duration || 1000;
      offset = offset || AWE.Geometry.createPoint(100, 50);

      _stages[2].addChild(annotation.displayObject());
      log('added transient view.')


      var animation = AWE.UI.createTimedAnimation({
        view:annotation,
        duration:duration,

        updateView:function () {
          return function (view) {
            view.setOrigin(annotatedView.frame().origin.copy());
          };
        }(),

        onAnimationEnd:function (viewToRemove) {
          return function () {
            _stages[2].removeChild(viewToRemove.displayObject());
            log('removed animated label on animation end');
          };
        }(annotation),
      });

      that.addAnimation(animation);
    }

    that.addTransientAnnotationLabel = function (annotatedView, message, duration, offset, frame) {
      var label = AWE.UI.createLabelView();
      label.initWithControllerAndLabel(this, message, true, frame);
      this.addTransientAnnotationView(annotatedView, label, duration, offset);
    }


    that.addBouncingAnnotationLabel = function (annotatedView, annotation, duration, offset, frame) {
      duration = duration || 10000;
      offset = offset || AWE.Geometry.createPoint(0, -50);

      var bounceHeight = 50;
      var bounceDuration = 1000.0;

      _stages[2].addChild(annotation.displayObject());

      var animation = AWE.UI.createTimedAnimation({
        view:annotation,
        duration:duration,

        updateView:function () {
          return function (view, elapsed) {
            var height = (Math.sin(elapsed * duration / bounceDuration * 2.0 * Math.PI) / 2.0 + 0.5) * bounceHeight;
            view.setOrigin(AWE.Geometry.createPoint(annotatedView.frame().origin.x + offset.x,
              annotatedView.frame().origin.y + offset.y - height));
          };
        }(),

        onAnimationEnd:function (viewToRemove) {
          return function () {
            _stages[2].removeChild(viewToRemove.displayObject());
            log('removed animated label on animation end');
          };
        }(annotation),
      });

      that.addAnimation(animation);
      return animation;
    }


    that.addDisappearingAnnotationLabel = function (annotatedView, message, duration, font, offset, frame) {
      duration = duration || 1000;
      offset = offset || AWE.Geometry.createPoint(100, 50);
      font = font || '20px "Helvetica Neue", Helvetica, Arial';

      var label = AWE.UI.createLabelView();
      label.initWithControllerAndLabel(this, message, true, frame);
      label.setFont(font);
      label.setPadding(10);

      _stages[2].addChild(label.displayObject());
      log('added disappearing view.');

      var animation = AWE.UI.createTimedAnimation({
        view:label,
        duration:duration,

        updateView:function () {
          return function (view, elapsed) {
            view.setOrigin(AWE.Geometry.createPoint(annotatedView.frame().origin.x,
              annotatedView.frame().origin.y - (150.0 * elapsed)));
            view.setAlpha(1.0 - Math.max(elapsed - 0.5, 0.0) * 2);
          };
        }(),

        onAnimationEnd:function (viewToRemove) {
          return function () {
            _stages[2].removeChild(viewToRemove.displayObject());
            log('removed animated label on animation end');
          };
        }(label),
      });

      that.addAnimation(animation);
      return animation;
    }


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Serialization, inspection & debugging
    //
    // ///////////////////////////////////////////////////////////////////////

    that.toString = function () {
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Remote Data Handling
    //
    // ///////////////////////////////////////////////////////////////////////


    that.modelChanged = function () {
      return _modelChanged;
    }

    that.setModelChanged = function () {
      _modelChanged = true;
    }

    that.maptreeChanged = function () {
      return _maptreeChanged;
    }

    that.setMaptreeChanged = function () {
      _maptreeChanged = true;
      _modelChanged = true;
    }

    that.updateModel = (function () {

      var lastArtifactCheck = new Date(1970);
      var lastArmyCheck = new Date(1970);
      var lastOwnArmiesCheck = new Date(1970);
      var lastLocationUpdateCheck = new Date(1970);
      var lastNodeUpdateCheck = new Date(1970);
      var lastOwnSettlementCheck = new Date(1970);

      var viewports = {};  ///< stores the viewport at the time of an update for each of the different update types

      var runningUpdate = {};

      var isUpdateRunning = function (type) {
        return runningUpdate[type];
      }

      var startUpdate = function (type) {
        runningUpdate[type] = new Date();
      }

      var stopUpdate = function (type) {
        if (runningUpdate[type]) {
          delete runningUpdate[type];
        }
      }

      var viewportHasChanged = function (type, rect) {
        return (!viewports[type] && rect) || (viewports[type] && !viewports[type].equals(rect));
      };

      var setViewport = function (type, rect) {
        viewports[type] = rect;
      };


      return function (visibleAreaMC) {

        //log('update model ' + visibleAreaMC + ' changed: ' + viewportHasChanged(visibleAreaMC) + ' ongoing: ' + requestingMapNodesFromServer);

        // viewport change -> time to check for the need for additional map nodes.
        if (viewportHasChanged('nodes', visibleAreaMC) && !isUpdateRunning('nodes')) {
          if (AWE.Map.numMissingNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level()) > 0) {
            startUpdate('nodes');
            AWE.Map.Manager.fetchNodesForArea(visibleAreaMC, level(), function () {
              stopUpdate('nodes');
              that.setMaptreeChanged();
            });
          }
          setViewport('nodes', visibleAreaMC); ///< remember viewport, because data for this port has been fetched (or isn't needed)
        }

        // in case the viewport has changed or the model has changed (more nodes?!) we need to check for missing regions.
        if ((viewportHasChanged('regions', visibleAreaMC) || that.maptreeChanged()) && !isUpdateRunning('nodes')) {

          startUpdate('regions');
          AWE.Map.Manager.fetchMissingRegionsForArea(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), function () {
            stopUpdate('regions'); // TODO: is not stopped properly in case there's no response!!!
            that.setModelChanged();
          });

          setViewport('regions', visibleAreaMC); ///< remember viewport, because data for this port has been fetched (or isn't needed)
        }

        // STOP HERE, in case the user is presently scrolling (depends on config).
        if (AWE.Config.MAPVIEW_DONT_UPDATE_MODEL_WHILE_SCROLLING && that.isScrolling()) return;

        var nodes = null;

        // in case the viewport has changed or the model has changed (more nodes or regions?!) we need to check for missing locations.
        if ((viewportHasChanged('locations', visibleAreaMC) || that.modelChanged() ||
          lastLocationUpdateCheck.getTime() + 10000 < new Date().getTime()) && !isUpdateRunning('nodes')) {

          nodes = nodes || AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, that.maptreeChanged()); // this is memoized, no problem to call it twice in one cycle!
          lastLocationUpdateCheck = new Date();

          for (var i = 0; i < nodes.length; i++) {
            //startUpdate('locations');
            if (nodes[i].isLeaf() && nodes[i].region() &&
              (!nodes[i].region().locations() || // have no locations
                nodes[i].region().lastLocationUpdateAt().getTime() + 60000 < new Date().getTime()) && // or update long ago
              nodes[i].level() <= level() - 2) {
              AWE.Map.Manager.fetchLocationsForRegion(nodes[i].region(), function (region) {
                that.setModelChanged();
                region.locations().forEach(function (location) {
                  if (location.ownerId() === AWE.GS.CharacterManager.getCurrentCharacter().getId()) {
                    AWE.GS.SettlementManager.updateSettlementsAtLocation(location.id(), null, function () {
                    });
                  }
                  that.setModelChanged();
                })
              });

              // updating artifacts
              AWE.GS.ArtifactManager.updateArtifactsInRegion(nodes[i].region().id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function (artifacts) {
                that.setModelChanged();
              });
            }
            //stopUpdate('locations'); // TODO: start / stop this properly! (many parallel requests)
          }
          setViewport('locations', visibleAreaMC);
        }

        // updating settlements
        if (lastOwnSettlementCheck.getTime() + 1000 * 180 < new Date().getTime() && !isUpdateRunning('settlements')) {
          startUpdate('settlements');
          lastOwnSettlementCheck = new Date();
          AWE.GS.SettlementManager.updateOwnSettlements(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
            stopUpdate('settlements');
          });
        }

        // updating nodes
        if (lastNodeUpdateCheck.getTime() + 1000 < new Date().getTime() && !isUpdateRunning('nodes')) {

          nodes = nodes || AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, that.maptreeChanged()); // this is memoized, no problem to call it twice in one cycle!
          lastNodeUpdateCheck = new Date();

          for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].isLeaf() && nodes[i].lastChange().getTime() + 60000 < new Date().getTime()) {
              startUpdate('nodes');
              AWE.Map.Manager.updateNode(nodes[i], true, function (node) {
                log('UPDATED NODE', node.id());
                that.setMaptreeChanged();
                stopUpdate('nodes'); // TODO: start / stop this properly! (many parallel requests)
                AWE.Map.Manager.updateRegionForNode(node, function (region) {
                  log('UPDATED REGION', region.id());
                });
              });
              break;
            }
          }
        }

        if (lastOwnArmiesCheck.getTime() + 60 * 1000 < new Date().getTime() && !isUpdateRunning('ownArmies')) { // check for own armies every minute
          startUpdate('ownArmies');
          lastOwnArmiesCheck = new Date();
          AWE.GS.ArmyManager.updateArmiesForCharacter(AWE.GS.game.getPath('currentCharacter.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
            stopUpdate('ownArmies');
          });
        }

        if (lastArmyCheck.getTime() + 400 < new Date().getTime() && !isUpdateRunning('armies')) { // check for needed armies once per second

          nodes = nodes || AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, false); // this is memoized, no problem to call it twice in one cycle!

          for (var i = 0; i < nodes.length; i++) {

            if (!nodes[i].isLeaf() || !nodes[i].region()) continue; // no need to fetch army information for this node

            var armiesInRegion = AWE.GS.ArmyManager.getArmiesInRegion(nodes[i].region().id());


            AWE.Ext.applyFunctionToElements(armiesInRegion, function (army) {
              if (!isUpdateRunning('movingArmy') && army.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 5000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
                if (army.get('mode') === 1 && army.get('target_reached_at') && Date.parseISODate(army.get('target_reached_at')).getTime() + 4000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) { // wait four seconds before posting update request
                  log('start update of moving army');
                  startUpdate('movingArmy');
                  AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
                    stopUpdate('movingArmy');
                    that.setModelChanged();
                  });
                }
              }
            });

            var frame = that.mc2vc(nodes[i].frame());

            if (!that.areArmiesAtFortressVisible(frame)) continue; // no update necessary, region is to small (perhaps fetch aggregate info)

            if (!that.areArmiesAtSettlementsVisible(frame)) {
              if (AWE.GS.ArmyManager.lastUpdateForFortress(nodes[i].region().id()).getTime() + 30000 < AWE.GS.TimeManager.estimatedServerTime().getTime() && // haven't fetched armies for fortess within last 60s
                nodes[i].region().lastArmyUpdateAt().getTime() + 30000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {        // haven't fetched armies for region within last 60s

                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmiesAtFortress(nodes[i].region().id(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!
              }
            }
            else {
              if (nodes[i].region().lastArmyUpdateAt().getTime() + 30000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {

                startUpdate('armies');
                nodes[i].region().updateArmies(AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
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

              if (army.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmy(armyId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;                                             // end, just one request at a time
              }
            }
          }

          nodes = nodes || AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleAreaMC, level(), false, false); // this is memoized, no problem to call it twice in one cycle!

          for (var i = 0; i < nodes.length; i++) {

            if (!nodes[i].isLeaf() || !nodes[i].region()) continue; // no need to fetch army information for this node

            var frame = that.mc2vc(nodes[i].frame());

            if (!that.areArmiesAtFortressVisible(frame)) continue; // no update necessary, region is to small (perhaps fetch aggregate info)

            if (!that.areArmiesAtSettlementsVisible(frame)) {

              if (AWE.GS.ArmyManager.lastUpdateForFortress(nodes[i].region().id()).getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime() && // haven't fetched armies for fortess within last 60s
                nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {        // haven't fetched armies for region within last 60s

                startUpdate('armies');
                AWE.GS.ArmyManager.updateArmiesAtFortress(nodes[i].region().id(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
                  stopUpdate('armies');
                  that.setModelChanged();
                });
                break;  // request limit!
              }
            }
            else {
              if (nodes[i].region().lastArmyUpdateAt().getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {

                startUpdate('armies');
                nodes[i].region().updateArmies(AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function () {
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
    var purgeDispensableViewsFromStage = function (presentViews, neededViews, stage) {
      var removedSomething = false;
      var toRemove = AWE.Util.hashSubtraction(presentViews, neededViews);
      AWE.Ext.applyFunctionToElements(toRemove, function (view) {
        AWE.Ext.applyFunction(view.displayObject(), function (obj) {
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

    that.rebuildMapHierarchy = function (nodes) {

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
          AWE.Ext.applyFunction(view.displayObject(), function (obj) {
            // obj.alpha = 0.3;
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

    that.isSettlementVisible = function (frame) {
      return frame.size.width > 420;
    };

    that.isFortressVisible = function (frame) {
      return frame.size.width > 128;
    };

    that.areArmiesAtFortressVisible = function (frame) {
      return frame.size.width > 140;
    }

    that.areArmiesAtSettlementsVisible = function (frame) {
      return frame.size.width > 420;
    }

    var setFortressPosition = function (view, frame) {
      view.setCenter(AWE.Geometry.createPoint(
        frame.origin.x + frame.size.width / 2,
        frame.origin.y + frame.size.height / 2 - 14
      ));
    }

    var setBasePosition = function (view, pos) {
      view.setCenter(AWE.Geometry.createPoint(
        pos.x,
        pos.y - 10
      ));
    }

    var setArtifactPosition = function (view, pos) {
      view.setCenter(AWE.Geometry.createPoint(
        pos.x + 68,
        pos.y - 20
      ));
    }

    var shouldDisplayArmyMarker = function () {
      //      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      //
      //      if (!AWE.Config.USE_TUTORIAL ||
      //        (tutorialState &&
      //          ((tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_FIGHT_QUEST_ID) &&
      //            tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_FIGHT_QUEST_ID).get('status') < AWE.GS.QUEST_STATUS_FINISHED) ||
      //            (tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MOVE_QUEST_ID) &&
      //              tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MOVE_QUEST_ID).get('status') < AWE.GS.QUEST_STATUS_FINISHED)))) {
      //        return true;
      //      }
      return false;
    }

    var shouldDisplayBaseMarker = function () {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();

      var returnedFromMap =
        (!AWE.Config.USE_TUTORIAL ||
          (tutorialState &&
            tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID) &&
            tutorialState.questStateWithQuestId(AWE.Config.TUTORIAL_MAP_QUEST_ID).get('status') >= AWE.GS.QUEST_STATUS_FINISHED));

      var character = AWE.GS.game && AWE.GS.game.get('currentCharacter');
      return !AWE.Config.IN_DEVELOPMENT_MODE && (character.get('show_base_marker') || !returnedFromMap) && !shouldDisplayArmyMarker();
    }

    var setArmyPosition = function (view, pos, army) {
      view.setCenter(AWE.Geometry.createPoint(pos.x + view.frame().size.width / 4, pos.y - view.frame().size.height / 2));

      if (army.get('mode') === AWE.Config.ARMY_MODE_MOVING) {

        var targetRegionId = army.get('target_region_id');
        var targetLocationId = army.get('target_location_id');
        var regionId = army.get('region_id');
        var targetPos = null;

        if (targetRegionId != regionId) {
          var targetRegion = AWE.Map.Manager.getRegion(targetRegionId);
          if (targetRegion && targetRegion.node()) {
            var tframe = that.mc2vc(targetRegion.node().frame());
            targetPos = AWE.Geometry.createPoint(
              tframe.origin.x + tframe.size.width / 2,
              tframe.origin.y + tframe.size.height / 2 - 60
            );
          }
        }
        else if (targetLocationId && targetRegionId) { // target location in same region as starting region -> this region must be available locally
          var targetLocation = AWE.Map.Manager.getLocation(targetLocationId);
          if (targetLocation) {
            targetPos = that.mc2vc(targetLocation.position());
            targetPos.y -= 60;
          }
        }

        if (targetPos) {
          var factor = 0.0;                                  // default value, in case another value is missing.
          if (AWE.Config.MAP_MOVE_ARMIES) {
            var maxDistance = 0.48;
            var minDistance = 0.0;
            var targetReachedAt = army.get('target_reached_at');
            var velocity = army.get('velocity');
            var totalSeconds = (15 * 60 * 1000.0) / (velocity || 1.0);  // assumption: movement time is 15 minutes. TODO : make this dynamic
            if (targetReachedAt) {
              var seconds = Date.parseISODate(targetReachedAt).getTime() - new Date().getTime();
              factor = Math.max(minDistance, Math.min((1.0 - seconds / totalSeconds) * (maxDistance - minDistance) + minDistance, maxDistance));
              log("MOVEMENT", seconds, totalSeconds, factor);
            }
          }
          else { // factor, in case army movement is switched off
            factor = 0.2;
          }

          var dir = AWE.Geometry.createPoint(targetPos.x - view.center().x, targetPos.y - view.center().y);
          view.setCenter(AWE.Geometry.createPoint(view.center().x + dir.x * factor,
            view.center().y + dir.y * factor));
        }
      }
    }

    /** update the fortress views. */
    that.updateFortresses = function (nodes) {     // view for slot 0

      var newFortressViews = {};

      for (var i = 0; i < nodes.length; i++) {
        var frame = that.mc2vc(nodes[i].frame()); // frame for node

        if (that.isFortressVisible(frame) && // if node is big enough for displaying the fortress
          nodes[i].isLeaf() && nodes[i].region()) {
          var view = fortressViews[nodes[i].id()];// get existing view for node

          if (view) {                             // if view exists already
            // log('MODEL CHANGE CHECK', view.lastChange ? view.lastChange() : null, nodes[i].region().lastChange(), view.lastChange !== undefined && nodes[i].region() && view.lastChange() < nodes[i].region().lastChange())
            if (view.lastChange !== undefined && // if model of view updated
              nodes[i].region() && view.lastChange() < nodes[i].region().lastChange()) {
              view.setNeedsUpdate();
            }
          }
          else if (nodes[i].isLeaf() && nodes[i].region()) { // if view for node doesn't exists and node is a leaf node
            view = AWE.UI.createFortressView();
            view.initWithControllerAndNode(that, nodes[i]);
            // view.displayObject().alpha=0.3;
            _stages[1].addChild(view.displayObject()); // add view's displayObject to stage
            if (nodes[i].id() == preselectedFortressNodeId) {
              that.setSelectedView(view);
              preselectedFortressNodeId = null;
            }
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
    that.updateSettlements = function (nodes) {     // views for slot 1-8

      var newLocationViews = {};
      var changedAnimation = true;

      // beginner tutorial hack for removing jumping arrow from own settlement:
      if (that.ownBaseMarkerAnimation && !shouldDisplayBaseMarker()) {
        that.ownBaseMarkerAnimation.cancel();
        that.ownBaseMarkerAnimation = null;
        changedAnimation = true;
      }

      for (var i = 0; i < nodes.length; i++) {
        var frame = that.mc2vc(nodes[i].frame());

        if (that.isSettlementVisible(frame) && nodes[i].isLeaf() &&
          nodes[i].region() && nodes[i].region().locations()) {

          var locations = nodes[i].region().locations();

          for (var l = 1; l <= 8; l++) {
            var location = locations[l];
            if (location) {
              var view = locationViews[location.id()];

              if (view && view.locationType() == AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()]) {
                // beginner tutorial hack for adding jumping arrow to own settlement:
                if (!that.ownBaseMarkerAnimation && AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()] === "base" &&
                  location.isOwn() && shouldDisplayBaseMarker()) {
                  var arrow = AWE.UI.createTargetView();
                  arrow.initWithControllerAndTargetedView(that, view);
                  that.ownBaseMarkerAnimation = that.addBouncingAnnotationLabel(view, arrow, 10000000);
                  changedAnimation = true;
                  view.setNeedsUpdate();
                }
                if (view.lastChange !== undefined &&  // if model of view updated
                  view.lastChange().getTime() < location.lastChange().getTime()) {
                  view.setNeedsUpdate();
                }
              }
              else if (view && view.locationType() != AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId()]) {
                if (view === _selectedView) {
                  _unselectView(view);
                }
                _stages[1].removeChild(view.displayObject());
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
                  _stages[1].addChild(view.displayObject());
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
                  // view.displayObject().alpha=0.3;
                  _stages[1].addChild(view.displayObject());
                  if (location.id() == preselectedLocationId) {
                    that.setSelectedView(view);
                    preselectedLocationId = null;
                  }
                }
              }

              if (view) {
                setBasePosition(view, that.mc2vc(location.position()));
                newLocationViews[location.id()] = view;

                // ANIMATE LEVEL CHANGE AT LOCATIONS
                if (location.oldSettlementLevel() && location.settlementLevel() &&
                  location.oldSettlementLevel() !== location.settlementLevel()) {
                  var diff = (location.settlementLevel() - location.oldSettlementLevel()) || 1;
                  var animation = that.addDisappearingAnnotationLabel(view, (diff > 0 ? '+' : '') + diff + ' Level', 1000); // minus is added automatically
                  location.resetOldSettlementLevel();
                }
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

      // beginner tutorial hack for killing animation on own base
      if (that.ownBaseMarkerAnimation) {
        var toRemove = AWE.Util.hashSubtraction(locationViews, newLocationViews);
        AWE.Ext.applyFunctionToElements(toRemove, function(view) {
          if (that.ownBaseMarkerAnimation && view.location().isOwn()) {
            that.ownBaseMarkerAnimation.cancel();
            that.ownBaseMarkerAnimation = null;
            changedAnimation = true;
          }
        });
      }

      var removedSomething = purgeDispensableViewsFromStage(locationViews, newLocationViews, _stages[1]);
      locationViews = newLocationViews;
      return removedSomething || changedAnimation;
    }

    /** update the army views. */
    that.updateArtifacts = function (nodes) {

      var newArtifactViews = {};

      for (var i = 0; i < nodes.length; i++) {
        var frame = that.mc2vc(nodes[i].frame());

        if (that.isSettlementVisible(frame) && nodes[i].isLeaf() && nodes[i].region()) {
          var artifacts = AWE.GS.ArtifactManager.getArtifactsInRegion(nodes[i].region().id());

          for (var id in artifacts) {

            if (artifacts.hasOwnProperty(id)) {

              var artifact = artifacts[id];
              var location = AWE.Map.Manager.getLocation(artifact.get('location_id'));

              if (location) {
                var view = artifactViews[id];

                if (view) {
                  if (view.lastChange !== undefined && // if model of view updated
                    view.lastChange().getTime() < artifact.lastChange().getTime()) {
                    view.setNeedsUpdate();
                  }
                }
                else {
                  view = AWE.UI.createArtifactView();
                  view.initWithControllerAndArtifact(that, artifact);
                  _stages[1].addChild(view.displayObject());
                }

                if (view) {
                  setArtifactPosition(view, that.mc2vc(artifact.get('location').position()), frame);
                  newArtifactViews[id] = view;
                }
              }
            }
          }
        }
      }

      if (_selectedView &&
          _selectedView.typeName() === 'ArtifactView' &&
          that.isSettlementVisible(that.mc2vc(_selectedView.location().node().frame()))) {
        newArtifactViews[_selectedView.artifact().getId()] = _selectedView;
      }

      var removedSomething = purgeDispensableViewsFromStage(artifactViews, newArtifactViews, _stages[1]);
      artifactViews = newArtifactViews;
      return removedSomething;
    }

    /** update the army views. */
    that.updateArmies = function (nodes) {

      var changedAnimation = false;

      var newArmyViews = {};
      var newMovementArrowViews = {};

      var unclutter = function (armies, settlement, centerPos, frame) {
        if (armies === null || armies === undefined) {
          return;
        }
        var views = [];
        AWE.Ext.applyFunctionToElements(armies, function (element) {
          if (!element.isGarrison()) {
            var view = armyViews[element.getId()] 
            view = view ? view : newArmyViews[element.getId()];
            if (view) {
              views.push({
                view:view,
                moveable:true,
                id:view.army().getId(),
                centerX:view.center().x,
                centerY:view.center().y,
                width:view.frame().size.width,
                height:view.frame().size.height,
              });
            }
          }
        });
        if (views.length === 0) {
          return;
        }
        if (settlement) {
          views.push({
            view:settlement,
            moveable:false,
            id:"fortress",
          });
        }
        var objectUnclutterer = AWE.Util.ObjectUnclutterer.create({
          scaleFactor:Math.max(frame.size.width / 256.0, 0.2),
        });
        objectUnclutterer.setViews(views);
        objectUnclutterer.unclutter();
      }

      var initViewsWithBasePosition = function (armies, pos) {
        for (var key in armies) {
          if (armies.hasOwnProperty(key) && !armies[key].isGarrison()) {
            var army = armies[key];
            var view = armyViews[army.getId()];

            if (view) {
              // beginner tutorial hack for adding jumping arrow to own army:
              if (!that.ownArmyMarkerAnimation && army.isOwn() && shouldDisplayArmyMarker()) {
                var arrow = AWE.UI.createTargetView();
                arrow.initWithControllerAndTargetedView(that, view);
                that.ownArmyMarkerAnimation = that.addBouncingAnnotationLabel(view, arrow, 10000000);
                changedAnimation = true;
                view.setNeedsUpdate();
              }
              if (view.lastChange !== undefined && view.lastChange() < army.lastChange()) {
                view.setNeedsUpdate();
              }
            }
            else {  // if view for army doesn't exists
              view = AWE.UI.createArmyView();
              view.initWithControllerAndArmy(that, army);
              _stages[1].addChild(view.displayObject());
            }

            setArmyPosition(view, pos, army);
            newArmyViews[army.getId()] = view;

            // ANIMATE AP CHANGE AT ARMY
            if (army.get('ap_present_old') !== null && army.get('ap_present') &&
              army.get('ap_present_old') < army.get('ap_present')) {
              var diff = army.get('ap_present') - army.get('ap_present_old');
              var animation = that.addDisappearingAnnotationLabel(view, '+' + diff + ' AP', 1000);
              army.set('ap_present_old', null);
            }
            // ANIMATE EXP CHANGE AT ARMY
            if (army.get('exp_old') !== null && army.get('exp') &&
              army.get('exp_old') < army.get('exp')) {
              var diff = army.get('exp') - army.get('exp_old');
              var animation = that.addDisappearingAnnotationLabel(view, '+' + diff + ' XP', 1000);
              army.set('exp_old', null);
            }
            if (army.get('id') === preselectedArmyId) {
              that.setSelectedView(view);
              preselectedArmyId = null;
            }
          }
        }
      }

      var processArmiesAtPos = function (armies, settlement, pos, frame) {

        var filterArmies = function(armies, hideOthers) {
          if (AWE.Config.DONT_RENDER_ARMIES) {
            return {};
          }
          if (!hideOthers) {
            return armies;
          }
          var filtered = {};
          for (var key in armies) {
            if (armies.hasOwnProperty(key)) {
              var army = armies[key];
              if (army.isOwn() || army.get('npc')) {
                filtered[key] = army;
              }
            }
          }
          return filtered;
        };

        if (_viewPortChanged) {
          _disableArmies = _disableArmies || (AWE.Util.hashCount(armyViews) > AWE.Config.DONT_RENDER_ARMIES_THRESHOLD_IF_MOVING);
        }
        else if(_disableArmies && !_timeout) {
          _timeout = true;
          setTimeout(function() {
            _timeout = false;
            if (!_viewPortChanged && _disableArmies) {
              _disableArmies = false;
              that.setModelChanged();
            }
          }, 200);
        }
//        else if(_disableArmies) {
//          _disableArmies = false;
//        }


        armies = filterArmies(armies, AWE.Config.DONT_RENDER_OTHER_ARMIES || hideOtherArmies || _disableArmies);

        initViewsWithBasePosition(armies, pos);
        unclutter(armies, settlement, pos, frame);

        for (var key in armies) {
          if (armies.hasOwnProperty(key) && !armies[key].isGarrison()) {
            var army = armies[key];
            var view = armyViews[army.getId()];

            if (army.get('mode') === AWE.Config.ARMY_MODE_MOVING && view) {

              var targetRegionId = army.get('target_region_id');
              var targetLocationId = army.get('target_location_id');
              var regionId = army.get('region_id');
              var targetPos = null;

              if (targetRegionId != regionId) {
                var targetRegion = AWE.Map.Manager.getRegion(targetRegionId);
                if (targetRegion && targetRegion.node()) {
                  var tframe = that.mc2vc(targetRegion.node().frame());
                  targetPos = AWE.Geometry.createPoint(
                    tframe.origin.x + tframe.size.width / 2,
                    tframe.origin.y + tframe.size.height / 2 - 60
                  );
                }
              }
              else if (targetLocationId && targetRegionId) { // target location in same region as starting region -> this region must be available locally
                var targetLocation = AWE.Map.Manager.getLocation(targetLocationId);
                if (!targetLocation) {
                  AWE.Map.Manager.fetchLocationsForRegion(AWE.Map.Manager.getRegion(targetRegionId), function () {
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

                movementArrow.setStart(AWE.Geometry.createPoint(view.frame().origin.x + 24, view.frame().origin.y + 10));
                movementArrow.setEnd(AWE.Geometry.createPoint(targetPos.x, targetPos.y));
                newMovementArrowViews[army.getId()] = movementArrow;
              }
            }
          }
        }
      };

      // beginner tutorial hack for removing jumping arrow from own army:
      if (that.ownArmyMarkerAnimation && !shouldDisplayArmyMarker()) {
        that.ownArmyMarkerAnimation.cancel();
        that.ownArmyMarkerAnimation = null;
        changedAnimation = true;
      }

      for (var i = 0; i < nodes.length; i++) {
        var frame = that.mc2vc(nodes[i].frame());

        if (that.areArmiesAtFortressVisible(frame) && nodes[i].isLeaf() && nodes[i].region()) {
          var armies = nodes[i].region().getArmiesAtFortress();       // armies at fortress
          var fortressView = fortressViews[nodes[i].id()];
          var position = fortressView ? AWE.Geometry.createPoint(
            fortressView.center().x, fortressView.center().y
          ) : AWE.Geometry.createPoint(
            frame.origin.x + frame.size.width / 2,
            frame.origin.y + frame.size.height / 2
          );
          processArmiesAtPos(armies, fortressView, position, frame);
        }

        if (that.areArmiesAtSettlementsVisible(frame) &&
          nodes[i].isLeaf() && nodes[i].region() && nodes[i].region().locations()) {
          for (var loc = 1; loc <= 8; loc++) {
            var location = nodes[i].region().location(loc);
            if (!location || !location.position()) continue;
            var armies = location.getArmies();       // armies at location
            var settlementView = locationViews[location.id()];
            var position = settlementView ? AWE.Geometry.createPoint(
              settlementView.center().x, settlementView.center().y
            ) : that.mc2vc(location.position());
            processArmiesAtPos(armies, settlementView, position, frame);
          }
        }
      }

      if (that.ownArmyMarkerAnimation) {
        var toRemove = AWE.Util.hashSubtraction(armyViews, newArmyViews);
        AWE.Ext.applyFunctionToElements(toRemove, function (view) {
          if (view.army().isOwn()) {
            that.ownArmyMarkerAnimation.cancel();
            that.ownArmyMarkerAnimation = null;
          }
        });
      }

      var removedSomething = purgeDispensableViewsFromStage(armyViews, newArmyViews, _stages[1]);
      removedSomething = purgeDispensableViewsFromStage(movementArrowViews, newMovementArrowViews, _stages[1]) || removedSomething;
      armyViews = newArmyViews;
      movementArrowViews = newMovementArrowViews;

      return removedSomething || changedAnimation;
    }

    that.updateGamingPieces = function (nodes) {
      var removedSomething = false;

      removedSomething = that.updateFortresses(nodes) || removedSomething;
      removedSomething = that.updateSettlements(nodes) || removedSomething;
      removedSomething = that.updateArtifacts(nodes) || removedSomething;
      removedSomething = that.updateArmies(nodes) || removedSomething;

      return removedSomething;
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Stage
    //
    // ///////////////////////////////////////////////////////////////////////

    var getVisibleTargetLocations = function (army) {

      var targetLocations = [];
      var armyRegion = AWE.Map.Manager.getRegion(army.get('region_id'));
      var armyLocation = AWE.Map.Manager.getLocation(army.get('location_id'));

      if (armyLocation) {
        // get all possible target locations
        if (AWE.Config.MAP_LOCATION_TYPE_CODES[armyLocation.settlementTypeId()] === 'fortress') {           // if armyLocation is fortress
          var regionLocations = armyRegion.locations();

          if (regionLocations) {
            // add all location in same region
            for (var i = 1; i < regionLocations.length; i++) {
              targetLocations.push(regionLocations[i]);
            }
          }

          if (armyRegion.node()) {
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
            AWE.Map.Manager.fetchSingleNodeById(armyRegion.nodeId());
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
    };

    // determine all possible attack target armies
    var getTargetArmies = function (army) {

      var targetArmies = [];
      var armyRegion = AWE.Map.Manager.getRegion(army.get('region_id'));
      var armyLocation = AWE.Map.Manager.getLocation(army.get('location_id'));

      if (armyLocation) {
        var armiesAtLocation = armyLocation.getArmies();

        AWE.Ext.applyFunctionToElements(armiesAtLocation, function (locationArmy) {
          if (!locationArmy.isOwn() && !locationArmy.get('isProtected')) {
            targetArmies.push(locationArmy);
          }
        });
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(armyRegion);
      }

      return targetArmies;
    };

    that.updateActionViews = function () {

      // helper method for creating the appropriate annotation view
      var createAnnotationView = function (annotatedView) {
        var annotationView = null;
        if (annotatedView.typeName() === 'FortressView') {
          annotationView = AWE.UI.createFortressAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onAttackButtonClick = (function (self) {
            return function (view) {
              self.settlementAttackButtonClicked(view);
            }
          })(that);

          annotationView.onBattleInfoButtonClick = (function (self) {
            return function (army) {
              self.battleInfoButtonClicked(army);
            }
          })(that);

          // Todo: respect update time (if already updated, wait some time)
          var location = annotatedView.location();
          if (!location) {
            var region = annotatedView.node() ? annotatedView.node().region() : null;
            if (region) {  // region should always be there, just to be sure.
              AWE.Map.Manager.fetchLocationsForRegion(region, function () {
                that.setModelChanged();
                if (region.location(0)) {
                  AWE.GS.SettlementManager.updateSettlementsAtLocation(region.location(0).id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
                    that.setModelChanged();
                  });
                }
              });
            }
          }
          else {
            AWE.GS.SettlementManager.updateSettlementsAtLocation(annotatedView.location().id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
              that.setModelChanged();
            });
          }
        }
        else if (annotatedView.typeName() === 'ArtifactView') {
          annotationView = AWE.UI.createArtifactAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);
          if (annotatedView.location()) {
            AWE.GS.ArtifactManager.updateArtifactsAtLocation(annotatedView.location().id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
              that.setModelChanged();
            });
          }
          else {
            log("ERROR: expected location to be there, but its missing!");
          }
        }
        else if (annotatedView.typeName() === 'ArmyView') {
          annotationView = AWE.UI.createArmyAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onMoveButtonClick = (function (self) {
            return function (view) {
              self.armyMoveButtonClicked(view);
            }
          })(that);

          annotationView.onFoundButtonClick = (function (self) {
            return function (view) {
              self.armyFoundSettlementButtonClicked(view);
            }
          })(that);

          annotationView.onCancelMoveButtonClick = (function (self) {
            return function (view) {
              self.armyCancelMoveButtonClicked(view);
            }
          })(that);

          annotationView.onAttackButtonClick = (function (self) {
            return function (view) {
              self.armyAttackButtonClicked(view);
            }
          })(that);

          annotationView.onRetreatButtonClick = (function (self) {
            return function (army) {
              self.armyRetreatButtonClicked(army);
            }
          })(that);

          annotationView.onBattleInfoButtonClick = (function (self) {
            return function (army) {
              self.battleInfoButtonClicked(army);
            }
          })(that);

          annotationView.onStanceButtonClick = (function (self) {
            return function (army) {
              self.stanceButtonClicked(army);
            }
          })(that);

          armyUpdates[annotatedView.army().getId()] = annotatedView.army();
        }
        else if (annotatedView.typeName() === 'BaseView' || annotatedView.typeName() === 'OutpostView') {
          annotationView = AWE.UI.createBaseAnnotationView();
          annotationView.initWithControllerAndView(that, annotatedView);

          annotationView.onAttackButtonClick = (function (self) {
            return function (view) {
              self.settlementAttackButtonClicked(view);
            }
          })(that);

          annotationView.onBattleInfoButtonClick = (function (self) {
            return function (army) {
              self.battleInfoButtonClicked(army);
            }
          })(that);

          if (annotatedView.location()) {
            AWE.GS.SettlementManager.updateSettlementsAtLocation(annotatedView.location().id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
              that.setModelChanged();
            });
          }
          else {
            log("ERROR: expected location to be there, but its missing!");
          }
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
      var setTargetPosition = function (view, pos) {
        view.setCenter(AWE.Geometry.createPoint(
          pos.x,
          pos.y - 48
        ));
      }

      var newTargetViews = {};

      if (currentAction) {
        if (currentAction.typeName === 'moveAction') {
          var targetLocations = getVisibleTargetLocations(currentAction.army);
          AWE.Ext.applyFunctionToElements(targetLocations, function (location) {
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
          AWE.Ext.applyFunctionToElements(targetArmies, function (targetArmy) {
            var targetView = targetViews[targetArmy.getId()];
            var armyLocation = AWE.Map.Manager.getLocation(targetArmy.get('location_id'));

            if (targetArmy.isGarrison()) {
              var targetedView = armyLocation.isFortress() ? fortressViews[armyLocation.node().id()] : locationViews[armyLocation.id()];
            }
            else {
              var targetedView = armyViews[targetArmy.getId()];
            }

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
              }
              setTargetPosition(targetView, targetedView.center());
              newTargetViews[targetArmy.getId()] = targetView;
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

    that.updateInspectorViews = function () {
      if (inspectorViews.inspector) {
        inspectorViews.inspector.setOrigin(AWE.Geometry.createPoint(_windowSize.width - 430, _windowSize.height - 234));
      }
      if (inspectorViews.tempToggleButtonView) {
        inspectorViews.tempToggleButtonView.setOrigin(AWE.Geometry.createPoint(180 + 20, _windowSize.height - 68));
      }
      if (inspectorViews.mapButtonsBackgroundView) {
        inspectorViews.mapButtonsBackgroundView.setOrigin(AWE.Geometry.createPoint(20, _windowSize.height - 160));
      }
      if (inspectorViews.mapTypeToggleButtonView) {
        inspectorViews.mapTypeToggleButtonView.setOrigin(AWE.Geometry.createPoint(20 + 46, _windowSize.height - 154));
      }
      if (inspectorViews.encyclopediaButtonView) {
        inspectorViews.encyclopediaButtonView.setOrigin(AWE.Geometry.createPoint(20 + 114, _windowSize.height - 101));
      }

      return _inspectorChanged || _windowChanged;
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Update Map View
    //
    // ///////////////////////////////////////////////////////////////////////

    that.updateViewHierarchy = (function () {
      var oldVisibleArea = null;
      var oldWindowSize = null;
      var lastHideOtherArmies = hideOtherArmies;
      var lastDisableArmies = _disableArmies;
      var lastViewportChanged = _viewPortChanged;


      var propUpdates = function (viewHash) {
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

      return function (nodes, visibleArea) {

        var stagesNeedUpdate = [false, false, false, false]; // replace true with false as soon as stage 1 and 2 are implemented correctly.

        // rebuild individual hieararchies
        if (_windowChanged || this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[0] = this.rebuildMapHierarchy(nodes) || stagesNeedUpdate[0];
        }

        if ((AWE.Config.MAP_MOVE_ARMIES && _loopCounter % 60 == 0) ||
          _windowChanged || this.modelChanged() || (oldVisibleArea && !visibleArea.equals(oldVisibleArea)) ||
          _actionViewChanged || lastHideOtherArmies != hideOtherArmies || lastViewportChanged != _viewPortChanged ||
          lastDisableArmies != _disableArmies) { // if moving map
          stagesNeedUpdate[1] = this.updateGamingPieces(nodes) || stagesNeedUpdate[1];
        }
        
        lastHideOtherArmies = hideOtherArmies;
        lastDisableArmies = _disableArmies;
        lastViewportChanged = _viewPortChanged;

        if (_windowChanged || this.modelChanged() || _actionViewChanged || currentAction || (oldVisibleArea && !visibleArea.equals(oldVisibleArea))) {
          stagesNeedUpdate[2] = that.updateActionViews();
        }

        if (_windowChanged || _actionViewChanged || !inspectorViews.inspector || _inspectorChanged) { // TODO: only update at start and when something might have changed (object selected, etc.)
          stagesNeedUpdate[3] = that.updateInspectorViews() || stagesNeedUpdate[3];
        }

        // log('Update:                   ', stagesNeedUpdate[0], stagesNeedUpdate[1], stagesNeedUpdate[2], stagesNeedUpdate[3])

        // log('propagate update');


        // update hierarchies and check which stages need to be redrawn
        stagesNeedUpdate[0] = propUpdates(regionViews) || stagesNeedUpdate[0];
        stagesNeedUpdate[1] = propUpdates(fortressViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(locationViews) || stagesNeedUpdate[1];
        stagesNeedUpdate[1] = propUpdates(artifactViews) || stagesNeedUpdate[1];
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
    var fps = 60;

    that.updateFPS = function () {

      // calculate fps
      var now = +new Date();
      var alpha = 0.2; // smoothing factor
      if (startTime > 0) {
        fps = fps * (1.0 - alpha) + (1000.0 / (now - startTime)) * alpha;
        $('#debug').text(Math.round(fps));
      }
      startTime = now;
      _frameCounter++;
    };

    that.updateDebug = function () {
      var numRegionViews = AWE.Util.hashCount(regionViews);
      var numFortressViews = AWE.Util.hashCount(fortressViews);
      var numArmyViews = AWE.Util.hashCount(armyViews);
      var numArtifactViews = AWE.Util.hashCount(artifactViews);
      var numLocationViews = AWE.Util.hashCount(locationViews);

      $("#debug2").html('&nbsp; Number of visible views: ' + numRegionViews + '/' + numFortressViews +
        '/' + numLocationViews + '/' + numArmyViews + '/' + numArtifactViews + '/' + ' (regions, fortresses, locations, armies, artifacts)');
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // ///////////////////////////////////////////////////////////////////////


    that.cleanupData = (function() {
      
      var lastCleanup = null;
      
      return function(visibleNodes) {
        if (AWE.Config.GS_CLEANUP_ENABLED && (!lastCleanup || (new Date()).getTime() - lastCleanup.getTime() > 10*1000)) {
          log('CLEANUP?');

          lastCleanup   = new Date();
          
          var armies    = AWE.GS.ArmyManager.getEntities();
          var numArmies = AWE.Util.hashCount(armies);
          
          if (numArmies > 1) {
            log('DO CLEANUP ARMIES', numArmies);
            
            var regionList = {};
            visibleNodes.forEach(function(node) {
              var region = node.region();
              if (region) {
                regionList[region.id()] = true;
              }
              
              AWE.GS.ArmyManager.cleanup(regionList);
            });
          }
        }
      };

    })();  
    

    that.runloop = function () {

      // only do something after the Map.Manager has been initialized (connected to server and received initial data)
      if (AWE.Map.Manager.isInitialized()) {
        // STEP 0: update the camera, in case that it is currently moving
        if (_camera.hasChanged()) {
          _camera.update();
          var newViewport = _camera.viewport();
          //log("newViewport="+newViewport.toString());
          if (newViewport !== null && newViewport !== undefined) {
            that.setViewport(newViewport);
            that.setNeedsLayout();
          } else {
            console.error("the camera needed an update, but did not return a new viewport");
          }
          _viewPortChanged = true;
        }
        else {
          _viewPortChanged = false;
        }

        // STEP 1: determine visible area (may have changed through user interaction)
        var visibleArea = that.vc2mc(AWE.Geometry.createRect(0, 0, _windowSize.width, _windowSize.height));

        // STEP 2: trigger update of model as needed, fetch new data from server
        that.updateModel(visibleArea);

        // STEP 3: layout canvas & stages according to possibly changed window size (TODO: clean this!)
        that.layoutIfNeeded();

        // STEP 3b: animations
        var animating = false;
        AWE.Ext.applyFunction(_animations, function (animation) {
          if (animation.animating()) {
            animating = true;
          }
        });

        // STEP 4: update views and repaint view hierarchies as needed
        if (_windowChanged || _needsDisplay || _loopCounter % 6 == 0 || that.modelChanged() || _actionViewChanged || animating) {
          // STEP 4a: get all visible nodes from the model
          var visibleNodes = AWE.Map.getNodesInAreaAtLevel(AWE.Map.Manager.rootNode(), visibleArea, level(), false, that.modelChanged());

          // STEP 4b: create, remove and update all views according to visible parts of model
          var stageUpdateNeeded = that.updateViewHierarchy(visibleNodes, visibleArea);
          
          that.cleanupData(visibleNodes);

          if (animating) {
            var runningAnimations = [];
            AWE.Ext.applyFunction(_animations, function (animation) {
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
            [fortressViews, artifactViews, armyViews, locationViews, movementArrowViews],
            [actionViews, targetViews],
            inspectorViews
          ];

          for (var i = 0; i < _stages.length; i++) {
            if (stageUpdateNeeded[i] || _windowChanged || i == 1) { // i == 1   => hack to always update gaming pieces, which are animated
              if (_sortStages[i]) {  // TODO: add configuration: stage needs sorting
                _stages[i].sortChildren(function (a, b) {
                  var az = a.y + a.height;
                  var bz = b.y + b.height;
                  return az - bz;
                });
              }
              _stages[i].update();
              //log(viewsInStages, regionViews);
              AWE.Ext.applyFunction(viewsInStages[i], function (viewHash) {
                // log (viewHash);
                AWE.Ext.applyFunctionToElements(viewHash, function (view) {
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

}(AWE.Controller || {});



