/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.SpecialOfferAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.SpecialOffer = module.Entity.extend({     // extends Entity to Job
    typeName: 'SpecialOffer',
    
    title: null,
    price: null,
    
    started_at: null,
    ends_at: null,

    isBuying: false,  // set to true while communicating with the shop on purchase
  });
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRAINING JOB MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SpecialOfferManager = (function(my) {    // TrainingJob.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    var lastUpdate = null;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdates = {};
    
    my.createEntity = function() { return module.SpecialOffer.create(); };

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getSpecialOffer = function(id) {
      return that.getEntity(id);
    }
    
    that.getSpecialOffers = function() {
      var offers = [];
      AWE.Ext.applyFunctionToElements(that.getEntities(), function(offer){
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

    that.updateSpecialOffer = function(id, updateType, callback) {
      var url = AWE.Config.SHOP_SERVER_BASE + 'special_offer/' + id;
      return my.updateEntity(url, id, updateType, callback);
    };
        
    /** updates all jobs for the current queue. Calls the callback with a
     * list of all the updated jobs. */
    that.updateSpecialOffers = function(updateType, callback) {
      var url = AWE.Config.SHOP_SERVER_BASE + 'special_offers';
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
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getSpecialOffers();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    };
  
    return that;
      
  }());

  return module;
  
}(AWE.GS || {}));