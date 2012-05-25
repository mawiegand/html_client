/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createHUDController = function(anchor) {
    
    var _stage  = null;          ///< easelJS stage for displaying the HUD
    var _canvas = null;          ///< canvas elements for the four stages
    
    var _windowSize = null;      ///< size of window in view coordinates

    var _needsLayout;            ///< true, in case e.g. the window has changed, causing a new layuot of the map
    var _needsDisplay;           ///< true, in case something (data, subwview) has changed causing a need for a redraw
      
    var that = module.createScreenController(anchor); ///< create base object
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    var _loopCounter = 0;        ///< counts every cycle through the loop
    var _frameCounter = 0;       ///< counts every rendered frame
    
    var _modelChanged = false;   ///< true, if anything in the model changed    
    var HUDViews = {};
    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Initialization
    //
    // ///////////////////////////////////////////////////////////////////////
    
    /** intializes three stages for displaying the map-background,
     * the playing pieces (armies, fortresses, settlements), and 
     * the HUD. */
    that.init = function() {
      _super.init();    
      var root = that.rootElement();  
      root.append('<canvas id="hud-canvas"></canvas>');
      
      // HUD layer ("static", not zoomable, not moveable)
      _canvas = root.find('#hud-canvas')[0];
      _stage = new Stage(_canvas);
      _stage.onClick = function() {};
      
      _canvas.width = 500;
      _canvas.height = 250;
      
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setNeedsLayout();
    };   
    
    that.getStages = function() {
      return [
        { stage: _stage, mouseOverEvents: true},
      ];
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Laying out the Map
    //
    // ///////////////////////////////////////////////////////////////////////   
    
    that.onResize = function() {
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
    }
    
    /** set to true in case the window needs to be layouted again (e.g. after
     * a resize event). */
    that.setNeedsLayout = function() { _needsLayout = true; }    
    
    /** reset the size of the "window" (canvas) in case its dimension has 
     * changed. */
    that.layoutIfNeeded = function() {
      if (_needsLayout) {   ///// WRONG: no _needsLayout after zooming!!!
  /*      if (_canvas.width != _windowSize.width || _canvas.height != _windowSize.height) {
          _canvas.width  = _windowSize.width;
          _canvas.height = _windowSize.height;
        };
        that.setNeedsDisplay();*/
      };
      _needsLayout = false;
    }
    
    /** set to true in case the whole window needs to be repainted. */
    that.setNeedsDisplay = function() { _needsDisplay = true; }
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Over and Object Selection
    //
    // ///////////////////////////////////////////////////////////////////////     

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Handling
    //
    // ///////////////////////////////////////////////////////////////////////   

    that.ingameShopButtonClicked = function() {
      var dialog = AWE.UI.Ember.ShopView.create({
        offers: AWE.Shop.Manager.content.get('shopOffers'),
        creditAmount: AWE.Shop.Manager.content.get('creditAmount'),
        buyCreditsPressed: function(evt) {
          AWE.Shop.Manager.openCreditShopWindow()
        },
        buyOfferPressed: function() {
          AWE.Shop.Manager.buyOffer(function(transaction) {
            if (transaction.state == 5) {
              var heading = "Buying successful!";
              var message = "The frogs are credited to your account."
            }
            else {
              var heading = "Shit happens!";
              var message = "You haven't enough credits to buy frogs."
            }
            
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: heading,
              message: message,
            });      
            that.applicationController.presentModalDialog(info);
            that.setModelChanged();
            AWE.Shop.Manager.fetchCreditAmount();
          }, function() {
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: 'Server Error',
              message: "There's a problem with the shop. Try again later",
            });      
            that.applicationController.presentModalDialog(info);
          })
        },
        closePressed: function(evt) {
          this.destroy();
        },
        updateCreditsPressed: function() {
          AWE.Shop.Manager.fetchCreditAmount();
        },
      });
      
      that.applicationController.presentModalDialog(dialog);
      fetchCreditAmountRepeatedly(dialog);
    };
    
    var fetchCreditAmountRepeatedly = function(dialog) {
      log('reload Credit Amount', dialog);
      if (!dialog.isDestroyed) {
        AWE.Shop.Manager.fetchCreditAmount();
        window.setTimeout(function(){ fetchCreditAmountRepeatedly(dialog) }, 10000);
      }
    }

    that.shopButtonClicked = function() {
      
      // AWE.Shop.Manager.openCreditShopWindow();
      log('START LOADING SETTLEMENTS');
      
      AWE.GS.SettlementManager.updateOwnSettlements(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
        
        var settlements = AWE.GS.SettlementManager.ownSettlements()
        
        log('Settlements: ', settlements);
        
        for (var i = 0; i < settlements.length; i++) {
          if (settlements[i]) {
            log('Settlements[i]: ', settlements[i]);
            var sid = settlements[i].getId();
            
            AWE.GS.SlotManager.updateSlotsAtSettlement(sid, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
              log('Slots: ', AWE.GS.SlotManager.getSlotsAtSettlement(sid));
            }); 
          }
        }
      }); 

      log('END LOADING SETTLEMENTS');
    };
        

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Serialization, inspection & debugging
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.toString = function() {};

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Remote Data Handling
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.modelChanged = function() { return _modelChanged; }
    
    that.setModelChanged = function() { _modelChanged = true; }    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   HUD
    //
    // ///////////////////////////////////////////////////////////////////////    
    
    that.updateHUD= function() { 
      
      if (!HUDViews.mainControlsView) {
        HUDViews.mainControlsView = AWE.UI.createMainControlsView();
        HUDViews.mainControlsView.initWithController(that);
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(20, 20));
        _stage.addChild(HUDViews.mainControlsView.displayObject());
        return true;
      }
      else {
        HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(20, 20));
      }
      
      return true; 
    };

    
    
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Update Map View
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    that.updateViewHierarchy = (function() {
      var oldWindowSize = null;
      
      var propUpdates = function(viewHash) {
        var needsDisplay = false;
        
        for (var id in viewHash) {
          if (viewHash.hasOwnProperty(id)) {
            var view = viewHash[id];
            view.updateIfNeeded();
            view.layoutIfNeeded();
            needsDisplay = needsDisplay || view.needsDisplay();
          }
        }
        
        return needsDisplay;
      }
      
      return function() {
        
        var stageNeedsUpdate = false;     // replace true with false as soon as stage 1 and 2 are implemented correctly.
                        
        if ((oldWindowSize && !oldWindowSize.equals(_windowSize)) || !HUDViews.mainControlsView) { // TODO: only update at start and when something might have changed (object selected, etc.)
          stageNeedsUpdate = that.updateHUD() || stageNeedsUpdate; 
        }
        // update hierarchies and check which stages need to be redrawn
        stageNeedsUpdate = propUpdates(HUDViews) || stageNeedsUpdate;

        oldWindowSize = _windowSize.copy();
      
        return stageNeedsUpdate;
      };
    }());
    
    /** sets the canvas' width and height, sets-up the internal coordinate
     * systems */
    that.setWindowSize = function(size) {
      if (! _windowSize || _windowSize.width != size.width || _windowSize.height != size.height) {
        _windowSize = size;
        that.setNeedsLayout(); 
      }
    };
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    var _loopCounter = 0;

    that.runloop = function() {
      // only do something after the Map.Manager has been initialized (connected to server and received initial data)
      if(AWE.Map.Manager.isInitialized()) { 
        
                
        // STEP 3: layout canvas & stages according to possibly changed window size (TODO: clean this!)
        that.layoutIfNeeded();   
        
        // STEP 4: update views and repaint view hierarchies as needed
        if (_needsDisplay || _loopCounter % 30 == 0 || that.modelChanged()) {
          // STEP 4b: create, remove and update all views according to visible parts of model      
          var updateNeeded = that.updateViewHierarchy();      
            if (updateNeeded || true) {
              _stage.update();
              AWE.Ext.applyFunctionToElements(HUDViews, function(view) {
                view.notifyRedraw();
              });
            }
        }


        // STEP 5: cleanup & prepare for next loop: everything has been processed and changed...
        _modelChanged = false;
        _needsDisplay = false;
        _needsLayout = false;
        
        _loopCounter++;
      }
    };
    
    return that;
  };
    
    
  return module;
    
}(AWE.Controller || {}));



