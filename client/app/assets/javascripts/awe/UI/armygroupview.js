/* Author: Marcel Wiegand <marcel@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
  
  module.createGamingPieceView = function(spec, my) {
    
    var that;
    
    my = my || {};
    my.typeName = my.typeName || 'GamingPieceView';

    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
    };
      
    that.initWithController = function(controller, army, frame) {
      _super.initWithController(controller, frame);
    };

    return that;
  };
  

  module.createArmyGroupView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = my.typename || 'ArmyGroupView';
    
    var _armyGroup = null;
    
    var _annotationView = null;

    var _battleView = null;
    var _protectionView = null;
    var _animation  = null;
    var _stance = null;
    var _stanceView = null;
    var _baseImage = null;
    var _flagView = null;
    var _selectShape = null;    
    var _healthShape = null;    
    var _healthBGShape = null;   
    var _actionPointsLabelView = null;
    var _flagLength = null;
    
    var _frameRectShape = null;
    
    var multiplyArray = function(array, factor) {
      var result = array;
      for (var i=1; i < factor; i++) {
        result = result.concat(array);
      }
      return result;
    }
    
    that = module.createGamingPieceView(spec, my);

    var _super = {
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:       AWE.Ext.superior(that, "setFrame"),
      setSelected:    AWE.Ext.superior(that, "setSelected"),
      updateView:     AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, armyGroup, frame) {
      that.initWithController(controller, frame);
      _armyGroup = armyGroup;
      // _stance = null; // will be set in recalc
      

      
      var baseImage = /*army.isOwn() ? AWE.UI.ImageCache.getImage('map/army/base/own') : */AWE.UI.ImageCache.getImage('map/army/base/group')
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
    
    that.createWarriorSpriteSheet = function(number) {
      var image = "map/army/animation";
      var standFrame = 11;
      number = number || Math.floor(Math.random()*1000);
      
      switch (_armyGroup[0].get('stance') || 0) {
        case 0:  standFrame = 11; break;
        case 1:  standFrame =  8; break;
        case 2:  standFrame = 11; break;
        default: standFrame = 11; 
      }    
      
      return {
        images: [AWE.UI.ImageCache.getImage(image).src],
        frames: {width:128, height:128},
        animations: { 
          toWalk: {
            frames: multiplyArray([standFrame], number % 7).concat([ 14, 16]),
            next:   'walk',
            frequency: 2,
          },
          walk:   {
            frames:    [ 17,18,19,20,21,22,23,24],
            next:      'walk',
            frequency: 1, 
          },
          fight:  {
            frames: [15].concat(
              multiplyArray([0,1,2,3,4],              (number % 3)+2), 
              multiplyArray([6,6,6, 5,5, 7,7,7, 5,5], (number % 2)+1), 
              multiplyArray([0,1,2,3,4],              (number % 3)+1), 
              multiplyArray([6,6,6, 5,5, 7,7,7, 5,5], (number % 5)+4) 
            ),
            next:   'fight',
          }, 
          
          toStand: {
            frames:    [16, 14],
            next:      'stand',
            frequency: 2,
          },
          stand: {
            frames: [ standFrame ].concat(
              multiplyArray([standFrame], (number % 67)+23),
              multiplyArray([standFrame+1], (number % 2)+4), 
              multiplyArray([standFrame], (number % 23)+13),
              multiplyArray([standFrame+2, standFrame+2], (number % 2)+1) 
            ),
            next: 'stand',
            frequency: 1,
          },
        },
      };
    }
    
    that.createAmazonSpriteSheet = function(number) {
      var image = "map/army/animation/amazon";
      var standFrame = 11;
      number = number || Math.floor(Math.random()*1000);
      
      switch (_armyGroup[0].get('stance') || 0) {
        case 0:  standFrame =  9; break;
        case 1:  standFrame =  7; break;
        case 2:  standFrame =  9; break;
        default: standFrame =  9; 
      }    
      
      return {
        images: [AWE.UI.ImageCache.getImage(image).src],
        frames: {width:128, height:128},
        animations: { 
          toWalk: {
            frames: multiplyArray([standFrame], number % 7).concat([ standFrame ]),  // need to do different animations for neutral and defensive stance!
            next:   'walk',
            frequency: 2,
          },
          walk:   {
            frames:    [ 12,13,14,15,16,17,18,19 ],
            next:      'walk',
            frequency: 1, 
          },
          fight:  {
            frames: [].concat(
              multiplyArray([0,1,2,3,4],              (number % 3)+2), 
              multiplyArray([5, 5, 5, 5, 5,5,5, 6,6], (number % 2)+1), 
              multiplyArray([0,1,2,3,4],              (number % 3)+1), 
              multiplyArray([5,5,5, 5,5, 5,5,5, 5,5], (number % 5)+4) 

/*            multiplyArray([0,1,2,3,4],              (number % 3)+2), 
              multiplyArray([6,6,6, 5,5, 7,7,7, 5,5], (number % 2)+1), 
              multiplyArray([0,1,2,3,4],              (number % 3)+1), 
              multiplyArray([6,6,6, 5,5, 7,7,7, 5,5], (number % 5)+4) */
            ),
            next:   'fight',
          }, 
          
          toStand: {
            frames:    [11, standFrame],    // need to do different animations for neutral and defensive stance!
            next:      'stand',
            frequency: 1,
          },
          stand: {
            frames: [ standFrame ].concat(
              multiplyArray([standFrame], (number % 67)+23),
              multiplyArray([standFrame+1, standFrame+1, standFrame], (number % 2)+1), 
              multiplyArray([standFrame], (number % 23)+13),
              multiplyArray([standFrame+1 ], (number % 2)+1) 
            ),
            next: 'stand',
            frequency: 1,
          },
        },
      };      
    }
    
    that.createChefSpriteSheet = function(number) {
      var image = "map/army/animation/chef";
      var standFrame = 13;
      var laughing = true;
      number = number || Math.floor(Math.random()*1000);
      
      switch (_armyGroup[0].get('stance') || 0) {
        case 0:  standFrame = 13; break;
        case 1:  standFrame = 11; laughing = false; break;
        case 2:  standFrame = 13; break;
        default: standFrame = 13; 
      }    
      
      return {
        images: [AWE.UI.ImageCache.getImage(image).src],
        frames: {width:128, height:128},
        animations: { 
          toWalk: {
            frames: multiplyArray([standFrame], number % 4).concat([ standFrame ]),  // no transition, but random delay to prevent units from walking in sync
            next:   'walk',
            frequency: 1,
          },
          walk:   {
            frames:    [ 19,20,21,22, 23,24,25,26],
            next:      'walk',
            frequency: 1, 
          },
          fight:  {
            frames: [].concat(     
              multiplyArray([7], (number % 29)+23),
              [8, 8],   // blink x1
              multiplyArray([7], (number % 17)+27),
              multiplyArray([8,8,7,7,7], (number % 3)),  // blink 0 to 2 times
              multiplyArray([7], (number % 23)+17),
              multiplyArray([0,1,2,3,4,5,6],          (number % 3)+2),    // jump 2 to 4 times
              multiplyArray([7,7,7,7],                (number % 8)+1),    // pause for a while
              multiplyArray([0,1,2,3,4,5,6],          (number % 4))       // jump 0 to 3 times
            ),
            next:   'fight',
          },
          toStand: {
            frames:    [ standFrame ],    // actually has no transition
            next:      'stand',
            frequency: 2,
          },
          stand: {
            frames: [ standFrame ].concat(
              multiplyArray([standFrame], (number % 67)+23),
              [standFrame+1, standFrame+1],   // blink x1
              multiplyArray([standFrame], (number % 23)+13),
              [standFrame+1, standFrame+1, standFrame, standFrame, standFrame, standFrame+1, standFrame+1], // blink x2
              multiplyArray([standFrame], (number % 77)+17),
              (laughing ? 
               multiplyArray([standFrame+4, standFrame+5], (number % 3)+3) : [])   // laughing
            ),
            next: 'stand',
            frequency: 1,
          },
        },
      };      
    }
    
    that.prepareSpriteSheet = function() {
      if (!_armyGroup) {
        log('WARNING: army group view without an associated army group object.');
        return null;
      }
      
      if (_armyGroup[0].get("npc") && AWE.Config.DISABLE_NPC_IMAGES) {
        if (_armyGroup[0].get('id') % 3 == 0) {
          return this.createAmazonSpriteSheet(_armyGroup[0].get('id'));
        }
        else if (_armyGroup[0].get('id') % 3 == 1) {
          return this.createChefSpriteSheet(_armyGroup[0].get('id'));
        }
        return this.createWarriorSpriteSheet(_armyGroup[0].get('id'));
      }
      else if (AWE.Config.DISABLE_NPC_IMAGES) {
        if (_armyGroup[0].get('id') % 3 == 0) {
          return this.createAmazonSpriteSheet(_armyGroup[0].get('id'));
        }
        else if (_armyGroup[0].get('id') % 3 == 1) {
          return this.createChefSpriteSheet(_armyGroup[0].get('id'));
        }
        return this.createWarriorSpriteSheet(_armyGroup[0].get('id'));
      }
      else {
        var armyCategory = _armyGroup[0].get('armyCategory');
        
        if (armyCategory && armyCategory === 'artillery') {
          return this.createAmazonSpriteSheet(_armyGroup[0].get('id'));
        }
        else if (armyCategory && armyCategory === 'cavalry') {
          return this.createChefSpriteSheet(_armyGroup[0].get('id'));
        }
        return this.createWarriorSpriteSheet(_armyGroup[0].get('id'));
      }
    }
        
    that.recalcView = function() {
      
      // BUG: since the stance-view is not recreated and there is no "addChildBelow" used, after one update
      //      of the army the pole will be in front of the figure, although it should be behind.
      
      var flagLength    = 8.0 + Math.round(Math.min(_armyGroup[0].get('size_present') / _armyGroup[0].get('size_max'), 1) * 48);
      
      if (!AWE.Config.MAP_ALLIANCE_FLAG_DISABLED && !_flagView) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.setCache(AWE.Config.MAP_CACHE_ALLIANCE_FLAG);
        _flagView.initWithController(my.controller);
        _flagView.setAllianceColor(_armyGroup[0].get('alliance_color'));
        _flagView.setAllianceId(_armyGroup[0].get('alliance_id'));
        _flagView.setDirection('left');
        _flagView.setFrame(AWE.Geometry.createRect(67 - flagLength, -12, flagLength, 20));
        _flagLength = flagLength;
        that.addChildAt(_flagView, 0);  
      }
      if (_flagView && _flagView.frame().size.width !== flagLength) {
        _flagView.setFrame(AWE.Geometry.createRect(67 - flagLength, -12, flagLength, 20));
        _flagLength = flagLength;        
      }


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
               
      if (_healthShape) {
        that.removeChild(_healthShape);
        _healthShape = null;
      }
      
      if (that.selected() || that.hovered() || (_armyGroup && _armyGroup[0].isOwn())) {
        
        if (!_healthBGShape) {
          var healthBGGraphics = new Graphics();
          healthBGGraphics.setStrokeStyle(1);
          healthBGGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
          healthBGGraphics.beginFill('rgb(127, 127, 127)');
          healthBGGraphics.drawRoundRect(0, 0, 64, 12, 4);
          _healthBGShape = AWE.UI.createShapeView();
          _healthBGShape.initWithControllerAndGraphics(my.controller, healthBGGraphics);
          _healthBGShape.setFrame(AWE.Geometry.createRect(16, 108, 64, 12));
          this.addChild(_healthBGShape);    
        }
        
        if (!_actionPointsLabelView) {
          _actionPointsLabelView = AWE.UI.createLabelView();
          _actionPointsLabelView.initWithControllerAndLabel(my.controller);
          _actionPointsLabelView.setColor('#000');
          _actionPointsLabelView.setFrame(AWE.Geometry.createRect(16, 102, 64, 24));      
          that.addChild(_actionPointsLabelView);      
        }
        
        if (_armyGroup[0].get('ap_present') / _armyGroup[0].get('ap_max') > 0.1) {
          if(_armyGroup[0].get('ap_present') / _armyGroup[0].get('ap_max') > .75) {
            var fillColor = '#6d6';
          }
          else if(_armyGroup[0].get('ap_present') / _armyGroup[0].get('ap_max') > .5) {
            var fillColor = '#dd6';
          }
          else {
            var fillColor = '#d66';
          }
        
          var healthGraphics = new Graphics();
          healthGraphics.setStrokeStyle(1);
          healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
          healthGraphics.beginFill(fillColor);
          healthGraphics.drawRoundRect(0, 0, 64 * (_armyGroup[0].get('ap_present') / _armyGroup[0].get('ap_max')), 12, 4);
          _healthShape = AWE.UI.createShapeView();
          _healthShape.initWithControllerAndGraphics(my.controller, healthGraphics);
          _healthShape.setFrame(AWE.Geometry.createRect(16, 108, 64 * (_armyGroup[0].get('ap_present') / _armyGroup[0].get('ap_max')), 12));
          that.addChild(_healthShape);      
          if (_actionPointsLabelView) { // move label to top
            that.removeChild(_actionPointsLabelView);
            that.addChild(_actionPointsLabelView);
          }
        }
      } 
      if (_healthShape) {
        _healthShape.setVisible(that.selected() || that.hovered() || (_armyGroup && _armyGroup[0].isOwn()));
      }
      if (_healthBGShape) {
        _healthBGShape.setVisible(that.selected() || that.hovered() || (_armyGroup && _armyGroup[0].isOwn()));
      }
      if (_actionPointsLabelView) {
        _actionPointsLabelView.setVisible(that.selected() || that.hovered() || (_armyGroup && _armyGroup[0].isOwn()));
        _actionPointsLabelView.setText(_armyGroup[0].get('ap_present') + " / " + _armyGroup[0].get('ap_max'));
      }
      
      
      
      if (this.selected() || this.hovered()) {
        if (!_selectShape) {
          var _selectGraphics = new Graphics();
          _selectGraphics.setStrokeStyle(1);
          _selectGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
          _selectGraphics.beginFill(Graphics.getRGB(0, 255, 0));
          _selectGraphics.drawEllipse(12, 0, 72, 36);
          _selectShape = AWE.UI.createShapeView();
          _selectShape.initWithControllerAndGraphics(my.controller, _selectGraphics);
          _selectShape.setFrame(AWE.Geometry.createRect(0, 74, 72, 36));
          this.addChildAt(_selectShape, 0);      
        }
        _selectShape.setVisible(this.selected() || this.hovered());
        _selectShape.setAlpha(this.selected() ? 1. : 0.2);
      }
      else if (_selectShape) {
        that.removeChild(_selectShape);
        _selectShape = null;
      }
      
      
      if (_armyGroup[0].get('isFighting') && !_battleView) {
        _battleView = AWE.UI.createImageView();
        _battleView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/battle'));
        _battleView.setFrame(AWE.Geometry.createRect(16, -50, 65, 65));
        _battleView.onClick = that.onClick;
        _battleView.onDoubleClick = that.onDoubleClick;
        _battleView.onMouseOver = that.onMouseOver;
        _battleView.onMouseOut = that.onMouseOut;
        this.addChildAt(_battleView,0);
      }
      else if (!_armyGroup[0].get('isFighting') && _battleView) {
        this.removeChild(_battleView);
        _battleView = null;
      }
      
      if (_armyGroup[0].get('isProtected') && !_protectionView) {
        _protectionView = AWE.UI.createImageView();
        _protectionView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage('map/army/protected'));
        _protectionView.setFrame(AWE.Geometry.createRect(32, -64, 32, 32));
        _protectionView.onClick = that.onClick;
        _protectionView.onDoubleClick = that.onDoubleClick;
        _protectionView.onMouseOver = that.onMouseOver;
        _protectionView.onMouseOut = that.onMouseOut;
        this.addChildAt(_protectionView,0);
      }
      else if (!_armyGroup[0].get('isProtected') && _protectionView) {
        this.removeChild(_protectionView);
        _protectionView = null;
      }

      if (!(_armyGroup[0].get("npc") && !AWE.Config.DISABLE_NPC_IMAGES) && (_stance === null || _armyGroup[0].get("stance") !== _stance || !_animation)) {
        var data = null; 
        var spriteSheet = null;
        var newAnimation = AWE.UI.createAnimatedSpriteView();
        
        _stance = _armyGroup[0].get('stance');
        
        data = this.prepareSpriteSheet();
        spriteSheet = new SpriteSheet(data);
        newAnimation.initWithControllerAndSpriteSheet(that, spriteSheet);
        
        if (_armyGroup[0].get('mode') == 1) { // 1: walking
          newAnimation.animation().gotoAndPlay('toWalk');      
        }
        else if (_armyGroup[0].get('mode') == 2) {
          newAnimation.animation().gotoAndPlay('fight');
        }
        else {
          newAnimation.animation().gotoAndPlay('stand');
        }
        newAnimation.snapToPixel = true;
        newAnimation.setFrame(AWE.Geometry.createRect(-23, -35, 128, 128));
        newAnimation.onClick = that.onClick;
        newAnimation.onDoubleClick = that.onDoubleClick;
        newAnimation.onMouseOver = that.onMouseOver;
        newAnimation.onMouseOut  = that.onMouseOut;
        if (_animation) {
          this.removeChild(_animation);
        }           
        this.addChild(newAnimation);           
        _animation = newAnimation;
      }

      if (_armyGroup[0].get("npc") && !AWE.Config.DISABLE_NPC_IMAGES) {
        var stanceImage;
        var size = _armyGroup[0].get('size_present') || 0;
        if (size >= 800) {
          stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/large');
        }
        else if (size >= 100) {
          stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/medium');
        }
        else {
          stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/small');
        }
        
        if (!_stanceView) {
          _stanceView = AWE.UI.createImageView();        
          _stanceView.initWithControllerAndImage(my.controller, stanceImage);

          _stanceView.setFrame(AWE.Geometry.createRect(-6, -7, 96, 96));
          _stanceView.onClick = that.onClick;
          _stanceView.onDoubleClick = that.onDoubleClick;
          _stanceView.onMouseOver = that.onMouseOver;
          _stanceView.onMouseOut = that.onMouseOut;
          this.addChild(_stanceView);        
        }
        _stanceView.setImage(stanceImage);
      }
      else {
        log('CHECK ANIMATION')
        if      (_armyGroup[0].get("mode") === 0 && _animation.animation().currentAnimation !== 'stand' && _animation.animation().currentAnimation !== 'toStand') {        // 0: standing!, 1: walking, 2: fighting
          _animation.animation().gotoAndPlay('toStand');
        }
        else if (_armyGroup[0].get("mode") === 1 && _animation.animation().currentAnimation !== 'walk' && _animation.animation().currentAnimation !== 'toWalk') {       // 0: standing!, 1: walking, 2: fighting
          _animation.animation().gotoAndPlay('toWalk');
        }
        else if (_armyGroup[0].get("mode") === 2 && _animation.animation().currentAnimation !== 'fight') {     // 0: standing!, 1: walking, 2: fighting
          _animation.animation().gotoAndPlay('fight');
        }
      }               
    }
    
    that.setAnnotationView = function(annotationView) {
      _annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return _annotationView;
    }
    
    that.army = function() {
      return _armyGroup[0];
    };
    
    that.armyGroup = function() {
      return _armyGroup;
    };
    
    /** actions */
   
    that.onClick = function(evt) {
      my.controller.viewClicked(that);
    };
    
    that.onDoubleClick = function(evt) {
      my.controller.armyGroupInfoButtonClicked(_armyGroup);
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



