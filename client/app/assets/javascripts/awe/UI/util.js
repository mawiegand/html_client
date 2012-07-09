/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

/** extensions of JavaScript base types. */
AWE.UI.Util = (function(module) {
  
  window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1000 / 60);
    };
  })();
  
  module.secondsToString = function(time) {
    
    if (time < 0)
      return;
    
    var sec = time % 60;
    if (sec < 10) {
      sec = '0' + sec;
    }
    
    var min = time / 60 % 60;
    if (min < 10) {
      min = '0' + min;
    }
    
    var hour = time / 3600 % 60;
    
    return hour + ':' + min + ':' + sec;
  }
  
  module.round = function(val) {
    
    var rounded = Math.floor(val * 10) / 10.;
    if (rounded.toString().indexOf('.') < 0) {
      rounded += '.0';
    }
    return rounded;
  }
  
  return module;
  
}(AWE.UI.Util || {}));
  


