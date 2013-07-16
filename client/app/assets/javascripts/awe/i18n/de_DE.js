var AWE = AWE || {};
AWE.I18n = AWE.I18n || {};

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
      warning:  'Achtung',
      and:      'und',
      or:       'oder',
      yes:      'ja',
      no:       'nein',
      nr:       'Nr.',
      of:       'von',
      with:     'mit',
      change:   'ändern',
      start:    'Start',
      loading:  'Laden...',

      processing: 'Verarbeiten...',
      unknown:  'Unbekannt',
      naivePlural: 'n',
      
      perHour:  'pro Stunde',
      perHourSym: '/h',
      days: 'Tage',
      oclock: "Uhr",

      demigod: 'Halbgott',
      demigoddess: "Halbgöttin",

      neanderthal: "Neandertaler",

      playerName: "Spielername",
      name: "Name",
      password: "Passwort",
      passwordConfirmation: "Passwortbestätigung",

      startup: {
        loading: 'Lade....',
      },
      
      shoutBox: {
        heading: 'Shout Box',
        ago:     'alt',
      },
      announcement: {
        play: "Spielen",
        archive: "Archiv",
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
      attack: {
        heading: "Kampfvorschau",
        citation: "Willst Du da etwa wirklich in den Kampf ziehen?",
        description: "Dein Angriff würde einen Kampf zwischen folgenden Spielern erzeugen:",
        attack: "Attacke",
        cancel: "Abbrechen",
        faction1: "Fraktion 1",
        faction2: "Fraktion 2",
      },

      details: {
        heading: "Kampf Informationen",
        afterRound: "Nach Runde",
        lastRound: "Letzte Runde",
        nextRound: "Nächste Runde",
        firstRound: "Erste Runde",
        preparingRound: "Vorbereitung auf Runde",
        myFaction: "Meine Fraktion",
        oneFaction: "Eine Fraktion",
        otherFaction: "Andere Fraktion",
        lostUnits: "Verlorene Einheiten",

        participants: {
          name: "Name",
          owner: "Besitzer",
          strength: "Stärke",
          retreat: "Rückzug",
          armyDisbanded: "Aufgelöste Armee",
          armyDisbandedDescription: "das passiert, wenn die Heimatsiedlung einer Armee verloren geht",
        },
      },        
      messages: {
        own: {
          winning: [
            "Yeah, platt machen wir sie!"
          ],
          losing: [
            "Tu was, unsere Armee geht grad den Bach runter!"
          ],
          neutral: [
            "Hau mal auf den Putz, da passiert ja gar nix!"
          ]
        },
        other: "Du willst da doch nicht etwa mitmischen, oder?",
      },
    },    
   
    army: {
      newArmy: "Neue Armee",

      details: {
        heading: "Armee",
        units: "Einheiten",
        npcMsg: "Diese Armee von völlig Wilden ist ohne Führung und gibt daher für Deine Armeen ein sehr gutes Ziel ab, die Erfahrung zu erhöhen und die Kampfkraft zu verbessern.",
        properties: "Eigenschaften",
        strength: {
          strengths: 'Stärken',
          melee: "Stärke Nahkämpfer",
          riders: "Stärke Berittene",
          distance: "Stärke Fernkämpfer",
          all: "Gesamtstärke",
        },
        melee: 'Nahkämpfer',
        riders: 'Berittene',
        ranged: 'Fernkämpfer',
        unitCount: 'Einheitenanzahl',
        size: "Größe",
        sizeAll: "Gesamtgröße",
        sizeMax: "Maximalgröße",
        velocity: "Geschwindigkeit",
        changeName: "Namen ändern",
        rank: "Armeerang",
        rankUpAt: "Rangaufstieg bei",
        rankDescription: "Ein höherer Rang verbessert die Effektivität Deiner Truppen. Die Armee muss Erfahrung sammeln um einen höheren Rang zu erreichen.",
        experience: "Erfahrung",
        experienceDescription: "Erfahrung wird gewonnen, wenn eigene Truppen sterben. Es gibt keine Erfahrung für getötete Gegner. Der Grund: Man lernt nur aus seinen eigenen Fehlern.",
        stance: "Festung oder Siedlung bei Angriff mitverteidigen",
        demigod: "Gehört",
        ownerLabel: "Gehört",
        actionPoints: "Aktionspunkte",
        nextActionPointAt: "Nächster Aktionspunkt um",
        homeSettlement: "Heimatsiedlung",
      },
      messages: {
        own: {
          warrior: [
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
            "Hart wie Federkissen."
          ],

          girl: [
            "Wir sollten immer auf der Hut sein.",
            "Ich liebe es, hier draußen rumzustreifen.",
            "Ist das nicht ein wundervoller Tag?"
          ],

          chef: [
            "Hm, vielleicht sollten wir unseren Nachbarn angreifen?",
            "Ich überlege gerade, wie wir unser Gebiet vergrößern können.",
            "Achso, angreifen bitte immer nur dann, wenn der Gegner hoffnungslos unterlegen ist.",
            "Besorg mir mal was zu essen. Aber was leckeres!",
            "Heute unseren Nachbarn, morgen die ganze Welt!",
            "Unter meiner Führung werden wir keinen einzigen Kampf verlieren. Du wirst schon sehen!",
            "Angriff ist die beste Verteidigung."
          ]
        },


        other: {
          warrior: [
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
            "Nein, hier gibt's keine Gänseblümchen!"
          ],
          girl: [
            "Freund oder Feind?",
            "Hui, wer bist Du denn?",
            "Pass auf was Du tust, ich verstehe heute gar keinen Spaß."
          ],
          chef: [
            "Muhahaha!",
            "Pass auf, in Kürze gehört Dein Land uns!"
          ]
        },
      },
      form: {
        available: "Verfügbare Einheiten",
        new: "Neue Armee",
        name: "Name der Armee",
        advisorHint: 'Wie viele Einheiten sollen denn in die Armee? Schreibe zum Beispiel "5" unter "neue Armee" und drücke anschließend auf "erzeugen".',
        all: "Alle",
        reset: "Zurücksetzen",
        change: "Ändern",
        create: "Erzeugen",
        changeNameHeading: "Gib den neuen Namen für diese Armee ein.",
        errors: {
          garrison: "Die Garnisonsarmee ist zu voll",
          garrisonFighting: "Während die Garnison kämpft, kann keine neue Armee erstellt werden.",
          other: "Die Armee ist zu voll",
          new: "Die neue Armee ist zu voll",
          message: "Reduziere sie um so viel Einheiten, dass sie unter der Höchstgrenze liegt!",
        },
      },
      create: {
        header: "Neue Armee erzeugen",
        remainingArmies: "Anzahl der verbleibenden Kommandopunkte für diese Siedlung",
        error: "Keine Kommandopunkte verfügbar in dieser Siedlung",
        loadingMessage: "Erzeuge Armee...",
      },
      change: {
        header: "Einheiten der Armee ändern", 
        loadingMessage: "Ändere Armee...",
      },
    },
    
    building: {
      level:          'Stufe',
      cost:           'Kosten',
      duration:       'Dauer',
      produces:       'Produziert',
      capacity:       'Lagerkapazität',
      productionBoni: 'Produktionsbonus',
      tradingCarts:   'Handelskarren',
      commandPoints:  'Kommandopunkte',
      garrison: "Garnison",
      populationAbbreviation: "Bev",
      buildingTime: "Bauzeit",
      storageCapacity: "Lagerkapazität",
      production: "Produktion",

      upgrade: {
        conversion: "Umwandeln",
        upgrade: "Ausbauen",
        converting: "Umwandeln",
        conversionStart: " ",
        conversionEnd: " umwandeln",
        upgradeStart: " ",
        upgradeEnd: " ausbauen",
        toIn: "in",
        toAuf: "auf",
        updating: "Aktualisieren",
        demolishing: "Abreißen",
        demolishBuilding: "Gebäude abreißen",
        demolishStart: " ",
        demolishEnd: "abreißen",
        convertingMid: " wird ",
        convertingEnd: " umgewandelt",

      },
      tooltip: {
        clickToConvert: "zum Umwandeln hier klicken",
        clickToUpgrade: "zum Ausbauen hier klicken",
        clickToDemolish: "zum Abreißen hier klicken",
        currentLevel: "derzeitiges Gebäudelevel",
        levelAfterUpgrade: "Level nach Abschluss aller Ausbauaufträge in der Bauschleife",
        levelAfterDowngrade: "Level nach Abschluss des Abrissauftrages in der Bauschleife",
        levelAfterConversion: "Level nach Abschluss des Umwandlungsauftrages in der Bauschleife",
        notEnoughBuildingSlots: "Du kannst derzeit nicht mehr Gebäude bauen. Es wird zuvor eine höhere Stufe des Hauptgebäudes benötigt.",
      },


      info: {
        notDemolishable: "Einmal gebaut, kann dieses Gebäude nicht mehr abgerissen werden.",
        notBuyable: "Konstruktion kann nicht mit Kröten beschleunigt werden.",
        unlockJoinAlliance: "Ermöglicht Diplomatie und Allianzbeitritt.",
        unlockCreateAlliance: "Ermöglicht die Gründung einer Allianz.",
        unlockTrade: "Ermöglicht den Handel mit anderen Spielern.",
        unlockedArtifactInitiation: "Ermöglicht das Einweihen von Artefakten.",
        unlockedAssignments: "Ermöglicht das Ausführen von Aufträgen.",
      },

      requirement: {
        none: "Kein",
        single: "einziges",
        greaterThan: "größer als",
        orGreater: "oder größer",
        },
      error: {
        notEnoughBuildingSlots: "Du kannst derzeit nicht mehr Gebäude bauen. Es wird zuvor eine höhere Stufe der Hauptgebäudes (Häuptlingshütte in Siedlungen, Versammlungsplatz in Lagerstätten) benötigt.",
        notEnoughCash: "Du hast nicht genug Kröten, um diese Aktion auszuführen.",
      },
      
      gossip: {
        heading: "Gerüchteküche",
        advice: [
          "Gerüchte besagen, dass die schönsten Gänseblümchen mehrere hundert Meter südich des Dorfes wachsen.",
          "Der beste Weg einen Kampf zu gewinnen ist es, mit einer klaren Übermacht anzugreifen.",
          "Festungen können eingenommen werden, indem man einen Kampf um sie gewinnt",
          "Es ist nicht möglich, zwei Lagerstätten in einer Region zu gründen. Die Bevölkerung will abwechselungsreiche Ziele für den Wochenendbesuch!",
          "Ein Wirrkopf behauptet, die Erde sei rund, er hätte es selbst im Traum gesehen. Was für ein Schwachsinn, natürlich ist die Erde flach! Und hört an allen vier Seiten einfach auf!",
          "Wenn Du nach Wissen über die Funktionsweise der Welt, Gebäude und Einheiten strebst, dann sie in der Enzyklopädie nach. Zu finden ist der Knopf unten links auf der Weltkarte.",
          "Ein bärtiger Greis teilt sein Wissen über die Wettervorhersagekunst: \"Abendrot - Gutwetterbot!\" - \"Außer, natürlich, vor schlechten Tagen,\" fügst Du abgeklärt hinzu.",
          "Angeblich soll im Westen vor kurzem eine Armee spurlos verschwunden und von der Welt verschluckt worden sein. Man sollte sich besser fernhalten.",
          "In den Festungen kann ein Steuersatz von 5 bis 15% Prozent von allen Siedlungen der Region erhoben werden. Dies ist ein Naturgesetz; Steuern über oder unter diesen Grenzen würden den Zorn der Götter heraufbeschwören und den Weltuntergang auslösen.",
          "Heute keine Gerüchte - so ein Glück!",
          "In der Region in der Mitte der Karte soll es einen Topf gefüllt mit Kupfer und umgeben von tausenden Kröten geben.",
          "Ein Weib auf Durchreise behauptet, Kröten und Frösche können man auch essen. Sie hätte selbst im Westen gesehen, wie diese zubereitet und verspeist würden. Was für ein Unfug; Kröten sind DAS Zahlungsmittel und wunderbare Haustiere - aber aufessen???",
          "Ein Seher versucht Dich davon zu überzeugen, dass Menschen in ferner Zukunft in Zylindern aus Kupfer oder ähnlichem durch die Luft fliegen würden. Das kann dich nicht überzeugen; Kupfer ist viel zu schwer, die würden einfach runterfallen.",
        ],
        likeLeader: "{0} muss eine sehr nette Person sein. Schon {1} Likes. Unglaublich!",
        resourceProductionLeader: {
          male:   "{0} ist der {1}könig! Er produziert in der Stunde über {2}.",
          female: "{0} ist die {1}königin! Sie produziert in der Stunde über {2}.",
        },
        mostMessagesSent: {
          male:   "{0} scheint eine äußerst geschwätzige Person zu sein. Niemand schreibt mehr als {1} Nachrichten am Tag! Wer soll die alle lesen?",
          female: "{0} ist geradezu eine Klatschtante. Niemand sonst hat am vergangenen Tag mehr als ihre {1} Nachrichten verschickt!",
        },
        mostUnits: {
          male:   "Man geht {0} besser aus dem Weg. Er soll {1} Einheiten befehligen!",
          female: "Hüte Dich vor {0}. Sie soll {1} Einheiten in ihrer Truppe haben.",
        },
      }

    },
    
    error: {
      stringMissing: '(Fehler: Fehlender Text!)',
      genericClientHeading: "Client Fehler",
      genericClientMessage: "Es ist ein Fehler bei Deiner Aktion aufgetaucht. Bitte kontaktiere den Support, wenn dieser Fehler auch nach einem Neuladen bestehen bleibt.",
      genericServer: "Der Server hat die Aktion nicht angenommen.",
    },
    
    map: {
      regions: 'Regionen',
      
      button: {
        attack:         "Angriff",
        newArmy:        "Neue Armee",
        move:           "Bewegen",
        settle:         "Siedeln",
        retreat:        "Rückzug",
        cancel:         "Abbruch",
        battleInfo:     "Kampfinfo",
        messages:       "Mail",
        stance:         "Stance",
        reinforce:      "Verstärken",
        info:           "Info",
        enter:          "Betreten",
        quests:         "Quests",
        ranking:        "Rangliste",
        game:           "Spiel",
        world:          "Welt",
        strategic:      "Strategie",
        terrain:        "Gelände",
        encyclopedia:   "Enzyklo-\npädie",
        shop:           'Fundgrube',
      },
    },

    alliance: {
      membershipHeader: "Allianzmitgliedschaft",
      memberOf: "Du bist derzeit ein Mitglied der Allianz ",
      joinAllianceHeader: "Allianzbeitritt",
      joinAllianceButton: "Allianz beitreten",
      joinAllianceText: "Tritt einer existierenden Allianz bei, indem Du ihr Kürzel und das geheime Allianzpasswort eingibst.",
      createAlliance: "Allianz gründen",
      createAllianceText: "Gründe eine neue Allianz, mit Dir als Anführer.",
      redeemAllianceReservationHeader: "Allianzreservierung",
      redeemAllianceReservationButton: "Allianzreservierung einlösen",
      redeemAllianceReservationText: "Löse die Reservierung einer Allianz aus einer vergangenen Runde ein, indem Du ihr Kürzel und das geheime Reservierungspasswort eingibst.",
      leave: "Verlasse",

      founded: 'Gründung',
      leader: 'Anführer',
      description: 'Beschreibung',
      changeDescriptionDialogCaption: 'Gib deine neue Allianzbeschreibung ein.',
      changeDescription: 'Ändere Beschreibung',
			missingDescription: 'Hier könnte eure Allianzbeschreibung stehen.',
      management: 'Geheime Allianzlosung',
      reservation: 'Reservierung für die nächste Runde',
      reservationDescription: 'Als Allianzanführer kannst Du Deine Allianz für die nächste Runde reservieren. Um die Reservierung in der nächsten ' +
        'Runde einzulösen, benötigst Du den Allianztag und ein Passwort.',
      reservationDescriptionNew: 'Setze jetzt ein Passwort.',
      reservationDescriptionChange: 'Ändere das Passwort.',
      message: 'Nachricht des Tages',
      messageExplanation: 'Nur für Mitglieder sichtbar!',
      members: 'Mitglieder',
      shoutBox: 'Shout Box',
      shoutBoxExplanation: 'Alles was hier eingegeben wird, ist umgehend für alle anderen Mitglieder sichtbar.',
      changePassword: 'neues Passwort speichern',
      saveReservation: 'Reservierung speichern',
      kickMember: 'kick',
      
      progress: {
        header: 'Siegesfortschritt',
        description: 'Die aktuelle Spielrunde kann von einer Allianz gewonnen werden, indem eines der folgenden Siegkriterien erreicht und über einen bestimmten Zeitraum gehalten wird.',
        requiredRegions: 'Benötigte Regionen',
        requiredArtifacts: 'Verschiedene Artefakttypen',
        requiredDuration: 'Minimale Haltedauer',
        remainingDays: 'Tage noch',
        criteriaFulfilled: 'Kriterium erfüllt',
        criteriaHeld: 'Kriterium gehalten',
        victoryAt: 'Sieg am',
        victoryAfter: 'Sieg nach',
        won: "Gewonnen",
        days: 'Tagen',
      },

      error: {
        blankPassword: "Ein leeres Passwort zu setzen ist nicht möglich.",
        failedToSetPassword: "Das Allianzpasswort zu setzen ist aus unbekannten Grund gescheitert.",
        kickHeading: "Geht nicht!",
        kickMessage: "Dieses Mitglied kann nicht von Dir rausgeworfen werden.",
        leaveFailedClient: "Client Fehler: Allianz konnte nicht verlassen werden.",
        leaveFailed: "Allianz konnte nicht verlassen werden.",
        invalidTag: "Gib einen gültigen Allianzkürzel ein.",
        invalidPassword: "Gib die geheime Allianzlosung ein.",
        tagNotTaken: "Es gibt keine Allianz mit diesem Kürzel",
        wrongPassword: "Allianzkürzel und Passwort stimmen nicht überein.",
        memberLimitReached: "Die maximale Anzahl Allianzmitglieder wurde bereits erreicht.",
        unkownJoin: "Der Allianz beizutreten ist aus unbekanntem Grund fehlgeschlagen.",
        enterValidTag: "Gib ein gültiges Allianzkürzel mit 2 bis 5 Buchstaben ein.",
        enterValidName: "Gib einen gültigen Allianznamen mit mindestens 2 Buchstaben ein.",
        tagTaken: "Das Kürzel wird bereits von einer anderen Allianz benutzt.",
        noPermissionCreate: "Du hast nicht die Befugnis eine Allianz zu gründen.",
        unknownCreate: "Die Allianz zu gründen ist aus unbekanntem Grund fehlgeschlagen.",
        changeDescriptionForbidden: "Nur Allianzanführer können die Beschreibung ändern.",
        changeDescriptionError: "Die Allianz Beschreibung konnte aus unbekanntem Grund nicht geändert werden.",
      },
      success: {
        passwordSet: "Das Passwort wurde gespeichert.",
        reservationSaved: "Allianz wurde reserviert.",
      },
      confirmKick: {
        heading: "Aktion bestätigen",
        message1: "Willst Du ",
        message2: " wirklich aus der Allianz werfen?",
        cancel: "Nein, doch nicht",
        ok: "Raus!",
      },
      confirmLeave: {
        heading: "Allianz verlassen",
        message: "Möchtest Du Deine Allianz wirklich verlassen?",
      },
    },
    
    welcome: {
      heading: 'Willkomen bei Wack-a-Doo!',
      headingPlan: 'Der Plan',
      image: AWE.Config.RAILS_ASSET_PATH + 'whatdoido_de_DE.jpeg',
      headingSituation: 'Die Situation',
      formattedText: '<p>Du bist ein <b>Halbgott</b> und hast gerade einen kleinen, Dir folgenden Stamm von Steinzeithöhlenmenschen davon überzeugt, ihre Höhle zu verlassen und ab jetzt in einer hochmodernen Siedlung zu leben. Leider hat der glorreiche Stammesführer aber bisher nur eine pompöse Hütte für sich selbst bauen lassen.</p><p>Ein kleines Tutorial wird Dich als Halbgott durch die ersten Schwierigkeiten Deiner neuen Herrschaft führen. Tatsächlich bedeutet die Führung eines Stammes mehr als nur die eigene Häuptlingshütte auszubauen, aber das wirst Du schon herausfinden...</p> <p><b>Viel Spaß!</p>',
    },
    
    shop: {
      button:'Shop',
      title: 'Fundgrube',
      currentCreditAmount: 'Du besitzt derzeit   ein Guthaben von',
      credits: 'Credits',
      platinumCredits: '5D Platinum Credits',
      for: 'für',
      updateCredits: 'Aktualisieren',
      buyCredits: 'Jetzt aufladen',
      article: 'Artikel',
      description: 'Beschreibung',
      price: 'Credits',
      activating: "Senden...",
      buy: 'Aktivieren',
      action: 'Aktion',
      extend: 'Verlängern',
      resourceOffers: "Krötenpakete",
      platinumFunction: "Platinum Funktionen",
      platinumOffers: "Platinum Account",
      bonusOffers:"Bonus Pakete",
      production: 'Produktion',
      duration: 'Dauer',
      expiry: 'Ablauf',
      frog_trade: 'Reisender Händler: schneller Rohstofftausch', 

      current: "Aktuelle",
      platinumCredit: "Platinum Credits",
      offers: "Angebote",
      loading: "Shop wird geladen",
      unreachable: "Der Shop ist vorübergehend nicht erreichbar!",

      goldenFrog: "Kröte",
      goldenFrogs: "Kröten",

      platinumDescription:
        "Der Platinum Account bietet Dir " +
        "stressfreies Bauen mit zusätzlichen Plätzen in Bauschleife (+3) und " +
        "Ausbildungsschleife (+3) sowie " +
        "E-Mailbenachrichtigungen bei Angriffen. " +
        "Weitere Komfortfunktionen folgen in Kürze.",

      notenoughcredits: {
        getCredits: 'Hol Dir Credits',
        title: 'Nicht genug Credits',
        message: 'Leider hast Du nicht genug Credits. Besuche den Credit Shop, um mehr 5D Platinum Credits zu kaufen.',
      },
      error: {
        heading: "Server Fehler",
        message: "Es gibt ein Problem mit dem Shop. Bitte versuche es später noch einmal.",
      },
      buyConfirmation: {
        cashHeader: "Perfekt!",
        cashMessage: "Du hast gerade einen Haufen Kröten bekommen. Gib sie weise aus, damit Dein Stamm lang leben und gedeihen kann.",
        platinumAccountHeader: "Juhuu!",
        platinumAccountMessage: "Der Platinum Account wurde aktiviert. Platinum Features sind ab sofort freigeschaltet.",
        bonusHeader: "Juhuu!",
        bonusMessage: "Der Bonus wurde aktiviert und wird Deinem Stamm helfen seinen Wohlstand zu mehren.",
      },
    },
    
    settlement: {
      
      population: 'Bewohner',
      defenseBonus: 'Kampfbonus',
      founded: 'Gründung',

      
      customization: {
        chooseName: "Deinen Namen wählen",
        changeName: "Deinen Namen ändern",
        chooseNameCaption: 'Siedlungsnamen wählen',
        changeNameCaption: 'Siedlungsnamen ändern',
        nameChangeAdvice: 'Die allererste Änderung des Namens im Spiel ist kostenlos, jede weitere Änderung kostet ein paar Kröten.',

        changeNameDialogCaption: "Gib den neuen Namen ein.",
        
        errors: {
          nameTooShort: "Viel zu kurz. Der Name muss mindestens 3 Zeichen enthalten.",
          nameTooLong: "Viel zu lang. Der Name darf höchstens 16 Zeichen enthalten.",
          nameNoChange: "Das ist der gleiche Name wie vorher. Keine Veränderung",

          nameTaken: "Dieser Name wird schon benutzt oder ist auf der Blacklist. Bitte wähle einen anderen Namen.",
          changeNameCost: "Du hast nicht genug Kröten, um den Siedlungsnamen zu ändern.",
          changeNameError: "Der Name konnte aus unbekannten Gründen nicht geändert werden. Bitte versuch es später noch einmal.",
        },
      },

      invitationLink: {
        header: "Einladungslink",
        text: "Lade Deine Freunde zum Spielen ein. Wenn sie sich über den folgenden Link registrieren, starten sie direkt in dieser Region und zahlen Dir von Beginn an Steuern.",
        send: "Per Mail versenden",
        mailSubject: "Einladung zu Wack-A-Doo",
        mailBody: "Spiele jetzt Wack-A-Doo: ",
      },

      abandon: {
        header: "Lagerstätte aufgeben",
        text: "Wenn Du knapp an Siedlungspunkten bist, kannst Du diese Lagerstätte aufgeben. Sie geht dann in den Besitz der Neandertaler über und ist anschließend für andere Spieler übernehmbar.",
        send: "Lagerstätte aufgeben!",
        fighting: "Die Lagerstätte kann zur Zeit nicht aufgegeben werden, da die Garnisonsarmee am Kämpfen ist.",
      },

      buildings: {
        
        category: 'Kategorie',
        level: 'Stufe',
        Level: 'Stufe',
        
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
          clickToEnter: 'Klicken, um das Gebäude zu betreten.',
          upgradePossible: 'Dieses Gebäude kann verbessert werden:',
          empty: {
            heading: 'Freier Bauplatz',
            categoriesStart: 'Hier können ',
            categoriesEnd:   ' gebaut werden.',
            maxLevel: 'Maximale Stufe',
            advise:  'Klicken, um ein neues Gebäude zu bauen.'
          },
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
        constructionQueueNotEmpty: {
          msg: "Du kannst diesen Auftrag nicht geben, während andere Aufträge für diesen Bauplatz in der Bauschlefe sind.",
        },
      },
      construction: {
        hurry: "Hurtig!",
        cashTooltip: "Gib Goldkröten aus, um den Bauauftrag sofort fertig zu stellen. Die Kosten hängen von der verbleibenden Bauzeit ab.",
        frogTradeTooltip: "Tausche 2 Kröten zur Neuverteiltung deiner Ressourcen, so dass die Gebäudeproduktion sofort startet.",
        cancelTooltip: "Den aktuellen Ausbau abbrechen.",
        insufficentResources: "Mangel",
        finishing: "gleich fertig",
        beingBuilt: "Wird gerade gebaut.",
        waitingToBeBuilt: "Wartet darauf, bis es an der Reihe ist.",
        cannotBeBuilt: "Kann derzeit nicht gebaut werden. Wird automatisch begonnen, sobald die nötigen Rohstoffe und Bauslots vorhanden sind.",
        requiredResources: 'Kosten',
        remaining: 'Fehlend',
        actionTitle: 'Aktionsinfo',
      },
      training: {
        perUnit: "Pro Einheit",
        duration: "Dauer",
        total: "Total",
        recruit: "Rekrutiere ",
        hurryTooltip: "Gib Goldkröten aus um Einheiten doppelt so schnell zu rekrutieren. Die Kosten hängen von der verbleibenden Rekrutierungszeit ab.",
        hurryIndicator: "x2",

        queueFull: {
          start: "Sorry, aber die Trainingschleife ist bereits voll. Du kannst maximal ",
          end: " Aufträge aufreihen. Bitte warte, bis etwas anderes fertig wird.",
        },
        hurry: "Halbieren",
      },

      military: {
        takeOver: "Diese Siedlung kann von anderen Spielern geklaut werden.",
        noTakeOver: "Diese Siedlung kann nicht übernommen werden!",
        destroyable: "Diese Siedlung kann von anderen Spielern zerstört werden.",
        notDestroyable: "Diese Siedlung kann nicht zerstört werden!",
      },

      trade: {
        sendResources: "Rohstoffe versenden",
        cartsEnRoute: "Handelskarren unterwegs",
        recipient: "Empfänger",
        send: "Sende",
        enRoute: "Ausgehende Karren",
        carts: "Karren",
        timeOfArrival: "Ankunftszeit",
        inbound: "Eingehende Karren",
        sending: "senden",
        empty: "leer",
        cargo: "Ladung",
        returnTo: "Rückkehr nach",
        returnFrom: "Rückkehr von",
        origin: "Herkunft",
        destination: "Ziel",
        amount: "Menge",
        hurry: "Hurtig!",
        hurryTooltip: "Du kannst die Transportzeit der Handelskarren gegen ein paar Kröten um 30 Minuten verringern.",
        hurryTooltipHurried: "Lass die Handelskarren gegen ein paar Kröten sofort beim Ziel eintreffen.",
        noCartsInTransit: "Keine Karren unterwegs.",

        frogTradeHeader: "Reisender Händler",
        frogTradeDescription: "Immer ein fröhliches Wort und ein Lied auf den Lippen bietet der Reisende Händler seine Dienste an. Gegen einen Freundschaftspreis kannst Du beim Händler Deine vorhandenen Rohstoffe neu verteilen.",
        frogTradeButton: "Handeln",

        error: {
          recipientUnknown: "Deine Anhänger sind viel zu faul, als dass sie Ressourcen an sich selbst senden würden.",
          recipientSelf: "Empfänger unbekannt.",
        },
      },

      found: {
        confirmationHeader: "Hier eine Lagerstätte gründen?",
        confirmationFlavour: "Eine Siedlung in Ehren kann niemand verwehren. Harrharrharr.",
        confirmationText: "Die Lagerstätte wird an diesem Ort gegründet, kann nicht mehr verschoben werden und verbraucht einen Deiner Siedlungspunkte. Außerdem bleibt ein kleiner Anführer aus Deiner Armee permanent bei Deiner Lagerstätte und steht Dir nicht mehr zur Verfügung.",
        confirmation: "jetzt und hier gründen",
        errorHeader: "Lagerstätte kann nicht gegründet werden.",
        errorFlavour: "Grmpf.",
        errorText: "Lagerstätten können nur an derzeit unbewohnten Orten und auch nur in Regionen gegründet werden, in der sich noch keine andere Lagerstätte von Dir oder Dein Hauptdorf befindet.",
        requirements: {
          text:"Außerdem müssen folgende Bedingungen erfüllt sein",
          req1: "Du hast einen freien Siedlungspunkt zur Verfügung,",
          req2: "Deine Armee hat mindestens einen kleinen Anführer dabei und",
          req3: "Deine Armee hat noch mindestens einen Aktionspunkt zur Verfügung.",
        },
      },

      artifact: {
        costs: "Kosten",
        duration: "Dauer",
        start: "Start",
        initiate: "Einweihen",
        initiated: "eingeweiht",
        owner: "Besitzer",
        location: "Ort",
        captured_at: "Erobert",
        initiated_at: "Eingeweiht",
        notEnoughResources: {
          header: "Halt!",
          content: "Du hast aktuell leider nicht genügend Resourcen, um das Artefakt einzuweihen.",
        },
        cancelText: "Schade",
        characterBoni: "Bonus für den Besitzer",
        allianceBoni: "Bonus für die Allianzmitglieder",
        hurry: "Halbieren",
        hurrying: "beschleunigen",
        hurried: "beschleunigt",
        hurryTooltip: "Gib Goldkröten aus um das Artefakt doppelt so schnell einzuweihen. Die Kosten hängen von der Einweihungszeit ab.",
        hurryIndicator: "x2",
      },

      assignment: {
        assignments: "Aufträge",
        duration: "Dauer",
        unitDeposits: "Benötigte Einheiten",
        costs: "Kosten",
        rewards: "Belohnung",
        start: "Start",
        hurry: "Hurtig!",
        hurried: "beschleunigt",
        finishing: "Beenden...",
        noneAvailable: "Zur Zeit zind keine Aufträge verfügbar.",
        cancelText: "Ok",
        error: {
          conflict: {
            header: "Fehler!",
            content: "Der Auftrag ist bereits gestartet. Warte, bis er fertig ist.",
          },
          prerequisites: {
            header: "Halt!",
            content: {
              resource_wood: "Du hast aktuell leider nicht genügend Holz, um den Auftrag zu starten.",
              resource_stone: "Du hast aktuell leider nicht genügend Stein, um den Auftrag zu starten.",
              resource_fur: "Du hast aktuell leider nicht genügend Fell, um den Auftrag zu starten.",
              resource_cash: "Du hast aktuell leider nicht genügend Kröten, um den Auftrag zu starten.",
              armies: "Du hast aktuell leider nicht genügend Einheiten, um den Auftrag zu starten.",
            }
          }
        }
      },

      info: {
        clickToExpand: "zum erweitern klicken",
        clickToMinimize: "zum minimieren klicken",
        combatBonus: "Kampfbonus für alle Armeen, die auf der Seite dieser Siedlung kämpfen.",
        combatBonusInfo: "Wenn die Siedlung an einem Kampf beteiligt ist, wirkt der Kampfbonus auf den Verteidigungswert aller Truppen, die auf der Seite dieser Festung kämpfen; egal, ob sie innerhalb oder außerhalb der Mauern stationiert sind.",
        combatBonusAbbreviation: "KB",
        buildingSpeed: "Baugeschwindigkeit",
        buildingSpeedAbbreviation: "G",
        meleeTrainingSpeed: "Rekrutierunggeschwindigkeit von Nahkämpfern",
        meleeTrainingSpeedAbbreviation: "N",
        rangedTrainingSpeed: "Rekrutierunggeschwindigkeit von Fernkämpfern",
        rangedTrainingSpeedAbbreviation: "F",
        ridersTrainingSpeed: "Rekrutierunggeschwindigkeit von Berittenen",
        ridersTrainingSpeedAbbreviation: "B",
        commandPointsInfo: "benutzte Kommandopunkte / verfügbare Kommandopunkte. Jede Armee benötigt einen Kommandopunkt.",
        commandPointsHelp: "Jede Armee benötigt einen Kommandopunkt. Der Kommandopunkt hängt an der Siedlung.",
        buildings: "Gebäude",
        changeName: "Namen ändern",
        availableBuildingSlots: "Verfügbare Gebäudeplätze",
        speedUpInfo: "Die Bau- bzw. Rekrutierungsgeschwindigkeit kann durch den Ausbau oder Bau von zusätzlichen Einheitengebäuden oder Hütten erhöht werden.",
        taxRate: "Steuersatz",
        taxRateChangeInfo: "Der Steuersatz, die Du hier setzt, gilt für die komplette Region und alle ihre Einwohner.",
        taxRateChangeNotPossible: "Die nächste Änderung ist eine Stunde nach der letzten Änderung möglich",
        taxRateHelp: "Der Steuersatz wird vom Besitzer der Festung in der Region festgesetzt. Das Minimum sind 5%, der Standardwert und das Maximum sind 15%. Du findest den Steuersatz ungerecht? Verbünde dich mit den anderen Bewohnern der Region gegen den Unterdrücker. Er hat es bestimmt verdient. Nimm die Festung ein und ziehe die Steuern für dich selbst ein.",
        change: "ändern",
        resourceProduction: "Rohstoffproduktion",
        bonus: "Bonus",
        tax: "Steuern",
        result: "Ergebnis",
        resourceProductionInfo1: "Steuern werden nur auf die Gebäude-Basisproduktion erhoben. Die Bonusproduktion bezieht sich auf die unversteuerte Gebäude-Basisproduktion und wird",
        resourceProductionInfo2: "nicht",
        resourceProductionInfo3: "besteuert.",
        setTaxRate: "Gib den neuen Steuersatz ein (5-15%).",
        artifact: "Artefakt"
      },
      error: {
        serverDidNotAcceptTaxRate: "Der Server hat die Änderung des Steuersatzes nicht akzeptiert.",
        couldNotChangeTaxRate: "Gib eine Zahl zwischen 5 und 15 ein.",
      },
    },
    
    profile: {
      youAre: "Du bist",
      playingSince: "dabei seit",
      totalPopulation: "Gesamtbevölkerung",
      experience: "Erfahrung",
      fortresses: "Festungen",
      homeSettlement: "Heimatsiedlung",
      sendMessage: "Nachricht senden",

      battles: "Kämpfe",
      victories: "Siege",
      defeats: "Niederlagen",
      
      history: "Geschichte",
      emptyHistory: "keine Ereignisse vorhanden",

      progressTab: "Fortschritt",
      customizationTab: "Anpassung",
      optionsTab: "Einstellungen",

      rank: {
        start: "Beginn",
        experience: "Erfahrung",
        experienceAbbreviation: "XP",
        settlementPoint: "Siedlungspunkt",
        mundaneRank: "Weltlicher Rang",
        sacredRank: "Geistlicher Rang",
        noRankUpPossible: "Derzeit ist kein Aufstieg möglich.",
        info: "Ein Aufstieg im weltlichen Rang gibt mehr Siedlungspunkte.",
        experienceInfo: "Deine Erfahrung steigt, indem Du baust und kämpfst.",
        settlementPoints: "Siedlungspunkte",
        notUsed: "Noch nicht verwendet",
        total: "Insgesamt",

        progress: {
          dialogHeader: "Rangaufstieg!",
          flavour1: "Du bist soeben in einen neuen Rang aufgestiegen und darfst Dich jetzt",
          flavour2: "nennen.",
          flavour3: "Mach weiter so, dann steigst Du in Null-Komma-Nix in den Rang",
          flavour4: "auf.",
          text: "Du hast genug Erfahrung durch Kämpfen und Bauen gesammelt, um einen Rang aufzusteigen. Rangaufstiege versprechend Dir ein höheres Ansehen bei Deinen Mitspielern. Die werden schon ganz neidisch. Außerdem benötigst Du einen höheren Rang, um mehr Festungen und Lagerstätten kontrollieren zu können.",
        },
      },

      time: {
        systemTime: "Systemzeit",
        approxServerTime: "Approximierte Serverzeit",
        localTime: "Lokale Rechneruhr",
        deviation: "Differenz",
        lagZero: "Perfekt!",
        lagTolerable: "Diese Zeitdifferenz ist tolerabel.",
        lagUntolerable1: "Bitte stelle Deine Rechneruhr auf die korrekte Uhrzeit",
        lagUntolerable2: "oder schalte den automatischen Abgleich mit der Internetzeit an, sofern Dein Betriebssystem diese Möglichkeit bietet. Die Reaktivität des Spiels und Deine Nutzungserfahrung würden dadurch deutlich verbessert.",
      },

      customization: {
        changeAvatar: "Deinen Avatar ändern",
        presentAvatar: "Aktueller Avatar",
        changeAvatarCaption: 'Avatar ändern',
        changeAvatarAdvice: 'Keine Lust auf dein Avatar? Dann würfel dir einen neuen zusammen!',
        changeAvatarButton: 'würfeln',
        changeAvatarDialogCaption: 'Dein neuer Avatar',
        info: "Hier kannst Du Deine Erscheinung als Halbgott anpassen. Im Moment sind Dein Name und Dein Geschlecht wählbar, mit denen Du im Spiel auftreten möchtest. Später werden weitere Individualisierungen hinzukommen.",
        chooseName: "Deinen Namen wählen",
        changeName: "Deinen Namen ändern",
        presentName: "Aktueller Name",
        chooseNameCaption: 'Namen wählen',
        changeNameCaption: 'Namen ändern',
        nameChangeAdvice: 'Bitte wähle Deinen Namen mit Bedacht, idealerweise passt der Name in die Steinzeit. Der Name muss einzigartig in Wackadoo sein.',
        nameChangeFreeAdvice: 'Zweimal kannst Du Deinen Namen kostenlos ändern, jede weitere Änderung kostet ein paar Kröten um Missbrauch zu verhindern.',
        nameChangeCostAdvice: 'Du hast Deinen Namen bereits mehrmals geändert. Eine weitere Namensänderung ist natürlich möglich, kostet aber zur Verhinderung von Missbrauch 20 Kröten.',
        chooseGender: "Dein Geschlecht wählen",
        changeGender: "Dein Geschlecht ändern",
        presentGender: "Aktuelles Geschlecht",
        chooseGenderCaption: 'Geschlecht wählen',
        changeGenderCaption: 'Geschlecht ändern',
        genderChangeFreeAdvice: 'Die ersten beiden Änderungen der Geschlechtseinstellung sind kostenlos, jede weitere Änderung kostet ein paar Kröten um Missbrauch zu verhindern.',
        genderChangeCostAdvice: 'Du hast die Einstellung Deines Geschlechts bereits mehrfach geändert. Eine weitere Änderung der Geschlechtseinstellung ist möglich, kostet aber zur Verhinderung von Missbrauch 20 Kröten.',
        male: "männlich",
        female: "weiblich",

        changePasswordCaption: "Änderung des Passwortes",
        changePasswordAdvice: "Hier kannst Du Dein Passwort ändern. Das Passwort muss eine Länge von 6 bis 40 Zeichen haben.",
        changePasswordButton: "Passwort ändern",
        changePasswordChanged: "Passwort geändert",

        changeNameDialogCaption: "Gib den neuen Namen für Deinen Charakter ein.",

        changeSameIPCaption: "Mehrere Spieler unter derselben IP-Adresse",
        changeSameIPAdvice: 'Wenn Du mit mehreren Spielern über die gleiche IP-Adresse Wack-A-Doo spielst, gib hier die Spielernamen Komma getrennt ein. Nähere Infos findest Du hier: <a href="http://wiki.wack-a-doo.de/x/index.php?title=Mehrere_Spieler_unter_derselben_IP-Adresse&action=edit&redlink=1" target="_blank">Wiki</a>',
        changeSameIPButton: "Liste ändern",
        changeSameIIPChanged: "Die Liste wurde gespeichert.",
        
        errors: {
          nameTooShort: "Viel zu kurz. Der Name muss mindestens 3 Zeichen enthalten.",
          nameTooLong: "Viel zu lang. Der Name darf höchstens 12 Zeichen enthalten.",
          nameNoChange: "Das ist der gleiche Name wie vorher. Keine Veränderung",

          nameTaken: "Dieser Name wird schon benutzt oder ist auf der Blacklist. Bitte wähle einen anderen Namen.",
          changeNameCost: "Du hast nicht genug Kröten, um Deinen Namen zu ändern.",
          changeNameError: "Dein Name konnte aus unbekannten Gründen nicht geändert werden. Bitte versuch es später noch einmal.",
          changeGenderCost: "Du hast nicht genug Kröten, um Dein Geschlecht zu ändern.",
          changeGenderError: "Dein Geschlecht konnte aus unbekannten Gründen nicht geändert werden. Bitte versuch es später noch einmal.",

          changePasswordInvalid: "Das Passwort entspricht nicht den Vorraussetzungen. Bitte wähle ein passendes Passwort.",
          changePasswordUnknown: "Dein Passwort konnte aus unbekannten Gründen nicht geändert werden. Bitte versuche es später noch einmal.",
          changePasswordNoMatch: "Die Passwörter stimmen nicht überein. Bitte versuche es noch einmal.",
          
          changeSameIIUnknown: "Die Liste konnte aus unbekannten Gründen nicht geändert werden. Bitte versuche es später noch einmal.",
          changeFailed: {
            heading: 'Avatar speichern fehlgeschlagen',
            text: 'Aus irgendeinem Grund konnte dein neuer Avatar nicht gespeichert werden.',
          },
        },
      },
    },
    
    tutorial: {
      questList:        "Aktuelle Quests",
      name:             "Auftrag",
      status:           "Status",
      new:              "neu",
      open:             "offen",
      finished:         "beendet",
      reward:           "Belohnung",
      rewardLink:       "Einlösen",
      redeemNow:        "Belohnung jetzt einlösen",
      redeemLater:      "Belohnung später einlösen",
      showQuestLink:    "Anzeigen",
      answerQuestLink:  "Absenden",
      correctAnswered:  "Frage richtig beantwortet",

      task: {
        info: {
          header:       "Tutorial Auftrag (offen)",
        },
        start: {
          header:       "Neuer Tutorial Auftrag",
        },
        end: {
          header:       "Tutorial Auftrag (erledigt)",
        },
      },
      
      quest: {
        info: {
          header:       "Quest (offen)",
        },
        start: {
          header:       "Neue Quest",
          task:         "Dein Auftrag:",
        },
        end: {
          header:       "Quest (erledigt)",
          bonus:        "Du erhältst folgende Boni:",
          resources:    "Ressourcen",
          units:        "Einheiten",
          task:         "Erledigt:",
        },
        redeemError: {
          header:       "Achtung",
          message:      "Du kannst die Quest nicht einlösen, weil aktuell nicht genug Platz für Deine Belohnung da ist. Versuch's später noch mal!",
        },
        error:          "Leider falsch. Probier's gleich noch mal!",
      },

      questStart:{
        header:"Neue Quest",
      },
      questEnd:{
        header:"Quest erledigt",
      },

      end: {
        header: "Tutorial erfolgreich beendet.",
        p1: "Glückwunsch Halbgott, Du hast den ersten Schritt auf Deiner Reise getan! Du hast das Tutorial erfolgreich durchlaufen und die grundlegenden Funktionen von Wack-A-Doo kennen gelernt.",
        p2: "Zu diesem Erfolg schenken wir Dir für einige Tage den optionalen Platinum-Account samt Komfortfunktionen. Details dazu in der Fundgrube oben rechts.",
        p3: "Deine weitere Entwicklung werden wir beobachten und Dich mit einer Reihe von fortlaufenen Aufgaben begleiten. Diese Aufgaben kannst Du erfüllen, wann immer es Dir gefällt.",
        p4: "Lass Dich von unseren Aufgaben nicht ablenken. Baue die Siedlungen aus, stelle Armeen auf und mehre Deine Macht und Deinen Einfluss, wie es Dir gefällt, solange Du am Ende nur die Weltherrschaft erlangst!",
        p5: "Viele Wege führen in Wack-A-Doo zum Erfolg, aber wenn es eine Aussage mit Allgemeingültigkeit gibt, ist es folgende: Rohstoffe, Rohstoffe und noch mehr Rohstoffe. Eine schlagkräftige Armee gewinnt einen Kampf, eine hohe Rohstoffproduktion einen Krieg.",
      	p6: "Viel Spaß in Wack-A-Doo und whack on!",
        redeemError: {
          header:       "Achtung",
          message:      "Die Belohnung konnte nicht freigeschaltet werden, da sie bereits einmal freigeschaltet wurde.",
        },
      }
    },
    
    messaging: {
      inbox:            "Eingang",
      outbox:           "Ausgang",
      archive:          "Archiv",
      unknownRecipient: "Unbekannter Empfänger",
      allianceMail: "Allianz-Rundmail",
      subject: "Betreff",
      send: "Senden",
      cancel: "Verwerfen",
      newMessage: "Neue Nachricht",
      to: "An",
      toHeader:"an",
      toAlliance: "An Alle Allianzmitglieder",
      unknown: "Unbekannt",
      allMembersOf: "Alle Mitglieder von",
      recipient: "Empfänger",
      date: "Datum",
      allAllianceMembers: "Alle Allianzmitglieder",
      allPlayers: "Alle Spieler",
      new: "Neu",
      reply: "Antworten",
      forward: "Weiterleiten",
      delete: "Löschen",
      archiving: "Archivieren",
      newAllianceMail: "Neue Ally-Rundmail",
      noMessageSelected: "Keine Nachricht ausgewählt.",
      from: "Von",
      yourMessage: "deine Nachricht",
      system: "System",
    },
    
    encyclopedia: {
      productionTime: "Produktionszeit",
      hitpoints: "Lebenspunkte",
      attack: "Angriff",
      defense: "Verteidigung",
      criticalDamage: "Kritischer Schaden",
      criticalChance: "Chance",
      cannotBeTrained: "Kann nicht von Spielern trainiert werden.",
      experienceForLostUnits: "XP pro verlorener Einheit",

      commandPointsAbbreviation: "KP",
      buildingTime: "Bauzeit",

      resources: "Rohstoffe",
      buildings: "Gebäude",
      units: "Einheiten",
    
      resource: {
        taxable: "Auf diesen Rohstoff werden Steuern erhoben.",
        notTaxable1: "Auf diesen Rohstoff werden ",
        notTaxable2: "keine",
        notTaxable3: " Steuern erhoben.",
        stealable: "Dieser Rohstoff kann geklaut und gehandelt werden.",
        notStealable: "Dieser Rohstoff kann nicht geklaut oder gehandelt werden.",
      },
    },

    resource: {
      productionInfo: {
        header: "Rohstoffproduktion im Herrschaftsgebiet",
        amount: "Menge",
        productionRate: "Produktionsrate",
        dailyProduction: "Tagesproduktion",
        capacity: "Lagerkapazität",
        capacityReachedIn: "Lager voll in",
        characterEffects: "Spieler-Boni",
        allianceEffects: "Allianz-Boni",
        effectDetails: "Details",
        effects: "Effekte",
        baseProduction: "Basisproduktion",
        full: "voll",
    
        help1: "Rohstoffe werden durch",
        help2: "in der Hauptsiedlung und in Lagerstätten produziert oder in Festungen als",
        help3: "eingenommen. In dieser Übersicht angezeigte Boni wirken im gesamten Herrschaftsgebiet auf die",
        help4: "von Gebäuden und können zum Beispiel in der",
        help5: "erhöht werden.",
      },
      productionTooltip: {
        base: "Basis",
        science: "Forschung",
        buildings: "Gebäude",
        bonus: "Bonus",
        tax: "Steuern",
      },
      exchange: {
        header:   "Der Reisende Händler",
        advert:   "Deine Rohstoffe sind falsch verteilt? Der Reisende Händler bietet Dir einen Handel an.",
        info:     "Gegen eine kleine Abgabe kannst Du beim Händler Deine vorhandenen Rohstoffe neu verteilen.",
        warning:  "Entweder kannst Du alle drei Rohstoffe festlegen oder aber auch nur einen oder zwei Rohstoffe bestimmen. Der verbleibende Rest wird unter allen drei Rohstoffen gleichmäßig verteilt.",
        fee:      "Der Handel kostet Dich jeweils ",
        fee2:     " Kröten.",
        loading:  "Lade Ressourcen",
        loading2: "Führe den Handel durch",
        sum:      "Gesamt",
        remaining:"Verbleibend",
        fill:     "Auffüllen",

        form: {
          exchange: "Umtauschen",
          reset:    "Zurücksetzen",
        },

        errors: {
          noinput: {
            heading: "Ungültiger Wert eingegeben",
            text:    "Du hast keinen gültigen Rohstoffwert eingegeben. So wird das nix mit dem Umtauschen...",
          },

          toomuch: {
            heading: "Zu viele Ressourcen verteilt",
            text:    "Du hast mehr Ressourcen verteilt als dir zur Verfügung stehen.",
            stone:   "Du hast mehr Stein verteilt, als du lagern kannst.",
            wood:    "Du hast mehr Holz verteilt, als du lagern kannst.",
            fur:     "Du hast mehr Fell verteilt, als du lagern kannst.",
          },

          noFrogs: {
            heading: "Du bist pleite!",
            text:    "Leider hast du nicht genügend Kröten zum Bezahlen. Daher, gleich in die Fundgrube und neue kaufen...",
          },

          failed: {
            heading: "Umtausch fehlgeschlagen",
            text:    "Der Umtausch ist fehlgeschlagen. Bitte versuche es erneut oder wende dich an einen Administrator.",
          },
        },
      },
    },

    effects: {
      effects: "Boni",
      type0: "Fundgrube",
      type1: "Artefakt",
      characterEffectsNotAvailable: "Keine Spieler-Boni vorhanden.",
      allianceEffectsNotAvailable: "Keine Allianz-Boni vorhanden.",
    },
    
    likesystem: {
      notEnoughLikeAmount: "Du hast zu wenig Likes um einen Like zu senden.",
      notEnoughDislikeAmount: "Du hast zu wenig Dislikes um einen Dislike zu senden.",
      cancelText: ['Argh!', 'Grmpf!', 'Hmpf', 'Na gut.', 'Narf'],
      alreadyLikedInfo: "Du hast diesen Spieler in den letzten 24 Stunden schon einmal bewertet.",
      likesAvailable: "Likes verfügbar",
      dislikesAvailable: "Dislikes verfügbar",
      info: "Es steht nur eine begrenzte Menge von Likes und Dislikes zur Verfügung. Nach dem Gebrauch regeneriert sich der Vorrat langsam.",
    },
    
    ranking: {
      header: "Ranglisten",
      characters: "Spieler",
      alliance:  "Allianz",
      alliances:  "Allianzen",
      noAlliances: "Es sind noch keine Allianzen vorhanden.",
      fortress: "Festung",
      fortresses: "Festungen",
      victoryProgress: "Siegfortschritt",
      rank: 'Rang',
      character: 'Spieler',
      owner: 'Besitzer',
      overallScore: 'Bevölkerung',
      resourceScore: 'Ressourcen',
      likes: 'Likes',
      victories: 'Siege',
      victoryRatio: 'Siegverhältnis',
      beatenUnits: 'Bes. Einheiten',
      experiencedArmy: 'Armee XP',
      numFortresses: 'Festungen',
      numMembers: 'Mitglieder',
      perMember: 'p. Mitgl.',
      regionsPerMember: 'Schnitt',
      taxRate: 'Steuersatz',
      income: 'Ressourcenrate',
      defenseBonus: 'Kampfbonus',
      name: "Name",
      type: "Typ",
      region: "Region",
      artifact: "Artefakt",
      artifacts: "Artefakte",
      noArtifacts: "Es sind noch keine Artefakte gefunden worden.",
      captured: "Erobert",
      initiated: "Eingeweiht",
      nextPage: "Nächste Seite",
      previousPage: "Vorige Seite",
    },    
  }
  
  return module;
  
}(AWE.I18n.de_DE || {});

