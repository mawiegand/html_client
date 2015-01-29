/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {
          
  module.Pterodactylus = function(anchor) {
    
    var _pteroView = null;
    var _pteroShadowView = null;

    var pteroAnimState = null;
    var createPterodactylus = function() {
      ptero = {};
      ptero.enabled: false;
      ptero.started: false;
      ptero.direction: 0;   //0 = left => right, 1 = right => left
      ptero.currentFlapsPerAnim: 3;
      ptero.flapIntervalMin: 2;   
      ptero.flapIntervalMax: 4;   
      ptero.flapsPerAnimMin: 2;   
      ptero.flapsPerAnimMax: 5;
      ptero.flapAnimFrames: 4;
      ptero.frameDuration: 0.1;
      ptero.startDelay: 5;
      ptero.speed: 10;       
      ptero.startPosition: {
        x: "110%",
        y: "50%"
      };
      ptero.endPosition: {
        x: "-10%",
        y: "80%"
      };
      ptero.view = AWE.UI.Ember.PteroView.create();

      ptero.view.appendTo('#main-screen-controller');
    };

    var newPtero = new _ptero();

    var _pterodactylusFlyIntervalMin = null;
    var _pterodactylusFlyIntervalMax = null;
    var _autoPtero = false;

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

      
      pteroAnimState = AWE.Config.ANIMATION_STATE_IDLE;
      
    };

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