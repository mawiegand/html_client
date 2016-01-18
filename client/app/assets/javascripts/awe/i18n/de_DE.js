var AWE = AWE || {};
AWE.I18n = AWE.I18n || {};

AWE.I18n.de_DE = function(module) {
    
  module.localizedStrings = {
 
    general: {
      open:     'Öffnen',
      close:    'Schließen',
      cancel:   'Abbrechen',
      ok:       'Ok!',
      finished: 'Fertig',
      info:     'Info',
      error:    'Fehler',
      warning:  'Achtung',
      and:      'und',
      or:       'oder',
      yes:      'Ja',
      no:       'Nein',
      nr:       'Nr.',
      of:       'von',
      for:      'für',
      with:     'mit',
      change:   'Ändern',
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
      overview: "Übersicht",
      detail: "Detail",
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
        battle_in: "Kampf in",
        attack_of: "Angriff von",
        on: "auf",
        on_time: "am",
        at_time: "um",
        round: "Runde",
        battleBonus: 'Battle Bonus',
        totalArmies: 'Gesamt Armeen',
        currentlyInvolved: '...aktuell beteiligt',
        killedUnits: 'Gefallene Einheiten',

        participants: {
          name: "Name",
          owner: "Besitzer",
          strength: "Stärke",
          size: "Größe",
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
            "Tu was, unsere Armee geht gerade den Bach runter!"
          ],
          neutral: [
            "Hau mal auf den Putz, da passiert ja gar nix!"
          ]
        },
        other: "Du willst da doch nicht etwa mitmischen, oder?",
      },
    },    
   
    army: {
      maximumArmySizeReached: "Maximale Armeegröße erreicht!",
      waitingForResources: "Warte auf Rohstoffe!",
      newArmy: "Neue Armee",
      poacherFightError: "Tut uns leid Häuptling, das ist eine persönliche Angelegenheit",

      list: {
        header: "Armeeübersicht",
        armies: "Armeen",
        settlements: "Siedlungen",
        none:   "Du besitzt derzeit keine Armeen.",
      },

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
        neanderHome: "Dreckige Höhle",
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
            "Hast Du schon unsere neuen Uniformen gesehen? Sehen schick aus!",
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
          message: "Reduziere sie um so viele Einheiten, dass sie unter der Höchstgrenze liegt!",
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
      xpProduction:   'XP-Produktion',
      requirements:   'Voraussetzung',
      level:          'Stufe',
      cost:           'Kosten',
      duration:       'Dauer',
      produces:       'Produziert',
      capacity:       'Kapazität',
      productionBoni: 'Produktionsbonus',
      tradingCarts:   'Handelskarren',
      commandPoints:  'Kommandop.',
      commandPointShort: 'KP',
      garrisonBonus: "Garnison",
      armyBonus: "Armee",
      defenseBonus: "Vert.",
      garrison: "Garnison",
      population: "Bevölkerung",
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
        levelAfterConversion: "Level nach Abschluss des Umwandlungsauftrags in der Bauschleife",
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
          "Wenn Du nach Wissen über die Funktionsweise der Welt, Gebäude und Einheiten strebst, dann sieh in der Enzyklopädie nach. Zu finden ist die Enzyklopädie oben links im Menü auf der Weltkarte.",
          "Ein bärtiger Greis teilt sein Wissen über die Wettervorhersagekunst: \"Abendrot - Gutwetterbot!\" - \"Außer, natürlich, vor schlechten Tagen,\" fügst Du abgeklärt hinzu.",
          "Angeblich soll im Westen vor kurzem eine Armee spurlos verschwunden und von der Welt verschluckt worden sein. Man sollte sich besser fernhalten.",
          "In den Festungen kann ein Steuersatz von 5 bis 15% Prozent von allen Siedlungen der Region erhoben werden. Dies ist ein Naturgesetz; Steuern über oder unter diesen Grenzen würden den Zorn der Götter heraufbeschwören und den Weltuntergang auslösen.",
          "Heute keine Gerüchte - so ein Glück!",
          "In der Region in der Mitte der Karte soll es einen Topf gefüllt mit Kupfer und umgeben von tausenden Kröten geben.",
          "Ein Weib auf Durchreise behauptet, Kröten und Frösche können man auch essen. Sie hätte selbst im Westen gesehen, wie diese zubereitet und verspeist würden. Was für ein Unfug; Kröten sind DAS Zahlungsmittel und wunderbare Haustiere - aber aufessen???",
          "Ein Seher versucht Dich davon zu überzeugen, dass Menschen in ferner Zukunft in Zylindern aus Kupfer oder ähnlichem durch die Luft fliegen würden. Das kann dich nicht überzeugen; Kupfer ist viel zu schwer, die würden einfach runterfallen."
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
      arriving: 'Ankommen...',
      treasure: 'Truhe',
      
      button: {
        attack:         "Angriff",
        newArmy:        "Neue Armee",
        move:           "Bewegen",
        settle:         "Siedeln",
        retreat:        "Rückzug",
        cancel:         "Abbruch",
        battleInfo:     "Kampfinfo",
        messages:       "Mail",
        stance:         "Haltung",
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
      joinAllianceButtonNew: "Beitreten",
      joinRandomAllianceButtonNew: "Beitreten",
      joinAllianceText: "Tritt einer existierenden Allianz bei, indem Du ihr Kürzel und das geheime Allianzpasswort eingibst.",
      createAlliance: "Allianz gründen",
      createAllianceText: "Gründe eine neue Allianz, mit Dir als Anführer.",
      createAllianceButtonNew: 'Gründen',
      createAllianceFailedHead: 'Gründung fehlgeschlagen',
      redeemAllianceReservationHeader: "Allianzreservierung",
      redeemAllianceReservationButton: "Allianzreservierung einlösen",
      redeemAllianceReservationText: "Löse die Reservierung einer Allianz aus einer vergangenen Runde ein, indem Du ihr Kürzel und das geheime Reservierungspasswort eingibst.",
      leaveAllianceFailedHead: 'Verlassen der Allianz fehlgeschlagen',
      leave: "Verlassen",
      name: "Allianzname",
      tag: "Allianzkürzel",
      password: "Passwort",

      founded: 'Gründung',
      leader: 'Anführer',
      leaderVote: 'Wählen',
      leaderVoted: 'Gewählt',
      description: 'Beschreibung',
      changeDescriptionDialogCaption: 'Gib deine neue Allianzbeschreibung ein.',
      changeDescription: 'Ändere Beschreibung',
      missingDescription: 'Hier könnte eure Allianzbeschreibung stehen.',
      diplomacy: "Diplomatie",
      diplomacyRelation: "Diplomatie Beziehungen",
      diplomacyRelationWithAlliance: " mit der Allianz ",
      diplomacyRelationEnds: " endet am ",
      diplomacyRelationEndsWar1: ". Kapitulation ab ",
      diplomacyRelationEndsWar2: " möglich.",
      createDiplomacyRelationText1: "Stelle ",
      createDiplomacyRelationText2: " ein Ultimatum.",
      createDiplomacyRelationText3: "Es würde am ",
      createDiplomacyRelationText4: " enden.",
      diplomacyFailedHead: 'Diplomatie Beziehung',
      diplomacyFailedText: 'Konnte Diplomatie Beziehung nicht erstellen. Bitte wende dich an einen Administrator sollte das Problem weiterhin bestehen.',
      diplomacyFailedRelationAlreadyExists: 'Eine Diplomatie Beziehung mit dieser Allianz besteht bereits.',
      diplomacyFailedTargetAllianceNotFoundText: 'Konnte die angegebene Allianz nicht finden. Diplomatie Beziehung wurde nicht erstellt.',
      diplomacyRelationCreatePlaceholder: "Allianz",
      createDiplomacyRelationWithAllianceButton: "Ultimatum stellen",
      createDiplomacyRelationButton: "Erstellen",
      autoJoin: "Automatisch beitreten",
      autoJoinDescription: "Automatisch beitreten",
      autoJoinActivated: "Aktiviert",
      autoJoinDeactivated: "Deaktiviert",
      autoJoinFailedHead: 'Fehlgeschlagen',
      autoJoinFailedText: 'Konnte Einstellung nicht ändern. Bitte wende dich an einen Administrator sollte das Problem weiterhin bestehen.',
      allianceLeaderVoteFailedHead: 'Allianz Anführer Wahl',
      allianceLeaderVoteFailedText: 'Konnte Allianz Anführer Wahl nicht durchführen. Bitte wende dich an einen Administrator sollte das Problem weiterhin bestehen.',
      joinRandomAlliance: 'Zufälliger Allianz beitreten',
      joinRandomAllianceDescription: 'Den Server eine Allianz für dich finden lassen',
      joinRandomAllianceButtonLabel: 'Allianz suchen',
      joinRandomAllianceFailedHead: 'Beitritt fehlgeschlagen',
      joinRandomAllianceFailedText: 'Konnte keiner Allianz beitreten. Bitte wende dich an einen Administrator sollte das Problem weiterhin bestehen.',
      joinAllianceNotAllowedText: 'Allianzbeitritt erst wieder möglich am {0}',
      management: 'Geheime Allianzlosung',
      reservation: 'Reservierung für die nächste Runde',
      reservationDescription: 'Als Allianzanführer kannst Du Deine Allianz für die nächste Runde reservieren. Um die Reservierung in der nächsten ' +
        'Runde einzulösen, benötigst Du das Allianzkürzel und ein Passwort.',
      reservationDescriptionNew: 'Setze jetzt ein Passwort.',
      reservationDescriptionChange: 'Ändere das Passwort.',
      message: 'Nachricht des Tages',
      messageExplanation: 'Nur für Mitglieder sichtbar!',
      members: 'Mitglieder',
      shoutBox: 'Rundruf',
      shoutBoxExplanation: 'Alles was hier eingegeben wird, ist umgehend für alle anderen Mitglieder sichtbar.',
      changePassword: 'neues Passwort speichern',
      saveReservation: 'Reservierung speichern',
      kickMember: 'Rausschmeißen',
      report: 'Melden',
      sendApplication: 'Bewerbung einreichen',
      bonus: 'Bonus',
      ofMax: 'von maximal',

      invitationLink: 'Einladungslink',
      invitationLinkDescription: 'Ladet neue Spieler direkt in das Allianzgebiet ein. Wenn sich ein neuer Spieler über diesen Link registriert, wird seine Hauptsiedlung in einer Region platziert, die von der Allianz beherrscht wird. Einfach markieren und kopieren oder per Email versenden.',
      invitationLinkSendByMail: 'Per Mail versenden',

      diplomacyInfo: {
        heading: "Diplomatie System:",
        contentWar: "Eine Allianz stellt einer anderen ein Ultimatum. " +
                    "Nach Ablauf des Ultimatums beginnt der Krieg zwischen beiden Allianzen. " +
                    "Während des Kriegs können Allianzen anderen Allianzen Festungen abnehmen. " +
                    "Nach einer gewissen Kriegsdauer kann der Krieg beendet werden, in dem sich eine der beiden Seiten ergibt. " +
                    "Nachdem ein Krieg beendet ist herrscht eine vorübergende Besatzungsphase in der kein Krieg zwischen den Allianzen erklärt werden kann.",
        contentAlliance: "Eine Allianz bittet eine andere Allianz um ein Bündnis. " +
                         "Die andere Allianz kann das Bündnis annehmen oder die Anfrage auslaufen lassen. " +
                         "Während des Bündnisses können die Allianzen sich gegenseitig keine Festungen und Siedlungen abnehmen. " +
                         "Beide Allianzen können das Bündnis jederzeit wieder beenden. " +
                         "Nach Beendigung des Bündnisses startet die Auskling Phase. " +
                         "Erst nach der Auskling Phase endet der Übernahme Schutz.",
      },
      
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
        artifact: "Artefakt",
        dominion: "Herrschaft",
      },

      error: {
        blankPassword: "Ein leeres Passwort zu setzen ist nicht möglich.",
        specialChars: "Es sind nur Zahlen und Buchstaben erlaubt",
        failedToSetPassword: "Das Allianzpasswort zu setzen ist aus unbekanntem Grund gescheitert.",
        kickHeading: "Geht nicht!",
        kickMessage: "Dieses Mitglied kann nicht von Dir rausgeworfen werden.",
        leaveFailedClient: "Client Fehler: Allianz konnte nicht verlassen werden.",
        leaveFailed: "Allianz konnte nicht verlassen werden.",
        invalidTag: "Gib ein gültiges Allianzkürzel ein.",
        invalidPassword: "Gib die geheime Allianzlosung ein.",
        tagNotTaken: "Es gibt keine Allianz mit diesem Kürzel",
        wrongPassword: "Allianzkürzel und Passwort stimmen nicht überein.",
        memberLimitReached: "Die maximale Anzahl an Allianzmitgliedern wurde bereits erreicht.",
        unkownJoin: "Der Allianz beizutreten ist aus unbekanntem Grund fehlgeschlagen.",
        enterValidTag: "Gib ein Allianzkürzel mit 2 bis 5 Buchstaben ein. Es darf keine Sonderzeichen enthalten.",
        enterValidName: "Gib einen gültigen Allianznamen mit mindestens 2 Buchstaben ein.",
        tagTaken: "Das Kürzel wird bereits von einer anderen Allianz benutzt.",
        noPermissionCreate: "Du hast nicht die Befugnis eine Allianz zu gründen.",
        unknownCreate: "Die Allianz zu gründen ist aus unbekanntem Grund fehlgeschlagen.",
        changeDescriptionForbidden: "Nur Allianzanführer können die Beschreibung ändern.",
        changeDescriptionConflict: "Die Allianzbeschreibung konnte nicht geändert werden, weil sie zu lang ist.",
        changeDescriptionError: "Die Allianzbeschreibung konnte aus unbekanntem Grund nicht geändert werden.",
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
        message2: " Achtung! Beim Verlassen kannst du erst in {0} Stunden einer anderen Allianz beitreten.",
      },
      confirmReport: {
        heading: "Melden bestätigen",
        message: "Willst Du wirklich die Allianz Beschreibung melden?",
        cancel: "Nein",
        ok: "Ja",
        success: "Meldung war erfolgreich",
        error: "Die Meldung wurde aus unbekanntem Grund nicht ausgeführt.",
      },
      confirmApplication: {
        heading: "Bewerbung bestätigen",
        message: "Willst Du Dich wirklich bei dieser Allianz bewerben?",
        cancel: "Nein",
        ok: "Ja",
        success: "Bewerbung war erfolgreich",
        error: "Die Bewerbung wurde aus unbekanntem Grund nicht ausgeführt.",
      },
      confirmAllianceCharacterInvite: {
        heading: "Einladung bestätigen",
        message: "Willst Du die Einladung an {0} wirklich abschicken?",
        cancel: "Nein",
        ok: "Ja",
        success: "Versenden der Einladung war erfolgreich",
        characterNotFound: "{0} wurde nicht gefunden.",
        error: "Die Einladung wurde aus unbekanntem Grund nicht verschickt.",
      },
      confirmDiplomacyRelation: {
        heading: "Änderung der Diplomatie bestätigen",
        message: "Willst Du wirklich die Beziehung zwischen Deiner und dieser Allianz ändern?",
        cancel: "Nein",
        ok: "Ja",
      },
    },

    welcome: {
      heading: 'Willkommen bei Wack-A-Doo!',
      info: {
        first: {
          heading: "1. Baue dich auf",
          text: "Übernimm einen Stamm und baue eine große Siedlung auf.",
        },
        second: {
          heading: "2. Breite dich aus",
          text: "Bilde Einheiten aus und erkunde deine Umgebung.",
        },
        third: {
          heading: "3. Verbünde dich",
          text: "Verbünde dich mit Freunden und gründe eine mächtige Allianz.",
        },
        fourth: {
          heading: "4. Werde unsterblich",
          text: "Erobere die Welt und gewinne das Spiel.",
        }
      },
    },

    facebook: {
      postOnFacebook: 'Auf Facebook posten',
      nextLevel: {
        success: {
          header: 'Facebook',
          message: 'Dein Rangaufstieg wurde auf Facebook gepostet',
        },
        error: {
          header: 'Facebook',
          message: 'Dein Rangaufstieg konnte wegen eines unbekannten Fehlers nicht auf Facebook gepostet werden.',
        },
      }
    },
    
    shop: {
      button:'Shop',
      title: 'Fundgrube',
      currentCreditAmount: 'Du besitzt derzeit ein Guthaben von',
      credit: 'Credit',
      credits: 'Credits',
      platinumCredits: '5D Platinum Credits',
      for: 'für',
      updateCredits: 'Aktualisieren',
      buyCredits: 'Jetzt aufladen',
      buyCreditsThroughFacebook: 'Jetzt aufladen mit FB',
      article: 'Artikel',
      description: 'Beschreibung',
      price: 'Preis',
      activating: "Senden...",
      buy: 'Aktivieren',
      buy2: "Kaufen",
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
      lifetime: 'Lifetime',
      current: "Aktuelle",
      platinumCredit: "Platinum Credits",
      specialOffer: "Katapultstart",
      offers: "Angebote",
      loading: "Shop wird geladen",
      unreachable: "Der Shop ist vorübergehend nicht erreichbar!",

      goldenFrog: "Kröte",
      goldenFrogs: "Kröten",

      frog: "Kröte",
      frogs: "Kröten",

      bonusOfferDescription: "Exklusiv für dich zum Start!",

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
      notenoughgoldenfrogs: {
        getGoldenFrogs: 'Hol Dir Kröten',
        title: 'Nicht genug Kröten',
        message: 'Leider hast Du nicht genug Kröten. Kauf Dir direkt ein paar.',
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
        specialHeader: "Perfekt!",
        specialMessage: "Das Starterpaket wurde erfolgreich zu Deinem Account hinzugefügt.",
      },

      fbPaymentSuccess: {
        header: "Credits gebucht",
        message: "Die Platinum-Credits wurden auf Deinem Konto gutgeschrieben und stehen dir direkt zur Verfügung.",
      },

      fbPaymentBytroError: {
        header: "Buchungsfehler",
        message: 'Die Credits konnten nicht gebucht werden. Wende dich bitte an den Support!',
      },

      fbPaymentError: {
        header: "Allgemeiner Fehler",
        message: 'Die Buchung konnte wegen eines Fehlers von Facebook nicht durchgeführt werden. Versuch es noch einmal!',
      },
    },
    
    settlement: {
      
      population: 'Bewohner',
      defenseBonus: 'Kampfbonus',
      max:'Maximum',
      condition:'Zustand',
      founded: 'Gründung',
      
      customization: {
        chooseName: "Deinen Namen wählen",
        changeName: "Deinen Namen ändern",
        chooseNameCaption: 'Siedlungsnamen wählen',
        changeNameCaption: 'Siedlungsnamen ändern',
        nameChangeAdvice: 'Das kostet dich 1 Kröte.',

        changeNameDialogCaption: "Gib den neuen Namen ein.",
        
        errors: {
          nameTooShort: "Viel zu kurz. Der Name muss mindestens 3 Zeichen enthalten.",
          nameTooLong: "Viel zu lang. Der Name darf höchstens 16 Zeichen enthalten.",
          nameNoChange: "Das ist der gleiche Name wie vorher. Keine Veränderung",

          nameTaken: "Dieser Name wird schon benutzt oder wurde gemeldet. Bitte wähle einen anderen Namen.",
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
        abandon: "Aufgeben",
        header: "Lagerstätte aufgeben",
        text: "Wenn Du knapp an Siedlungspunkten bist, kannst Du diese Lagerstätte aufgeben. Sie geht dann in den Besitz der Neandertaler über und ist anschließend für andere Spieler übernehmbar.",
        send: "Lagerstätte aufgeben!",
        fighting: "Die Lagerstätte kann zur Zeit nicht aufgegeben werden, da die Garnisonsarmee in einen Kampf verwickelt ist.",
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
            large: "Großer Bauplatz",
            small: "Bauplatz", /* currently there is no distinction between small and large lots */
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
        requirementsNotMet:{
          heading: "Vorrausetzungen nicht erfüllt",
          text: "Du erfüllst die Vorraussetzungen nicht, um dieses Gebäude zu bauen!",
        },
        constructionQueueFull: {
          start: "Tut uns Leid, aber die Bauschleife ist schon voll. Du kannst maximal ",
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
        waitingToBeBuilt: "Wartet bis es an der Reihe ist.",
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
        nextUnit:"Nächste Einheit",
        all:"Alle",
        hurryTooltip: "Gib Goldkröten aus um Einheiten doppelt so schnell zu rekrutieren. Die Kosten hängen von der verbleibenden Rekrutierungszeit ab.",
        hurryIndicator: "x2",

        queueFull: {
          start: "Tut uns Leid, aber die Trainingschleife ist bereits voll. Du kannst maximal ",
          end: " Aufträge aufreihen. Bitte warte, bis etwas anderes fertig wird.",
        },
        hurry: "Halbieren",
        error: {
          notOnlyNumbers: "Es sind nur Zahlen erlaubt!",
          tooLargeNumber: "Das sind zu viele. Maximum sind 1000 Einheiten."
        },
      },

      military: {
        yes: "Ja",
        no: "Nein",
        takeOverTitle: "Übernehmbar",
        takeOver: "Diese Siedlung kann von anderen Spielern geklaut werden.",
        noTakeOver: "Diese Siedlung kann nicht übernommen werden!",
        destroyableTitle: "Zerstörbar",
        destroyable: "Diese Siedlung kann von anderen Spielern zerstört werden.",
        notDestroyable: "Diese Siedlung kann nicht zerstört werden!",
      },

      trade: {
        trade: "Handel",
        distrEvently: "0 in allen Feldern verteilt die Resourcen gleichmäßig",
        resourceTradeInfo: "Du kannst deine Rohstoffe für 2 Kröten neu verteilen. Dabei ändert sich nicht die Gesamtanzahl deiner Rohstoffe, sondern nur wie sie auf 3 Rohstoffe verteilt sind.",

        update: "Aktivitäten",
        submit: "Senden",
        sendResources: "Rohstoffe versenden",
        cartsEnRoute: "Handelskarren unterwegs",
        recipient: "Empfänger",
        send: "Sende",
        enRoute: "Ausgehende Karren",
        carts: "Karren",
        timeOfArrival: "Ankunftszeit",
        inbound: "Eingehende",
        outbound: "Ausgehende",
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
        confirmationText: "Die Lagerstätte wird an diesem Ort gegründet, kann nicht mehr verschoben werden und verbraucht einen Deiner Siedlungspunkte. Außerdem bleibt ein kleiner Häuptling aus Deiner Armee permanent bei Deiner Lagerstätte und steht Dir nicht mehr zur Verfügung.",
        confirmation: "Gründen",
        errorHeader: "Lagerstätte kann nicht gegründet werden.",
        errorFlavour: "Grmpf.",
        errorText: "Lagerstätten können nur an derzeit unbewohnten Orten und auch nur in Regionen gegründet werden, in der sich noch keine andere Lagerstätte oder Siedlung von Dir befindet.",
        requirements: {
          text:"Außerdem müssen folgende Bedingungen erfüllt sein",
          req1: "Du hast einen freien Siedlungspunkt zur Verfügung,",
          req2: "Deine Armee hat mindestens einen kleinen Häuptling dabei und",
          req3: "Deine Armee hat noch mindestens einen Aktionspunkt zur Verfügung.",
        },
      },

      artifact: {
        artifactInfo: "Artefakt Info",
        artifactInitiation: "Artefakt Einweihung",
        noArtifact: "Kein Artefakt vorhanden",
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
        characterProductionBonus: "Produktionsbonus für den Besitzer",
        allianceProductionBonus: "Produktionsbonus für die Allianzmitglieder",
        characterConstructionBonus: "Baugeschwindigkeitsbonus für den Besitzer",
        allianceConstructionBonus: "Baugeschwindigkeitsbonus für die Allianzmitglieder",
        hurry: "Halbieren",
        hurrying: "beschleunigen",
        hurried: "beschleunigt",
        hurryTooltip: "Gib Goldkröten aus um das Artefakt doppelt so schnell einzuweihen. Die Kosten hängen von der Einweihungszeit ab.",
        hurryIndicator: "x2",
      },

      assignment: {
        assignments: "Aufträge",
        specialAssignments: "Spezialaufträge",
        duration: "Dauer",
        unitDeposits: "Benötigte Einheiten",
        costs: "Kosten",
        rewards: "Belohnung",
        start: "Start",
        hurry: "Hurtig!",
        hurried: "beschleunigt",
        finishing: "Beenden...",
        noneAvailable: "Zur Zeit zind keine Aufträge verfügbar.",
        noneSpecialAvailable: "Zur Zeit ist kein Spezialauftrag verfügbar.",
        cancelText: "Ok",
        error: {
          conflict: {
            header: "Fehler!",
            content: "Der Auftrag wurde bereits gestartet. Warte, bis er fertig ist.",
          },
          prerequisites: {
            header: "Halt!",
            text: "Du hast aktuell leider nicht genügend Ressourcen oder Armeen, um den Auftrag zu starten.",
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
        recruitmentspeed: 'Rekrutierungsgeschw.',
        buildingSpeed: "Baugeschw.",
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
        availableBuildingSlots: "Gebäudeplätze",
        speedUpInfo: "Die Bau- bzw. Rekrutierungsgeschwindigkeit kann durch den Ausbau oder Bau von zusätzlichen Einheitengebäuden oder Hütten erhöht werden.",
        taxRate: "Steuersatz",
        taxRateChangeInfo: "Der Steuersatz, den Du hier setzt, gilt für die komplette Region und alle ihre Einwohner.",
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
        artifact: "Artefakt",
        movingPassword: "Umzugspasswort",
        move: "Umzug",
        productions: "Produktion"
      },
      error: {
        serverDidNotAcceptTaxRate: "Der Server hat die Änderung des Steuersatzes nicht akzeptiert.",
        couldNotChangeTaxRate: "Gib eine Zahl zwischen 5 und 15 ein.",
        couldNotChangeTaxRateHead: "Fehler beim ändern des Steuersatzes"
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
      tabs: {
        info: "Info",
        rank: "Rang",
        customize: "Anpassen"
      },
      battles: "Kämpfe",
      victories: "Siege",
      defeats: "Niederlagen",
      
      history: "Geschichte",
      emptyHistory: "keine Ereignisse vorhanden",

      progressTab: "Fortschritt",
      customizationTab: "Anpassung",
      optionsTab: "Einstellungen",
      movingTab: "Umziehen",

      rank: {
        currentRank:"Aktueller Rang",
        nextRank:"Nächster Rang",
        currentLevel:"Aktuelle Stufe",
        nextLevel:"Nächste Stufe",
        progressBar:"Fortschritt",
        start: "Beginn",
        experience: "Erfahrung",
        experienceAbbreviation: "XP",
        settlementPoint: "Siedlungspunkt",
        mundaneRank: "Weltlicher Rang",
        sacredRank: "Geistlicher Rang",
        noRankUpPossible: "Derzeit ist kein Aufstieg möglich.",
        info: "Ein Aufstieg im weltlichen Rang gibt mehr Siedlungspunkte.",
        experienceInfo: "Deine Erfahrung steigt, indem Du baust und kämpfst.",
        experienceBonus: "Erfahrungsbonus",
        settlementPoints: "Siedlungspunkte",
        freeSettlementPoints: "Freie Siedlungspunkte",
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
        lagTolerable: "Diese Zeitdifferenz ist annehmbar.",
        lagUntolerable1: "Bitte stelle Deine Rechneruhr auf die korrekte Uhrzeit",
        lagUntolerable2: "oder schalte den automatischen Abgleich mit der Internetzeit an, sofern Dein Betriebssystem diese Möglichkeit bietet. Die Reaktivität des Spiels und Deine Nutzungserfahrung würden dadurch deutlich verbessert.",
      },
      
      
      settings: {
        connectToFacebookHeading: 'Sei Sozial!',
        youAreConnectedToFacebook: 'Du bist bereits mit Facebook verknüpft und kannst Wack-A-Doo jetzt auch in Facebook spielen: <a href="https://apps.facebook.com/wack-a-doo" target="_blank">https://apps.facebook.com/wack-a-doo</a>.<br/>Falsch verbunden? Bitte kontaktiere den Support (support@5dlab.com).',
        connectToFacebookAdvice: 'Verknüpfe Deinen Character jetzt mit Deinem Facebook Account. Du kannst dann auch innerhalb von Facebook spielen und weitere soziale Funktionen nutzen.',
        connectToFacebook: 'Verbinden',
        fbUserIdAlreadyInUse: 'Mit diesem Facebook Account ist bereits ein anderer Charakter verbunden.',
        characterAlreadyConnected: 'Dein Character ist bereits mit einem Facebook Account verbunden.',
        connectionDidFail: 'Sorry, das hat nicht geklappt.',
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
        changeDescriptionCaption: 'Beschreibung ändern',
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
        customEyes:'Augen',
        customMouth: 'Mund',
        customHair: 'Haare',
        customBeard: 'Bart',
        customChains: 'Ketten',
        customTattoos: 'Tattoos',
        customSymbols: 'Symbole',
        customToads: 'Kröten',

        changePasswordCaption: "Änderung des Passwortes",
        changePasswordAdvice: "Hier kannst Du Dein Passwort ändern. Das Passwort muss eine Länge von 6 bis 40 Zeichen haben.",
        changePasswordButton: "Passwort ändern",
        changePasswordChanged: "Passwort geändert",

        changeNameDialogCaption: "Gib den neuen Namen für Deinen Charakter ein.",

        changeSameIPCaption: "Mehrere Spieler unter derselben IP-Adresse",
        changeSameIPAdvice: 'Wenn Du mit mehreren Spielern über die gleiche IP-Adresse Wack-A-Doo spielst, gib hier die Spielernamen Komma getrennt ein. Nähere Infos findest Du hier: <a href="http://wiki.wack-a-doo.de/x/index.php?title=Mehrere_Spieler_unter_derselben_IP-Adresse&action=edit&redlink=1" target="_blank">Wiki</a>',
        changeSameIPButton: "Liste ändern",
        changeSameIIPChanged: "Die Liste wurde gespeichert.",
        
        description: 'Beschreibung',
        changeDescriptionDialogCaption: 'Gib deine neue Characterbeschreibung ein.',
        changeDescription: 'Ändere Beschreibung',
        missingDescription: 'Hier könnte Deine Characterbeschreibung stehen.',
        report: 'Melden',

        confirmReport: {
          heading: "Melden bestätigen",
          message: "Willst Du wirklich die Charakterbeschreibung melden?",
          cancel: "Nein, doch nicht",
          ok: "Ja, wirklich.",
          success: "Meldung war erfolgreich",
          error: "Die Meldung wurde aus unbekanntem Grund nicht ausgeführt.",
        },
        
        errors: {
          nameTooShort: "Viel zu kurz. Der Name muss mindestens 3 Zeichen enthalten.",
          nameTooLong: "Viel zu lang. Der Name darf höchstens 12 Zeichen enthalten.",
          nameNoChange: "Das ist der gleiche Name wie vorher. Keine Veränderung",

          nameTaken: "Dieser Name wird schon benutzt oder wurde gemeldet. Bitte wähle einen anderen Namen.",
          changeNameCost: "Du hast nicht genug Kröten, um Deinen Namen zu ändern.",
          changeNameError: "Dein Name konnte aus unbekannten Gründen nicht geändert werden. Bitte versuch es später noch einmal.",
          changeGenderCost: "Du hast nicht genug Kröten, um Dein Geschlecht zu ändern.",
          changeGenderError: "Dein Geschlecht konnte aus unbekannten Gründen nicht geändert werden. Bitte versuch es später noch einmal.",

          changePasswordInvalid: "Das Passwort entspricht nicht den Vorraussetzungen. Bitte wähle ein passendes Passwort.",
          changePasswordUnknown: "Dein Passwort konnte aus unbekannten Gründen nicht geändert werden. Bitte versuche es später noch einmal.",
          changePasswordNoMatch: "Die Passwörter stimmen nicht überein. Bitte versuche es noch einmal.",

          changeDescriptionError: "Die Charakterbeschreibung konnte aus unbekanntem Grund nicht geändert werden.",
          
          changeSameIIUnknown: "Die Liste konnte aus unbekannten Gründen nicht geändert werden. Bitte versuche es später noch einmal.",
          changeFailed: {
            heading: 'Avatar speichern fehlgeschlagen',
            text: 'Aus irgendeinem Grund konnte dein neuer Avatar nicht gespeichert werden.',
          },
        },
      },
      
      moving: {
        info1: "Hier kannst Du die Position Deiner Hauptsiedlung auf der Karte verändern. Jeder Spieler kann mit seiner Hauptsiedlung einmalig umziehen.",
        info2: "Du kannst nicht in Regionen ziehen, um die gerade gekämpft wird, oder die vor kurzem erobert wurden. Außerdem verlierst du bei einem Umzug dein Artefakt, sofern du eines besitzt.",
        specificMovingCaption: "Gezieltes Umziehen",
        alreadyMoved: "Du bist bereits einmal umgezogen.",
        presentRegion: "Aktuelle Region",
        enterSpecificRegion: "Angabe des Regionsnamen",
        specififcRegionAdvice: "Du kannst den Namen der Region in die Du ziehen möchtest angeben. Gehört die Region einem anderen Spieler, der nicht Teil deiner Allianz ist, musst du zusätzlich noch ein Passwort nennen",
        moveButton: "Umziehen",
        movingPasswordCaption: "Gib das Umzugspasswort ein.",
				confirmation: {
					caption: "Umzug bestätigen",
					message1: "Willst Du wirklich in die Region ",
					message2: " umziehen?",
					cancel: "Nein, doch nicht",
					ok: "Umziehen!",
				},
        movingErrorHeading: "Umzugsfehler",
        movingNoTargetFoundHeading: "Region nicht gefunden",
        movingNoTargetFoundMessage: "Eine Region mit dem Namen scheint es nicht zu geben. Hast Du den Regionennamen richtig geschrieben?",
        movingNotFoundMessage: "In der Region ist bereits eine Siedlung von dir!",
        movingForbiddenMessage: "Das Passwort ist verkehrt. Probier es noch mal!",
        movingConflictMessage: "Die Festung ist im Kampf oder wurde gerade erst erobert. Probier es später noch mal!",
        movingError: "Dein Umzug konnte aus unbekannten Gründen nicht vollzogen werden. Bitte versuch es später noch einmal.",
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
      redeemNow:        "Jetzt Abholen",
      redeemLater:      "Belohnung später einlösen",
      showQuestLink:    "Anzeigen",
      answerQuestLink:  "Absenden",
      correctAnswered:  "Frage richtig beantwortet",
      questFinished:    "Quest abgeschlossen",
      goOn:             "Weiter gehts",
            
      task: {
        info: {
          header:       "",
          task:         "Auftrag:"
        },
        start: {
          header:       "",
          task:         "Neuer Auftrag:",
        },
        end: {
          header:       "",
          task:         "Erledigt:",
        },
      },
      
      quest: {
        info: {
          header:       "",
          task:         "Auftrag:"
        },
        start: {
          header:       "",
          task:         "Neuer Auftrag:",
        },
        end: {
          header:       "",
          bonus:        "Du erhältst folgende Boni:",
          resources:    "Ressourcen",
          units:        "Einheiten",
          task:         "Erledigt:",
        },
        redeemError: {
          header:       "Achtung",
          message:      "Du kannst die Belohnung nicht einlösen, weil aktuell nicht genug Platz in Deinem Lager ist. Versuch's später noch mal!",
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
        p1: "Glückwunsch Halbgott,  Du hast das Tutorial erfolgreich durchlaufen und die grundlegenden Funktionen von Wack-A-Doo kennen gelernt.",
        p2: "Zu diesem Erfolg schenken wir Dir für einige Tage den Platinum-Account. Details dazu in der Fundgrube oben rechts.",
        p3: "Deine weitere Entwicklung werden wir beobachten und Dich mit einer Reihe von fortlaufenden Aufgaben begleiten.",
        p4: "Baue die Siedlungen aus, stelle Armeen auf und mehre Deine Macht und Deinen Einfluss, wie es Dir gefällt!",
        p5: "Viele Wege führen in Wack-A-Doo zum Erfolg, aber beachte folgenden Tip: Eine schlagkräftige Armee gewinnt einen Kampf, eine hohe Rohstoffproduktion einen Krieg.",
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
      newAllianceMail: "Neue Allianz-Rundmail",
      noMessageSelected: "Keine Nachricht ausgewählt.",
      from: "Von",
      yourMessage: "deine Nachricht",
      system: "System",
    },
    
    encyclopedia: {
      encyclopedia: 'Enzyklopädie',
      selectCategory: 'Bitte wähle ein Thema aus.',
      productionTime: "Produktionszeit",
      hitpoints: "Lebenspunkte",
      attack: "Angriff",
      defense: "Verteidigung",
      criticalDamage: "Kritischer Schaden",
      criticalChance: "Chance",
      cannotBeTrained: "Kann nicht von Spielern trainiert werden.",
      experienceForLostUnits: "XP pro verlorener Einheit",
      experienceFactor: "XP-Faktor",

      attackAbbreviation: "Att",
      defenseAbbreviation: "Def",
      hitpointsAbbreviation: "HP",
      criticalDamageAbbreviation: "Crit",
      garrison: "Garnison",
      infantry: "Infanterie",
      artillery: "Artillerie",
      cavalery: "Kavallerie",
      specialUnits: "Spezial",
      military: "Militär",

      commandPointsAbbreviation: "KP",
      buildingTime: "Bauzeit",

      resources: "Rohstoffe",
      buildings: "Gebäude",
      units: "Einheiten",

      largeBuilding: 'Benötigt großen Bauplatz',
      smallBuilding: 'Benötigt einen Bauplatz', /* currently there is no distinction between small and large lots */
      specialBuilding: 'Benötigt einen Bauplatz', /* currently there is no distinction between small and large lots */
      fortressBuilding: 'Nur in Festungen',
    
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
        bonus: "Bonus",
        productionRate: "Produktionsrate",
        production: "Produktion",
        dailyProduction: "Tagesproduktion",
        capacity: "Lagerkapazität",
        capacityReachedIn: "Lager voll in",
        characterEffects: "Effekt",
        allianceEffects: "Allianz",
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

    menu: {
      manual: "Handbuch",
      logout: "Logout",
      header: "Menü",
      reload: "Aktualisieren",
      constructionQueue: "Bauschleife",
      constructionQueuePositionsAvailableBegin: "In der Bauschleife ist noch Platz für",
      constructionQueuePositionsAvailableEnd: "Aufträge",      
    },

    dialogs:{
      assignments: {
        quests: "Aufträge",
        special_quests: "Spezialaufträge",
        gossip: "Gerüchte"
      },
      alliance: {
        alliance: "Allianz",
        info: "Info",
        members: "Mitglieder",
        diplomacy: "Diplomatie",
        invite: "Einladen",
        apply: "Bewerben",

        allianceInfo: {
          invite: "Einladung:",
          allianceCharacterInvitePlaceholder: "Character Name",
          slogan: "Losung:",
          autoJoin: "Aufnahme:"
        },
        allianceMembers: {
          leader: "Anführer",
          members: "Mitglieder",
        },
        allianceDiplomacy: {
          placeHolder: "Kürzel eingeben",
          issueUltimatum: "Ultimatum stellen",
          issueAlliance: "Bündnis anfragen",
          ultimatum: "Ultimatum",
          war: "Krieg",
          capitulation: "Kapitulation",
          occupation: "Besetzung",
          allianceRequest: "Bündnis Anfrage",
          alliance: "Bündnis",
          allianceConclusion: "Bündnis Ausklang",
          end: "Endet",
          giveUp: "Aufgeben",
          cancelAllianceRequest: "Abbrechen",
          acceptAllianceRequest: "Annehmen",
          cancelAlliance: "Beenden",
          opponentSurrender: "Gegner {0} kann in {1} aufgeben.",
        },
      },
      move:{
        heading: "Umziehen",
        description: "Hier steht wie man umziehen kann.",
        to: "nach"
      },
      upgrade:{
        heading: "Gebäude ausbauen",
        upgrade: "Ausbauen",
        level: "Stufe",
        unlocking: "Freischalten",
      },
      convert:{
        heading: "Gebäude umwandeln",
        upgrade: "Umwandeln",
        level: "Stufe",
      },
      armyInfo:{
        next: "Nächster",
      }
    },
    extras: {
      retentionEgg: {
        alertHeading: "Noch nicht Schlüpfbereit",
        alertContent: "Das Ei ist noch nicht zum Schlüpfen bereit.\nWenn es geschlüpft ist, erhältst du eine riesige Menge Rohstoffe!",
        redeemMessage: "Schau mal wie süß sie sind!",
      },
    },
  }
  
  return module;
  
}(AWE.I18n.de_DE || {});
