/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
    
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/constructionqueueviews.html');
  
  module.ConstructionQueueView = Ember.View.extend({
    templateName: 'construction-queue-view',
    queues: null,
  });

  module.ConstructionJobView = Ember.View.extend({
    classNameBindings: ['active'],
    
    job: null,
    
    cancelJobPressed: function(event) {
      this.get('controller').constructionCancelClicked(this.get('job'));
    },
    
    finishJobPressed: function(event) {
      this.get('controller').constructionFinishClicked(this.get('job'));
    },
    
    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),    
  });

  return module;
    
}(AWE.UI.Ember || {}));




