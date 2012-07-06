/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.I18n = AWE.I18n || {};

AWE.I18n.en_US =  function(module) {
    
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
    
    server: {
      error: {
        failedAction: {
          heading: "Server-Error",
          unknown: "Ugh, seems like something went wrong, so your last command wasn't accepted. Or the server doesn't like you. Whatever, please try again later or contact the support.",
        },
      },
    },
        
    battle: {
      details: {
        heading: "Battle Info",
      },        
      messages: {
        own: {
          winning: [
            "Yeah, we 'll blow 'em away!",
          ],
          losing: [
            "Help, we 're going down the drain!",
          ],
          neutral: [
            "Boring!",
          ]
        }
      }
    },    
    
    army: {
      details: {
        heading: 'Army',
      },
      messages: {
        own: [
          "I hear you.",
          "Sir, yes, Sir!",
          "Please, don't hurt me!",
          "Sorry, no service today.",
          "Can't you ask somebody else?",
          "You again?",
          "Hmpf.",
        ],
        other: [
          "Nobody stops me.",
          "Please, come closer. I've got cookies! Sweeeeet cookies!",
          "A good day to die.",
          "Ready to fight?",
          "I'm the greatest!",
          "You talkin' to me?",
          "Veni, vedi, vici!",
          "Get lost!",
        ],
      },
    },

    building: {
      level:    'Level',
      cost:     'Costs',
      duration: 'Duration',
      produces: 'Produces',
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
      management: 'Secret Alliance Password',
      message: 'Message of the Day',
      messageExplanation: 'This is only visible to members.',
      members: 'Members',
      shoutBox: 'Shout Box',
      shoutBoxExplanation: 'Everything entered here is instantly visible to all other members.'
    },
    
    welcome: {
      heading: 'Welcome to Wack-a-Doo!',
      headingPlan: 'The Plan',
      image: 'images/whatdoido_en_US.jpeg',
      headingSituation: 'The Situation',
      formattedText: '<p>Being a <b>demigod</b> to a tiny tribe of stoneage caveman you\'ve just convinced your followers to leave their cave behind and to live in something modern called "a village". Unfortunately, the only thing their glorious chieftain let them build was a pompous hut for himself. Now, you should <b>build housing for some gather-hunters</b> ASAP.</p><p>P.S.: Our newby-advisor right now is on vacation and cannot guide you through the starting process. We hope, as demigod, you\'re able to find yourself around for the meantime. ;-)</p><p><b>Have fun!</p>',
    },
    
    shop: {
      button: 'Bonanza',
      title: 'Bonanza',
      currentCreditAmount: 'Presently, you have a balance of',
      credits: 'Credits',
      for: 'for',
      updateCredits: 'Refresh',
      buyCredits: 'Refill',
      article: 'Item',
      description: 'Description',
      price: 'Credits',
      buy: 'Acitvate',
      extend: 'Extend',
      resourceOffers: "Toads Packages",
      bonusOffers: "Bonus Packages",
      production: 'Production',
      duration: 'Duration',
      expiry: 'Expiration',
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
          missingRequirements: 'Cannot be build due to the following <span class="red-color">unmet prerequisits</span>',

        },
        tooltip: {
          costOfNextLevel: 'Costs of',
          noUpgrade: 'Cannot be upgraded further.',
          empty: {
            heading: 'Empty Construction Site',
            advise:  'Click to construct a new building.'
          }
        },
        missingReqWarning: {
          start: "Hey! You cannot construct a",
          end: "now. The following prerequisit is missing",
          cancelText: ['Argh!', 'Grmpf!', 'Hgnnhgn.', 'I see.'],
        },
        constructionQueueFull: {
          start: "Sorry, but the construction queue is already filled to it's capacity of ",
          end: " jobs. Please wait, till something else is completed.",
        },
        constructionQueueNotEmpty: {
          msg: "Dude! The building cannot be demolished when there are jobs to upgrade it.",
        },
      },
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n.en_US || {});

