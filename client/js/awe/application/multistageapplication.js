/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Application = (function(module) {

  /*
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
   */
  module.MultiStageApplication = Ember.Application.extend(function() {
  
    var oldMouseX = 0, mouseX = 0, mouseY = 0, oldMouseY = 0;
    var hoveredView=null;
    var stageHovered=-1;
    var nextMouseOverTest = new Date(1970).getTime();
    var mouseOverTestTimeout = 200; // test every x ms

    return {
      
      hudController: null,
      notificationController: null,
    
      presentScreenController: null,    
      readyForRunloop: false,

    
      screenContentAnchor: $('#screen-content'),
      notificationLayerAnchor: $('#notification-layer'),
      hudLayerAnchor: $('#hud-layer'),
      dialogLayerAnchor: $('#dialog-layer'),
        
      hudStages: null,
      notificationStages: null,
      allStages: null,
    
      isModal: false,
      
      modalDialogs: null,
  
  
      /** custom object initialization goes here. */
      init: function() {
        var self = this;
        this._super();
        this.set('controllerStages', []); //
        this.set('notificationStages', []); //
        this.set('hudStages', []); // 
        
        this.set('modalDialogs', []);

        $('body').mousemove(function(event) {
          mouseX = event.pageX; 
          mouseY = event.pageY;
        });
        // register controller to receive click events in screen
        $('#layers').mouseup(function(evt) {
          console.log('Mouse up event in multi stage application controller.');
          self.handleMouseUp(evt);
        });
        // register controller to receive window-resize events (from browser window) 
        // in order to adapt it's own window / display area
        $(window).resize(function(evt){
          self.onResize(evt);
        });
      },
  
      readyToRun: function() { this.readyForRunloop = true; },
  
      generateClickIfNeeded: function(evt) { console.log('entered click handler');
        var presentScreenController = this.get('presentScreenController');

        if (presentScreenController && presentScreenController.isScrolling()) {
          return ; // just ignore it here!
        }
        
        if (this.get('isModal')) {
          return ;
        }
      
        var allStages = this.get('allStages');
        // TODO: can we use stage.mouseX here or should we better apply the stage-transformations to pageX?
      
        var target = null, relX, relY;
  	    for (var layer=0; layer < allStages.length && !target; layer++) {
  	      targetLayer = layer;
  	      if (allStages[layer].stage.mouseInBounds && !allStages[layer].transparent) {
  	        var stage = allStages[layer].stage;
  	        target = stage.getObjectUnderPoint(stage.mouseX, stage.mouseY); // TODO: don't use absolute evt.pageX here, right?!
  	        relX= stage.mouseX;  // store coordinates in stage's local coordinate system
  	        relY= stage.mouseY;
  	      }
  	    }

        if (target) {
          if (target && target.view && target.view.onClick) {
            log('click on target', target.view, target.view.typeName())
            target.view.onClick(evt); // TODO: I think this is wrong; we somehow need to get the relative coordinates in.
          }
          else if (target && target.onClick) {
            target.onClick(evt);
          }
        }
        else if (this.get('presentScreenController').onClick) {    // no view hit, let the event bubble to controller (TODO: make this a pattern through views and controllers, aka repsonder-chain)
          this.get('presentScreenController').onClick(evt);
        }     
      },
  
      /** passes a click in the browser window either to the view that was hit
       * or to the present screen controller that gets the chance to handle the
       * otherwise unhandled click. */
      handleMouseUp:  function(evt) {                
        var presentScreenController = this.get('presentScreenController');
        this.generateClickIfNeeded(evt);
      
        // finally pass the mouse up event itself to controller, if it listens
        if (presentScreenController && presentScreenController.onMouseUp) {   
          presentScreenController.onMouseUp(evt);
        }
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
          if (this.get('notificationController')) this.get('notificationController').runloop();
          this.get('presentScreenController').runloop(); // hand over control to present screen controller
        }
        window.requestAnimFrame(function(self) { return function() {self.runloop(); }; }(this));  // request next animation frame that will initiate the next cycle of the runloop
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
        var controller = this.get('presentScreenController');
        if (!this.get('isModal') && controller && controller.onMouseDown) {
          controller.onMouseDown(evt);
        }
      },
    
    
      onMouseWheel: function(evt) {
        var controller = this.get('presentScreenController');
        if (!this.get('isModal') && controller && controller.onMouseWheel) {   
          controller.onMouseWheel(evt);
        }
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
      
        if (controller.onMouseDown) {
          // register controller to receive mouse-down events in screen
          $('body').mousedown(function(evt) {
            self.onMouseDown(evt);
          });
        }
    
      
        if (controller.onMouseLeave) {
          // register controller to receive mouse-down events in screen
          $('body').mouseleave(function(evt) {
            self.onMouseLeave(evt);
          });
        }      
            
        // register controller to receive mouse-wheel events in screen
        if (controller.onMouseWheel) {
          $(window).bind('mousewheel', function(evt) {
            self.onMouseWheel(evt);
          });
      
          // register controller to receive mouse-wheel events in screen (mozilla)
          $(window).bind('DOMMouseScroll', function(evt) {
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
    
      setScreenController: function(controller) {
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
            rootController.viewWillDisappear();
            this.remove(rootController);
            rootController.viewDidDisappear();
          }
          this.set('presentScreenController', controller);
          if (controller) {
            controller.viewWillAppear();
            this.append(controller);
            controller.applicationController = this;
            controller.viewDidAppear();
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
      
      modalDialogClosed: function(dialog) {
        do {
          console.log('poped the top-most modal dialog.');
        } while (this.modalDialogs.length > 0 && this.modalDialogs.pop() != dialog);
        this.setModal(this.modalDialogs.length > 0);
      },
      
      presentModalDialog: function(dialog) {
        this.setModal(true);
        dialog.onClose = function(self) { 
          return function(dialog) { self.modalDialogClosed(dialog) };
        }(this);
        this.modalDialogs.push(dialog);
        dialog.append();
      },
  
    }
  }());
  
  return module;
  
}(AWE.Application || {}))






