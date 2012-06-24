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
      
      perHour:  'pro Stunde',
      perHourSym: '/h',
      
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
      duration: 'Dauer',
      produces: 'Produziert',
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
          noUpgrade: 'Kein weiterer Ausbau möglich.',
        },
        
        select: {
          heading: 'Gebäude auswählen',
          missingRequirements: 'Kann wegen folgender <span class="red-color">fehlender Voraussetzungen</span> derzeit nicht gebaut werden',
        },
        
        tooltip: {
          costOfNextLevel: 'Kosten für',
          noUpgrade: 'Kein weiterer Ausbau möglich.',
          empty: {
            heading: 'Freier Bauplatz',
            advise:  'Klicken, um ein neues Gebäude zu bauen.'
          }
        },
        
        missingReqWarning: {
          start: "Hey! Du kannst hier jetzt kein Gebäude vom Typ",
          end: "bauen. Die folgenden Vorrausetzungen sind nicht erfüllt",
        }
      },
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n.de_DE || {});

