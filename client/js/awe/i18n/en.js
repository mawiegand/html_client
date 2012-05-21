/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};


AWE.I18n = AWE.I18n || function(module) {
  
  module.strings = {
 
    general: {
      
      startup: {
        loading: 'Loading....'
      },
      
      shoutBox: {
        heading: 'Shout Box',
      },
      
      
    },
    
    army: {
      details: {
        heading: 'Army',
      }
    },
    
    error: {
      
    },
    
    map: {
      
    },
    
    alliance: {
      founded: 'Founded',
      leader: 'Leader',
      description: 'Descritpion',
      message: 'Message of the Day',
      messageExplanation: 'This is only visible to members.',
      members: 'Members',
      shoutBox: 'Shout Box',
      shoutBoxExplanation: 'Everything entered here is instantly visible to all other members.'
    },
    
    shop: {
      title: 'Shop',
      currentCreditAmount: 'Your current credit amount',
      credits: 'Credits',
      updateCredits: 'Update',
      buyCredits: 'Buy credits',
      article: 'Offer',
      description: 'Description',
      price: 'Price',
      buy: 'Buy!'
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n || {});

