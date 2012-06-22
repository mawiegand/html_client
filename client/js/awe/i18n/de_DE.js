/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.I18n = AWE.I18n || {};


AWE.I18n.de_DE = AWE.I18n.de_DE || function(module) {
    
  module.localizedStrings = {
 
    general: {
      open:     'öffnen',
      close:    'schließen',
      cancel:   'abbrechen',
      ok:       'Ok!',
      finished: 'fertig',
      info:     'Info',
      error:    'Fehler',
      warning:  'Warnung',
      
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
    
    building: {
      level:    'Stufe',
      cost:     'Kosten',
      duration: 'Dauer'
    },
    
    error: {
      stringMissing: '(Fehler: Fehlender Text!)',
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
          enables: 'Ermöglicht',
          speedup: 'Beschleunigt',
        },
        
        select: {
          heading: 'Gebäude auswählen'
        },
      },
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n.de_DE || {});

