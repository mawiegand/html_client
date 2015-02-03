/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {
          
  module.Pterodactylus = Ember.Object.extend({

    animState: null,

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

    lastPteroModeChange: null,
    enableTime: null,

    startPosition: {
        x: "110%",
        y: "10%"
      },
    endPosition: {
        x: "-10%",
        y: "80%"
      },

    view: null,
    id: 0,

    onReached: null,

    init: function() {
      var view = AWE.UI.Ember.PteroView.create();
      view.appendTo('#main-screen-controller');

      this.view = view;

      this.animState = AWE.Config.ANIMATION_STATE_IDLE;
      if(this.startPosition.x < this.endPosition.x)
      {
        this.direction = 1;
      }
    },

    enable: function() {
      this.enableTime = new Date();
      this.enabled = true;
    },

    pteroNeedsFlap: function() {
      var now = new Date();
      var timeSinceLastUpdate = now - this.lastPteroModeChange;
      var interval = Math.getRandomBetween(this.flapIntervalMin, this.flapIntervalMax);
      if(timeSinceLastUpdate / 1000 >= interval)
      {
        this.lastPteroModeChange = now;
        var currentFlaps = Math.getRandomBetween(this.flapsPerAnimMin, this.flapsPerAnimMax);
        this.currentFlapsPerAnim = currentFlaps;
        return true;
      }
      return false;
    },

    pteroCanGoIdle: function() {
      var now = new Date();
      var animDuration = this.currentFlapsPerAnim * this.flapAnimFrames * this.frameDuration;

      var timeSinceLastUpdate = now - this.lastPteroModeChange;
      if(timeSinceLastUpdate / 1000 >= animDuration)
      {
        this.lastPteroModeChange = now;
        return true;
      }
      return false;
    },

    isReadyForTakeOff: function() {
      var self = this;
      var now = new Date();
      var timeSinceStart = now - self.enableTime;
      if(timeSinceStart / 1000 >= self.startDelay)
      {
        var pteroIdClass = '.id-' + self.id + '.ptero';
        self.view.$(pteroIdClass).css({
          top: self.startPosition.y,
          left: self.startPosition.x
        });
        if(self.direction === 1)
        {
          self.view.$(pteroIdClass).css({
            '-moz-transform': 'scaleX(-1)',
            '-o-transform': 'scaleX(-1)',
            '-webkit-transform': 'scaleX(-1)',
            'transform': 'scaleX(-1)',
            'filter': 'FlipH',
            '-ms-filter': "FlipH"
          });
          var pteroShadowIdClass = pteroIdClass + " .shadow"
          self.view.$(pteroShadowIdClass).css({
            left: '50px',
          });
        }
        self.view.$(pteroIdClass).animate({
          top: self.endPosition.y,
          left: self.endPosition.x
        }, self.speed * 1000, 'linear', function(){

          self.view.destroy();
          if(self.onReached !== null)
          {
            self.onReached(self);
          }
          self.destroy();
        });

       this.started = true;

      }
    },

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    

    runloop: function() {
      if(this.enabled)
      {
        if(this.started) { 

          if(this.animState === AWE.Config.ANIMATION_STATE_IDLE && this.pteroNeedsFlap())
          {
            this.animState = AWE.Config.ANIMATION_STATE_MOVE;
          }
          else if(this.animState === AWE.Config.ANIMATION_STATE_MOVE && this.pteroCanGoIdle())
          {
            this.animState = AWE.Config.ANIMATION_STATE_IDLE;
          }

          if(this.view)
          {
            this.view.setAnimState(this.animState);
          }
        }
        else
        {
          this.isReadyForTakeOff();
        }
      }
    },

    setStartPosition: function(x, y) {
      this.startPosition.x = String(x) + '%';
      this.startPosition.y = String(y) + '%';
    },

    setEndPosition: function(x, y) {
      this.endPosition.x = String(x) + '%';
      this.endPosition.y = String(y) + '%';
    },

    setSpeed: function(speed) {
      this.speed = speed;
    },

    setDelay: function(delay) {
      this.delay = delay;
    },

    setId: function(id) {
      this.id = id;
      this.view.setId(id);
    },

    clear: function() {
      this.view.destroy();
      this.destroy();
    }

  });
    
    
  return module;
    
}(AWE.GS || {}));