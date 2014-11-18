var AWE = AWE || {};
AWE.I18n = AWE.I18n || {};

AWE.I18n.en_US = function(module) {
    
  module.localizedStrings = {

    general:{
      open:'Open',
      close:'Close',
      cancel:'Cancel',
      ok:'OK!',
      finished:'Finished',
      info:'Info',
      error:'Error',
      warning:'Warning',
      and:'and',
      or:'or',
      yes:'Yes',
      no:'No',
      nr:'No.',
      of:'of',
      with:'with',
      change:'Change',
      start:'Start',
      loading:  'Loading...',

      processing:'Processing...',
      unknown:'Unknown',
      naivePlural:'s',

      perHour:'per hour',
      perHourSym:'/h',
      days:'days',
      oclock:"o'clock",

      demigod:'Demigod',
      demigoddess:"Demigoddess",
      
      neanderthal: "Neanderthal",

      playerName:"Player name",
      name:"Name",
      password:"Password",
      passwordConfirmation:"Password confirmation",

      startup:{
        loading:'Loading....',
      },

      shoutBox:{
        heading:'Shout Box',
        ago:'ago',
      },
      announcement:{
        play:"Play",
        archive:"Archive",
      },
    },

    server:{
      error:{
        failedAction:{
          heading:"Server Error",
          unknown:"Oops! Something's gone wrong. This action could not be accepted.",
        },
      },
    },

    battle:{
      attack:{
        heading:"Battle Preview",
        citation:"Do you really want to initiate this battle?",
        description:"Your attack would create a battle between the following players:",
        attack:"Attack",
        cancel:"Cancel",
        faction1:"Faction 1",
        faction2:"Faction 2",
      },

      details:{
        heading:"Battle Details",
        afterRound:"After round",
        preparingRound:"Preparing round",
        lastRound:"Last round",
        nextRound:"Next round",
        firstRound:"First round",
        myFaction:"My faction",
        oneFaction:"One faction",
        otherFaction:"Other faction",
        lostUnits: "Lost Units",

        participants:{
          name:"Name",
          owner:"Owner",
          strength:"Strength",
          retreat:"Retreat",
          armyDisbanded:"Disbanded army",
          armyDisbandedDescription:"This is what happens when a home settlement is lost to an enemy army.",
        },
      },
      messages:{
        own:{
          winning:[
            "Yay! Let's mow 'em down!"
          ],
          losing:[
            "Do something! Our army is going down the tube!"
          ],
          neutral:[
            "Go on, whack it – nothing will happen!"
          ],
        },
        other:"You don't really want to get involved, do you?",
      },
    },

    army:{
      maximumArmySizeReached: "Maximum army size reached!",
      waitingForResources: "Waiting for resources!",
      newArmy:"New Army",

      list: {
        header: "Armies overview",
        flavor: "Ha, all my armies at a glance! Experienced ones at the top and new ones at the bottom. Now lets get to it!",
        none:   "You don't currently have any armies.",

        table: {
          name:     "Name",
          region:   "Region",
          status:   "Status",
          rank:     "Rank",
          ap:       "AP",
          size:     "Size",
          max_size: "Maxmimum",
          info:     "Info",
        },

        status: {
          neutral:   "neutral",
          moving:    "moving",
          fighting:  "fighting",
          defending: "defending",
        },
      },

      details:{
        heading:'army',
        units:'units',
        npcMsg:"This motley crew that calls itself an army has no leader right now, so it's a good target for your army to use to gain experience and improve their fighting skills.",
        properties:'properties',
        strength:{
          strengths:'strengths',
          melee:'Melee strenght',
          riders:'Rider strength',
          distance:'Ranged Strength',
          all:'Overall strength',
        },
        melee:'Melee',
        riders:'Riders',
        ranged:'Ranged',
        unitCount:'Unit number',
        size:'Size',
        sizeAll:"Overall size",
        sizeMax:"Maximum Size",
        velocity:'Speed',
        changeName:'Change name',
        rank:"Rank",
        rankDescription:"Having a higher rank makes your troops more effective. Your army has to gain experience in order to achieve a higher rank.",
        rankUpAt:"Rank up at",
        experience:"Experience",
        experienceDescription:"You gain experience when your own troops die, not when you kill those of the enemy. The reason? You only learn from your mistakes.",
        stance:"Help to defend the fortress or settlement if they're attacked.",
        demigod:"Demigod",
        ownerLabel:"Owner",
        actionPoints:"Action points",
        nextActionPointAt:"Next action point at",
        homeSettlement: "Home settlement",
      },
      messages:{
        own:{
          warrior:[
            "I'm all ears.",
            "Hey – I've brought cake!",
            "Did you hear? There are supposed to be daisies just over there!",
            "Sir! Yessir!",
            "Please don't hit me!",
            "What is it this time?",
            "What do I have to do this time?",
            "My dad always used to say: never do today what you can put off until tomorrow!",
            "Can't anyone get a bit of peace and quiet round here?",
            "Well, as long as we're talking I don't have to fight, right?",
            "Hm – when was the last company annual holiday? ",
            "Have you seen our new uniforms? Smart, eh?",
            "Please don't make me dirty – I've just had a bath!",
            "No fighting today, please – my muscles ache.",
            "I don't feel like it today. Just don't feel like it.",
            "Hmph.",
            "What, you again?",
            "What's on the agenda for today?",
            "Come on, spit it out!",
            "Seriously Demigod, haven't you got anyone else to order about?",
            "Today is a good day for picking flowers.",
            "How about a dinosaur hunt, just for a change?",
            "Why is it always me who has to go?",
            "Tell me quickly – I'm busy.",
            "The people have been complaining about the food. Can't you send us something for vegans? ",
            "Now listen here – I'll knock one down for you, but then that's it for today, d'you hear?!",
            "Shh! I'm trying to sleep!",
            "Hard as a feather pillow."
          ],

          girl:[
            "We always have to be very cautious.",
            "I just love standing out here gathering moss.",
            "Isn't it a lovely day?"
          ],

          chef:[
            "Hm – maybe we should attack our neighbours?",
            "I'm just thinking how we can expand our territory.",
            "Oh, I see – only attack when the enemy is hopelessly inferior.",
            "Go and get something to eat. And make sure it's something tasty!",
            "Today, the neighbours – tomorrow, the world!",
            "We won't lose any battles under my leadership! You'll see. ",
            "Attack is the best form of defense. "
          ],
        },


        other:{
          warrior:[
            "Nothing and nobody will stop me!",
            "Today is a great day for dying!",
            "Would you care to fight?",
            "I'm not going to take anything from you.",
            "What are YOU doing here?",
            "You won't get anything out of me.",
            "I'm the greatest!",
            "Are you talking to me, or chewing a brick?",
            "I want to see blood!",
            "Veni, vidi, vici!",
            "You have no business ordering me around! D'you hear?",
            "Hm. I don't think I like you.",
            "Go away!",
            "What is it?",
            "You'd better not annoy me!",
            "No – there aren't any daisies here!"
          ],

          girl:[
            "Friend or foe?",
            "Oh ho – who are you?",
            "Watch what you're doing – I'm having a sense of humour failure today."
          ],

          chef:[
            "Hahahaha!",
            "Listen up. Your country will soon belong to us!"
          ],
        },
      },
      form:{
        available:"Available units",
        new:"New army",
        name:"Army name",
        advisorHint:'How many units do you want to join your new army? Enter the number below New Army and then press Create.',
        all:"All",
        reset:"Reset",
        change:"Change",
        create:"Create",
        changeNameHeading:"Enter the new name for this army.",
        errors:{
          garrison:"The garrison army is too full",
          garrisonFighting:"You can't create another army while the garrison is away fighting.",
          other:"This army is too full.",
          new:"The new army is too full.",
          message:"Reduce the number of units to take it below the limit!",
        },
      },
      create:{
        header:"Create a new army",
        remainingArmies:"Remaining command points for this settlement",
        error:"There are no more command points available for this settlement",
        loadingMessage:"Creating an army…",
      },
      change:{
        header:"Change army units",
        loadingMessage:"Changing army...",
      },
    },

    building:{
      requirements: 'Requirements',
      xpProduction: 'XP Production',
      level:"Level",
      cost:"Cost",
      duration:"Duration",
      produces:"Produces",
      capacity:"Capacity",
      productionBoni:"Production bonus",
      tradingCarts:"Trading carts",
      commandPoints:"Command points",
      commandPointShort: "CP",
      garrisonBonus: "Garrison",
      armyBonus: "Army",
      defenseBonus: "Def.",
      garrison:"Garrison army",
      population: "Population",
      populationAbbreviation:"Pop",
      buildingTime:"Building time",
      storageCapacity:"Storage capacity",
      production:"Production",

      upgrade:{
        conversion:"Convert",
        upgrade:"Upgrade",
        converting:"Converting",
        conversionStart:"Convert ",
        conversionEnd:" ",
        upgradeStart:"Upgrade ",
        upgradeEnd:" ",
        toIn:"to",
        toAuf:"to",
        updating:"Updating",
        demolishing:"Demolishing",
        demolishBuilding:"Demolish building",
        demolishStart:"Demolish",
        demolishEnd:" ",
        convertingMid:" is being converted ",
        convertingEnd:" ",
      },
      tooltip:{
        clickToConvert:"click to convert",
        clickToUpgrade:"click to upgrade",
        clickToDemolish:"click to destroy",
        currentLevel:"current building level",
        levelAfterUpgrade:"Level after finishing all queued upgrades",
        levelAfterDowngrade:"Level after finishing all queued downgrades",
        levelAfterConversion:"Level after finishing queued conversion",
        notEnoughBuildingSlots:"You cannot build more buildings right now. You need to upgrade your main building.",
      },

      info:{
        notDemolishable:"Once built, this building cannot be demolished.",
        notBuyable:"Construction cannot be sped up by using golden frogs.",
        unlockJoinAlliance:"Unlocks the possibility of diplomacy and joining an alliance.",
        unlockCreateAlliance:"Unlocks the possibility to create an alliance.",
        unlockTrade:"Unlocks trading with other players.",
        unlockedArtifactInitiation: "Unlocks the initiation of artifacts.",
        unlockedAssignments: "Unlocks ordering of assignments.",
      },
      requirement:{
        none:"No",
        single:"single",
        greaterThan:"greater than",
        orGreater:"or greater",
      },
      error:{
        notEnoughBuildingSlots:"You cannot create any new buildings right now. You need to upgrade your main building to do this - either the chieftan's hut in the main settlement or the meeting place in a camp.",
        notEnoughCash:"You don't have enough Golden Frogs to carry out this action.",
      },
      
      gossip: {
        heading: "Gossip",
        advice: [
          "Rumors are, the most beautiful daisies can be found a few hundred yards south of the village.",
          "An old man who definitely had a few pints too much, tells listeners about the secrets of weather forecasting:\n\n'If the sky is tinted red in the evening, weather will be fine the next day.'\n\n'Except, of course, those days it'll be bad,' you add.",
          "A veteran fighter gives you a free advice about how to spend a free settlement point: 'Attack a fortress, win the battle and it will be yours to command.'",
          "If you want to know more details about the rules of the world, buildings, units or resources, have a look at the Encyclopedia.",
          "It's always good advice to choose an alliance that is close by and strong enough to help you against your foes.",
          "Never upset the local governor, except you plan to end his reign and want to take his fortress from him, of course."
        ],
        likeLeader: "{0} must be a lovely person. About {1} likes. Unbelievable!",
        resourceProductionLeader: {
          male:   "{0} is the king of {1}! He produces more than {2} per hour.",
          female: "{0} is the queen of {1}! She produces more than {2} per hour.",
        },
        mostMessagesSent: {
          male:   "{0} seems to be a very talkative person. Nobody sends more than {1} messages a day! Who should read all those letters?",
          female: "{0} seems to be a very talkative person. Nobody sends more than {1} messages a day! Who should read all those letters?",
        },
        mostUnits: {
          male:   "You better leave {0} alone. He's said to have {1} units at his command!",
          female: "Watch out for {0}. She's believed to have {1} units within her troops.",
        },
      }
    },

    error:{
      stringMissing:"(error: text missing!)",
      genericClientHeading:"Client Error",
      genericClientMessage:"An error occurred while trying to complete this action. Please contact support if the error persists after reloading.",
      genericServer:"This command was not accepted by the server.",
    },

    map:{
       regions: 'Regions',
      arriving: 'Arriving...',

      button:{
        attack:"Attack",
        newArmy:"New army",
        move:"Move",
        settle:"Settle",
        retreat:"Retreat",
        cancel:"Cancel",
        battleInfo:"Battle info",
        messages:"Messages",
        stance:"Stance",
        reinforce:"Reinforce",
        info:"Info",
        enter:"Enter",
        quests:"Quests",
        ranking:"Ranking",
        game:"Game",
        world:"World",
        strategic:"Strategy",
        terrain:"Terrain",
        encyclopedia:"Encyclopedia",
        shop:"Shop",
      },
    },

    alliance:{
      membershipHeader: "Alliance membership",
      memberOf:"You are currently a member of the alliance ",
      joinAllianceHeader: "Join alliance",
      joinAllianceButton: "Join alliance",
      joinAllianceButtonNew: "join",
      joinRandomAllianceButtonNew: "join",
      joinAllianceText:"Join an existing alliance by entering their alliance tag and the secret alliance slogan.",
      createAlliance:"Found alliance",
      createAllianceText:"Found a new alliance with yourself as the leader.",
      createAllianceButtonNew: 'set up',
      createAllianceFailedHead: 'Found alliance failed',
      redeemAllianceReservationHeader: "Alliance reservation",
      redeemAllianceReservationButton: "Redeem alliance reservation",
      redeemAllianceReservationText: "Redeem an alliance reservation from the last round. Enter the alliance tag and secret reservation password.",
      leaveAllianceFailedHead: 'Leave alliance failed',
      leave:"Leave",
      name: "Alliancename",
      tag: "Alliance Tag",
      password: "Password",

      founded:"Founded",
      leader:"Leader",
      leaderVote: 'Vote',
      description:"Description",
      changeDescriptionDialogCaption: 'Please enter your alliance description.',
      changeDescription: 'Edit description',
      missingDescription: 'Please enter your alliance description.',
      diplomacy: "Diplomacy",
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
      diplomacyFailedRelationAlreadyExists: 'Diplomacy Relation with this alliance already exists.',
      diplomacyFailedTargetAllianceNotFoundText: 'Konnte die angegebene Allianz nicht finden. Diplomatie Beziehung wurde nicht erstellt.',
      diplomacyRelationCreatePlaceholder: "Allianz",
      createDiplomacyRelationWithAllianceButton: "Ultimatum stellen",
      createDiplomacyRelationButton: "Erstellen",
      autoJoin: "Auto join",
      autoJoinDescription: "Automatically join",
      autoJoinActivated: "Activated",
      autoJoinDeactivated: "Deactivated",
      autoJoinFailedHead: "Failed",
      autoJoinFailedText: "Failed to change setting. Please contact an administrator if the problem persists.",
      allianceLeaderVoteFailedHead: 'Allianz Anführer Wahl',
      allianceLeaderVoteFailedText: 'Konnte Allianz Anführer Wahl nicht durchführen. Bitte wende dich an einen Administrator sollte das Problem weiterhin bestehen.',
      joinRandomAlliance: 'Join a random alliance',
      joinRandomAllianceDescription: 'Let the server find an alliance for you',
      joinRandomAllianceButtonLabel: 'Find alliance',
      joinRandomAllianceFailedHead: 'Join Alliance Failed',
      joinRandomAllianceFailedText: 'Could not join a random alliance. Please contact an administrator if the problem persists',
      joinAllianceNotAllowedText: 'Joining another alliance not allowed until {0}.',
      management:"Secret alliance slogan",
      reservation: 'Reservation for next round',
      reservationDescription: 'As the leader of an alliance, you can reserve your alliance for the next round. To redeem a reservation in the next round you willll need the alliance tag and password.',
      reservationDescriptionNew: 'Set a password.',
      reservationDescriptionChange: 'Change the password.',
      message:"Daily news",
      messageExplanation:"For members' eyes only!",
      members:"Members",
      shoutBox:"Shout Box",
      shoutBoxExplanation:"Everything entered here is immediately visible to all members",
      changePassword:'Save new password',
      saveReservation: 'Save reservation',
      kickMember:'Kick',
      report: 'Report',
      sendApplication: 'Submit application',
      bonus: 'Bonus',
      ofMax: 'of maximum',

      invitationLink: 'Invitation link',
      invitationLinkDescription: 'Invite new players to start in the alliance region. If new players register using the invitation link, his or her home settlement will be placed in the regions governed by the alliance. Just select and copy the link or send it via mail.',
      invitationLinkSendByMailButton: 'Send by mail',

      progress:{
        header:'Victory Progress',
        description:'An alliance can win the game round if one of the following victory criteria is achieved and maintained over a certain time period:',
        requiredRegions:'Required Regions',
        requiredArtifacts: 'Different Artifact types',
        requiredDuration:'Minimum Holding Period',
        remainingDays:'Remaining Days',
        criteriaFulfilled:'Fulfilled Criterion',
        criteriaHeld:'Hold Criterion',
        victoryAt:'Victory At',
        victoryAfter:'Victory After',
        won: "Winner",
        days:'Days',
      },

      error:{
        blankPassword:"You can't set a blank password.",
        failedToSetPassword:"The alliance password couldn't be set right now.",
        kickHeading:"Not Possible!",
        kickMessage:"You don't have permission to kick this member.",
        leaveFailedClient:"Client Error: Could not leave alliance.",
        leaveFailed:"Could not leave alliance",
        invalidTag:"Enter a valid alliance tag.",
        invalidPassword:"Enter the secret alliance slogan",
        tagNotTaken:"There is no alliance with the tag you entered.",
        wrongPassword:"Alliance tag and password do not match.",
        memberLimitReached:"The maximum number of alliance members has already been reached.",
        unkownJoin:"Your attempt to join the alliance was not successful.",
        enterValidTag:"Enter a valid alliance tag. This should be between 2 and 5 characters long. It must not contain any special characters.",
        enterValidName:"Enter a valid alliance name. This needs to be at least 2 characters long. ",
        tagTaken:"The tag you've chosen has already been taken by another alliance.",
        noPermissionCreate:"You're not allowed to create an alliance.",
        unknownCreate:"Your attempt to create an alliance was not successful.",
        changeDescriptionForbidden: "Only alliance leaders can change the description.",
        changeDescriptionConflict: "Could not change the description. It's too long.",
        changeDescriptionError: "Could not change the description.",
      },
      success: {
        passwordSet: "The password has been saved.",
        reservationSaved: "alliance reservation has been saved.",
       },
      confirmKick:{
        heading:"Confirm action",
        message1:"Do you realy want to kick ",
        message2:" out of the alliance?",
        cancel:"No",
        ok:"Kick!",
      },
      confirmLeave:{
        heading:"Leave Alliance",
        message:"Are you sure about leaving your alliance?",
        message2: " Attention! If you leave now you cannot join another alliance for the next {0} hours.",

      },
      confirmReport: {
        heading: "Melden bestätigen",
        message: "Willst Du wirklich die Allianz Beschreibung melden?",
        cancel: "Nein, doch nicht",
        ok: "Ja, wirklich.",
        success: "Meldung war erfolgreich",
        error: "Die Meldung wurde aus unbekanntem Grund nicht ausgeführt.",
      },
      confirmApplication: {
        heading: "Confirm application",
        message: "Do you really want to apply to this alliance?",
        cancel: "Not right now.",
        ok: "Yes.",
        success: "Application successful.",
        error: "Something went wrong with the application.",
      },
      confirmDiplomacyRelation: {
        heading: "Änderung der Diplomatie bestätigen",
        message: "Willst Du wirklich die Beziehung zwischen Deiner und dieser Allianz ändern?",
        cancel: "Nein, doch nicht",
        ok: "Ja, wirklich.",
      },
    },

    welcome:{
      heading:'Welcome to Wack-a-Doo!',
      headingWithName: 'Welcome to Wack-a-Doo,',
      headingPlan:'The Plan',
      image:AWE.Config.RAILS_ASSET_PATH + 'whatdoido_en_US.jpeg',
      headingSituation:'The Situation',
      formattedText:'<p>Being a <b>demigod</b> to a tiny tribe of stoneage caveman you\'ve just convinced your followers to leave their cave behind and to live in something modern called "a village". Unfortunately, the only thing their glorious chieftain let them build was a pompous hut for himself. Now, you should <b>build housing for some Hunter-Gatherers</b> ASAP.</p><p><b>Have fun!</p>',
    },

    shop:{
      button:'Shop',
      title:'Shop',
      currentCreditAmount:'Your credit is currently',
      credit:'Credit',
      credits:'Credits',
      platinumCredits:'5D platinum credits',
      for:'for',
      updateCredits:'Update',
      buyCredits:'Buy now',
      buyCreditsThroughFacebook:'Buy credits through FB',
      article:'Article',
      description:'Description',
      price:'Price',
      activating:'Sending',
      buy:'Acitvate',
      buy2:'Buy',
      action:'Action',
      extend:'Extend',
      resourceOffers:'Golden Frog offers',
      platinumFunction:'Platinum function',
      platinumOffers:'Platinum account',
      specialOffer: "Starter package",
      bonusOffers:"Bonus Packages",
      production:'Production',
      duration:'Duration',
      expiry:'Expiry',
      platinumDescription:"Having a Platinum Account offers you the chance to enjoy stress-free construction with additional places in your building queue (+3) and your training queue (+3) as well as email notifications when you're under attack. More functions will also be coming soon. ",
      frog_trade: 'Travelling Merchant: instant resource trade',
      lifetime: 'Lifetime',

      current:"Current",
      platinumCredit:"platinum credits",
      offers:"Offers",
      loading:"Loading Shop",
      unreachable:"Shop temporarily unavailable!",

      goldenFrog:"Golden Frog",
      goldenFrogs:"Golden Frogs",

      frog:"Frog",
      frogs:"Frogs",

      bonusOfferDescription: "Exclusive for you!",

      notenoughcredits:{
        getCredits:'Get credits',
        title:'Not enough credits',
        message:"Unfortunately you don't have enough credits to do that. Visit the credit shop to buy more 5D platinum credits.",
      },
      notenoughgoldenfrogs: {
        getGoldenFrogs: 'Get Golden Frogs',
        title:'Not enough golden frogs',
        message:"Unfortunately you don't have enough golden frogs to do that. Just buy some.",
      },
      error:{
        heading:"Server Error",
        message:"There's a problem with the Shop. Please try again later.",
      },
      buyConfirmation:{
        cashHeader:"Perfect!",
        cashMessage:"Congratulations! You've just got yourself a bunch of fresh golden frogs Spend them wisely so your clan can live long and prosper.",
        platinumAccountHeader:"Yeaha!",
        platinumAccountMessage:"Your character has been credited with a Platinum Account. Platinum features will be available immediately.",
        bonusHeader:"Yeaha!",
        bonusMessage:"The bonus effect has been unlocked and will help your clan to prosper.",
        specialHeader:"Perfect!",
        specialMessage:"Congratulations! The special offer items have been credited to your account.",
      },

      fbPaymentSuccess: {
        header: "Credits booked",
        message: "Your character has been credited with desired credit amount.",
      },

      fbPaymentBytroError: {
        header: "Booking failure",
        message: 'The Credits could not be credited to your account. Please contact support!',
      },

      fbPaymentError: {
        header: "Booking failure",
        message: 'The Transaction could not be Started due to a Facebook error.',
      },

    },

    settlement:{

      population:'Population',
      defenseBonus:'Combat Bonus',
      max:'max',
      condition:'Condition',
      founded:'Founded',
      
      customization: {
        chooseName: "Choose your name",
        changeName: "Change your name",
        chooseNameCaption: 'Name your settlement',
        changeNameCaption: 'Change the name of your settlement',
        nameChangeAdvice: 'The first name change is free. Any additional changes will cost you a few golden frogs.',

        changeNameDialogCaption: "Enter your new name.",

        errors: {
          nameTooShort: "That's way too short! A name must have at least 3 characters. ",
          nameTooLong: "That's way too long! A name can have a maximum of 16 characters.",
          nameNoChange: "That's the same name as before…",

          nameTaken: "This name is already in use or on the black list. Please, choose another one.",
          changeNameCost: "You don't have enough golden frogs to change your settlement's name right now. Get some more? ",
          changeNameError: "The name could not be changed for some reason. Please try again later.",
        },
      },

      invitationLink:{
        header:"Invatation link",
        text:"Invite your friends to play alongside you. If they register using the following link, they start in this region and pay taxes to you right from the start. ",
        send:"Send per email",
        mailSubject:"Invitation to Wack-A-Doo",
        mailBody:"Play Wack-A-Doo now: ",
      },

      abandon: {
        abandon: "abandon",
        header: "Abandon Camp",
        text: "If you are short of settlement points you can abandon your camp. The Neanderthals will take possession and other players can occupy the camp.",
        send: "Abandon Camp!",
        fighting: "You can't abandon this camp because the garrison army is still fighting.",
      },

      buildings:{

        category:'Category',
        level:'Level',
        Level:'Level',

        details:{
          enables:'Enables',
          speedup:'Speeds up',
          noUpgrade:'No further upgrades possible.',
        },

        select:{
          heading:'Select building',
          missingRequirements:'This can not be built at the moment due to the following: <span class="red-color">unmet prerequisits</span>',
        },

        tooltip:{
          costOfNextLevel:'Cost of',
          noUpgrade:'No upgrade possible.',
          clickToEnter:'Click to enter building.',
          upgradePossible:'This building could be upgraded:',
          empty:{
            heading:'Empty lot',
            small: 'Small lot',
            large: 'Large lot',
            categoriesStart:'You can build ',
            categoriesEnd:' here.',
            maxLevel:'Maximum level',
            advise:'Click to build a new building.'
          },
        },
        missingReqWarning:{
          start:"Hey! You can't build a",
          end:"here right now. The following conditions haven't been met: ",
          cancelText:['Aargh!', 'Grmpf!', 'Hgnnhgn.', 'Oh well.'],
        },
        constructionQueueFull:{
          start:"Sorry, but your construction queue is currently full. You can only have a maximum of ",
          end:" construction orders in the queue. Please wait until something else is finished.",
        },
        constructionQueueNotEmpty:{
          msg:"Dude! You can't queue this job when there are other jobs queued for this slot. ",
        },
      },
      construction:{
        hurry:"Hurry!",
        cashTooltip:"Use some of your Golden Frogs to finish this job instantly. The cost will depend on how much building time there is remaining.",
        frogTradeTooltip: "Use two Golden Frogs to reallocate your resources if you want to start the construction right away.",
        cancelTooltip: "Cancel the current construction.",
        insufficentResources:"Insufficient resources",
        finishing:"finishing",
        beingBuilt:"Building is being constructed.",
        waitingToBeBuilt:"This job is in the queue, waiting to be built. ",
        cannotBeBuilt:"This cannot be built right now. Construction will be started automatically when the necessary building lots or resources become available.",
        requiredResources: 'Costs',
        remaining: 'Missing',
        actionTitle: 'Action information',
      },
      training:{
        perUnit:"Per unit",
        duration:"Duration",
        total:"Total",
        recruit:"Recruit ",
        nextUnit:"Next Unit",
        all:"All",
        hurryTooltip:"Use some of your Golden Frogs to train your units twice as fast. The cost will depend on how much training time is left. ",
        hurryIndicator:"x2",

        queueFull:{
          start:"Sorry, but the training queue is full right now. You can only have a maximum of",
          end:" assignments in the queue. Please wait until something else is finished.",
        },
        hurry:"halve",
      },

      military:{
        yes: "Yes",
        no: "No",
        takeOverTitle: "Takeoverable",
        takeOver:"This settlement can be stolen by other players.",
        noTakeOver:"This settlement cannot be taken over!",
        destroyableTitle: "Destroyable",
        destroyable:"This settlement can be destroyed by other players.",
        notDestroyable:"This settlement cannot be destroyed!",
      },

      trade:{
        trade: "Trade",
        distrEvently: "Entering 0 in all fields distributes them evenly",
        resourceTradeInfo: "You can redistribute your resources for 2 golden frogs. This does not change your total Resource amount, just the distribution among the 3 types.",

        update: "Update",
        submit: "Submit",
        sendResources:"Send resources",
        cartsEnRoute:"Trading carts en route",
        recipient:"Recipient",
        send:"Send",
        enRoute:"En route",
        carts:"Carts",
        timeOfArrival:"Time of arrival",
        inbound:"Inbound",
        outbound: "Outbound",
        sending:"Sending",
        empty:"empty",
        cargo:"cargo",
        returnTo:"returning to",
        returnFrom:"returning from",
        origin:"Origin",
        destination:"Destination",
        amount:"amount",
        hurry: "Hurry!",
        hurryTooltip: "You can reduce the transportation time by thirty minutes if you use some of your Golden Frogs.",
        hurryTooltipHurried: "Use some Golden Frogs to finish the transportation right away.",
        noCartsInTransit: "No carts in transit.",

        frogTradeHeader: "Traveling Merchant",
        frogTradeDescription: "He's always happy to serve! The Traveling Merchant will gladly help you to swap some of your resources. For a small fee, of course. ",
        frogTradeButton: "Trade",

        error:{
          recipientUnknown:"Your workers are far too lazy to send the resources themselves. ",
          recipientSelf:"Recipient unknown.",
        },
      },

      found: {
        confirmationHeader:"Found an encampment here?",
        confirmationFlavour:"This looks like a nice place.",
        confirmationText:"The encampment will be founded here and you won't be able to move it once it's been established. Doing this will also use one of your settlement points. A Little Chief from your army will stay permanently at this encampment and will no longer be available for use elsewhere.",
        confirmation:"Found an Encampment Here",
        errorHeader:"This Encampment cannot be founded.",
        errorFlavour:"Grmpf.",
        errorText:"Encampments can only be founded in empty locations and in regions in which you don't already have an encampment or a home settlement.",
        requirements:{
          text:"The following requirements must also be met:",
          req1:"You have an unused settlement point.",
          req2:"There is a Little Chief in your army.",
          req3:"Your army has at least one action point.",
        },
      },

      artifact: {
        costs: "Costs",
        duration: "Duration",
        start: "Start",
        initiate: "Initiate",
        initiated: "Initiated",
        owner: "Owner",
        location: "Location",
        captured_at: "Captured",
        initiated_at: "Initiated",
        notEnoughResources: {
          header: "Hold!",
          content: "You don't have sufficient resources to initiate that artifact.",
        },
        cancelText: "Boring.",
        characterBoni: "Bonus for the owner",
        allianceBoni: "Bonus for the Alliance members",
        characterProductionBonus: "Production bonus for the owner",
        allianceProductionBonus: "Production bonus for the Alliance members",
        characterConstructionBonus: "Construction speed bonus for the owner",
        allianceConstructionBonus: "Construction speed bonus for the Alliance members",
        hurry: "Halve",
        hurrying: "Hurry",
        hurried: "Hurried",
        hurryTooltip: "You can halve the initiation time by using Golden Frogs. The costs depends on how much initiation time remains.",
        hurryIndicator: "x2",
      },

      assignment: {
        assignments: "Assignments",
        specialAssignments: "Special Assignments",
        duration: "Duration",
        unitDeposits: "Required Units",
        costs: "Costs",
        rewards: "Rewards",
        start: "Start",
        hurry: "Hurry!",
        hurried: "hurried",
        finishing: "Finishing...",
        noneAvailable: "There are no assignments currently available.",
        noneSpecialAvailable: "There is no special assignment currently available.",
        cancelText: "Ok",
        error: {
          conflict: {
            header: "Error!",
            content: "The assignment has already started. Wait until it's finished.",
          },
          prerequisites: {
            header: "Stop!",
            text: "You don't have sufficient resources or armies to start the assignment.",
            content: {
              resource_wood: "You don't have sufficient wood to start the assignment.",
              resource_stone: "You don't have sufficient stone to start the assignment.",
              resource_fur: "You don't have sufficient fur to start the assignment.",
              resource_cash: "You don't have sufficient toads to start the assignment.",
              armies: "You don't have sufficient units to start the assignment.",
            }  
          }
        }
      },

      info:{
        clickToExpand:"Click to expand",
        clickToMinimize:"Click to minimize",
        combatBonus:"Combat bonus for all armies fighting on this side of the settlement.",
        combatBonusInfo:"If the settlement is involved in a fight, the combat bonus will influence the defense value of all units that are fighting on this side of the settlement, no matter whether they are inside or outside the walls.",
        combatBonusAbbreviation:"CB",
        recruitmentspeed: 'Recruitmentspeed',
        buildingSpeed:"Building speed",
        buildingSpeedAbbreviation:"B",
        meleeTrainingSpeed:"Training speed of melee units",
        meleeTrainingSpeedAbbreviation:"M",
        rangedTrainingSpeed:"Training speed of ranged units",
        rangedTrainingSpeedAbbreviation:"R",
        ridersTrainingSpeed:"Training speed of mounted units",
        ridersTrainingSpeedAbbreviation:"C",
        commandPointsInfo:"Used command points / available command points. Each army needs one command point.",
        commandPointsHelp:"Each command point lets you put one army from this settlement in the field. The garrison army is an exception and does not need a command point.",
        buildings:"Buildings",
        changeName:"Change name",
        availableBuildingSlots:"Available building lots",
        speedUpInfo:"You can improve the speed with which you can produce units and buildings by upgrading the respective buildings.",
        taxRate:"Tax rate",
        taxRateChangeInfo:"The tax rate you set here applies to the entire region and all of its inhabitants.",
        taxRateChangeNotPossible:"You can make a further change one hour after the last change has been made. ",
        taxRateHelp:"The tax rate is set by the owner of the fortress in the region. The minimum is 5% and the maximum is 15%. Think that's unfair? Team up with the other players in the region and get rid of your oppressor. He had it coming. Take over the fortress and collect the taxes yourself.",
        change:"change",
        resourceProduction:"Resource production",
        bonus:"Bonus",
        tax:"Tax",
        result:"Result",
        resourceProductionInfo1:"Taxes are only raised on the base building production. Bonus production is calculated on top of the untaxed base production and there are",
        resourceProductionInfo2:"no",
        resourceProductionInfo3:"taxes currently being raised on the bonus production.",
        setTaxRate:"Enter the new tax rate (5%-15%).",
        artifact: "Artifact",
        movingPassword: "Movement password",
        move: "Move",
        productions: "Productions"
      },
      error:{
        serverDidNotAcceptTaxRate:"The server did not accept the tax rate change.",
        couldNotChangeTaxRate:"Enter a number between 5 and 15.",
        couldNotChangeTaxRateHead: "Failed to Change Tax"
      },
    },

    profile:{
      youAre:"You are",
      playingSince:"You've been playing since",
      totalPopulation:"Total population",
      experience:"Experience",
      fortresses:"Fortresses",
      homeSettlement:"Home settlement",
      sendMessage:"Send message",

      battles:"Battles",
      victories:"Victories",
      defeats:"Defeats",

      history:"History",
      emptyHistory:"No events available",

      progressTab:"Progress",
      customizationTab:"Customization",
      optionsTab:"Options",
      movingTab: "Moving",

      rank:{
        currentRank:"Current Rank",
        nextRank:"Next Rank",
        currentLevel:"Current Level",
        nextLevel:"Next Level",
        progressBar:"Progress",
        start:"Start",
        experience:"Experience",
        experienceAbbreviation:"XP",
        settlementPoint:"Settlement point",
        mundaneRank:"Mundane rank",
        sacredRank:"Sacred rank",
        noRankUpPossible:"No advancement possible at this time.",
        info:"Advancing your mundane rank will give you more settlement points.",
        experienceInfo:"You can acquire more experience by building and fighting.",
        settlementPoints:"Settlement points",
        notUsed:"Unused",
        total:"Total",

        progress:{
          dialogHeader:"Rank up!",
          flavour1:"You just achieved a new rank and can call yourself",
          flavour2:"from now on.",
          flavour3:"Keep on like this and you'll reach the rank of ",
          flavour4:"in no time.",
          text:"You've now done enough fighting and building to acquire the experience necessary to advance your rank. This will raise your reputation with your fellow players. They're probably getting jealous already! You also need a higher rank to control more fortresses and encampments.",
        },
      },

      time:{
        systemTime:"System time",
        approxServerTime:"Approximated server time",
        localTime:"Local system time",
        deviation:"Deviation",
        lagZero:"Perfect!",
        lagTolerable:"This deviation is tolerable.",
        lagUntolerable1:"Please set your system clock to the correct time.",
        lagUntolerable2:"Otherwise, enable automatic internet time synchronization if your operation system provides this feature. Your responsiveness and your user experience would both improve significantly. ",
      },
      
      settings: {
        connectToFacebookHeading: 'Go Social!',
        youAreConnectedToFacebook: "You're already connected with Facebook and ready to play Wack-A-Doo in Facebook: <a href='https://apps.facebook.com/wack-a-doo' target='_blank'>https://apps.facebook.com/wack-a-doo</a>.<br/>Got a wrong connection? Please contact support (support@5dlab.com).",
        connectToFacebookAdvice: "Connect your character with your facebook account, play Wack-A-Doo inside facebook and make use of it's social features!",
        connectToFacebook: 'Connect to Facebook',
        fbUserIdAlreadyInUse: 'This facebook account is already connected to another character.',
        characterAlreadyConnected: 'Your character is already connected to facebook.',
        connectionDidFail: "Sorry, this didn't work out as expected.",
      },

      customization:{
        changeAvatar: 'Change avatar',
        presentAvatar: 'Current avatar',
        changeAvatarCaption: 'Change avatar',
        changeAvatarAdvice: 'Tired of your avatar? Shuffle it!',
        changeAvatarButton: 'Shuffle',
        changeAvatarDialogCaption: 'Your new avatar',
        info: "Change your Demigodly appearance here. Right now you can choose the name and gender that you want to show for you in game. Additional customization possibilities will be added later.",
        chooseName:"Choose your name",
        changeName:"Change your name",
        presentName:"Current name",
        chooseNameCaption:'Choose name',
        changeNameCaption:'Change name',
        changeDescriptionCaption: 'Change description',
        nameChangeAdvice:'Choose your name carefully! Ideally it should fit in with the Stone Age environment. Your name must also be unique in Wack-a-Doo.',
        nameChangeFreeAdvice:'You have two free chances to change your name, after which each name change will cost a couple of Golden Frogs. This is to prevent misuse. ',
        nameChangeCostAdvice:"You've already changed your name twice! You can change it again, but to prevent misuse doing so will cost you 20 Golden Frogs.",
        chooseGender:"Choose your gender",
        changeGender:"Change your gender",
        presentGender:"Current gender",
        chooseGenderCaption:'Choose gender',
        changeGenderCaption:'Change gender',
        genderChangeFreeAdvice:'The first two gender changes are free, after which each new change will cost you a couple of Golden Frogs. This is to prevent misuse.',
        genderChangeCostAdvice:'You have already changed your gender setting twice! You can change it again, but to prevent misuse doing so will cost you 20 Golden Frogs.',
        male:"Male",
        female:"Female",
        customEyes:'Eyes',
        customMouth: 'Mouth',
        customHair: 'Hair',
        customBeard: 'Beard',
        customChains: 'Chains',
        customTattoos: 'Tattoos',
        customSymbols: 'Symbols',
        customToads: 'Toads',

        changePasswordCaption:"Change Password",
        changePasswordAdvice:"You can change your password here. The password must be between 6 and 40 characters long.",
        changePasswordButton:"Change Password",
        changePasswordChanged:"Password changed",

        changeNameDialogCaption:"Enter your character's new name.",

        changeSameIPCaption:"Several players are currently using this IP address",
        changeSameIPAdvice:'If you are playing Wack-a-Doo with multiple players using the same IP address, enter the player names here, separated by a comma. More information can be found here: <a href="http://wiki.wack-a-doo.de/x/index.php?title=Mehrere_Spieler_unter_derselben_IP-Adresse&action=edit&redlink=1" target="_blank">Wiki</a>',
        changeSameIPButton:"Change the List",
        changeSameIIPChanged:"List has been saved.",

        description: 'Character description',
        changeDescriptionDialogCaption: 'Please enter your character description.',
        changeDescription: 'Edit description',
        missingDescription: 'Please enter your character description.',
        report: 'Report',

        confirmReport: {
          heading: "Melden bestätigen",
          message: "Do you really want to report this character description?",
          cancel: "Not right now",
          ok: "Yes.",
          success: "Report successful",
          error: "Something went wrong with the report.",
        },

        errors:{
          nameTooShort:"This is way too short! A name has to have at least 3 characters.",
          nameTooLong:"This is way too long! A name can only have a maximum of 12 characters.",
          nameNoChange:"That's the same name as before…",

          nameTaken:"This name is already in use or has been blacklisted. Please choose another name.",
          changeNameCost:"You don't have enough Golden Frogs to change your name.",
          changeNameError:"Your name could not be changed. Please try again later. ",
          changeGenderCost:"You don't have enough Golden Frogs to change your gender.",
          changeGenderError:"Your gender could not be changed. Please try again later.",

          changePasswordInvalid:"This password doesn't meet the Wack-a-Doo requirements. Please choose another password.",
          changePasswordUnknown:"Your password could not be changed right now. Please try again later.",
          changePasswordNoMatch:"The two passwords you've entered don't match. Please try again.",
          
          changeDescriptionError: "Die Character Beschreibung konnte aus unbekanntem Grund nicht geändert werden.",

          changeSameIIUnknown: "The list can't be changed right now. Please try again later.",

          changeFailed: {
            heading: 'Avatar failed to save',
            text: 'Something went wrong. It is highly likely a little gnome cut your connection. Whatever the reason, your new avatar could not be saved right now. ',
          },
        },
      },
      
      moving: {
        info1: "You can move with your home settlement into another region.",
        info2: "You can not move into a region that is in battle or a region with an owner change in the last 12 hours.",
        specificMovingCaption: "Selective Moving",
        alreadyMoved: "You already moved to another place.",
        presentRegion: "Current region",
        enterSpecificRegion: "Enter the name of the region",
        specififcRegionAdvice: "You have to enter the name of the region you want to move to. If this region is controlled by another alliance, you have to enter a password.",
        moveButton: "Move",
        movingPasswordCaption: "Please enter move password.",
				confirmation: {
					caption: "Confirm move.",
					message1: "Do you really want to move to ",
					message2: " ?",
					cancel: "No, not right now",
					ok: "Move!",
				},
				movingErrorHeading: "Error",
        movingNoTargetFoundHeading: "Region not found",
        movingNoTargetFoundMessage: "There seems to be no region with this name. Did you spelled the name correctly?",
        movingNotFoundMessage: "There is already one of your settlements in the target region!",
        movingForbiddenMessage: "The password is wrong. Try again!",
        movingConflictMessage: "The fortress in the target region is in a fight or was just captured!",
        movingError: "Something went wrong. Please try again later.",
      },
    },

    tutorial:{
      questList:"Your current quests",
      name:"Quest Name",
      status:"Status",
      new:"New",
      open:"open",
      finished:"Finished",
      reward:"Reward",
      rewardLink:"Claim",
      redeemNow:"Claim reward now",
      redeemLater:"Claim reward later",
      showQuestLink:"Show",
      answerQuestLink:"Answer",
      correctAnswered:"Correct!",

      task:{
        info:{
          header:"Tutorial task (open)",
        },
        start:{
          header:"New tutorial task",
        },
        end:{
          header:"Tutorial taks (finished)",
        },
      },

      quest:{
        info:{
          header:"Current Quest",
        },
        start:{
          header:"New quest started",
          task:"Your task",
        },
        end:{
          header:"Quest successfully accomplished",
          bonus:"You get the following bonuses",
          resources:"Resources",
          units:"Units",
          task:"Quest successful",
        },

        redeemError:{
          header:"Warning",
          message:"You can't redeem this quest right now because you don’t have enough space for your reward. Try again later!",
        },

        error:"Oops - that's not right. Bad luck! Try again later.",
      },

      questStart:{
        header:"New Quest started",
      },
      questEnd:{
        header:"Success - Quest completed.",
      },

      end:{
        header:"Success - you've completed the tutorial. ",
        p1:"Congratulations Demigod. You've taken the first steps on your journey to greatness! You've successfully worked through the tutorial and you now know the basics of Wack-A-Doo.",
        p2:"As a reward, we've unlocked the Platinum Account for you for the next few days. You can find details of this in the Bonanza, which is accessible on the upper right menu. ",
        p3:"We will watch your further development and will provide a series of optional tasks for you to complete. Accomplish these tasks whenever you like. Or don't. ",
        p4:"Don't let the number of open tasks bother you. Just improve your home settlement, recruit units and armies and increase your power and influence.",
        p5:"There is no single valid strategy that will guarantee a smooth ride ahead. There's just one rule to remember: resources, resources, resources. A powerful army wins a battle, but a flourishing economy wins the war. ",
        p6:"Have fun and whack on!",
        redeemError:{
          header:"Attention",
          message:"These rewards could not be released because they've already been unlocked.",
        },

      },

    },

    messaging:{
      inbox:"Inbox",
      outbox:"Outbox",
      archive:"Archive",
      unknownRecipient:"Unknown Recipient",
      allianceMail:"Alliance message",
      subject:"Subject",
      send:"Send",
      cancel:"Cancel",
      newMessage:"New message",
      to:"To",
      toHeader:"to",
      toAlliance:"To all Alliance members",
      unknown:"Unknown",
      allMembersOf:"All members of",
      recipient:"Recipient",
      date:"Date",
      allAllianceMembers:"All Alliance members",
      allPlayers:"All Players",
      new:"New",
      reply:"Reply",
      forward:"Forward",
      delete:"Delete",
      archiving: "Archiving",
      newAllianceMail:"New Alliance mail",
      noMessageSelected:"No message selected.",
      from:"From",
      yourMessage:"Your message",
      system: "System",
    },

    encyclopedia:{
      encyclopedia: 'Encyclopedia',
      selectCategory: 'Select a category and a topic, please.',
      productionTime:"Training time",
      hitpoints:"Hitpoints",
      attack:"Attack",
      defense:"Defense",
      criticalDamage:"Critical Damage",
      criticalChance:"chance",
      cannotBeTrained:"Cannot be trained by players.",
      experienceForLostUnits: "XP per lost unit",
      experienceFactor: "XP factor",

      attackAbbreviation: "Att",
      defenseAbbreviation: "Def",
      hitpointsAbbreviation: "HP",
      criticalDamageAbbreviation: "Crit",
      garrison: "Garrison",
      infantry: "Infantry",
      artillery: "Artillery",
      cavalery: "Cavalery",
      specialUnits: "Special Units",
      military: "Military",

      commandPointsAbbreviation:"CP",
      buildingTime:"Build time",

      smallBuilding: 'Requires small or large building slot',
      largeBuilding: 'Requires large building slot',
      specialBuilding: 'Requires small building slot',
      fortressBuilding: 'Only in fortresses',

      resources:"Resources",
      buildings:"Buildings",
      units:"Units",

      resource:{
        taxable:"This resource is being taxed.",
        notTaxable1:"There are ",
        notTaxable2:"no",
        notTaxable3:" taxes on this resource.",
        stealable:"This resource can be stolen or traded.",
        notStealable:"This resource cannot be stolen or traded.",
      },
    },

    resource:{
      productionInfo:{
        header: "Resource production in your empire",
        amount: "Amount",
        bonus: "Bonus",
        productionRate: "Production rate",
        production: "Production",
        dailyProduction: "Daily production",
        capacity: "Storage capacity",
        capacityReachedIn: "Capacity reached in",
        characterEffects: "Player Bonuses",
        allianceEffects: "Alliance Bonuses",
        effects: "Effects",
        baseProduction: "Base production",
        full: "Full",

        help1:"Resources are produced by",
        help2:"in your home settlement and encampement or collected by fortresses as",
        help3:". This overview shows effects that effect the",
        help4:" of buildings in your whole empire. These can for example be improved in the",
        help5:".",
      },
      productionTooltip:{
        base:"Base",
        science:"Science",
        buildings:"Buildings",
        bonus:"Bonus",
        tax:"Tax",
      },
      exchange: {
        header:   "Traveling Merchant",
        advert:   "Don't like how your resources are distributed? The traveling merchant can help you! ",
        info:     "For a small fee the merchant can help you to redistribute your resources.",
        warning:  "You can either configure the amount of all three resources or only one or two of them. The remaining resources will be distributed evenly.",
        fee:      "Each trade costs",
        fee2:     " Golden Frogs.",
        loading:  "Loading resources",
        loading2: "Exchanging",
        sum:      "Sum",
        remaining:"Remaining",
        fill:     "Fill",

        form: {
          exchange: "Exchange",
          reset:    "Reset",
        },

        errors: {
          noinput: {
            heading: "No amount entered",
            text:    "You didn't enter an amount. No wonder it didnt work.",
          },

          toomuch: {
            heading: "You allocated too many resources! ",
            text:    "You allocated more resources than you can store right now.",
            stone:   "You allocated more stone than you can store right now.",
            wood:    "You allocated more wood than you can store right now.",
            fur:     "You allocated more fur than you can store right now.",
          },

          noFrogs: {
            heading: "You are broke!",
            text:    "You don't have enough golden frogs. Go and get some new in the bonanza.",
          },

          failed: {
            heading: "Exchange failed.",
            text:    "This exchange has failed. Please try again or contact an administrator.",
          },
        },
      },
    },
    
    effects: {
      effects: "Bonuses",
      type0: "Shop",
      type1: "Artifact",
      characterEffectsNotAvailable: "No player bonuses",
      allianceEffectsNotAvailable: "No alliance bonuses.",
    },

    likesystem:{
      notEnoughLikeAmount:"You don't have enough Likes available to like this player.",
      notEnoughDislikeAmount:"You don't have enough Dislikes available to dislike this player.",
      cancelText:['Aargh!', 'Grmpf!', 'Hgnnhgn.', 'Oh well.'],
      alreadyLikedInfo:"You've already rated this player during the last 24 hours.",
      likesAvailable: "Likes available",
      dislikesAvailable: "Dislikes available",
      info: "There are a limited amount of Likes and Dislikes available. More will regenerate after use.",
    },

    ranking: {
      header: "Ranking",
      characters: "Player",
      alliance:  "Alliance",
      alliances:  "Alliances",
      noAlliances:  "There are no Alliances yet.",
      fortress: "Fortress",
      fortresses: "Fortresses",
      victoryProgress: "Victory progress",
      rank: 'Rank',
      character: 'Player',
      owner: 'Owner',
      overallScore: 'Population',
      resourceScore: 'Resources',
      likes: 'Likes',
      victories: 'Victories',
      victoryRatio: 'Victory ratio',
      beatenUnits: 'Def. units',
      experiencedArmy: 'Army XP',
      numFortresses: 'Fortresses',
      numMembers: 'Member',
      perMember: 'p. Memb.',
      regionsPerMember: 'p. Memb.',
      taxRate: 'Tax Rate',
      income: 'Resource Rate',
      defenseBonus: 'Battle Bonus',
      name: "Name",
      type: "Type",
      region: "Region",
      artifact: "Artifact",
      artifacts: "Artifacts",
      noArtifacts:  "No Artifacts have been found yet.",
      captured: "Conquered",
      initiated: "Initiated",
      nextPage: "Next page",
      previousPage: "Previous page",
    },

    menu: {
      manual: "Manual",
      logout: "Log out",
      header: "Menu",
      reload: "Reload",
    },

    dialogs:{
      assignments: {
        quests: "Quests",
        special_quests: "Special Quests",
        gossip: "Gossip"
      },
      alliance: {
        alliance: "Alliance",
        info: "Info",
        members: "Members",
        diplomacy: "Diplomacy",
        apply: "Apply",

        allianceInfo: {
          slogan: "Slogan",
          autoJoin: "AutoJoin"
        },
        allianceMembers: {
          leader: "Leader",
          members: "Members",
        },
        allianceDiplomacy: {
          placeHolder: "Insert Tag",
          issueUltimatum: "Issue ultimatum",
          ultimatum: "Ultimatum",
          war: "War",
          capitulation: "Capitulation",
          end: "End",
        },
      },
      move:{
        heading: "Move",
        description: "This explains how to move.",
        to: "move to"
      },
      upgrade:{
        heading: "Building Upgrade",
        upgrade: "Upgrade",
        level: "Level",
      },
      convert:{
        heading: "Building Convert",
        convert: "Convert",
        level: "Level",
      }
    },
  };
  
  return module;
  
}(AWE.I18n.en_US || {});

