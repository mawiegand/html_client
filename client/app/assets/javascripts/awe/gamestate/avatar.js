/* Author: Christian Wansart <christian@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = function (module) {

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Avatar
  //
  // ///////////////////////////////////////////////////////////////////////

  module.Avatar = module.Entity.extend({
    typeName: 'Avatar',
    avatar_string: null,

    /* TODO: read from AWE Rules */
    avatar_rules: {
      chars: {
        gender:    1,
        chains:    1,
        eyes:      2,
        hairs:     2,
        mouths:    2,
        heads:     1,
        beards:    2,
        veilchens: 1,
        tattoos:   2,
      },
      offset: {
        gender:      0,
        chains:      1,
        eyes:        2,
        hairs:       4,
        mouths:      6,
        heads:       8,
        beards:      9,
        veilchens:  11,
        tattoos:    12,
      },
    },

    /*init: function() {
      //this.set('avatar_string', 'm0010102102102');
      this.set('avatar_string', 'f1010101100002');
    },*/

    getPart: function(part) {
      
      var rules  = this.get('avatar_rules');
      
      if (!rules || !rules.offset || rules.offset[part] == undefined) {
        return ""
      }
      
      var result = "";
      var cursor = rules.offset[part] || 0;
      var a_str  = this.get('avatar_string');
      
      if (!a_str) {
        return "";
      }
      
      var chars  = rules.chars[part];

      for(var i = 0; i < chars; ++i) {
        result += a_str[cursor++];
      }

      if(!isNaN(result)) result = parseInt(result);
      return result; 
    },

  });

  return module;

}(AWE.GS || {});




