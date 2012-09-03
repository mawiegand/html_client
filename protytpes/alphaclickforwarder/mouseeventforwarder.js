/**
 * @fileOverview 
 * Handles the forwarding of an event to the dom element that lies behind another one.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 * @author <a href="mailto:julian@5dlab.com">Julian Schmid</a>
 */
var AWE = AWE || {};

AWE.UI = (function(module) {

   /**
    * Handles the forwarding of an event to the dom element that lies behind another one.
    * The decision if an event should be forwareded must be made outside of this class.
    * 
    * If an event should be forwarded call the method forwardEvent with the original event.
    * Make sure that you also call the method ignoreEvent if you recieve an event that 
    * should not be forwarded. 
    * This to ensure that the mouse leave events are generated when needed.
    *
    * Also make sure that you subscribe to all move,enter,leave events. Otherwise the class
    * can't keep track if an leaver or enter event should be generated.
    *
    * @class
    * @name AWE.UI.MouseEventForwarder
    */
   module.createMouseEventForwarder = function() {
      var that = {};

      ///--------------------------
      ///----- PRIVATE FIELDS -----
      ///--------------------------

      var isForwardingEvent = false;
      //pure dom element (not jquery obj)
      var lastMouseEnterElement = undefined;

      ///--------------------------
      ///----- PRIVATE METHODS ----
      ///--------------------------

      var isElementInArray = function(element, array) {
        for (var i = 0; i < array.length; i++) {
          if (element === array[i]) {
            return true;
          }
        }
        return false;
      }

      var sendNewEventUpTree = function(event, element, triggeredParents) {
         //generate new event
         var offset = element.offset();
         var newEvent = jQuery.Event(event.type, { 
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.pageX-offset.left,
            offsetY: event.pageY-offset.top,
            pageX: event.pageX, 
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY
         });

         //check if it already recieved the event because it is a parent
         /*if (isElementInArray(element[0], triggeredParents)) {
          return;
         }*/
         //trigger the event
         element.trigger(newEvent);
         //send to parents
         /*var parents = element.parents();
         for (var i = 0; i < parents.length; i++) {
          if (isElementInArray(parents[i], triggeredParents) {
            return;
          }
           parents[i].triggerHandler(newEvent);
         }*/
      };

      var sendNewEventType = function(target, type, event, ignoreList) {
        var qTarget = $(target);
        var offset = qTarget.offset();
        var newEvent = jQuery.Event(type, { 
            clientX: event.clientX,
            clientY: event.clientY,
            offsetX: event.pageX-offset.left,
            offsetY: event.pageY-offset.top,
            pageX: event.pageX, 
            pageY: event.pageY,
            screenX: event.screenX,
            screenY: event.screenY
        });
        //send it if needed
        if (ignoreList !== undefined && isElementInArray(target, ignoreList)) {
          return;
        }
        qTarget.triggerHandler(newEvent);
        //up the tree until we hit a common parent
        var parents = qTarget.parents();
        for (var i = 0; i < parents.length; i++) {
          if (ignoreList !== undefined && isElementInArray(parents[i], ignoreList)) {
            return;
          }
          $(parents[i]).triggerHandler(newEvent);
        }
      };

      /**
       * Checks if the newTaget is a parent of the oldTarget
       */
      var checkIsParent = function(newTarget, oldTarget) {
        return isElementInArray(newTarget[0], oldTarget.parents());
      };

      ///--------------------------
      ///----- PUBLIC METHODS -----
      ///--------------------------

      /**
       * Forwards an event to the element that lies behind it.
       * It also keeps track of mouse enter and mouse leave for this element and triggers 
       * those events if needed.
       *
       * The way it determines which element lies behind original reciever element is bit of a hack.
       * It detaches the original reciever element from the the dom and then uses 
       * document.elementFromPoint to determine the element.
       *
       * @param event this should be the original event
       * @pre isCurrentlyForwardingEvent() === false
       */
      that.forwardEvent = function(event) {
         if (isForwardingEvent) {
            console.warn("AlphaClickForwarder.forwardEvent was called during a forwarding. Check AlphaClickForwarder.isCurrentlyForwardingEvent() before using an event.");
            return;
         }
         //stop the propagation of the event
         event.stopPropagation();

         //flag that the forwarding has begun
         isForwardingEvent = true;

         //identify the dom element that should receive the event call
         //determine the parent and previous element for reinsertion later
         target = $(event.target);
         parent = target.parent();
         prev = target.prev();
         //detach current target from dom
         target.detach();

         //determine the new target for the event
         newDomTarget = document.elementFromPoint(event.clientX,event.clientY);
         if (newDomTarget !== null && newDomTarget !== undefined) {
            //cache the parents of the new target
            var ignoreList = $(newDomTarget).parents();
            ignoreList.push(newDomTarget);
            //handle enter and leave problem
            if (
              (
                lastMouseEnterElement === undefined ||
                lastMouseEnterElement !== newDomTarget
              ) &&
              (
                event.type == "mouseenter" || 
                event.type == "mousemove")
            ) {
              if (lastMouseEnterElement !== undefined) {
                //generate leave event for lastMouseEnterElement
                sendNewEventType(lastMouseEnterElement, "mouseleave", event, ignoreList);
              }
              //generate new enter event
              sendNewEventType(newDomTarget, "mouseenter", event, new Array());

              //setup the new enter element
              lastMouseEnterElement = newDomTarget;
            }
            //if there is a leave forward it
            if (
              event.type == "mouseleave" &&
              lastMouseEnterElement !== undefined
            ) {
              //generate leave event
              sendNewEventType(lastMouseEnterElement, "mouseleave", event, ignoreList);
              lastMouseEnterElement = undefined;
            }
          }

          //send the event to the new target out, if it is NOT an leave
          if (event.type != "mouseleave") {
            sendNewEventUpTree(event, $(newDomTarget), target);
          }

          //reattach the original dom element
          if (prev.length > 0) {
            //if there was a prev event just attach it there
            prev.after(target);
          } else {
            //if there was no prev, it must be the first, so prepend it to the parent
            parent.prepend(target);
          }

         //flag that the forwarding is over
         isForwardingEvent = false;
      };

      /**
       * This tells the AlphaMouseEventForwarder that an other event has happend 
       * that will not be forwarded. This is important so that the leave events 
       * can be generated correctly.
       *
       * @param event this should be the original event
       * @pre isCurrentlyForwardingEvent() === false
       */
      that.ignoreEvent = function(event) {
         if (isForwardingEvent) {
            console.warn("AlphaClickForwarder.ignoreEvent was called during a forwarding. Check AlphaClickForwarder.isCurrentlyForwardingEvent() before using an event.");
            return;
         }

         //trigger mouse leave event if needed
         if (lastMouseEnterElement !== undefined &&
            event.target !== lastMouseEnterElement
         ) {
          //check if it parent of new target if yes don't send
          var newTarget = document.elementFromPoint(event.clientX,event.clientY);
          var ignoreList = $(newTarget).parents();
          ignoreList.push(newTarget);
          sendNewEventType(lastMouseEnterElement, "mouseleave", event, ignoreList);
         }
         lastMouseEnterElement = undefined;
      };
      /**
       * 
       */
      that.isCurrentlyForwardingEvent = function() {
         return isForwardingEvent;
      };

      return that;
   };

return module;
}(AWE.UI || {}));