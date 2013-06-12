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
        gender:   1,
        chain:    1,
        eyes:     2,
        hair:     2,
        mouth:    2,
        head:     1,
        beard:    2,
        veilchen: 1,
        tattoo:   2,
      },
      offset: {
        gender:     0,
        chain:      1,
        eyes:       2,
        hair:       4,
        mouth:      6,
        head:       8,
        beard:      9,
        veilchen:  11,
        tattoo:    12,
      },
    },

    init: function() {
      this.set('avatar_string', 'm010300500');
    },

    getPart: function(part) {
      var rules  = this.get('avatar_rules');
      var result = "";
      var cursor = rules.offset[part];
      var a_str  = this.get('avatar_string');
      var chars  = rules.chars[part];

      for(var i = 0; i < chars; ++i) {
        result += a_str[cursor++];
      }
      return result;
    },

  });

  return module;

}(AWE.GS || {});




