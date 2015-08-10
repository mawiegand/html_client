/* Author: Patrick Fox <patrick@5dlab.com>,
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
  
  module.createPoacherTreasureView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = my.typename || 'PoacherTreasureView';
    
    var _poacherTreasure = null;
    
    var _annotationView = null;

    //var _baseImage = null;
    //var _selectShape = null;

    var _poacherTreasureImageView = null;
    var _poacherTreasureImage = null;

    var _frameRectShape = null;
    
    that = module.createGamingPieceView(spec, my);

    var _super = {
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:       AWE.Ext.superior(that, "setFrame"),
      //setSelected:    AWE.Ext.superior(that, "setSelected"),
      updateView:     AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndPoacherTreasure = function(controller, poacherTreasure, frame) {

      that.initWithController(controller, frame);
      _poacherTreasure = poacherTreasure;

      /*var _selectGraphics = new Graphics();
      _selectGraphics.setStrokeStyle(1);
      _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
      _selectGraphics.drawEllipse(12, 0, 72, 36);
      _selectShape = AWE.UI.createShapeView();
      _selectShape.initWithControllerAndGraphics(my.controller, _selectGraphics);
      _selectShape.setFrame(AWE.Geometry.createRect(0, 74, 72, 36));
      this.addChild(_selectShape);      */
      
      //var baseImage = _poacherTreasure.isOwn() ? AWE.UI.ImageCache.getImage('map/army/base/own') : AWE.UI.ImageCache.getImage('map/army/base/other')
      /*var baseImage = AWE.UI.ImageCache.getImage('map/army/base/own');
      _baseImage = AWE.UI.createImageView();
      _baseImage.initWithControllerAndImage(controller, baseImage);
      _baseImage.setFrame(AWE.Geometry.createRect(-15, -21, 128, 128));
      _baseImage.onClick = that.onClick;
      _baseImage.onDoubleClick = that.onDoubleClick;
      _baseImage.onMouseOver = that.onMouseOver;
      _baseImage.onMouseOut = that.onMouseOut;
      this.addChild(_baseImage);      */


      if (!frame) {
        that.resizeToFit();        
      }
      
      that.recalcView();
    };
    
    that.resizeToFit = function() {
      this.setFrame(AWE.Geometry.createRect(0, 0, AWE.Config.MAP_ARMY_WIDTH, AWE.Config.MAP_ARMY_HEIGHT));
    }; 

    that.updateView = function() {
      that.recalcView();
      if (my.targetView) {
        my.targetView.setHovered(this.hovered());
      }
      _super.updateView();
    }
    
    that.recalcView = function() {
      
      if (!_frameRectShape && AWE.Config.MAP_DEBUG_FRAMES) {
        var _frameRectGraphics = new Graphics();
        _frameRectGraphics.setStrokeStyle(1);
        _frameRectGraphics.beginStroke('rgb(255,255,255)');
        _frameRectGraphics.beginFill('rgba(255,255,255,0.2)');
        _frameRectGraphics.drawRoundRect(0, 0, my.frame.size.width, my.frame.size.height, 0);
        _frameRectShape = AWE.UI.createShapeView();
        _frameRectShape.initWithControllerAndGraphics(my.controller, _frameRectGraphics);
        _frameRectShape.setFrame(AWE.Geometry.createRect(my.frame.origin.x, my.frame.origin.y, my.frame.size.width, my.frame.size.height));
        that.addChildAt(_frameRectShape, 0);    
      }  
               
      /*if (_selectShape) {
        _selectShape.setVisible(this.selected() || this.hovered());
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }*/

      if (!_poacherTreasureImageView) {
        _poacherTreasureImage = 'map/poachertreasure';
        var poacherTreasureImage = AWE.UI.ImageCache.getImage(_poacherTreasureImage) ;
        _poacherTreasureImageView = AWE.UI.createImageView();
        _poacherTreasureImageView.initWithControllerAndImage(my.controller, poacherTreasureImage);
        _poacherTreasureImageView.setFrame(AWE.Geometry.createRect(-15, -20, 88, 72));
        _poacherTreasureImageView.onClick = that.onClick;
        _poacherTreasureImageView.onDoubleClick = that.onDoubleClick;
        _poacherTreasureImageView.onMouseOver = that.onMouseOver;
        _poacherTreasureImageView.onMouseOut = that.onMouseOut;
        this.addChild(_poacherTreasureImageView);
      }

      if (_poacherTreasureImageView) {
        var image = 'map/poachertreasure';
        if (image != _poacherTreasureImage) {
          var poacherTreasureImage = AWE.UI.ImageCache.getImage(image);
          _poacherTreasureImageView.setImage(poacherTreasureImage);
          _poacherTreasureImage = image;
        }
      }
    }
    
    /*that.setAnnotationView = function(annotationView) {
      _annotationView = annotationView;
    }*/
    
    /*that.annotationView = function() {
      return _annotationView;
    }*/

    that.poacherTreasure = function() {
      return _poacherTreasure;
    };

    that.location = function() {
      return _poacherTreasure.get('location');
    };

    /** actions */
   
    /*that.onClick = function(evt) {
      my.controller.viewClicked(that);
    };*/
    
    /*that.onDoubleClick = function(evt) {
      my.controller.poacherTreasureInfoButtonClicked(_poacherTreasure);
    };*/
    
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
