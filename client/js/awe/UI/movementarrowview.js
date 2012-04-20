/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createMovementArrowView = function(spec, my) {
        
    var that;
            
    my = my || {};
    
    my.typeName = 'MovementArrowView';
    my.startPos = null;
    my.endPos = null;
    my.army = null;
    
    my.arrowShape = null;
    my.etaView = null;
    
    my.updateFrame = function() {
      if (! my.startPos || ! my.endPos) {
        return ;
      }
      var frame = AWE.Geometry.createRect(Math.min(my.startPos.x, my.endPos.x), Math.min(my.startPos.y, my.endPos.y+20), // +20 -> arrow head!
                                          Math.abs(my.startPos.x-my.endPos.x), Math.abs(my.startPos.y-(my.endPos.y+20)));
      that.setFrame(frame);
    }

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      my.army = army;
    };
    
    that.setStart = function(pos) {
      if (my.startPos === null || my.startPos.x !== pos.x || my.startPos.y !== pos.y) {
        my.startPos = pos;
        my.updateFrame();
      }
    }
    
    that.setEnd = function(pos) {
      if (my.endPos === null || my.endPos.x !== pos.x || my.endPos.y !== pos.y) {
        my.endPos = pos;
        my.updateFrame();
      }
    }
    
    that.updateView = function() {
      this.updateArrow()
      _super.updateView();
    }
    
    that.layoutSubviews = function() {
      this.updateArrow()
      _super.layoutSubviews();
    }    
    
    that.arrowColor = function(focus) {
      if (focus === undefined) {
        focus = false;
      }
      
      var a = focus ? '1.0' : '0.85';
      
      if (my.army.isOwn) {
        return 'rgba(255,250,250, '+a+')';
      }
      else if (my.army.isRelationAtLeast(AWE.GS.RELATION_TYPE_ALLIED)) {
        return 'rgba(190, 255, 190, '+a+')';
      }
      else if (my.army.isRelationAtLeast(AWE.GS.RELATION_TYPE_NEUTRAL, true)) {
        return 'rgba(190, 190, 190, '+a+')';
      }
      else {
        return 'rgba(255, 190, 190, '+a+')';
      }
    }
    
    that.updateArrow = function() {
      var focus = this.hovered() || this.selected();
      
      if (my.arrowShape) {
        my.container.removeChild(my.arrowShape);
        my.arrowShape = null;
      }
      
      if (my.etaView && !this.hovered() && !this.selected()) {
        my.container.removeChild(my.etaView.displayObject());
        my.etaView = null;
      }
      
      var spX = my.startPos.x - my.frame.origin.x;  /// move to frame
      var spY = my.startPos.y - my.frame.origin.y;
      var epX = my.endPos.x - my.frame.origin.x;
      var epY = my.endPos.y - my.frame.origin.y;
            
      var arrow = new Graphics();
      arrow.setStrokeStyle(focus ? 13 : 9);
      arrow.beginStroke(this.arrowColor(focus));
//    arrow.beginFill(this.arrowColor());

      arrow.moveTo(spX, spY);
      arrow.bezierCurveTo(spX, spY-250, epX, epY-250, epX, epY);
      arrow.lineTo(epX+7, epY);
      arrow.lineTo(epX+0, epY+16);
      arrow.lineTo(epX-7, epY);
      arrow.lineTo(epX, epY);
      my.arrowShape = new Shape(arrow);
      my.container.addChild(my.arrowShape);
      
      if (!my.etaView && focus) {
        my.etaView = AWE.UI.createLabelView();
        my.etaView.initWithControllerAndLabel(this.controller(), 'ETA ' + my.army.get('target_reached_at'), true);
        my.etaView.setFrame(AWE.Geometry.createRect(epX+50, epY, 130, 20));
        my.etaView.setTextAlign('center');
        my.container.addChild(my.etaView.displayObject());
      }

    }   
       
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



