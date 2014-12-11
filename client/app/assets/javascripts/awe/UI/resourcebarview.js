/* Authors: Jona Boeddinghaus <jona@5dlab.com>
*           Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createResourceBarView = function(spec, my) {

    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
    var _backgroundBitmap = null;
    var _topColor = null;
    var _bottomColor = null;
    var _progressShape = null;
    var _amountText = null;
    var _amountTextShadow = null;
    var _barWidth = 0;
    var _barHeight = 0;
    var _cornerRadius = 10;
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};

    my.typeName = 'ResourceBarView';
    
    my.container = null;
    
    my.progressAmountPercent = 0;

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);
    
    var _super = {       // store references to needed super methods
      setFrame: AWE.Ext.superior(that, 'setFrame'),
    };
        
    that.initWithControllerColorsAndFrame = function(controller, colors, frame) {
      frame = frame || AWE.Geometry.createRect(0, 0, 140, startImage.height);
      
      my.container = new Container();
      
      _barWidth = frame.size.width;
      _barHeight = frame.size.height;
      _topColor = colors.topColor;
      _bottomColor = colors.bottomColor;
      
      that.initWithController(controller, frame);
      
      _backgroundBitmap = new Bitmap();
      _backgroundBitmap.view = that;
      _backgroundBitmap.onClick = function(evt){
        if (_backgroundBitmap.view.onClick) {
          _backgroundBitmap.view.onClick(evt);
        }
      };
      _backgroundBitmap.image = AWE.UI.ImageCache.getImage("hud/resourcebars/empty");
      
      my.container.addChild(_backgroundBitmap);
      
      _progressShape = new Shape();
      
      _progressShape.onClick = function() { 
        if (that.onClick) {
          that.onClick() 
        }
      }        
      
      my.container.addChild(_progressShape);
      
      _amountText = new Text("", "16px hvd_comic_serif_proregular", "#fff");
      _amountText.textAlign = "left";
      _amountText.textBaseline = "middle";
      _amountText.x = 20;
      _amountText.y = _barHeight / 2;
      _amountText.view = that;
      _amountText.onClick = function() { if (that.onClick) that.onClick(); }      
      
      _amountTextShadow = new Text("", "17px hvd_comic_serif_proregular", "#000");
      _amountTextShadow.textAlign = "left";
      _amountTextShadow.textBaseline = "middle";
      _amountTextShadow.x = 20;
      _amountTextShadow.y = _barHeight / 2;
      _amountTextShadow.view = that;
      _amountTextShadow.onClick = function() { if (that.onClick) that.onClick(); }
      
      my.container.addChild(_amountTextShadow);          
      my.container.addChild(_amountText);
      
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    }           
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);     
    }
    
    that.setAmountWithCapacity = function(amount, capacity) {
      _amountText.text = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      _amountTextShadow.text = _amountText.text;
      var progress = amount / capacity;
      my.progressAmountPercent = progress || 0;
      if (my.progressAmountPercent < 0) my.progressAmountPercent = 0;
      if (my.progressAmountPercent > 1) my.progressAmountPercent = 1;      
      this.redrawProgressBar();
    }    

    that.redrawProgressBar = function()
    {
      if (_progressShape) {
        _progressShape.graphics.clear();
        
        if (my.progressAmountPercent > 0)
        {
          _progressShape.graphics
            .beginLinearGradientFill([_topColor,_bottomColor], [0, 1], 0, 0, 0, _barHeight)
            .drawRoundRect(3, 3, (_barWidth - 6) * my.progressAmountPercent, _barHeight - 6, _cornerRadius);
        }
      }
    }     
    
    that.updateView = function() {
      _super.updateView();
      this.redrawProgressBar();
    }   
        
    that.displayObject = function() 
    {
      return my.container;
    }        
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




