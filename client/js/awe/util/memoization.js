/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.memoizer = function(memo, formula) {
  var recur = function () {
    var result = memo;
    if (memo == null) {
      result = formula(recur);
      memo = result;
    }
  };
  return recur;
};

AWE.Memoization = (function(module) {
  
  return {
    createMemoizer: function(numElements) {
      
      var first = 0;
      var count = 0;
      
      var memo = Array(numElements);
      
      var that = {};
      
      var findResult = function(argument) {
        for (var i=0; i < count; i++) {
          var index = (first+i)%numElements;

          if (memo[index] != null && memo[index].argument.equals(argument)) {
            return index;
          }
        }
        return -1;
      };
      
      that.getResult = function(argument) {
        var index = findResult(argument);
        
        return (index >= 0) ?  memo[index].result : null;
      };
      
      that.storeResult = function(argument, result) {
        
        var index = findResult(argument);
        if (index >= 0) {   // already have a result for that argument, thus overwrite
          memo[index].result = result;
        }
        else {              // this is new argument, store as new entry
        
          if (count == numElements) {
            first = (first+1) % numElements;  // practically delete oldest result from memo
            count--;
          }
          memo[(first+count)%numElements] = { argument: argument, result: result };
          count++;
        }
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