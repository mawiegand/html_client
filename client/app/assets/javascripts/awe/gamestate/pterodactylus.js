/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {
          
  module.Pterodactylus = Ember.Object.extend({

    pteroAnimState: null,

    enabled: false,
    started: false,

    direction: 0, //0 = left => right, 1 = right => left

    currentFlapsPerAnim: 3,
    flapIntervalMin: 2,   
    flapIntervalMax: 4,  
    flapsPerAnimMin: 2,   
    flapsPerAnimMax: 5,
    flapAnimFrames: 4,
    frameDuration: 0.1,
    startDelay: 5,

    speed: 10,

    lastPteroModeChange = null,
    var _initTime = null;

    startPosition: {
        x: "110%",
        y: "50%"
      },
    endPosition: {
        x: "-10%",
        y: "80%"
      },

    init: function() {
      var view = AWE.UI.Ember.PteroView.create();
      view.appendTo(anchor);

      pteroAnimState = AWE.Config.ANIMATION_STATE_IDLE;
    }

    pteroNeedsFlap: function() {
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
    },

    pteroCanGoIdle: function() {
      var now = new Date();
      var animDuration = _ptero.currentFlapsPerAnim * _ptero.flapAnimFrames * _ptero.frameDuration;

      var timeSinceLastUpdate = now - _lastPteroModeChange;
      if(timeSinceLastUpdate / 1000 >= animDuration)
      {
        _lastPteroModeChange = now;
        return true;
      }
      return false;
    },

    isReadyForTakeOff: function() {
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
    },

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