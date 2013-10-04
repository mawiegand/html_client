/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>,
 *         Christian Wansart <christian@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.FbCreditOfferAccess = {};
    
  module.FbCreditOffer = module.Entity.extend({
    typeName: 'BonusOffer',
    
    title: null,
    price: null,
    
    resource_id: null,
    started_at: null,
    ends_at: null,
    duration: null,
    bonus: null,
    currency: 0,

    frogCurrency: function() {
      return this.get('currency') == AWE.GS.CURRENCY_GOLDEN_FROGS;
    }.property('currency').cacheable(),
    
    isBuying: false,  // set to true while communicating with the shop on purchase
    
    resource_effect: null,
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   FACEBOOK CREDIT OFFER MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.FbCreditOfferManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    var lastUpdate = null;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdates = {};
    
    my.createEntity = function() { return module.FbCreditOffer.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getFbCreditOffer = function(id) {
      return that.getEntity(id);
    }
    
    that.getFbCreditOffers = function() {
      var offers = []
      AWE.Ext.applyFunctionToElements(that.getEntities(), function(offer){
        if (offer) offers.push(offer);
      });

      return offers.sort(function(a, b) {
        if (a.get('resource_id') == b.get('resource_id')) {
          return a.get('bonus') - b.get('bonus');
        }
        else {
          return a.get('resource_id') - b.get('resource_id');
        }
      });
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
      var url = AWE.Config.SHOP_SERVER_BASE + 'fb_credit_offer/' + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all jobs for the current queue. Calls the callback with a
     * list of all the updated jobs. */
    that.updateBonusOffers = function(updateType, callback) {
      var url = AWE.Config.SHOP_SERVER_BASE + 'fb_credit_offers';
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
