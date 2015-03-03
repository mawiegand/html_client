/**
 * @fileOverview 
 * Ember.JS views for the home-base screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
  
  module.presentToolTipOnView = null;

  module.animateBubbles = function(slotId) {
    var bubble = $('.bubble' + slotId)[0];
    if (jQuery.contains(document.documentElement, bubble)) {
      $(bubble).animate({top: "+=15px"}, 1500, function() {
        if (jQuery.contains(document.documentElement, bubble)) {
          $(bubble).animate({top: "-=15px"}, 1500, function() {
            AWE.UI.Ember.animateBubbles(slotId)
          });
        }
      });
    }
  };

  module.reanimateBubbles = function(slotId) {
    var bubble = $('.bubble' + slotId);
    if (jQuery.contains(document.documentElement, bubble[0]) && !bubble.is(':animated')) {
      module.animateBubbles(slotId);
    }
  };

  /** @class
   * @name AWE.UI.Ember.BuildingView */  
  module.BuildingView = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingView# */ {
    building:     null,
    
		levelBinding: 'building.level',
		typeBinding:  'building.type',
		mouseInView:  false,

    classNameBindings: ['mouseInView:hover', 'slotLayoutId', 'levelClassName', 'type'],

    levelClassName: function() {
      return "level"+this.get('level');
    }.property('level').cacheable(),

    size: function() {
      if(this.get("building"))
      {
        var buildingId = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
        var imageLevel = AWE.Config.BuildingImageLibrary.getImageLevelForBuilding(buildingId, this.get("level"));
        return "size" + imageLevel;
      }
      return false;
    }.property("building", 'level'),

    size1: function() {
      var level = this.get('level');
      if (level == 0) {  // special case: return small also for level 0, iff there is a building (building id set, so it's under construction)
        if (this.getPath('type')) {
          return true ; 
        }
      }
      else {
        return level > 0 && level < 4;
      }
    }.property('level', 'type').cacheable(),
  
    size2: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level').cacheable(),
      
    size3: function() {
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 8 && this.get('level') < 16;
      }
      else {
        return this.get('level') >= 8 && this.get('level') < 11;
      }
    }.property('level').cacheable(),
    
    size4: function() {
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 16 && this.get('level') < 17;
      }
      else {
        return this.get('level') >= 11 && this.get('level') < 14;
      }
    }.property('level').cacheable(),

    size5: function() {
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 17 && this.get('level') < 18;
      }
      else {
        return this.get('level') >= 14 && this.get('level') < 18;
      }
    }.property('level').cacheable(),  
  
    size6: function() {
      return this.get('level') >= 18;
    }.property('level').cacheable(),

    hasFire: function() {
      var buildingId = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
      return AWE.Config.BuildingImageLibrary.hasFire(buildingId);
    }.property('level', 'building.buildingId'),
  });
  
  module.SlotClickArea = Ember.View.extend({
    templateName: 'click-area',
    classNames: 'click-area',
   
    mouseEnter: function(event) {
      var self = this;
      var parent = this.get("parentView");
      
      parent.set('mouseInView', true);  // need to set this because showTooltip is called delayed and there we need to check, whether the mouse left the view during the meantime
      setTimeout(function() {
        parent.showTooltip();
      }, parent.get('timeout'));
    },
    
    mouseMove: function(event) {
      var parent = this.get("parentView");
      
      parent.set('mouseX', event.pageX);
      parent.set('mouseY', event.pageY);
    },
    
    mouseLeave: function(event) {
      var parent = this.get("parentView");
      
      parent.set('mouseInView', false);
      parent.setPath('parentView.hoveredBuildingSlotView', null);
    },
    
  
    click: function(event) {
      var parent = this.get("parentView");
      
      var slot = parent.get('slot');
		  var controller = parent.getPath('parentView.controller');
		  
		  if (controller) {
		    controller.slotClicked(slot);
		  }
		  else {
		    log('In Interactive Building View: no controller found!');
		  }
		},
    
  });
  
  module.ConstructionProgressView = Ember.View.extend({
    templateName: 'construction-progress',

    timer: null,    
    timeRemaining: null,  
    
    pool: null,
    disableFrogTrade: false,
    
    init: function(spec) {
      this._super(spec);            
    },  

    isUIMarker: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.count_quests_completed == 15;//isUIMarkerActive(AWE.GS.MARK_HURRY_BUTTON) ;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    job: function(){
      var sortedJobs = this.getPath('slot.building.sortedJobs');
      if(sortedJobs && sortedJobs.length > 0)
      {
        var currentJob = sortedJobs[0];
        return currentJob;
      }
      else
      {
        return null;
      }
    }.property('slot.building.sortedJobs.@each').cacheable(),

    lastJob: function(){
      var sortedJobs = this.getPath('slot.building.sortedJobs');
      if(sortedJobs && sortedJobs.length > 0)
      {
        var last = sortedJobs[sortedJobs.length - 1];
        return last;
      }
      else
      {
        return null;
      }
    }.property('slot.building.sortedJobs.@each').cacheable(),

    jobCollection: function() {

    }.property(),

    positionInQueue: function() {
      var settlement = this.get('settlement');
      var jobCollection = AWE.GS.ConstructionQueueManager.getQueuesOfSettlement(settlement.id);
      var i = 0;
      if (jobCollection && jobCollection[0]) {
        var jobs = jobCollection[0].getPath('hashableJobs.collection');
        for (i = 0; i < jobs.length; i++) {
          if (jobs[i] && jobs[i].getPath('slot.slot_num') === this.getPath('slot.slot_num')) {            
            break;
          }
        }
      }
      return i;
    }.property('settlement.hashableQueues.collection.@each.jobs_count'),
    
    positionInQueueText: function() {      
      return "In Queue: " + this.get('positionInQueue');
    }.property('positionInQueue'),    
    
    isSlotSelected: function() {
      return this.getPath('parentView.parentView.selectedSlot.slot_num') === this.getPath('slot.slot_num');
    }.property('parentView.parentView.selectedSlot.slot_num', 'slot.slot_num'),
    
    isConstructionSpeedupPossible: function() {
      return this.getPath('job.active_job') && this.getPath('job.buildingType.buyable') && AWE.Util.Rules.isConstructionSpeedupPossible(this.get('timeRemaining'));
    }.property('timeRemaining', 'job.active_job'),
    
    cancelJobPressed: function(event) {
      this.getPath('parentView.parentView.controller').constructionCancelClicked(this.get('lastJob'));
    },
    
    finishJobPressed: function(event) {
      this.getPath('parentView.parentView.controller').constructionFinishClicked(this.get('job'));
    },
    
    calcTimeRemaining: function() {
      var finishedAt = this.getPath('job.active_job.finished_at');
      if (!finishedAt) {
        return ;
      }
      var finish = Date.parseISODate(finishedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
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
    
    active: function() {
      return this.getPath('job.active_job') !== null;
    }.property('job.active_job'),
    
    first: function() {
      var position = this.get('positionInQueue');
      return position === 0;
    }.property('positionInQueue'),    
    
    waitingForResources: function() {
      var active = this.get('active');
      var first  = this.get('first');
      return !active && first;
    }.property('active', 'first'),
    
    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining'),
    
    startTimerOnBecommingActive: function() {
      var active = this.get('active');
      if (active && this.get('timer')) {
        this.startTimer();
      }
      return ;
    }.observes('active'),        
    
    progressBarWidth: function() {
      var remaining = this.get('timeRemaining') || 999999999;
      var total = this.getPath('job.productionTime') || 1;
      var ratio = 1.0 - (remaining / (1.0*total));
      ratio = ratio < 0 ? 0 : (ratio > 1 ? 1 : ratio);
      return 'width: ' + Math.ceil(100 * ratio) + '%;';
    }.property('timeRemaining', 'job.productionTime'),
    
    didInsertElement: function() {      
      this.startTimer();
      this.initPool();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },
    
    /* return slot costs for conversion or upgrade */
    slotCosts: function() {
      /* TODO: the calculation of costs should be placed at the job object (model!!) */

      /* check if is upgrade or conversion */
      if(this.getPath('job.slot.building.underConversion')) {
        /** this assumes the conversion to be the only job on this slot in the queue.
            presently, this assumption is save, since the client does not allow for a conversion
            if there's already an ongoing job on the same slot. */
        return this.getPath('job.slot.building.conversionCosts');
      }
      if (this.getPath('job.slot.building.underDestruction')) {
        return []; // destructions are free!
      } 
      else {       // upgrade and creation jobs
        var buildingToCalculateCostsFor = this.getPath('job.slot.building');
        if (buildingToCalculateCostsFor) {
          return this.getPath('job.slot.building').calcCosts(this.getPath('job.level_after')); // level after should be right...
        }
        return null;
      }
    },
    
    /* button should be available if
     *  - insufficient resources
     *  - sum required resources <= sum user resources
     *  - if required resources <= capacity
     *  - is first and not active
     *  - user has enough cash for frog trade
     */
    isFrogTradePossible: function() {
      
      if (AWE.Config.QUICK_TRADE_ON_JOB_ENABLED === false) {
        return false;
      }

      /* disable fast frog trade button on conversion, see
       * html_client issue #69 */
      if(this.getPath('job.slot.building.underConversion')) {
        return false;
      }

      if (this.get('first') && !this.get('active') && (this.getPath('pool.resource_cash_present') >= AWE.GS.RulesManager.getRules().resource_exchange.amount) && !this.get('disableFrogTrade')) {
        var costs        = this.slotCosts() || []; /*this.getPath('job.slot.building.costs');*/
        var sum_required = 0;
        var self = this;
        
        for (i = 0; i < costs.length; ++i) {
          /* sum up pool */
          sum_required += costs[i].amount;

          /* check if required resources <= capacity */
          if(costs[i].amount > self.getPath('pool.'+costs[i].resourceType.symbolic_id+'_capacity'))  {
            return false;
          }
        }

        var sum_pool = self.getPath('pool.resource_wood_present') + self.getPath('pool.resource_stone_present') + self.getPath('pool.resource_fur_present');

        /* check if required resources <= capacity */
        if (sum_required > sum_pool) {
          return false;
        }

        return true;
      }
      else {
        return false;
      }
    }.property('job', 'job.active_job', 'active', 'first', 'pool', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present', 'pool.resource_cash_present', 'disableFrogTrade').cacheable(),
    
    /** the following action must be moved to the settlement controller. 
     * here's the wrong place for it. */
    resourceExchangePressed: function() {
      var self = this;
      var costs = this.slotCosts();

      /* ensure that the frogTradeButton will not be clicked twice */
      if(this.get('disableFrogTrade') == true) {
        log('ERROR: frog trade was clicked twice');
        return false;
      }

      this.set('disableFrogTrade', true);

      /* TODO: re-write createTradeResourcesAction controller to receive an array instead
       * of 3 parameters */
      var action = AWE.Action.Fundamental.createTradeResourcesAction(
          (costs[0] ? costs[0].amount : 0),
          (costs[1] ? costs[1].amount : 0),
          (costs[2] ? costs[2].amount : 0),
          this.get('job').getId());
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        var parent = self;
        if(statusCode == 200) {
          /* update resources in client */
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
            /* TODO: Perhaps add a notification of success? */
            AWE.GS.ConstructionJobManager.updateJob(self.getPath('job.id'));
            self.get('controller').updateConstructionQueueSlotAndJobs(self.getPath('job.queue_id'));    
            self.set('disableFrogTrade', true); // was successful, keep disabled
          });
        }   
        else if (statusCode == AWE.Net.CONFLICT) {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.set('disableFrogTrade', false);          
        }   
        else {
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.heading'),
            message: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.text'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
          self.set('disableFrogTrade', false);
        }   
      }); 
    },
    
    initPool: function() {
      this.set('pool', AWE.GS.ResourcePoolManager.getResourcePool());
    },
    
    building: function() {
      if (this.getPath('job.job_type') == AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT) {
        return this.getPath('job.slot.building.converted');
      }
      else {
        return this.getPath('job.slot.building');
      } 
    }.property('id').cacheable(), 
    
  });  

  /** @class
   * @name AWE.UI.Ember.BuildingSlotView */  
  module.BuildingSlotView = module.BuildingView.extend( /** @lends AWE.UI.Ember.BuildingSlotView# */ {
    templateName: 'interactive-building-slot',
    mouseX: 0,
    mouseY: 0,
    timeout: 600,    // tooltip timeout in ms
		settlement: null,
		slot:       null,
		
		buildingBinding: 'slot.building',
				
    init: function() {
      this._super();
    },

    isAndroid: function() {
      if(typeof(LoginHandler) !== undefined)
      {
        return false;
      }
      return true;
    }.property(),

    showTooltip: function() {
      if (this.get('mouseInView') === true) {  // only show tooltip, if the mouse is still in view
        this.setPath('parentView.hoveredBuildingSlotView', this);
      }
    },
  
    slotLayoutId: function() {
      var slotNum = this.getPath('slot.slot_num');
      return slotNum ? "slot"+slotNum : null;
    }.property('slot.slot_num').cacheable(),
    
    buildingCategories: function() {
      var buildingId  = this.getPath('slot.buildingId');
      var slot        = this.get('slot');
      return (buildingId === null || buildingId === undefined) && slot ? slot.buildingCategories() : null;
    }.property('slot.buildingId', 'slot.settlement_id', 'slot.slot_num'),	
    
    buildingCategoryNames: function() {
      var categories = this.get('buildingCategories');
      if (!categories || categories.length == 0) {
        return ""
      }
      categories = categories.map(function(category) {
        return '<span class="green-color">'+AWE.Util.Rules.lookupTranslation(category.name)+'</span>';
      });
      return categories;
    }.property('buildingCategories'),
    
    maxLevel: function() {
      var slot = this.get('slot');
      return slot ? slot.slotType().max_level : null;
    }.property('slot.slot_num', 'slot.settlement_id' ),

    slotTypeHeader: function() {
      var slot = this.get('slot');
      var maxLevel = slot ? slot.slotType().max_level : 10;
      return parseInt(maxLevel) > 10 ?
        AWE.I18n.lookupTranslation('settlement.buildings.tooltip.empty.large') :
        AWE.I18n.lookupTranslation('settlement.buildings.tooltip.empty.small');
    }.property('slot.slot_num'),
		
  });

  
  /** @class
   * @name AWE.UI.Ember.BubbleView */  
  module.BubbleView = Ember.View.extend({
    templateName: 'bubble',
    slot: null,

    bubbleAmountBinding: 'slot.bubble_amount',
    bubbleXPBinding: 'slot.bubble_xp',

    bubbleClass: function() {
      return 'bubble' + this.getPath('slot.id');
    }.property('slot').cacheable(),

    xp: function() {
      return this.getPath('slot.bubble_xp') && this.getPath('slot.bubble_xp') > 0;
    }.property('slot.bubble_xp').cacheable(),

    init: function() {
      this._super();
    },

    click: function(event) {

      if (this.getPath('slot.bubble_resource_id') == null) {
        return true;
      }

      var element = event.currentTarget;
      var bubbleCount = 10;
      var self = this;

      $(element).find('.bubble').stop(true);

      // remove big bubble background
      $(element).find('.bubble').addClass('invisible');

      $(element).find(".bubble-resource").animate({
        opacity: 0.2,
        top: ["-=40px", 'linear'],
      },  2000, function() {
        if (!jQuery.contains(document.documentElement, $(element))) {
          $(element).find('.bubble').stop(true);
          $(element).find('.bubble').css('top', '0px');
          $(element).find('.bubble-resource').css('top', '0px');
          $(element).find('.bubble-resource').css('opacity', '1.0');
          $(element).find('.bubble').removeClass('invisible');
          $(element).find('.resource-icon').removeClass().addClass('resource-icon');
//          $(element).find('.bubble-amount').css('visibility', 'hidden');
          $(element).find('.bubble').addClass('hidden');
        }

        for(var i = 1; i <= bubbleCount; ++i) {
          var smallBubble = $(element).find(".small-bubble.n"+i)[0];

          if (!jQuery.contains(document.documentElement, $(smallBubble))) {
            $(smallBubble).remove();
          }
        }
      });

      $(element).find('.bubble-xp').css('visibility', 'visible');
      $(element).find('.bubble-amount').css('visibility', 'visible');
      $(element).find('.resource-icon').css('visibility', 'visible');

      // append small bubbles
      for(var i = 1; i <= bubbleCount; ++i) {
        $(element).append('<div class="small-bubble n'+i+'">&nbsp;</div>');
        $(element).find('.small-bubble').css('top', $(element).find('.bubble').css('top'));
        $(element).find('.small-bubble').css('left', "40px");
      }

      // animate small bubbles
      for(var i = 1; i <= bubbleCount; ++i) {
        $(element).find(".small-bubble.n"+i).animate({
          opacity: 0.0,
          left: ["+="+Math.floor((Math.random()*200)-100), 'linear'],
          top: ["+="+Math.floor((Math.random()*200)-100), 'linear'],
        }, 1000);
      }

      var action = AWE.Action.Settlement.createRedeemSlotBubbleAction(this.getPath('slot.id'));
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if(statusCode == 200) {
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
          });
          AWE.GS.CharacterManager.updateCurrentCharacter();
          AWE.GS.SlotManager.updateSlotsAtSettlement(self.getPath('slot.settlement.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
//            log('----------> slots', slots);
            AWE.Ext.applyFunctionToElements(slots, function(slot) {
//              log('----------> slot', slot);
//              log('----------> slot res id', slot.get('bubble_resource_id'));
            });
          });
        }
      });

      return false;
    },

    didInsertElement: function() {
      this._super();
      this.fillBubble();
    },

    fillBubble: function() {
      var bubble = $('.bubble' + this.getPath('slot.id'))[0];
      if (bubble != null && this.getPath('slot.bubble_resource_id') != null) {
        $(bubble).removeClass('hidden');
        $(bubble).find('.resource-icon').addClass(AWE.GS.RulesManager.getRules().getResourceType(this.getPath('slot.bubble_resource_id')).symbolic_id)
      }
    },

    /**
     * returns true if bubble_resource_id is not null and thus
     * activates the bubble
     */
	  visibilityObserver: function() {
      this.fillBubble();
    }.observes('slot', 'slot.bubble_resource_id', 'slot.updated_at'),
  });

  /** @class
   * @name AWE.UI.Ember.HoverableView */  
  module.HoverableView = Ember.View.extend( /** @lends AWE.UI.Ember.HoverableView# */ {
    hovered:     false,
    		  
    mouseEnter: function(event) {
      var self = this;
      this.set('hovered', true);
      this.setPath('parentView.hoveredView', this);
    },
    mouseLeave: function(event) {
      this.set('hovered', false);
      this.setPath('parentView.hoveredView', null);
    },
  });

  return module;
    
}(AWE.UI.Ember || {}));




