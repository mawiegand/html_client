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
    that.locationId    = null;
    
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
    
    
    that.status = Ember.Object.create({
      sendingUpgrade: null,
      sendingDestroy: null,
      sendingConvert: null,
    })
    
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
      this.locationId = locationId;
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
        fortress: AWE.UI.Ember.FortressView,
        base:     AWE.UI.Ember.BaseView,
        outpost:  AWE.UI.Ember.OutpostView,
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
    
    var createAndSendConstructionJob = function(slot, buildingId, jobType, levelBefore, levelAfter) {
      
      if (levelBefore == null || levelBefore == undefined) {
        levelBefore = 0;
      }
      
      if (levelAfter == null || levelAfter == undefined) {
        levelAfter = 1;
      }
      
      var buildingType = AWE.GS.RulesManager.getRules().getBuildingType(buildingId);
      var queue = AWE.GS.ConstructionQueueManager.getQueueForBuildingCategorieInSettlement(buildingType.category, slot.get('settlement_id'));
      
      if (queue && queue.get('max_length') > queue.get('jobs_count')) {
        switch (jobType) {
          case AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE:
            that.status.set('sendingUpgrade', true);
            break;      
          case AWE.GS.CONSTRUCTION_JOB_TYPE_DESTROY:
            that.status.set('sendingDestroy', true);
            break;      
          case AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT:
            that.status.set('sendingConvert', true);
            break;      
        }
        
        // log('---> level', slot.getPath('building.level'));
        
        var createJobAction = AWE.Action.Construction.createJobCreateAction(queue, slot.getId(), buildingId, jobType, levelBefore, levelAfter);
        createJobAction.send(function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
            log(status, "Construction job created.");
            AWE.GS.ResourcePoolManager.updateResourcePool();
            AWE.GS.SlotManager.updateSlot(slot.getId(), null, function() {
              
              log('---> next level', slot.getPath('building.nextLevel'));
              
              switch (jobType) {
                case AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE:
                  that.status.set('sendingUpgrade', false);
                  break;      
                case AWE.GS.CONSTRUCTION_JOB_TYPE_DESTROY:
                  that.status.set('sendingDestroy', false);
                  break;      
                case AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT:
                  that.status.set('sendingConvert', false);
                  break;      
              }
            });
          }
          else {
            console.log(status, "ERROR: The server did not accept the construction command.");
            var dialog = AWE.UI.Ember.InfoDialog.create({
              contentTemplateName: 'server-command-failed-info',
              cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
              okPressed:           null,
              cancelPressed:       function() { this.destroy(); },
            });          
            WACKADOO.presentModalDialog(dialog);
            switch (jobType) {
              case AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE:
                that.status.set('sendingUpgrade', false);
                break;      
              case AWE.GS.CONSTRUCTION_JOB_TYPE_DESTROY:
                that.status.set('sendingDestroy', false);
                break;      
              case AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT:
                that.status.set('sendingConvert', false);
                break;      
            }
          }

          // update queue in any case: success: jobs gone. failure: old data on client side
          AWE.GS.ConstructionQueueManager.updateQueue(queue.getId(), null, function() { //
            AWE.GS.ConstructionJobManager.updateJobsOfQueue(queue.getId());
            console.log('U: construction queue, success');
          });          
        });
      }
      else {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          contentTemplateName: 'construction-queue-full-info',
          arguments:           queue,
          cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);
        console.log("WARNING: Could not find appropiate queue for building category, or no empty slot left.");
      }
    } 

    that.constructionOptionClicked = function(slot, building, type, buildingOptionView) {
      
      log('constructionOptionClicked', slot, building, type);  // TODO type is production category - > rename
      
      var buildingId = building.get('buildingId');
      if (building.requirementsMet()) {
        createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE);      
        this.unselectSlot();
      }
      else {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          contentTemplateName: 'requirements-missing-info',
          arguments:           buildingOptionView,
          cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);
      }
    }
    
    that.constructionUpgradeClicked = function(slot) {
      var currentLevel = slot.get('building').get('levelAfterJobs');
      var nextLevel = slot.get('building').get('nextLevel');
      createAndSendConstructionJob(slot, slot.get('building_id'), AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE, currentLevel, nextLevel);    
    }  
    
    that.constructionCancelClicked = function(job) {
      var queue = job.get('queue');
      queue.sendCancelJobAction(job.getId(), function(status) {
        if (status === AWE.Net.OK) {    // 200 OK
          log(status, "Construction job deleted.");
          that.updateConstructionQueueSlotAndJobs(queue.getId());          
       //   that.updateResourcePool();
        }
        else {
          log(status, "The server did not accept the job removal command.");
          // TODO Fehlermeldung 
        } 
      });
    }
    
    that.constructionFinishClicked = function(job) {
      var queue = job.get('queue');
      queue.sendFinishJobAction(job.getId(), function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log(status, "Construction job finished.");
          that.updateConstructionQueueSlotAndJobs(queue.getId());    
       //   that.updateResourcePool();      
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'not-enough-cash-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'server-command-failed-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the job finish command.");
          // TODO Fehlermeldung 
        } 
      });
    }
    
    that.constructionDestroyClicked = function(slot) {
      
      var buildingId = slot.get('building_id');
      log('constructionDestroyClicked', slot, buildingId, slot.get('jobsInQueue') );
      
      // testen ob queue keine jobs enthält
      
      if (buildingId && slot.get('jobsInQueue')) {
        if(slot.get('jobsInQueue').length == 0) {
          createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_DESTROY, slot.get('level'), 0);      
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'construction-queue-not-empty-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
        }
      }
      else {
        log(status, "No buildingId, no valid slot or no list of jobs.");
      }
    }
    
    that.constructionConvertClicked = function(slot) {
      
      var buildingId = slot.get('building_id');
      var convertedLevel = slot.getPath('building.convertedLevel');
      log('constructionConvertClicked', slot, buildingId, convertedLevel, slot.get('jobsInQueue') );
      
      // testen ob queue keine jobs enthält
      if (buildingId && slot.get('jobsInQueue')) {
        if(slot.get('jobsInQueue').length == 0) {
          createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_CONVERT, slot.get('level'), convertedLevel);      
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'construction-queue-not-empty-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
        }
      }
      else {
        log(status, "No buildingId, no valid slot or no list of jobs.");
      }
    }
    
    // training actions //////////////////////////////////////////////////////  
    
    that.trainingCreateClicked = function(queue, unitId, quantity) {
      if (queue && queue.get('max_length') > queue.get('jobs_count')) {
        queue.sendCreateJobAction(unitId, quantity, function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            log(status, "Training job created.");
            that.updateTrainingQueueAndJobs(queue.getId());
        //    that.updateResourcePool();
          }
          else {
            log(status, "The server did not accept the training command.");
            // TODO Fehlermeldung 
          }
        });
      }
      else {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          contentTemplateName: 'training-queue-full-info',
          arguments:           queue,
          cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           null,
          cancelPressed:       function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);
      }
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
    
    that.trainingSpeedupClicked = function(job) {
      var queue = job.get('queue');
      queue.sendSpeedupJobAction(job.getId(), function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log(status, "Training time halved.");
          that.updateTrainingQueueAndJobs(queue.getId());    
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'not-enough-cash-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'server-command-failed-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the training job speedup command.");
          // TODO Fehlermeldung 
        } 
      });
    }    
    
    that.sendTradingCarts = function(settlementId, recipientName, resources, callback) {
      var action = AWE.Action.Trading.createSendTradingCartsAction(settlementId, recipientName, resources);
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
          that.updateTradingCartActions(true, function() {
            if (callback) {
              callback(status); // send original status, ignore status of update
            }
          });
          AWE.GS.SettlementManager.updateSettlement(settlementId);
          that.updateResourcePool();
        }
        else if (status === AWE.Net.NOT_FOUND) {  // no error dialog
          if (callback) {
            callback(status);
          }
        }
        else {  // show error dialog
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'server-command-failed-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the trading carts send command.");
          if (callback) {
            callback(status);
          }
        }
      });      
    }
    
    
    that.cancelTradingCartAction = function(tradingCartActionId, callback) {
      var action = AWE.Action.Trading.createTradingCartCancelAction(tradingCartActionId);
      action.send(function(status) {
        if (status === AWE.Net.OK) {
          AWE.GS.TradingCartActionManager.updateTradingCartAction(tradingCartActionId, function() {
            if (callback) {
              callback(status);
            }
          });
        }  
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'server-command-failed-info',
            cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            okPressed:           null,
            cancelPressed:       function() { this.destroy(); },
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the trading carts cancel command.");
          if (callback) {
            callback(status);
          }
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
    
    that.updateConstructionQueueSlotAndJobs = function(queueId, callback) {
      AWE.GS.ConstructionQueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queue) {
        log('updated construction queue', queueId);
      });
      
      this.updateResourcePool(); // update the pool for the case this update was triggered because a job was finished (and a new one might have started)

      // as we don't know the right slot (or slot id), we update all slots
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {      
      });

      AWE.GS.ConstructionJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
        if (callback) {
          callback();
        }
      });
    }
     
    that.updateTradingCartActions = (function() {
      
      var lastUpdate = null;
      var individualRequests = {};
      
      return function(forceNow, callback) {
        forceNow = forceNow || false;
                
        if (forceNow || lastUpdate === null || lastUpdate < new Date().add(-20).seconds()) { // attention: "add" modifies the date and doesn't create a copy with altered time!
                    
          var updates = 0;
          lastUpdate = new Date();
      
          AWE.GS.TradingCartActionManager.updateIncomingTradingCartsAtSettlement(this.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(tradingCartActions, status) {
            if (callback && ++updates == 2) { // can't be sure, which update finishes first
              callback(status);
            }
          });

          AWE.GS.TradingCartActionManager.updateOutgoingTradingCartsAtSettlement(this.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(tradingCartActions, status) {
            var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId);

            if (callback && ++updates == 2) {
              callback(status);
            }
          });
        }
        
        /** update outgoing trading cart actions that should have returned to settlement by now. */
        var hash    = AWE.GS.TradingCartActionManager.getOutgoingTradingCartsForSettlementHash(that.settlementId);
        var actions = hash ? hash.get('collection') : [];
        actions.forEach(function(item) {
          if (item.get('returning') && Date.parseISODate(item.get('returned_at')) < AWE.GS.TimeManager.estimatedServerTime().add(-1).seconds() &&
              (individualRequests[item.get('id')] === undefined || individualRequests[item.get('id')] < new Date().add(-10).seconds())) {
            individualRequests[item.get('id')] = new Date();
            AWE.GS.TradingCartActionManager.updateTradingCartAction(item.get('id'));
          } 
        });

        /** destroy (client side) incoming trading cart actions that should have reached the settlement by now. */
        hash    = AWE.GS.TradingCartActionManager.getIncomingTradingCartsForSettlementHash(that.settlementId);
        var actions = hash ? hash.get('collection') : [];
        actions.forEach(function(item) {
          if (Date.parseISODate(item.get('target_reached_at')) < AWE.GS.TimeManager.estimatedServerTime().add(-2).seconds()) {
            console.log('destroyed incoming trading carts action id', item.get('id'));
            item.destroy();
          } 
        });        
  
      }
    }());     
        
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
        AWE.GS.TutorialStateManager.checkForRewards();
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
     
    that.updateAllTrainingQueues = function() {
      AWE.GS.TrainingQueueManager.updateQueuesOfSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
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
              else if (that.view) {  // only update queues, not jobs, if training queue is not visible
                that.updateAllTrainingQueues();
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
          if (!queue) {
            console.log('queue was undefined');
          }
          else {
            var jobs = AWE.GS.ConstructionJobManager.getJobsInQueue(queue.getId());
            jobs.forEach(function(job) {
              if (job.get('active_job')) {
                var jobId = job.getId();
                pendingConstructionJobUpdates[jobId] = pendingConstructionJobUpdates[jobId] > 0 ? pendingConstructionJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
                if (Date.parseISODate(job.get('active_job').finished_at).add({seconds: pendingConstructionJobUpdates[jobId]}) < AWE.GS.TimeManager.estimatedServerTime().add(-1).seconds()) {
                  pendingConstructionJobUpdates[jobId] *= 2;
                  that.updateConstructionQueueSlotAndJobs(queue.getId());
                }
              }  
            });
          }
        });
      }
    }

 
    var pendingTrainingJobUpdates = {};
    
    that.updateOldJobsInTrainingQueues = function(queues) {
      if (queues) {
        queues.forEach(function(queue) {
          if (!queue) {
            console.log('training queue was undefined');
          }
          else {          var jobs = AWE.GS.TrainingJobManager.getJobsInQueue(queue.getId());
            jobs.forEach(function(job) {
              if (job.get('active_job')) {
                var jobId = job.getId();
                pendingTrainingJobUpdates[jobId] = pendingTrainingJobUpdates[jobId] > 0 ? pendingTrainingJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
                if (Date.parseISODate(job.get('active_job').finished_active_at).add({seconds: pendingTrainingJobUpdates[jobId]}) < AWE.GS.TimeManager.estimatedServerTime().add(-1).seconds()) {
                  pendingTrainingJobUpdates[jobId] *= 2;
                  that.updateTrainingQueueAndJobs(queue.getId());
                }
              }      
            });
          }
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

        if (settlement && this.view.getPath('selectedSlot.building.unlockedPlayerToPlayerTrade')) {
          that.updateTradingCartActions();
        }

      }
      
      else if (!this.settlementId && this.locationId) {
        this.setLocationId(this.locationId); 
      }
      that.updateModel();
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



