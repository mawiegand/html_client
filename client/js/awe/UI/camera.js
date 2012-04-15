
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
		that.inverse = function() {
			return module.createCameraPan(
				_targetViewport,
				_startViewport,
				_panTime
				);
		};

	    return that;
	};

	module.createCamera = function (spec) {
		var that = {};

		var _lastUpdate = undefined;
		var _lastClick = undefined;
		var _activePan = undefined;
		var _isUndoingPan = false;
		var _lastPanEndViewport = undefined;
		var _lastNode = undefined;
		/** Milliseconds **/
		var _maxTimeForDoubleClick = AWE.Config.MAP_DBLCLK_MAX_TIME_FOR_DBLCLK;
		var _panTime = AWE.Config.MAP_DBLCLK_CAMERA_PANTIME;
		var _borderFactor = AWE.Config.MAP_DBLCLK_CAMERA_BORDER_FACTOR;
		var _isMoving = false;

		var _rootController = spec.rootController;

		that.isMoving = function() {
			return _isMoving;
		};

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

		that.onMouseUp = function(event) {
			var now = (new Date()).getTime();
			if (_lastClick !== undefined) {
				console.log(now-_lastClick);
			}
			if (_lastClick !== undefined &&
				now - _lastClick <= _maxTimeForDoubleClick
			) {
				//generate model point
				var p = _rootController.vc2mc(AWE.Geometry.createPoint(event.pageX, event.pageY));
				//get node
				var node = AWE.Map.getNodeThatContainsPoint(
					AWE.Map.Manager.rootNode(),
					p,
					_rootController.level()()
				);
				//if there is no node there just return
				if (node == null) return;
				//

				//zoom back out if the double click results in the same viewport
				if (_lastPanEndViewport !== undefined && 
					/*_lastPanEndViewport.equals(_rootController.viewport()) &&*/
					_activePan !== undefined &&
					!_isUndoingPan &&
					_lastNode !== undefined &&
					_lastNode.id() === node.id()) {

					_isUndoingPan = true;
					_activePan = module.createCameraPan(
						_rootController.viewport(),
						_activePan.startViewport(),
						_panTime
					);
					_isMoving = true;
				} else {
					//zoom in
					//create a rectangle
					var target = node.frame();
					var widthOffset = target.size.width*_borderFactor;
					var heightOffset = target.size.height*_borderFactor;
					target = AWE.Geometry.createRect(
						target.origin.x - widthOffset/2.0,
						target.origin.y - heightOffset/2.0,
						target.size.width + widthOffset,
						target.size.height + heightOffset
					);
					//create a pan
					_activePan = module.createCameraPan(
						_rootController.viewport(),
						target,
						_panTime
					);
					_isUndoingPan = false;
					_isMoving = true;
					_lastNode = node;
				}

			}
			_lastClick = now;
		};

		that.update = function() {
			if (_activePan !== undefined && _isMoving) {
				_activePan.update();
				var v = _activePan.getCurrentViewport();
				var win = _rootController.windowSize();
				var target = undefined;
				//expand the target viewport so that the w/h is conserved
				if (win.width/win.height > v.size.width/v.size.height) {
					//modify width
					var width = (win.width/win.height) * v.size.height;
					target = AWE.Geometry.createRect(
						v.origin.x - (width-v.size.width)/2.0,
						v.origin.y,
						width,
						v.size.height
					);
				} else {
					//modify height
					var height = (win.height/win.width) * v.size.width;
					target = AWE.Geometry.createRect(
						v.origin.x,
						v.origin.y - (height-v.size.height)/2.0,
						v.size.width,
						height
					);
				}

				_rootController.setViewport(target);
				_isMoving = !_activePan.done();
				if (!_isMoving) {
					_lastPanEndViewport = _rootController.viewport().copy();
				}
			} else {
				_isMoving = false;
			}
			//update the time
			_lastUpdate = new Date();
		};

		that.panTo = function(node) {
			module.createCameraPan();
		};

		that.undoLastPan = function() {

		};

		return that;
	};

  return module;
    
}(AWE.UI || {}));