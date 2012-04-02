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
  
  return module;
      
}(AWE.Util || {}));
