/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.I18n = AWE.I18n || {};

AWE.I18n.en_US = AWE.I18n.en_US || function(module) {
    
  module.localizedStrings = {
 
    general: {
      open:     'open',
      close:    'close',
      cancel:   'cancel',
      ok:       'ok',
      finished: 'finished',
      info:     'information',
      error:    'error',
      warning:  'warning',
      
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
      stringMissing: '(error: text missing!)',
    },
    
    map: {
      
    },
    
    alliance: {
      founded: 'Founded',
      leader: 'Leader',
      description: 'Description',
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
    
    settlement: {
      buildings: {
        details: {
          enables: 'Enables',
          speedup: 'Speed bonus to',
          noUpgrade: 'Cannot be upgraded further.',
        },
        select: {
          heading: 'Select Building',
        },
        tooltip: {
          costOfNextLevel: 'Costs of',
          noUpgrade: 'Cannot be upgraded further.',
          empty: {
            heading: 'Empty Construction Site',
            advise:  'Click to construct a new building.'
          }
        },
      },
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n.en_US || {});

