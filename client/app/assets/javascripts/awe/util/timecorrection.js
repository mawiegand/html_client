/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** extensions of JavaScript base types. */
AWE.Util.TimeCorrection = (function(module) {

  module.createManager = function(my) {

    // private attributes and methods ////////////////////////////////////////
    
    var that;

  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {}; 
    
    my.remoteLag = 0.0;
    my.alpha     = 0.98;
    
    
    that = {};  
    
    /** requestEndTime argument is optional. */
    that.registerMeasurement = function(remoteTime, localTime, requestEndTime) {
      requestEndTime = requestEndTime || localTime;

      var duration   = requestEndTime.getTime()-localTime.getTime();
      var normalized = localTime.getTime()+duration/2.0;
      var difference = normalized-remoteTime.getTime();
      var newLag     = difference * (1.0-my.alpha) + my.remoteLag * my.alpha;

      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        console.log('TIME_CORRECTION MEASUREMENT', remoteTime, localTime, requestEndTime);
        console.log('TIME_CORRECTION MEASUREMENT-GT', remoteTime.getTime(), localTime.getTime(), requestEndTime.getTime());
        console.log('TIME_CORRECTION NEW_LAG', newLag, 'duration', duration, 'normalized', normalized, 'difference', difference, 'lag before', my.remoteLag);
      }
      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_INFO) {      
        console.log('LAG', 
                    'HOURS:', Math.floor((newLag / (1000*60*60))),   
                    'MINUTES:', Math.floor((newLag / (1000*60)))%60,   
                    'SECONDS:', Math.floor((newLag / 1000))%60,   
                    'MS:', newLag % 1000);
      }
      my.remoteLag   = newLag;
    }
    
    return that; 
  };


  return module;
      
}(AWE.Util.TimeCorrection || {}));
