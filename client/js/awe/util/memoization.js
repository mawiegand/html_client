/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Memoization = (function(module) {
  
  return {
    createMemoizer: function(numElements) {
      
      var first = 0;
      var count = 0;
      
      var memo = Array(numElements);
      
      var that = {};
      
      that.getResult = function(argument) {
        for (var i=0; i < count; i++) {
          var index = (first+i)%numElements;

          if (memo[index] != null && memo[index].argument.equals(argument)) {
            return memo[index].result;
          }
        }
        return null;
      };
      
      that.storeResult = function(argument, result) {
        if (count == numElements) {
          first = (first+1) % numElements;  // practically delete oldest result from memo
          count--;
        }
        memo[(first+count)%numElements] = { argument: argument, result: result };
        count++;
      };
      
      that.clear = function() {
        for (var i=0; i < numElements; i++) {
          memo[i] = null;
        }
        first = count = 0;
      };
      
      that.length = function() {
        return count;
      }
      
      that.capacity = function() {
        return numElements;
      }
      
      return that;
    },
    
  };
  
}(AWE.Memoization || {}));