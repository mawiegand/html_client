/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.BattleDialog = module.Dialog.extend({
    templateName: 'battle-dialog',
    
    init: function() {
      this._super();      
    },

    battle: null,
    participantsOwnFaction: 'battle.participantsOwnFaction',
    participantsOtherFaction: 'battle.participantsOtherFaction',
    
    ratioLengthOwn: function(){
      return 'width: ' + Math.round(780 * this.getPath('battle.ratio')) + 'px;';
    }.property('battle.ratio').cacheable(),

    ratioLengthOther: function(){
      return 'width: ' + Math.round(780 * (1 - this.getPath('battle.ratio'))) + 'px;';
    }.property('battle.ratio').cacheable(),

    message: function() {
      var own = this.getPath('battle.ownBattle');
      if (own === undefined || own === null) {
        return null; // return nothing, if value hasn't been computed so far.
      }
      if (own) {
        if (this.getPath('battle.ratio') > 0.7) {
          return AWE.I18n.lookupTranslation('battle.messages.own.winning');
        }
        else if (this.getPath('battle.ratio') < 0.3) {
          return AWE.I18n.lookupTranslation('battle.messages.own.losing');
        }
        else {
          return AWE.I18n.lookupTranslation('battle.messages.own.neutral');
        }
      }
      else {
        return AWE.I18n.lookupTranslation('battle.messages.other');
      }
    }.property('battle').cacheable(),
  });
  
  module.BattleParticipantView = module.Dialog.extend({
    templateName: 'battle-participant-view',
    
    init: function() {
      this._super();      
    },

    participant: null,
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




