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
    var _barWidth = 0;
    var _barHeight = 0;
    //var _cornerRadius = 10;
    
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
      frame = frame || AWE.Geometry.createRect(0, 0, 114, startImage.height);
      
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
      _backgroundBitmap.image = AWE.UI.ImageCache.getImage("hud/resourcebars/background");
      
      my.container.addChild(_backgroundBitmap);
      
      _progressShape = new Shape();      
      _progressShape.onClick = function() { 
        if (that.onClick) {
          that.onClick() 
        }
      }              
      my.container.addChild(_progressShape);            
      
      _amountText = new Text("", "16px hvd_comic_serif_proregular", "#fff");
      _amountText.textAlign = "center";
      _amountText.textBaseline = "middle";
      _amountText.shadow = new Shadow("#000000", 2, 2, 0);
      //_amountText.outline = 1;
      _amountText.x = _barWidth / 2;
      _amountText.y = _barHeight / 2;
      _amountText.view = that;
      _amountText.onClick = function() { if (that.onClick) that.onClick(); }      
      
      my.container.addChild(_amountText);
      
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    }           
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);     
    }
    
    that.setAmountWithCapacity = function(amount, capacity) {
      _amountText.text = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      var progress = amount / capacity;
      my.progressAmountPercent = progress || 0;
      if (my.progressAmountPercent < 0) my.progressAmountPercent = 0;
      if (my.progressAmountPercent > 1) my.progressAmountPercent = 1;
      my.progressAmountPercent = 1;      
      this.redrawProgressBar();
    }    

    that.redrawProgressBar = function()
    {
      if (_progressShape) {
        _progressShape.graphics.clear();
        
        if (my.progressAmountPercent > 0)
        {
          /*_progressShape.graphics
            .beginLinearGradientFill([_topColor,_bottomColor], [0, 1], 0, 0, 0, _barHeight)
            .drawRoundRect(3, 3, (_barWidth - 6) * my.progressAmountPercent, _barHeight - 6, _cornerRadius);*/
          var secondColor = _bottomColor;
          if (my.progressAmountPercent === 1) secondColor = "#fe2400";
          _progressShape.graphics
            .beginLinearGradientFill([_topColor,secondColor], [0, 1], 0, 0, _barWidth, 0)
            .drawRect(1, 1, (_barWidth - 2) * my.progressAmountPercent, _barHeight - 2);                      
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
    
    my.drawStrokedText = function(text, x, y) {
      var ctx = my.controller.getStages()[1].stage.canvas.getContext("2d");
      ctx.font = "80px Sans-serif"
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 8;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = 'white';
      ctx.fillText(text, x, y);
    }
    
    return that;
    
  };
    
  return module;
    
}(AWE.UI || {}));




