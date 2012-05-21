/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/shopview.html');
  
  module.ShopView = module.Dialog.extend({
    offers: [],
    creditAmountBinding: 'AWE.Shop.Manager.content.creditAmount',
    templateName: 'shop',
    init: function() {
      this._super();      
    },
    buyCreditsPressed: function() { alert ('Action not connected: buyCreditsWasPressed.'); },
    buyOfferPressed: function() { alert ('Action not connected: buyOfferWasPressed.'); },
    closePressed: function() { alert ('Action not connected: closedWasPressed.'); },
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




