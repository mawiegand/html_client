/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.WelcomeDialog = module.InfoDialog.extend({
    templateName: 'welcome-dialog',
    
    imageSrc: function() {
      log('IMAGE SOURCE')
      return AWE.I18n.lookupTranslation('welcome.image');
      
    }.property('templateName'),
  });


  module.AnnouncementDialog = module.InfoDialog.extend({
    templateName: 'announcement-dialog',
    announcement: null,
  });  
       
      
  return module;  
    
}(AWE.UI.Ember || {}));