/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createMovementArrowView = function(spec, my) {
      
        
    var that;
    
    var _frameRect = null;
            
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
                                          Math.abs(my.startPos.x-my.endPos.x), Math.max((my.startPos.y+80)-(my.endPos.y), (my.endPos.y+96)-(my.startPos.y)));
      that.setFrame(frame);
    }

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    

    /** inits the view. */
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      my.army = army;
    };
    
    
    /** sets the start position of the arrow. A change in this positon will
     * trigger an update of the view. */
    that.setStart = function(pos) {
      if (my.startPos === null || my.startPos.x !== pos.x || my.startPos.y !== pos.y) {
        my.startPos = pos;
        my.updateFrame();
      }
    }
    
    
    /** sets the end position of the arrow. A change in this position will 
     * trigger an update of the view. */
    that.setEnd = function(pos) {
      if (my.endPos === null || my.endPos.x !== pos.x || my.endPos.y !== pos.y) {
        my.endPos = pos;
        my.updateFrame();
      }
    }
    
    
    /** updates arrow on model or position change. */
    that.updateView = function() {
      this.updateArrow()
      _super.updateView();
    }
    
    
    /** updates arrow on layout change */
    that.layoutSubviews = function() {
      this.updateArrow()
      _super.layoutSubviews();
    }    
    
    
    /** determines the color of the arrow depending on the relation. */
    that.arrowColor = function(focus) {
      if (focus === undefined) {
        focus = false;
      }
      var a = focus ? '1.0' : '0.85';
      
      if (my.army.isOwn()) {
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
  
  
    /** creates a new shape for the arrow from the present start to the end
     * position. Also adapts the position of the ETA label, if the view is
     * either selected or hovered. */
    that.updateArrow = function() {
      var focus = this.hovered() || this.selected();
      
      if (my.arrowShape) {
        my.container.removeChild(my.arrowShape);
        my.arrowShape = null;
      }
      
      if (my.etaView && !focus) {
        my.container.removeChild(my.etaView.displayObject());
        my.etaView = null;
      }
      
      var spX = my.startPos.x - my.frame.origin.x;  /// move to frame
      var spY = my.startPos.y - my.frame.origin.y;
      var epX = my.endPos.x - my.frame.origin.x;
      var epY = my.endPos.y - my.frame.origin.y;

      // ARROW ///////////////////////////////////////////////////////////////              
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
      my.container.addChildAt(my.arrowShape, 0);
      
      // ETA LABEL ///////////////////////////////////////////////////////////  
      if (!my.etaView && focus) {
        my.etaView = AWE.UI.createLabelView();
        my.etaView.initWithControllerAndLabel(this.controller(), 'ETA ' + my.army.get('target_reached_at'), true);
        my.etaView.setTextAlign('center');
        my.etaView.setPadding(10);
        my.container.addChild(my.etaView.displayObject());
      }
      if (my.etaView) {
        my.etaView.setFrame(AWE.Geometry.createRect(epX+23, epY-20, 130, 20));
      }
      
      // FRAME RECT //////////////////////////////////////////////////////////  
      if (AWE.Config.MAP_DEBUG_FRAMES) {
        if (_frameRect){
          my.container.removeChild(_frameRect);
        }
        var frame = new Graphics();
        frame.setStrokeStyle(1);
        frame.beginStroke(Graphics.getRGB(255,255,255));
        frame.beginFill('rgba(255,255,255,0.2)');
        frame.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height,0);
        _frameRect = new Shape(frame); 
        my.container.addChildAt(_frameRect,0);        
      } 
    }   
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



