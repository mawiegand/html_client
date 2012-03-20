/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Partials = (function(module) {
  
  module.addUpdateTracking = function(obj) {
    var isUpdating = false;
    
    if (!obj.isUpdating) {
      obj.isUpdating = function() { return isUpdating; }
    }
    if (!obj.startUpdate) {
      obj.startUpdate = function() { isUpdating = true; }
    }
    if (!obj.endUpdate) {
      obj.endUpdate = function() { isUpdating = false; }
    }
  };
  
  module.addChangeTracking = function(obj) {
    var _lastChange = new Date();
    
    obj.lastChange = function() {
      return _lastChange;
    };
    
    obj.hasChangedSince = function(date) {
      return obj.lastChange() > date;
    };
    
    obj.setChangedNow = function() {
      _lastChange = new Date();
    };
  };
  
  return module;
}(AWE.Partials || {}));