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

    var _welcomeDialogClosed = false;
    
    var that = module.createScreenController(anchor); // create base object
    
    that.typeName = 'SettlementController';
    
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
      that.updateGossipIfNecessary();     
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
      log('PRESENT SETTLEMENT ID', that.settlementId);
      this.settlementId = settlementId; 
      log('NEW SETTLEMENT ID', settlementId, that.settlementId);
      WACKADOO.hudController.notifyAboutNewControllerSettlement(settlementId);
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
          AWE.GS.ArtifactManager.updateArtifactOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
        }
        else {  // seems as there's no settlement at this location!
          log('ERROR: could not obtain settlement at present location from server.')
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

      log('CREATE VIEW OF TYPE', viewClass, type, settlement.get('type_id'), settlement.get('id'));
      
      if (viewClass) {
        settlementScreen = viewClass.create({
          controller :   this,
          settlement:    settlement,
          classNames: ["settlement-container"],
        });
      }
      else {
        log('ERROR: screen for settlement of type ' + type + ' not yet implemented.');
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
        WACKADOO.extrasController.initRetentionEgg('#retentionEgg');
      }
    }
    
    
    that.viewDidAppear = function() {
      this.cleanupIfNecessary();
      
      this.visible = true;
      _becameVisible = true;
      this.appendView();
    };
    
    that.viewWillDisappear = function() {
      this.removeView();
      this.visible = false;
    };

    that.readyForUI = function() {
      if (_welcomeDialogClosed && that.view) {
        var slots = that.view.get('slots');
        if (slots && AWE.Ext.isArray(slots) && AWE.Util.arrayCount(slots) > 0) {
          return true;
        }
      }
      return false;
    };

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Actions
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.welcomeDialogClosed = function() {
      _welcomeDialogClosed = true;
    }

    that.previousSettlementPressed = function() {
      var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId);
      var previousSettlement = AWE.GS.SettlementManager.getPreviousSettlementOfCharacter(settlement);
      if (previousSettlement) {
        log('PREVIOUS SETTLEMENT', previousSettlement.get('id'));
        WACKADOO.activateSettlementController(previousSettlement);
      }      
    }
    
    that.nextSettlementPressed = function() {
      var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId, that.settlementId);
      var nextSettlement = AWE.GS.SettlementManager.getNextSettlementOfCharacter(settlement);
      if (nextSettlement) {
        log('NEXT SETTLEMENT', nextSettlement.get('id'));
        WACKADOO.activateSettlementController(nextSettlement);
      }
    }

    that.onMouseWheel = function (evt) {
      if ($(evt.target).parents('div.wrapper').length || $(evt.target).hasClass('wrapper')) {
        if ($(evt.target).hasClass('wrapper')) {
          target = $(evt.target);
        } else {
          target = $(evt.target).parents('div.wrapper');
        }
        
        if (target.prop('scrollHeight') == target.prop('clientHeight')) {
          return;
        }

        delta = that.mouseWheelDelta(evt);
        if (delta > 0) {
          if (target.prop('scrollHeight') <= target.prop('clientHeight') + target.prop('scrollTop')) { 
            evt.preventDefault();
          }
        } else if (delta < 0) {
          if (target.prop('scrollTop') <= 0) { 
            evt.preventDefault();
          }
        }
      }
    }

    that.mouseWheelDelta = function(evt) {
      if (evt.originalEvent.deltaY) return evt.originalEvent.deltaY;
      if (evt.originalEvent.detail) return evt.originalEvent.detail;
      if (evt.originalEvent && evt.originalEvent.wheelDelta) return evt.originalEvent.wheelDelta * -1;
    }

    that.slotClicked = function(slot) {
      var prevSlot = that.view.getPath('selectedSlot');
      if(slot.id === that.view.getPath('selectedSlot.id'))
      {
        that.unselectSlot();
      }
      else
      {
        that.view.set('selectedSlot', slot);
      }
      if (slot.getPath('building.unlockedAssignments')) {
        that.updateGossipIfNecessary();
      }
      that.updateAllTrainingQueuesAndJobs();
      that.updateStandardAssignmentsFromServer();
      that.updateSpecialAssignmentsFromServer();
      this.updateUIMarker();
      if(!slot.get("building"))
      {
        if(prevSlot && prevSlot.get("building"))
        {
          that.unselectSlot();
        }
        else
        {
          var dialog = AWE.UI.Ember.BuildingSelectionDialog.create({
            controller: this,
            slot: slot});
          WACKADOO.presentModalDialog(dialog);
        }
      }  
    }
    
    that.unselectSlot = function() {
      if(that.view.get('selectedSlot'))
      {
         that.view.setPath('selectedSlot.uiMarker', false);
      }
      that.view.set('selectedSlot', null);
      this.updateUIMarker();      
    }
    
    // construction actions //////////////////////////////////////////////////
    
    that.constructionInfoClicked = function(slot) {
      if(slot.get("building")) {
        var dialog = AWE.UI.Ember.BuildingOptionDetailNewDialog.create({building: slot.get('building'), level: slot.getPath('building.levelAfterJobs')});
        WACKADOO.presentModalDialog(dialog);
      }
    }
    
    var createAndSendConstructionJob = function(slot, buildingId, jobType, levelBefore, levelAfter) {
      
      if (levelBefore == null || levelBefore == undefined) {
        levelBefore = 0;
      }
      
      if (levelAfter == null || levelAfter == undefined) {
        levelAfter = 1;
      }
      
      var buildingType = AWE.GS.RulesManager.getRules().getBuildingType(buildingId);
      var queue = AWE.GS.ConstructionQueueManager.getQueueForBuildingCategorieInSettlement(buildingType.category, slot.get('settlement_id'));
      
      var settlement = AWE.GS.SettlementManager.getSettlement(that.settlementId);
      var space = settlement.get('availableBuildingSlots');

      
      if (space <= 0 && jobType === AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE) {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          message:             AWE.I18n.lookupTranslation('building.error.notEnoughBuildingSlots'),
          
          okText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
        });
        WACKADOO.presentModalDialog(dialog);
      }
      else if (queue && queue.get('max_length') > queue.get('jobs_count')) {
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
              
              // log('---> next level', slot.getPath('building.nextLevel'));
              
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
            var dialog = null;

            if (status == AWE.Net.CONFLICT) {
              log(status, "ERROR: The server did not accept the construction command. Requirements not met.");
              dialog = AWE.UI.Ember.InfoDialog.create({
                heading:             AWE.I18n.lookupTranslation('settlement.buildings.requirementsNotMet.heading'),
                message:             AWE.I18n.lookupTranslation('settlement.buildings.requirementsNotMet.text'),
                okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
              });
            }
            else {
              log(status, "ERROR: The server did not accept the construction command.");
              dialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
                message: AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
                okText: AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
              });
            }
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
            that.updateUIMarker();
            log('U: construction queue, success');
          });          
        });
      }
      else {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          contentTemplateName: 'construction-queue-full-info',

          arguments:           queue,
          okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          okPressed:           function() { this.destroy(); },
        });          
        WACKADOO.presentModalDialog(dialog);
        log("WARNING: Could not find appropiate queue for building category, or no empty slot left.");
      }
    } 

    that.constructionOptionClicked = function(slot, building, type, buildingOptionView) {
      
      log('constructionOptionClicked', slot, building, type);  // TODO type is production category - > rename

      var buildingId = building.get('buildingId');
      if (building.requirementsMet()) {

        createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE);      
        //WACKADOO.closeAllModalDialogs();
        //this.unselectSlot();
      }

      // if requirements are not met, just do nothing
    }
    
    that.constructionUpgradeClicked = function(slot) {
      that.updateUIMarker();
      var currentLevel = slot.get('building').get('levelAfterJobs');
      var nextLevel = slot.get('building').get('nextLevel');
      createAndSendConstructionJob(slot, slot.get('building_id'), AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE, currentLevel, nextLevel);    
    }  
    
    that.constructionCancelClicked = function(job) {
      if (job) {
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
    }
    
    that.constructionFinishClicked = function(job) {
      if (job) {
        var queue = job.get('queue');
        queue.sendFinishJobAction(job.getId(), function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            log(status, "Construction job finished.");
            that.updateConstructionQueueSlotAndJobs(queue.getId());
            that.updateAllTrainingQueues();
          }
          else if (status === AWE.Net.FORBIDDEN) {
            var dialog = AWE.UI.Ember.InfoDialog.create({
              message:             AWE.I18n.lookupTranslation('building.error.notEnoughCash'),
              okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
          }
          else {
            var dialog = AWE.UI.Ember.InfoDialog.create({
              heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
              message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
              okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
            log(status, "The server did not accept the job finish command.");
            // TODO Fehlermeldung 
          } 
        });
      }
    }
    
    that.constructionDestroyClicked = function(slot) {
      if (slot) {
        var buildingId = slot.get('building_id');
        log('constructionDestroyClicked', slot, buildingId, slot.get('jobsInQueue') );
      
        // testen ob queue keine jobs enthält
      
        if (buildingId && slot.get('jobsInQueue')) {
          if(slot.get('jobsInQueue').length == 0) {
            createAndSendConstructionJob(slot, buildingId, AWE.GS.CONSTRUCTION_JOB_TYPE_DESTROY, slot.get('level'), 0);      
          }
          else {
            var dialog = AWE.UI.Ember.InfoDialog.create({
              message:             AWE.I18n.lookupTranslation('settlement.buildings.constructionQueueNotEmpty.msg'),
              okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
          }
        }
        else {
          log(status, "No buildingId, no valid slot or no list of jobs.");
        }
      }
    }
    
    that.constructionConvertClicked = function(slot) {
      if (slot) {
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
              message:             AWE.I18n.lookupTranslation('settlement.buildings.constructionQueueNotEmpty.msg'),
              cancelText:          AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
          }
        }
        else {
          log(status, "No buildingId, no valid slot or no list of jobs.");
        }
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
        });          
        WACKADOO.presentModalDialog(dialog);
      }
    }  
    
    that.trainingCancelClicked = function(job) {
      if (job) {
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
    }  
    
    that.trainingSpeedupClicked = function(job) {
      if (job) {
        var queue = job.get('queue');
        queue.sendSpeedupJobAction(job.getId(), function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            log(status, "Training time halved.");
            that.updateTrainingQueueAndJobs(queue.getId());    
          }
          else if (status === AWE.Net.FORBIDDEN) {
            var dialog = AWE.UI.Ember.InfoDialog.create({
              message:             AWE.I18n.lookupTranslation('building.error.notEnoughCash'),
              okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
          }
          else {
            var dialog = AWE.UI.Ember.InfoDialog.create({
              heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
              message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
              okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
            });          
            WACKADOO.presentModalDialog(dialog);
            log(status, "The server did not accept the training job speedup command.");
            // TODO Fehlermeldung 
          } 
        });
      }
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
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
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
          AWE.GS.TradingCartActionManager.updateTradingCartAction(tradingCartActionId, null, function() {
            if (callback) {
              callback(status);
            }
          });
        }  
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the trading carts cancel command.");
          if (callback) {
            callback(status);
          }
        }
      });
    }
    
    that.speedupTradingCartAction = function(tradingCartActionId, callback) {
      var action = AWE.Action.Trading.createTradingCartSpeedupAction(tradingCartActionId);
      action.send(function(status) {
        if (status === AWE.Net.OK) {
          AWE.GS.TradingCartActionManager.updateTradingCartAction(tradingCartActionId, null, function() {
            if (callback) {
              callback(status);
            }
          });
        }  
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          });          
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the trading carts speedup command.");
          if (callback) {
            callback(status);
          }
        }
      });
    }
    
    that.startArtifactInitiation = function(artifact, callback) {
      var action = AWE.Action.Fundamental.createStartArtifactInitiationAction(artifact);
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
          AWE.GS.ArtifactManager.updateArtifact(artifact.getId());
          AWE.GS.SettlementManager.updateSettlement(that.settlementId);
          // TODO anything else to update?
          that.updateResourcePool();
          if (callback) {
            callback();
          }
        }
        else {  // show error dialog
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('settlement.artifact.notEnoughResources.header'),
            message:             AWE.I18n.lookupTranslation('settlement.artifact.notEnoughResources.content'),
            okText:              AWE.I18n.lookupTranslation('settlement.artifact.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the artifact initiation command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.artifactInitiationSpeedupPressed = function(artifact, callback) {
      var action = AWE.Action.Fundamental.createSpeedupArtifactInitiationAction(artifact);
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.ArtifactManager.updateArtifact(artifact.getId(), null, function() {
            if (callback) {
              callback();
            }
          });
          AWE.GS.SettlementManager.updateSettlement(that.settlementId);
          that.updateResourcePool();
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            message:             AWE.I18n.lookupTranslation('building.error.notEnoughCash'),
            okText:              AWE.I18n.lookupTranslation('settlement.artifact.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          if (callback) {
            callback();
          }
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.artifact.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the artifact initiation speedup command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.standardAssignmentStartPressed = function(assignmentType, callback) {
      try { //we need this to stop this function on errors
        var costs = assignmentType.costs || []; 
        var pool = AWE.GS.ResourcePoolManager.getResourcePool();
        AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
          var amount = costs[item.id];
          if (amount && amount > 0) {
            if(parseInt(amount) > parseInt(pool[item.symbolic_id+'_present'])) {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
                message: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.content.'+item.symbolic_id),
              }); 
              WACKADOO.presentModalDialog(errorDialog);
              if (callback) {
                callback();
              }
              throw 'error';
            }
          }
        });
      
        var garrison_id = AWE.GS.SettlementManager.getSettlement(that.settlementId).get('garrison_id');
        var army = AWE.GS.ArmyManager.getArmy(garrison_id);
        var deposits = assignmentType.unit_deposits || [];
        AWE.GS.RulesManager.getRules().unit_types.forEach(function(type) {
          var required = deposits[type.id];
          if(required && army) {
            if(parseInt(army.details[type.db_field]) < parseInt(required)) {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
                message: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.content.armies'),
              }); 
              WACKADOO.presentModalDialog(errorDialog);
              if (callback) {
                callback();
              }
              throw 'error';
            }
          }
        });
      } catch(err) {
        if (callback) {
          callback();
        }
        return;
      }

      var action = AWE.Action.Assignment.createStartStandardAssignmentAction(assignmentType.id);
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.StandardAssignmentManager.updateStandardAssignmentsOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), null, function() {
            if (callback) {
              callback();
            }
          });
          AWE.GS.ArmyManager.updateArmiesAtLocation(that.locationId, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
          });
        }
        else if (status === AWE.Net.CONFLICT) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('settlement.assignment.error.conflict.header'),
            message:             AWE.I18n.lookupTranslation('settlement.assignment.error.conflict.content'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
            message:             AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.text'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.standardAssignmentSpeedupPressed = function(assignment, callback) {
      var action = AWE.Action.Assignment.createSpeedupStandardAssignmentAction(assignment.getId());
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.StandardAssignmentManager.updateStandardAssignment(assignment.getId(), null, function() {
            if (callback) {
              callback();
            }
          });
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.standardAssignmentFinishPressed = function(assignment, callback) {
      var action = AWE.Action.Assignment.createRedeemStandardAssignmentRewardAction(assignment.getId());
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.StandardAssignmentManager.updateStandardAssignment(assignment.getId(), null, function() {
            if (callback) {
              callback();
            }
          });
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.specialAssignmentFinishPressed = function(assignment, callback) {
      var action = AWE.Action.Assignment.createRedeemSpecialAssignmentRewardAction(assignment.getId());
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.SpecialAssignmentManager.updateSpecialAssignment(assignment.getId(), null, function() {
            if (callback) {
              callback();
            }
          });
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.specialAssignmentStartPressed = function(assignment, callback) {
      try { //we need this to stop this function on errors
        var pool = AWE.GS.ResourcePoolManager.getResourcePool();
        AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
          var amount = assignment.get(item.symbolic_id+'_cost');
          if (amount && amount > 0) {
            if(parseInt(amount) > parseInt(pool[item.symbolic_id+'_present'])) {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
                message: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.content.'+item.symbolic_id),
              }); 
              WACKADOO.presentModalDialog(errorDialog);
              if(callback) {
                callback();
              };
              throw 'error';
            }
          }
        });
      
        var garrison_id = AWE.GS.SettlementManager.getSettlement(that.settlementId).get('garrison_id');
        var army = AWE.GS.ArmyManager.getArmy(garrison_id);
        AWE.GS.RulesManager.getRules().unit_types.forEach(function(type) {
          var required = assignment.get(type.db_field+'_deposit');
          if(required && army) {
            if(parseInt(army.details[type.db_field]) < parseInt(required)) {
              var errorDialog = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
                message: AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.content.armies'),
              }); 
              WACKADOO.presentModalDialog(errorDialog);
              if(callback) {
                callback();
              };
              throw 'error';
            }
          }
        });
      } catch(err) {
        if (callback) {
          callback();
        }
        return;
      }

      var action = AWE.Action.Assignment.createStartSpecialAssignmentAction(assignment.id);
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.SpecialAssignmentManager.updateSpecialAssignmentOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), null, function() {
            if (callback) {
              callback();
            }
          });
          AWE.GS.ArmyManager.updateArmiesAtLocation(that.locationId, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
          });
        }
        else if (status === AWE.Net.CONFLICT) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('settlement.assignment.error.conflict.header'),
            message:             AWE.I18n.lookupTranslation('settlement.assignment.error.conflict.content'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
        else if (status === AWE.Net.FORBIDDEN) {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.header'),
            message:             AWE.I18n.lookupTranslation('settlement.assignment.error.prerequisites.text'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };

    that.specialAssignmentSpeedupPressed = function(assignment, callback) {
      var action = AWE.Action.Assignment.createSpeedupSpecialAssignmentAction(assignment.getId());
      action.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.SpecialAssignmentManager.updateSpecialAssignment(assignment.getId(), null, function() {
            if (callback) {
              callback();
            }
          });
        }
        else {
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.assignment.cancelText'),
          });
          WACKADOO.presentModalDialog(dialog);
          log(status, "The server did not accept the assignment start command.");
          if (callback) {
            callback();
          }
        }
      });
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Tutorial Marker
    //
    // ///////////////////////////////////////////////////////////////////////

    that.lastMarkerUpdate = new Date(1970);

    that.updateUIMarker = function() {


      var selectedSlot = that.view.get('selectedSlot');
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if (tutorialState.get('noFurtherUserInteractionNeeded')) {
        if (selectedSlot != null) {
          selectedSlot.set('uiMarker', false);
        }
        return;
      }

      if (selectedSlot != null) {
        if (that.markFirstStandardAssignment()) {
          var assignments = AWE.GS.game.getPath('currentCharacter.enumerableStandardAssignments');
          if (assignments != null && AWE.Ext.isArray(assignments) && AWE.Util.arrayCount(assignments) > 0) {
            assignments[0].set('uiMarker', true);
          }
        }

        
        if (that.markUpgradeButton() || that.markBuildingToStartAssignment() || that.markUnitsButton()) {
          selectedSlot.set('uiHUDMarker', true);
        }
        else {
          selectedSlot.set('uiHUDMarker', false);
        }
      }
     // else {//added uncommited else for upgrade tutorial state
        var placeArrowAboveFreeSpot = that.markFreeConstructionSpot();
        var slotToMark = (!placeArrowAboveFreeSpot && this.markUpgradeableBuilding()) ? that.whichSlotToMarkForUpgrade() : null;

        if (!placeArrowAboveFreeSpot && !slotToMark) {
          slotToMark = that.markBuildingToStartAssignment() ? that.whichSlotToMarkForAssignment() : null;
        }

        if (!placeArrowAboveFreeSpot && !slotToMark) {
          slotToMark = that.markUnitsButton() ? that.whichSlotToMarkForUnitsButton() : null;
        }

        if (!tutorialState.get('noFurtherUserInteractionNeeded') && placeArrowAboveFreeSpot && slotToMark == null) {
          slotToMark = that.nextBuildingSlotToMark();
        }

        var slots = that.view.get('slots');
        if (slots == null || !AWE.Ext.isArray(slots) || AWE.Util.arrayCount(slots) <= 0) {
          return;
        }
        for (var i = 0; i < slots.length; i++) {
          var slot = slots[i];
          if (slot.get('slot_num') != 0) {
            slot.set('uiMarker', (slot == slotToMark)&&(selectedSlot != slotToMark));
          }
        }
      //}
    };

    that.markFirstStandardAssignment = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT);
    };

    that.markFreeConstructionSpot = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_FREE_CONSTRUCTION_SLOT);
    };

    that.markUpgradeButton = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADE_BUTTON);
    };

    that.markUpgradeableBuilding = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADABLE_BUILDING);
    };

    that.markUnitsButton = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON);
    };

    that.markBuildingToStartAssignment = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT);
    };

    that.whichSlotToMarkForUpgrade = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      var activeQuestState = tutorialState.activeTutorialQuestWithUIMarkers();
      var quest = activeQuestState.get('quest');

      var buildingId = null;
      if (quest.reward_tests.building_tests && quest.reward_tests.building_tests.length > 0) {
        var buildingSymbolicId = quest.reward_tests.building_tests[0].building;
        buildingId = AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId(buildingSymbolicId).id;
      }
      else if (quest.reward_tests.construction_queue_tests && quest.reward_tests.construction_queue_tests.length > 0) {
        var buildingSymbolicId = quest.reward_tests.construction_queue_tests[0].building;
        buildingId = AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId(buildingSymbolicId).id;
      }

      if (buildingId == null) {
        return null;
      }

      var slots = that.view.get('slots');
      if (slots == null || !AWE.Ext.isArray(slots) || AWE.Util.arrayCount(slots) <= 0) {
        return null;
      }

      var toMark = null;
      for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if (slot.get('building_id') == buildingId &&
          (toMark == null || slot.get('level') > toMark.get('level'))) {
          toMark = slot;
        }
      }

      return toMark;
    };

    that.whichSlotToMarkForAssignment = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      var activeQuestState = tutorialState.activeTutorialQuestWithUIMarkers();
      var quest = activeQuestState.get('quest');

      var slots = that.view.get('slots');
      if (slots == null || !AWE.Ext.isArray(slots) || AWE.Util.arrayCount(slots) <= 0) {
        return null;
      }

      var toMark = null;
      for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if (slot.getPath('building.unlockedAssignments')) {
          toMark = slot;
        }
      }

      return toMark;
    };

    that.whichSlotToMarkForUnitsButton = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      var activeQuestState = tutorialState.activeTutorialQuestWithUIMarkers();
      var quest = activeQuestState.get('quest');

      var slots = that.view.get('slots');
      if (slots == null || !AWE.Ext.isArray(slots) || AWE.Util.arrayCount(slots) <= 0) {
        return null;
      }

      var toMark = null;
      for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        var trainingQueues = slot.getPath('building.trainingQueues');
        if (trainingQueues != null && AWE.Ext.isArray(trainingQueues) && AWE.Util.arrayCount(trainingQueues) > 0) {
          toMark = slot;
        }
      }

      return toMark;
    };

    that.nextBuildingSlotToMark = function() {
      //Buildings:  [-1, Gatherer, Barracks, Small Huts, Tavern, Storage, Campfire];
      var sequenceOfSlotIds = [-1, 26, 25, 14, 15, 31, 9, 19, 21, 8, 10, 30, 32];
      var usedSlots = that.view.getPath('settlement.usedBuildingSlots');
      var n = sequenceOfSlotIds.length;

      if (usedSlots >= n) {
        return null;
      }

      var slots = that.view.getPath('hashableSlots.collection');
      if(slots)
      {
        slots.sort(function(a,b) {
          return a.get('slot_num') - b.get('slot_num');
        });
      }

      if (slots === null || !AWE.Ext.isArray(slots) || AWE.Util.arrayCount(slots) <= usedSlots) {
        return null;
      }

      for (var i = usedSlots % n; i != (usedSlots-1+n)%n; i = (i+1) % n) {
        var slotId = sequenceOfSlotIds[i];

        if (slotId >= 0 && slots[slotId] != null && slots[slotId].get('building_id') === null) {
          return slots[slotId];
        }
      }

      return null;
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
      // as we don't know the right slot (or slot id), we update all slots
      AWE.GS.SlotManager.updateSlotsAtSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
        AWE.GS.ConstructionQueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queue) {
          log('updated construction queue', queueId);
        });
      });

      this.updateResourcePool(); // update the pool for the case this update was triggered because a job was finished (and a new one might have started)
      this.updateSettlement();

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
            log('destroyed incoming trading carts action id', item.get('id'));
            item.destroy();
          } 
        });        
  
      }
    }());
        
    that.updateAllConstructionQueuesJobsAndSlots = function() {
      AWE.GS.ConstructionQueueManager.updateQueuesOfSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
        log('updated queues', queues)
        AWE.Ext.applyFunctionToHash(queues, function(queueId, queue) {
          AWE.GS.SlotManager.updateSlotsAtSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
            AWE.GS.ConstructionJobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
              log('updated jobs in construction queue', jobs);
            });
          });
        });
      });
    }
        
        
    // update gossip
    
    that.updateGossipIfNecessary = function() {
      var gossip = AWE.GS.game.gossip;
      if (!gossip || gossip.get('hasEnded')) {
        log('update gossip');
        AWE.GS.GossipManager.updateGossip(null, null);
      }
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
     
    that.updateAllTrainingQueues = function() {
      AWE.GS.TrainingQueueManager.updateQueuesOfSettlement(that.settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
    }     
        
    // resource pool update methods

    that.updateResourcePool = function() {
      AWE.GS.ResourcePoolManager.updateResourcePool(null, function(pool){
        log('updated resource pool', pool);
      });
    };

    that.updateStandardAssignmentsFromServer = function() {
      AWE.GS.StandardAssignmentManager.updateStandardAssignmentsOfCurrentCharacter(null, function(assignments) {
      });
    };

    that.updateSpecialAssignmentsFromServer = function() {
      AWE.GS.SpecialAssignmentManager.updateSpecialAssignmentOfCurrentCharacter(null, function(assignments) {
      });
      AWE.GS.ArmyManager.updateArmiesAtLocation(that.locationId, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
      });
    };

    that.updateGarrisonArmyFromServer = function () {
      AWE.GS.ArmyManager.updateArmy(AWE.GS.SettlementManager.getSettlement(that.settlementId).get('garrison_id'));
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
            if (settlement && settlement.getId()) {
              that.updateAllConstructionQueuesJobsAndSlots();
              if (that.view && that.view.get('selectedSlot')) {  // check view again, may have become invisible during meantime
                that.updateAllTrainingQueuesAndJobs();
              }
              else if (that.view) {  // only update queues, not jobs, if training queue is not visible
                that.updateAllTrainingQueues();
              }
              that.updateStandardAssignmentsFromServer();
              that.updateSpecialAssignmentsFromServer();
              that.updateGarrisonArmyFromServer();
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
          if (queue) {
            var jobs = AWE.GS.ConstructionJobManager.getJobsInQueue(queue.getId());
            jobs.forEach(function(job) {
              if (job.get('active_job')) {
                var jobId = job.getId();
                pendingConstructionJobUpdates[jobId] = pendingConstructionJobUpdates[jobId] > 0 ? pendingConstructionJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
                if (Date.parseISODate(job.get('active_job').finished_at).add({seconds: pendingConstructionJobUpdates[jobId]}) < AWE.GS.TimeManager.estimatedServerTime().seconds()) {
                  pendingConstructionJobUpdates[jobId] *= 2;
                  that.updateConstructionQueueSlotAndJobs(queue.getId());
                  that.updateAllTrainingQueues();
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
          if (queue) {
            var jobs = AWE.GS.TrainingJobManager.getJobsInQueue(queue.getId());
            jobs.forEach(function(job) {
              if (job.get('active_job')) {
                var jobId = job.getId();
                pendingTrainingJobUpdates[jobId] = pendingTrainingJobUpdates[jobId] > 0 ? pendingTrainingJobUpdates[jobId] : AWE.Config.TIME_DIFF_RANGE;
                if (Date.parseISODate(job.get('active_job').finished_active_at).add({seconds: pendingTrainingJobUpdates[jobId]}) < AWE.GS.TimeManager.estimatedServerTime().seconds()) {
                  pendingTrainingJobUpdates[jobId] *= 2;
                  that.updateTrainingQueueAndJobs(queue.getId());
                }
              }
            });
          }
        });
      }
    }

    var pendingInitiationUpdate = 0;

    that.updateArtifactInitiation = function(artifact) {
      if (artifact && !artifact.get('initiated') && artifact.get('initiation')) {
        var initiation = artifact.get('initiation');
        pendingInitiationUpdate = pendingInitiationUpdate > 0 ? pendingInitiationUpdate : AWE.Config.TIME_DIFF_RANGE;
        if (Date.parseISODate(initiation.finished_at).add({seconds: pendingInitiationUpdate}) < AWE.GS.TimeManager.estimatedServerTime().seconds()) {
          pendingInitiationUpdate *= 2;
          AWE.GS.ArtifactManager.updateArtifact(artifact.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
        }
      }
    }

    var pendingStandardAssignmentUpdates = {};

    that.updateStandardAssignments = function(assignments) {
      if (assignments) {
        assignments.forEach(function(assignment) {
          if (assignment.get('ended_at')) {
            var assignmentId = assignment.getId();
            pendingStandardAssignmentUpdates[assignmentId] = pendingStandardAssignmentUpdates[assignmentId] > 0 ? pendingStandardAssignmentUpdates[assignmentId] : AWE.Config.TIME_DIFF_RANGE;
            if (Date.parseISODate(assignment.get('ended_at')).add({seconds: pendingStandardAssignmentUpdates[assignmentId]}) < AWE.GS.TimeManager.estimatedServerTime().seconds()) {
              pendingStandardAssignmentUpdates[assignmentId] *= 2;
              that.updateStandardAssignmentsFromServer();
              AWE.GS.ArmyManager.updateArmiesAtLocation(that.locationId, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
              });
            }
          }
        });
      }
    };

    var pendingSpecialAssignmentUpdates = {};
    var lastSpecialAssignmentUpdate = AWE.GS.TimeManager.estimatedServerTime();

    that.updateSpecialAssignments = function(assignment) {

      if (assignment) {
        if (assignment.get('displayed_until')) {
          var assignmentId = assignment.getId();
          pendingSpecialAssignmentUpdates[assignmentId] = pendingSpecialAssignmentUpdates[assignmentId] > 0 ? pendingSpecialAssignmentUpdates[assignmentId] : AWE.Config.TIME_DIFF_RANGE;
          if (Date.parseISODate(assignment.get('displayed_until')).add({seconds: pendingSpecialAssignmentUpdates[assignmentId]}) < AWE.GS.TimeManager.estimatedServerTime().seconds()) {
            pendingSpecialAssignmentUpdates[assignmentId] *= 2;
            lastSpecialAssignmentUpdate = AWE.GS.TimeManager.estimatedServerTime();
            that.updateSpecialAssignmentsFromServer();
          }
        }
      }
      else if(lastSpecialAssignmentUpdate.add({seconds: 6}) < AWE.GS.TimeManager.estimatedServerTime()) {
        lastSpecialAssignmentUpdate = AWE.GS.TimeManager.estimatedServerTime();
        that.updateSpecialAssignmentsFromServer();
      }
    };

    that.updateDebug = function() {
      $("#debug2").html('&nbsp;Settlement Screen Visible.');
    };    
    
    that.cleanupIfNecessary = function() {
      if (AWE.Config.GS_CLEANUP_ENABLED) {
        log('CLEANUP DATA IN SETTLEMENT CONTROLLER');
        AWE.GS.cleanupMapData();      // commented out because refresh on map doesn't work properly.
        AWE.GS.cleanupMessageData();
        // AWE.GS.cleanupRankingData();  // commented out because it doesn't work properly.
      }
    };
    
    var counter = 0;
    that.runloop = function() {
      if (++counter % 2 !== 0) return ; // skip every other "frame"
      
      this.updateDebug();
      
      if (this.visible && !this.view && this.settlementId) {
        log('APPEND', this.settlementId);
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
        var settlement = AWE.GS.SettlementManager.getSettlement(this.settlementId);
        
        if (this.view.get('settlement') !== settlement) {
          if (settlement && this.view.getPath('settlement.type_id') !== settlement.get('type_id')) {
            this.appendView();  // type may also have been switched, thus recreate the whole view
          }
          else {
            this.view.set('settlement', settlement);
          }
          log('SWITCHED BASE IN RUNLOOP TO', settlement);
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

        if (settlement && settlement.get('artifact')) {
          that.updateArtifactInitiation(settlement.get('artifact'));
        }

        if (settlement && this.view.getPath('selectedSlot.building.unlockedAssignments')) {
          that.updateStandardAssignments(AWE.GS.game.getPath('currentCharacter.enumerableStandardAssignments'));
          that.updateSpecialAssignments(AWE.GS.game.getPath('currentCharacter.specialAssignment'));
        }

        if (settlement && this.view.get('slots') && AWE.Util.arrayCount(this.view.get('slots')) > 0) {
          var lastTutorialUpdate = Date.parseISODate(AWE.GS.TutorialStateManager.getTutorialState().get('updated_at'));

          if (lastTutorialUpdate > that.lastMarkerUpdate || counter % 10 == 0) {
            that.lastMarkerUpdate = lastTutorialUpdate;

            this.updateUIMarker();
          }
        }

        if (counter % 100 == 0) {
          settlement.get('enumerableSlots').forEach(function(slot) {
            AWE.UI.Ember.reanimateBubbles(slot.getId());
          });
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



