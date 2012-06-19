/**
 * @fileOverview 
 * Screen controller for the home-base screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  /**
   * Screen controller for displaying a player's (home) base.  
   * @class
   * @extends AWE.Controller.ScreenController
   * @name AWE.Controller.BaseController */
  module.createBaseController = function(anchor) {
      
    var _viewNeedsUpdate = false;  
    var _modelChanged = false;
    var _becameVisible = false;

          
    var that = module.createScreenController(anchor); // create base object
    
    that.view    = null;
    that.baseId  = null;
    that.visible = false;
    that.baseId  = null;
    that.slots   = null;
    
    var _super = {};             // store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** initializes the base screen. 
     * @function
     * @name AWE.Controller.BaseController#init */
    that.init = function(initialFrameModelCoordinates) {
      _super.init();            
    };   
    
    /** get all stages controlled by this controller. 
     * @function
     * @name AWE.Controller.BaseController#getStages */
    that.getStages = function() { return []; }
    
    
    /** set the id of the base to display (it's the settlement id). 
     * @function
     * @name AWE.Controller.BaseController#setBaseId */
    that.setBaseId = function(baseId) { 
      this.baseId = baseId; 
    }
    
    /** set the id of the base to display by setting the location id.
     * looks-up the settlement id that is at that particular location
     * and even fetches it from the server, if it's missing.
     * @function
     * @name AWE.Controller.BaseController#setLocationId */
    that.setLocationId = function(locationId) {
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(locationId);
      if (settlement === null) {
        if (AWE.GS.SettlementManager.lastUpdateForLocation(locationId).getTime() + 1000 < new Date().getTime()) { // information to old
          AWE.GS.SettlementManager.updateSettlementsAtLocation(locationId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result, status) {
            that.setLocationId(locationId); // try again to set it
          });         
        }
        else {  // seems as there's no settlement at this location!
          console.log('ERROR: could not obtain settlement at present location from server.')
        }
      }
      else {
        that.setBaseId(settlement.getId());
      }
    }
    
    /** removes the whole screen from the DOM.
     * @function
     * @name AWE.Controller.BaseController#removeView */
    that.removeView = function() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
    }
    
    
    /** update the view in case the OBJECTS (alliance, members) did change. A change
     * of object properties (e.g. alliance.description) is propagated automatically
     * with the help of ember bindings. 
     * @function
     * @name AWE.Controller.BaseController#updateView
     */
    that.updateView = function() {
      //that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
    }
    
    /** creates the screen by instantiating the corresponding views. Does not 
     * display the screen by itself! 
     * See {@link AWE.Controller.BaseController#appendView}. 
     * @function
     * @name AWE.Controller.BaseController#createView */
    that.createView = function() {
      var base = AWE.GS.SettlementManager.getSettlement(that.baseId);
      var baseScreen = AWE.UI.Ember.BaseView.create({
        templateName: "base-screen",
        controller : this,
        base: base,
      });      
      that.slots = null;
      return baseScreen;
    }
    
    
    /** appends the whole screen to the DOM, thus making it visible.
     * @function
     * @name AWE.Controller.BaseController#appendView */
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      this.updateView();
      this.view = this.createView();
      this.view.appendTo('#main-screen-controller');   
    }
    
    
    that.viewDidAppear = function() {
      this.visible = true;
      _becameVisible = true;
      this.appendView();
    };
    
    that.viewWillDisappear = function() {
      this.removeView();
      this.visible = false;
    };
    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Model
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.modelChanged = function() {
      return _modelChanged;
    }
    
    that.setModelChanged = function() {
      _modelChanged = true;
    }
    
    // settlement update method

    that.updateSettlement = function() {
      AWE.GS.SettlementManager.updateSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
        log('updated settlement', settlement)
      });
    }

    // slot update method

    that.updateSlots = function() {
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
        log('updated slots', slots)
      });
    }
      
    // construction queue and job update methods
    
    that.updateConstructionQueueSlotAndJobs = function(queueId) {
      AWE.GS.ConstructionQueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queue) {
        log('updated construction queue', queueId);
      });

      // as we don't know the right slot (or slot id), we update all slots
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
        log('updated slots', slots);
        AWE.Ext.applyFunctionToHash(slots, function(slotId, slot) {
          log('slot', slot, slot.get('level'))
        });      
      });

      AWE.GS.ConstructionJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
        log('updated jobs in construction queue', queueId);
      });
    }
        
    that.updateAllConstructionQueuesAndJobs = function() {
      AWE.GS.ConstructionQueueManager.updateQueuesOfSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
        log('updated queues', queues)
        AWE.Ext.applyFunctionToHash(queues, function(queueId, queue) {
          AWE.GS.ConstructionJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
            log('updated jobs in construction queue', jobs)
          });
        });      
      });
    }
        
    // training queue and job update methods
    
    that.updateTrainingQueueAndJobs = function(queueId) {
      AWE.GS.TrainingQueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queue) {
        log('updated training queues', queue);
      });
      
      AWE.GS.TrainingJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
        log('updated training jobs', jobs);
      });
    }
        
    that.updateAllTrainingQueuesAndJobs = function() {
      AWE.GS.TrainingQueueManager.updateQueuesOfSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
        log('updated training queues', queues);
        AWE.Ext.applyFunctionToHash(queues, function(queueId, queue) {
          AWE.GS.TrainingJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
            log('updated training jobs', jobs);
          });
        });      
      });
    }
        
    // resource pool update methods
    
    that.updateResourcePool = function() {
      AWE.GS.ResourcePoolManager.updateResourcePool(null, function(pool){
        log('updated resource pool', pool);
      });
    };

    that.updateModel = (function() {
            
      var lastSettlementUpdateCheck = new Date(1970);
      var lastSettlementId = 0;
      
      var updateSettlement = function() {
        // just trigger the updates, thanks to the bindings we do not need to
        // process the answers and update the views manually.
        AWE.GS.SettlementManager.updateSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
          log('updated settlement', settlement);
          if (settlement && settlement.getId()) {
            that.updateSlots();
            that.updateAllConstructionQueuesAndJobs();
            if (that.view.get('selectedSlot')) {
              that.updateAllTrainingQueuesAndJobs();
            }
          }
        });
      }
      
      return function() {
        
        // TODO: use the last update timestamp from the Settlement Manager and don't track a copy locally.
        if (that.baseId > 0 && (
              lastSettlementId != that.baseId ||
              lastSettlementUpdateCheck.getTime() + AWE.Config.SETTLEMENT_REFRESH_INTERVAL < +new Date() ||
              that.modelChanged() ||
              _becameVisible)) {
                
          AWE.GS.SettlementManager.updateSettlement(that.baseId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
            log('updated settlement', settlement);
            if (settlement && settlement.getId()) {
              that.updateSlots();
              that.updateAllConstructionQueuesAndJobs();
              if (that.view.get('selectedSlot')) {
                that.updateAllTrainingQueuesAndJobs();
              }
            }
          });

          lastSettlementUpdateCheck = new Date();
          lastSettlementId = that.baseId;
          _modelChanged = false;
          _becameVisible = false;
        }
      };
    }());
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 

    var pendingConstructionJobUpdates = {};
    
    that.updateOldJobsInConstructionQueues = function(queues) {
      if (queues) {
        queues.forEach(function(queue) {
          var jobs = AWE.GS.ConstructionJobManager.getJobsInQueue(queue.getId());
          jobs.forEach(function(job) {
            if (job.get('active_job')) {
              var jobId = job.getId();
              pendingConstructionJobUpdates[jobId] = pendingConstructionJobUpdates[jobId] > 0 ? pendingConstructionJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
              if (Date.parseISODate(job.get('active_job').finished_at).add({seconds: pendingConstructionJobUpdates[jobId]}) < new Date()) {
                pendingConstructionJobUpdates[jobId] *= 2;
                that.updateConstructionQueueSlotAndJobs(queue.getId());
              }
            }      
          });
        });
      }
    }

 
    var pendingTrainingJobUpdates = {};
    
    that.updateOldJobsInTrainingQueues = function(queues) {
      if (queues) {
        queues.forEach(function(queue) {
          var jobs = AWE.GS.TrainingJobManager.getJobsInQueue(queue.getId());
          jobs.forEach(function(job) {
            if (job.get('active_job')) {
              var jobId = job.getId();
              pendingTrainingJobUpdates[jobId] = pendingTrainingJobUpdates[jobId] > 0 ? pendingTrainingJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
              if (Date.parseISODate(job.get('active_job').finished_active_at).add({seconds: pendingTrainingJobUpdates[jobId]}) < new Date()) {
                pendingTrainingJobUpdates[jobId] *= 2;
                that.updateTrainingQueueAndJobs(queue.getId());
              }
            }      
          });
        });
      }
    }

    that.updateDebug = function() {
      $("#debug2").html('&nbsp;Base Screen Visible.');
    };    

    that.runloop = function() {
      this.updateDebug();
      if (this.visible && _viewNeedsUpdate && AWE.GS.SettlementManager.getSettlement(that.baseId)) {
        this.updateView();
        _viewNeedsUpdate = false;
        console.log(that.baseId, AWE.GS.SettlementManager.getSettlement(that.baseId))
      }
      
      if (this.view) {   // make sure the view displays the right base.
        // this is executed, in case the settlement is received from the 
        // server for the first time or the baseId has been changed by 
        // this.setBaseId(int).
        var base = AWE.GS.SettlementManager.getSettlement(that.baseId);
        if (this.view.get('base') != base) {
          this.view.set('base', base);
          this.view.setSlots(null); // base has changed, so remove the slots!!!
        }
        
        if (base && base.slots() && AWE.Util.hashCount(base.slots()) > 0 && base.slots != base.slots()) {
          this.view.setSlots(base.slots());
          that.slots = base.slots();
          console.log('Set building slots.');
          AWE.Ext.applyFunctionToHash(that.slots, function(key, value) {
            console.log("building type id", value.get('building_id'));
          });
        }
        
        if (base && base.slots() && AWE.Util.hashCount(base.slots()) > 0) {
          that.updateOldJobsInConstructionQueues(base.getPath('hashableQueues.collection'));
        }

        if (base && this.view.get('selectedSlot')) {
          that.updateOldJobsInTrainingQueues(this.view.getPath('selectedSlot.building.trainingQueues'));
        }
      }
      
      that.updateModel();
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



