var AWE = AWE || {};

AWE.UI = (function(module) {

	/** Attaches slider callbacks to a slider container and positions all it's elements 
	  * @param _container the html element which contains all the slider elements
	  * @param _endInSlider if true the slider max/min positions are positioned in a way, that the slider stays insider the slide_bar
	  * @param _isVertical says in which direction the slider can move (if true up/down, false left/right)
	  */
	module.createSlider = function (_container, _isVertical, _endInSlider, _onChangeCallback) {
		var that = {};

		var _sliderElement = undefined;
		var _sliderBarElement = undefined;

		var _eventLastPosition = undefined;
		var _offset;
		var _value = 0;

		var _subscribers = [];

		//
		var _getCurrentSliderBarPositon = function() {
			var result = undefined;
			if (_isVertical) {
				var length = $(_sliderBarElement).outerHeight();
				var startOffset = 0;
				if (_endInSlider) {
					startOffset = $(_sliderElement).outerHeight()/2;
					length = length - $(_sliderElement).outerHeight();
				}
				result = (AWE.Geometry.createPoint(
						$(_sliderBarElement).outerWidth()/2,
						startOffset + length*_value
					)
				);
			} else {
				var length = $(_sliderBarElement).outerWidth();
				var startOffset = 0;
				if (_endInSlider) {
					startOffset = $(_sliderElement).outerWidth()/2;
					length = length - $(_sliderElement).outerWidth();
				}
				result = (AWE.Geometry.createPoint(
						startOffset + length*_value,
						$(_sliderBarElement).outerHeight()/2
					)
				);
			}

			return result;
		};

		//moves the slider object to the current value positon
		var _updateSliderElement = function() {
			//callculate the current position of the slider
			var barPos = _getCurrentSliderBarPositon();
			//the offset of the bar relative to the container
			var barOffset = AWE.Geometry.createSize(
				$(_sliderBarElement).position().left,
				$(_sliderBarElement).position().top 
			);
			var sliderPositon = AWE.Geometry.createPoint(
				barPos.x + barOffset.width - ($(_sliderElement).outerWidth()/2),
				barPos.y + barOffset.height - ($(_sliderElement).outerHeight()/2)
			);
			$(_sliderElement).css("left", sliderPositon.x+"px");
			$(_sliderElement).css("top", sliderPositon.y+"px");
		};

		var _isOnSlider = function(x,y) {
			return (x >= $(_sliderElement).offset().left &&
				y < $(_sliderElement).offset().left + $(_sliderElement).outerWidth() &&
				y >= $(_sliderElement).offset().top &&
				y < $(_sliderElement).offset().top + $(_sliderElement).outerHeight());
		};

		var _isOnSliderBar = function(x,y) {
			return (x >= $(_sliderBarElement).offset().left &&
				y < $(_sliderBarElement).offset().left + $(_sliderBarElement).outerWidth() &&
				y >= $(_sliderBarElement).offset().top &&
				y < $(_sliderBarElement).offset().top + $(_sliderBarElement).outerHeight());
		};

		var _valueForPagePosition = function(x,y) {
			var result = 0;
			if (_isVertical) {
				//ignore x
				var length = $(_sliderBarElement).outerHeight();
				var startOffset = 0;
				if (_endInSlider) {
					startOffset = $(_sliderElement).outerHeight()/2;
					length = length - $(_sliderElement).outerHeight();
				}
				result = (y-($(_sliderBarElement).offset().top+startOffset)) / length; 
			} else {
				//ignore y
				var length = $(_sliderBarElement).outerWidth();
				var startOffset = 0;
				if (_endInSlider) {
					startOffset = $(_sliderElement).outerWidth()/2;
					length = length - $(_sliderElement).outerWidth();
				}
				result = (x-($(_sliderBarElement).offset().left+startOffset)) / length;
			}
			return Math.min(1, Math.max(result, 0));
		}

		//event handlers
		var _unSubscribeDocumentsEvents = undefined;

		var _onMouseDown = function(event) {
			//prevents drag and drop of image
			event.preventDefault();
			_eventLastPosition = AWE.Geometry.createPoint(event.pageX, event.pageY);
			$(document).bind(
				{
					mousemove: _onMouseMove,
					mouseup: _onMouseUp
				}
			);
			that.setValue(_valueForPagePosition(event.pageX, event.pageY), true);
		};
		var _onMouseMove = function(event) {
			if (_eventLastPosition !== undefined) {
				_eventLastPosition = AWE.Geometry.createPoint(event.pageX, event.pageY);
				that.setValue(_valueForPagePosition(_eventLastPosition.x, _eventLastPosition.y), true);
			}
		};
		var _onMouseUp = function(event) {
			if (_eventLastPosition !== undefined) {
				_unSubscribeDocumentsEvents();
				that.setValue(_valueForPagePosition(event.pageX, event.pageY), true);
				_eventLastPosition = undefined;
			}
		};
		var _onTouchStart = function(event) {
			$(document).bind(
				{
					touchmove: _onMouseUp,
					touchend: _onMouseMove
				}
			);
			_eventLastPosition = AWE.Geometry.createPoint(
				event.originalEvent.touches[0].pageX, 
				event.originalEvent.touches[0].pageY
			);

			that.setValue(_valueForPagePosition(_eventLastPosition.x, _eventLastPosition.y), true);
		};
		var _onTouchMove = function(event) {
			if (_eventLastPosition !== undefined) {
				_eventLastPosition = AWE.Geometry.createPoint(
					event.originalEvent.touches[0].pageX, 
					event.originalEvent.touches[0].pageY
				);
				that.setValue(_valueForPagePosition(_eventLastPosition.x, _eventLastPosition.y), true);
			}
		};
		var _onTouchEnd = function(event) {
			if (_eventLastPosition !== undefined) {
				_unSubscribeDocumentsEvents();
				_eventLastPosition = AWE.Geometry.createPoint(
					event.originalEvent.touches[0].pageX, 
					event.originalEvent.touches[0].pageY
				);
				that.setValue(_valueForPagePosition(_eventLastPosition.x, _eventLastPosition.y), true);
				_eventLastPosition = undefined;
			}
		};
		_unSubscribeDocumentsEvents = function() {
			$(document).unbind('mousemove', _onMouseMove);
			$(document).unbind('mouseup', _onMouseUp);
			$(document).unbind('touchmove', _onTouchMove);
			$(document).unbind('touchend', _onTouchEnd);
		};
		//constructor
		var _init = function() {
			//find the slider element
			$(_container).find(".slider_slider").each(
				function(i, value) {
					if (_sliderElement !== undefined) {
						console.error("Found multiple slider_slider objects in one container");
						return;
					}
					_sliderElement = value;
				}
			);
			if (_sliderElement === undefined) {
				console.error("could not find slider_slider");
			}
			//find the slider bar element
			$(_container).find(".slider_bar").each(
				function(i, value) {
					if (_sliderBarElement !== undefined) {
						console.error("Found multiple slider_bar objects in one container");
						return;
					}
					_sliderBarElement = value;
				}
			);
			if (_sliderElement === undefined) {
				console.error("could not find slider_bar");
			}
			//register the container to update the positon again in case that the slider element was not loaded
			_sliderElement.onload = function(event) {
				_updateSliderElement();
			};
			//position the slider element
			_updateSliderElement();
			
			//add subscriber if needed
			if (_onChangeCallback !== null && _onChangeCallback !== undefined) {
				_subscribers.push(_onChangeCallback);
			}

			//subscribe to the mouse events
			that.subscribeToDOMEvents();
		};

		var _callSubscribers = function() {
			for(var i=0; i<_subscribers.length; i++) {
				_subscribers[i](_value);
			}
		};

		//public methods

		///Sets the value
		///@param value must be 0 <= value <= 1
		that.setValue = function(value, callSubscribers) {
			if (callSubscribers === undefined) {
				callSubscribers = false;
			}
			if (callSubscribers) {
				_callSubscribers();
			}
			_value = Math.min(Math.max(0,value), 1);
			_updateSliderElement();
		};
		/** Adds a subscriber, that is beeing called if the slider value changes*/
		that.addSubscriber = function(subscriberFunction) {
			_subscribers.push(subscriberFunction);
		};
		/** Removes subscriber */
		that.removeSubscriber = function(subscriberFunction) {
			var si = -1;
			for(var i=0; i<_subscribers.length; i++) {
				if (_subscribers[i] === subscriberFunction) {
					si = i;
				}
			}
			if(si != -1) {
				_subscribers.splice(si, 1);
			}
		};
		that.subscribeToDOMEvents = function() {
			$(_sliderElement).bind(
				{
					mousedown: _onMouseDown,
					touchstart: _onTouchStart
				}
			);
			$(_sliderBarElement).bind(
				{
					mousedown: _onMouseDown,
					touchstart: _onTouchStart
				}
			);
		};

		that.unsubscribeDOMEvents = function() {
			$(_sliderElement).unbind('mousedown', _onMouseDown);
			$(_sliderElement).unbind('touchstart', _onTouchStart);
			$(_sliderBarElement).unbind('mousedown', _onMouseDown);
			$(_sliderBarElement).unbind('touchstart', _onTouchStart);
		};

		that.getContainer = function() {
			return _container;
		};

		_init();

		return that;
	}
	return module;
}(AWE.UI || {}));