/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

module.LeftHUDView = Ember.View.extend({
  templateName: 'left-hud-view',
  
  controller: null,
  screenController: null,
  mode: null,
  uiMarkerEnabled: false,
  character: null,
  settlement: null,
  timer: null,
  timeUntillNextAssignment: null,


  // this tells the mode of the map i.e 1,2,3 or 4 and based on this
  // shows the icon on the left on which the user clicks to change map
  // modes.
  map_mode : 1,

  init: function() {
    this._super();
    this.startTimer();
  },

  setHUDMode: function(currentMode) {
    this.set('mode', currentMode);
  },

  setSettlement: function(settlementId) {
    var self = this;
    AWE.GS.SettlementManager.updateSettlement(settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
      var settlement = AWE.GS.SettlementManager.getSettlement(settlementId);
      self.set('settlement', settlement);
    });
  },
  mailClicked: function(){
    this.get('controller').mailButtonClicked();
  },
  allianceClicked: function(){
    this.get("controller").allianceFlagClicked(this.getPath("character.alliance_id"));
  },
  
  isInAlliance: function() {
    return this.getPath('character.alliance_id') !== null;
  }.property('character.alliance_id'),

  isSettlement: function(){
    var mode = this.get('mode');
    return mode === AWE.UI.HUDModeSettlement;
  }.property('mode').cacheable(),

  unlockedAssignments: function(){
    var character = this.get('character');
    var settlement = this.get('settlement');
    if(settlement)
    {
      var slots = settlement.get('enumerableSlots');
      for(var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if(slot.getPath('building.unlockedAssignments'))
        {
          this.set('tavernBuilding', slot.get('building'));
          return true;
        }
      }
    }
    return false;
  }.property('settlement.enumerableSlots.@each.building.@each.level'),

  getNextAssignmentToFinish: function() {
    var assignments = AWE.GS.CharacterManager.getCurrentCharacter().getPath('hashableStandardAssignments').collection;
    var nextAssignment = null;
    if(assignments != null)
    {
      for(var i = 0; i < assignments.length; i++)
      {
        var assignment = assignments[i];
        if(assignment.get('isActive'))
        {
          if(nextAssignment != null)
          {
            var nextEndTime = new Date(nextAssignment.ended_at);
            var currentEndTime = new Date(assignment.ended_at);
            if(currentEndTime < nextEndTime)
            {
              nextAssignment = assignment;
            }
          }
          else
          {
            nextAssignment = assignment;
          }
        }
      }
    }
    return nextAssignment;
  },

  calcTimeRemaining: function() {
    if(this.getNextAssignmentToFinish() != null)
    {
      var now = new Date();
      var endTime = new Date(this.getNextAssignmentToFinish().ended_at);
      var duration = (endTime - now)/1000;
      if(duration < 60 && duration > 0)
      {
        if(duration < 10)
        {
          this.set('timeUntillNextAssignment', "0" + Math.floor(duration));
        }
        else
        {
          this.set('timeUntillNextAssignment', Math.floor(duration));
        }
        return
      }
      this.set('timeUntillNextAssignment', null);
    }
  },

  startTimer: function() {
    var timer = this.get('timer');
    if (!timer) {
      timer = setInterval((function(self) {
        return function() {
          self.calcTimeRemaining();
        };
      }(this)), 1000);
      this.set('timer', timer);
    }
  },

  stopTimer: function() {
    var timer = this.get('timer');
    if (timer) {
      clearInterval(timer);
      this.set('timer', null);
    }
  },

  unlockedTrade: function() {
    var character = this.get('character');
    var settlement = this.get('settlement');
    if(settlement)
    {
      var slots = settlement.get('enumerableSlots');
      for(var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if(slot.getPath('building.unlockedPlayerToPlayerTrade'))
        {
          return true;
        }
      }
    }
    return false;
  }.property('settlement.enumerableSlots.@each.building.@each.level'),
  
  isUiMarkerEnabled: function() {
    return this.get('uiMarkerEnabled');
  }.property('uiMarkerEnabled'),

  menuClicked: function(){
    this.get('controller').menuButtonClicked();
  },

  rankingClicked: function(){
    this.get('controller').rankingButtonClicked();
  },

  switchMapModeClicked: function(){
    this.get('controller').switchMapModeButtonClicked();
    this.switch_map_mode_icon();
  },

  gamingPieceSelectorClicked: function(){
    this.get('controller').gamingPieceSelectorButtonClicked();
  },

  recruitClicked: function(){
    this.get('controller').recruitButtonClicked();
  },

  assignmentClicked: function() {
    this.get('controller').assignmentButtonClicked(this.get('tavernBuilding'));
  },

  tradeClicked: function() {
    this.get('controller').tradeButtonClicked();
  },

  switchToSettlement: function(){
    this.get('controller').switchToSettlementButtonDoubleClicked();
    //switchToMapButtonClicked
  },

  switchToMap: function(){
    this.get('controller').switchToMapButtonClicked();
  },

  switch_map_mode_icon:function(){
    mode = this.get('map_mode');
    mode++;

    // there are 4 modes of the map only.
    if(mode == 5)
      mode = 1;

    this.set('map_mode',mode);

  },

  map_mode_small_1:function()
  {

    mode = this.get('map_mode')+2;

    if(mode == 5)
      mode = 1;
    else if(mode == 6)
      mode = 2;

    if(mode ==1)
      return 'normal-all-inactive';
    else if(mode ==2)
      return 'normal-only-inactive';
    else if(mode==3)
      return 'strategic-all-inactive';
    else if(mode==4)
      return 'strategic-only-inactive';

  }.property('map_mode'),

  map_mode_small_2:function(){

    mode = this.get('map_mode')+1;

    if(mode == 5)
      mode = 1;

    if(mode ==1)
      return 'normal-all-inactive';
    else if(mode ==2)
      return 'normal-only-inactive';
    else if(mode==3)
      return 'strategic-all-inactive';
    else if(mode==4)
      return 'strategic-only-inactive';

  }.property('map_mode'),

  map_mode_big_3:function(){

    mode = this.get('map_mode');

    if(mode==1)
      return 'normal-all-active';
    else if(mode==2)
      return 'normal-only-active';
    else if(mode==3)
      return 'strategic-all-active';
    else if(mode==4)
      return 'strategic-only-active';

  }.property('map_mode'),

});

module.RightHUDView = Ember.View.extend({
  templateName: 'right-hud-view',
  
  controller: null,
  character: null,
  tutorialState: null,

  settlement: null,
  mode: null,
  timer: null,
  constructionQueueVisible: false,
  maxPositionsInQueue: 2,
  updateQueuePropertyManually: 0,
  
  init: function() {
    this._super();
    this.startTimer();
  },
  
  setSettlement: function(settlementId) {
    var self = this;
    AWE.GS.SettlementManager.updateSettlement(settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
      var settlement = AWE.GS.SettlementManager.getSettlement(settlementId);
      self.set('settlement', settlement);
    });
  },
  
  setHUDMode: function(currentMode) {
    this.set('mode', currentMode);
  },
  
  isSettlement: function(){
    var mode = this.get('mode');
    return mode === AWE.UI.HUDModeSettlement;
  }.property('mode').cacheable(),
  
  startTimer: function() {
    var timer = this.get('timer');
    if (!timer) {
      timer = setInterval((function(self) {
        return function() {
          // HACKED: Could not bind collection correctly - but this hack works
          // Updates only construction list
          self.set('updateQueuePropertyManually', Math.random());
        };
      }(this)), 1000);
      this.set('timer', timer);
    }
  },

  stopTimer: function() {
    var timer = this.get('timer');
    if (timer) {
      clearInterval(timer);
      this.set('timer', null);
    }
  },
  
  getUnreadMessageCount: function(){
    var unreadMessages = this.getPath('character.inbox.unread_messages_count');
    if (unreadMessages === undefined) return false;
    return unreadMessages > 0 ? unreadMessages : false;
  }.property('character.inbox.unread_messages_count').cacheable(),

  getNewQuest: function(){
    var numberOfQuests = this.getPath('tutorialState.newQuestStatesCount');
    if (numberOfQuests === undefined) return false;
    return numberOfQuests > 0 ? numberOfQuests : false;
  }.property('tutorialState.newQuestStatesCount').cacheable(),


  questsClicked: function(){
    this.get('controller').questsButtonClicked();
  },
  
  constructionQueueClicked: function(){
    if(this.get('constructionQueueVisible') == true)
      this.set('constructionQueueVisible', false);
    else
      this.set('constructionQueueVisible', true);
  },
  
  constructionQueue: function() {
    var settlement = this.get('settlement');
    if(settlement)
    {
      //AWE.GS.ConstructionQueueManager.getQueuesOfSettlement(1437)[0].get('hashableJobs').get('collection')
      var ret = new Array();
      var queues = settlement.hashableQueues;//AWE.GS.ConstructionQueueManager.getQueuesOfSettlement(settlement.id);
      if(queues)
      {
        // find construction queue
        var collection = queues.get('collection');
        var rules = AWE.GS.RulesManager.getRules();
        
        for (var i = 0; i < collection.length; i++) {
          var queue = collection[i];
          if (queue !== undefined && rules.getQueueTypeIdWithBuildingCategory(queue.get('type_id')) != null) {
            var jobs = queue.get('hashableJobs').get('collection');
            for (var j = 0; j < jobs.length; j++) {
              ret.push(jobs[j]);
            }
            this.set('maxPositionsInQueue', queue.max_length);
          }
        }
      }
      if(ret.length > 0){
        //debugger;
      }
        
      return ret;
    }
    return null;
  }.property('updateQueuePropertyManually', 'constructionQueueVisible', 'settlement.hashableQueues.collection.@each.content'),
  
  availablePositionsCountInConstructionQueue: function() {
    var countInQueue = this.get('constructionQueue').length;
    var maxAllowed = this.get('maxPositionsInQueue');
    if(maxAllowed - countInQueue > 0)
      return (maxAllowed - countInQueue)
    else
      return undefined;
  }.property('constructionQueue.length'),
  
});

module.TopRightHUDView = Ember.View.extend({
  templateName: 'top-right-hud-view',
  
  controller: null,
  character: null,
  tutorialState: null,

  bestEpicSubQuest: null,
  
  init:function(){
    this._super();
    actual = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(18).actual;    
//    this.initQuestDialog();
  },

  initQuestDialog:function(){
    this.get('controller').initQuestDialog();
  },

  epicQuest: function(){


    // if(timer!==undefined)
    // {
    //   clearInterval(timer);
    // }

    timer = setInterval(function(){

      console.log(AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(18).actual);
    },1000);


    var bestEpic;
    var bestSub = null;

    var questss = this.getPath('tutorialState.openQuestStates');

    // if there are no openQuests
    if(questss.length == 0)
      return;


    if(!questss[0].getPath('tutorialstate.tutorial_completed'))
    {
      if(questss[0].get('questIsEpic'))
      {
        bestEpic = questss[0];
      }
    }
    else
    {
      // -1 so that we add atleast one into the array. There might be a situation in which all the actuals are 0.
      var actual = -1;

      for(var i=0;i<questss.length;i++)
      {
        if(questss[i].get('questIsEpic'))
        {
          if(questss[i].getPath('quest.subquests')!==undefined && questss[i].getPath('quest.subquests')!==null)
          {
            var subquestss = questss[i].getPath('quest.subquests');


            for(var j=0;j<subquestss.length;j++)
            {
              var subquests = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(subquestss[j]);

              if(subquests.actual>actual && subquests.threshold!=subquests.actual)
              {
                actual = subquests.actual;
                bestEpic = questss[i];
                bestSub = subquests;
              }
            }
          }
        }
      }
    }
    this.set('bestEpicSubQuest',bestSub);

    return bestEpic;

  }.property('AWE.GS.TutorialStateManager.tutorialState.lastAggregateUpdate'),

  epicSubQuest: function(){
    return this.get('bestEpicSubQuest');
  }.property('epicQuest'),

});

module.ConstructionQueueView = Ember.View.extend({
  templateName: 'hud-jobs-job',
  
  job: null,
  
  job_title: function() {
    return AWE.Util.Rules.lookupTranslation(this.getPath('job.buildingType.name')) + " Level " + this.getPath('job.level_after');
  }.property('job').cacheable(),
  
  job_time: function() {
    var timeRemainingInSeconds = 0;
    
    var finishedAt = this.getPath('job.active_job.finished_at');
    if(finishedAt){
      var finish = Date.parseISODate(finishedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      timeRemainingInSeconds = parseInt(remaining);
    }else{
      timeRemainingInSeconds = this.getPath('job.productionTime');
    }
    var t = new Date(1970,0,1);
    t.setSeconds(timeRemainingInSeconds);
    var s = t.toTimeString().substr(0,8);
    if(timeRemainingInSeconds > 86399)
      s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
    return s;
  }.property('job', 'job.active_job').cacheable(),
  
});
return module;


}(AWE.UI.Ember || {}));