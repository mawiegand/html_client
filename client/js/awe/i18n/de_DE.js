

AWE.I18n.de_DE = function(module) {
    
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
    
    server: {
      error: {
        failedAction: {
          heading: "Server-Fehler",
          unknown: "Ups, da ist wohl etwas schief gegangen. Der Befehl wurde nicht akzeptiert.",
        },
      },
    },
        
    battle: {
      details: {
        heading: "Kampf Info",
      },        
      messages: {
        own: {
          winning: [
            "Yeah, platt machen wir sie!",
          ],
          losing: [
            "Tu was, unsere Armee geht grad den Bach runter!",
          ],
          neutral: [
            "Hau mal auf den Putz, da passiert ja gar nix!",
          ]
        },
        other: "Du willst da doch nicht etwa mitmischen, oder?"
      }
    },    
   
    army: {
      details: {
        heading: 'Army',
      },
      messages: {
        own: [
          "Ich bin ganz Ohr.",
          "Hey, ich hab Kuchen dabei.",
          "Hast Du schon gehört? Gleich da vorne soll es Gänseblümchen geben!",
          "Sir, jawohl, Sir!",
          "Bitte nicht hauen!",
          "Was gibt's denn schon wieder?",
          "Was soll ich jetzt schon wieder machen?",
          "Mein Vater hat immer gesagt: Was Du heute kannst besorgen, dass schiebe ruhig auf morgen.",
          "Kann man hier nicht mal seine Ruhe haben?",
          "Na, solange wir reden muss ich nicht kämpfen, oder?",
          "Hm, wann waren eigentlich die letzten Betriebsferien?",
          "Hast Du schon unsere neue Uniformen gesehen? Sehen schick aus!",
          "Bitte nicht dreckig machen, ich bin frisch gebadet!",
          "Heute bitte keine Kämpfe, ich hab Muskelkater.",
          "Ich hab heut keine Lust. Gar keine Lust.",
          "Hmpf.",
          "Du schon wieder?",
          "Was gibt's heute zu tun?",
          "Na los, sag schon.",
          "Mein Halbgott, hast Du niemand anderen rumzubefehlen?",
          "Heute ist ein guter Tag zum Blümchen sammeln.",
          "Wie wäre es zur Abwechselung mal mit einer Dino-Jagd?",
          "Warum muss eigentlich immer ich raus?",
          "Sag schnell, ich hab' zu tun.",
          "Die Leute haben sich übrigens über's Essen beschwert. Kannst Du uns nicht was veganes schicken?",
          "Pass auf, einen haue ich noch für Dich um, aber dann ist's wirklich gut für heute, ja?!",
          "Leise! Ich versuche hier zu schlafen.",
          "Hart wie Federkissen.",
        ],
        other: [
          "Nichts und niemand hält mich auf!",
          "Heute ist ein guter Tag zum Sterben.",
          "Kämpfchen gefällig?",
          "Von Dir lass ich mir gar nichts sagen.",
          "Was willst DU hier?",
          "Von mir erfährst Du nichts.",
          "Ich bin der Größte!",
          "Sprichst Du mit mir? Sprichst Du wirklich mit mir?",
          "Ich will Blut sehen!",
          "Veni, vedi, vici!",
          "Du hast mir nichts zu befehlen. Gar nichts!",
          "Hm. Ich glaube, ich kann Dich nicht leiden.",
          "Geh weg!",
          "Was denn?",
          "Reg mich bloß nicht auf!",
          "Nein, hier gibt's keine Gänseblümchen!",
        ],
      },
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
      founded: 'Gründung',
      leader: 'Anführer',
      description: 'Description',
      management: 'Geheime Allianzlosung',
      message: 'Message of the Day',
      messageExplanation: 'This is only visible to members.',
      members: 'Mitglieder',
      shoutBox: 'Shout Box',
      shoutBoxExplanation: 'Alles was hier eingegeben wird, ist umgehend für alle anderen Mitglieder sichtbar.'
    },
    
    shop: {
      button: 'Fundgrube',
      title: 'Fundgrube',
      currentCreditAmount: 'Du besitzt im Moment ein Guthaben von',
      credits: 'Credits',
      for: 'für',
      updateCredits: 'Aktualisieren',
      buyCredits: 'Aufladen',
      article: 'Artikel',
      description: 'Beschreibung',
      price: 'Credits',
      buy: 'Aktivieren',
      extend: 'Verlängern',
      resourceOffers: "Krötenpakete",
      bonusOffers: "Bonuspakete",
      production: 'Produktion',
      duration: 'Dauer',
      expiry: 'Ablauf',
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
          cancelText: ['Argh!', 'Grmpf!', 'Hmpf', 'Na gut.'],
        },
        constructionQueueFull: {
          start: "Sorry, aber die Bauschleife ist schon voll. Du kannst maximal ",
          end: " Bauaufträge aufreihen. Bitte warte, bis etwas anderes fertig wird.",
        },
      },
    },
    
    profile: {
      
    },
    
  }
  
  return module;
  
}(AWE.I18n.de_DE || {});

