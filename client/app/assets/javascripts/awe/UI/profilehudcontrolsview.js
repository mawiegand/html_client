/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createProfileHUDControlsView = function(spec, my) {

    var that;
    
    var _avatarView;
    var _presentAvatarString = null;
    var _nameLabelButton;
    var _rankingButtonView;
    var _rankingImageView;
    var _levelButton;
    var _allianceLabelView;
    
    var _currentCharacterRank = 0;
    var _currentCharacterProgress = 0;
    
    my = my || {};
    
    my.typeName = "ProfileHUDControlsView";
    
    my.controller = null;
    my.container = null;
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
      updateIfNeeded: AWE.Ext.superior(that, "updateIfNeeded"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      this.recalcView();

      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width  = my.frame.size.width;
      my.container.height = my.frame.size.height;      
    }
    
    that.recalcView = function() {
    
      var character = AWE.GS.game.get('currentCharacter');
      var alliance = character.getAlliance();
      var root = my.controller.rootElement();

      if (!_avatarView || AWE.GS.game.getPath('currentCharacter.avatar_string') != _presentAvatarString) {

        if (_avatarView) {
          this.removeChild(_avatarView);
        }

        //add div for click 
        var profileDiv = document.createElement('DIV');
        profileDiv.style.position = 'fixed';
        profileDiv.style.top   = 10+'px';
        profileDiv.style.left  = 10+'px';
        profileDiv.style.width = 235+'px';
        profileDiv.style.height = 120+'px';
        profileDiv.style.zoom = AWE.Settings.hudScale;
        profileDiv.style.cursor = 'pointer';
        profileDiv.style.zIndex = '50';
        profileDiv.onclick = function() { 
          WACKADOO.characterButtonClicked();;
        };
        profileDiv.onmousedown = function() { 
          if(_levelButton){
            _levelButton.mouseDownFromDOM();
          }
        };
        document.body.onmouseup = function() {
          if(_levelButton){
            _levelButton.mouseUpFromDOM();
          }
        };
        root.append(profileDiv);
        
        if (!_levelButton) {
          _levelButton = AWE.UI.createProfileLevelView();
          _levelButton.initWithControllerAndFrame(my.controller, AWE.Geometry.createRect(15, 10, 110, 110));
          _levelButton.onClick = function() {
            //my.controller.avatarLevelClicked();
          };
          this.addChild(_levelButton);                
        }

        _avatarView = AWE.UI.createAvatarView();
        _avatarView.initWithControllerAndAvatar(my.controller, AWE.GS.game.getPath('currentCharacter.avatar')); // TODO: get and pass avatar
        _avatarView.setFrame(AWE.Geometry.createRect(15, 10, 110, 110));
        _avatarView.onClick = function() { 
          //my.controller.avatarImageClicked();
        };
        this.addChild(_avatarView);

        _presentAvatarString = AWE.GS.game.getPath('currentCharacter.avatar_string');
        _avatarView.setNeedsUpdate();
        _avatarView.setNeedsDisplay();
        _avatarView.setNeedsLayout();
      }      
      
      if (!_allianceLabelView) {
        _allianceLabelView = AWE.UI.createLabelView();        
        _allianceLabelView.initWithControllerAndLabel(my.controller, '');
        _allianceLabelView.setFrame(AWE.Geometry.createRect(128, 18, 176, 48));
        _allianceLabelView.setFont("20px hvd_comic_serif_proregular");
        _allianceLabelView.setColor('rgba(67, 102, 124, 1)');
        _allianceLabelView.setTextAlign('left');
        _allianceLabelView.setShadow(new Shadow("#000000", 1, 1, 0));
        this.addChild(_allianceLabelView);
      }
      
      if (alliance !== null && alliance.name !== null) {
        if (_allianceLabelView.text() != alliance.name) {
          _allianceLabelView.setText(alliance.name);
        }
      }
      
      if (!_nameLabelButton) {
        _nameLabelButton = AWE.UI.createLabelView();
        _nameLabelButton.initWithControllerAndLabel(my.controller, '');
        _nameLabelButton.setFrame(AWE.Geometry.createRect(130, 42, 176, 48));
        _nameLabelButton.setFont("18px hvd_comic_serif_proregular");
        _nameLabelButton.setTextAlign('left');
        _nameLabelButton.setShadow(new Shadow("#000000", 1, 1, 0));
        this.addChild(_nameLabelButton);
      }
      
      if (!_rankingButtonView) {
        _rankingButtonView = AWE.UI.createButtonView();
        _rankingButtonView.initWithControllerTextAndImage(my.controller, '0', AWE.UI.ImageCache.getImage("hud/profile/namelabel/background"));
        _rankingButtonView.setFrame(AWE.Geometry.createRect(98, 80, 120, 32));
        _rankingButtonView.setFont("20px hvd_comic_serif_proregular");
        this.addChildAt(_rankingButtonView, 0);
      }  
      
      if (character !== null) {
        _rankingButtonView.setText('' + character.score)
      }
      
      if (!_rankingImageView) {
        _rankingImageView = AWE.UI.createImageView();
        _rankingImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/icon/trophy"));
        _rankingImageView.setFrame(AWE.Geometry.createRect(200, 80, 32, 32));
        this.addChild(_rankingImageView);        
      }
      
      var name = character.get('name');
      if (_nameLabelButton.text() != name) {
        _nameLabelButton.setText(name);
      }       
      
      var rankAndProgress = this.calculateCharacterProgress();
      _currentCharacterRank = rankAndProgress.rank + 1;
      _currentCharacterProgress = rankAndProgress.progress;
      _levelButton.setRankAndProgress(_currentCharacterRank, _currentCharacterProgress);
      
    };      
    
    that.calculateCharacterProgress = function() {
      var ranks   = AWE.GS.RulesManager.getRules().character_ranks.mundane;
      var character = AWE.GS.game.get('currentCharacter');
      var presentRank = character.get('mundane_rank');
      
      if (presentRank !== undefined && presentRank !== null) {
              
        var infos = [];
        for (var i=Math.max(presentRank,1); i < ranks.length; i++) { // don't display first rank (Zero Experience)
          infos.push({
            rule:        ranks[i],
            position:    ranks[i].exp,
            presentRank: i === presentRank,
          });
          if (i !== presentRank && ranks[i].settlement_points > 0) {
            break ;
          }
        }
      
        var maxExp = infos[infos.length-1].position;
        var minExp = infos[0].position;

        if(minExp > character.get('exp'))//prevent wrong progress on lvl 1
          minExp = 0;        
      
        var ownPosition = (((character.get('exp') - minExp)*100)/(maxExp - minExp));

        if(ownPosition < 0)//prevent negative progress
          ownPosition = 0;
          
        return { rank: presentRank, progress: ownPosition };
      }
      
      return { rank: 0, progress: 0 };
    };
    
    that.updateView = function() {
      this.recalcView();            
      
      _super.updateView();      
    }
    
    /** checks for itself whether the view needs an update */
    that.updateIfNeeded = function() {
      var changed = false;
      
      if (AWE.GS.game.getPath('currentCharacter.avatar_string') != _presentAvatarString) {
        changed = true;
      }
      
      if (!changed) {
        var rankAndProgress = this.calculateCharacterProgress();
        if (rankAndProgress.rank !== _currentCharacterRank || rankAndProgress.progress !== _currentCharacterProgress) {
          _currentCharacterRank = rankAndProgress.rank;
          _currentCharacterProgress = rankAndProgress.progress;
          changed = true;
        }            
      }
      
      if (changed) { 
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    } 
    
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


