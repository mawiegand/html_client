/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createMainControlsView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName = "MainControlView";
    
    that = module.createView(spec, my);

    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      _container = new Container()
          
      // Ressourcen Leiste
      // Flagge
      var _flagShapeGraphics = new Graphics();
      _flagShapeGraphics.setStrokeStyle(1);
      _flagShapeGraphics.beginStroke('rgb(0, 0, 0)');
      _flagShapeGraphics.beginFill('rgb(255, 255, 255)');
      _flagShapeGraphics.moveTo(240, 0);
      _flagShapeGraphics.lineTo(320, 0).lineTo(280, 100).lineTo(240, 0);
      var _flagShape = new Shape(_flagShapeGraphics);
      
      var _flagButtonText = new Text('Flag', "12px Arial", "#000");
      _flagButtonText.textBaseline = "middle";
      _flagButtonText.textAlign = "center"
      _flagButtonText.x = 280;
      _flagButtonText.y = 40;
  
  
      // Kopf
      var _heroButtonGraphics = new Graphics();
      _heroButtonGraphics.setStrokeStyle(1);
      _heroButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _heroButtonGraphics.beginFill('rgb(255, 255, 255)');
      _heroButtonGraphics.drawCircle(254, 146, 64);
      var _heroButton = new Shape(_heroButtonGraphics);    
  
      var _heroButtonText = new Text('Hero', "12px Arial", "#000");
      _heroButtonText.textBaseline = "middle";
      _heroButtonText.textAlign = "center"
      _heroButtonText.x = 254;
      _heroButtonText.y = 146;
  
      // Festung
      var _fortressButtonGraphics = new Graphics();
      _fortressButtonGraphics.setStrokeStyle(1);
      _fortressButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _fortressButtonGraphics.beginFill('rgb(255, 255, 255)');
      _fortressButtonGraphics.drawCircle(344, 84, 64);
      var _fortressButton = new Shape(_fortressButtonGraphics);    
  
      var _fortressButtonText = new Text('Fortress', "12px Arial", "#000");
      _fortressButtonText.textBaseline = "middle";
      _fortressButtonText.textAlign = "center"
      _fortressButtonText.x = 344;
      _fortressButtonText.y = 84;
  
      // Messages
      var _messagesButtonGraphics = new Graphics();
      _messagesButtonGraphics.setStrokeStyle(1);
      _messagesButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _messagesButtonGraphics.beginFill('rgb(255, 255, 255)');
      _messagesButtonGraphics.drawCircle(402, 26, 36);
      var _messagesButton = new Shape(_messagesButtonGraphics);    
  
      var _messagesButtonText = new Text('Messages', "12px Arial", "#000");
      _messagesButtonText.textBaseline = "middle";
      _messagesButtonText.textAlign = "center"
      _messagesButtonText.x = 402;
      _messagesButtonText.y = 26;
  
      // More...
      var _moreButtonGraphics = new Graphics();
      _moreButtonGraphics.setStrokeStyle(1);
      _moreButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _moreButtonGraphics.beginFill('rgb(255, 255, 255)');
      _moreButtonGraphics.drawCircle(426, 84, 36);
      var _moreButton = new Shape(_moreButtonGraphics);    
  
      var _moreButtonText = new Text('More...', "12px Arial", "#000");
      _moreButtonText.textBaseline = "middle";
      _moreButtonText.textAlign = "center"
      _moreButtonText.x = 426;
      _moreButtonText.y = 84;
      
      // Locations
      var _locationsButtonGraphics = new Graphics();
      _locationsButtonGraphics.setStrokeStyle(1);
      _locationsButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _locationsButtonGraphics.beginFill('rgb(255, 255, 255)');
      _locationsButtonGraphics.drawCircle(402, 142, 36);
      var _locationsButton = new Shape(_locationsButtonGraphics);    
  
      var _locationsButtonText = new Text('Locations', "12px Arial", "#000");
      _locationsButtonText.textBaseline = "middle";
      _locationsButtonText.textAlign = "center"
      _locationsButtonText.x = 402;
      _locationsButtonText.y = 142;
  
      // Armies 
      var _armiesButtonGraphics = new Graphics();
      _armiesButtonGraphics.setStrokeStyle(1);
      _armiesButtonGraphics.beginStroke('rgb(0, 0, 0)');
      _armiesButtonGraphics.beginFill('rgb(255, 255, 255)');
      _armiesButtonGraphics.drawCircle(344, 166, 36);
      var _armiesButton = new Shape(_armiesButtonGraphics);    
  
      var _armiesButtonText = new Text('Armies', "12px Arial", "#000");
      _armiesButtonText.textBaseline = "middle";
      _armiesButtonText.textAlign = "center"
      _armiesButtonText.x = 344;
      _armiesButtonText.y = 166;
  
      // Shop
      var _shopShapeGraphics = new Graphics();
      _shopShapeGraphics.setStrokeStyle(1);
      _shopShapeGraphics.beginStroke('rgb(0, 0, 0)');
      _shopShapeGraphics.beginFill('rgb(255, 255, 255)');
      _shopShapeGraphics.drawRoundRect(20, 95, 100, 30, 8);
      var _shopShape = new Shape(_shopShapeGraphics);    
  
      var _shopButtonText = new Text('Shop', "12px Arial", "#000");
      _shopButtonText.textBaseline = "middle";
      _shopButtonText.textAlign = "center"
      _shopButtonText.x = 70;
      _shopButtonText.y = 110;
  
      // Resources    
      var _resourcesShapeGraphics = new Graphics();
      _resourcesShapeGraphics.setStrokeStyle(1);
      _resourcesShapeGraphics.beginStroke('rgb(0, 0, 0)');
      _resourcesShapeGraphics.beginFill('rgb(255, 255, 255)');
      _resourcesShapeGraphics.drawRoundRect(0, 20, 300, 80, 5);
      var _resourcesShape = new Shape(_resourcesShapeGraphics);    
  
      var _resource1Text = new Text('123', "12px Arial", "#000");
      _resource1Text.textBaseline = "middle";
      _resource1Text.textAlign = "right"
      _resource1Text.x = 60;
      _resource1Text.y = 40;
  
      var _resource2Text = new Text('123', "12px Arial", "#000");
      _resource2Text.textBaseline = "middle";
      _resource2Text.textAlign = "right"
      _resource2Text.x = 140;
      _resource2Text.y = 40;
  
      var _resource3Text = new Text('8756', "12px Arial", "#000");
      _resource3Text.textBaseline = "middle";
      _resource3Text.textAlign = "right"
      _resource3Text.x = 220;
      _resource3Text.y = 40;
  
      var _resource4Text = new Text('123', "12px Arial", "#000");
      _resource4Text.textBaseline = "middle";
      _resource4Text.textAlign = "right"
      _resource4Text.x = 60;
      _resource4Text.y = 80;
  
      var _resource5Text = new Text('234', "12px Arial", "#000");
      _resource5Text.textBaseline = "middle";
      _resource5Text.textAlign = "right"
      _resource5Text.x = 140;
      _resource5Text.y = 80;
  
      var _resource6Text = new Text('2435', "12px Arial", "#000");
      _resource6Text.textBaseline = "middle";
      _resource6Text.textAlign = "right"
      _resource6Text.x = 220;
      _resource6Text.y = 80;

      _container.addChildAt(_messagesButtonText);
      _container.addChildAt(_messagesButton);
      _container.addChildAt(_moreButtonText);
      _container.addChildAt(_moreButton);
      _container.addChildAt(_locationsButtonText);
      _container.addChildAt(_locationsButton);
      _container.addChildAt(_armiesButtonText);
      _container.addChildAt(_armiesButton);
      _container.addChildAt(_heroButtonText);
      _container.addChildAt(_heroButton);
      _container.addChildAt(_flagButtonText);
      _container.addChildAt(_flagShape);
      _container.addChildAt(_fortressButtonText);
      _container.addChildAt(_fortressButton); 
      _container.addChildAt(_resource1Text);
      _container.addChildAt(_resource2Text);
      _container.addChildAt(_resource3Text);
      _container.addChildAt(_resource4Text);
      _container.addChildAt(_resource5Text);
      _container.addChildAt(_resource6Text);
      _container.addChildAt(_resourcesShape);
      _container.addChildAt(_shopButtonText);      
      _container.addChildAt(_shopShape);
      
      // container.x = _controller.windowSize().width - 468;
      // container.y = 20;
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
    
    that.displayObject = function() {
      return _container;
    };
    
    /** actions */
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


