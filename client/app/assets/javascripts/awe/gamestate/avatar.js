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

    init: function() {
      this.set('avatar_string', 'm010300500');
    }

    /* avatar_string structure
        0   => gender (m/f)
        1   => chain
        2   => eyes
        3-4 => hair
        5   => mouth
        6   => head
        7-8 => beard
        9   => veilchen
        10  => tattoo            */
    gender: function() {
      return avatar_string[0];
    },

    chain: function() {
      return avatar_string[1];
    },

    eyes: function() {
      return avatar_string[2]
    },

    hair: function() {
      return avatar_string[3] + avatar_string[4];
    },

    mouth: function() {
      return avatar_string[5];
    },

    head: function() {
      return avatar_string[6];
    },

    beard: function() {
      return avatar_string[7] + avatar_string[8];
    },

    veilchen: function() {
      return avatar_string[9];
    },

    tattoo: function() {
      return avatar_string[10];
    },

  });

  return module;

}(AWE.GS || {});




