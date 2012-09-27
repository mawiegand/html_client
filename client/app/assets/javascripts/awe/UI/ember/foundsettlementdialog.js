/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.FoundSettlementDialog = module.Dialog.extend({
    templateName: 'found-settlement-dialog',
    
    army: null,
    canFound: false,
    
    init: function() {
      var army = this.get('army');
      if (army) {
        this.set('canFound', army.canFoundSettlementAtPresentLocationNow());
      }
      this._super();
    },
    
    foundPressed: function() {
    },
    
  });

  return module;
    
}(AWE.UI.Ember || {}));




