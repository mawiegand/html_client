/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** extensions of JavaScript base types. */
AWE.Extensions = (function(module) {
  
  /** returns the next absolutely larger integer; that is returns
   * the floor for negative numbers and the ceil for positive numbers. This method
   * is used to enlarge an area with positive or negative coordinates to full integers
   * in such a way that it encloses the original area. */
  Number.prototype.extendInteger = function() {
    return Math[(this > 0 ? 'ceil' : 'floor')](this);
  };
  
  return module;
  
}(AWE.Extensions || {}));
  