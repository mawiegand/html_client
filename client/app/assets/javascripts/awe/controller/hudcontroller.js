/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createHUDController = function(anchor) {
    
    var _stage  = null;          ///< easelJS stage for displaying the HUD
    var _canvas = null;          ///< canvas elements for the four stages
    var _resourceStage  = null;
    var _resourceCanvas = null;
    
    var _windowSize = null;      ///< size of window in view coordinates

    var _needsLayout;            ///< true, in case e.g. the window has changed, causing a new layuot of the map
    var _needsDisplay;           ///< true, in case something (data, subwview) has changed causing a need for a redraw
      
    var that = module.createScreenController(anchor); ///< create base object
    
    var _super = {};             ///< store locally overwritten methods of super object
    _super.init = that.init; 
    _super.runloop = that.runloop;
    _super.append = function(f) { return function() { f.apply(that); }; }(that.append);
    _super.remove = function(f) { return function() { f.apply(that); }; }(that.remove);
    
    var _modelChanged = false;   ///< true, if anything in the model changed
    var HUDViews = {};
    var _animations = [];

    var _hideCanvas = true;
    var _canvasIsHidden = true;  // hud is hidden per css
    var _animationDuration = 800;
    
    that.animatedMarker = null;
    
    
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
      root.append('<canvas id="resource-canvas"></canvas><canvas id="hud-canvas"></canvas>');
      
      // HUD layer ("static", not zoomable, not moveable)
      _canvas = root.find('#hud-canvas')[0];
      _stage = new Stage(_canvas);
      _stage.onClick = function() {};
      
      _canvas.width = 380;
      _canvas.height = 260;

      _resourceCanvas = root.find('#resource-canvas')[0];
      _resourceStage = new Stage(_resourceCanvas);
      _resourceStage.onClick = function() {};
      
      _resourceCanvas.width  = 800;
      _resourceCanvas.height = 42;
      
      that.setWindowSize(AWE.Geometry.createSize($(window).width(), $(window).height()));
      that.setNeedsLayout();
    };   
    
    that.getStages = function() {
      return [
        { stage: _stage,         mouseOverEvents: true},
        { stage: _resourceStage, mouseOverEvents: true}
      ];
    };
    
    that.addAnimation = function (animation) {
      _animations.push(animation);
    }
    
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
      if (_needsLayout) {
        if (_hideCanvas && !_canvasIsHidden) {
          AWE.Log.Debug('hide canvas');
          _canvasIsHidden = true;
          $('#hud-canvas').delay(600).animate({right: "-380px"}, _animationDuration, 'easeOutBack');
          $('#resource-canvas').delay(600).animate({top: "-42px"}, _animationDuration, 'easeOutBack');
          that.setNeedsDisplay();
        }
        else if (!_hideCanvas && _canvasIsHidden) {
          AWE.Log.Debug('display canvas canvas');
          _canvasIsHidden = false;
          $('#hud-canvas').delay(600).animate({right: "0px"}, _animationDuration, 'easeOutBack');
          $('#resource-canvas').delay(600).animate({top: "30px"}, _animationDuration, 'easeOutBack');
          that.setNeedsDisplay();
        }
      }
      _needsLayout = false;
    };
    
    /** set to true in case the whole window needs to be repainted. */
    that.setNeedsDisplay = function() { 
      _needsDisplay = true; 
    }
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Mouse-Over and Object Selection
    //
    // ///////////////////////////////////////////////////////////////////////     

    that.showHud = function() {
      if (_hideCanvas) {
        _hideCanvas = false;
        _needsLayout = true;
      }
    }

    // ///////////////////////////////////////////////////////////////////////
    //
    //   Action Handling
    //
    // ///////////////////////////////////////////////////////////////////////
    
    var shopDialog = null;
    
    that.questsButtonClicked = function() {
      WACKADOO.showQuestListDialog();      
    }
    
    that.presentNotEnoughCreditsWarning = function() {
      var info = AWE.UI.Ember.InfoDialog.create({
        contentTemplateName: 'not-enough-credits-info',
        cancelText:          AWE.I18n.lookupTranslation('general.cancel'),
        okText:              AWE.I18n.lookupTranslation('shop.notenoughcredits.getCredits'),
        okPressed:           function() {
          if (AWE.Facebook.isRunningInCanvas) {
            var dialog = AWE.UI.Ember.FacebookCreditOfferDialog.create();
            WACKADOO.presentModalDialog(dialog);
          }
          else {
            AWE.GS.ShopManager.openCreditShopWindow();
          }

          this.destroy();
        },
        cancelPressed:       function() { this.destroy(); },
      });          
      that.applicationController.presentModalDialog(info);
    }

    that.presentNotEnoughGoldenFrogsWarning = function() {
      var info = AWE.UI.Ember.InfoDialog.create({
        contentTemplateName: 'not-enough-goldenfrogs-info',
//        cancelText:          AWE.I18n.lookupTranslation('general.cancel'),
        okText:              AWE.I18n.lookupTranslation('general.ok'),
        okPressed:           function() {
          this.destroy();
        },
//        cancelPressed:       function() { this.destroy(); },
      });
      that.applicationController.presentModalDialog(info);
    }

    that.ingameShopButtonClicked = function() {
      
      if (!AWE.GS.ShopManager.getShop()) {
        AWE.GS.ShopManager.init();
      }
      
      shopDialog = AWE.UI.Ember.ShopDialog.create({
        
        shop: AWE.GS.ShopManager.getShop(),
        
        buyCreditsPressed: function() {
          if (AWE.Facebook.isRunningInCanvas) {
            var dialog = AWE.UI.Ember.FacebookCreditOfferDialog.create();
            WACKADOO.presentModalDialog(dialog);
          }
          else {
            AWE.GS.ShopManager.openCreditShopWindow();
          }
        },

        buyResourceOfferPressed: function(offerId) {
          
          var creditAmount = this.getPath('shop.creditAmount') || 0;
          var offer = AWE.GS.ResourceOfferManager.getResourceOffer(offerId);
          var price = offer.get('price');
          
          if (creditAmount < price) {
            log('CREDIT AMOUNT', creditAmount, 'PRICE', price);
            that.presentNotEnoughCreditsWarning();
            return ;
          }
          
          AWE.GS.ShopManager.buyResourceOffer(offerId, function(transaction) { // success handler
            if (transaction.state === AWE.Action.Shop.STATE_CLOSED) {
              var info = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('shop.buyConfirmation.cashHeader'),
                message: AWE.I18n.lookupTranslation('shop.buyConfirmation.cashMessage'),
              });
              that.applicationController.presentModalDialog(info);
            }
            else {
              that.presentNotEnoughCreditsWarning();
            }
            
            AWE.GS.ShopManager.fetchCreditAmount(function(){
              that.setModelChanged();
            });
            AWE.GS.ResourcePoolManager.updateResourcePool(null, function(){
              that.setModelChanged();
            });
          }, function() {                                   // error handler
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('shop.error.heading'),
              message: AWE.I18n.lookupTranslation('shop.error.message'),
            });      
            that.applicationController.presentModalDialog(info);
          })
        },

        buyBonusOfferPressed: function(offerId) {
          
          var offer = AWE.GS.BonusOfferManager.getBonusOffer(offerId);
          var price = offer.get('price');
          var currency = offer.get('currency');

          if (currency ===  AWE.GS.CURRENCY_CREDITS) {
            var creditAmount = this.getPath('shop.creditAmount') || 0;
            if (creditAmount < price) {
              log('CREDIT AMOUNT', creditAmount, 'PRICE', price);
              that.presentNotEnoughCreditsWarning();
              return ;
            }

            AWE.GS.ShopManager.buyBonusOffer(offerId, function(transaction) { // success handler
              if (transaction.state === AWE.Action.Shop.STATE_CLOSED) {
//                var info = AWE.UI.Ember.InfoDialog.create({
//                  heading: AWE.I18n.lookupTranslation('shop.buyConfirmation.bonusHeader'),
//                  message: AWE.I18n.lookupTranslation('shop.buyConfirmation.bonusMessage'),
//                });
//                that.applicationController.presentModalDialog(info);
              }
              else {
                that.presentNotEnoughCreditsWarning();
              }

              AWE.GS.BonusOfferManager.updateBonusOffers();
              AWE.GS.ShopManager.fetchCreditAmount(function(){
                that.setModelChanged();
              });
              AWE.GS.ResourcePoolManager.updateResourcePool(null, function(){
                that.setModelChanged();
              });
            }, function() {                                   // error handler
              var info = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('shop.error.heading'),
                message: AWE.I18n.lookupTranslation('shop.error.message'),
              });
              that.applicationController.presentModalDialog(info);
            })
          }
          else {
            var goldenFrogsAmount = AWE.GS.ResourcePoolManager.getResourcePool().presentAmount(AWE.Config.CASH_SYMBOLIC_RESOURCE_ID);
            if (goldenFrogsAmount < price) {
              log('GOLDEN FROGS AMOUNT', goldenFrogsAmount, 'PRICE', price);
              that.presentNotEnoughGoldenFrogsWarning();
              return ;
            }

            AWE.GS.ShopManager.buyBonusOffer(offerId, function(transaction) { // success handler
              if (transaction.state === AWE.Action.Shop.STATE_CLOSED) {
//                var info = AWE.UI.Ember.InfoDialog.create({
//                  heading: AWE.I18n.lookupTranslation('shop.buyConfirmation.bonusHeader'),
//                  message: AWE.I18n.lookupTranslation('shop.buyConfirmation.bonusMessage'),
//                });
//                that.applicationController.presentModalDialog(info);
              }
              else {
                that.presentNotEnoughGoldenFrogsWarning();
              }

              AWE.GS.BonusOfferManager.updateBonusOffers();
              AWE.GS.ResourcePoolManager.updateResourcePool(null, function(){
                that.setModelChanged();
              });
            }, function() {                                   // error handler
              var info = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('shop.error.heading'),
                message: AWE.I18n.lookupTranslation('shop.error.message'),
              });
              that.applicationController.presentModalDialog(info);
            });
          }
        },

        buySpecialOfferPressed: function(offerId) {

          var offer = AWE.GS.SpecialOfferManager.getSpecialOffer(offerId);
          var price = offer.get('price');

          var creditAmount = this.getPath('shop.creditAmount') || 0;
          if (creditAmount < price) {
            log('CREDIT AMOUNT', creditAmount, 'PRICE', price);
            that.presentNotEnoughCreditsWarning();
            return ;
          }

          AWE.GS.ShopManager.buySpecialOffer(offerId, function(transaction) { // success handler
            if (transaction.state === AWE.Action.Shop.STATE_CLOSED) {
              var info = AWE.UI.Ember.InfoDialog.create({
                heading: AWE.I18n.lookupTranslation('shop.buyConfirmation.specialHeader'),
                message: AWE.I18n.lookupTranslation('shop.buyConfirmation.specialMessage'),
              });

              AWE.GS.SpecialOfferManager.updateSpecialOffer(offerId, null, function(specialOffer) {
                AWE.GS.ShopManager.getShop().set('specialOffer', specialOffer);
              });

              that.applicationController.presentModalDialog(info);
              AWE.GS.ShopManager.fetchCreditAmount(function(){
                that.setModelChanged();
              });
              AWE.GS.ResourcePoolManager.updateResourcePool(null, function(){
                that.setModelChanged();
              });
              AWE.GS.SettlementManager.updateSettlementsOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
            }
            else {
              that.presentNotEnoughCreditsWarning();
            }
          }, function() {                                   // error handler
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('shop.error.heading'),
              message: AWE.I18n.lookupTranslation('shop.error.message'),
            });
            that.applicationController.presentModalDialog(info);
          })
        },

        buyPlatinumOfferPressed: function(offerId) {
          
          var creditAmount = this.getPath('shop.creditAmount') || 0;
          var offer = AWE.GS.PlatinumOfferManager.getPlatinumOffer(offerId);
          var price = offer.get('price');
          
          if (creditAmount < price) {
            log('CREDIT AMOUNT', creditAmount, 'PRICE', price);
            that.presentNotEnoughCreditsWarning();
            return ;
          }
          
          AWE.GS.ShopManager.buyPlatinumOffer(offerId, function(transaction) { // success handler
            if (transaction.state === AWE.Action.Shop.STATE_CLOSED) {
//              var info = AWE.UI.Ember.InfoDialog.create({
//                heading: AWE.I18n.lookupTranslation('shop.buyConfirmation.platinumAccountHeader'),
//                message: AWE.I18n.lookupTranslation('shop.buyConfirmation.platinumAccountMessage'),
//              });
//              that.applicationController.presentModalDialog(info);
            }
            else {
              that.presentNotEnoughCreditsWarning();
            }
            
            AWE.GS.CharacterManager.updateCurrentCharacter();
            AWE.GS.ShopManager.fetchCreditAmount(function(){
              that.setModelChanged();
            });
          }, function() {                                   // error handler
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('shop.error.heading'),
              message: AWE.I18n.lookupTranslation('shop.error.message'),
            });      
            that.applicationController.presentModalDialog(info);
          })
        },

        closePressed: function(evt) {
          shopDialog = null;
          this.destroy();
        },

        updateCreditsPressed: function() {
          AWE.GS.ShopManager.fetchCreditAmount();
        },
      });
      
      that.applicationController.presentModalDialog(shopDialog);
    };

    that.buyFbOfferPressed = function(offer) {
      AWE.Facebook.init(function() {
        AWE.Facebook.buyFbOffer(offer, function() {
          var info = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('shop.fbPaymentSuccess.header'),
            message: AWE.I18n.lookupTranslation('shop.fbPaymentSuccess.message'),
          });
          that.applicationController.presentModalDialog(info);
          AWE.GS.ShopManager.fetchCreditAmount(function(){
            that.setModelChanged();
          });
        }, function(errorCode) {
          if (errorCode == AWE.Net.UNPROCESSABLE) {
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('shop.fbPaymentBytroError.header'),
              message: AWE.I18n.lookupTranslation('shop.fbPaymentBytroError.message'),
            });
            that.applicationController.presentModalDialog(info);
          }
          else if (errorCode == AWE.Net.BAD_REQUEST) {
            var info = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('shop.fbPaymentError.header'),
              message: AWE.I18n.lookupTranslation('shop.fbPaymentError.message'),
            });
            that.applicationController.presentModalDialog(info);
          }
        });
      });
    },
    
    that.rankingButtonClicked = function() {
      var dialog = AWE.UI.Ember.RankingDialog.create();
      this.applicationController.presentModalDialog(dialog);      
    };
    
    
    that.shouldMarkMapButton = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return WACKADOO.presentScreenController.typeName != 'MapController' && tutorialState.isUIMarkerActive(AWE.GS.MARK_MAP);
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
    
    that.updateModel = (function() {
            
      var lastResourcesUpdate = new Date(1970);
      var lastCharacterUpdate = new Date(1970);
      var lastCreditAmountUpdate = new Date(1970);
      var amounts = [100];
      
      return function() {
        
        if (lastResourcesUpdate.getTime() + AWE.Config.RESOURCES_REFRESH_INTERVAL < new Date().getTime()) {
          lastResourcesUpdate = new Date();
          if (HUDViews.mainControlsView) {
            AWE.GS.ResourcePoolManager.updateResourcePool(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
              that.setModelChanged(); // always re-paint, if new data available
              log('U: updated resource');
            });
          }
        }
        
        var pool = AWE.GS.ResourcePoolManager.getResourcePool();
        if (pool) { // TODO: need to make the following code dynamic
          var changed = false;
          changed = changed || pool.presentAmount('resource_wood')    !== amounts[0];
          changed = changed || pool.presentAmount('resource_stone')   !== amounts[1];
          changed = changed || pool.presentAmount('resource_fur')     !== amounts[2];
          changed = changed || pool.presentAmount('resource_cash')    !== amounts[3];
          
          if (changed) {
            that.setModelChanged();
            amounts[0] = pool.presentAmount('resource_wood') ;
            amounts[1] = pool.presentAmount('resource_stone');
            amounts[2] = pool.presentAmount('resource_fur')  ;
            amounts[3] = pool.presentAmount('resource_cash') ;

            pool.set('resource_wood_present', pool.presentAmount('resource_wood'));
            pool.set('resource_stone_present', pool.presentAmount('resource_stone'));
            pool.set('resource_fur_present', pool.presentAmount('resource_fur'));
            pool.set('resource_cash_present', pool.presentAmount('resource_cash'));
          }
        }
        
        if (lastCharacterUpdate.getTime() + AWE.Config.CHARACTER_REFRESH_INTERVAL < new Date().getTime()) {
          lastCharacterUpdate = new Date();
          AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
            that.setModelChanged();
            log('U: updated current character');
          });
        }
        
        if (lastCreditAmountUpdate.getTime() + AWE.Config.CREDIT_AMOUNT_REFRESH_INTERVAL < new Date().getTime()) {
          lastCreditAmountUpdate = new Date();
          if (shopDialog) {
            AWE.GS.ShopManager.fetchCreditAmount(function() {
              that.setModelChanged();
              log('U: updated credit amount');
            });
          }
        }
      };
    }());     
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   HUD
    //
    // ///////////////////////////////////////////////////////////////////////    
    
    that.updateHUD = function() { 
      
      if (!HUDViews.mainControlsView) {
        HUDViews.mainControlsView = AWE.UI.createMainControlsView();
        HUDViews.mainControlsView.initWithController(that);
        _stage.addChild(HUDViews.mainControlsView.displayObject());
      }
      HUDViews.mainControlsView.setOrigin(AWE.Geometry.createPoint(20, 20));
      
      if (!HUDViews.stoneView) {
        
        var detailsHandler = function() {
          WACKADOO.presentResourceDetailsDialog();
        };
        
        HUDViews.stoneView = AWE.UI.createResourceBubbleView();
        HUDViews.stoneView.initWithControllerAndResourceImage(that, "resource/icon/stone/large", "resource_stone");
        HUDViews.stoneView.setOrigin(AWE.Geometry.createPoint(10, 0));
        HUDViews.stoneView.onClick = detailsHandler;
        _resourceStage.addChild(HUDViews.stoneView.displayObject());       

        HUDViews.woodView = AWE.UI.createResourceBubbleView();
        HUDViews.woodView.initWithControllerAndResourceImage(that, "resource/icon/wood/large", "resource_wood");
        HUDViews.woodView.setOrigin(AWE.Geometry.createPoint(216, 0));
        HUDViews.woodView.onClick = detailsHandler;
        _resourceStage.addChild(HUDViews.woodView.displayObject()); 
        
        HUDViews.furView = AWE.UI.createResourceBubbleView();
        HUDViews.furView.initWithControllerAndResourceImage(that, "resource/icon/fur/large", "resource_fur");
        HUDViews.furView.setOrigin(AWE.Geometry.createPoint(422, 0));
        HUDViews.furView.onClick = detailsHandler;
        _resourceStage.addChild(HUDViews.furView.displayObject()); 
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
        
        var stageNeedsUpdate = true;     // replace true with false as soon as stage 1 and 2 are implemented correctly.
                        
        if ((oldWindowSize && !oldWindowSize.equals(_windowSize)) || !HUDViews.mainControlsView) { // TODO: only update at start and when something might have changed (object selected, etc.)
          stageNeedsUpdate = that.updateHUD() || stageNeedsUpdate; 
        }
        
        if (HUDViews.mainControlsView) {
          var mark = that.shouldMarkMapButton();
          var view = HUDViews.mainControlsView.getSettlementButtonView();

          if (view && mark && !that.animatedMarker) {
            var marker = AWE.UI.createMarkerView();
            marker.initWithControllerAndMarkedView(that, view);
            that.animatedMarker = that.addBouncingAnnotationLabel(view, marker, 10000000, AWE.Geometry.createPoint(70, 0));

            stageNeedsUpdate = true;
          }
          else if (view && !mark && that.animatedMarker) {
            that.animatedMarker.cancel();
            that.animatedMarker.update();
            that.animatedMarker = null;
    
            stageNeedsUpdate = true;
          }
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
    
    that.addBouncingAnnotationLabel = function (annotatedView, annotation, duration, offset, stage) {
      duration = duration || 10000;
      offset = offset || AWE.Geometry.createPoint(0, -50);

      var bounceHeight = 50;
      var bounceDuration = 1000.0;

      _stage.addChild(annotation.displayObject());

      var animation = AWE.UI.createTimedAnimation({
        view:annotation,
        duration:duration,

        updateView:function () {
          return function (view, elapsed) {
            var height = (Math.sin(elapsed * duration / bounceDuration * 2.0 * Math.PI) / 2.0 + 0.5) * bounceHeight;
            view.setOrigin(AWE.Geometry.createPoint(annotatedView.frame().origin.x + offset.x,
              annotatedView.frame().origin.y + offset.y - height));
          };
        }(),

        onAnimationEnd:function (viewToRemove) {
          return function () {
            _stage.removeChild(viewToRemove.displayObject());
            log('removed animated label on animation end');
          };
        }(annotation),
      });

      that.addAnimation(animation);
      return animation;
    }
    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   Runloop
    //
    // /////////////////////////////////////////////////////////////////////// 
    
    var _loopCounter = 0;

    that.runloop = function() {
      // only do something after the Map.Manager has been initialized (connected to server and received initial data)
      if(AWE.Map.Manager.isInitialized()) { 
        
        // STEP 2: update Model
        that.updateModel();
                
        // STEP 3: layout canvas & stages according to possibly changed window size (TODO: clean this!)
        that.layoutIfNeeded();

        // STEP 3b: animations
        var animating = false;
        AWE.Ext.applyFunction(_animations, function (animation) {
          if (animation.animating()) {
            animating = true;
          }
        });
                
        // STEP 4: update views and repaint view hierarchies as needed
        if (_needsDisplay || _loopCounter % 60 == 0 || that.modelChanged() || animating) {
          
          if (true) {
            var runningAnimations = [];
            AWE.Ext.applyFunction(_animations, function (animation) {
              animation.update();
              if (!animation.ended()) {
                runningAnimations.push(animation);
              }
            });
            _animations = runningAnimations;
          }
          
          // STEP 4b: create, remove and update all views according to visible parts of model      
          var updateNeeded = that.updateViewHierarchy() || animating;      
          if (updateNeeded ) { // TODO: remove true, update only, if necessary 
            _stage.update();
            _resourceStage.update();
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



