/**
 * @fileOverview
 * Standard application controller of AWE.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 * @author Julian Schmid
 */
var AWE = AWE || {};

AWE.Application = (function(module) {

  /**
   * Application object for controlling several layered Canvas Objects with
   * associated EaselJS stages.
   *
   * The application controller itself adds two stages and one dom layer:
   * - notification stage
   * - menue stage (HUD)
   * - dialog layer (DOM layer for modal HTML dialogs)
   *
   * Screen controllers are used to add and exchange any number of stages
   * or dom layers below these three application layers. So it's possible
   * to switch between different screens of the applicaton, while always
   * having centrally-controller menue, notification and dialog layers on
   * top.
   *
   * Mouse events
   * ============
   *
   * - we catch mouse events globally and pass them to presentScreenControllers
   *   in case they listen to the particular event (by implementing an
   *   onMouse...  handler).
   * - one thing to note: we don't use clicks generated by the browser but
   *   generate them ourselves. therefore we always catch the mouseUp event
   *   and determine, whether or not to generate clicks on views.
   * - from the controller standpoint, a single click looks like (produces
   *   these) events: mouseDown, --- click, mouseUp.
   *
   * @class
   * @name AWE.Application.MultiStageApplication
   */
  module.MultiStageApplication = Ember.Application.extend(function() {

    var oldMouseX = 0, mouseX = 0, mouseY = 0, oldMouseY = 0;
    var hoveredView=null;
    var stageHovered=-1;
    var nextMouseOverTest = new Date(1970).getTime();
    var mouseOverTestTimeout = 200; // test every x ms
    var lastDistance = 0;
    var multiTouch = false;
    var isAndroid = navigator.userAgent.toLowerCase().indexOf('android') >= 0;

    var _uiEnabled = false;
    var _hideHud = true;

    var mouseCommonTarget = null;

    return /** @lends AWE.Application.MultiStageApplication# */ {

      hudController: null,
      extrasController: null,
      notificationController: null,

      presentScreenController: null,
      allianceScreenController: null,
      readyForRunloop: false,

      runloopStartedAt: null,

      screenContentAnchor: $('#screen-content'),
      notificationLayerAnchor: $('#notification-layer'),
      hudLayerAnchor: $('#hud-layer'),
      dialogLayerAnchor: $('#dialog-layer'),

      hudStages: null,
      notificationStages: null,
      allStages: null,

      isModal: false,
      isPassingEvent: false,

      modalDialogs: null,

      lastClick: null,

      domElements: [], //< contains the list of dom elements that can also catch mouse events


      touchHandler: function(event) {
        var touches = event.changedTouches,
        first = touches[0],
        delta = 1,
        type = "";
        switch(event.type) {
          case "touchstart": type = "mousedown"; break;
          case "touchmove":  type="mousemove"; break;        
          case "touchend":   type="mouseup"; break;
          case "touchcancel": type="mouseleave"; break;
          default: return;
        }
    
        if (event.type === "touchstart") {
          if (event.touches.length > 1) {
            var xdist = (event.touches[0].pageX - event.touches[1].pageX);
            var ydist = (event.touches[0].pageY - event.touches[1].pageY)
            lastDistance = Math.sqrt(xdist * xdist + ydist * ydist);
            multiTouch = true;
          } else {
            multiTouch = false;
          }
        }   
        if (event.type === "touchmove") {
          if (event.touches.length > 1) {            
            var xdist = (event.touches[0].pageX - event.touches[1].pageX);
            var ydist = (event.touches[0].pageY - event.touches[1].pageY)
            var newDistance = Math.sqrt(xdist * xdist + ydist * ydist);
            delta = Math.round(lastDistance-newDistance);  
            if (delta === 0 || delta === undefined) {
              event.preventDefault();
              return;
            }   
            lastDistance = newDistance;
            type = "mousewheel";  
          }
        }
        if (!(type === "mousewheel") && multiTouch) {
          event.preventDefault();
          return;
        }
        //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
        //           screenX, screenY, clientX, clientY, ctrlKey, 
        //           altKey, shiftKey, metaKey, button, relatedTarget);
        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, delta, 
                              first.screenX, first.screenY, 
                              first.clientX, first.clientY, false, 
                              false, false, true, 0/*left*/, null);



        first.target.dispatchEvent(simulatedEvent);
      },

      /** custom object initialization goes here. */
      init: function() {
        var self = this;
        this._super();
        this.set('controllerStages', []); //
        this.set('notificationStages', []); //
        this.set('hudStages', []); //

        this.set('modalDialogs', []);

        $('body').mousemove(function(event) {
          if (!(event.metaKey) && isAndroid) return;
          mouseX = event.pageX;
          mouseY = event.pageY;
        });
        // register controller to receive click events in screen
        $('#layers').mouseup(function(evt) {
          if (!(evt.metaKey) && isAndroid) return;
          log('Mouse up event in multi stage application controller.');
          self.handleMouseUp(evt);
        });

        // register controller to receive window-resize events (from browser window)
        // in order to adapt it's own window / display area
        $(window).resize(function(evt){
          self.onResize(evt);
        });

        document.addEventListener("touchstart", self.touchHandler, true);
        document.addEventListener("touchmove", self.touchHandler, true);
        document.addEventListener("touchend", self.touchHandler, true);
        document.addEventListener("touchcancel", self.touchHandler, true); 
      },

      /**
        * Experimental currently NOT IN USE,
        * should send the event automatically to an dom element that lies
        * behind an canvas
        **/
      sendEventToDom: function(evt) {
        if (!this.get('isPassingEvent') && evt.srcElement && evt.srcElement.tagName === "CANVAS") {
          this.set('isPassingEvent', true);
          //remove element
          srcElement = $(evt.srcElement);
          parent = srcElement.parent();
          prev = srcElement.prev();
          srcElement.detach();

          //send out new event
          el = document.elementFromPoint(evt.clientX,evt.clientY);
          if (el && el.id && el.id != "") {

            /*evt.srcElement = el;
            evt.target = el;
            evt.toElement = el;*/
            log("triggering "+evt.type);
            $("#"+el.id).triggerHandler(evt.type);
            //$(el).triggerHandler(evt.type);//, evt);
            //$(el).css("border", "2px");
            //$("body").triggerHandler(evt.type, evt);
          }

          //reattach
          if (prev.length > 0) {
            log("inserting after prev");
            prev.after(srcElement);
          } else {
            log("prepending in parent");
            parent.prepend(srcElement);
          }
          this.set('isPassingEvent', false);
        } else if (this.get('isPassingEvent')) {
          log("passing event state");
        }
      },

      readyToRun: function() {
        this.set('readyForRunloop', true);
        this.set('runloopStartedAt', new Date());
        log ('RREADY', this.readyForRunloop, this.get('readyForRunloop'));
      },

      generateClickIfNeeded: function(evt) {
        log('entered click handler');
        var presentScreenController = this.get('presentScreenController');

        if (presentScreenController && presentScreenController.isScrolling()) {
          // log("ignored click --> presentScreenController.isScrolling() == true");
          return ; // just ignore it here!
        }

        if (this.get('isModal')) {
          // log("ignored click --> isModal == true");
          return ;
        }

        if ($(evt.target).parents('div#jappix_mini').length) {
          log('catched by jappix');
          return;
        }

        var allStages = this.get('allStages');
        // TODO: can we use stage.mouseX here or should we better apply the stage-transformations to pageX?

        var target = null;
        for (var layer=0; layer < allStages.length && !target; layer++) {
          // targetLayer = layer;
          if (allStages[layer].stage.mouseInBounds && !allStages[layer].transparent) {
            var stage = allStages[layer].stage;
            target = stage.getObjectUnderPoint(evt.pageX-stage.canvas.offsetLeft, evt.pageY-stage.canvas.offsetTop); // TODO: don't use absolute evt.pageX here, right?!
          }
        }

        if (target) {
          if (target && target.view && target.view.onClick) { // TODO: in our view layer: propagate clicks upwards along responder chain.
            log('click on target'+ target.view+' '+ target.view.typeName());
            if (target.view.enabled()) {
              log("click forwarded to target.view.onClick(..)");
              target.view.onClick(evt); // TODO: I think this is wrong; we somehow need to get the relative coordinates in.
            }
            else {
              console.log('click on disabled view.');
            }
          }
          else if (target && target.onClick) {
            log("click forwarded to target.onClick(..)");
            target.onClick(evt);
          }
        }
        else if (this.get('presentScreenController').onClick) {    // no view hit, let the event bubble to controller (TODO: make this a pattern through views and controllers, aka repsonder-chain)
          this.get('presentScreenController').onClick(evt);
        }
        else {
          log("click passed through all layers");
          //this.sendEventToDom(evt);
        }
      },

      generateDoubleClickIfNeeded: function(evt) {
        log('entered click handler');
        var presentScreenController = this.get('presentScreenController');

        if (presentScreenController && presentScreenController.isScrolling()) {
          // log("ignored click --> presentScreenController.isScrolling() == true");
          return ; // just ignore it here!
        }

        if (this.get('isModal')) {
          // log("ignored click --> isModal == true");
          return ;
        }

        if ($(evt.target).parents('div#jappix_mini').length) {
          log('catched by jappix');
          return;
        }

        var allStages = this.get('allStages');
        // TODO: can we use stage.mouseX here or should we better apply the stage-transformations to pageX?

        var target = null;
        for (var layer=0; layer < allStages.length && !target; layer++) {
          // targetLayer = layer;
          if (allStages[layer].stage.mouseInBounds && !allStages[layer].transparent) {
            var stage = allStages[layer].stage;
            target = stage.getObjectUnderPoint(evt.pageX-stage.canvas.offsetLeft, evt.pageY-stage.canvas.offsetTop); // TODO: don't use absolute evt.pageX here, right?!
          }
        }

        if (target) {
          if (target && target.view && target.view.onDoubleClick) { // TODO: in our view layer: propagate clicks upwards along responder chain.
            log('click on target', target.view, target.view.typeName())
            if (target.view.enabled()) {
              log("click forwarded to target.view.onClick(..)");
              target.view.onDoubleClick(evt); // TODO: I think this is wrong; we somehow need to get the relative coordinates in.
            }
            else {
              log('click on disabled view.');
            }
          }
          else if (target && target.onDoubleClick) {
            log("click forwarded to target.onClick(..)");
            target.onDoubleClick(evt);
          }
        }
        else if (this.get('presentScreenController').onDoubleClick) {    // no view hit, let the event bubble to controller (TODO: make this a pattern through views and controllers, aka repsonder-chain)
          this.get('presentScreenController').onDoubleClick(evt);
        }
        else {
          log("click passed through all layers");
          //this.sendEventToDom(evt);
        }
      },

      /** passes a click in the browser window either to the view that was hit
       * or to the present screen controller that gets the chance to handle the
       * otherwise unhandled click. */
      handleMouseUp:  function(evt) {
        log('HANDLE MOUSE UP');

        var now = (new Date()).getTime();

        if (this.isCatchedByDomElement(evt.pageX, evt.pageY, evt.type)) {
          log("click ignored -- isCatchedByDomElement(...) == true");
          return;
        }

        var presentScreenController = this.get('presentScreenController');

        if (this.get('lastClick') !== null && now - this.get('lastClick') <= AWE.Config.MAP_DBLCLK_MAX_TIME_FOR_DBLCLK) {
          this.generateDoubleClickIfNeeded(evt);
        }
        else {
          this.generateClickIfNeeded(evt);
          this.set('lastClick', now);
        }

        // finally pass the mouse up event itself to controller, if it listens
        if (presentScreenController && presentScreenController.onMouseUp) {
          presentScreenController.onMouseUp(evt);
        }

         //added mouseup event for canvas buttons, as example was onclick used
        log('entered mouseup handler');
        var presentScreenController = this.get('presentScreenController');

        if (presentScreenController && presentScreenController.isScrolling()) {
          return ; // just ignore it here!
        }

        if ($(evt.target).parents('div#jappix_mini').length) {
          log('catched by jappix');
          return;
        }

        //default mouseup, if target not under mouse pointer
        if(mouseCommonTarget){
          if (mouseCommonTarget && mouseCommonTarget.view && mouseCommonTarget.view.onMouseDown) { // TODO: in our view layer: propagate clicks upwards along responder chain.
            log('mouseup on mouseCommonTarget'+ mouseCommonTarget.view+' '+ mouseCommonTarget.view.typeName());
            if (mouseCommonTarget.view.enabled()) {
              log("mouseup forwarded to mouseCommonTarget.view.onMouseUp(..)");
              mouseCommonTarget.view.onMouseUp(evt); // TODO: I think this is wrong; we somehow need to get the relative coordinates in.
              mouseCommonTarget = null;
            }
            else {
              console.log('mouseup on disabled view.');
             }
          }
          else if (mouseCommonTarget && mouseCommonTarget.onMouseUp) {
            log("mouseup forwarded to target.onMouseUp(..)");
            mouseCommonTarget.onMouseUp(evt);
            mouseCommonTarget = null;
          }
        }

        var allStages = this.get('allStages');
      },

      /** finds the easelJS DisplayObject that the mouse is over and generates
       * onMouseOver and onMouseOut events as needed on state changes. Differing
       * from easel's implementation, our version DOES know about the layering
       * of mulitple stages. It will deliver events only to one object at a time
       * (DisplayObject on the top-most stage) and it will also correctly
       * generate a MouseOut event when the mouse pointer enters a view on another,
       * overlapping stage. */
       testMouseOver: function() {

        if (this.get('isModal')) {
          return ;
        }

        if (nextMouseOverTest > new Date().getTime()) {
          return ;
        }

        if (mouseX === oldMouseX && mouseY === oldMouseY) {
          return ;
        }
        oldMouseX = mouseX;
        oldMouseY = mouseY;

        if (this.get('presentScreenController') && this.get('presentScreenController').isScrolling()) {
          return ; // just ignore it here!
        }


        nextMouseOverTest = new Date().getTime() + mouseOverTestTimeout;

        var allStages = this.get('allStages');

        if (!allStages || allStages.length === 0) {
          return ;
        }

        // start with top-most stage, find the view that is hit by the mouse pointer.
        // Only continue with next stage in stack, in case no view is hit at present
        // stage.
        var target = null;
        var relX, relY;
        var targetLayer = -1;
        for (var layer=0; layer < allStages.length && !target; layer++) {
          targetLayer = layer;
          if (allStages[layer].stage.mouseInBounds && !allStages[layer].transparent) {
            var stage = allStages[layer].stage;
            target = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY);
            relX= stage.mouseX;  // store coordinates in stage's local coordinate system
            relY= stage.mouseY;
          }
        }

        // in case the state changed (another view (or nothing) is hit), generate and
        // send the correct mouseout / mouseover events.
        if (hoveredView != target) {
          if (hoveredView && hoveredView.onMouseOut && stageHovered >= 0 && allStages[stageHovered].mouseOverEvents) {
            hoveredView.onMouseOut(new MouseEvent("onMouseOut", relX, relY, hoveredView));
          }
          hoveredView = target;
          stageHovered = targetLayer;

          if (target && target.onMouseOver && allStages[targetLayer].mouseOverEvents) {
            target.onMouseOver(new MouseEvent("onMouseOver", relX, relY, target));
          }
        }
      },


      /** registers the runloop to be started with next animation frame. Triggered
       * by window.requestAnimationFrame. */
      startRunloop: function() {
        window.requestAnimFrame(function(self) { return function() {self.runloop(); }; }(this)); // wrap it to keep context (this) correct
      },


      /** the application's runloop. Does basic stuff needed by the application and then hands over
       * control to the view controller that has to do all the real work. The idea behind implementing
       * the runloop inside view controllers is to spread the application logic for different screens
       * (map screen, settlement screen, news screen, message center) among individual, unrelated
       * classes. That is, each screen should be able to implement it's own application logic, so that
       * it can choose the best technique for the particular task (e.g. canvas for the map, basic HTML
       * for sending and receiving messages.) */
      runloop: function() {
        if (this.get('readyForRunloop') && this.get('presentScreenController')) {
          this.testMouseOver();
          if (this.get('hudController')) this.get('hudController').runloop();
          if (this.get('extrasController')) this.get('extrasController').runloop();
          if (this.get('notificationController')) this.get('notificationController').runloop();
          this.get('presentScreenController').runloop(); // hand over control to present screen controller


          if (!_uiEnabled && this.get('presentScreenController').readyForUI()) {

            if (AWE.GS.CharacterManager.getCurrentCharacter().get('base_node_id')) {
              AWE.Log.Debug('UI has been enabled.');
              _uiEnabled = true;
              this.get('presentScreenController').enableUI();
              this.get('hudController').showHud();
            }
          }

          // TODO: Game State Runloop!

          if (this.lastRunloopRun.getTime() + 1000 < new Date().getTime()) {
            this.lastRunloopRun = new Date();
            AWE.GS.InboxManager.triggerInboxAutoUpdate();
            AWE.GS.TutorialStateManager.triggerTutorialChecks();
            this.checkCharacterRankProgress();
          }
        }
        window.requestAnimFrame(function(self) { return function() {self.runloop(); }; }(this));  // request next animation frame that will initiate the next cycle of the runloop
      },

      lastRunloopRun: new Date(1970),

      checkCharacterRankProgress: function() {
        var character = AWE.GS.CharacterManager.getCurrentCharacter();
        var startedAt = this.get('runloopStartedAt');
        if (startedAt && startedAt.getTime() + 5000 < new Date().getTime() &&
            character && !this.get('isModal') && character.advancedInMundaneRank()) {
          try {
            AndroidDelegate.mundaneRankIncreased();
          } catch(err) {
          }
          var action = AWE.Action.Fundamental.createChangeCharacterNotifiedRankAction(true,false); // notifed user of mundane rank
          var dialog = AWE.UI.Ember.CharacterProgressDialog.create({
            character: character,
          });
          this.presentModalDialog(dialog);
          character.setNotifiedAvancedInMundaneRank();
          action.send();
        }
      },

      setModal: function(state) {
        if (this.get('isModal') != state) {
          // respond to state chage and do the necessary stuff
          //   add / remove darkened-out layer
          //   disable / enable mouse-over-events
          this.set('isModal', state);
        }
      },

      onMouseDown: function(evt) {
        log('MSA.onMouseDown')
        //if this event is already handled by a dom element ignore it
        if (this.isCatchedByDomElement(evt.pageX, evt.pageY, evt.type)) {
          log('catched by DOM ELEMENT');
          return;
        }
        if ($(evt.target).parents('div#jappix_mini').length) {
          log('catched by jappix');
          return;
        }
        var controller = this.get('presentScreenController');
        if (!this.get('isModal') && controller && controller.onMouseDown) {
          controller.onMouseDown(evt);
        }

        //added mousedown event for canvas buttons, as example was onclick used
        log('entered mousedown handler');
        var presentScreenController = this.get('presentScreenController');

        if (presentScreenController && presentScreenController.isScrolling()) {
          // log("ignored click --> presentScreenController.isScrolling() == true");
          return ; // just ignore it here!
        }

        if (this.get('isModal')) {
          // log("ignored click --> isModal == true");
          return ;
        }

        if ($(evt.target).parents('div#jappix_mini').length) {
          log('catched by jappix');
          return;
        }

        var allStages = this.get('allStages');
        // TODO: can we use stage.mouseX here or should we better apply the stage-transformations to pageX?

        var target = null;
        for (var layer=0; layer < allStages.length && !target; layer++) {
          // targetLayer = layer;
          if (allStages[layer].stage.mouseInBounds && !allStages[layer].transparent) {
            var stage = allStages[layer].stage;
            target = stage.getObjectUnderPoint(evt.pageX-stage.canvas.offsetLeft, evt.pageY-stage.canvas.offsetTop); // TODO: don't use absolute evt.pageX here, right?!
            mouseCommonTarget = target;
          }
        }

        if (target) {
          if (target && target.view && target.view.onMouseDown) { // TODO: in our view layer: propagate clicks upwards along responder chain.
            log('mousedown on target'+ target.view+' '+ target.view.typeName());
            if (target.view.enabled()) {
              log("mousedown forwarded to target.view.onMouseDown(..)");
              target.view.onMouseDown(evt); // TODO: I think this is wrong; we somehow need to get the relative coordinates in.
            }
            else {
              console.log('mousedown on disabled view.');
            }
          }
          else if (target && target.onMouseDown) {
            log("mousedown forwarded to target.onMouseDown(..)");
            target.onMouseDown(evt);
          }
        }
        else {
          log("mousedown passed through all layers");
        }
      },


      onMouseWheel: function(evt) {
        var pageX = evt.pageX || (evt.originalEvent ? evt.originalEvent.pageX : null);
        var pageY = evt.pageY || (evt.originalEvent ? evt.originalEvent.pageY : null);

        if (pageX && pageY && this.isCatchedByDomElement(pageX, pageY, evt.type)) {
          return;
        }

        if ($(evt.target).parents('div#jappix_mini').length || $(evt.target).hasClass('jm_received-messages')) {
          if ($(evt.target).hasClass('jm_received-messages')) {
            target = $(evt.target);
          } else {
            target = $(evt.target).parents('div.jm_received-messages')
          };

          delta = this.mouseWheelDelta(evt);
          if (delta > 0) {
            if (target.prop('scrollHeight') <= target.prop('clientHeight') + target.prop('scrollTop')) { 
              evt.preventDefault();
            }
          } else if (delta < 0) {
            if (target.prop('scrollTop') <= 0) { 
              evt.preventDefault();
            }
          }

          log('catched by jappix');
          return;
        }
        var controller = this.get('presentScreenController');
        if (!this.get('isModal') && controller && controller.onMouseWheel) {
          controller.onMouseWheel(evt);
        }
      },


      mouseWheelDelta: function(evt) {
        if (evt.originalEvent.deltaY) return evt.originalEvent.deltaY;
        if (evt.originalEvent.detail) return evt.originalEvent.detail;
        if (evt.originalEvent && evt.originalEvent.wheelDelta) return evt.originalEvent.wheelDelta * -1;
      },


      onMouseLeave: function(evt) {
        var controller = this.get('presentScreenController');
        if (!this.get('isModal') && controller && controller.onMouseLeave) {
          controller.onMouseLeave(evt);
        }
      },

      onResize: function(evt) {
        var controller = this.get('presentScreenController');
        var hudcontroller = this.get('hudController');
        var notificationcontroller = this.get('notificationController');

        if (controller && controller.onResize) {
          controller.onResize(evt);
        }
        if (hudcontroller && hudcontroller.onResize) {
          hudcontroller.onResize(evt);
        }
        if (notificationcontroller && notificationcontroller.onResize) {
          notificationcontroller.onResize(evt);
        }
      },

      bindEventHandlers: function(controller) {
        var self = this;

        var allStages = this.get('allStages');
        for (var layer=0; layer < allStages.length; layer++) {
          Touch.enable(allStages[layer].stage);
        }  

        if (controller.onMouseDown) {
          // register controller to receive mouse-down events in screen
          $('body').mousedown(function(evt) {
            if (!(evt.metaKey) && isAndroid) return;
            log(evt.type);
          //$('#layers').mousedown(function(evt) {
            self.onMouseDown(evt);
          });
        }


        if (controller.onMouseLeave) {
          // register controller to receive mouse-down events in screen
          $('body').mouseleave(function(evt) {
            if (!(evt.metaKey) && isAndroid) return;
            log("mouseleave");
            self.onMouseLeave(evt);
          });
        }

        // register controller to receive mouse-wheel events in screen
        if (controller.onMouseWheel) {
          $(window).bind('mousewheel', function(evt) {
            if (!(evt.metaKey) && isAndroid) return;
            self.onMouseWheel(evt);
          });

          // register controller to receive mouse-wheel events in screen (mozilla)
          $(window).bind('DOMMouseScroll', function(evt) {
            if (!(evt.metaKey) && isAndroid) return;
            self.onMouseWheel(evt);
          });
        }
      },

      unbindEventHandlers: function() {
        $(window).unbind('mousedown');
        $(window).unbind('mousewheel');     // remove all event handlers that were bound to the window.
        $(window).unbind('DOMMouseScroll');
        $(window).unbind('mouseleave');
      },

      resetAllStages: function() {
        var allStages = (this.get('controllerStages').concat(this.get('notificationStages')).concat(this.get('hudStages'))).reverse();
        this.set('allStages', allStages);
      },

      append: function(controller) {
        if (this.get('screenContentAnchor')) {
          this.get('screenContentAnchor').append(controller.rootElement()); // add to dom
          this.set('controllerStages', controller.getStages());
          this.resetAllStages();
          this.bindEventHandlers(controller);
        }
      },

      remove: function(controller) {
        if (this.get('screenContentAnchor')) {
          this.unbindEventHandlers();
          this.set('controllerStages', []);
          this.resetAllStages();
          controller.rootElement().remove(); // remove from dom
        }
      },

      setScreenController: function(controller, preventZoomingToLastSelection) {
        var rootController = this.get('presentScreenController');
        if (controller != rootController) {
          if (rootController) {
            if (hoveredView) {
              if (hoveredView.onMouseOut && stageHovered >= 0 && this.get('allStages')[stageHovered].mouseOverEvents) {
                hoveredView.onMouseOut(new MouseEvent("onMouseOut", mouseX, mouseY, hoveredView));
              }
              hoveredView = null;
              stageHovered = -1;
            }
            //debugger;
            rootController.viewWillDisappear();
            this.remove(rootController);
            rootController.viewDidDisappear();
            if (rootController.typeName == 'SettlementController' && controller.typeName == 'MapController' && !preventZoomingToLastSelection === true) {
              var settlement = AWE.GS.SettlementManager.getSettlement(rootController.settlementId);
              if (!controller.selectedView() || (controller.selectedView().location && controller.selectedView().location() != settlement.get('location'))) {
                controller.centerSettlement(settlement);
              }
              controller.setSelectedSettlement(settlement);
            }
          }
          this.set('presentScreenController', controller);
          if (controller) {
            controller.viewWillAppear();
            this.append(controller);
            controller.applicationController = this;
            controller.viewDidAppear();
            if (_uiEnabled) {
              controller.enableUI();
            }
          }
        }
      },

      setHudController: function(controller) {
        var presentHudController = this.get('hudController');
        log('in set hud controller', controller);
        if (controller != presentHudController) {
          if (presentHudController) {
            presentHudController.viewWillDisappear();
            this.set('hudStages', []);
            this.resetAllStages();
            presentHudController.rootElement().remove();
            presentHudController.viewDidDisappear();
          }
          this.set('hudController', controller);
          log('setHUD CONTROLLER', controller);
          if (controller) {
            controller.viewWillAppear();
            this.get('hudLayerAnchor').append(controller.rootElement()); // add to dom
            this.set('hudStages', controller.getStages());
            this.resetAllStages();
            controller.applicationController = this;
            controller.viewDidAppear();
          }
        }
      },

      setExtrasController: function(controller) {
        var presentExtrasController = this.get('extrasController');
        log('in set extras controller', controller);
        if (controller != presentExtrasController) {
          this.set('extrasController', controller);
        }
      },

      closeAllModalDialogs: function() {
        console.log(new Date().getTime()-this.lastClick);
        if (new Date().getTime()-this.lastClick < 500) return;
        while (this.modalDialogs.length > 0) {
         this.modalDialogs[this.modalDialogs.length-1].destroy();
        }
      },

      modalDialogClosed: function(dialog) {
        do {
          log('poped the top-most modal dialog.');
        } while (this.modalDialogs.length > 0 && this.modalDialogs.pop() != dialog);
        this.setModal(this.modalDialogs.length > 0);
      },

      presentModalDialog: function(dialog) {
        this.setModal(true);
        dialog.onClose = (function(self) {
          return function(dialog) {            
            self.modalDialogClosed(dialog) };
        }(this));
        if(dialog.setCloseMarker && AWE.GS.TutorialStateManager.tutorialEnabled())
        {
          dialog.setCloseMarker(true);
        }
        this.modalDialogs.push(dialog);
        dialog.append();
      },

      presentDomOverlay: function(dialog) {
        this.modalDialogs.push(dialog);
        dialog.append();
      },


      modalDialogOpen: function() {
        return this.get('isModal');
      },

      //****** dom elements handlers ******/
      /** adds a dom element to the list of dom elements which can prevent a click
        * @note for the dom element
        */
      addDomElement: function(element, checkForEvents) {
        this.domElements.push({
          element: element,
          checkForEvents: checkForEvents
        });
      },

      removeDomElement: function(element) {
        var si = -1;
        for(var i = 0; i < this.domElements.length; i++) {
          if (this.domElements[i].element === element) {
            si = i;
          }
        }
        if(si != -1) {
          this.domElements.splice(si, 1);
        }
      },
      isCatchedByDomElement: function(x,y, eventName) {
        var isIn = function(element) {
          return (x >= $(element).offset().left &&
              x < $(element).offset().left + $(element).outerWidth() &&
              y >= $(element).offset().top &&
              y < $(element).offset().top + $(element).outerHeight()
            );
        };
        var result = false;
        var checkForEvent = function(element) {
          var eventsData = $(element).data("events");
          if (eventsData !== undefined && eventsData.hasOwnProperty(eventName) && eventsData[eventName].length > 0) {
            if (isIn(element)) {
              result = true;
              return;
            }
          }
          $(element).children().each(function(i, child) {
            checkForEvent(child);
          });
        };

        for (var i = 0; i < this.domElements.length; i++) {
          var element = this.domElements[i].element;
          if (typeof element === "string") {  // it is possible to specify string selectors
            element = $(element+":visible");
          }

          if (element) {
            element = element.length === undefined ? [element] : element; // make sure it is an array
            for (var j=0; j < element.length; j++) {
//              log('CHECK ELEMENT', element[j], j, this.domElements[i].checkForEvents);
              if (this.domElements[i].checkForEvents) {
                checkForEvent(element[j]);
                if (result) {
//                  log('CATCHED BY THIS ELEMENT');
                  return true;
                }
              } else {
                if (isIn(element[j])) {
//                  log('CATCHED BY THIS ELEMENT:', element[j]);
                  return true;
                }
              }
            }
            // log('NOT CATCHED BY THIS ELEMENT');
          }
        }
        return false;
      }
    }
  }());

  return module;

}(AWE.Application || {}))
