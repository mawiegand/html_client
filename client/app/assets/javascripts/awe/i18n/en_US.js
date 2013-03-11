/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
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
      yes:'Yes',
      no:'No',
      nr:'No.',
      of:'of',
      with:'with',
      change:'Change',
      start:'Start',

      processing:'Processing...',
      unknown:'Unknown.',
      naivePlural:'s',

      perHour:'per hour',
      perHourSym:'/h',
      days:'days',
      oclock:"o'clock",

      demigod:'Demi-god',
      demigoddess:"Demi-goddess",

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
        afterRound:"after round",
        preparingRound:"preparing round",
        lastRound:"last round",
        nextRound:"next round",
        firstRound:"first round",
        myFaction:"my faction",
        oneFaction:"one faction",
        otherFaction:"other faction",

        participants:{
          name:"name",
          owner:"owner",
          strength:"strength",
          retreat:"retreat",
          armyDisbanded:"disbanded army",
          armyDisbandedDescription:"This happens when a home settlement is lost to an army",
        },
      },
      messages:{
        own:{
          winning:[
            "Yay! Let's mow ‘em down!"
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
        melee:'melee',
        riders:'riders',
        ranged:'ranged',
        unitCount:'unit number',
        size:'size',
        sizeAll:"overall size",
        sizeMax:"maximum Size",
        velocity:'speed',
        changeName:'change name',
        rank:"rank",
        rankDescription:"A higher rank makes your troops  more effective. The army has to gain experience to achieve a higher rank.",
        rankUpAt:"rank up at",
        experience:"experience",
        experienceDescription:"You gain experience, your own troops die, it's not to kill enemies.The reason: you only learn from your mistakes.",
        stance:"Assist defence of fortress or settlement if attacked",
        demigod:"demi-god",
        ownerLabel:"Owner",
        actionPoints:"action points",
        nextActionPointAt:"next action point at",
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
            "Can‘t anyone get a bit of peace and quiet round here?",
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
            "Isn‘t it a lovely day?"
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
      capacity:"Building capacity",
      productionBoni:"Production bonus",
      tradingCarts:"trading carts",
      commandPoints:"command points",
      garrison:"garrison army",
      populationAbbreviation:"Pop",
      buildingTime:"building time",
      storageCapacity:"storage capacity",
      production:"production",

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
      memberOf:"You are currently a member of the alliance ",
      joinAlliance:"join alliance",
      joinAllianceText:"Join an existing alliance by entering their alliance tag and the secret alliance slogan.",
      createAlliance:"found alliance",
      createAllianceText:"Found a new alliance with yourself as the leader.",
      leave:"leave",

      founded:"Founded",
      leader:"Leader",
      description:"Description",
      management:"Secret alliance slogan",
      message:"Daily news",
      messageExplanation:"For members‘ eyes only!",
      members:"Members",
      shoutBox:"Shout Box",
      shoutBoxExplanation:"Everything entered here is immediately visible to all members",
      changePassword:'Save new password',
      kickMember:'kick',

      progress:{
        header:'Victory Progress',
        description:'An alliance can win a game round if one of the following victory criteria are achieved and maintained over a certain time period.',
        requiredRegions:'Required Regions',
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
      formattedText:'<p>Being a <b>demigod</b> to a tiny tribe of stoneage caveman you\'ve just convinced your followers to leave their cave behind and to live in something modern called "a village". Unfortunately, the only thing their glorious chieftain let them build was a pompous hut for himself. Now, you should <b>build housing for some Hunter-Gatherers</b> ASAP.</p><p><b>Please note:</b> Presently, the English version of Wack-A-Doo is still in the making. A lot of translations and texts are still missing. If possible, please play the German version.</p><p><b>Have fun!</p>',
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
      platinumDescription:"A platinum account offers you stress-free construction with additional places in your building queue (+3) and training queue (+1) as well as email messages when you're being attacked. More comfort functions coming soon.",

      goldenFrog:"golden frog",
      goldenFrogs:"golden frogs",

      current:"current",
      platinumCredit:"platinum credits",
      offers:"offers",
      loading:"Loading shop",
      unreachable:"Shop temporarily unavailable!",

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

      invitationLink:{
        header:"Invatation link",
        text:"Invite your friends to play with you. If they register with the following link, they start right in this region and pay taxes to you from the beggining.",
        send:"Send per email",
        mailSubject:"Invitation to Wack-A-Doo",
        mailBody:"Play Wack-A-Doo now: ",
      },

      abandon: {
        header: "Lagerstätte aufgeben",
        text: "Wenn Du knapp an Siedlungspunkten bist, kannst Du diese Lagerstätte aufgeben. Sie geht dann in den Besitz der Neandertaler über und ist anschließend für andere Spieler übernehmbar.",
        send: "Lagerstätte aufgeben!",
        fighting: "Die Lagerstätte kann zur Zeit nicht aufgegeben werden, da die Garnisonsarmee am Kämpfen ist.",
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
        insufficentResources:"insufficent resources",
        finishing:"finishing",
        beingBuilt:"Building is being constructed.",
        waitingToBeBuilt:"Waiting for its turn.",
        cannotBeBuilt:"Cannot be built at the moment. Will be started automatically when the needed resources or building lots are available.",
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
        cartsEnRoute:"trading carts en route",
        recipient:"recipient",
        send:"Send",
        enRoute:"en route",
        carts:"Carts",
        timeOfArrival:"Time of arrival",
        inbound:"inbound",
        sending:"sending",
        empty:"empty",
        cargo:"cargo",
        returnTo:"returning to",
        returnFrom:"returning from",
        origin:"Origin",
        destination:"Destination",
        amount:"amount",
        hurry: "Hurtig!",
        hurryTooltip: "Gib Goldkröten aus um die Handelskarren zu beschleunigen.",

        error:{
          recipientUnknown:"Your workers are far to lazy to send resources to themself.",
          recipientSelf:"Recipient unknown.",
        },
      },

      found:{
        confirmationHeader:"Found an encampment here?",
        confirmationFlavour:"This looks like a nice place.",
        confirmationText:"The encampment is founded at this place, cannot be moved and uses one of your settlement points. Furthermore a little chief from your army permanently stays at this encampment and will no longer be available.",
        confirmation:"found here and now",
        errorHeader:"Encampment cannot be founded.",
        errorFlavour:"Grmpf.",
        errorText:"Encampments can only be founded at empty locations and only in regions in which you don't already own an encampment or in which your home settlement is situated.",
        requirement:{
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
        capturedAt: "Captured",
        initiatedAt: "Initiated",
        notEnoughResources: {
          header: "Halt!",
          content: "Du hast aktuell leider nicht genügend Resourcen, um das Artefakt einzuweihen.",
        },
        cancelText: "Schade",
      },

      info:{
        clickToExpand:"click to expand",
        clickToMinimize:"click to minimize",
        combatBonus:"Combat bonus for all armies, that are fighting on the side of this settlement.",
        combatBonusInfo:"If the settlement is participating in a fight, the combat bonus influences the defense value of all units, that are fighting on the side of this settlement. Regardless whether they are inside or outside the walls.",
        combatBonusAbbreviation:"CB",
        buildingSpeed:"building speed",
        buildingSpeedAbbreviation:"B",
        meleeTrainingSpeed:"training speed of melee units",
        meleeTrainingSpeedAbbreviation:"M",
        rangedTrainingSpeed:"training speed of ranged units",
        rangedTrainingSpeedAbbreviation:"R",
        ridersTrainingSpeed:"training speed of mounted units",
        ridersTrainingSpeedAbbreviation:"C",
        commandPoints:"used command points / available command points. Each army needs one command point.",
        commandPointsHelp:"Each command point lets you put one army in the field from this settlement. The garrison army is an exception and does not need a command point.",
        buildings:"buildings",
        changeName:"change name",
        availableBuildingSlots:"Available building lots",
        speedUpInfo:"You can improve the speed with which you produce units and buildings by upgrading the respective buildings.",
        taxRate:"tax rate",
        taxRateChangeInfo:"The tax rate you can set here is the tax rate for the entire region and all their inhabitants.",
        taxRateChangeNotPossible:"The next change is only possible one hour after the last change.",
        taxRateHelp:"The tax rate is set by the owner of the fortress in the region. Minimum is 5%, default and maximum are 15%. You think the tax rate is unfair? Team up with the other players in your region and get rid of the oppressor. He had it coming for him.. Take the fortress over and collect the taxes yourself.",
        change:"change",
        resourceProduction:"Resource production",
        bonus:"bonus",
        tax:"tax",
        result:"result",
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
      sendMessage:"send message",

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
        experience:"experience",
        experienceAbbreviation:"XP",
        settlementPoint:"settlement point",
        mundaneRank:"mundane rank",
        sacredRank:"sacred rank",
        noRankUpPossible:"No advancement possible at this time.",
        info:"Advancing your mundane rank grants settlement and skill points. Advancing your sacred rank is required to advance in your mundane rank and gives you a deeper understanding the supernatural.",
        experienceInfo:"You acquire more experience by building and fighting.",
        settlementPoints:"settlement points",
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
        info:"Here you can change your appearance as demi-god. At the moment you can choose the name and gender with which you want to appear in game. Later additional possibilities to customize your demi-god will be added.",
        chooseName:"Choose your name",
        changeName:"Change your name",
        presentName:"Present name",
        chooseNameCaption:'Choose name',
        changeNameCaption:'Change name',
        nameChangeAdvice:'Choose your name carefully: ideally, it should fit in with a Stone Age environment! The name must be unique in Wack-a-Doo.',
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
        p2:"As a reward we give you a Platinum account and bonuses to all the three commodities. These bonuses are now visible in the repository",
        p3:"We will watch your further development and accompany you in a series of ongoing tasks. You can accomplish these tasks if you always enjoy it.",
        p4:"Do not get upset by the numerous simultaneously open tasks.   Build up your settlement, set up armies and multiply your power and your alliance’s influence.",
        p5:"For the way ahead in Wack-A-Doo there are no guidelines, just a statement which is generally valid: Raw material, raw material, and yet more raw material. A powerful army wins a battle, a rich commodity production wins a war.",
        p6:"Have fun in Wack-A-Doo and wack on!",
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
      newAllianceMail:"New alliance mail",
      noMessageSelected:"No message selected.",
      from:"From",
      yourMessage:"your message",
    },

    encyclopedia:{
      productionTime:"training time",
      hitpoints:"hitpoints",
      attack:"attack",
      defense:"defense",
      criticalDamage:"critical damage",
      criticalChance:"chance",
      cannotBeTrained:"Cannot be trained by players.",

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
    },

    likesystem:{
      notEnoughLikeAmount:"You have not enough Likes to like this player.",
      notEnoughDislikeAmount:"You have not enough Dislikes to dislike this player.",
      cancelText:['Aargh!', 'Grmpf!', 'Hgnnhgn.', 'Oh well.'],
      alreadyLikedInfo:"You've already rated this player during the last 24 hours.",
    },

    ranking: {
      header: "Ranglisten",
      characters: "Spieler",
      alliances:  "Allianzen",
      alliance:  "Allianz",
      fortresses: "Festungen",
      fortress: "Festung",
      victoryProgress: "Siegfortschritt",
      rank: 'Rang',
      character: 'Spieler',
      owner: 'Besitzer',
      overallScore: 'Gesamt',
      resourceScore: 'Ressourcen',
      likes: 'Likes',
      victories: 'Siege',
      victoryRatio: 'Siegverhältnis',
      beatenUnits: 'Bes. Einheiten',
      experiencedArmy: 'Armee XP',
      numFortresses: 'Festungen',
      numMembers: 'Mitglieder',
      regionsPerMember: 'Regionen pro Mitglied',
      taxRate: 'Steuersatz',
      income: 'Ressourcenrate',
      defenseBonus: 'Verteidigungsbonus',
      nextPage: "Nächste Seite",
      previousPage: "Vorige Seite",
    },
  };
  
  return module;
  
}(AWE.I18n.en_US || {});

