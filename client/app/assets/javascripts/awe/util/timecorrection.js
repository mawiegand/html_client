/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Util = AWE.Util || {}

/** extensions of JavaScript base types. */
AWE.Util.TimeCorrection = (function(module) {

  module.createManager = function(my) {

    // private attributes and methods ////////////////////////////////////////
    
    var that;

  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {}; 
    
    my.remoteLag = null;
    my.alpha     = 0.92;
    
    
    that = {};  
    
    that.estimatedLag = function() {
      return Math.abs(my.remoteLag || 0.0) > 1.0 ? (my.remoteLag || 0.0) : 0.0;
    };
    
    that.estimatedServerTime = function() {
      var time = new Date().addMilliseconds(-this.estimatedLag());
      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        log('TIME_CORRECTION ESTIMATED SERVER TIME', time, 'now', new Date(), 'elag', this.estimatedLag());
      }      
      return time;
    };
    
    that.localToServerTime = function(localDate) {
      var serverTime = localDate.clone().addMilliseconds(-this.estimateLag());
      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        log('TIME_CORRECTION LOCAL TIME', localDate, 'TO SERVER TIME', serverTime, 'elag', this.estimatedLag());
      }
      return serverTime;
    }
    
    that.serverToLocalTime = function(serverDate) {
      var localTime = serverDate.clone().addMilliseconds(this.estimateLag());
      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        log('TIME_CORRECTION SERVER TIME', serverDate, 'TO LOCAL TIME', localTime, 'elag', this.estimatedLag());
      }
      return localTime;
    }    
    
    /** requestEndTime argument is optional. 
     * remoteTime has SECONDS precision (last 3 places always 000).
     * local times are measured in MS precision (might even have fractions). 
     * THUS: A SINGLE MEASUREMENT MAY BE OFF BY UP TO 1second (usually averages out).
     */
    that.registerMeasurement = function(remoteTime, localTime, requestEndTime) {
      requestEndTime = requestEndTime || localTime;

      // TODO: if duration was > 1s and we already have a estimate of the lag, just ignore this measurement as it will be to imprecise

      var duration   = requestEndTime.getTime()-localTime.getTime();
      var normalized = localTime.getTime()+duration/2.0;
      var difference = normalized-remoteTime.getTime();
      var newLag     = my.remoteLag ? (difference * (1.0-my.alpha) + my.remoteLag * my.alpha) : difference;

      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_DEBUG) {
        log('TIME_CORRECTION MEASUREMENT', remoteTime, localTime, requestEndTime);
        log('TIME_CORRECTION MEASUREMENT-GT', remoteTime.getTime(), localTime.getTime(), requestEndTime.getTime());
        log('TIME_CORRECTION NEW_LAG', newLag, 'duration', duration, 'normalized', normalized, 'difference', difference, 'lag before', my.remoteLag);
      }
      if (AWE.Config.TIME_DEBUG_LEVEL >= AWE.Config.DEBUG_LEVEL_INFO) {      
        log('LAG: '+(newLag < 0.0 ? "-" : ""),
                    'HOURS:',   Math.floor(Math.abs(newLag / (1000*60*60))),   
                    'MINUTES:', Math.floor(Math.abs(newLag / (1000*60)))%60,   
                    'SECONDS:', Math.floor(Math.abs(newLag / 1000))%60,   
                    'MS:', newLag % 1000);
      }
      my.remoteLag   = newLag;
    }
    
    return that; 
  };


  return module;
      
}(AWE.Util.TimeCorrection || {}));
