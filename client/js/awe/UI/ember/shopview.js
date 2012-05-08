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
    templateName: 'shop',
    init: function() {
      this._super();      
    },
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




