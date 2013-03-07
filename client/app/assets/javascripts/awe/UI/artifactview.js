/* Author: Patrick Fox <patrick@5dlab.com>,
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
  
  module.createArtifactView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = my.typename || 'ArtifactView';
    
    var _artifact = null;
    
    var _annotationView = null;

    var _baseImage = null;
    var _selectShape = null;

    var _artifactImageView = null;
    var _artifactImage = null;

    var _frameRectShape = null;
    
    that = module.createGamingPieceView(spec, my);

    var _super = {
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:       AWE.Ext.superior(that, "setFrame"),
      setSelected:    AWE.Ext.superior(that, "setSelected"),
      updateView:     AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArtifact = function(controller, artifact, frame) {

      that.initWithController(controller, frame);
      _artifact = artifact;

      var _selectGraphics = new Graphics();
      _selectGraphics.setStrokeStyle(1);
      _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
      _selectGraphics.drawEllipse(12, 0, 72, 36);
      _selectShape = AWE.UI.createShapeView();
      _selectShape.initWithControllerAndGraphics(my.controller, _selectGraphics);
      _selectShape.setFrame(AWE.Geometry.createRect(0, 74, 72, 36));
      this.addChild(_selectShape);      
      
      var baseImage = _artifact.isOwn() ? AWE.UI.ImageCache.getImage('map/army/base/own') : AWE.UI.ImageCache.getImage('map/army/base/other')
      _baseImage = AWE.UI.createImageView();
      _baseImage.initWithControllerAndImage(controller, baseImage);
      _baseImage.setFrame(AWE.Geometry.createRect(-15, -21, 128, 128));
      _baseImage.onClick = that.onClick;
      _baseImage.onDoubleClick = that.onDoubleClick;
      _baseImage.onMouseOver = that.onMouseOver;
      _baseImage.onMouseOut = that.onMouseOut;
      this.addChild(_baseImage);      


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
               
      if (_selectShape) {
        _selectShape.setVisible(this.selected() || this.hovered());
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }

      if (!_artifactImageView) {
        _artifactImage = 'map/artifact' + ((_artifact.get('initiated')) ? 'initiated' : '') + '/' + _artifact.get('type_id');
        var artifactImage = AWE.UI.ImageCache.getImage(_artifactImage) ;
        _artifactImageView = AWE.UI.createImageView();
        _artifactImageView.initWithControllerAndImage(my.controller, artifactImage);
        _artifactImageView.setFrame(AWE.Geometry.createRect(-6, -7, 96, 96));
        _artifactImageView.onClick = that.onClick;
        _artifactImageView.onDoubleClick = that.onDoubleClick;
        _artifactImageView.onMouseOver = that.onMouseOver;
        _artifactImageView.onMouseOut = that.onMouseOut;
        this.addChild(_artifactImageView);
      }

      if (_artifactImageView) {
        var image = 'map/artifact' + ((_artifact.get('initiated')) ? 'initiated' : '') + '/' + _artifact.get('type_id');
        if (image != _artifactImage) {
          var artifactImage = AWE.UI.ImageCache.getImage(image);
          _artifactImageView.setImage(artifactImage);
          _artifactImage = image;
        }
      }
    }
    
    that.setAnnotationView = function(annotationView) {
      _annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return _annotationView;
    }

    that.artifact = function() {
      return _artifact;
    };

    that.location = function() {
      return _artifact.get('location');
    };

    /** actions */
   
    that.onClick = function(evt) {
      my.controller.viewClicked(that);
    };
    
    that.onDoubleClick = function(evt) {
      my.controller.artifactInfoButtonClicked(_artifact);
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