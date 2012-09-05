/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.TradingCartActionAccess =      {};


  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRADING CART ACTION
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TradingCartAction = module.Entity.extend({    
    typeName: 'TradingCartAction',

    sender_id: null, old_sender_id: null,
    senderIdObserver: AWE.Partials.attributeHashObserver(module.TradingCartActionAccess, 'sender_id', 'old_sender_id').observes('sender_id'),   

    recipient_id: null, old_recipient_id: null,
    recipientIdObserver: AWE.Partials.attributeHashObserver(module.TradingCartActionAccess, 'recipient_id', 'old_recipient_id').observes('recipient_id'),   

    starting_settlement_id: null, old_starting_settlement_id: null,
    startingSettlementIdObserver: AWE.Partials.attributeHashObserver(module.TradingCartActionAccess, 'starting_settlement_id', 'old_starting_settlement_id').observes('starting_settlement_id'),   

    target_settlement_id: null, old_target_settlement_id: null,
    targetSettlementIdObserver: AWE.Partials.attributeHashObserver(module.TradingCartActionAccess, 'target_settlement_id', 'old_target_settlement_id').observes('target_settlement_id'),   
    
    nextArrivalTime: function() {
      return (this.get('returning') ? this.get('returned_at') : this.get('target_reached_at')) || null;
    }.property('returning', 'target_reached_at', 'returned_at').cacheable(),
    
    sortTradingCartActions: function(actions) {
      return actions ? actions.slice(0).sort(function(a,b) { // why copy (slice)? because the original message array at the collection will be changed outside this method
        return Date.parseISODate(b.get('nextArrivalTime')).getTime() - Date.parseISODate(a.get('nextArrivalTime')).getTime();
      }) : null; 
    }
  });     

 
  
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TRADING CART ACTION MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  /** basic manager for fetching trading cart actions. */
  module.createMessageBoxManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
              
    my.runningUpdatesPerSettlementIncoming = {};///< hash that contains all running requests for incoming to a settlement.
    my.runningUpdatesPerSettlementOutgoing = {};///< hash that contains all running requests for outgoing of a settlement.


    my.collectionURL     = AWE.Config.TRADING_SERVER_BASE     + 'trading_carts_actions/';
    my.settlementURL     = AWE.Config.SETTLEMENT_SERVER_BASE  + 'settlements/';
    my.incomingURLFragment = '/incoming_trading_carts';
    my.outgoingURLFragment = '/outgoing_trading_carts';

    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getTradingCartAction = function(id) {
      return that.getEntity(id);
    }
    
    that.lastUpdateForSettlementIncoming = function(settlementId, updateType) {
      return module.InboxAccess.lastUpdateForTarget_settlement_id(settlementId, updateType);    // modified after
    };
  
    that.setLastUpdateForSettlementIncoming = function(settlementId, timestamp) {
      module.InboxAccess.accessHashForTarget_settlement_id().setLastUpdateAtForValue(settlementId, timestamp);
    };
      
    that.lastUpdateForSettlementOutgoing = function(settlementId, updateType) {
      return module.InboxAccess.lastUpdateForStarting_settlement_id(settlementId, updateType);  // modified after
    };
  
    that.setLastUpdateForSettlementOutgoing = function(settlementId, timestamp) {
      module.InboxAccess.accessHashForStarting_settlement_id().setLastUpdateAtForValue(settlementId, timestamp);
    };      
                
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateTradingCartAction = function(id, updateType, callback) {
      var url = my.collectionURL + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.updateIncomingTradingCartsAtSettlement = function(settlementId, updateType, callback) {
      var url = my.settlementURL + settlementId + my.incomingURLFragment;

      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerSettlementIncoming,            // queue to register this request during execution
        settlementId,                                      // id to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForSettlementIncoming(settlementId, updateType),// modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            that.setLastUpdateForSettlementIncoming(settlementId, timestamp.add(-1).second());
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
  
    that.updateOutgoingTradingCartsAtSettlement = function(settlementId, updateType, callback) {
      var url = my.settlementURL + settlementId + my.outgoingURLFragment;

      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerSettlementOutgoing,            // queue to register this request during execution
        settlementId,                                      // id to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForSettlementOutgoing(settlementId, updateType),// modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            that.setLastUpdateForSettlementOutgoing(settlementId, timestamp.add(-1).second());
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }  
  
    return that;
      
  }());

  
  return module;
  
}(AWE.GS || {}));