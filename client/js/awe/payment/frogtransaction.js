/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.Shop = AWE.Shop || {};

AWE.Shop.FrogTransaction = (function(module) {
          
  module.createFrogTransaction = function(offer_id, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
  
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.offer_id = offer_id;
    
    // public attributes and methods ///////////////////////////////////////
    that = AWE.Shop.Transaction.createTransaction(my);    
    
    that.getRequestBody = function() {
      return 'shop_transaction[offer_id]=' + my.offer_id + '&shop_transaction[customer_identifier]=' + AWE.GS.CharacterManager.getCurrentCharacter().get('identifier') + '&'; 
    }
    
    that.getURL = function() { return AWE.Config.SHOP_SERVER_BASE+'transactions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    that.offer_id = function() {
      return my.offer_id;
    }
  
    return that;
    
  };  
  
  return module;
    
}(AWE.Shop || {}));



