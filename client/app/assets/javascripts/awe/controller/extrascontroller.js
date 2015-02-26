/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createExtrasController = function(anchor) {

    var that = module.createScreenController(anchor); ///< create base object

    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;

    var _pteros = [];
    var _autoPteroIntervalMin = 60; //in sec
    var _autoPteroIntervalMax = 90; //in sec
    var _autoPteroEnabled = false;

    var _egg = null;

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////

    that.init = function() {
      _super.init();  

      var self = this;      
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Pterodactyl
    //
    // ///////////////////////////////////////////////////////////////////////

    that.enableAutoPterodactylus = function() {
      _autoPteroEnabled = true;
      that.autoPterodactylus();
    }

    that.disableAutoPterodactylus = function() {
      _autoPteroEnabled = false;
    }

    that.clearPterodactyls = function() {
      _pteros.forEach(function(ptero) {
        ptero.clear();
      });
      _pteros = [];
    }

    that.autoPterodactylus = function(lastPtero) {
      if(lastPtero)
      {
        _pteros.splice(_pteros.indexOf(lastPtero), 1);
      }
      if(_autoPteroEnabled)
      {
        that.startRandomPterodactylus(_autoPteroIntervalMin, _autoPteroIntervalMax, that.autoPterodactylus);
      }
    };

    that.startPterodactylus = function(from, to, delay, callback) {
      var self = this;
      var start = {};
      start.x = String(from.x) + "%";
      start.y = String(from.y) + "%";

      var end = {};
      end.x = String(to.x) + "%";
      end.y = String(to.y) + "%";

      var ptero = AWE.GS.Pterodactylus.create({
        startPosition: {
          x: start.x,
          y: start.y
        },
        endPosition: {
          x: end.x,
          y: end.y
        },
        startDelay: delay,
        onReached: callback,
        controller: self
      });

      if(_pteros)
      {
        ptero.setId(_pteros.length);
      }

      ptero.enable();

      _pteros.push(ptero);
    };

    that.startRandomPterodactylus = function(minDelay, maxDelay, callback) {
      var delay = Math.getRandomBetween(minDelay, maxDelay);
      var start = {
        x: Math.getRandomOfTwo(-10, 110),
        y: Math.getRandomBetween(10, 50)
      };

      var endX = -10;
      if(start.x === -10)
      {
        endX = 100;
      }

      var end = {
        x: endX,
        y: Math.getRandomBetween(start.y, 60)
      };

      that.startPterodactylus(start, end, delay, callback);
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Retention Egg
    //
    // ///////////////////////////////////////////////////////////////////////

    that.initRetentionEgg = function(targetView) {
      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      var bonus = {
          stone: 8000,
          wood: 8000,
          fur: 8000
        };
        var startTime = null;
        if(character.can_redeem_retention_bonus_start_time !== null)
        {
          startTime = new Date(character.can_redeem_retention_bonus_start_time);
        }
        var endTime = null;
        if(character.can_redeem_retention_bonus_at !== null)
        {
          endTime = new Date(character.can_redeem_retention_bonus_at);
        }
      _egg = AWE.GS.RetentionBonus.create({
        startTime: startTime,
        endTime: endTime,
        bonus: bonus
      });
      _egg.initAtTargetView(targetView);
    }

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    var _loopCounter = 0;

    that.runloop = function() {
      _pteros.forEach(function(ptero){
        ptero.runloop();
      })
      if(_egg !== null)
      {
        _egg.runloop();
      }
    };

    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));