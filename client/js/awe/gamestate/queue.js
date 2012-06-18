/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** Abstract GameState Queue class. */
AWE.GS = (function(module) {
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   QUEUE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Queue = module.Entity.extend({     // extends Entity to Queue
    typeName: 'Queue',
    name: null, 
    
    settlement_id: null, old_settlement_id: null, ///< id of the settlement the queue is a member of
    
    type_id: null,
    speed: null,
    max_length: null,
    threads: null,
    jobs_count: null,
    
    speedup_alliance: null,
    speedup_buildings: null,
    speedup_effects: null,
    speedup_sciences: null,
    
    active_jobs: null,
    hashableJobs: null,


    activeJob: function(jobId) {
      return this.get('active_jobs').objectAt(jobId);
    },

    /** returns the queue type from the rules, that describes this
     * queue. */
    queueType: function() {
			var typeId = this.get('type_id');
			if (typeId === undefined || typeId === null) { // must check, because typeId may be zero
				return null;
			}
			console.log('TYPE_ID', this.get('type_id'), typeId, AWE.GS.RulesManager.getRules().getQueueType(typeId));
			return AWE.GS.RulesManager.getRules().getQueueType(typeId);
    }.property('type_id').cacheable(),
        
    empty: function() {
      return this.get('jobs_count') == 0;
    }.property('jobs_count').cacheable(),
    
    name: function() {
      var names = this.getPath('queueType.name');
      return names ? names.en_US : null;
    }.property('queueType').cacheable(),
  });     
      
  return module;
  
}(AWE.GS || {}));