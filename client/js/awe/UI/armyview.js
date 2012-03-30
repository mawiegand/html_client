/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArmyView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = 'armyView';
    
    var _army = null;
    
    var _container = null;

    var _stanceView = null;    
    var _baseShape = null;    
    var _poleShape = null;    
    var _flagShape = null;
    var _selectShape = null;    
    
    var _stanceImages = [
      "map/army/stanceNeutral",
      "map/army/stanceAggressive",
      "map/army/stanceDefensive"
    ];
    
    that = module.createView(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _army = army;
      
      var _selectGraphics = new Graphics();
      _selectGraphics.setStrokeStyle(1);
      _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
      _selectGraphics.drawEllipse(0, 80, 64, 32);
      _selectShape = new Shape(_selectGraphics);  
      _selectShape.visible = false;  
      _container.addChild(_selectShape);
            
      var _baseGraphics = new Graphics();
      _baseGraphics.setStrokeStyle(1);
      _baseGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _baseGraphics.beginFill(Graphics.getRGB(0, 0, 0));
      _baseGraphics.drawEllipse(6, 84, 52, 24);
      _baseShape = new Shape(_baseGraphics);  
      _container.addChild(_baseShape);

      var _poleGraphics = new Graphics();
      _poleGraphics.setStrokeStyle(1);
      _poleGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _poleGraphics.beginFill(Graphics.getRGB(32, 32, 32));
      _poleGraphics.drawRoundRect(56, 12, 2, 84, 0);
      var _poleShape = new Shape(_poleGraphics);  
      _container.addChild(_poleShape);

      var _flagGraphics = new Graphics();
      _flagGraphics.setStrokeStyle(1);
      _flagGraphics.beginStroke(Graphics.getRGB(0,0,0));
      _flagGraphics.beginFill(Graphics.getRGB(0,255,0));
      _flagGraphics.moveTo(56, 12).lineTo(56, 32).lineTo(8, 22).lineTo(56, 12);
      var _flagShape = new Shape(_flagGraphics);  
      _container.addChild(_flagShape);

      _stanceView = AWE.UI.createImageView();
     // log('army', army);
      _stanceView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(_stanceImages[_army.stance()]));
      _stanceView.setFrame(AWE.Geometry.createRect(0, 8, 64, 96));
      _stanceView.onClick = that.onClick;
      _stanceView.onMouseOver = that.onMouseOver;
      _stanceView.onMouseOut = that.onMouseOut;
      _container.addChild(_stanceView.displayObject());

      if (!frame) {
        that.resizeToFit();        
      }
    };
    
    that.resizeToFit = function() {
      my.frame.size.width = AWE.Config.MAP_ARMY_WIDTH;
      my.frame.size.height = AWE.Config.MAP_ARMY_HEIGHT;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
    
    that.setSelected = function(selected) {
      _selectShape.visible = selected;
    };
    
    that.displayObject = function() {
      return _container;
    };
    
    that.army = function() { return _army; };
    
    // that.updateStance = function() {
      // _stanceView.image = AWE.UI.ImageCache.getImage(_stanseImages[_army.getStance()]);
      // that.setNeedsDisplay();
    // };
    
    /** actions */
   
    that.onClick = function(evt) {
      my.controller.viewClicked(that);
    };
    
    that.onMouseOver = function(evt){
      my.controller.viewMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.viewMouseOut(that);
    };    
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



