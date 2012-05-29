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
      var settlements = AWE.GS.SettlementAccess.getAllForLocation_id(locationId);
      if (AWE.Util.hashCount(settlements) <= 0) {
        AWE.GS.SettlementManager.updateSettlementsAtLocation(locationId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result, status) {
          console.log("SETTLEMENTS", result);
          AWE.Ext.applyFunctionToHash(result, function(key, value) {
            console.log("SET FORTRESS KEY", key)
            that.setFortressId(key);
          });
        });
      }
      else {
        AWE.Ext.applyFunctionToHash(settlements, function(key, value) {
          console.log("SET FORTRESS KEY", key)
          that.setFortressId(key);
        });
      }
    }
    
    that.setNode = function(node) {
      var location = node.region().location(0);
      if (!location) {
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
    //   Model
    //
    // /////////////////////////////////////////////////////////////////////// 

    
    that.updateModel = (function() {
            
      var lastSettlementUpdateCheck = new Date(1970);
      
      var updateSettlements = function() {
        
        AWE.GS.SettlementManager.updateSettlement(that.fortressId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(entity) {
	
					if (entity && entity.getId()) {
            AWE.GS.SlotManager.updateSlotsAtSettlement(entity.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
					}
          
        }); 
      }
      
      return function() {
        
        if (that.fortressId > 0 && lastSettlementUpdateCheck.getTime() + AWE.Config.SETTLEMENT_REFRESH_INTERVAL < +new Date()) {
          log('update Settlement');
          updateSettlements();
          lastSettlementUpdateCheck = new Date();
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
      if (this.visible && (_viewNeedsUpdate) && AWE.GS.SettlementManager.getSettlement(that.fortressId)) {
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
					this.view.setSlots(null); // fortress has changed, so remove the slots!!!
				}
				
				if (fortress && fortress.slots() && AWE.Util.hashCount(fortress.slots()) > 0 && that.slots != fortress.slots()) {
					this.view.setSlots(fortress.slots());
					that.slots = fortress.slots();
					console.log('Set building slots.');
				}
			}
      
      that.updateModel();
    }
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



