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

      demigod:'Demi-god',
      demigoddess:"Demi-goddess",
      
      neanderthal: "Neanderthal",

      playerName:"player name",
      name:"name",
      password:"password",
      passwordConfirmation:"password confirmation",

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
          unknown:"Oops – something's gone wrong. The action wasn't accepted.",
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
        faction1:"faction 1",
        faction2:"faction 2",
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
          armyDisbandedDescription:"This happens when a home settlement is lost to an army",
        },
      },
      messages:{
        own:{
          winning:[
            "Yay! Let's mow 'em down!"
          ],
          losing:[
            "Do something – our army is going down the tube!"
          ],
          neutral:[
            "Go on, whack it – nothing will happen!"
          ],
        },
        other:"You don't really want to get involved, do you?",
      },
    },

    army:{
      newArmy:"New Army",

      details:{
        heading:'army',
        units:'units',
        npcMsg:"This motley crew of an army has no leader so it's a good target for your army to gain experience and improve their fighting skills.",
        properties:'properties',
        strength:{
          strengths:'strengths',
          melee:'strength melee',
          riders:'strength riders',
          distance:'strength ranged',
          all:'overall strength',
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
        rankDescription:"A higher rank makes your troops  more effective. The army has to gain experience to achieve a higher rank.",
        rankUpAt:"Rank up at",
        experience:"experience",
        experienceDescription:"You gain experience, your own troops die, it's not to kill enemies.The reason: you only learn from your mistakes.",
        stance:"Assist defence of fortress or settlement if attacked",
        demigod:"Demi-god",
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
            "My dad always used to say: never do today what you can put off till tomorrow!",
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
            "My Demigod, haven't you got anyone else to order about?",
            "Today is a good day for picking flowers.",
            "How about a dinosaur hunt, just for a change?",
            "Why's it always me who has to go?",
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
            "Under my leadership we won't lose any battles. You'll see!",
            "Attack is the best form of defence."
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
            "Listen, your country will soon belong to us!"
          ],
        },
      },
      form:{
        available:"Available units",
        new:"New army",
        name:"Name of the army",
        advisorHint:'How many units should join the new army? Enter the number below "new army" and press "create".',
        all:"All",
        reset:"Reset",
        change:"Change",
        create:"Create",
        changeNameHeading:"Enter the new name of this army.",
        errors:{
          garrison:"The garrison army is too full",
          garrisonFighting:"While the garrison is fighting you cannot create another army.",
          other:"The army is too full",
          new:"The new army is too full",
          message:"Reduce it by the number of units that will take it below the limit!",
        },
      },
      create:{
        header:"Create a new army",
        remainingArmies:"The number of remaining command points for this settlement",
        error:"No more command points available in this settlement",
        loadingMessage:"Creating an Army...",
      },
      change:{
        header:"Change army units",
        loadingMessage:"Changing army...",
      },
    },

    building:{
      level:"Level",
      cost:"Cost",
      duration:"Duration",
      produces:"Produces",
      capacity:"Storage capacity",
      productionBoni:"Production bonus",
      tradingCarts:"Trading carts",
      commandPoints:"Command points",
      garrison:"Garrison army",
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
        demolishBuilding:"demolish building",
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
        levelAfterUpgrade:"level after finishing all upgrades already in the queue",
        levelAfterDowngrade:"level after finishing all downgrades already in the queue",
        levelAfterConversion:"level after finishing the conversion already in the queue",
        notEnoughBuildingSlots:"You cannot build more buildings right now. You need to upgrade your main building.",
      },

      info:{
        notDemolishable:"Once built, this building cannot be demolished.",
        notBuyable:"Construction cannot be sped up by using golden frogs.",
        unlockJoinAlliance:"Unlocks diplomacy and joining an alliance.",
        unlockCreateAlliance:"Unlocks creating an alliance.",
        unlockTrade:"Unlocks trading with other players.",
        unlockedArtifactInitiation: "Unlocks initiation of artifacts."
      },
      requirement:{
        none:"No",
        single:"single",
        greaterThan:"greater than",
        orGreater:"or greater",
      },
      error:{
        notEnoughBuildingSlots:"You cannot build more buildings right now. You need to upgrade your main building (chieftain's hut in main settlement, meeting place in camp).",
        notEnoughCash:"You don't have enough golden frogs for this action.",
      },
    },

    error:{
      stringMissing:"(error: text missing!)",
      genericClientHeading:"Client Error",
      genericClientMessage:"An error occured while trying to complete your action. Please contac support if the error persists after reloading.",
      genericServer:"The server did not accept the command.",
    },

    map:{
         regions: 'Regions',
      
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
        encyclopedia:"Encyclopaedia",
        shop:"Shop",
      },
    },

    alliance:{
      membershipHeader: "Alliancemembership",
      memberOf:"You are currently a member of the alliance ",
      joinAllianceHeader: "Join alliance",
      joinAllianceButton: "join alliance",
      joinAllianceText:"Join an existing alliance by entering their alliance tag and the secret alliance slogan.",
      createAlliance:"found alliance",
      createAllianceText:"Found a new alliance with yourself as the leader.",
      redeemAllianceReservationHeader: "Alliance reservation",
      redeemAllianceReservationButton: "Alliance resercvation redeem",
      redeemAllianceReservationText: "Redeem an alliance reservation from last round. Enter alliance tag and secret reservation password.",
      leave:"leave",

      founded:"Founded",
      leader:"Leader",
      description:"Description",
      management:"Secret alliance slogan",
      reservation: 'Reservation for next round',
      reservationDescription: 'As leader of the alliance can you reserve your alliance for the next round. To redeem the reservation in the next ' +
        'round, you need the alliance tag and the password.',
      reservationDescriptionNew: 'Set a password.',
      reservationDescriptionChange: 'Change the password.',
      message:"Daily news",
      messageExplanation:"For members' eyes only!",
      members:"Members",
      shoutBox:"Shout Box",
      shoutBoxExplanation:"Everything entered here is immediately visible to all members",
      changePassword:'Save new password',
      kickMember:'kick',

      progress:{
        header:'Victory Progress',
        description:'An alliance can win a game round if one of the following victory criteria are achieved and maintained over a certain time period.',
        requiredRegions:'Required Regions',
        requiredArtifacts: 'Different artifact types',
        requiredDuration:'Minimum Holding Period',
        remainingDays:'Remaining Days',
        criteriaFulfilled:'Fulfilled Criterion',
        criteriaHeld:'Hold Criterion',
        victoryAt:'Victory At',
        victoryAfter:'Victory After',
        days:'Days',
      },

      error:{
        blankPassword:"Setting a blank password is not possible.",
        failedToSetPassword:"For some reason, setting the alliance password failed.",
        kickHeading:"Not Possible!",
        kickMessage:"You don't have permissions to kick this member.",
        leaveFailedClient:"Client Error: Could not leave alliance.",
        leaveFailed:"Could not leave alliance",
        invalidTag:"Enter a valid alliance tag.",
        invalidPassword:"Enter the secret alliance slogan",
        tagNotTaken:"There is no alliance with the tag you entered.",
        wrongPassword:"Alliance tag and password do not match.",
        memberLimitReached:"The maximum number of alliance members has already been reached.",
        unkownJoin:"For some reason, joining the alliance did fail.",
        enterValidTag:"Enter a valid alliance tag with 2 to 5 characters.",
        enterValidName:"Enter a valid alliance name of at least 2 characters.",
        tagTaken:"The tag you've chosen is already taken by another alliance.",
        noPermissionCreate:"You're not allowed to create an alliance.",
        unknownCreate:"For some reason, creating the alliance did fail.",
      },
      success: {
        passwordSet: "The password has been saved."
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
      },
    },

    welcome:{
      heading:'Welcome to Wack-a-Doo!',
      headingPlan:'The Plan',
      image:AWE.Config.RAILS_ASSET_PATH + 'whatdoido_en_US.jpeg',
      headingSituation:'The Situation',
      formattedText:'<p>Being a <b>demigod</b> to a tiny tribe of stoneage caveman you\'ve just convinced your followers to leave their cave behind and to live in something modern called "a village". Unfortunately, the only thing their glorious chieftain let them build was a pompous hut for himself. Now, you should <b>build housing for some Hunter-Gatherers</b> ASAP.</p><p><b>Have fun!</p>',
    },

    shop:{
      button:'Shop',
      title:'Shop',
      currentCreditAmount:'Your credit is currently',
      credits:'Credits',
      platinumCredits:'5D platinum credits',
      for:'for',
      updateCredits:'Update',
      buyCredits:'Buy now',
      article:'Article',
      description:'Description',
      price:'Credits',
      activating:'Sending',
      buy:'Acitvate',
      action:'Action',
      extend:'Extend',
      resourceOffers:'Golden frog offers',
      platinumFunction:'Platinum function',
      platinumOffers:'Platinum account',
      bonusOffers:"Bonus Packages",
      production:'Production',
      duration:'Duration',
      expiry:'Expiry',
      platinumDescription:"A platinum account offers you stress-free construction with additional places in your building queue (+3) and training queue (+3) as well as email messages when you're being attacked. More comfort functions coming soon.",
      frog_trade: 'Travelling Merchant: instant resource trade', 


      current:"current",
      platinumCredit:"platinum credits",
      offers:"offers",
      loading:"Loading shop",
      unreachable:"Shop temporarily unavailable!",

      goldenFrog:"golden frog",
      goldenFrogs:"golden frogs",

      notenoughcredits:{
        getCredits:'Get credits',
        title:'Not enough credits',
        message:"Unfortunately you don't have enough credits. Visit the credit shop to buy more 5D platinum credits.",
      },
      error:{
        heading:"Server Error",
        message:"There's a problem with the shop. Please try again later.",
      },
      buyConfirmation:{
        cashHeader:"Perfect!",
        cashMessage:"You got a bunch of fresh golden frogs. Spend them wisely so your clan may live long and prosper.",
        platinumAccountHeader:"Yeaha!",
        platinumAccountMessage:"The platinum account has been credited to your character. Platinum features are available immediately.",
        bonusHeader:"Yeaha!",
        bonusMessage:"The bonus effect has been unlocked and will help your clan to prosper.",
      },
    },

    settlement:{

      population:'Population',
      defenseBonus:'Combat Bonus',
      founded:'Founded',


      customization: {
        chooseName: "Choose your name",
        changeName: "Change your name",
        chooseNameCaption: 'Name your settlement',
        changeNameCaption: 'Change your settlements name',
        nameChangeAdvice: 'The first name change is for free any additional changes will cost you a few golden frogs.',

        changeNameDialogCaption: "Enter your new name.",

        errors: {
          nameTooShort: "Way too short. The name must have at least 3 characters.",
          nameTooLong: "Way to long. The name can have maximum 16 characters.",
          nameNoChange: "Thats the same name as before.",

          changeNameCost: "You dont have enough golden frogs right now to change your settlements name.",
          changeNameError: "The name could not be changed for some reason. Please try again later.",
        },
      },

      invitationLink:{
        header:"Invatation link",
        text:"Invite your friends to play with you. If they register with the following link, they start right in this region and pay taxes to you from the beggining.",
        send:"Send per email",
        mailSubject:"Invitation to Wack-A-Doo",
        mailBody:"Play Wack-A-Doo now: ",
      },

      abandon: {
        header: "Abondon Camp",
        text: "If you are short at settlement points, you can abondon you camp. The neanderthal will take possession, and other player can occupy the camp.",
        send: "Abondon Camp!",
        fighting: "You can´t abondon your camp, because the garrison army is still fighting.",
      },

      buildings:{

        category:'Category',
        level:'level',
        Level:'Level',

        details:{
          enables:'Enables',
          speedup:'Speeds up',
          noUpgrade:'No further upgrades possible.',
        },

        select:{
          heading:'Select building',
          missingRequirements:'Cannot currently be built due to the following <span class="red-color">unmet prerequisits</span>',
        },

        tooltip:{
          costOfNextLevel:'Cost of',
          noUpgrade:'No upgrade possible.',
          clickToEnter:'Click to enter building.',
          upgradePossible:'This building could be upgraded:',
          empty:{
            heading:'Empty lot',
            categoriesStart:'You can build ',
            categoriesEnd:' here.',
            maxLevel:'Maximum level',
            advise:'Click to build a new building.'
          },
        },
        missingReqWarning:{
          start:"Hey! You can't build a",
          end:"here now. The following conditions haven't been fulfilled",
          cancelText:['Aargh!', 'Grmpf!', 'Hgnnhgn.', 'Oh well.'],
        },
        constructionQueueFull:{
          start:"Sorry, but the construction queue is full. You can only have a maximum of ",
          end:" construction orders in the queue. Please wait till something else is finished.",
        },
        constructionQueueNotEmpty:{
          msg:"Dude! You cannot queue this job when there are already other jobs queued for this slot.",
        },
      },
      construction:{
        hurry:"Hurry!",
        cashTooltip:"Spend golden frogs to finish this job instantly. The costs depend on the remaining building time.",
        frogTradeTooltip: "Tausche 2 Kröten zur Neuverteiltung deiner Ressourcen, sodass die Gebäudeproduktion sofort startet.",
        cancelTooltip: "Den aktuellen Ausbau abbrechen.",
        insufficentResources:"insufficient resources",
        finishing:"finishing",
        beingBuilt:"Building is being constructed.",
        waitingToBeBuilt:"Waiting for it's turn.",
        cannotBeBuilt:"Cannot be built at the moment. Will be started automatically when the needed resources or building lots are available.",
        requiredResources: 'Costs',
        remaining: 'Missing',
        actionTitle: 'Action information',
      },
      training:{
        perUnit:"Per unit",
        duration:"Duration",
        total:"Total",
        recruit:"Recruit ",
        hurryTooltip:"Spend golden frogs to train units twice as fast. The cost depends on the remaining training time.",
        hurryIndicator:"x2",

        queueFull:{
          start:"Sorry, but the training queue is full. You can only have a maximum of ",
          end:" assignments in the queue. Please wait till something else is finished.",
        },
        hurry:"halve",
      },

      military:{
        takeOver:"This settlement can be stolen by other players.",
        noTakeOver:"This settlement cannot be taken over!",
        destroyable:"This settlement can be destroyed by other players.",
        notDestroyable:"This settlement cannot be destroyed!",
      },

      trade:{
        sendResources:"Send resources",
        cartsEnRoute:"Trading carts en route",
        recipient:"Recipient",
        send:"Send",
        enRoute:"En route",
        carts:"Carts",
        timeOfArrival:"Time of arrival",
        inbound:"Inbound",
        sending:"Sending",
        empty:"empty",
        cargo:"cargo",
        returnTo:"returning to",
        returnFrom:"returning from",
        origin:"Origin",
        destination:"Destination",
        amount:"amount",
        hurry: "Hurry!",
        hurryTooltip: "You can reduce the transporttime by 30 minutes with golden frogs.",
        hurryTooltipHurried: "You can finish the transport with golden frogs.",
        noCartsInTransit: "No carts in transit.",

        frogTradeHeader: "Traveling Merchant",
        frogTradeDescription: "Always happy to serve. The traveling merchant will gladly help you swap around your resources, for a small fee of course. ",
        frogTradeButton: "Trade",

        error:{
          recipientUnknown:"Your workers are far to lazy to send resources to themself.",
          recipientSelf:"Recipient unknown.",
        },
      },

      found: {
        confirmationHeader:"Found an encampment here?",
        confirmationFlavour:"This looks like a nice place.",
        confirmationText:"The encampment is founded at this place, cannot be moved and uses one of your settlement points. Furthermore a little chief from your army permanently stays at this encampment and will no longer be available.",
        confirmation:"found here and now",
        errorHeader:"Encampment cannot be founded.",
        errorFlavour:"Grmpf.",
        errorText:"Encampments can only be founded at empty locations and only in regions in which you don't already own an encampment or in which your home settlement is situated.",
        requirements:{
          text:"Furthermore the following requirements must be met",
          req1:"You have an unused settlement point,",
          req2:"there is a little chief in your army",
          req3:"your army has at least one action point.",
        },
      },

      artifact: {
        costs: "Costs",
        duration: "Duration",
        start: "Start",
        initiate: "Initiate",
        initiated: "initiated",
        owner: "Owner",
        location: "Location",
        captured_at: "Captured",
        initiated_at: "Initiated",
        notEnoughResources: {
          header: "Hold!",
          content: "You don´t have sufficient resources to initiate the artifact.",
        },
        cancelText: "Boring.",
        characterBoni: "Bonus for the owner",
        allianceBoni: "Bonus fot the alliance member",
        hurry: "Halve",
        hurrying: "hurry",
        hurried: "hurried",
        hurryTooltip: "You can halve the initiation time by using golden frogs. The costs depents on the initiation time.",
        hurryIndicator: "x2",
      },

      info:{
        clickToExpand:"Click to expand",
        clickToMinimize:"Click to minimize",
        combatBonus:"Combat bonus for all armies, that are fighting on the side of this settlement.",
        combatBonusInfo:"If the settlement is participating in a fight, the combat bonus influences the defense value of all units, that are fighting on the side of this settlement. Regardless whether they are inside or outside the walls.",
        combatBonusAbbreviation:"CB",
        buildingSpeed:"Building speed",
        buildingSpeedAbbreviation:"B",
        meleeTrainingSpeed:"Training speed of melee units",
        meleeTrainingSpeedAbbreviation:"M",
        rangedTrainingSpeed:"Training speed of ranged units",
        rangedTrainingSpeedAbbreviation:"R",
        ridersTrainingSpeed:"Training speed of mounted units",
        ridersTrainingSpeedAbbreviation:"C",
        commandPointsInfo:"Used command points / available command points. Each army needs one command point.",
        commandPointsHelp:"Each command point lets you put one army in the field from this settlement. The garrison army is an exception and does not need a command point.",
        buildings:"Buildings",
        changeName:"Change name",
        availableBuildingSlots:"Available building lots",
        speedUpInfo:"You can improve the speed with which you produce units and buildings by upgrading the respective buildings.",
        taxRate:"Tax rate",
        taxRateChangeInfo:"The tax rate you can set here is the tax rate for the entire region and all their inhabitants.",
        taxRateChangeNotPossible:"The next change is only possible one hour after the last change.",
        taxRateHelp:"The tax rate is set by the owner of the fortress in the region. Minimum is 5%, default and maximum are 15%. You think the tax rate is unfair? Team up with the other players in your region and get rid of the oppressor. He had it coming for him. Take the fortress over and collect the taxes yourself.",
        change:"change",
        resourceProduction:"Resource production",
        bonus:"Bonus",
        tax:"Tax",
        result:"Result",
        resourceProductionInfo1:"Taxes are only raised on the base building production. The bonus production is calculated on top of the untaxed base production and there are ",
        resourceProductionInfo2:"no",
        resourceProductionInfo3:"taxes being raised on the bonus production.",
        setTaxRate:"Enter new tax rate (5-15%).",
        artifact: "Artifact"
      },
      error:{
        serverDidNotAcceptTaxRate:"The server did not accept the tax rate change.",
        couldNotChangeTaxRate:"Enter a number between 5 and 15.",
      },
    },

    profile:{
      youAre:"You are",
      playingSince:"playing since",
      totalPopulation:"Total population",
      experience:"Experience",
      fortresses:"Fortresses",
      homeSettlement:"Home settlement",
      sendMessage:"Send message",

      battles:"Battles",
      victories:"Victories",
      defeats:"Defeats",

      history:"Historie",
      emptyHistory:"No events available",

      progressTab:"Progress",
      customizationTab:"Customization",
      optionsTab:"Options",

      rank:{
        start:"Start",
        experience:"Experience",
        experienceAbbreviation:"XP",
        settlementPoint:"Settlement point",
        mundaneRank:"Mundane rank",
        sacredRank:"Sacred rank",
        noRankUpPossible:"No advancement possible at this time.",
        info:"Advancing your mundane rank grants settlement points.",
        experienceInfo:"You acquire more experience by building and fighting.",
        settlementPoints:"Settlement points",
        notUsed:"unused",
        total:"total",

        progress:{
          dialogHeader:"Rank up!",
          flavour1:"You just achieved a new rank and can call yourself",
          flavour2:"from now on.",
          flavour3:"Keep going like this and you will reach the rank",
          flavour4:"in no time.",
          text:"You have acquired enough experience by fighting and building to advance your rank. Advancing your rank will raise your reputation with fellow players. They are getting jealous already. Furthermore you need a higher rank to control more fortresses and encampments.",
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
        lagUntolerable2:"or enable a automatic internet time synchronization if your operating system provides this feature. Responisveness and your user experience would improve significantly.",
      },

      customization:{
        changeAvatar: 'Change avatar',
        presentAvatar: 'Present avatar',
        changeAvatarCaption: 'Change avatar',
        changeAvatarAdvice: 'Tired of your avatar? Shuffle it!',
        changeAvatarButton: 'shuffle',
        changeAvatarDialogCaption: 'Your new avatar',
        info:"Here you can change your appearance as demi-god. At the moment you can choose the name and gender with which you want to appear in game. Later additional possibilities to customize your demi-god will be added.",
        chooseName:"Choose your name",
        changeName:"Change your name",
        presentName:"Present name",
        chooseNameCaption:'Choose name',
        changeNameCaption:'Change name',
        nameChangeAdvice:'Choose your name carefully: ideally, it should fit in with a Stone Age environment! The name must be unique in Wack-A-Doo.',
        nameChangeFreeAdvice:'You can change your name twice for free, then each change costs a couple of golden frogs – to prevent misuse.',
        nameChangeCostAdvice:"You've already changed your name several times. Of course, you can change it again, but to prevent misuse it will cost you 20 golden frogs.",
        chooseGender:"Choose your gender",
        changeGender:"Change your gender",
        presentGender:"Present gender",
        chooseGenderCaption:'Choose gender',
        changeGenderCaption:'Change gender',
        genderChangeFreeAdvice:'The first two changes of gender are free. After that, each change costs a couple of golden frogs, to prevent misuse.',
        genderChangeCostAdvice:'You have changed your gender setting several times. Of course, you can change it again but to prevent misuse it will cost you 20 golden frogs.',
        male:"male",
        female:"female",

        changePasswordCaption:"Change of Password",
        changePasswordAdvice:"Here you can change your password. The password must contain between 6 and 40 characters.",
        changePasswordButton:"Change Password",
        changePasswordChanged:"Password changed",

        changeNameDialogCaption:"Enter your character's new name.",

        changeSameIPCaption:"Several players on the same IP address",
        changeSameIPAdvice:'If you play Wack-A-Doo along with multiple players over the same IP address, enter the comma-separated player names here. More information can be found here: <a href="http://wiki.wack-a-doo.de/x/index.php?title=Mehrere_Spieler_unter_derselben_IP-Adresse&action=edit&redlink=1" target="_blank">Wiki</a>',
        changeSameIPButton:"Change the List",
        changeSameIIPChanged:"List has been saved.",

        errors:{
          nameTooShort:"Much too short. The name has to have at least 3 characters.",
          nameTooLong:"Much too long. The name may only have up to 12 characters.",
          nameNoChange:"That's the name as before. No change.",

          nameTaken:"This name is already in use or been blacklisted. Please choose another name.",
          changeNameCost:"You don't have enough golden frogs to change your name.",
          changeNameError:"Your name could not be changed for some reason. Please try again later.",
          changeGenderCost:"You don't have enough golden frogs to change your gender.",
          changeGenderError:"Your gender could not be changed for some reason. Please try again later.",

          changePasswordInvalid:"The password doesn't meet the requirements. Please choose a appropriate password.",
          changePasswordUnknown:"Your password could not be changed for unknown reasons. Please try again later.",
          changePasswordNoMatch:"The  two passwords don't match. Try again.",
          
          changeSameIIUnknown: "The list can´t be changed right now. Please try again later.",

          changeFailed: {
            heading: 'Saving avatar failed',
            text: 'Something went wrong. Probably a little gnome cut your connection and your new avatar could not be saved...',
          },
        },
      },
    },

    tutorial:{
      questList:"Your current quests",
      name:"Quest name",
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
      correctAnswered:"Question answered correctly",

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
          header:"Present quest",
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
          message:"You can't redeem this quest as there isn't enough space for your reward. Try again later!",
        },

        error:"No - wrong! Bad luck! Try again later.",
      },

      questStart:{
        header:"New Quest started",
      },
      questEnd:{
        header:"Finished Quest successfully",
      },

      end:{
        header:"Tutorial Successfully Completed.",
        p1:"Congratulations demigod, you have taken the first step on your journey! You have successfully navigated the tutorial and you have got to know to the basic functions of Wack-A-Doo.",
        p2:"As a reward we unlock the Platinum Account for several days. You can find details in the bonanza, accessible via the upper right menue element.",
        p3:"We will watch your further development and will provide a series of optional task assignments. Accomplish these tasks whenever it suits you. Or don't.",
        p4:"Do not get upset by the number of simultaneously open tasks.   Improve up your home settlement, recruit units and armies and increase your power and influence.",
        p5:"For the way ahead there is no single valid strategy, just one rule to remember: resources, resources, resources. A powerful army wins a battle, a flourishing economy wins the war.",
        p6:"Have fun and whack on!",
        redeemError:{
          header:"Attention",
          message:"Rewards could not be released because they have been already unlocked once.",
        },

      },

    },

    messaging:{
      inbox:"Inbox",
      outbox:"Outbox",
      archive:"Archive",
      unknownRecipient:"unknown recipient",
      allianceMail:"alliance circular mail",
      subject:"Subject",
      send:"Send",
      cancel:"Cancel",
      newMessage:"New message",
      to:"To",
      toHeader:"to",
      toAlliance:"to all alliance members",
      unknown:"Unknown",
      allMembersOf:"All members of",
      recipient:"Recipient",
      date:"Date",
      allAllianceMembers:"all alliance members",
      allPlayers:"all players",
      new:"New",
      reply:"Reply",
      forward:"Forward",
      delete:"Delete",
      archiving: "Archiving",
      newAllianceMail:"New alliance mail",
      noMessageSelected:"No message selected.",
      from:"From",
      yourMessage:"your message",
      system: "System",
    },

    encyclopedia:{
      productionTime:"training time",
      hitpoints:"hitpoints",
      attack:"attack",
      defense:"defense",
      criticalDamage:"critical damage",
      criticalChance:"chance",
      cannotBeTrained:"Cannot be trained by players.",
      experienceForLostUnits: "XP per lost unit",

      commandPointsAbbreviation:"CP",
      buildingTime:"build time",

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
        header:"Resource production in your empire",
        amount:"Amount",
        productionRate:"Production rate",
        dailyProduction:"Daily production",
        capacity:"Storage capacity",
        capacityReachedIn:"Capacity reached in",
        characterEffects: "Player-Boni",
        allianceEffects: "Alliance-Boni",
        effects:"Effects",
        baseProduction:"Base production",
        full:"full",

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
        advert:   "Dont like the distribution of your resources? The traveling merchant can help you!",
        info:     "For a small fee the merchant can help you to redistribute your resources.",
        warning:  "You can configure the amonut of all three resources or only one or two. The remaining resources will be distributed evenly.",
        fee:      "Each trade does cost",
        fee2:     " golden frogs.",
        loading:  "Load Ressourcen",
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
            heading: "Didn't enter an amount",
            text:    "You didn't enter an amount. No wonder it didnt work.",
          },

          toomuch: {
            heading: "You allocated to many resorces",
            text:    "You allocated more resources than you can store.",
            stone:   "You allocated more stone than you can store.",
            wood:    "You allocated more wood than you can store.",
            fur:     "You allocated more fur than you can store.",
          },

          failed: {
            heading: "Exchange failed.",
            text:    "The exchange has failed. Please try again or contact a administrator.",
          },
        },
      },
    },
    
    effects: {
      effects: "Boni",
      type0: "Shop",
      type1: "Artifact",
      characterEffectsNotAvailable: "No Player-Boni.",
      allianceEffectsNotAvailable: "No Alliance-Boni.",
    },

    likesystem:{
      notEnoughLikeAmount:"You have not enough Likes to like this player.",
      notEnoughDislikeAmount:"You have not enough Dislikes to dislike this player.",
      cancelText:['Aargh!', 'Grmpf!', 'Hgnnhgn.', 'Oh well.'],
      alreadyLikedInfo:"You've already rated this player during the last 24 hours.",
      likesAvailable: "Likes available",
      dislikesAvailable: "Dislikes available",
      info: "There ist only a limited amonut of Likes and Dislikes. After use it will regenerate.",
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
      taxRate: 'Tax rate',
      income: 'Resourcerate',
      defenseBonus: 'Battle Bonus',
      name: "Name",
      type: "Typ",
      region: "Region",
      artifact: "Artifact",
      artifacts: "Artifacts",
      noArtifacts:  "There are no Artifacts found yet.",
      captured: "Conquered",
      initiated: "Initiated",
      nextPage: "Next page",
      previousPage: "Previous page",
    },
  };
  
  return module;
  
}(AWE.I18n.en_US || {});

