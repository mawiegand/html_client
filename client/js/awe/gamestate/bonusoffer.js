/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.BonusOfferAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.BonusOffer = module.Entity.extend({     // extends Entity to Job
    typeName: 'BonusOffer',
    
    title: null,
    price: null,
    
    resource_id: null,
    started_at: null,
    ends_at: null,
    duration: null,
    bonus: null,
    
    isBuying: false,  // set to true while communicating with the shop on purchase
    
    resource_effect: null,
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.BonusOfferManager = (function(my) {    // TrainingJob.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    var lastUpdate = null;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdates = {};
    
    my.createEntity = function() { return module.BonusOffer.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getBonusOffer = function(id) {
      return that.getEntity(id);
    }
    
    that.getBonusOffers = function() {
      var offers = []
      that.getEntities().forEach(function(offer){
        if (offer) offers.push(offer);
      });
      return offers;
    }
    
    that.lastUpdate = function() {
      if (lastUpdate) {
        return lastUpdate;
      }
      else {
        return new Date(1970);
      }
    }
        
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateBonusOffer = function(id, updateType, callback) {
      var url = AWE.Config.SHOP_SERVER_BASE + 'bonus_offer/' + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all jobs for the current queue. Calls the callback with a
     * list of all the updated jobs. */
    that.updateBonusOffers = function(updateType, callback) {
      var url = AWE.Config.SHOP_SERVER_BASE + 'bonus_offers';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdates,                     // queue to register this request during execution
        0,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdate(),                              // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastUpdate = timestamp.add(-1).second();
          }
          // delete old jobs from queue
          // if (status === AWE.Net.OK) {
            // var jobs = module.TrainingJobAccess.getHashableCollectionForQueue_id(queueId);
            // AWE.Ext.applyFunction(jobs.get('collection'), function(job){
              // var jobId = job.getId();
              // if (!result.hasOwnProperty(jobId)) {
                // job.destroy();
              // }
            // });
          // }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getBonusOffers();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
  
    return that;
      
  }());
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ACTIVE JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.ActiveRecourceEffect = module.Entity.extend({
    typeName: 'ActiveRecourceEffect',
    
    // add attributes
  });    

  return module;
  
}(AWE.GS || {}));