/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createFortressController = function(anchor) {
      
    var _viewNeedsUpdate = false;  
          
    var that = module.createScreenController(anchor); ///< create base object
    
    that.view = null;
    that.visible = false;
    that.fortressId = null;
		that.slots = null;
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    var _modelChanged = false;
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** intializes three stages for displaying the map-background,
     * the playing pieces (armies, fortresses, settlements), and 
     * the HUD. */
    that.init = function(initialFrameModelCoordinates) {
      _super.init();            
    };   
    
    that.getStages = function() { return []; }
    
    that.setFortressId = function(fortressId) { 
      this.fortressId = fortressId; 
    }
    
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
        that.setFortressId(settlement.getId());
      }
    }
    
    that.setNode = function(node) {
      var location = node.region().location(0);
      if (!location) {
        that.setFortressId(0);
        while (! AWE.Map.Manager.fetchLocationsForRegion(node.region(), function(region) {
          that.setLocationId(region.location(0).id());
        })) ;
      }
    }
    
    that.removeView = function() {
      if (this.view) {
        this.view.destroy();
        this.view = null;
      }
    }
    
    
    /** update the view in case the OBJECTS (alliance, members) did change. A change
     * of object properties (e.g. alliance.description) is propagated automatically
     * with the help of ember bindings. */
    that.updateView = function() {
      //that.content.set('alliance', that.getAndUpdateAlliance(this.allianceId));
    }
    
    
    that.createView = function() {
			var fortress = AWE.GS.SettlementManager.getSettlement(that.fortressId);
      var fortressScreen = AWE.UI.Ember.FortressView.create({
        templateName: "fortress-screen",
				controller: this,
				fortress: fortress,
      });      
			that.slots = null;
      return fortressScreen;
    }
    
    
    that.appendView = function() {
      if (this.view) {
        this.removeView();
      }
      this.updateView();
      this.view = this.createView();
      this.view.appendTo('#main-screen-controller');   
      
      log (this.view, this.view.childViews, this.view.get('childViews'), this.view.get('elementId'), this.view.clearBuffer);
    }
    
    
    that.viewDidAppear = function() {
      this.visible = true;
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
    }
    
    that.unselectSlot = function() {
      that.view.set('selectedSlot', null);
    }
    
    /** 
     * method is called when the user clicks in a building selection dialog, which
     * only shows up, if there's no bilding in the slot. thus, job type must be 'create'
     */
    that.constructionOptionClicked = function(slot, buildingId, type) {
      log('constructionOptionClicked', slot, buildingId, type);  // TODO type is production category - > rename
      createAndSendConstructionJob(slot, buildingId, AWE.GS.JOB_TYPE_CREATE);      
    }
    
    that.upgradeClicked = function(slot) {
      var nextLevel = slot.get('building').get('nextLevel');
      createAndSendConstructionJob(slot, slot.get('building_id'), AWE.GS.JOB_TYPE_UPGRADE, nextLevel);    
    }  
    
    var createAndSendConstructionJob = function(slot, buildingId, jobType, levelAfter) {
      
      // TODO: test if construction possible  (or should we just rely on the server and show it's error message?)
      
      if (!levelAfter) {
        levelAfter = 1;
      }
      
      var buildingType = AWE.GS.RulesManager.getRules().getBuildingType(buildingId);
      var queue = AWE.GS.QueueManager.getQueueForBuildingCategorieInSettlement(buildingType.category, slot.get('settlement_id'));
      log('queue', queue);
      
      if (queue) {
        var constructionAction = AWE.Action.Construction.createJobCreateAction(queue, slot.getId(), buildingId, jobType, levelAfter);
        constructionAction.send(function(status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            log(status, "Construction job created.");
            that.updateQueueAndJobs(queue.getId());          
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
    
    that.cancelClicked = function(job) {
      var queueId = job.get('queue_id');
      var cancelJobAction = AWE.Action.Construction.createJobCancelAction(job.getId());
      cancelJobAction.send(function(status) {
        if (status === AWE.Net.OK) {    // 200 OK
          log(status, "Construction job deleted.");
          that.updateQueueAndJobs(queueId);          
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
    
    that.updateQueueAndJobs = function(queueId) {
      AWE.GS.QueueManager.updateQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
        log('updated queue', queueId);
      });

      AWE.GS.JobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
        log('updated jobs in queue', queueId);
      });
    }
        
    that.updateModel = (function() {
            
      var lastSettlementUpdateCheck = new Date(1970);
      var lastSettlementId = 0;
      
      var updateSettlement = function() {
        
        // just trigger the updates, thanks to the bindings we do not need to
        // process the answers and update the views manually.
        AWE.GS.SettlementManager.updateSettlement(that.fortressId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
	        log('updated settlement', settlement)
					if (settlement && settlement.getId()) {
            AWE.GS.SlotManager.updateSlotsAtSettlement(settlement.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
              log('updated slots', slots)
            });

            AWE.GS.QueueManager.updateQueuesOfSettlement(settlement.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(queues) {
              log('updated queues', queues)
              AWE.Ext.applyFunctionToHash(queues, function(queueId, queue) {
                AWE.GS.JobManager.updateJobsOfQueue(queueId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(jobs){
                  log('updated jobs', jobs)
                });
              });      
            });
					}
        });
      }
      
      return function() {
        
        // TODO: use the last update timestamp from the Settlement Manager and don't track a copy locally.
        if (that.fortressId > 0 &&
            (lastSettlementId != that.fortressId ||
             lastSettlementUpdateCheck.getTime() + AWE.Config.SETTLEMENT_REFRESH_INTERVAL < +new Date() ||
             that.modelChanged())
        ) {
          log('update Settlement');
          updateSettlement();
          lastSettlementUpdateCheck = new Date();
          lastSettlementId = that.fortressId;
          _modelChanged = false;
        }
      };
    }());
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 

    that.updateDebug = function() {
      $("#debug2").html('&nbsp;Fortress Screen Visible.');
    };    

    that.runloop = function() {
      this.updateDebug();
      if (this.visible && _viewNeedsUpdate && AWE.GS.SettlementManager.getSettlement(that.fortressId)) {
        this.updateView();
        _viewNeedsUpdate = false;
				console.log(that.fortressId, AWE.GS.SettlementManager.getSettlement(that.fortressId))
      }
			
			if (this.view) {   // make sure the view displays the right fortress.
				// this is executed, in case the settlement is received from the 
				// server for the first time or the fortressId has been changed by 
				// this.setFortressId(int).
				var fortress = AWE.GS.SettlementManager.getSettlement(that.fortressId);
				if (this.view.get('fortress') != fortress) {
          this.view.set('fortress', fortress);
          this.view.set('queues', fortress.get('hashableQueues'));
					this.view.setSlots(null); // fortress has changed, so remove the slots!!!
				}
				
				if (fortress && fortress.slots() && AWE.Util.hashCount(fortress.slots()) > 0 && that.slots != fortress.slots()) {
					this.view.setSlots(fortress.slots());
					that.slots = fortress.slots();
					console.log('Set building slots.');
					AWE.Ext.applyFunctionToHash(that.slots, function(key, value) {
					  console.log("building type id", value.get('building_id'));
					});
				}
			}
      
      that.updateModel();
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



