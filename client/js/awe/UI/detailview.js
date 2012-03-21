/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createDetailView = function(_windowSize, _layer, _controller) {

    var spec = {
      frame: AWE.Geometry.createRect(0, 0, _windowSize.width, _windowSize.height),
      scaled: false,
      layer: _layer,
      controller: _controller
    };
    
    var _view = module.createView(spec);
   
    var _ownerNameText = new Text('', "12px Arial", "#FFF");
    _ownerNameText.textBaseline = "middle";
    _ownerNameText.x = 20;
    _ownerNameText.y = 25;
    
    var _allianceNameText = new Text('', "12px Arial", "#FFF");
    _allianceNameText.textBaseline = "middle";
    _allianceNameText.x = 20;
    _allianceNameText.y = 75;
    
    var _selectShape;
    var _g = new Graphics();
    _g.setStrokeStyle(0);
    _g.beginFill('rgba(0, 0, 0 ,0.5)');
    _g.drawRoundRect(0, 0, 350, 100, 5);
    _selectShape = new Shape(_g);    
    
    // _view.position = function() {
      // return AWE.Geometry.createPoint(_view.frame().origin.x + _view.frame().size.width / 2, _view.frame().origin.y + _view.frame().size.height / 2);
    // };

    _view.redraw = function() {

      if (_view.controller().selectedView()) {
        var alpha = 1;
        var container = _view.container();
        
        var node = _controller.selectedView().node();
        var region = node.region();
        
        _ownerNameText.text = region.ownerName();
        _allianceNameText.text = region.allianceTag();
                
        container.x = _controller.windowSize().width - 400;
        container.y = _controller.windowSize().height - 150;
        container.alpha = alpha;
  
        container.addChildAt(_ownerNameText);
        container.addChildAt(_allianceNameText);
        container.addChildAt(_selectShape);
  
        _view.layer().addChild(container);
      }
    };
        
    return _view;
  };
    
  return module;
    
}(AWE.UI || {}));



