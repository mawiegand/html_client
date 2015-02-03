/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createExtrasController = function(anchor) {
    
    var _pteroView = null;
    var _pteroShadowView = null;

    var pteroAnimState = null;
    var _ptero = {
      enabled: false,
      started: false,
      direction: 0,   //0 = left => right, 1 = right => left
      currentFlapsPerAnim: 3,
      flapIntervalMin: 2,   
      flapIntervalMax: 4,   
      flapsPerAnimMin: 2,   
      flapsPerAnimMax: 5,
      flapAnimFrames: 4,
      frameDuration: 0.1,
      startDelay: 5,
      speed: 10,       
      startPosition: {
        x: "110%",
        y: "50%"
      },
      endPosition: {
        x: "-10%",
        y: "80%"
      }
    };

    var _pterodactylusFlyIntervalMin = 60;
    var _pterodactylusFlyIntervalMax = 90;

    var _lastPteroModeChange = null;
    var _initTime = null;


    var that = module.createScreenController(anchor); ///< create base object

    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////

    that.init = function() {
      _super.init();  

      var self = this;

      _pteroView = AWE.UI.Ember.PteroView.create({
        controller: self,
      });

      var root = that.rootElement();
      _pteroView.appendTo('#main-screen-controller');
      pteroAnimState = AWE.Config.ANIMATION_STATE_IDLE;
      
    };

    that.enableAutoPterodactylus = function(minDelay, maxDelay) {
      _pterodactylusFlyIntervalMin = minDelay;
      _pterodactylusFlyIntervalMax = maxDelay;

      _ptero.autoEnabled = true;
    }

    that.startPterodactylus = function(from, to, speed, delay) {
      _ptero.startPosition.x = String(from.x) + '%' || _ptero.startPosition.x;
      _ptero.startPosition.y = String(from.y) + '%' || _ptero.startPosition.y;
      _ptero.endPosition.x = String(to.x) + '%' || _ptero.endPosition.x;
      _ptero.endPosition.y = String(to.y) + '%' || _ptero.endPosition.y;
      _ptero.startDelay = delay || _ptero.startDelay;
      _ptero.speed = speed || _ptero.speed;

      if(_ptero.startPosition.x < _ptero.endPosition.x)
      {
        _ptero.direction = 1;
      }

      _initTime = new Date();
      _ptero.enabled = true;
    }

    that.startRandomPterodactylus = function() {
      var delay = Math.getRandomBetween(_pterodactylusFlyIntervalMin, _pterodactylusFlyIntervalMax);
      var start = {
        x: Math.getRandomOfTwo(-10, 100),
        y: Math.getRandomBetween(10, 90)
      };

      var endX = -10;
      if(start.x === -10)
      {
        endX = 100;
      }

      var end = {
        x: endX,
        y: Math.getRandomBetween(10, 90)
      };

      that.startPterodactylus(start, end, _ptero.speed, delay);
    }

    that.pteroNeedsFlap = function() {
      var now = new Date();
      var timeSinceLastUpdate = now - _lastPteroModeChange;
      var interval = _ptero.flapIntervalMin + (Math.random()*(_ptero.flapIntervalMax - _ptero.flapIntervalMin));
      if(timeSinceLastUpdate / 1000 >= interval)
      {
        _lastPteroModeChange = now;
        _ptero.currentFlapsPerAnim = Math.floor(_ptero.flapsPerAnimMin + (Math.random()*(_ptero.flapsPerAnimMax - _ptero.flapsPerAnimMin + 1)));
        return true;
      }
      return false;
    };

    that.pteroCanGoIdle = function() {
      var now = new Date();
      var animDuration = _ptero.currentFlapsPerAnim * _ptero.flapAnimFrames * _ptero.frameDuration;

      var timeSinceLastUpdate = now - _lastPteroModeChange;
      if(timeSinceLastUpdate / 1000 >= animDuration)
      {
        _lastPteroModeChange = now;
        return true;
      }
      return false;
    };

    that.isReadyForTakeOff = function() {
      var now = new Date();
      var timeSinceStart = now - _initTime;
      if(timeSinceStart / 1000 >= _ptero.startDelay)
      {
        $('.ptero').css({
          top: _ptero.startPosition.y,
          left: _ptero.startPosition.x
        });
        if(_ptero.direction === 1)
        {
          $('.ptero').css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          });
          $('.ptero .shadow').css({
            left: '50px',
          });
        }
        $('.ptero').animate({
          top: _ptero.endPosition.y,
          left: _ptero.endPosition.x
        }, _ptero.speed * 1000, 'linear', function(){_ptero.enabled = false});

        _ptero.started = true;

      }
    }

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    var _loopCounter = 0;

    that.runloop = function() {
      if(_ptero.enabled)
      {
        if(_ptero.started) { 

          if(pteroAnimState === AWE.Config.ANIMATION_STATE_IDLE && that.pteroNeedsFlap())
          {
            pteroAnimState = AWE.Config.ANIMATION_STATE_MOVE;
          }
          else if(pteroAnimState === AWE.Config.ANIMATION_STATE_MOVE && that.pteroCanGoIdle())
          {
            pteroAnimState = AWE.Config.ANIMATION_STATE_IDLE;
          }

          _pteroView.setAnimState(pteroAnimState);

          
          _loopCounter++;
        }
        else
        {
          that.isReadyForTakeOff();
        }
      }
    };

    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));