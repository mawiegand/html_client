
/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, 
 *			Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

	module.createCameraPan = function (startViewport, targetViewport, panTime) {
		var that = {};

		var _startViewport = startViewport.copy();
		var _targetViewport = targetViewport.copy();

		var _startTime = new Date();
		var _panTime = panTime;

		var _phase = 0.0;

		that.done = function() {
			return _phase >= 1.0;
		};
		that.startViewport = function() {
			return _startViewport;
		};
		that.targetViewport = function() {
			return _targetViewport;
		};

		/** Defines the speed that the zoom animation moves (can be overwritten).
		  * @param time a float in the range of [0,1]. 0 defines the beginning and 1 end of the animation.
		  * @return a float in the range of [0,1]. 0 stands for the startinglocation and 1 the targetlocation.
		**/
		that.speedFunction = function(time) {
			return (Math.cos(time*Math.PI + Math.PI) + 1)/2;
		};

		that.getCurrentViewport = function() {
			return AWE.Geometry.createRect(
				_startViewport.origin.x*(1.0-_phase) + _targetViewport.origin.x*_phase,
				_startViewport.origin.y*(1.0-_phase) + _targetViewport.origin.y*_phase,
				_startViewport.size.width*(1.0-_phase) + _targetViewport.size.width*_phase,
				_startViewport.size.height*(1.0-_phase) + _targetViewport.size.height*_phase
			);
		};
		that.update = function() {
			_phase = (new Date()).getTime()-_startTime.getTime();
			_phase /= panTime;
			_phase = that.speedFunction(Math.min(_phase, 1.0));
		};

	    return that;
	};

	module.createCamera = function (spec) {
		var that = {};

		//***private variables***
		//state
		var _lastClick = undefined;
		var _activePan = undefined;

		var _isUndoingPan = false;
		var _lastScale = undefined;
		var _cacheLastViewport = false;
		var _lastPanEndViewport = undefined;
		var _lastNodes = [];

		var _isMoving = false;
		var _windowSizeChanged = false;

		//current data
		var _currentViewport = spec.viewport.copy();
		var _windowSize = spec.windowSize.copy();

		//settings
		var _maxTimeForDoubleClick = AWE.Config.MAP_DBLCLK_MAX_TIME_FOR_DBLCLK;
		var _panTime = AWE.Config.MAP_DBLCLK_CAMERA_PANTIME;
		var _borderFactor = AWE.Config.MAP_DBLCLK_CAMERA_BORDER_FACTOR;
		var _crossClickSize = AWE.Config.MAP_DBLCLK_CAMERA_CROSS_CLICK_SIZE;
		var _framePrecision = 0.001;
		
		//root controller
		var _rootController = spec.rootController;

		//***private methods***
		var _nodesEqual = function(a,b) {
			if (a.length != b.length) return false;
			for (var ai = 0; ai < a.length; ai++) {
				var found = false;
				for (var bi = 0; bi < b.length; bi++) {
					if (a[ai].id() === b[bi].id()) {
						found = true;
						break;
					}
				}
				if (!found) {
					return false;
				}
			}
			return true;
		};

		var _scaleToScreen = function(frame) {
			var win = _currentViewport;//_rootController.windowSize();
			//expand the target viewport so that the w/h is conserved
			if (win.width/win.height > frame.size.width/frame.size.height) {
				//modify width
				var width = (win.width/win.height) * frame.size.height;
				return AWE.Geometry.createRect(
					frame.origin.x - (width-frame.size.width)/2.0,
					frame.origin.y,
					width,
					frame.size.height
				);
			} else {
				//modify height
				var height = (win.height/win.width) * frame.size.width;
				return AWE.Geometry.createRect(
					frame.origin.x,
					frame.origin.y - (height-frame.size.height)/2.0,
					frame.size.width,
					height
				);
			}
		};

		//internal just in case someone else externaly changes the viewport (window size change etc.)
		var _getCurrentViewport = function() {
			return _rootController.viewport();
		};

		//***public methods***

		//--getter/setter for settings
		that.maxTimeForDoubleClick = function(value) {
			if (value !== undefined) { 
				_maxTimeForDoubleClick = value; 
			}
			return _maxTimeForDoubleClick;
		};
		that.panTime = function(value) {
			if (value !== undefined) {
				_panTime = value;
			}
			return _panTime;
		};
		that.borderFactor = function(value) {
			if (value !== undefined) {
				_borderFactor = value;
			} 
			return _borderFactor;
		};
		that.crossClickSize = function(value) {
			if (value !== undefined) {
				_crossClickSize = value;
			}
			return _crossClickSize;
		};

		//--getter/setter + state informations

		that.windowSize = function(size) {
			if (size !== undefined) {
				//modify viewport
				var xOff = _currentViewport.size.width * (size.width / _windowSize.width) - _currentViewport.size.width ;
				var yOff = _currentViewport.size.height * (size.height / _windowSize.height) - _currentViewport.size.height;
				_currentViewport.size.width += xOff;
				_currentViewport.size.height += yOff;
				_currentViewport.origin.x -= xOff/2;
				_currentViewport.origin.y -= yOff/2;
				//set size
				_windowSize = size.copy();
				//mark that the windowSize has changed
				_windowSizeChanged = true;
			}
			return _windowSize;
		};
		that.isMoving = function() {
			return _isMoving;
		};
		that.hasChanged = function() {
			return _isMoving || _windowSizeChanged;
		};

		

		/**
		  *	Returns the current viewport (from the viewpoint of the camera)
		  **/
		that.viewport = function() {
			return _currentViewport;
		};

		that.onMouseUp = function(event) {
			var now = (new Date()).getTime();
			if (_lastClick !== undefined &&
				now - _lastClick <= _maxTimeForDoubleClick &&
				!that.isMoving()
			) {
				//generate model point
				var p = _rootController.vc2mc(AWE.Geometry.createPoint(event.pageX, event.pageY));
				//get node[s]
				var node = AWE.Map.getNodeThatContainsPoint(
					AWE.Map.Manager.rootNode(),
					p,
					_rootController.level()
				);

				//if there is no node there just return
				if (node == null) return;

				var nodes = AWE.Map.getNodesInAreaAtLevel(
					AWE.Map.Manager.rootNode(), 
					_rootController.vc2mc(
						AWE.Geometry.createRect(
							event.pageX-_crossClickSize/2.0,
							event.pageY-_crossClickSize/2.0,
							_crossClickSize,
							_crossClickSize
						)
					),
					_rootController.level(), 
					false, //only completly inside
					true //force recalc
				);

				//detected a click on a cross section
				if (nodes.length < 3) {
					nodes = [node];
				}

				//get the frame
				var nodeFrame = that.getResultingFrame(nodes,true);

				if (nodeFrame === null || nodeFrame === undefined) {
					return;
				}

				if (_lastPanEndViewport !== undefined &&
					_lastPanEndViewport.equals(_rootController.viewport(), _framePrecision) && 
					_nodesEqual(_lastNodes, nodes) &&
					//_scaleToScreen(nodeFrame).equals(_rootController.viewport()) &&
					_lastScale !== undefined ) {

					//calculate current center
					var curr = _getCurrentViewport();
					var center = AWE.Geometry.createPoint(
						curr.origin.x + curr.size.width/2,
						curr.origin.y + curr.size.height/2
					);
					//create new frame according to center and old scale and move there
					that.moveTo(
						AWE.Geometry.createRect(
							center.x - _lastScale.width/2,
							center.y - _lastScale.height/2,
							_lastScale.width,
							_lastScale.height
						), 
						false);
				} else {
					if (_lastScale === undefined ||
						//_lastScale.area() > nodeFrame.area() 
						_getCurrentViewport().size.area() - _scaleToScreen(nodeFrame).size.area() > _framePrecision
					) {
						_lastScale = _rootController.viewport().size.copy();	
					}
					_lastNodes = nodes;
					_cacheLastViewport = true;
					that.moveTo(nodeFrame, false);
				}


			}
			_lastClick = now;
		};

		/**
		  * Updates the currentViewport.
		  **/
		that.update = function() {
			if (_activePan !== undefined && _isMoving) {
				_activePan.update();
				_currentViewport = _scaleToScreen(_activePan.getCurrentViewport());
				_isMoving = !_activePan.done();
				if (!_isMoving && _cacheLastViewport) {
					_lastPanEndViewport = _currentViewport.copy();
					_cacheLastViewport = false;
				}
			} else {
				_isMoving = false;
			}
			_windowSizeChanged = false;
		};
		/**
		  * Moves the camera to the given value.
		  * @param value the value can be a array of nodes, a node, a frame or a point. In case it is a point the viewport center will be moved there.
		  * @param animated default:true. if false 
		  * @param addBorder default:true. if true there will be. If a point is given, addBroder should probably be set to false.
		 **/
		that.moveTo = function(value, addBorder, animated) {
			//default is animated
			if (animated === undefined) {
				animated = true;
			}

			if (that.isMoving()) {
				console.warn("The camera was moving and got a request for another move command");
			}

			var frame = that.getResultingFrame(value, addBorder);

			_activePan = module.createCameraPan(
				_rootController.viewport(), 
				frame, 
				_panTime
			);
			_isMoving = true;
			if (!animated) {
				_activePan.speedFunction = function (time) { return 1.0; };
			}
		};

		/**
		  * Returns the resulting frame for a node, an array of nodes or a frame.
		  * @param value node, array of node, frame or point
		  * @param addBorder default:true (unless value is a point then the default is false). if true a border will be added according to the borderFactor.
		  * @return the resulting target frame
		 **/
		that.getResultingFrame = function(value, addBorder) {
			var target;
			//array of nodes
			if ($.isArray(value) && value.length > 0) {
				var f0 = value[0].frame();
				var origin = f0.origin.copy();
				for (var i = 1; i < value.length; i++) {
					var f = value[i].frame();
					if (f.origin.x < origin.x) {
						origin.x = f.origin.x;
					}
					if (f.origin.y < origin.y) {
						origin.y = f.origin.y;
					}
				}
				var max = AWE.Geometry.createPoint(
					f0.origin.x + f0.size.width,
					f0.origin.y + f0.size.height
				);
				for (var i = 1; i < value.length; i++) {
					var f = value[i].frame();
					if (f.origin.x + f.size.width > max.x) {
						max.x = f.origin.x + f.size.width;
					}
					if (f.origin.y + f.size.height > max.y) {
						max.y = f.origin.y + f.size.height;
					}
				}
				target = AWE.Geometry.createRect(
					origin.x,
					origin.y,
					max.x - origin.x,
					max.y - origin.y
				);
			//single node
			} else if ($.isFunction(value.frame)) {
				target = value.frame().copy();
			//frame
			} else if (value.origin !== undefined &&
				value.size !== undefined) {
				target = value.copy();
			//point
			} else if (value.x !== undefined && value.y !== undefined) {
				var f = _rootController.viewport();
				target = AWE.Geometry.createRect(
					value.x-f.size.width/2,
					value.y-f.size.height/2,
					f.size.width,
					f.size.height
				);
			} else {
				return null;
			}
			//add border
			if ((addBorder === undefined && value.x === undefined) || addBorder === true) {
				var widthOffset = (!addBorder)?0:target.size.width*_borderFactor;
				var heightOffset = (!addBorder)?0:target.size.height*_borderFactor;
				return AWE.Geometry.createRect(
					target.origin.x - widthOffset/2.0,
					target.origin.y - heightOffset/2.0,
					target.size.width + widthOffset,
					target.size.height + heightOffset
				);
			}
			return target;
		}

		return that;
	};

  return module;
    
}(AWE.UI || {}));