/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Map = AWE.Map || function() {
  
  return {
    node: function(spec) {
      var that = {};
      
      var _updated_at = spec.updated_at || null;
      var _created_at = spec.created_at || null;
      
      var _leaf = spec.leaf || null;
      var _level = spec.level || 0;
      var _parent = null;
      
      var _children = null;
      
      return that;
    },
  };
  
};