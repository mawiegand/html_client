/**
 * @fileOverview 
 * Screen controller for the settlement screen.
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
   * Screen controller for displaying a player's settlement  
   * @class
   * @extends AWE.Controller.ScreenController
   * @name AWE.Controller.SettlementController */
  module.createSettlementController = function(anchor) /** @lends AWE.Controller.SettlementController# */ {
      
    var _viewNeedsUpdate = false;  
    var _modelChanged = false;
    var _becameVisible = false;

          
    var that = module.createScreenController(anchor); // create base object
    
    that.view    = null;
    that.visible = false;
    that.settlementId  = null;
    
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
     * @name AWE.Controller.SettlementController#init */
    that.init = function(initialFrameModelCoordinates) {
      _super.init();            
    };   
    
    /** get all stages controlled by this controller. 
     * @function
     * @name AWE.Controller.SettlementController#getStages */
    that.getStages = function() { return []; }
    
    
    /** set the id of the base to display (it's the settlement id). 
     * @function
     * @name AWE.Controller.SettlementController#setSettlementId */
    that.setSettlementId = function(settlementId) { 
      this.settlementId = settlementId; 
    }
    
    /** set the id of the settlement to display by setting the location id.
     * looks-up the settlement id that is at that particular location
     * and even fetches it from the server, if it's missing.
     * @function
     * @name AWE.Controller.SettlementController#setLocationId */
    that.setLocationId = function(locationId) {
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(locationId);
      if (settlement === null) {
        that.setSettlementId(null);

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
        that.setSettlementId(settlement.getId());
      }
    }
    
    /** set the id of the fortress to display by setting the region id.
     * looks-up the settlement id that is at that particular node's slot 0
     * and even fetches it from the server, if it's missing.
     * @function
     * @name AWE.Controller.FortressController#setNode */
    that.setNode = function(node) {
      var location = node.region().location(0);
      if (!location) {
        that.setSettlementId(null);
        while (! AWE.Map.Manager.fetchLocationsForRegion(node.region(), function(region) {
          that.setLocationId(region.location(0).id());
        })) ;
      }
    }    

    
    /** removes the whole screen from the DOM.
     * @function
     * @name AWE.Controller.SettlementController#removeView */
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
     * @name AWE.Controller.SettlementController#updateView
     */
    that.updateView = function() {
      //that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
    }
    
    
    /** creates the screen by instantiating the corresponding views. Does not 
     * display the screen by itself! 
     * See {@link AWE.Controller.SettlementController#appendView}. 
     * @function
     * @name AWE.Controller.SettlementController#createView */
    that.createView = function() {
      var settlementScreen = null;
      var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId);

      if (!settlement) {
        return null;
      }
      
      var type = settlement.get('type_id');
      var viewClasses = {
        base:     AWE.UI.Ember.BaseView,
        fortress: AWE.UI.Ember.FortressView,
      };
      var viewClass = viewClasses[AWE.Config.MAP_LOCATION_TYPE_CODES[type]];
      
      if (viewClass) {
        settlementScreen = viewClass.create({
          controller :   this,
          settlement:    settlement,
        });
      }
      else {
        console.log('ERROR: screen for settlement of type ' + type + ' not yet implemented.');
      }    
      return settlementScreen;
    }
    
    /** appends the whole screen to the DOM, thus making it visible.
     * @function
     * @name AWE.Controller.SettlementController#appendView */
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      this.updateView();
      this.view = this.createView();
      if (this.view) {
        this.view.appendTo('#main-screen-controller');   
      }
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
    //   Actions
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.slotClicked = function(slot) {
      that.view.set('selectedSlot', slot);
      that.updateAllTrainingQueuesAndJobs();
    }
    
    that.unselectSlot = function() {
      that.view.set('selectedSlot', null);
    }
    
    // construction actions //////////////////////////////////////////////////
    
    var createAndSendConstructionJob = function(slot, buildingId, jobType, levelAfter) {
      
      if (!levelAfter) {
        levelAfter = 1;
      }
      
      var buildingType = AWE.GS.RulesManager.getRules().getBuildingType(buildingId);
      var queue = AWE.GS.ConstructionQueueManager.getQueueForBuildingCategorieInSettlement(buildingType.category, slot.get('settlement_id'));
      
      if (queue) {
        queue.sendCreateJobAction(slot.getId(), buildingId, jobType, levelAfter, function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            log(status, "Construction job created.");
            that.updateConstructionQueueSlotAndJobs(queue.getId());
            that.updateResourcePool();
          }
          else {
            log(status, "The server did not accept the construction command.");
            // TODO Fehlermeldung 
          }
        });
      }
      else {
        log("Could not find appropiate queue for building category, no job created");
      }
    } 

    that.constructionOptionClicked = function(slot, building, type) {
      
      log('constructionOptionClicked', slot, building, type);  // TODO type is production category - > rename
      
      var buildingId = building.get('buildingId');
      if (building.get('requirementsMet')) {
        createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE);      
        this.unselectSlot();
      }
      else {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          contentTemplateName: 'requirements-missing-info',
          arguments:           building,
          cancelText:          'Argh!',
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);
      }
    }
    
    that.constructionUpgradeClicked = function(slot) {
      var nextLevel = slot.get('building').get('nextLevel');
      createAndSendConstructionJob(slot, slot.get('building_id'), AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE, nextLevel);    
    }  
    
    that.constructionCancelClicked = function(job) {
      var queue = job.get('queue');
      queue.sendCancelJobAction(job.getId(), function(status) {
        if (status === AWE.Net.OK) {    // 200 OK
          log(status, "Construction job deleted.");
          that.updateConstructionQueueSlotAndJobs(queue.getId());          
          that.updateResourcePool();
        }
        else {
          log(status, "The server did not accept the job removal command.");
          // TODO Fehlermeldung 
        } 
      });
    }
    
    // training actions //////////////////////////////////////////////////////  
    
    that.trainingCreateClicked = function(queue, unitId, quantity) {
      queue.sendCreateJobAction(unitId, quantity, function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log(status, "Training job created.");
          that.updateTrainingQueueAndJobs(queue.getId());
          that.updateResourcePool();
        }
        else {
          log(status, "The server did not accept the training command.");
          // TODO Fehlermeldung 
        }
      })
    }  
    
    that.trainingCancelClicked = function(job) {
      var queue = job.get('queue');
      queue.sendCancelJobAction(job.getId(), function(status) {
        if (status === AWE.Net.OK) {    // 200 OK
          log(status, "Training job deleted.");
          that.updateTrainingQueueAndJobs(queue.getId());
          that.updateResourcePool();
        }
        else {
          log(status, "The server did not accept the job removal command.");
          // TODO Fehlermeldung 
        }
      });
    }  
    
    
    
    
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
      AWE.GS.SettlementManager.updateSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
        log('updated settlement', settlement)
      });
    }

    // slot update method

    that.updateSlots = function() {
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
      });
    }
      
    // construction queue and job update methods
    
    that.updateConstructionQueueSlotAndJobs = function(queueId) {
      AWE.GS.ConstructionQueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queue) {
        log('updated construction queue', queueId);
      });

      // as we don't know the right slot (or slot id), we update all slots
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {      
      });

      AWE.GS.ConstructionJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
      });
    }
        
    that.updateAllConstructionQueuesAndJobs = function() {
      AWE.GS.ConstructionQueueManager.updateQueuesOfSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
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
      AWE.GS.TrainingQueueManager.updateQueuesOfSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
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
        AWE.GS.SettlementManager.updateSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
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
        if (that.settlementId > 0 && that.view && (
              lastSettlementId != that.settlementId ||
              lastSettlementUpdateCheck.getTime() + AWE.Config.SETTLEMENT_REFRESH_INTERVAL < +new Date() ||
              that.modelChanged() ||
              _becameVisible)) {
                
          AWE.GS.SettlementManager.updateSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
            log('updated settlement', settlement);
            if (settlement && settlement.getId()) {
              that.updateSlots();
              that.updateAllConstructionQueuesAndJobs();
              if (that.view && that.view.get('selectedSlot')) {  // check view again, may have become invisible during meantime
                that.updateAllTrainingQueuesAndJobs();
              }
            }
          });

          lastSettlementUpdateCheck = new Date();
          lastSettlementId = that.settlementId;
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
      $("#debug2").html('&nbsp;Settlement Screen Visible.');
    };    
    
    var counter = 0;
    that.runloop = function() {
      if (counter++ % 2 !== 0) return ; // skip every other "frame"
      
      this.updateDebug();
      
      if (this.visible && !this.view && this.settlementId) {
        console.log('APPEND', this.settlementId, this.settlement);
        this.appendView();           
      }
      
      if (this.visible && _viewNeedsUpdate && AWE.GS.SettlementManager.getSettlement(that.settlementId)) {
        this.updateView();
        _viewNeedsUpdate = false;
      }
      
      if (this.view) {   // make sure the view displays the right settlement.
        // this is executed, in case the settlement is received from the 
        // server for the first time or the settlementId has been changed by 
        // this.setSettlementId(int).
        var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId);
        
        if (this.view.get('settlement') != settlement) {
          this.view.set('settlement', settlement);
          console.log('SWITCHED BASE IN RUNLOOP TO', settlement);
        }
                
        if (settlement && settlement.getPath('hashableQueues.collection')) {
          that.updateOldJobsInConstructionQueues(settlement.getPath('hashableQueues.collection'));
        }

        if (settlement && this.view.get('selectedSlot')) {
          that.updateOldJobsInTrainingQueues(this.view.getPath('selectedSlot.building.trainingQueues'));
        }
      }
      
      that.updateModel();
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



