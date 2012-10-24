/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** extensions of JavaScript base types. */
AWE.Util = (function(module) {

  /** returns the hash that only contains those elements of the minuend
   * that are not in the subtrahend. It's not quite the difference set
   * as those elements of the subtrahend that are not in the minuend
   * are not included in the result. Minuend and subtrahend are both 
   * expected to be hashes, the result is a new hash. 
   *
   * Example: [A, B, C, D] - [C, D, E] = [A, B] 
   */
  module.hashSubtraction = function(minuend, subtrahend) {  
    var difference = {};
    
    for (var k in minuend) {             
      if (minuend.hasOwnProperty(k) && !subtrahend[k]) {
        difference[k] = minuend[k];
      }
    }
    return difference;
  }  
  
  module.hashCount = function(hash) {
    var count = 0;
    
    for (var k in hash) {             
      if (hash.hasOwnProperty(k)) { count++; }
    }
    return count;  
  }
  
  module.hashEmpty = function(hash) {
    return module.hashCount(hash) === 0;  
  }
  
  module.hashFirst = function(_hash) {
    var value = null;
    for (var key in _hash) {
      if (_hash.hasOwnProperty(key)) {
        value = _hash[key];
        break ;
      }
    }
    return value ;
  }
  
  module.secondsToDuration = function(secs) {
    var hours = Math.floor(secs / (60 * 60));
   
    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);
 
    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.floor(divisor_for_seconds);
   
    var duration = {
        h: hours,
        m: minutes,
        s: seconds
    };
    return duration;
  }
  
  var zeroPadTime = function(timeComponent) {
    if (timeComponent == 0) {
      return "00"
    }
    return (timeComponent < 10 ? "0" : "") + timeComponent;
  }
  
  module.localizedDurationFromSeconds = function(seconds) {
    var duration = module.secondsToDuration(seconds);
    
    var string = "";
    if (duration.h > 0 || duration.m > 0) {
      string = zeroPadTime(duration.m) + ":" + zeroPadTime(duration.s);
      if (duration.h > 0) {
        string = duration.h + ":" + string;
      }
    }
    else {
      string += duration.s + "s";
    }
    return string;
  }
  
  module.createTimeString = function(isoDate) {
    var oneDay = 1000 * 3600 * 24;
    if (!isoDate) {
      return null;
    }
    var date = Date.parseISODate(isoDate);
    var now = new Date();
    if (date.getDate() === now.getDate() && 
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()) {
      return date.getHours()+":"+zeroPadTime(date.getMinutes());
    }
    else if (now.getTime() - date.getTime() < oneDay) {
      return "yesterday";
    }
    else if (now.getTime() - date.getTime() < 2*oneDay) {
      return "2 days ago";
    }
    else if (now.getTime() - date.getTime() < 3*oneDay) {
      return "3 days ago";
    }
    else {
      return date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
    }
  };
  
  module.localizedTime = function(isoDate) {
    if (!isoDate) {
      return null;
    }
    var date = Date.parseISODate(isoDate);
    return date ? date.toLocaleString() : null;  
  };
  
  module.htmlToAscii = function(html) {
    return (html || "").replace(/<br\s*[\/]?>/gi, "\n");
  };

  module.removeHtmlTags = function(html) {
    return (html || "").replace(/<[\/]?.*[\/]?>/gi, " ");
  };
  
  return module;
      
}(AWE.Util || {}));
