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
    
    my.updateFrame = function() {
      if (! my.startPos || ! my.endPos) {
        return ;
      }
      var frame = AWE.Geometry.createRect(Math.min(my.startPos.x, my.endPos.x), Math.min(my.startPos.y, my.endPos.y),
                                          Math.abs(my.startPos.x-my.endPos.x), Math.abs(my.startPos.y-my.endPos.y));
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
    
    that.updateArrow = function() {
      
      log('update!');    
          
      if (my.arrowShape) {
        my.container.removeChild(my.arrowShape);
      }
      
      var spX = my.startPos.x - my.frame.origin.x;  /// move to frame
      var spY = my.startPos.y - my.frame.origin.y;
      var epX = my.endPos.x - my.frame.origin.x;
      var epY = my.endPos.y - my.frame.origin.y;
      
      log (spX, spY, epX, epY);
      
      var arrow = new Graphics();
      arrow.setStrokeStyle(5);
      arrow.beginStroke(Graphics.getRGB(255,240,240));
  //  arrow.beginFill(Graphics.getRGB(255, 250, 250));
      arrow.moveTo(spX, spY);
      arrow.bezierCurveTo(spX, spY-250, epX+100, epY-250, epX+100, epY);
      my.arrowShape = new Shape(arrow);
      my.container.addChild(my.arrowShape);
    }   
       
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



