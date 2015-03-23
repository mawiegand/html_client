/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createHUDController = function(anchor) {
    
    var _domLeft = null;
    var _domRight = null;
    var _domTopRight = null;
    var _stageLeft  = null;          ///< easelJS stage for displaying the HUD
    var _canvasLeft = null;          ///< canvas elements for the hud
    var _stageRight  = null;          ///< easelJS stage for displaying the HUD
    var _canvasRight = null;          ///< canvas elements for the hud
    var _stageProfile  = null;          ///< easelJS stage for displaying the HUD
    var _canvasProfile = null;          ///< canvas elements for the hud
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
    var markerAdded = false;

    
    
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

      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();

      _domLeft = AWE.UI.Ember.LeftHUDView.create({
        controller: this,
        character: character,
      });

      _domRight = AWE.UI.Ember.RightHUDView.create({
        controller: this,
        character: character,
        tutorialState: tutorialState,
      });

      _domTopRight = AWE.UI.Ember.TopRightHUDView.create({
        controller: this,
        character: character,
        tutorialState: tutorialState,
      });
      //view.append();  
      var root = that.rootElement();  
      root.append('<canvas id="resource-canvas"></canvas><canvas id="hud-canvas-profile"></canvas>');
      _domLeft.appendTo(root);
      _domRight.appendTo(root);
      _domTopRight.appendTo(root);


      // HUD layers ("static", not zoomable, not moveable)
      
     /* _canvasLeft = root.find('#hud-canvas-left')[0];
      _stageLeft = new Stage(_canvasLeft);
      _stageLeft.onClick = function() {};
      
      _canvasLeft.width = 120*AWE.Settings.hudScale;
      _canvasLeft.height = 370*AWE.Settings.hudScale;*/
      
      /*_canvasRight = root.find('#hud-canvas-right')[0];
      _stageRight = new Stage(_canvasRight);
      _stageRight.onClick = function() {};
      
      _canvasRight.width = 70*AWE.Settings.hudScale;
      _canvasRight.height = 114*AWE.Settings.hudScale;*/
      
      _canvasProfile = root.find('#hud-canvas-profile')[0];
      _stageProfile = new Stage(_canvasProfile);
      _stageProfile.onClick = function() {};
      
      _canvasProfile.width = 268;
      _canvasProfile.height = 166;

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
        //{ stage: _stageLeft,         mouseOverEvents: true},
        //{ stage: _stageRight,         mouseOverEvents: true},
        { stage: _stageProfile,         mouseOverEvents: true},
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
        //$('#hud-canvas-right').css('top', $(window).height()*0.5);
        //$('#hud-canvas-left').css('height', 370*AWE.Settings.hudScale);
        //$('#hud-canvas-left').css('width', 120*AWE.Settings.hudScale);
        //$('#hud-canvas-right').css('height', 114*AWE.Settings.hudScale);
        //$('#hud-canvas-right').css('width', 70*AWE.Settings.hudScale);
        $('#hud-canvas-profile').css('height', 166*AWE.Settings.hudScale);
        $('#hud-canvas-profile').css('width', 268*AWE.Settings.hudScale);
        $('#resource-canvas').css('height', 42*AWE.Settings.hudScale);
        $('#resource-canvas').css('width', 800*AWE.Settings.hudScale);
        if (_hideCanvas && !_canvasIsHidden) {
          AWE.Log.Debug('hide canvas');
          _canvasIsHidden = true;
          //$('#hud-canvas-left').delay(600).animate({left: "-120px"}, _animationDuration, 'easeOutBack');
          $('#left-dom-hud').delay(600).animate({left: "-120px"}, _animationDuration, 'easeOutBack');
          //$('#hud-canvas-right').delay(600).animate({right: "-70px"}, _animationDuration, 'easeOutBack');
          $('#right-dom-hud').delay(600).animate({right: "-70px"}, _animationDuration, 'easeOutBack');
          $('#top-right-dom-hud').delay(600).animate({right: "-70px"}, _animationDuration, 'easeOutBack');
          $('#hud-canvas-profile').delay(600).animate({right: "-268px"}, _animationDuration, 'easeOutBack');
          $('#resource-canvas').delay(600).animate({top: "-42px"}, _animationDuration, 'easeOutBack');
          that.setNeedsDisplay();
        }
        else if (!_hideCanvas && _canvasIsHidden) {
          AWE.Log.Debug('display canvas canvas');
          _canvasIsHidden = false;
          //$('#hud-canvas-left').delay(600).animate({left: "10px"}, _animationDuration, 'easeOutBack');
          $('#left-dom-hud').delay(600).animate({left: "10px"}, _animationDuration, 'easeOutBack');
          //$('#hud-canvas-right').delay(600).animate({right: "7px"}, _animationDuration, 'easeOutBack');
          $('#top-right-dom-hud').delay(600).animate({right: "0px"}, _animationDuration, 'easeOutBack');
          $('#right-dom-hud').delay(600).animate({right: "7px"}, _animationDuration, 'easeOutBack');
          $('#hud-canvas-profile').delay(600).animate({right: "0px"}, _animationDuration, 'easeOutBack');
          $('#resource-canvas').delay(600).animate({top: 30*AWE.Settings.hudScale}, _animationDuration, 'easeOutBack');
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
    
    that.presentNotEnoughCreditsWarning = function() {
      var info = AWE.UI.Ember.InfoDialog.create({
        heading:             AWE.I18n.lookupTranslation('shop.notenoughcredits.title'),
        message:             AWE.I18n.lookupTranslation('shop.notenoughcredits.message'),

        okText:              AWE.I18n.lookupTranslation('shop.notenoughcredits.getCredits'),
        cancelText:          AWE.I18n.lookupTranslation('general.cancel'),

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
        heading:             AWE.I18n.lookupTranslation('shop.notenoughgoldenfrogs.title'),
        message:             AWE.I18n.lookupTranslation('shop.notenoughgoldenfrogs.message'),
      });
      that.applicationController.presentModalDialog(info);
    }
    
    that.buyCreditsClicked = function() {
      if (AWE.Facebook.isRunningInCanvas) {
        var dialog = AWE.UI.Ember.FacebookCreditOfferDialog.create();
        WACKADOO.presentModalDialog(dialog);
      }
      else {
        AWE.GS.ShopManager.openCreditShopWindow();
      }
    };

    that.ingameShopButtonClicked = function() {
      try
      {
        AndroidDelegate.openShop();
      }
      catch(err)
      {
        if (!AWE.GS.ShopManager.getShop()) {
          AWE.GS.ShopManager.init();
        }
        
        shopDialog = AWE.UI.Ember.ShopDialog.create({
          
          shop: AWE.GS.ShopManager.getShop(),
          
          buyCreditsPressed: that.buyCreditsClicked,

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
    };      
    
    that.notifyAboutNewScreenController = function(controller) {
      if (controller && /*HUDViews.leftHUDControlsView*/_domLeft) {
        var mode = null;
        if(controller.typeName === "SettlementController")
        {
          mode = AWE.UI.HUDModeSettlement;
        }
        else
        {
          mode = AWE.UI.HUDModeMap;
        }

        _domLeft.setHUDMode(mode);
      }
      
      // TODO Mail view -> hide buttons
    };

    that.notifyAboutNewControllerSettlement = function(settlementId) {
      _domLeft.setSettlement(settlementId);
    }
    
    that.rankingButtonClicked = function() {
      var dialog = AWE.UI.Ember.RankingDialog.create();
      this.applicationController.presentModalDialog(dialog);      
    };
        
    that.shouldMarkMapButton = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return WACKADOO.presentScreenController.typeName != 'MapController' && tutorialState.isUIMarkerActive(AWE.GS.MARK_MAP);
    };
      
    that.menuButtonClicked = function() {
      AWE.UI.Ember.MainMenuDialog.create().open();
    };
    
    that.switchMapModeButtonClicked = function() {
      WACKADOO.switchMapTypeClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.      
    };    
    
    that.gamingPieceSelectorButtonClicked = function() {
      WACKADOO.gamingPieceSelectorClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
    };
    
    that.switchToSettlementButtonClicked = function() {
      var baseControllerActive = WACKADOO.baseControllerActive();
      WACKADOO.baseButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
      if (baseControllerActive) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button1');
      } 
    };
    
    that.switchToSettlementButtonDoubleClicked = function() {
      var baseControllerActive = WACKADOO.baseControllerActive();
      WACKADOO.baseButtonDoubleClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
      if (!baseControllerActive) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button2');
      }
    };
    
    that.switchToMapButtonClicked = function() {
      var baseControllerActive = WACKADOO.baseControllerActive();
      WACKADOO.baseButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
      if (baseControllerActive) {
        AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button1');
      } 
    };
    
    that.mailButtonClicked = function() {
      WACKADOO.messagesButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
    };       
    
    that.questsButtonClicked = function() {
      WACKADOO.showQuestListDialog(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.   
    };
    
    that.recruitButtonClicked = function() {
      var dialog = AWE.UI.Ember.MilitaryInfoDialogNew.create({
        //garrisonArmy: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId).get('garrison'),
        controller: WACKADOO.presentScreenController,
        settlement: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId),
      });
      dialog.set('garrisonArmy', AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId).get('garrison')),
	    WACKADOO.presentModalDialog(dialog);
    };

    that.assignmentButtonClicked = function(tavern) {
      var dialog = AWE.UI.Ember.AssignmentsDialog.create({
        controller: WACKADOO.presentScreenController,
        building: tavern,
      });
      WACKADOO.presentModalDialog(dialog);
    };

    that.tradeButtonClicked = function() {
      var dialog = AWE.UI.Ember.TradeNewView.create({
        settlement: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId),
        controller: WACKADOO.presentScreenController
      });
      WACKADOO.presentModalDialog(dialog);
    }
    
    that.avatarImageClicked = function() {
      WACKADOO.characterButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.   
    }
    that.avatarLabelClicked = function() {
      WACKADOO.characterButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.   
    }
    that.avatarLevelClicked = function() {
      WACKADOO.characterButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.   
    }
    
    that.allianceFlagClicked = function(allianceId) {
      if(allianceId)
      {
        WACKADOO.showAllianceDialog(allianceId); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
      }
      else
      {
        var unlockedAllianceCreation = false;
        var character = AWE.GS.CharacterManager.getCurrentCharacter();
        var settlement = AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId);
        if(settlement)
        {
          var slots = settlement.get('enumerableSlots');
          for(var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            if(slot.getPath('building.unlockedAllianceCreation'))
            {
              unlockedAllianceCreation = true;
            }
          }
        }

        var dialog = AWE.UI.Ember.AllianceDiplomacyDialog.create({
            unlockedAllianceCreation: unlockedAllianceCreation
          });
          WACKADOO.presentModalDialog(dialog);
      }       
    }

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
    /*Added from controller start*/
    that.messageView = null;
    that.updateMessageCenter = function() {
      var view = that.messageView;

      if (view) {
        var display = view.get('display');

        if (display === "outbox") {

          var outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
          if (!outbox) {
            AWE.GS.CharacterManager.getCurrentCharacter().fetchOutbox(function(outboxes, status) {
              if (status === AWE.Net.NOT_FOUND || !outboxes) {
                log('ERROR: outboxes of current character not found on server.');
              } 
              else { 
                outbox = AWE.GS.CharacterManager.getCurrentCharacter().get('outbox');
                if (outbox) {
                  outbox.fetchEntries();
                }
                else {
                  log('ERROR: no outbox found.');
                }
              }
            });
          }
          else if (outbox && outbox.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime()) { // timeout
            AWE.GS.OutboxManager.updateMessageBox(outbox.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(outbox, status) {
          
              if (outbox && outbox.getId() && status !== AWE.Net.NOT_MODIFIED) {
                outbox.fetchEntries()
              }
            });
          }
          
        }
        else if (display === "archive") {
          
          var archive = AWE.GS.CharacterManager.getCurrentCharacter().get('archive');
          if (!archive) {
            AWE.GS.CharacterManager.getCurrentCharacter().fetchArchive(function(archives, status) {
              if (status === AWE.Net.NOT_FOUND || !archives) {
                log('ERROR: archives of current character not found on server.');
              } 
              else { 
                archive = AWE.GS.CharacterManager.getCurrentCharacter().get('archive');
                if (archive) {
                  archive.fetchEntries();
                }
                else {
                  log('ERROR: no archive found.');
                }
              }
            });
          }
          else if (archive && archive.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime()) { // timeout
            AWE.GS.ArchiveManager.updateMessageBox(archive.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(archive, status) {
          
              if (archive && archive.getId() && status !== AWE.Net.NOT_MODIFIED) {
                archive.fetchEntries()
              }
            });
          }
          
        }
        else {
          AWE.GS.InboxManager.triggerInboxAutoUpdate();
        }
      }
    };

    //Message actions
    that.inboxClicked = function() {
      var view = that.messageView;
      view.hideForm(); // make sure, form is hidden
      view.switchTo('inbox');
    };
    that.outboxClicked = function() {
      var view = that.messageView;
      view.hideForm(); // make sure, form is hidden
      view.switchTo('outbox');
    };
    that.archiveClicked = function() {
      var view = that.messageView;
      view.hideForm(); // make sure, form is hidden
      view.switchTo('archive');
    };
    that.newClicked = function() {
      var view = that.messageView;
      view.showForm();
    };
    that.newAllianceMessageClicked = function() {
      var view = that.messageView;
      view.showAllianceMessageForm();
    };
    that.createDraftTo = function(recipientName) {
      var view = that.messageView;
      view.showForm();
      view.setPath('newMessage.recipient', recipientName);
    };
    that.discardDraft = function() {
      var view = that.messageView;
      view.destroyDialog();
    };
    
    
    that.sendMessage = function(message) {
      var self = this;
      action = AWE.Action.Messaging.createSendMessageAction(message);
      action.send(function(status, jqXHR) {
        log('SENT MESSAGE, STATUS', status);
        if (status === AWE.Net.CREATED || status === AWE.Net.OK) {
          self.discardDraft();
        }
        else if (status === AWE.Net.NOT_FOUND) {
          //self.view.setRecipientIsUnknown(true);
        }
        else {
          log(status, "ERROR: The server did not accept the message.");
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading:             AWE.I18n.lookupTranslation('server.error.failedAction.heading'),
            message:             AWE.I18n.lookupTranslation('server.error.failedAction.unknown'),
            okText:              AWE.I18n.lookupTranslation('settlement.buildings.missingReqWarning.cancelText'),
          });          
          WACKADOO.presentModalDialog(dialog);
        }
      });
    };
    /*Added from controller end*/
    that.activeAlliances = [];

    that.updateAlliance = function(allianceId) {
      var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
      if ((!alliance && allianceId) || (alliance && alliance.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
      var members = AWE.GS.CharacterManager.getMembersOfAlliance(allianceId);
      if ((!members || members.length == 0) || (members && AWE.GS.CharacterManager.lastUpdateAtForAllianceId(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < new Date().getTime())) { // have alliance id, but no corresponding alliance
        AWE.GS.CharacterManager.updateMembersOfAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
      AWE.GS.DiplomacyRelationManager.updateAllDiplomacyRelationsOfAlliance(allianceId);
    }
    
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
          if (HUDViews.stoneView) {
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
      
      // Resource HUD Views      
      if (!HUDViews.stoneView) {
        
        var resourceDetailsStone = function() {
          var resourceName = 'resource_stone';
          var dialog = AWE.UI.Ember.ResourceInformationDialog.create({resourceName: resourceName});
          WACKADOO.presentModalDialog(dialog);          
        }; 

        var resourceDetailsWood = function() {
          var resourceName = 'resource_wood';
          var dialog = AWE.UI.Ember.ResourceInformationDialog.create({resourceName: resourceName});
          WACKADOO.presentModalDialog(dialog);          
        };

        var resourceDetailsFur = function() {
          var resourceName = 'resource_fur';
          var dialog = AWE.UI.Ember.ResourceInformationDialog.create({resourceName: resourceName});
          WACKADOO.presentModalDialog(dialog);          
        };

        var resourceDetailsHandler = function() {
          var resourceName = this.resourceName();
          var dialog = AWE.UI.Ember.ResourceInformationDialog.create({resourceName: resourceName});
          WACKADOO.presentModalDialog(dialog);          
        }; 
        
        var cashDetailsHandler = function() {
          that.ingameShopButtonClicked();          
        };
        
        var spacingX = 10;
        var xOffset = spacingX;
        var resourceViewWidth = 180;
        var resourceViewHeight = 42;
        var root = that.rootElement();
        
        HUDViews.stoneView = AWE.UI.createResourceBubbleView();
        HUDViews.stoneView.initWithControllerResourceNameColorsAndFrame(that, "stone", 
          { topColor: "#89B1D0", bottomColor: "#425460" });
        HUDViews.stoneView.setFrame(AWE.Geometry.createRect(xOffset, 0, resourceViewWidth, resourceViewHeight));
        HUDViews.stoneView.onClick = function(){};//resourceDetailsHandler;
        _resourceStage.addChild(HUDViews.stoneView.displayObject()); 

        //add div for click 
        var stoneDiv = document.createElement('DIV');
        stoneDiv.style.position = 'fixed';
        stoneDiv.style.top   = 30+'px';
        stoneDiv.style.left  = 20+'px';
        stoneDiv.style.width = 180+'px';
        stoneDiv.style.height = 34+'px';
        stoneDiv.style.zoom = AWE.Settings.hudScale;
        stoneDiv.style.cursor = 'pointer';
        stoneDiv.style.zIndex = '50';
        stoneDiv.onclick = resourceDetailsStone;//HUDViews.stoneView.onClick;
        root.append(stoneDiv); 
        
        xOffset += resourceViewWidth + spacingX;

        HUDViews.woodView = AWE.UI.createResourceBubbleView();
        HUDViews.woodView.initWithControllerResourceNameColorsAndFrame(that, "wood", 
          { topColor: "#D7CC98", bottomColor: "#806322" },
          AWE.Geometry.createRect(xOffset, 0, resourceViewWidth, resourceViewHeight));
        HUDViews.woodView.onClick = function(){};//resourceDetailsHandler;
        _resourceStage.addChild(HUDViews.woodView.displayObject()); 
        
        //add div for click 
        var woodDiv = document.createElement('DIV');
        woodDiv.style.position = 'fixed';
        woodDiv.style.top   = 30+'px';
        woodDiv.style.left  = 205+'px';
        woodDiv.style.width = 180+'px';
        woodDiv.style.height = 34+'px';
        woodDiv.style.zoom = AWE.Settings.hudScale;
        woodDiv.style.cursor = 'pointer';
        woodDiv.style.zIndex = '50';
        woodDiv.onclick = resourceDetailsWood;//HUDViews.stoneView.onClick;
        root.append(woodDiv);

        xOffset += resourceViewWidth + spacingX - 10;
        
        HUDViews.furView = AWE.UI.createResourceBubbleView();
        HUDViews.furView.initWithControllerResourceNameColorsAndFrame(that, "fur", 
          { topColor: "#A45341", bottomColor: "#521103" },
          AWE.Geometry.createRect(xOffset, 0, resourceViewWidth, resourceViewHeight));
        HUDViews.furView.onClick = function(){};//resourceDetailsHandler;
        _resourceStage.addChild(HUDViews.furView.displayObject());
        
        //add div for click
        var furDiv = document.createElement('DIV');
        furDiv.style.position = 'fixed';
        furDiv.style.top   = 30+'px';
        furDiv.style.left  = 400+'px';
        furDiv.style.width = 180+'px';
        furDiv.style.height = 34+'px';
        furDiv.style.zoom = AWE.Settings.hudScale;
        furDiv.style.cursor = 'pointer';
        furDiv.style.zIndex = '50';
        furDiv.onclick = resourceDetailsFur;//HUDViews.stoneView.onClick;
        root.append(furDiv);

        xOffset += resourceViewWidth + spacingX - 5;                
        HUDViews.toadsView = AWE.UI.createResourceCashBubbleView();
        HUDViews.toadsView.initWithControllerColorsAndFrame(that,
          { topColor: "#94BE57", bottomColor: "#658434" },
          AWE.Geometry.createRect(xOffset, 0, resourceViewWidth, resourceViewHeight));
        HUDViews.toadsView.onClick = function(){};//cashDetailsHandler;
        _resourceStage.addChild(HUDViews.toadsView.displayObject());

        //add div for click start
        var toadsDiv = document.createElement('DIV');
        toadsDiv.style.position = 'fixed';
        toadsDiv.style.top   = 30 +'px';
        toadsDiv.style.left  = 570 +'px';
        toadsDiv.style.width = 180+'px';
        toadsDiv.style.height = 34+'px';
        toadsDiv.style.zoom = AWE.Settings.hudScale;
        toadsDiv.style.cursor = 'pointer';
        toadsDiv.style.zIndex = '50';
        toadsDiv.onclick = cashDetailsHandler;//HUDViews.stoneView.onClick;
        root.append(toadsDiv);
        //add div end  
      }
      
      // Profile HUD View
      if (!HUDViews.profileControlsView) {
        HUDViews.profileControlsView = AWE.UI.createProfileHUDControlsView();
        HUDViews.profileControlsView.initWithController(that);
        _stageProfile.addChild(HUDViews.profileControlsView.displayObject()); 
      }
      // Left HUD View
      /*if (!HUDViews.leftHUDControlsView) {
        HUDViews.leftHUDControlsView = AWE.UI.createLeftHUDControlsView();
        HUDViews.leftHUDControlsView.initWithController(that);
        _stageLeft.addChild(HUDViews.leftHUDControlsView.displayObject());
      }*/
      
      // Right HUD View
      /*if (!HUDViews.rightHUDControlsView) {
        HUDViews.rightHUDControlsView = AWE.UI.createRightHUDControlsView();
        HUDViews.rightHUDControlsView.initWithController(that);
        _stageRight.addChild(HUDViews.rightHUDControlsView.displayObject());
      }*/
      
      return true; 
    };


    // ///////////////////////////////////////////////////////////////////////
    //
    //   Tutorial Marker
    //
    // ///////////////////////////////////////////////////////////////////////
    
    that.lastMarkerUpdate = new Date(1970);

    that.updateUIMarker = function() {
      var mark = that.shouldMarkMapButton();
      if (mark && !_domLeft.get('uiMarkerEnabled')) {
        _domLeft.set('uiMarkerEnabled', true);
      }
      else if (!mark && _domLeft.get('uiMarkerEnabled')) {
        _domLeft.set('uiMarkerEnabled', false);
      }
    };

    that.markProfile = function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_PROFILE);
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
                        
        if ((oldWindowSize && !oldWindowSize.equals(_windowSize)) || /*!HUDViews.leftHUDControlsView*/!HUDViews.profileControlsView) { // TODO: only update at start and when something might have changed (object selected, etc.)
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

    var addMarkerToView = function(view, position, stage) {
      var stage = stage || 2;
      var marker = AWE.UI.createMarkerView();
      marker.initWithControllerAndMarkedViewLeft(that, view);
      //added marker to profile hier
      _stageProfile.addChild(marker.displayObject());

      if (that.animatedMarker) {
        that.animatedMarker.cancel();
        that.animatedMarker = null;
      }
      that.animatedMarker = that.addBouncingAnnotationLabelLeft(view, marker, 10000000, position, stage, _stageProfile);
      view.setNeedsUpdate();
    }

    var removeMarker = function() {
      if (that.animatedMarker) {
        that.animatedMarker.cancel();
        that.animatedMarker.update();
        that.animatedMarker = null;
      }
    }

    that.addBouncingAnnotationLabelLeft = function (annotatedView, annotation, duration, offset, stage, currentStage) {
      duration = duration || 10000;
      offset = offset || AWE.Geometry.createPoint(0, -50);
      stage = stage || 2;

      var bounceHeight = 50;
      var bounceDuration = 1000.0;

      //_stages[stage].addChild(annotation.displayObject());

      var animation = AWE.UI.createTimedAnimation({
        view:annotation,
        duration:duration,

        updateView:function () {
          return function (view, elapsed) {
            var height = (Math.sin(elapsed * duration / bounceDuration * 2.0 * Math.PI) / 2.0 + 0.5) * bounceHeight;
            view.setOrigin(AWE.Geometry.createPoint(annotatedView.frame().origin.x + offset.x - height,
              annotatedView.frame().origin.y + offset.y));
          };
        }(),

        onAnimationEnd:function (viewToRemove) {
          return function () {
            currentStage.removeChild(viewToRemove.displayObject());
            log('removed animated label on animation end');
          };
        }(annotation),
      });

      that.addAnimation(animation);
      return animation;
    }
    
    that.addBouncingAnnotationLabel = function (annotatedView, annotation, duration, offset, stage) {
      duration = duration || 10000;
      offset = offset || AWE.Geometry.createPoint(0, -50);

      var bounceHeight = 50;
      var bounceDuration = 1000.0;

      //_stageLeft.addChild(annotation.displayObject());

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
            //_stageLeft.removeChild(viewToRemove.displayObject());
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
      
        if (_domLeft && _loopCounter % 10 == 0) {
          var lastTutorialUpdate = Date.parseISODate(AWE.GS.TutorialStateManager.getTutorialState().get('updated_at'));

          if (lastTutorialUpdate > that.lastMarkerUpdate) {
            that.lastMarkerUpdate = lastTutorialUpdate;
            
            that.updateUIMarker();
          }
        }              
        
        // STEP 2: update Model
        that.updateModel();
        if(that.activeAlliances.length > 0) {
          that.activeAlliances.forEach(function(allianceId){
            that.updateAlliance(allianceId);
          });
        }

        if(that.messageView != null)
        {
          that.updateMessageCenter();
        }
        
                
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
        if (_needsDisplay || _loopCounter % 10 == 0 || that.modelChanged() || animating) {//was 60, changed to 10 for better button view update on profile HUD by mouse down
          
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
            //_stageLeft.update();
            //_stageRight.update();
            //Tutorial marker for Profile canvas here
            if(HUDViews.profileControlsView && that.markProfile() && !markerAdded)
            {
               addMarkerToView(HUDViews.profileControlsView, AWE.Geometry.createPoint(50, 30));
               markerAdded = true;
            }
            else if(!that.markProfile() && markerAdded)
            {
              removeMarker();
              markerAdded = false;
            }
            //stage updates
            _stageProfile.update();
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



